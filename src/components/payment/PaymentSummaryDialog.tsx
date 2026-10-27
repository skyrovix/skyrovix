import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building,
  Wallet,
  Lock,
  Loader2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";
import { createPaymentOrderServer } from "@/lib/cashfree-service";
import { launchCashfreeCheckout } from "@/lib/cashfree-client";

export interface PaymentSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productType: "certificate" | "application" | "course" | "custom" | "premium_plan";
  productService: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  userId?: string | null;
  applicationId?: string | null;
  courseId?: string | null;
  couponCode?: string | null;
  discountAmount?: number;
  onSuccess?: () => void;
}

export function PaymentSummaryDialog({
  open,
  onOpenChange,
  productType,
  productService,
  amount,
  customerName,
  customerEmail,
  customerPhone = "",
  userId,
  applicationId,
  courseId,
  couponCode,
  discountAmount = 0,
  onSuccess,
}: PaymentSummaryDialogProps) {
  const [phone, setPhone] = useState(customerPhone || "");
  const [isProcessing, setIsProcessing] = useState(false);

  const cleanPhone = phone.replace(/[^0-9]/g, "").slice(-10);
  const effectiveAmount = Math.max(0, amount - discountAmount);

  const handlePayNow = async () => {
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number for payment confirmation");
      return;
    }

    if (!customerEmail || !customerName) {
      toast.error("Customer details missing. Please refresh and try again.");
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading("Connecting to Cashfree payment gateway...");

    try {
      const dynamicReturnUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/payment/status?order_id={order_id}`
          : undefined;

      const res = await createPaymentOrderServer({
        data: {
          userId: userId || null,
          applicationId: applicationId || null,
          courseId: courseId || null,
          productType,
          productService,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: cleanPhone,
          couponCode: couponCode || null,
          returnUrl: dynamicReturnUrl,
        },
      });

      if (!res.success || !res.paymentSessionId) {
        throw new Error("Unable to establish payment session with gateway");
      }

      toast.success("Opening secure checkout...", { id: toastId });

      await launchCashfreeCheckout({
        paymentSessionId: res.paymentSessionId,
        environment: res.environment,
        redirectTarget: "_self",
      });

      onSuccess?.();
    } catch (err: any) {
      console.error("[Cashfree Checkout Error]:", err);
      toast.error(err.message || "Failed to start payment. Please try again.", {
        id: toastId,
        duration: 5000,
      });
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[92vw] max-w-[480px] sm:max-w-[480px] p-0 overflow-hidden rounded-3xl border border-border/70 bg-card shadow-2xl"
        style={{ maxWidth: "480px", width: "95vw" }}
      >
        {/* Top Accent Brand Gradient Bar */}
        <div className="h-1.5 w-full brand-gradient-horizontal" />

        {/* Modal Header */}
        <div className="px-6 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl brand-gradient text-white flex items-center justify-center shadow-lg shadow-[#f95c4b]/25 shrink-0">
                <Zap className="size-5 fill-current" />
              </div>
              <div>
                <DialogTitle className="text-base font-extrabold text-foreground tracking-tight font-display">
                  Payment Summary
                </DialogTitle>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="size-3 text-emerald-500 shrink-0" />
                  Official Cashfree Checkout
                </p>
              </div>
            </div>

            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-lg">
              Instant Approval
            </Badge>
          </div>
        </div>

        {/* Amount & Product Hero Banner */}
        <div className="bg-[#f95c4b]/[0.04] dark:bg-muted/30 border-y border-border/60 px-6 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block font-display">
              Item Details
            </span>
            <h4 className="text-sm font-bold text-foreground truncate mt-0.5" title={productService}>
              {productService}
            </h4>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
              {customerName} · <span className="font-mono">{customerEmail}</span>
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block font-display">
              Total Due
            </span>
            <div className="flex items-baseline justify-end gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-[#f95c4b] font-display">
                ₹{effectiveAmount}
              </span>
            </div>
            {discountAmount > 0 && (
              <span className="text-[10px] text-emerald-600 font-bold block">
                Saved ₹{discountAmount}
              </span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 pt-4 space-y-4">
          {/* Mobile Number Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="checkout-mobile" className="text-xs font-bold text-foreground">
                Mobile Number <span className="text-[#f95c4b]">*</span>
              </Label>
              <span className="text-[10px] text-muted-foreground">For UPI &amp; Bank OTP</span>
            </div>

            <div className="flex items-center rounded-2xl border border-border bg-muted/30 focus-within:border-[#f95c4b] focus-within:bg-background focus-within:ring-2 focus-within:ring-[#f95c4b]/20 transition-all overflow-hidden shadow-2xs">
              <div className="px-3.5 py-2.5 text-xs font-bold font-mono text-muted-foreground border-r border-border bg-muted/60 select-none flex items-center gap-1.5">
                <span>🇮🇳</span>
                <span>+91</span>
              </div>
              <Input
                id="checkout-mobile"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                className="border-0 bg-transparent h-11 text-xs sm:text-sm font-mono tracking-wider font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 px-3.5 placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-foreground/60"
                disabled={isProcessing}
              />
              {cleanPhone.length === 10 && (
                <div className="pr-3.5 text-emerald-500 shrink-0">
                  <CheckCircle2 className="size-4" />
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods Pill Row */}
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px] font-display">
                Supported Payment Modes
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                <CheckCircle2 className="size-3" /> 0% Gateway Fee
              </span>
            </div>

            <div className="flex items-center justify-between gap-1.5 text-[11px] text-foreground font-semibold flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-card border border-border/70 text-[10px] shadow-2xs">
                <Smartphone className="size-3 text-purple-600" /> UPI (GPay/PhonePe)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-card border border-border/70 text-[10px] shadow-2xs">
                <CreditCard className="size-3 text-[#f95c4b]" /> Cards
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-card border border-border/70 text-[10px] shadow-2xs">
                <Building className="size-3 text-emerald-600" /> Net Banking
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-card border border-border/70 text-[10px] shadow-2xs">
                <Wallet className="size-3 text-amber-600" /> Wallets
              </span>
            </div>
          </div>

          {/* CTA Pay Button */}
          <Button
            onClick={handlePayNow}
            disabled={isProcessing || cleanPhone.length < 10}
            className="w-full h-12 rounded-2xl brand-gradient hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-[#f95c4b]/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 border-0"
          >
            {isProcessing ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" /> Connecting to Cashfree...
              </span>
            ) : cleanPhone.length < 10 ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                Enter Mobile Number to Pay ₹{effectiveAmount}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Lock className="size-3.5" /> Pay ₹{effectiveAmount} via Cashfree <ArrowRight className="size-3.5" />
              </span>
            )}
          </Button>

          {/* Security Guarantee Footer */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground text-center pt-0.5">
            <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
            <span>256-bit SSL encrypted · Cashfree RBI-authorized payment aggregator</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
