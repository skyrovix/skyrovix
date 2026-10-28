import crypto from "crypto";
import { dbQuery, withTransaction } from "@/lib/db.server";
import { generateCertId, getDomain } from "./constants";
import {
  evaluateOfferStatus,
  type PublicFeeSettings,
  type AdminFeeSettingsResponse,
  type CouponValidationResult,
  type PaymentRecordItem,
} from "./fee-service";

export async function checkIsAdmin(userId?: string | null): Promise<boolean> {
  if (!userId) return false;
  try {
    const res = await dbQuery(
      `SELECT (
         EXISTS (SELECT 1 FROM user_roles WHERE user_id = $1 AND role = 'admin')
         OR EXISTS (SELECT 1 FROM users WHERE id = $1 AND LOWER(email) IN ('hariharanmahesh34@gmail.com', 'skyrovix@gmail.com', 'hariharan@skyrovix.com'))
       ) as is_admin`,
      [userId]
    );
    return Boolean(res.rows[0]?.is_admin);
  } catch (err) {
    console.error("[checkIsAdmin error]:", err);
    return false;
  }
}

export async function fetchPublicFeeSettings(): Promise<PublicFeeSettings> {
  try {
    const res = await dbQuery("SELECT * FROM public.fee_settings ORDER BY fee_type");
    const rows = res.rows;

    const appRow = rows.find((r: any) => r.fee_type === "application");
    const certRow = rows.find((r: any) => r.fee_type === "certificate");
    const premiumRow = rows.find((r: any) => r.fee_type === "premium_plan");

    const defaultUpiId = certRow?.upi_id || appRow?.upi_id || "hariharanmahesh34@oksbi";
    const defaultPayeeName = certRow?.payee_name || appRow?.payee_name || "Hariharan Mahesh";

    const offerStatus = evaluateOfferStatus(
      Boolean(certRow?.offer_enabled),
      certRow?.offer_start_at,
      certRow?.offer_end_at
    );

    return {
      applicationFee: {
        isEnabled: Boolean(appRow?.is_enabled),
        enabled: Boolean(appRow?.is_enabled),
        amount: Number(appRow?.amount ?? 0),
        upi_id: appRow?.upi_id || defaultUpiId,
        payee_name: appRow?.payee_name || defaultPayeeName,
        qr_code_url: appRow?.qr_code_url || null,
      },
      certificateFee: {
        isEnabled: Boolean(certRow?.is_enabled),
        enabled: Boolean(certRow?.is_enabled),
        amount: Number(certRow?.amount ?? 100),
        upi_id: certRow?.upi_id || defaultUpiId,
        payee_name: certRow?.payee_name || defaultPayeeName,
        qr_code_url: certRow?.qr_code_url || null,
      },
      premiumPlan: {
        isEnabled: premiumRow ? (Number(premiumRow.is_enabled) === 1 || premiumRow.is_enabled === true) : false,
        enabled: premiumRow ? (Number(premiumRow.is_enabled) === 1 || premiumRow.is_enabled === true) : false,
        amount: Number(premiumRow?.amount ?? 200),
        upi_id: premiumRow?.upi_id || defaultUpiId,
        payee_name: premiumRow?.payee_name || defaultPayeeName,
        qr_code_url: premiumRow?.qr_code_url || null,
      },
      certificateOffer: {
        isEnabled: Boolean(certRow?.offer_enabled),
        amount: Number(certRow?.offer_amount ?? 0),
        name: certRow?.offer_name || "Certificate Free Offer",
        startAt: certRow?.offer_start_at ? new Date(certRow.offer_start_at).toISOString() : null,
        endAt: certRow?.offer_end_at ? new Date(certRow.offer_end_at).toISOString() : null,
        isActive: offerStatus.isActive,
        status: offerStatus.status,
      },
      upi: {
        upiId: defaultUpiId,
        payeeName: defaultPayeeName,
        qrCodeUrl: certRow?.qr_code_url || appRow?.qr_code_url || null,
      },
    };
  } catch (err: any) {
    console.error("[fetchPublicFeeSettings] Error:", err.message);
    return {
      applicationFee: {
        isEnabled: false,
        enabled: false,
        amount: 0,
        upi_id: "hariharanmahesh34@oksbi",
        payee_name: "Hariharan Mahesh",
        qr_code_url: null,
      },
      certificateFee: {
        isEnabled: true,
        enabled: true,
        amount: 100,
        upi_id: "hariharanmahesh34@oksbi",
        payee_name: "Hariharan Mahesh",
        qr_code_url: null,
      },
      premiumPlan: {
        isEnabled: false,
        enabled: false,
        amount: 200,
        upi_id: "hariharanmahesh34@oksbi",
        payee_name: "Hariharan Mahesh",
        qr_code_url: null,
      },
      certificateOffer: {
        isEnabled: false,
        amount: 0,
        name: "Certificate Free Offer",
        startAt: null,
        endAt: null,
        isActive: false,
        status: "inactive",
      },
      upi: {
        upiId: "hariharanmahesh34@oksbi",
        payeeName: "Hariharan Mahesh",
        qrCodeUrl: null,
      },
    };
  }
}

export async function getAdminFeeSettings(adminId: string): Promise<AdminFeeSettingsResponse> {
  const isAdmin = await checkIsAdmin(adminId);
  if (!isAdmin) throw new Error("Unauthorized: Admin privileges required");

  const settingsRes = await dbQuery(`
    SELECT 
      fs.*,
      p.full_name as admin_name,
      p.email as admin_email
    FROM public.fee_settings fs
    LEFT JOIN public.profiles p ON p.id = fs.updated_by
    ORDER BY fs.fee_type
  `);

  const logsRes = await dbQuery(`
    SELECT 
      al.*,
      p.full_name as admin_name,
      p.email as admin_email
    FROM public.fee_audit_logs al
    LEFT JOIN public.profiles p ON p.id = al.admin_id
    ORDER BY al.created_at DESC
    LIMIT 20
  `);

  const certRow = settingsRes.rows.find((r) => r.fee_type === "certificate");
  const offerStatus = evaluateOfferStatus(
    Boolean(certRow?.offer_enabled),
    certRow?.offer_start_at,
    certRow?.offer_end_at
  );

  return {
    settings: settingsRes.rows.map((r) => ({
      ...r,
      amount: Number(r.amount),
      is_enabled: Boolean(r.is_enabled),
      offer_enabled: Boolean(r.offer_enabled),
      offer_amount: Number(r.offer_amount ?? 0),
      offer_name: r.offer_name || "Certificate Free Offer",
      offer_start_at: r.offer_start_at ? new Date(r.offer_start_at).toISOString() : null,
      offer_end_at: r.offer_end_at ? new Date(r.offer_end_at).toISOString() : null,
    })),
    certificateOffer: {
      isEnabled: Boolean(certRow?.offer_enabled),
      amount: Number(certRow?.offer_amount ?? 0),
      name: certRow?.offer_name || "Certificate Free Offer",
      startAt: certRow?.offer_start_at ? new Date(certRow.offer_start_at).toISOString() : null,
      endAt: certRow?.offer_end_at ? new Date(certRow.offer_end_at).toISOString() : null,
      isActive: offerStatus.isActive,
      status: offerStatus.status,
    },
    recentLogs: logsRes.rows,
  };
}

