import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { dbQuery } from "./db.server";
import { checkIsAdmin } from "./fee-service.server";

export interface StudentKitItem {
  id: string;
  title: string;
  description: string | null;
  pdf_url: string;
  cover_image_url: string | null;
  price: number;
  is_free_for_premium: boolean;
  is_active: boolean;
  domain: string | null;
  edition: string | null;
  downloads_count: number;
  created_at?: string;
  updated_at?: string;
  is_unlocked?: boolean;
  unlock_reason?: "premium" | "purchased" | "locked";
  can_download?: boolean;
}

export interface StudentKitPurchaseItem {
  id: string;
  kit_id: string;
  kit_title?: string;
  application_id: string | null;
  user_id: string | null;
  student_name: string | null;
  student_email: string | null;
  plan_type: string;
  amount_paid: number;
  payment_id: string | null;
  unlocked_at: string;
}

export interface StudentKitsSummary {
  kits: StudentKitItem[];
  isPremiumUser: boolean;
  activePlan: string;
}

export interface AdminStudentKitsData {
  kits: StudentKitItem[];
  purchases: StudentKitPurchaseItem[];
  stats: {
    totalKits: number;
    activeKits: number;
    totalDownloads: number;
    totalPurchases: number;
    totalRevenue: number;
  };
}

/**
 * Fetch available student kits for student view with access check
 */
export async function getStudentKitsDataServer(
  applicationId?: string,
  userId?: string
): Promise<StudentKitsSummary> {
  let isPremiumUser = false;
  let activePlan = "standard";

  // Check application plan if provided
  if (applicationId) {
    const appRes = await dbQuery(
      `SELECT plan_type, plan_payment_status, domain, full_name, email FROM public.applications WHERE id = $1`,
      [applicationId]
    );
    if (appRes.rows.length > 0) {
      const app = appRes.rows[0];
      activePlan = String(app.plan_type || "standard").toLowerCase();
      isPremiumUser = activePlan === "premium";
    }
  }

  // Also check if userId has any premium application
  if (!isPremiumUser && userId) {
    const userAppsRes = await dbQuery(
      `SELECT plan_type FROM public.applications WHERE user_id = $1 AND plan_type = 'premium' LIMIT 1`,
      [userId]
    );
    if (userAppsRes.rows.length > 0) {
      isPremiumUser = true;
      activePlan = "premium";
    }
  }

  // Fetch all active kits
  const kitsRes = await dbQuery(
    `SELECT * FROM public.student_kits WHERE is_active = 1 ORDER BY created_at DESC`
  );

  // Fetch user's unlocked purchases
  let userPurchases: Set<string> = new Set();
  if (applicationId || userId) {
    const pRes = await dbQuery(
      `SELECT kit_id FROM public.student_kit_purchases WHERE application_id = $1 OR user_id = $2`,
      [applicationId || "", userId || ""]
    );
    for (const r of pRes.rows) {
      if (r.kit_id) userPurchases.add(r.kit_id);
    }
  }

  const kits: StudentKitItem[] = kitsRes.rows.map((k: any) => {
    const isFreeForThisUser = isPremiumUser && Boolean(k.is_free_for_premium);
    const isPurchased = userPurchases.has(k.id);
    const isUnlocked = isFreeForThisUser || isPurchased;

    return {
      id: String(k.id),
      title: String(k.title),
      description: k.description ? String(k.description) : null,
      pdf_url: String(k.pdf_url),
      cover_image_url: k.cover_image_url ? String(k.cover_image_url) : "/student-kit-cover.jpg",
      price: Number(k.price ?? 20),
      is_free_for_premium: Boolean(k.is_free_for_premium),
      is_active: Boolean(k.is_active),
      domain: k.domain ? String(k.domain) : "all",
      edition: k.edition ? String(k.edition) : "Edition 1.0",
      downloads_count: Number(k.downloads_count ?? 0),
      is_unlocked: isUnlocked,
      unlock_reason: isFreeForThisUser ? "premium" : isPurchased ? "purchased" : "locked",
      can_download: isUnlocked,
    };
  });

  return {
    kits,
    isPremiumUser,
    activePlan,
  };
}

/**
 * Unlock a student kit (Free for Premium, or after ₹20 payment for Standard)
 */
