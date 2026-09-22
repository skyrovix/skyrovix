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
  productType: "certificate" | "application" | "course" | "custom";
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
      <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400" />

        {/* Modal Header */}
        <div className="px-6 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Zap className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-extrabold text-foreground tracking-tight">
                  Payment Summary
                </DialogTitle>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="size-3 text-emerald-500 shrink-0" />
                  Official Cashfree Checkout
                </p>
              </div>
            </div>

            <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 text-[10px] font-bold">
              Instant Approval
            </Badge>
          </div>
        </div>

        {/* Amount & Product Hero Banner */}
        <div className="bg-slate-50 dark:bg-slate-800/40 border-y border-slate-100 dark:border-slate-800/80 px-6 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
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
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
              Total Due
            </span>
            <div className="flex items-baseline justify-end gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-display">
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
                Mobile Number <span className="text-red-500">*</span>
              </Label>
              <span className="text-[10px] text-muted-foreground">For UPI &amp; Bank OTP</span>
            </div>

            <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus-within:border-blue-600 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all overflow-hidden">
              <div className="px-3 py-2.5 text-xs font-bold font-mono text-muted-foreground border-r border-slate-200 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-800 select-none flex items-center gap-1">
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
                className="border-0 bg-transparent h-10 text-xs sm:text-sm font-mono tracking-wider font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 px-3 placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-foreground/60"
                disabled={isProcessing}
              />
              {cleanPhone.length === 10 && (
                <div className="pr-3 text-emerald-500 shrink-0">
                  <CheckCircle2 className="size-4" />
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods Pill Row */}
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                Supported Payment Modes
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                <CheckCircle2 className="size-3" /> 0% Gateway Fee
              </span>
            </div>

            <div className="flex items-center justify-between gap-1 text-[11px] text-foreground font-semibold flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-[10px]">
                <Smartphone className="size-3 text-purple-600" /> UPI (GPay/PhonePe)
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-[10px]">
                <CreditCard className="size-3 text-blue-600" /> Cards
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-[10px]">
                <Building className="size-3 text-emerald-600" /> Net Banking
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-[10px]">
                <Wallet className="size-3 text-amber-600" /> Wallets
              </span>
            </div>
          </div>

          {/* CTA Pay Button */}
          <Button
            onClick={handlePayNow}
            disabled={isProcessing || cleanPhone.length < 10}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
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