export async function updateAdminFeeSettings(data: {
  adminId: string;
  applicationFee: { amount: number; isEnabled: boolean };
  certificateFee: { amount: number; isEnabled: boolean };
  premiumPlan?: { amount: number; isEnabled: boolean };
  certificateOffer?: {
    isEnabled: boolean;
    amount: number;
    name?: string;
    startAt?: string | null;
    endAt?: string | null;
  };
  upiId: string;
  payeeName: string;
  qrCodeUrl?: string | null;
}) {
  const isAdmin = await checkIsAdmin(data.adminId);
  if (!isAdmin) throw new Error("Unauthorized: Admin privileges required");

  if (data.applicationFee.amount < 0 || data.certificateFee.amount < 0 || (data.premiumPlan && data.premiumPlan.amount < 0)) {
    throw new Error("Fee amounts cannot be negative");
  }
  if (!data.upiId || !data.upiId.trim()) {
    throw new Error("UPI ID cannot be empty");
  }

  if (data.certificateOffer?.isEnabled && data.certificateOffer.startAt && data.certificateOffer.endAt) {
    const startTime = new Date(data.certificateOffer.startAt).getTime();
    const endTime = new Date(data.certificateOffer.endAt).getTime();
    if (startTime >= endTime) {
      throw new Error("Offer start date must be before end date");
    }
  }

  return withTransaction(async (client) => {
    const oldRes = await client.query("SELECT * FROM public.fee_settings");
    const oldValues = oldRes.rows;

    await client.query(
      `UPDATE public.fee_settings
       SET amount = $1, is_enabled = $2, upi_id = $3, payee_name = $4, qr_code_url = $5, updated_by = $6, updated_at = now()
       WHERE fee_type = 'application'`,
      [
        data.applicationFee.amount,
        data.applicationFee.isEnabled,
        data.upiId.trim(),
        data.payeeName.trim(),
        data.qrCodeUrl ?? null,
        data.adminId,
      ]
    );

    const offer = data.certificateOffer;
    await client.query(
      `UPDATE public.fee_settings
       SET amount = $1, 
           is_enabled = $2, 
           offer_enabled = $3,
           offer_amount = $4,
           offer_name = $5,
           offer_start_at = $6,
           offer_end_at = $7,
           upi_id = $8, 
           payee_name = $9, 
           qr_code_url = $10, 
           updated_by = $11, 
           updated_at = now()
       WHERE fee_type = 'certificate'`,
      [
        data.certificateFee.amount,
        data.certificateFee.isEnabled,
        Boolean(offer?.isEnabled),
        Number(offer?.amount ?? 0),
        offer?.name?.trim() || "Certificate Free Offer",
        offer?.startAt ? new Date(offer.startAt).toISOString() : null,
        offer?.endAt ? new Date(offer.endAt).toISOString() : null,
        data.upiId.trim(),
        data.payeeName.trim(),
        data.qrCodeUrl ?? null,
        data.adminId,
      ]
    );

    if (data.premiumPlan) {
      await client.query(
        `INSERT INTO public.fee_settings (
           id, fee_type, amount, is_enabled, upi_id, payee_name, qr_code_url, updated_by, updated_at
         ) VALUES ('fee_premium_plan', 'premium_plan', $1, $2, $3, $4, $5, $6, now())
         ON DUPLICATE KEY UPDATE
           amount = VALUES(amount),
           is_enabled = VALUES(is_enabled),
           upi_id = VALUES(upi_id),
           payee_name = VALUES(payee_name),
           qr_code_url = VALUES(qr_code_url),
           updated_by = VALUES(updated_by),
           updated_at = now()`,
        [
          data.premiumPlan.amount,
          data.premiumPlan.isEnabled ? 1 : 0,
          data.upiId.trim(),
          data.payeeName.trim(),
          data.qrCodeUrl ?? null,
          data.adminId,
        ]
      );
    }

    await client.query(
      `INSERT INTO public.fee_audit_logs (id, admin_id, action, entity_type, old_value, new_value)
       VALUES (UUID(), $1, 'UPDATE_FEE_SETTINGS', 'fee_setting', $2, $3)`,
      [
        data.adminId,
        JSON.stringify(oldValues),
        JSON.stringify({
          applicationFee: data.applicationFee,
          certificateFee: data.certificateFee,
          premiumPlan: data.premiumPlan,
          certificateOffer: data.certificateOffer,
          upiId: data.upiId,
          payeeName: data.payeeName,
          qrCodeUrl: data.qrCodeUrl,
        }),
      ]
    );

    return { success: true };
  });
}

export async function checkAllTasksVerified(
  clientOrPool: any,
  applicationId: string
): Promise<{
  isCompleted: boolean;
  approvedCount: number;
  requiredCount: number;
  missingTaskNumbers: number[];
}> {
  const queryFn = clientOrPool?.query
    ? (text: string, params?: any[]) => clientOrPool.query(text, params)
    : dbQuery;

  const appRes = await queryFn(
    "SELECT id, user_id, email, domain, duration, total_tasks, plan_type, all_tasks_verified, certificate_payment_unlocked, status FROM public.applications WHERE id = $1",
    [applicationId]
  );
  if (appRes.rows.length === 0) {
    return { isCompleted: false, approvedCount: 0, requiredCount: 5, missingTaskNumbers: [] };
  }
  const app = appRes.rows[0];

  // 1. Check if application is already verified or unlocked or completed
  const isMarkedVerified = Boolean(
    app.all_tasks_verified === true ||
    app.all_tasks_verified === 1 ||
    String(app.all_tasks_verified) === "true" ||
    app.certificate_payment_unlocked === true ||
    app.certificate_payment_unlocked === 1 ||
    String(app.certificate_payment_unlocked) === "true" ||
    app.status === "completed"
  );

  if (isMarkedVerified) {
    const total = Number(app.total_tasks) > 0 ? Number(app.total_tasks) : 6;
    return {
      isCompleted: true,
      approvedCount: total,
      requiredCount: total,
      missingTaskNumbers: [],
    };
  }

  const isFullstack = app.domain === "fullstack";
  const isPremium = app.plan_type === "premium";
  const taskLimits: Record<number, number> = (isFullstack && isPremium)
    ? { 1: 5, 2: 8, 3: 25, 6: 50 }
    : { 1: 5, 2: 8, 3: 10, 6: 12 };
  const limit = (Number(app.total_tasks) > 0)
    ? Number(app.total_tasks)
    : (taskLimits[Number(app.duration) || 1] ?? 5);

  // Fetch all tasks for domain with task_number <= limit (task 0 LinkedIn, and tasks 1..limit)
  const reqTasksRes = await queryFn(
    "SELECT id, task_number FROM public.tasks WHERE domain = $1 AND task_number <= $2 ORDER BY task_number ASC",
    [app.domain, limit]
  );

  const requiredTasks: Array<{ id: string; task_number: number }> = reqTasksRes.rows;
  const requiredCount = requiredTasks.length > 0 ? requiredTasks.length : (limit + 1);

  if (requiredTasks.length === 0) {
    const subCountRes = await queryFn(
      "SELECT COUNT(DISTINCT task_id) as approved_count FROM public.submissions WHERE application_id = $1 AND status = 'approved'",
      [applicationId]
    );
    const approvedCount = Number(subCountRes.rows[0]?.approved_count ?? 0);
    return {
      isCompleted: approvedCount >= (limit + 1) && approvedCount > 0,
      approvedCount,
      requiredCount: limit + 1,
      missingTaskNumbers: [],
    };
  }

  const approvedRes = await queryFn(
    `SELECT DISTINCT task_id FROM public.submissions 
     WHERE application_id = $1 
       AND status = 'approved'`,
    [applicationId]
  );

  const approvedIds = new Set(approvedRes.rows.map((r: any) => r.task_id));
  const missingTasks = requiredTasks.filter((t) => !approvedIds.has(t.id));
  const approvedCount = approvedIds.size;
  const isCompleted = approvedCount >= requiredCount && missingTasks.length === 0;

  return {
    isCompleted,
    approvedCount,
    requiredCount,
    missingTaskNumbers: missingTasks.map((t) => t.task_number),
  };
}

