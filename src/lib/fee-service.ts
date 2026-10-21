import { createServerFn } from "@tanstack/react-start";

// ==========================================================
// TYPES
// ==========================================================

export interface CertificateOfferInfo {
  isEnabled: boolean;
  amount: number;
  name: string;
  startAt: string | null;
  endAt: string | null;
  isActive: boolean;
  status: "active" | "scheduled" | "expired" | "inactive";
}

export interface PublicFeeSettings {
  applicationFee: {
    isEnabled: boolean;
    enabled?: boolean;
    amount: number;
    upi_id?: string;
    payee_name?: string;
    qr_code_url?: string | null;
  };
  certificateFee: {
    isEnabled: boolean;
    enabled?: boolean;
    amount: number;
    upi_id?: string;
    payee_name?: string;
    qr_code_url?: string | null;
  };
  premiumPlan: {
    isEnabled: boolean;
    enabled?: boolean;
    amount: number;
    upi_id?: string;
    payee_name?: string;
    qr_code_url?: string | null;
  };
  certificateOffer: CertificateOfferInfo;
  upi: {
    upiId: string;
    payeeName: string;
    qrCodeUrl: string | null;
  };
}

export interface AdminFeeSettingsResponse {
  settings: Array<{
    id: string;
    fee_type: "application" | "certificate" | "premium_plan";
    amount: number;
    is_enabled: boolean;
    upi_id: string;
    payee_name: string;
    qr_code_url: string | null;
    offer_enabled?: boolean;
    offer_amount?: number;
    offer_name?: string;
    offer_start_at?: string | null;
    offer_end_at?: string | null;
    updated_by: string | null;
    updated_at: string;
    admin_name?: string | null;
    admin_email?: string | null;
  }>;
  certificateOffer: CertificateOfferInfo;
  recentLogs: Array<{
    id: string;
    admin_id: string | null;
    action: string;
    entity_type: string;
    entity_id: string | null;
    old_value: any;
    new_value: any;
    created_at: string;
    admin_name?: string | null;
    admin_email?: string | null;
  }>;
}

export interface CouponValidationResult {
  valid: boolean;
  code?: string;
  discountType?: "percentage" | "fixed" | "free";
  discountValue?: number;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
  error?: string;
}

export interface PaymentRecordItem {
  id: string;
  user_id: string;
  application_id: string | null;
  certificate_id: string | null;
  payment_type: "application" | "certificate";
  amount: number;
  utr_number: string;
  screenshot_url: string | null;
  status: "pending" | "under_review" | "approved" | "rejected" | "resubmission_required" | "cancelled";
  admin_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  student_name?: string | null;
  student_email?: string | null;
  student_phone?: string | null;
  intern_id?: string | null;
  domain?: string | null;
  reviewer_name?: string | null;
}

// ==========================================================
// PURE CLIENT-SAFE HELPER
// ==========================================================

export function evaluateOfferStatus(
  offerEnabled: boolean,
  startAt?: string | null,
  endAt?: string | null,
  now: Date = new Date()
): { isActive: boolean; status: "active" | "scheduled" | "expired" | "inactive" } {
  if (!offerEnabled) {
    return { isActive: false, status: "inactive" };
  }
  if (!startAt || !endAt) {
    return { isActive: false, status: "inactive" };
  }
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  const current = now.getTime();

  if (isNaN(start) || isNaN(end)) {
    return { isActive: false, status: "inactive" };
  }

  if (current < start) {
    return { isActive: false, status: "scheduled" };
  }
  if (current > end) {
    return { isActive: false, status: "expired" };
  }
  return { isActive: true, status: "active" };
}


// ==========================================================
// CREATE SERVER FN RPC ENDPOINTS
// ==========================================================

export const getPublicFeeSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicFeeSettings> => {
    const { fetchPublicFeeSettings } = await import("@/lib/fee-service.server");
    return fetchPublicFeeSettings();
  }
);

export const getAdminFeeSettings = createServerFn({ method: "POST" })
  .validator((d: any) => d as { adminId: string })
  .handler(async ({ data }): Promise<AdminFeeSettingsResponse> => {
    const { getAdminFeeSettings } = await import("@/lib/fee-service.server");
    return getAdminFeeSettings(data.adminId);
  });

export const updateAdminFeeSettings = createServerFn({ method: "POST" })
  .validator((d: any) => d as {
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
  })
  .handler(async ({ data }) => {
    const { updateAdminFeeSettings } = await import("@/lib/fee-service.server");
    return updateAdminFeeSettings(data);
  });

