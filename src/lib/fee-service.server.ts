import { dbQuery, withTransaction } from "@/lib/db.server";
import {
  evaluateOfferStatus,
  type PublicFeeSettings,
  type AdminFeeSettingsResponse,
  type CouponValidationResult,
  type PaymentRecordItem,
} from "./fee-service";

// Helper: Check if user is admin
export async function checkIsAdmin(userId?: string | null): Promise<boolean> {
  if (!userId) return false;
  const res = await dbQuery(
    `SELECT EXISTS (
       SELECT 1 FROM public.user_roles WHERE user_id = $1 AND role = 'admin'
     ) OR EXISTS (
       SELECT 1 FROM auth.users WHERE id = $1 AND LOWER(email) IN (
         'hariharan@skyrovix.com',
         'harimaheshwaran34@gmail.com',
         'hariharan1152007@gmail.com'
       )
     ) as is_admin`,
    [userId]
  );
  return Boolean(res.rows[0]?.is_admin);
}

export async function fetchPublicFeeSettings(): Promise<PublicFeeSettings> {
  try {
    const res = await dbQuery("SELECT * FROM public.fee_settings ORDER BY fee_type");
    const rows = res.rows;

    const appRow = rows.find((r: any) => r.fee_type === "application");
    const certRow = rows.find((r: any) => r.fee_type === "certificate");

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

  if (data.applicationFee.amount < 0 || data.certificateFee.amount < 0) {
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

    await client.query(
      `INSERT INTO public.fee_audit_logs (admin_id, action, entity_type, old_value, new_value)
       VALUES ($1, 'UPDATE_FEE_SETTINGS', 'fee_setting', $2, $3)`,
      [
        data.adminId,
        JSON.stringify(oldValues),
        JSON.stringify({
          applicationFee: data.applicationFee,
          certificateFee: data.certificateFee,
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
    "SELECT id, user_id, domain, duration, total_tasks FROM public.applications WHERE id = $1",
    [applicationId]
  );
  if (appRes.rows.length === 0) {
    return { isCompleted: false, approvedCount: 0, requiredCount: 5, missingTaskNumbers: [] };
  }
  const app = appRes.rows[0];

  const taskLimits: Record<number, number> = { 1: 5, 2: 8, 3: 10, 6: 12 };
  const limit = taskLimits[Number(app.duration) || 1] ?? (Number(app.total_tasks) || 5);

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

  const requiredIds = requiredTasks.map((t) => t.id);
  const approvedRes = await queryFn(
    `SELECT DISTINCT task_id FROM public.submissions 
     WHERE application_id = $1 
       AND status = 'approved' 
       AND task_id = ANY($2::uuid[])`,
    [applicationId, requiredIds]
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
        "SELECT id, user_id, total_tasks, status FROM public.applications WHERE id = $1",
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
    const feeRes = await client.query("SELECT * FROM public.fee_settings WHERE fee_type = $1", [paymentType]);
    const feeRow = feeRes.rows[0];
    let amount = Number(feeRow?.amount ?? (paymentType === "certificate" ? 100 : 0));

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
    const insertRes = await client.query(
      `INSERT INTO public.payment_records (
         user_id, application_id, payment_type, amount, utr_number, screenshot_url, status
       ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING id`,
      [userId, applicationId ?? null, paymentType, amount, utrNumber.trim(), screenshotUrl ?? null]
    );

    const newId = insertRes.rows[0].id;

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
         ON CONFLICT (application_id) 
         DO UPDATE SET utr_number = EXCLUDED.utr_number, screenshot_url = EXCLUDED.screenshot_url, amount = EXCLUDED.amount, status = 'pending'`,
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

    const payRes = await client.query(
      `INSERT INTO public.payment_records (
         user_id, application_id, payment_type, amount, utr_number, screenshot_url, status, admin_note
       ) VALUES ($1, $2, 'certificate', 0, $3, null, 'approved', '100% Free Coupon Applied')
       RETURNING id`,
      [userId, applicationId, `FREE_${c.code}`]
    );

    await client.query(
      `INSERT INTO public.payments (id, application_id, utr_number, screenshot_url, amount, status, verified_at, coupon_code, discount_amount)
       VALUES ($1, $2, $3, null, 0, 'verified', now(), $4, 100)
       ON CONFLICT (application_id)
       DO UPDATE SET status = 'verified', verified_at = now(), amount = 0, coupon_code = EXCLUDED.coupon_code`,
      [payRes.rows[0].id, applicationId, `FREE_${c.code}`, c.code]
    );

    await client.query(
      `UPDATE public.applications 
       SET certificate_payment_status = 'approved', certificate_payment_unlocked = true, all_tasks_verified = true 
       WHERE id = $1`,
      [applicationId]
    );

    return { success: true, message: "Free certificate claimed successfully!" };
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

      await client.query(
        `INSERT INTO public.certificates (application_id, certificate_id, verification_hash)
         VALUES ($1, $2, $3)`,
        [applicationId, certId, hash]
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
      await client.query(
        `UPDATE public.applications 
         SET certificate_payment_status = $1 
         WHERE id = $2`,
        [action === "approve" ? "approved" : action === "reject" ? "rejected" : action === "resubmission_required" ? "resubmission_required" : "pending", payment.application_id]
      );
    }

    await client.query(
      `INSERT INTO public.fee_audit_logs (admin_id, action, entity_type, entity_id, old_value, new_value)
       VALUES ($1, $2, 'payment', $3, $4, $5)`,
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

    const res = await client.query(
      `INSERT INTO public.coupons (
         code, description, discount_type, discount_value, applies_to, max_uses, single_use_per_user, expires_at, is_active, created_by
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
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
      `INSERT INTO public.fee_audit_logs (admin_id, action, entity_type, entity_id, new_value)
       VALUES ($1, 'CREATE_COUPON', 'coupon', $2, $3)`,
      [data.adminId, res.rows[0].id, JSON.stringify(data)]
    );

    return { success: true, couponId: res.rows[0].id };
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
    `INSERT INTO public.fee_audit_logs (admin_id, action, entity_type, entity_id, new_value)
     VALUES ($1, 'TOGGLE_COUPON', 'coupon', $2, $3)`,
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

    await client.query(
      `UPDATE public.applications
       SET all_tasks_verified = $1,
           certificate_payment_unlocked = $1,
           certificate_payment_status = CASE 
             WHEN $1 = true AND (certificate_payment_status = 'locked' OR certificate_payment_status IS NULL) THEN 'unlocked'
             WHEN $1 = false AND certificate_payment_status != 'approved' THEN 'locked'
             ELSE certificate_payment_status
           END
       WHERE id = $2`,
      [taskCheck.isCompleted, applicationId]
    );

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
}) {
  return withTransaction(async (client) => {
    const now = new Date();
    const nowIso = now.toISOString();

    // 1. Fetch fee settings for both application and certificate
    const feeRes = await client.query("SELECT * FROM public.fee_settings ORDER BY fee_type");
    const rows = feeRes.rows;
    const appRow = rows.find((r: any) => r.fee_type === "application");
    const certRow = rows.find((r: any) => r.fee_type === "certificate");

    const appFeeAmount = Number(appRow?.amount ?? 0);
    const appFeeEnabled = Boolean(appRow?.is_enabled && appFeeAmount > 0);

    // 2. Evaluate Certificate Free Offer strictly on trusted server time
    const offerStatus = evaluateOfferStatus(
      Boolean(certRow?.offer_enabled),
      certRow?.offer_start_at,
      certRow?.offer_end_at,
      now
    );

    const isOfferEligible = offerStatus.isActive;
    const certNormalFee = Number(certRow?.amount ?? 100);
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

    // 3. Insert application row
    const insertRes = await client.query(
      `INSERT INTO public.applications (
         user_id, domain, duration, total_tasks, intern_id,
         full_name, email, phone, college, course, year, photo_url,
         coupon_code, country, state, district, city, pincode,
         hear_about, referral_name,
         status, submission_status, offer_issued_at, email_status,
         application_fee_required, application_fee_status,
         certificate_offer_eligible, certificate_offer_id,
         certificate_offer_amount, certificate_offer_snapshot,
         certificate_offer_granted_at, certificate_offer_expires_at,
         certificate_payment_unlocked, certificate_payment_status,
         created_at, submitted_at
       ) VALUES (
         $1, $2, $3, $4, $5,
         $6, $7, $8, $9, $10, $11, $12,
         $13, $14, $15, $16, $17, $18,
         $19, $20,
         $21, 'in_progress', $22, 'pending',
         $23, $24,
         $25, $26,
         $27, $28,
         $29, $30,
         false, 'locked',
         $31, $32
       )
       RETURNING *`,
      [
        data.userId,
        data.domain,
        data.duration,
        data.totalTasks,
        data.internId,
        data.fullName,
        data.email,
        data.phone,
        data.college,
        data.course,
        data.year,
        data.photoUrl ?? null,
        data.couponCode ?? null,
        data.country ?? null,
        data.state ?? null,
        data.district ?? null,
        data.city ?? null,
        data.pincode ?? null,
        data.hearAbout ?? null,
        data.referralName ?? null,
        appFeeEnabled ? "pending" : "approved",
        nowIso,
        appFeeEnabled,
        appFeeEnabled ? "pending" : "not_required",
        isOfferEligible,
        isOfferEligible ? certOfferName : null,
        isOfferEligible ? certOfferAmount : null,
        offerSnapshot ? JSON.stringify(offerSnapshot) : null,
        isOfferEligible ? nowIso : null,
        certRow?.offer_end_at ? new Date(certRow.offer_end_at).toISOString() : null,
        nowIso,
        nowIso,
      ]
    );

    const createdApp = insertRes.rows[0];

    // 4. Upsert student profile
    await client.query(
      `INSERT INTO public.profiles (id, full_name, phone, college, course, year, photo_url, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, now())
       ON CONFLICT (id) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         phone = EXCLUDED.phone,
         college = EXCLUDED.college,
         course = EXCLUDED.course,
         year = EXCLUDED.year,
         photo_url = COALESCE(EXCLUDED.photo_url, public.profiles.photo_url),
         updated_at = now()`,
      [data.userId, data.fullName, data.phone, data.college, data.course, data.year, data.photoUrl ?? null]
    );

    return {
      success: true,
      application: createdApp,
      requiresAppFee: appFeeEnabled,
      appFeeAmount,
      isOfferEligible,
      offerSnapshot,
    };
  });
}