export async function validateCouponLogic(data: {
  code: string;
  userId?: string;
  applicationId?: string;
  domain?: string;
  target?: "certificate" | "application";
}): Promise<CouponValidationResult> {
  const { code, userId, applicationId, domain, target = "certificate" } = data;
  if (!code || !code.trim()) {
    return { valid: false, discountAmount: 0, originalAmount: 0, finalAmount: 0, error: "Please enter a coupon code" };
  }

  // If this coupon is being validated for a certificate, verify task completion condition!
  if (target === "certificate" && applicationId) {
    const taskCheck = await checkAllTasksVerified(null, applicationId);
    if (!taskCheck.isCompleted) {
      return {
        valid: false,
        discountAmount: 0,
        originalAmount: 100,
        finalAmount: 100,
        error: `Certificate coupon is locked: Only ${taskCheck.approvedCount} of ${taskCheck.requiredCount} required tasks are approved. Complete and get admin verification for all tasks first.`,
      };
    }
  }

  // Get current fee for target
  const feeRes = await dbQuery("SELECT * FROM public.fee_settings WHERE fee_type = $1", [target]);
  const feeRow = feeRes.rows[0];
  const originalAmount = Number(feeRow?.amount ?? (target === "certificate" ? 100 : 0));

  const cleanCode = code.trim();
  const couponRes = await dbQuery("SELECT * FROM public.coupons WHERE LOWER(code) = LOWER($1)", [cleanCode]);
  if (couponRes.rows.length === 0) {
    return { valid: false, discountAmount: 0, originalAmount, finalAmount: originalAmount, error: "Invalid coupon code" };
  }

  const c = couponRes.rows[0];

  if (!c.is_active) {
    return { valid: false, discountAmount: 0, originalAmount, finalAmount: originalAmount, error: "This coupon is no longer active" };
  }

  if (c.expires_at && new Date(c.expires_at) < new Date()) {
    return { valid: false, discountAmount: 0, originalAmount, finalAmount: originalAmount, error: "This coupon has expired" };
  }

  if (c.max_uses > 0 && c.current_uses >= c.max_uses) {
    return { valid: false, discountAmount: 0, originalAmount, finalAmount: originalAmount, error: "This coupon has reached its maximum usage limit" };
  }

  if (c.applies_to && c.applies_to !== "both" && c.applies_to !== target) {
    return {
      valid: false,
      discountAmount: 0,
      originalAmount,
      finalAmount: originalAmount,
      error: `This coupon is only valid for ${c.applies_to} fees`,
    };
  }

  if (c.applicable_domains && c.applicable_domains.length > 0 && domain) {
    if (!c.applicable_domains.includes(domain)) {
      return {
        valid: false,
        discountAmount: 0,
        originalAmount,
        finalAmount: originalAmount,
        error: "This coupon is not applicable to your internship domain",
      };
    }
  }

  // Check duplicate student redemption
  if (userId && c.single_use_per_user) {
    const redRes = await dbQuery(
      "SELECT id FROM public.coupon_redemptions WHERE coupon_id = $1 AND user_id = $2 LIMIT 1",
      [c.id, userId]
    );
    if (redRes.rows.length > 0) {
      return {
        valid: false,
        discountAmount: 0,
        originalAmount,
        finalAmount: originalAmount,
        error: "You have already redeemed this coupon",
      };
    }
  }

  // Calculate discount
  let discountAmount = 0;
  if (c.discount_type === "free" || (c.discount_type === "percentage" && Number(c.discount_value) >= 100)) {
    discountAmount = originalAmount;
  } else if (c.discount_type === "percentage") {
    discountAmount = (originalAmount * Number(c.discount_value)) / 100;
  } else {
    discountAmount = Number(c.discount_value);
  }

  if (c.max_discount_amount && discountAmount > Number(c.max_discount_amount)) {
    discountAmount = Number(c.max_discount_amount);
  }
  if (discountAmount > originalAmount) {
    discountAmount = originalAmount;
  }

  discountAmount = Math.round(discountAmount * 100) / 100;
  const finalAmount = Math.max(0, Math.round((originalAmount - discountAmount) * 100) / 100);

  return {
    valid: true,
    code: c.code,
    discountType: c.discount_type,
    discountValue: Number(c.discount_value),
    discountAmount,
    originalAmount,
    finalAmount,
  };
}

export async function submitPaymentProofLogic(data: {
  userId: string;
  applicationId?: string | null;
  paymentType: "application" | "certificate";
  utrNumber: string;
  screenshotUrl?: string | null;
  couponCode?: string | null;
}) {
  const { userId, applicationId, paymentType, utrNumber, screenshotUrl, couponCode } = data;

  if (!userId) throw new Error("Unauthorized: User session required");
  if (!utrNumber || utrNumber.trim().length < 6) {
    throw new Error("Please enter a valid UPI Transaction / UTR number (at least 6 characters)");
  }

  return withTransaction(async (client) => {
    // 0. Strict server-side security for certificate payment
    if (paymentType === "certificate") {
      if (!applicationId) {
        throw new Error("Application ID is required for certificate payment verification");
      }
      const appRes = await client.query(
        "SELECT id, user_id, total_tasks, status, plan_type, plan_fee, agreed_fee FROM public.applications WHERE id = $1",
        [applicationId]
      );
      if (appRes.rows.length === 0) {
        throw new Error("Application record not found");
      }
      const app = appRes.rows[0];
      if (app.user_id !== userId) {
        throw new Error("Security Violation: You can only submit payment for your own application");
      }

      // Check that ALL required tasks are verified and approved by admin
      const taskCheck = await checkAllTasksVerified(client, applicationId);
      if (!taskCheck.isCompleted) {
        throw new Error(
          `Certificate payment is LOCKED: You have ${taskCheck.approvedCount} of ${taskCheck.requiredCount} required tasks approved (missing tasks: ${taskCheck.missingTaskNumbers.join(", ")}). Admin must verify and approve all required tasks before certificate payment unlocks.`
        );
      }
    }

    // 1. Read current fee from database (never trust client)
    const feeRes = await client.query("SELECT fee_type, amount, is_enabled, offer_enabled, offer_amount, offer_start_at, offer_end_at FROM public.fee_settings");
    const certFeeRow = feeRes.rows.find((r: any) => r.fee_type === "certificate");
    const premFeeRow = feeRes.rows.find((r: any) => r.fee_type === "premium_plan");
    const appFeeRow = feeRes.rows.find((r: any) => r.fee_type === "application");

    let amount = 0;
    if (paymentType === "certificate") {
      let appRowData: any = null;
      if (applicationId) {
        const aRes = await client.query("SELECT plan_type, plan_fee, agreed_fee FROM public.applications WHERE id = $1", [applicationId]);
        appRowData = aRes.rows[0];
      }
      if (appRowData?.plan_type === "premium") {
        amount = Number(appRowData.plan_fee) > 0 ? Number(appRowData.plan_fee) : Number(premFeeRow?.amount ?? 200);
      } else {
        amount = Number(certFeeRow?.amount ?? 100);
      }
    } else {
      amount = Number(appFeeRow?.amount ?? 0);
    }

    // 2. Apply coupon if provided
    let discountAmount = 0;
    if (couponCode && couponCode.trim()) {
      const cRes = await client.query(
        "SELECT * FROM public.coupons WHERE LOWER(code) = LOWER($1) AND is_active = true",
        [couponCode.trim()]
      );
      if (cRes.rows.length > 0) {
        const c = cRes.rows[0];
        if (c.discount_type === "free" || (c.discount_type === "percentage" && Number(c.discount_value) >= 100)) {
          discountAmount = amount;
        } else if (c.discount_type === "percentage") {
          discountAmount = (amount * Number(c.discount_value)) / 100;
        } else {
          discountAmount = Number(c.discount_value);
        }
        if (discountAmount > amount) discountAmount = amount;
        amount = Math.max(0, amount - discountAmount);
      }
    }

    // 3. Prevent duplicate active pending submissions
    const existingRes = await client.query(
      `SELECT id, status FROM public.payment_records 
       WHERE user_id = $1 AND payment_type = $2 AND status IN ('pending', 'under_review')
       ${applicationId ? "AND application_id = $3" : ""}`,
      applicationId ? [userId, paymentType, applicationId] : [userId, paymentType]
    );

    if (existingRes.rows.length > 0) {
      const existingId = existingRes.rows[0].id;
      await client.query(
        `UPDATE public.payment_records 
         SET utr_number = $1, screenshot_url = COALESCE($2, screenshot_url), amount = $3, status = 'pending', updated_at = now()
         WHERE id = $4`,
        [utrNumber.trim(), screenshotUrl ?? null, amount, existingId]
      );
      return { success: true, paymentId: existingId, status: "pending" };
    }

    // 4. Check if there was a resubmission_required record to update
    const resubRes = await client.query(
      `SELECT id FROM public.payment_records 
       WHERE user_id = $1 AND payment_type = $2 AND status = 'resubmission_required'
       ${applicationId ? "AND application_id = $3" : ""}
       ORDER BY updated_at DESC LIMIT 1`,
      applicationId ? [userId, paymentType, applicationId] : [userId, paymentType]
    );

    if (resubRes.rows.length > 0) {
      const resubId = resubRes.rows[0].id;
      await client.query(
        `UPDATE public.payment_records 
         SET utr_number = $1, screenshot_url = COALESCE($2, screenshot_url), amount = $3, status = 'pending', updated_at = now()
         WHERE id = $4`,
        [utrNumber.trim(), screenshotUrl ?? null, amount, resubId]
      );
      return { success: true, paymentId: resubId, status: "pending" };
    }

    // 5. Insert new payment record
    const newId = crypto.randomUUID();
    await client.query(
      `INSERT INTO public.payment_records (
         id, user_id, application_id, payment_type, amount, utr_number, screenshot_url, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')`,
      [newId, userId, applicationId ?? null, paymentType, amount, utrNumber.trim(), screenshotUrl ?? null]
    );

    // 6. Update application status if this was an application fee submission
    if (paymentType === "application" && applicationId) {
      await client.query(
        `UPDATE public.applications 
         SET application_fee_status = 'pending' 
         WHERE id = $1`,
        [applicationId]
      );
    }

    // 7. If certificate payment, sync legacy payments table for backward compatibility
    if (paymentType === "certificate" && applicationId) {
      await client.query(
        `INSERT INTO public.payments (id, application_id, utr_number, screenshot_url, amount, status, coupon_code, discount_amount)
         VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7)
         ON DUPLICATE KEY UPDATE
           utr_number = VALUES(utr_number),
           screenshot_url = VALUES(screenshot_url),
           amount = VALUES(amount),
           status = 'pending'`,
        [newId, applicationId, utrNumber.trim(), screenshotUrl ?? null, amount, couponCode ?? null, discountAmount]
      );
    }

    return { success: true, paymentId: newId, status: "pending" };
  });
}