export const validateCouponServer = createServerFn({ method: "POST" })
  .validator((d: any) => d as {
    code: string;
    userId?: string;
    domain?: string;
    target?: "certificate" | "application";
  })
  .handler(async ({ data }): Promise<CouponValidationResult> => {
    const { validateCouponLogic } = await import("@/lib/fee-service.server");
    return validateCouponLogic(data);
  });

export const submitPaymentProof = createServerFn({ method: "POST" })
  .validator((d: any) => d as {
    userId: string;
    applicationId?: string | null;
    paymentType: "application" | "certificate";
    utrNumber: string;
    screenshotUrl?: string | null;
    couponCode?: string | null;
  })
  .handler(async ({ data }) => {
    const { submitPaymentProofLogic } = await import("@/lib/fee-service.server");
    return submitPaymentProofLogic(data);
  });

export const claimFreeCouponCertificate = createServerFn({ method: "POST" })
  .validator((d: any) => d as {
    userId: string;
    applicationId: string;
    couponCode: string;
  })
  .handler(async ({ data }) => {
    const { claimFreeCouponCertificate } = await import("@/lib/fee-service.server");
    return claimFreeCouponCertificate(data);
  });

export const claimFreeCertificate = createServerFn({ method: "POST" })
  .validator((d: any) => d as {
    userId: string;
    applicationId: string;
  })
  .handler(async ({ data }) => {
    const { claimFreeCertificate } = await import("@/lib/fee-service.server");
    return claimFreeCertificate(data);
  });

export const getAdminPayments = createServerFn({ method: "POST" })
  .validator((d: any) => d as {
    adminId: string;
    statusFilter?: string;
    typeFilter?: string;
    searchQuery?: string;
  })
  .handler(async ({ data }): Promise<PaymentRecordItem[]> => {
    const { getAdminPayments } = await import("@/lib/fee-service.server");
    return getAdminPayments(data);
  });

export const reviewPayment = createServerFn({ method: "POST" })
  .validator((d: any) => d as {
    adminId: string;
    paymentId: string;
    action: "approve" | "reject" | "resubmission_required";
    adminNote?: string;
  })
  .handler(async ({ data }) => {
    const { reviewPayment } = await import("@/lib/fee-service.server");
    return reviewPayment(data);
  });

export const getCouponsAdmin = createServerFn({ method: "POST" })
  .validator((d: any) => d as { adminId: string })
  .handler(async ({ data }) => {
    const { getCouponsAdmin } = await import("@/lib/fee-service.server");
    return getCouponsAdmin(data.adminId);
  });

export const createCouponAdmin = createServerFn({ method: "POST" })
  .validator((d: any) => d as {
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
  })
  .handler(async ({ data }) => {
    const { createCouponAdmin } = await import("@/lib/fee-service.server");
    return createCouponAdmin(data);
  });

export const toggleCouponAdmin = createServerFn({ method: "POST" })
  .validator((d: any) => d as { adminId: string; couponId: string; isActive: boolean })
  .handler(async ({ data }) => {
    const { toggleCouponAdmin } = await import("@/lib/fee-service.server");
    return toggleCouponAdmin(data);
  });

export const deleteCouponAdmin = createServerFn({ method: "POST" })
  .validator((d: any) => d as { adminId: string; couponId: string })
  .handler(async ({ data }) => {
    const { deleteCouponAdmin } = await import("@/lib/fee-service.server");
    return deleteCouponAdmin(data);
  });

export const getCouponRedemptionsAdmin = createServerFn({ method: "POST" })
  .validator((d: any) => d as { adminId: string; couponId: string })
  .handler(async ({ data }) => {
    const { getCouponRedemptionsAdmin } = await import("@/lib/fee-service.server");
    return getCouponRedemptionsAdmin(data);
  });

export const syncApplicationTaskStatusServer = createServerFn({ method: "POST" })
  .validator((d: any) => d as { applicationId: string })
  .handler(async ({ data }) => {
    const { syncApplicationTaskStatus } = await import("@/lib/fee-service.server");
    return syncApplicationTaskStatus(data.applicationId);
  });

export const submitApplicationServer = createServerFn({ method: "POST" })
  .validator((d: any) => d as {
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
  })
  .handler(async ({ data }) => {
    const { submitApplicationServer } = await import("@/lib/fee-service.server");
    return submitApplicationServer(data);
  });