export async function unlockStudentKitServer(data: {
  kitId: string;
  applicationId?: string;
  userId?: string;
  paymentId?: string;
  amount?: number;
  paymentMethod?: string;
}): Promise<{ success: boolean; downloadUrl: string; message: string }> {
  const { kitId, applicationId, userId, paymentId, amount } = data;

  // 1. Fetch the kit
  const kitRes = await dbQuery(`SELECT * FROM public.student_kits WHERE id = $1`, [kitId]);
  if (kitRes.rows.length === 0) {
    throw new Error("Student kit not found.");
  }
  const kit = kitRes.rows[0];

  // 2. Fetch application / student details
  let studentName = "Student Intern";
  let studentEmail = "";
  let planType = "standard";

  if (applicationId) {
    const appRes = await dbQuery(
      `SELECT full_name, email, plan_type FROM public.applications WHERE id = $1`,
      [applicationId]
    );
    if (appRes.rows.length > 0) {
      studentName = appRes.rows[0].full_name || studentName;
      studentEmail = appRes.rows[0].email || studentEmail;
      planType = appRes.rows[0].plan_type || planType;
    }
  }

  const isPremium = planType === "premium";
  const amountToRecord = isPremium ? 0.0 : Number(amount ?? kit.price ?? 20);

  // 3. Record purchase in student_kit_purchases
  const purchaseId = `sk-p-${crypto.randomUUID()}`;
  await dbQuery(
    `INSERT INTO public.student_kit_purchases 
     (id, kit_id, application_id, user_id, student_email, student_name, plan_type, amount_paid, payment_id, unlocked_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
    [
      purchaseId,
      kitId,
      applicationId || null,
      userId || null,
      studentEmail,
      studentName,
      planType,
      amountToRecord,
      paymentId || (isPremium ? "FREE_PREMIUM_PLAN" : `PAY_${Date.now()}`),
    ]
  );

  // 4. Increment download count
  await dbQuery(
    `UPDATE public.student_kits SET downloads_count = downloads_count + 1 WHERE id = $1`,
    [kitId]
  );

  return {
    success: true,
    downloadUrl: kit.pdf_url,
    message: isPremium
      ? "Student Kit unlocked for free with your Premium Plan!"
      : "Student Kit successfully unlocked!",
  };
}

/**
 * Fetch all student kits and unlock history for Admin
 */
export async function getAdminStudentKitsServer(): Promise<AdminStudentKitsData> {
  const [kitsRes, purchasesRes] = await Promise.all([
    dbQuery(`SELECT * FROM public.student_kits ORDER BY created_at DESC`),
    dbQuery(`
      SELECT p.*, k.title AS kit_title
      FROM public.student_kit_purchases p
      LEFT JOIN public.student_kits k ON p.kit_id = k.id
      ORDER BY p.unlocked_at DESC
      LIMIT 100
    `),
  ]);

  const kits: StudentKitItem[] = kitsRes.rows.map((k: any) => ({
    id: String(k.id),
    title: String(k.title),
    description: k.description ? String(k.description) : null,
    pdf_url: String(k.pdf_url),
    cover_image_url: k.cover_image_url ? String(k.cover_image_url) : "/student-kit-cover.jpg",
    price: Number(k.price ?? 20),
    is_free_for_premium: Boolean(k.is_free_for_premium),
    is_active: Boolean(k.is_active),
    domain: k.domain ? String(k.domain) : "all",
    edition: k.edition ? String(k.edition) : "Edition 1.0",
    downloads_count: Number(k.downloads_count ?? 0),
    created_at: k.created_at ? String(k.created_at) : undefined,
    updated_at: k.updated_at ? String(k.updated_at) : undefined,
  }));

  const purchases: StudentKitPurchaseItem[] = purchasesRes.rows.map((p: any) => ({
    id: String(p.id),
    kit_id: String(p.kit_id),
    kit_title: p.kit_title ? String(p.kit_title) : "Web Development Student Kit",
    application_id: p.application_id ? String(p.application_id) : null,
    user_id: p.user_id ? String(p.user_id) : null,
    student_name: p.student_name ? String(p.student_name) : null,
    student_email: p.student_email ? String(p.student_email) : null,
    plan_type: String(p.plan_type || "standard"),
    amount_paid: Number(p.amount_paid ?? 0),
    payment_id: p.payment_id ? String(p.payment_id) : null,
    unlocked_at: p.unlocked_at ? String(p.unlocked_at) : String(p.created_at),
  }));

  const totalDownloads = kits.reduce((acc, k) => acc + k.downloads_count, 0);
  const totalRevenue = purchases.reduce((acc, p) => acc + p.amount_paid, 0);

  return {
    kits,
    purchases,
    stats: {
      totalKits: kits.length,
      activeKits: kits.filter((k) => k.is_active).length,
      totalDownloads,
      totalPurchases: purchases.length,
      totalRevenue,
    },
  };
}

/**
 * Add or Edit a Student Kit (Admin only)
 */
export async function saveAdminStudentKitServer(kitData: {
  id?: string;
  title: string;
  description?: string;
  pdf_url: string;
  cover_image_url?: string;
  price: number;
  is_free_for_premium?: boolean;
  is_active?: boolean;
  domain?: string;
  edition?: string;
}): Promise<StudentKitItem> {
  const title = (kitData.title || "").trim();
  if (!title) throw new Error("Student kit title is required.");

  const pdfUrl = (kitData.pdf_url || "").trim();
  if (!pdfUrl) throw new Error("Student kit PDF URL is required.");

  const price = Number(kitData.price >= 0 ? kitData.price : 20);
  const coverImageUrl = (kitData.cover_image_url || "/student-kit-cover.jpg").trim();
  const description = (kitData.description || "").trim();
  const domain = (kitData.domain || "all").trim();
  const edition = (kitData.edition || "Edition 1.0").trim();
  const isFreeForPremium = kitData.is_free_for_premium !== false ? 1 : 0;
  const isActive = kitData.is_active !== false ? 1 : 0;

  if (kitData.id) {
    // Update existing kit
    await dbQuery(
      `UPDATE public.student_kits
       SET title = $1, description = $2, pdf_url = $3, cover_image_url = $4,
           price = $5, is_free_for_premium = $6, is_active = $7, domain = $8,
           edition = $9, updated_at = NOW()
       WHERE id = $10`,
      [
        title,
        description,
        pdfUrl,
        coverImageUrl,
        price,
        isFreeForPremium,
        isActive,
        domain,
        edition,
        kitData.id,
      ]
    );

    const res = await dbQuery(`SELECT * FROM public.student_kits WHERE id = $1`, [kitData.id]);
    return res.rows[0];
  } else {
    // Insert new kit
    const id = `sk-kit-${crypto.randomUUID().slice(0, 8)}`;
    await dbQuery(
      `INSERT INTO public.student_kits
       (id, title, description, pdf_url, cover_image_url, price, is_free_for_premium, is_active, domain, edition, downloads_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0)`,
      [
        id,
        title,
        description,
        pdfUrl,
        coverImageUrl,
        price,
        isFreeForPremium,
        isActive,
        domain,
        edition,
      ]
    );

    const res = await dbQuery(`SELECT * FROM public.student_kits WHERE id = $1`, [id]);
    return res.rows[0];
  }
}

/**
 * Delete a Student Kit (Admin only)
 */
export async function deleteAdminStudentKitServer(id: string): Promise<boolean> {
  if (!id) throw new Error("Kit ID is required.");
  await dbQuery(`DELETE FROM public.student_kits WHERE id = $1`, [id]);
  return true;
}

/**
 * Upload asset (PDF or Image) for Student Kit to public/uploads/student-kits
 */
export async function uploadStudentKitAssetServer(data: {
  filename: string;
  base64Data: string;
  type: "pdf" | "image";
}): Promise<{ url: string; filename: string }> {
  const { filename, base64Data, type } = data;
  if (!filename || !base64Data) {
    throw new Error("Filename and file data are required.");
  }

  // Clean filename
  const cleanName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const targetDir = path.resolve(process.cwd(), "public", "uploads", "student-kits");
  await fs.mkdir(targetDir, { recursive: true });

  const timestamp = Date.now();
  const finalFilename = `${timestamp}_${cleanName}`;
  const filePath = path.join(targetDir, finalFilename);

  // Strip data URL header if present (e.g. data:application/pdf;base64,...)
  const base64Content = base64Data.replace(/^data:[^;]+;base64,/, "");
  const buffer = Buffer.from(base64Content, "base64");

  await fs.writeFile(filePath, buffer);

  const publicUrl = `/uploads/student-kits/${finalFilename}`;
  return {
    url: publicUrl,
    filename: finalFilename,
  };
}