export async function claimFreeCouponCertificate(data: {
  userId: string;
  applicationId: string;
  couponCode: string;
}) {
  const { userId, applicationId, couponCode } = data;
  if (!userId || !applicationId || !couponCode) {
    throw new Error("Missing required claim parameters");
  }

  return withTransaction(async (client) => {
    // 0. Strict server-side check: application must exist, belong to user, and all required tasks approved
    const appRes = await client.query(
      "SELECT id, user_id, total_tasks, status FROM public.applications WHERE id = $1",
      [applicationId]
    );
    if (appRes.rows.length === 0) {
      throw new Error("Application not found");
    }
    const app = appRes.rows[0];
    if (app.user_id !== userId) {
      throw new Error("Unauthorized: Student application mismatch");
    }

    const taskCheck = await checkAllTasksVerified(client, applicationId);
    if (!taskCheck.isCompleted) {
      throw new Error(
        `Certificate coupon is LOCKED: You have ${taskCheck.approvedCount} of ${taskCheck.requiredCount} required tasks approved. Admin must verify and approve all tasks before claiming a certificate coupon.`
      );
    }

    const cRes = await client.query(
      "SELECT * FROM public.coupons WHERE LOWER(code) = LOWER($1) AND is_active = true FOR UPDATE",
      [couponCode.trim()]
    );
    if (cRes.rows.length === 0) {
      throw new Error("Invalid or inactive coupon code");
    }
    const c = cRes.rows[0];

    if (c.expires_at && new Date(c.expires_at) < new Date()) {
      throw new Error("This coupon has expired");
    }
    if (c.max_uses > 0 && c.current_uses >= c.max_uses) {
      throw new Error("Coupon usage limit reached");
    }

    const redRes = await client.query(
      "SELECT id FROM public.coupon_redemptions WHERE coupon_id = $1 AND user_id = $2 LIMIT 1",
      [c.id, userId]
    );
    if (redRes.rows.length > 0) {
      throw new Error("You have already redeemed this coupon");
    }

    await client.query(
      "UPDATE public.coupons SET current_uses = current_uses + 1, updated_at = now() WHERE id = $1",
      [c.id]
    );

    await client.query(
      `INSERT INTO public.coupon_redemptions (coupon_id, user_id, application_id, discount_amount)
       VALUES ($1, $2, $3, 100)`,
      [c.id, userId, applicationId]
    );

    const payRecordId = crypto.randomUUID();
    await client.query(
      `INSERT INTO public.payment_records (
         id, user_id, application_id, payment_type, amount, utr_number, screenshot_url, status, admin_note
       ) VALUES ($1, $2, $3, 'certificate', 0, $4, null, 'approved', '100% Free Coupon Applied')`,
      [payRecordId, userId, applicationId, `FREE_${c.code}`]
    );

    await client.query(
      `INSERT INTO public.payments (id, application_id, utr_number, screenshot_url, amount, status, verified_at, coupon_code, discount_amount)
       VALUES ($1, $2, $3, null, 0, 'verified', NOW(), $4, 100)
       ON DUPLICATE KEY UPDATE
         status = 'verified',
         verified_at = NOW(),
         amount = 0,
         coupon_code = VALUES(coupon_code)`,
      [payRecordId, applicationId, `FREE_${c.code}`, c.code]
    );

    // Retrieve or generate certificate
    const existingCertRes = await client.query(
      "SELECT certificate_id FROM public.certificates WHERE application_id = $1 LIMIT 1",
      [applicationId]
    );
    let certId = existingCertRes.rows[0]?.certificate_id;
    if (!certId) {
      const year = new Date().getFullYear();
      const rand = Math.floor(100000 + Math.random() * 900000);
      certId = `SKX-${year}-${rand}`;
      const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
      const certRecordId = crypto.randomUUID();
      await client.query(
        `INSERT INTO public.certificates (id, application_id, certificate_id, verification_hash)
         VALUES ($1, $2, $3, $4)`,
        [certRecordId, applicationId, certId, hash]
      );
    }

    await client.query(
      `UPDATE public.applications 
       SET status = 'completed',
           submission_status = 'approved',
           verified = true,
           certificate_generated = true,
           certificate_generated_at = COALESCE(certificate_generated_at, now()),
           certificate_payment_status = 'approved',
           certificate_payment_unlocked = true,
           all_tasks_verified = true 
       WHERE id = $1`,
      [applicationId]
    );

    // Automatically dispatch Certificate of Completion via Gmail SMTP
    const appFullRes = await client.query("SELECT * FROM public.applications WHERE id = $1", [applicationId]);
    const fullApp = appFullRes.rows[0];
    const targetEmail = (fullApp?.email || "").trim();
    if (targetEmail && certId) {
      const studentName = fullApp.full_name;
      const domainVal = fullApp.domain;
      const internIdVal = fullApp.intern_id || "SKX-INTERN";
      const finalCertId = certId;
      setTimeout(async () => {
        try {
          const { sendCertificateEmail } = await import("./email-helpers");
          const domainObj = getDomain(domainVal);
          const domainName = domainObj?.name || domainVal || "Internship Track";
          console.log(`[claimFreeCouponCertificate] Automatically sending Certificate to ${targetEmail}...`);
          const emailRes = await sendCertificateEmail({
            to: targetEmail,
            studentName,
            studentId: userId,
            certId: finalCertId,
            domainName,
            internId: internIdVal,
          });
          console.log(`[claimFreeCouponCertificate] Auto Certificate result for ${targetEmail}:`, emailRes.success);
        } catch (autoErr: any) {
          console.error("[claimFreeCouponCertificate] Auto Certificate dispatch error:", autoErr?.message);
        }
      }, 50);
    }

    return { success: true, certificateId: certId, message: "Free certificate claimed successfully! 🎓" };
  });
}

export async function claimFreeCertificate(data: {
  userId: string;
  applicationId: string;
}) {
  const { userId, applicationId } = data;
  if (!userId || !applicationId) {
    throw new Error("Missing required parameters");
  }

  return withTransaction(async (client) => {
    // 1. Verify application exists, belongs to student, and tasks are approved
    const appRes = await client.query(
      `SELECT id, user_id, total_tasks, domain, full_name, email,
              certificate_offer_eligible, certificate_offer_amount, certificate_offer_snapshot,
              certificate_payment_status, all_tasks_verified
       FROM public.applications WHERE id = $1`,
      [applicationId]
    );
    if (appRes.rows.length === 0) {
      throw new Error("Application not found");
    }
    const app = appRes.rows[0];
    if (app.user_id !== userId) {
      throw new Error("Unauthorized: Student application mismatch");
    }

    const taskCheck = await checkAllTasksVerified(client, applicationId);
    if (!taskCheck.isCompleted) {
      throw new Error(
        `Certificate is LOCKED: You have ${taskCheck.approvedCount} of ${taskCheck.requiredCount} required tasks approved (missing task(s): ${taskCheck.missingTaskNumbers.join(", ")}). Admin must verify all tasks before certificate issuance.`
      );
    }

    // 2. Strict eligibility & payment rule evaluation
    const certRowRes = await client.query(
      "SELECT amount, is_enabled, offer_enabled, offer_start_at, offer_end_at FROM public.fee_settings WHERE fee_type = 'certificate'"
    );
    const certRow = certRowRes.rows[0];
    const normalFee = Number(certRow?.amount ?? 100);
    const feeEnabled = Boolean(certRow?.is_enabled);
    const offerEnabled = Boolean(certRow?.offer_enabled);

    const offerStatus = evaluateOfferStatus(
      offerEnabled,
      certRow?.offer_start_at,
      certRow?.offer_end_at,
      new Date()
    );

    const isOfferEligible = Boolean(app.certificate_offer_eligible && offerEnabled && offerStatus.isActive);
    const isPaymentApproved =
      app.certificate_payment_status === "approved" || (isOfferEligible && app.certificate_payment_status === "waived");

    if (!isOfferEligible && !isPaymentApproved && feeEnabled && normalFee > 0) {
      throw new Error(
        `Normal Certificate Fee (₹${normalFee}) applies to this application as Certificate Free Offer is not active. Please complete payment first.`
      );
    }

    // Check if certificate already exists
    const existingCertRes = await client.query(
      "SELECT certificate_id FROM public.certificates WHERE application_id = $1 LIMIT 1",
      [applicationId]
    );

    let certId = existingCertRes.rows[0]?.certificate_id;
    if (!certId) {
      const year = new Date().getFullYear();
      const rand = Math.floor(100000 + Math.random() * 900000);
      certId = `SKX-${year}-${rand}`;
      const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
      const certRecordId = crypto.randomUUID();

      await client.query(
        `INSERT INTO public.certificates (id, application_id, certificate_id, verification_hash)
         VALUES ($1, $2, $3, $4)`,
        [certRecordId, applicationId, certId, hash]
      );
    }

    const newPaymentStatus = isOfferEligible ? "waived" : (app.certificate_payment_status || "approved");

    // Update application flags (DO NOT CREATE FAKE FINANCIAL PAYMENT RECORDS)
    await client.query(
      `UPDATE public.applications 
       SET status = 'completed', 
           submission_status = 'approved', 
           verified = true, 
           certificate_generated = true, 
           certificate_generated_at = now(), 
           all_tasks_verified = true, 
           certificate_payment_status = $1, 
           certificate_payment_unlocked = true 
       WHERE id = $2`,
      [newPaymentStatus, applicationId]
    );

    // Automatically dispatch Certificate of Completion with official PDF attachment via Gmail SMTP
    const studentEmail = (app.email || "").trim();
    if (studentEmail && certId) {
      const studentName = app.full_name;
      const domainVal = app.domain;
      const internIdVal = app.intern_id || "SKX-INTERN";
      const finalCertId = certId;
      const studentUserId = userId;

      setTimeout(async () => {
        try {
          const { sendCertificateEmail } = await import("./email-helpers");
          const domainObj = getDomain(domainVal);
          const domainName = domainObj?.name || domainVal || "Internship Track";
          console.log(`[claimFreeCertificate] Automatically sending Certificate to ${studentEmail}...`);
          const emailRes = await sendCertificateEmail({
            to: studentEmail,
            studentName,
            studentId: studentUserId,
            certId: finalCertId,
            domainName,
            internId: internIdVal,
          });
          console.log(`[claimFreeCertificate] Auto Certificate result for ${studentEmail}:`, emailRes.success);
        } catch (autoErr: any) {
          console.error("[claimFreeCertificate] Auto Certificate dispatch error:", autoErr?.message);
        }
      }, 50);
    }

    return {
      success: true,
      certificateId: certId,
      message: isOfferEligible
        ? "Certificate claimed via Certificate Free Offer! 🎓"
        : "Certificate generated successfully! 🎓",
    };
  });
}

