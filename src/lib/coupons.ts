import { supabase } from "@/integrations/supabase/client";
import { PAYMENT } from "./constants";
import { validateCouponServer } from "./fee-service";

export type CouponResult = {
  valid: boolean;
  code?: string;
  discountType?: "percentage" | "fixed" | "free";
  discountValue?: number;
  discountAmount?: number;
  originalAmount: number;
  finalAmount: number;
  error?: string;
};

export type CouponRow = {
  id: string;
  code: string;
  description: string;
  discount_type: "percentage" | "fixed" | "free";
  discount_value: number;
  applies_to?: "certificate" | "application" | "both";
  max_uses: number;
  current_uses: number;
  single_use_per_user?: boolean;
  min_amount?: number;
  max_discount_amount: number | null;
  expires_at: string | null;
  is_active: boolean;
  applicable_domains: string[] | null;
  created_at: string;
};

export function calculateDiscountedAmount(
  originalAmount: number,
  discountType: "percentage" | "fixed" | "free",
  discountValue: number,
  maxDiscountAmount?: number | null,
): number {
  if (discountType === "free") return 0;
  let discount = discountType === "percentage"
    ? (originalAmount * discountValue) / 100
    : discountValue;
  if (maxDiscountAmount != null && discount > maxDiscountAmount) {
    discount = maxDiscountAmount;
  }
  if (discount > originalAmount) discount = originalAmount;
  return Math.max(0, Math.round((originalAmount - discount) * 100) / 100);
}

export function formatDiscount(
  discountType: "percentage" | "fixed" | "free",
  discountValue: number,
): string {
  if (discountType === "free" || (discountType === "percentage" && discountValue >= 100)) {
    return "100% FREE";
  }
  return discountType === "percentage" ? `${discountValue}%` : `₹${discountValue}`;
}

export async function validateCoupon(
  code: string,
  domain?: string,
  amount?: number,
  userId?: string,
  target: "certificate" | "application" = "certificate"
): Promise<CouponResult> {
  const originalAmount = amount ?? PAYMENT.amount;

  try {
    const res = await validateCouponServer({
      data: {
        code: code.trim(),
        domain,
        userId,
        target,
      },
    });
    return res;
  } catch (err: any) {
    console.warn("[validateCoupon] Server call failed, falling back to direct query:", err.message);

    // Fallback: direct query
    const { data: rows, error } = await supabase
      .from("coupons" as any)
      .select("*")
      .ilike("code" as any, code.trim());

    if (error || !rows || rows.length === 0) {
      return { valid: false, originalAmount, finalAmount: originalAmount, error: "Invalid coupon code." };
    }

    const c = rows[0] as unknown as CouponRow;

    if (!c.is_active) {
      return { valid: false, originalAmount, finalAmount: originalAmount, error: "This coupon is no longer active." };
    }

    if (c.expires_at && new Date(c.expires_at) < new Date()) {
      return { valid: false, originalAmount, finalAmount: originalAmount, error: "This coupon has expired." };
    }

    if (c.max_uses > 0 && c.current_uses >= c.max_uses) {
      return { valid: false, originalAmount, finalAmount: originalAmount, error: "This coupon has reached its usage limit." };
    }

    if (c.applicable_domains && c.applicable_domains.length > 0 && domain) {
      if (!c.applicable_domains.includes(domain)) {
        return { valid: false, originalAmount, finalAmount: originalAmount, error: "This coupon is not applicable to your domain." };
      }
    }

    const finalAmount = calculateDiscountedAmount(originalAmount, c.discount_type, c.discount_value, c.max_discount_amount);
    const discountAmount = originalAmount - finalAmount;

    return {
      valid: true,
      code: c.code,
      discountType: c.discount_type,
      discountValue: c.discount_value,
      discountAmount,
      originalAmount,
      finalAmount,
    };
  }
}