export async function getAdminPayments(data: {
  adminId: string;
  statusFilter?: string;
  typeFilter?: string;
  searchQuery?: string;
}): Promise<PaymentRecordItem[]> {
  const isAdmin = await checkIsAdmin(data.adminId);
  if (!isAdmin) throw new Error("Unauthorized: Admin privileges required");

  let query = `
    SELECT 
      pr.*,
      p.full_name as student_name,
      p.email as student_email,
      p.phone as student_phone,
      a.intern_id,
      a.domain,
      rev.full_name as reviewer_name
    FROM public.payment_records pr
    LEFT JOIN public.profiles p ON p.id = pr.user_id
    LEFT JOIN public.applications a ON a.id = pr.application_id
    LEFT JOIN public.profiles rev ON rev.id = pr.reviewed_by
    WHERE 1=1
  `;

  const params: any[] = [];
  let paramIndex = 1;

  if (data.statusFilter && data.statusFilter !== "all") {
    query += ` AND pr.status = $${paramIndex++}`;
    params.push(data.statusFilter);
  }

  if (data.typeFilter && data.typeFilter !== "all") {
    query += ` AND pr.payment_type = $${paramIndex++}`;
    params.push(data.typeFilter);
  }

  if (data.searchQuery && data.searchQuery.trim()) {
    const q = `%${data.searchQuery.trim()}%`;
    query += ` AND (
      p.full_name ILIKE $${paramIndex} OR 
      p.email ILIKE $${paramIndex} OR 
      pr.utr_number ILIKE $${paramIndex} OR 
      a.intern_id ILIKE $${paramIndex}
    )`;
    params.push(q);
    paramIndex++;
  }

  query += " ORDER BY pr.created_at DESC LIMIT 200";

  const res = await dbQuery(query, params);
  return res.rows.map((r: any) => ({
    ...r,
    amount: Number(r.amount),
  }));
}

export async function reviewPayment(data: {
  adminId: string;
  paymentId: string;
  action: "approve" | "reject" | "resubmission_required";
  adminNote?: string;
}) {
  const { adminId, paymentId, action, adminNote } = data;
  const isAdmin = await checkIsAdmin(adminId);
  if (!isAdmin) throw new Error("Unauthorized: Admin privileges required");

  return withTransaction(async (client) => {
    const payRes = await client.query("SELECT * FROM public.payment_records WHERE id = $1 FOR UPDATE", [paymentId]);
    if (payRes.rows.length === 0) throw new Error("Payment record not found");
    const payment = payRes.rows[0];

    let newStatus = "pending";
    if (action === "approve") newStatus = "approved";
    else if (action === "reject") newStatus = "rejected";
    else if (action === "resubmission_required") newStatus = "resubmission_required";

    await client.query(
      `UPDATE public.payment_records
       SET status = $1, admin_note = $2, reviewed_by = $3, reviewed_at = now(), updated_at = now()
       WHERE id = $4`,
      [newStatus, adminNote ?? null, adminId, paymentId]
    );

    if (payment.payment_type === "application" && payment.application_id) {
      if (action === "approve") {
        await client.query(
          `UPDATE public.applications 
           SET status = 'approved', application_fee_status = 'approved', offer_issued_at = COALESCE(offer_issued_at, now()) 
           WHERE id = $1`,
          [payment.application_id]
        );

        try {
          const appRes = await client.query("SELECT * FROM public.applications WHERE id = $1", [payment.application_id]);
          const app = appRes.rows[0];
          if (app?.email && app?.email_status !== "sent") {
            const { sendOfferLetterEmail } = await import("@/lib/email-helpers");
            sendOfferLetterEmail({
              to: app.email,
              studentName: app.full_name,
              studentId: app.user_id,
              internId: app.intern_id,
              domainName: app.domain,
              duration: app.duration,
            }).then(async (emailRes) => {
              if (emailRes.success) {
                await dbQuery(
                  "UPDATE public.applications SET email_status = 'sent', email_sent_at = now(), email_error = null WHERE id = $1",
                  [payment.application_id]
                );
              } else {
                await dbQuery(
                  "UPDATE public.applications SET email_status = 'failed', email_error = $1 WHERE id = $2",
                  [emailRes.error || "Email sending failed", payment.application_id]
                );
              }
            }).catch((e) => console.error("[reviewPayment] Email error:", e));
          }
        } catch (e) {
          console.error("[reviewPayment] Failed to trigger offer letter email:", e);
        }
      } else if (action === "reject") {
        await client.query(
          `UPDATE public.applications SET application_fee_status = 'rejected' WHERE id = $1`,
          [payment.application_id]
        );
      } else if (action === "resubmission_required") {
        await client.query(
          `UPDATE public.applications SET application_fee_status = 'resubmission_required' WHERE id = $1`,
          [payment.application_id]
        );
      }
    } else if (payment.payment_type === "certificate" && payment.application_id) {
      const legacyStatus = action === "approve" ? "verified" : action === "reject" ? "rejected" : "pending";
      await client.query(
        `UPDATE public.payments 
         SET status = $1, verified_at = $2 
         WHERE application_id = $3`,
        [legacyStatus, action === "approve" ? new Date().toISOString() : null, payment.application_id]
      );

      if (action === "approve") {
        // Retrieve or generate certificate
        const existingCertRes = await client.query(
          "SELECT certificate_id FROM public.certificates WHERE application_id = $1 LIMIT 1",
          [payment.application_id]
        );
        let certId = existingCertRes.rows[0]?.certificate_id;
        if (!certId) {
          certId = generateCertId();
          const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
          const certRecordId = crypto.randomUUID();
          await client.query(
            `INSERT INTO public.certificates (id, application_id, certificate_id, verification_hash, issued_at)
             VALUES ($1, $2, $3, $4, now())`,
            [certRecordId, payment.application_id, certId, hash]
          );
        }

        await client.query(
          `UPDATE public.applications 
           SET status = 'completed', 
               submission_status = 'approved', 
               verified = true, 
               verified_at = COALESCE(verified_at, now()),
               certificate_generated = true, 
               certificate_generated_at = COALESCE(certificate_generated_at, now()), 
               all_tasks_verified = true, 
               certificate_payment_status = 'approved', 
               certificate_payment_unlocked = true,
               updated_at = now()
           WHERE id = $1`,
          [payment.application_id]
        );

        // Send email asynchronously
        try {
          const appRes = await client.query("SELECT * FROM public.applications WHERE id = $1", [payment.application_id]);
          const app = appRes.rows[0];
          let targetEmail = (app?.email || "").trim();
          if (targetEmail && certId) {
            const { sendCertificateEmail } = await import("@/lib/email-helpers");
            const domainName = getDomain(app?.domain)?.name ?? app?.domain ?? "Internship Track";
            sendCertificateEmail({
              to: targetEmail,
              studentName: app.full_name,
              studentId: app.user_id || "",
              certId,
              domainName,
              internId: app.intern_id || "SKX-INTERN",
            }).then(async (emailRes) => {
              if (emailRes.success) {
                await dbQuery(
                  "UPDATE public.applications SET email_status = 'sent', email_sent_at = now(), email_error = null WHERE id = $1",
                  [payment.application_id]
                );
              } else {
                await dbQuery(
                  "UPDATE public.applications SET email_status = 'failed', email_error = $1 WHERE id = $2",
                  [emailRes.error || "Email delivery failed", payment.application_id]
                );
              }
            }).catch((e) => console.error("[reviewPayment] Certificate email error:", e));
          }
        } catch (e) {
          console.error("[reviewPayment] Failed to trigger certificate email:", e);
        }
      } else {
        await client.query(
          `UPDATE public.applications 
           SET certificate_payment_status = $1,
               updated_at = now()
           WHERE id = $2`,
          [action === "reject" ? "rejected" : action === "resubmission_required" ? "resubmission_required" : "pending", payment.application_id]
        );
      }
    }

    await client.query(
      `INSERT INTO public.fee_audit_logs (id, admin_id, action, entity_type, entity_id, old_value, new_value)
       VALUES (UUID(), $1, $2, 'payment', $3, $4, $5)`,
      [
        adminId,
        `PAYMENT_${action.toUpperCase()}`,
        paymentId,
        JSON.stringify({ status: payment.status }),
        JSON.stringify({ status: newStatus, adminNote }),
      ]
    );

    return { success: true, status: newStatus };
  });
}

export async function getCouponsAdmin(adminId: string) {
  const isAdmin = await checkIsAdmin(adminId);
  if (!isAdmin) throw new Error("Unauthorized: Admin privileges required");

  const res = await dbQuery(`
    SELECT 
      c.*,
      p.full_name as creator_name,
      (SELECT count(*) FROM public.coupon_redemptions cr WHERE cr.coupon_id = c.id) as redemption_count
    FROM public.coupons c
    LEFT JOIN public.profiles p ON p.id = c.created_by
    ORDER BY c.created_at DESC
  `);

  return res.rows.map((r) => ({
    ...r,
    discount_value: Number(r.discount_value),
    max_uses: Number(r.max_uses),
    current_uses: Number(r.current_uses),
    redemption_count: Number(r.redemption_count),
  }));
}

export async function createCouponAdmin(data: {
  adminId: string;
  code: string;
  description?: string;
  discountType: "percentage" | "fixed" | "free";
  discountValue: number;
  appliesTo: "certificate" | "application" | "both";
  usageLimit: number;
  singleUsePerUser: boolean;
  expiresAt?: string | null;
  isActive: boolean;
}) {
  const isAdmin = await checkIsAdmin(data.adminId);
  if (!isAdmin) throw new Error("Unauthorized: Admin privileges required");

  const cleanCode = data.code.trim().toUpperCase();
  if (!cleanCode) throw new Error("Coupon code is required");
  if (data.discountValue < 0) throw new Error("Discount value cannot be negative");

  return withTransaction(async (client) => {
    const existing = await client.query("SELECT id FROM public.coupons WHERE LOWER(code) = LOWER($1)", [cleanCode]);
    if (existing.rows.length > 0) {
      throw new Error(`Coupon with code "${cleanCode}" already exists`);
    }

    const couponId = crypto.randomUUID();
    await client.query(
      `INSERT INTO public.coupons (
         id, code, description, discount_type, discount_value, applies_to, max_uses, single_use_per_user, expires_at, is_active, created_by
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        couponId,
        cleanCode,
        data.description ?? "",
        data.discountType,
        data.discountValue,
        data.appliesTo,
        data.usageLimit,
        data.singleUsePerUser,
        data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
        data.isActive,
        data.adminId,
      ]
    );

    await client.query(
      `INSERT INTO public.fee_audit_logs (id, admin_id, action, entity_type, entity_id, new_value)
       VALUES (UUID(), $1, 'CREATE_COUPON', 'coupon', $2, $3)`,
      [data.adminId, couponId, JSON.stringify(data)]
    );

    return { success: true, couponId };
  });
}

export async function toggleCouponAdmin(data: { adminId: string; couponId: string; isActive: boolean }) {
  const isAdmin = await checkIsAdmin(data.adminId);
  if (!isAdmin) throw new Error("Unauthorized: Admin privileges required");

  await dbQuery(
    "UPDATE public.coupons SET is_active = $1, updated_at = now() WHERE id = $2",
    [data.isActive, data.couponId]
  );

  await dbQuery(
    `INSERT INTO public.fee_audit_logs (id, admin_id, action, entity_type, entity_id, new_value)
     VALUES (UUID(), $1, 'TOGGLE_COUPON', 'coupon', $2, $3)`,
    [data.adminId, data.couponId, JSON.stringify({ is_active: data.isActive })]
  );

  return { success: true };
}

export async function deleteCouponAdmin(data: { adminId: string; couponId: string }) {
  const isAdmin = await checkIsAdmin(data.adminId);
  if (!isAdmin) throw new Error("Unauthorized: Admin privileges required");

  const redRes = await dbQuery("SELECT count(*) FROM public.coupon_redemptions WHERE coupon_id = $1", [data.couponId]);
  const count = Number(redRes.rows[0].count);

  if (count > 0) {
    await dbQuery("UPDATE public.coupons SET is_active = false, updated_at = now() WHERE id = $1", [data.couponId]);
    return { success: true, deactivated: true, message: "Coupon has active redemptions, so it has been deactivated." };
  } else {
    await dbQuery("DELETE FROM public.coupons WHERE id = $1", [data.couponId]);
    return { success: true, deactivated: false, message: "Coupon deleted successfully." };
  }
}

export async function getCouponRedemptionsAdmin(data: { adminId: string; couponId: string }) {
  const isAdmin = await checkIsAdmin(data.adminId);
  if (!isAdmin) throw new Error("Unauthorized: Admin privileges required");

  const res = await dbQuery(
    `SELECT 
       cr.*,
       p.full_name as student_name,
       p.email as student_email,
       a.intern_id,
       a.domain
     FROM public.coupon_redemptions cr
     LEFT JOIN public.profiles p ON p.id = cr.user_id
     LEFT JOIN public.applications a ON a.id = cr.application_id
     WHERE cr.coupon_id = $1
     ORDER BY cr.redeemed_at DESC`,
    [data.couponId]
  );

  return res.rows.map((r: any) => ({
    ...r,
    discount_amount: Number(r.discount_amount),
  }));
}

export async function syncApplicationTaskStatus(applicationId: string) {
  if (!applicationId) return { verified: false, count: 0, required: 5 };
  return withTransaction(async (client) => {
    const taskCheck = await checkAllTasksVerified(client, applicationId);

    const isComp = taskCheck.isCompleted ? 1 : 0;
    await client.query(
      `UPDATE public.applications
       SET all_tasks_verified = $1,
           certificate_payment_unlocked = $1,
           certificate_payment_status = CASE 
             WHEN $1 = 1 AND (certificate_payment_status = 'locked' OR certificate_payment_status IS NULL) THEN 'unlocked'
             WHEN $1 = 0 AND certificate_payment_status != 'approved' THEN 'locked'
             ELSE certificate_payment_status
           END
       WHERE id = $2`,
      [isComp, applicationId]
    );

    if (taskCheck.isCompleted) {
      const appRes = await client.query(
        "SELECT id, user_id, domain, intern_id, full_name, email, certificate_payment_status, certificate_offer_eligible, certificate_generated FROM public.applications WHERE id = $1",
        [applicationId]
      );
      const app = appRes.rows[0];
      const isFeeCleared = app?.certificate_payment_status === "approved" || app?.certificate_payment_status === "waived" || Boolean(app?.certificate_offer_eligible);

      if (isFeeCleared) {
        const certRes = await client.query(
          "SELECT certificate_id FROM public.certificates WHERE application_id = $1 LIMIT 1",
          [applicationId]
        );
        let certId = certRes.rows[0]?.certificate_id;
        if (!certId) {
          const year = new Date().getFullYear();
          const rand = Math.floor(100000 + Math.random() * 900000);
          certId = `SKX-${year}-${rand}`;
          const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
          const certRecordId = crypto.randomUUID();
          await client.query(
            "INSERT INTO public.certificates (id, application_id, certificate_id, verification_hash) VALUES ($1, $2, $3, $4)",
            [certRecordId, applicationId, certId, hash]
          );
        }

        await client.query(
          `UPDATE public.applications
           SET status = 'completed',
               submission_status = 'approved',
               verified = true,
               certificate_generated = true,
               certificate_generated_at = COALESCE(certificate_generated_at, now()),
               certificate_payment_status = CASE WHEN certificate_payment_status = 'approved' THEN 'approved' ELSE 'waived' END,
               certificate_payment_unlocked = true
           WHERE id = $1`,
          [applicationId]
        );

        const targetEmail = (app?.email || "").trim();
        if (targetEmail && certId) {
          const studentName = app.full_name;
          const studentUserId = app.user_id;
          const domainVal = app.domain;
          const internIdVal = app.intern_id || "SKX-INTERN";
          const finalCertId = certId;
          setTimeout(async () => {
            try {
              const { sendCertificateEmail } = await import("./email-helpers");
              const domainObj = getDomain(domainVal);
              const domainName = domainObj?.name || domainVal || "Internship Track";
              console.log(`[syncApplicationTaskStatus] Automatically sending Certificate to ${targetEmail}...`);
              const emailRes = await sendCertificateEmail({
                to: targetEmail,
                studentName,
                studentId: studentUserId,
                certId: finalCertId,
                domainName,
                internId: internIdVal,
              });
              console.log(`[syncApplicationTaskStatus] Auto Certificate result for ${targetEmail}:`, emailRes.success);
            } catch (autoErr: any) {
              console.error("[syncApplicationTaskStatus] Auto Certificate dispatch error:", autoErr?.message);
            }
          }, 50);
        }
      }
    }

    return { verified: taskCheck.isCompleted, count: taskCheck.approvedCount, required: taskCheck.requiredCount };
  });
}

export async function submitApplicationServer(data: {
  userId: string;
  domain: string;
  duration: number;
  totalTasks: number;
  internId: string;
  fullName: string;
  email: string;
  phone: string;
  college: string;
  course: string;
  year: string;
  photoUrl?: string | null;
  couponCode?: string | null;
  country?: string | null;
  state?: string | null;
  district?: string | null;
  city?: string | null;
  pincode?: string | null;
  hearAbout?: string | null;
  referralName?: string | null;
  planType?: "standard" | "premium";
}) {
  return withTransaction(async (client) => {
    const now = new Date();
    const nowIso = now.toISOString();
    const planType: "standard" | "premium" =
      data.domain === "fullstack" && (data.duration === 3 || data.duration === 6) && data.planType === "premium"
        ? "premium"
        : "standard";

    // Strict validation: Premium (₹200) is exclusively for 3-month and 6-month durations in Full Stack Development
    if (planType === "premium") {
      if (data.duration !== 3 && data.duration !== 6) {
        throw new Error("Premium plan is only available for 3-month and 6-month internships.");
      }
      if (data.domain !== "fullstack") {
        throw new Error("The Premium Plan is exclusively available for Full Stack Development internships.");
      }
    }

    // Compute total tasks strictly:
    // Full Stack Premium (₹200): 3M=25, 6M=50
    // Full Stack Standard (₹100) & Other domains: 1M=5, 2M=8, 3M=10, 6M=12
    let totalTasks = data.totalTasks;
    if (data.domain === "fullstack") {
      if (planType === "premium") {
        if (data.duration === 6) totalTasks = 50;
        else if (data.duration === 3) totalTasks = 25;
        else if (data.duration === 2) totalTasks = 8;
        else totalTasks = 5;
      } else {
        if (data.duration === 6) totalTasks = 12;
        else if (data.duration === 3) totalTasks = 10;
        else if (data.duration === 2) totalTasks = 8;
        else totalTasks = 5;
      }
    } else {
      if (data.duration === 6) totalTasks = 12;
      else if (data.duration === 3) totalTasks = 10;
      else if (data.duration === 2) totalTasks = 8;
      else totalTasks = 5;
    }

    // 1. Fetch fee settings for application, certificate, and premium plan
    const feeRes = await client.query("SELECT * FROM public.fee_settings ORDER BY fee_type");
    const rows = feeRes.rows;
    const appRow = rows.find((r: any) => r.fee_type === "application");
    const certRow = rows.find((r: any) => r.fee_type === "certificate");
    const premiumRow = rows.find((r: any) => r.fee_type === "premium_plan");

    const certNormalFee = Number(certRow?.amount ?? 100);
    const appFeeAmount = Number(appRow?.amount ?? 0);
    const appFeeEnabled = Boolean(appRow?.is_enabled && appFeeAmount > 0);
    const premiumBaseFee = Number(premiumRow?.amount ?? 200);

    // 2. Plan pricing & coupon discount calculation
    // Upfront application registration is FREE. Payment is only required after task completion & admin approval.
    const planFee = planType === "premium" ? premiumBaseFee : (appFeeEnabled ? appFeeAmount : certNormalFee);
    let discountAmount = 0;

    if (data.couponCode && data.couponCode.trim()) {
      const cRes = await client.query(
        "SELECT * FROM public.coupons WHERE LOWER(code) = LOWER($1) AND is_active = true",
        [data.couponCode.trim()]
      );
      if (cRes.rows.length > 0) {
        const c = cRes.rows[0];
        const isExpired = c.expires_at && new Date(c.expires_at).getTime() < now.getTime();
        const applies = c.applies_to === "application" || c.applies_to === "both" || c.applies_to === "certificate";
        if (!isExpired && applies) {
          if (c.discount_type === "free" || (c.discount_type === "percentage" && Number(c.discount_value) >= 100)) {
            discountAmount = planFee;
          } else if (c.discount_type === "percentage") {
            discountAmount = Math.round((planFee * Number(c.discount_value)) / 100);
          } else {
            discountAmount = Math.min(planFee, Number(c.discount_value));
          }
        }
      }
    }

    const agreedFee = Math.max(0, planFee - discountAmount);
    const planPaymentStatus: "pending" | "waived" = agreedFee === 0 ? "waived" : "pending";
    const applicationStatus: "approved" = "approved"; // User starts immediately
    const planPaidAt: string | null = agreedFee === 0 ? nowIso : null;

    // 3. Evaluate Certificate Free Offer strictly on trusted server time
    const offerStatus = evaluateOfferStatus(
      Boolean(certRow?.offer_enabled),
      certRow?.offer_start_at,
      certRow?.offer_end_at,
      now
    );

    const isOfferEligible = offerStatus.isActive;
    const certOfferAmount = Number(certRow?.offer_amount ?? 0);
    const certOfferName = certRow?.offer_name || "Certificate Free Offer";

    const offerSnapshot = isOfferEligible
      ? {
          offer_name: certOfferName,
          normal_certificate_fee: certNormalFee,
          offer_certificate_fee: certOfferAmount,
          offer_start_at: certRow?.offer_start_at ? new Date(certRow.offer_start_at).toISOString() : null,
          offer_end_at: certRow?.offer_end_at ? new Date(certRow.offer_end_at).toISOString() : null,
          granted_at: nowIso,
        }
      : null;

    // 4. Insert application row
    const applicationId = crypto.randomUUID();
    const appPayload: Record<string, any> = {
      id: applicationId,
      user_id: data.userId,
      domain: data.domain,
      duration: data.duration,
      total_tasks: totalTasks,
      intern_id: data.internId,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      college: data.college,
      course: data.course,
      year: data.year,
      photo_url: data.photoUrl ?? null,
      coupon_code: data.couponCode ?? null,
      country: data.country ?? null,
      state: data.state ?? null,
      district: data.district ?? null,
      city: data.city ?? null,
      pincode: data.pincode ?? null,
      hear_about: data.hearAbout ?? null,
      referral_name: data.referralName ?? null,
      status: applicationStatus,
      submission_status: "in_progress",
      offer_issued_at: nowIso,
      email_status: "pending",
      application_fee_required: false,
      application_fee_status: "approved",
      certificate_offer_eligible: isOfferEligible ? 1 : 0,
      certificate_offer_id: isOfferEligible ? certOfferName : null,
      certificate_offer_amount: isOfferEligible ? certOfferAmount : null,
      certificate_offer_snapshot: offerSnapshot ? JSON.stringify(offerSnapshot) : null,
      certificate_offer_granted_at: isOfferEligible ? nowIso : null,
      certificate_offer_expires_at: certRow?.offer_end_at ? new Date(certRow.offer_end_at).toISOString() : null,
      certificate_payment_unlocked: 0,
      certificate_payment_status: "locked",
      plan_type: planType,
      plan_fee: planFee,
      plan_payment_status: planPaymentStatus,
      discount_amount: discountAmount,
      agreed_fee: agreedFee,
      plan_paid_at: planPaidAt,
      created_at: nowIso,
      submitted_at: nowIso,
    };

    const colRes = await client.query("SHOW COLUMNS FROM applications");
    const validColNames = new Set(colRes.rows.map((r: any) => r.Field || r.COLUMN_NAME));
    const insertKeys = Object.keys(appPayload).filter((k) => validColNames.has(k));
    const insertColList = insertKeys.map((k) => `\`${k}\``).join(", ");
    const insertPlaceholders = insertKeys.map(() => "?").join(", ");
    const insertValues = insertKeys.map((k) => appPayload[k]);

    await client.query(
      `INSERT INTO applications (${insertColList}) VALUES (${insertPlaceholders})`,
      insertValues
    );

    const appQuery = await client.query(
      "SELECT * FROM public.applications WHERE id = $1",
      [applicationId]
    );
    const createdApp = appQuery.rows[0];

    // 5. Upsert student profile
    await client.query(
      `INSERT INTO public.profiles (id, full_name, phone, college, course, year, photo_url, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON DUPLICATE KEY UPDATE
         full_name = VALUES(full_name),
         phone = VALUES(phone),
         college = VALUES(college),
         course = VALUES(course),
         year = VALUES(year),
         photo_url = COALESCE(VALUES(photo_url), photo_url),
         updated_at = NOW()`,
      [data.userId, data.fullName, data.phone, data.college, data.course, data.year, data.photoUrl ?? null]
    );

    // Automatically dispatch Offer Letter with official PDF attachment via Gmail SMTP
    if (data.email && data.email.trim()) {
      const targetEmail = data.email.trim();
      const studentFullName = data.fullName;
      const internId = data.internId;
      const domainVal = data.domain;
      const durationVal = data.duration;
      const userIdVal = data.userId;

      setTimeout(async () => {
        try {
          const { sendOfferLetterEmail } = await import("./email-helpers");
          const domainObj = getDomain(domainVal);
          const domainName = domainObj?.name || domainVal;
          console.log(`[submitApplicationServer] Automatically sending Offer Letter to ${targetEmail}...`);
          const emailRes = await sendOfferLetterEmail({
            to: targetEmail,
            studentName: studentFullName,
            studentId: userIdVal,
            internId,
            domainName,
            duration: durationVal,
          });
          console.log(`[submitApplicationServer] Auto Offer Letter result for ${targetEmail}:`, emailRes.success);
        } catch (autoErr: any) {
          console.error("[submitApplicationServer] Auto Offer Letter dispatch error:", autoErr?.message);
        }
      }, 50);
    }

    return {
      success: true,
      application: createdApp,
      requiresAppFee: false,
      appFeeAmount: 0,
      isOfferEligible,
      offerSnapshot,
      planType,
      planFee,
      discountAmount,
      agreedFee,
      requiresPlanPayment: false,
    };
  });
}

export interface SendVerificationQueueOffersInput {
  adminId: string;
  applicationIds: string[];
  couponCode: string;
  createCouponIfNeeded?: boolean;
  couponDetails?: {
    discountType: "percentage" | "fixed" | "free";
    discountValue: number;
    usageLimit?: number;
    expiresAt?: string | null;
    description?: string;
  };
  customSubject?: string;
  customMessage?: string;
  autoApplyToApplication?: boolean;
  dashboardUrl?: string;
}

export async function sendVerificationQueueOffersServer(data: SendVerificationQueueOffersInput) {
  const isAdmin = await checkIsAdmin(data.adminId);
  if (!isAdmin) throw new Error("Unauthorized: Admin privileges required");

  if (!data.applicationIds || data.applicationIds.length === 0) {
    throw new Error("No student applications selected");
  }

  const cleanCode = data.couponCode.trim().toUpperCase();
  if (!cleanCode) throw new Error("Coupon code is required");

  // 1. Resolve or create coupon
  const couponRes = await dbQuery("SELECT * FROM public.coupons WHERE LOWER(code) = LOWER($1)", [cleanCode]);
  let coupon = couponRes.rows[0];

  if (!coupon) {
    if (data.createCouponIfNeeded) {
      const couponId = crypto.randomUUID();
      const discType = data.couponDetails?.discountType || "percentage";
      const discVal = data.couponDetails?.discountValue ?? 50;
      const usageLimit = data.couponDetails?.usageLimit ?? 0;
      const desc = data.couponDetails?.description || `Verification Queue Special Offer (${discVal}% OFF)`;
      const expires = data.couponDetails?.expiresAt ? new Date(data.couponDetails.expiresAt).toISOString() : null;

      await dbQuery(
        `INSERT INTO public.coupons (
           id, code, description, discount_type, discount_value, applies_to, max_uses, single_use_per_user, expires_at, is_active, created_by
         ) VALUES ($1, $2, $3, $4, $5, 'certificate', $6, 1, $7, 1, $8)`,
        [couponId, cleanCode, desc, discType, discVal, usageLimit, expires, data.adminId]
      );

      coupon = {
        id: couponId,
        code: cleanCode,
        description: desc,
        discount_type: discType,
        discount_value: discVal,
        expires_at: expires,
        is_active: 1,
      };
    } else {
      throw new Error(`Coupon with code "${cleanCode}" does not exist. Please enable 'Create coupon' or select an existing active coupon.`);
    }
  }

  // Ensure coupon is active
  if (!coupon.is_active) {
    await dbQuery("UPDATE public.coupons SET is_active = 1 WHERE id = $1", [coupon.id]);
    coupon.is_active = 1;
  }

  // 2. Fetch applications & send emails
  const { sendOfferCouponEmail } = await import("./email-helpers");
  const results: Array<{
    applicationId: string;
    studentName: string;
    email: string;
    success: boolean;
    error?: string;
  }> = [];

  let successfulCount = 0;
  let failedCount = 0;

  for (const appId of data.applicationIds) {
    try {
      const appRes = await dbQuery(
        "SELECT id, user_id, full_name, email, domain, intern_id, coupon_code FROM public.applications WHERE id = $1",
        [appId]
      );

      if (!appRes.rows || appRes.rows.length === 0) {
        results.push({ applicationId: appId, studentName: "Unknown", email: "", success: false, error: "Application not found" });
        failedCount++;
        continue;
      }

      const app = appRes.rows[0];
      const targetEmail = (app.email || "").trim();
      if (!targetEmail) {
        results.push({ applicationId: appId, studentName: app.full_name, email: "", success: false, error: "No email address found" });
        failedCount++;
        continue;
      }

      // If auto-apply: update coupon_code on application
      if (data.autoApplyToApplication !== false) {
        await dbQuery(
          "UPDATE public.applications SET coupon_code = $1, verification_offer_sent_at = NOW(), verification_offer_coupon = $1 WHERE id = $2",
          [cleanCode, app.id]
        );
      } else {
        await dbQuery(
          "UPDATE public.applications SET verification_offer_sent_at = NOW(), verification_offer_coupon = $1 WHERE id = $2",
          [cleanCode, app.id]
        );
      }

      const domainObj = getDomain(app.domain);
      const domainName = domainObj?.name || app.domain;

      const emailRes = await sendOfferCouponEmail({
        to: targetEmail,
        studentName: app.full_name,
        studentId: app.user_id,
        internId: app.intern_id,
        domainName,
        couponCode: cleanCode,
        discountType: (coupon.discount_type as any) || "percentage",
        discountValue: Number(coupon.discount_value ?? 50),
        expiresAt: coupon.expires_at,
        customSubject: data.customSubject,
        customMessage: data.customMessage,
        dashboardUrl: data.dashboardUrl,
      });

      if (emailRes.success) {
        successfulCount++;
        results.push({ applicationId: appId, studentName: app.full_name, email: targetEmail, success: true });
      } else {
        failedCount++;
        results.push({ applicationId: appId, studentName: app.full_name, email: targetEmail, success: false, error: emailRes.error });
      }
    } catch (sendErr: any) {
      failedCount++;
      results.push({ applicationId: appId, studentName: "Error", email: "", success: false, error: sendErr?.message || "Failed to send" });
    }
  }

  // Audit log
  try {
    await dbQuery(
      `INSERT INTO public.fee_audit_logs (id, admin_id, action, entity_type, entity_id, new_value)
       VALUES (UUID(), $1, 'SEND_VERIFICATION_OFFERS', 'coupon', $2, $3)`,
      [
        data.adminId,
        coupon.id,
        JSON.stringify({
          couponCode: cleanCode,
          totalRequested: data.applicationIds.length,
          successfulCount,
          failedCount,
        }),
      ]
    );
  } catch (auditErr: any) {
    console.warn("[sendVerificationQueueOffersServer] Audit log warning:", auditErr?.message);
  }

  return {
    success: successfulCount > 0 || failedCount === 0,
    total: data.applicationIds.length,
    successfulCount,
    failedCount,
    couponCode: cleanCode,
    discountValue: Number(coupon.discount_value ?? 50),
    discountType: coupon.discount_type,
    results,
  };
}

