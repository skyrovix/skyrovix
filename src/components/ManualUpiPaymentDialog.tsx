import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  validateCouponServer,
  claimFreeCouponCertificate,
} from "@/lib/fee-service";
import {
  CreditCard,
  CheckCircle2,
  Loader2,
  Tag,
  Sparkles,
  X,
  Shield,
  Zap,
  ArrowRight,
  Smartphone,
  Building,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import { PaymentSummaryDialog } from "@/components/payment/PaymentSummaryDialog";

export interface ManualUpiPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  paymentType: "application" | "certificate";
  amount: number;
  upiId?: string;
  payeeName?: string;
  qrCodeUrl?: string | null;
  applicationId?: string;
  userId: string;
  couponCode?: string | null;
  allowCoupon?: boolean;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess?: () => void;
}

export function ManualUpiPaymentDialog({
  open,
  onOpenChange,
  title,
  description,
  paymentType,
  amount: initialAmount,
  applicationId,
  userId,
  couponCode: defaultCouponCode,
  allowCoupon = true,
  customerName = "Skyrovix Intern",
  customerEmail = "",
  customerPhone = "",
  onSuccess,
}: ManualUpiPaymentDialogProps) {
  const [showCashfreeSummary, setShowCashfreeSummary] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState(defaultCouponCode || "");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: string;
    discountAmount: number;
    finalAmount: number;
  } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const effectiveAmount = appliedCoupon ? appliedCoupon.finalAmount : initialAmount;
  const isFreeClaim = effectiveAmount === 0;

  const displayTitle =
    title || (paymentType === "application" ? "Application Fee Payment" : "Certificate Fee Payment");
  const displayDesc =
    description ||
    (paymentType === "application"
      ? "Complete your application fee payment online to proceed with admin verification and offer letter issuance."
      : "Complete your certificate fee payment online to proceed with official certificate issuance.");

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setValidatingCoupon(true);
    try {
      const res = await validateCouponServer({
        data: {
          code: couponInput.trim(),
          userId,
          applicationId,
          target: paymentType,
        },
      });
      if (res.valid) {
        setAppliedCoupon({
          code: res.code || couponInput.trim(),
          discountType: res.discountType || "fixed",
          discountAmount: res.discountAmount,
          finalAmount: res.finalAmount,
        });
        if (res.finalAmount === 0) {
          toast.success("🎉 100% Free Certificate Waiver applied! No payment required.");
        } else {
          toast.success(`Coupon applied! Saved ₹${res.discountAmount}`);
        }
      } else {
        toast.error(res.error || "Invalid coupon code");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to validate coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };

  const handleFreeClaim = async () => {
    if (!appliedCoupon?.code) {
      toast.error("Coupon code required for free claim");
      return;
    }
    setSubmitting(true);
    const toastId = toast.loading("Claiming your free certificate waiver...");
    try {
      const res = await claimFreeCouponCertificate({
        data: {
          userId,
          applicationId: applicationId!,
          couponCode: appliedCoupon.code,
        },
      });
      toast.success(res.message || "Free certificate waiver claimed successfully!", { id: toastId });
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to claim free certificate", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl rounded-3xl p-0 overflow-hidden bg-card border-border/60 shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-border/30 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl brand-gradient text-white grid place-items-center shadow-lg shadow-[#f95c4b]/20">
              <CreditCard className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground font-display">{displayTitle}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {displayDesc}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* Mandatory Skyrovix Disclaimer */}
          {paymentType === "application" ? (
            <div className="rounded-2xl border border-border/80 bg-muted/30 p-3.5 text-xs text-foreground leading-relaxed shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-bold flex items-center gap-1.5 text-foreground">
                  <Shield className="size-3.5 text-[#f95c4b]" /> Application Processing Fee
                </p>
                <Badge variant="outline" className="bg-[#f95c4b]/10 text-[#f95c4b] border-[#f95c4b]/20 text-[10px] font-bold">
                  Application Processing Fee — Not a Certification Fee
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Application processing fee only. This charge is applicable only to your internship application. It is NOT a certification fee. Certificate charges, if applicable, are separate and are governed by the certificate eligibility and promotional rules.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/80 bg-muted/30 p-3.5 text-xs text-foreground leading-relaxed shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-bold flex items-center gap-1.5 text-foreground">
                  <Shield className="size-3.5 text-[#f95c4b]" /> Certificate Issuance Fee
                </p>
                <Badge variant="outline" className="bg-[#f95c4b]/10 text-[#f95c4b] border-[#f95c4b]/20 text-[10px] font-bold">
                  Official Certificate Verification &amp; Issuance
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Standard certificate issuance fee for verified internship completion. This charge is applicable to applications not covered by promotional certificate waiver offers.
              </p>
            </div>
          )}

          {/* Certificate Coupon Input (Available only after tasks approved) */}
          {paymentType === "certificate" && allowCoupon && (
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-3.5 space-y-2">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Tag className="size-3.5 text-primary" /> Certificate Coupon / Promo Code
              </Label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-2.5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-emerald-600" />
                    <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      {appliedCoupon.code}
                    </span>
                    <Badge className="bg-emerald-600 text-white text-[10px]">
                      {appliedCoupon.discountAmount >= initialAmount ? "100% OFF" : `-₹${appliedCoupon.discountAmount}`}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveCoupon}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-red-500"
                  >
                    <X className="size-3.5 mr-1" /> Remove
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="e.g. SKYROFREE"
                    className="h-9 text-xs font-mono uppercase bg-background"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponInput.trim()}
                    className="h-9 px-4 text-xs font-bold shrink-0"
                  >
                    {validatingCoupon ? <Loader2 className="size-3.5 animate-spin" /> : "Apply"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Amount Due Card */}
          <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-slate-50/60 to-white dark:from-slate-800/40 dark:to-slate-900/40 p-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-display">
                Total Amount Due
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <p className={`text-2xl font-black ${isFreeClaim ? "text-emerald-600 dark:text-emerald-400" : "text-[#f95c4b]"} font-display`}>
                  ₹{effectiveAmount}
                </p>
                {appliedCoupon && appliedCoupon.discountAmount > 0 && (
                  <span className="text-xs text-muted-foreground line-through">
                    ₹{initialAmount}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <Badge className={isFreeClaim ? "bg-emerald-600 text-white" : "brand-gradient text-white border-0 shadow-xs"}>
                {isFreeClaim ? "100% Free Waiver" : "Online Gateway"}
              </Badge>
              {appliedCoupon && appliedCoupon.discountAmount > 0 && (
                <p className="text-[10px] text-emerald-600 font-bold mt-1">
                  Saved ₹{appliedCoupon.discountAmount}!
                </p>
              )}
            </div>
          </div>

          {/* Free Claim Action OR Cashfree Online Payment */}
          {isFreeClaim ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 flex flex-col items-center text-center gap-3">
              <div className="size-14 rounded-full bg-emerald-500/10 text-emerald-600 grid place-items-center">
                <Sparkles className="size-7" />
              </div>
              <div>
                <h4 className="font-bold text-base text-foreground font-display">100% Free Certificate Waiver</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your coupon covers the entire certificate fee. Click below to claim your waiver instantly.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleFreeClaim}
                disabled={submitting}
                className="w-full h-11 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 gap-2 cursor-pointer mt-1"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Claiming Waiver...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" /> Claim Free Certificate Waiver
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#f95c4b]/25 bg-gradient-to-br from-[#f95c4b]/[0.06] via-[#ee9590]/[0.03] to-white dark:to-[#0f172a] p-5 space-y-4 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl brand-gradient text-white flex items-center justify-center shadow-md shadow-[#f95c4b]/20 shrink-0">
                    <Zap className="size-5 fill-current" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#f95c4b] font-display">
                        Automated Gateway
                      </span>
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[9px] px-1.5 py-0 font-bold">Instant Approval</Badge>
                    </div>
                    <h4 className="text-sm font-bold text-foreground font-display">
                      Pay Online via Cashfree
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      UPI (GPay/PhonePe), Cards, Net Banking &amp; Wallets
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => setShowCashfreeSummary(true)}
                  className="w-full sm:w-auto h-10 px-5 rounded-xl brand-gradient hover:opacity-95 text-white font-bold text-xs shadow-md shadow-[#f95c4b]/25 shrink-0 gap-1.5 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 border-0"
                >
                  Pay ₹{effectiveAmount} Now <ArrowRight className="size-3.5" />
                </Button>
              </div>

              {/* Supported Payment Methods Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/30">
                <div className="p-2 rounded-lg bg-background/50 border border-border/30 flex items-center gap-2">
                  <Smartphone className="size-3.5 text-purple-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-foreground truncate">UPI Apps</p>
                    <p className="text-[9px] text-muted-foreground truncate">GPay, PhonePe</p>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-background/50 border border-border/30 flex items-center gap-2">
                  <CreditCard className="size-3.5 text-[#f95c4b] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-foreground truncate">Cards</p>
                    <p className="text-[9px] text-muted-foreground truncate">Debit / Credit</p>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-background/50 border border-border/30 flex items-center gap-2">
                  <Building className="size-3.5 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-foreground truncate">Net Banking</p>
                    <p className="text-[9px] text-muted-foreground truncate">50+ Banks</p>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-background/50 border border-border/30 flex items-center gap-2">
                  <Wallet className="size-3.5 text-amber-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-foreground truncate">Wallets</p>
                    <p className="text-[9px] text-muted-foreground truncate">Paytm &amp; more</p>
                  </div>
                </div>
              </div>

              {/* Security Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="size-3 text-emerald-500" />
                  256-bit SSL encrypted · Cashfree RBI-authorized
                </span>
                <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3" /> Automatic instant approval
                </span>
              </div>
            </div>
          )}
        </div>

        <PaymentSummaryDialog
          open={showCashfreeSummary}
          onOpenChange={setShowCashfreeSummary}
          productType={paymentType}
          productService={paymentType === "application" ? "Skyrovix Application Fee" : "Skyrovix Certificate Fee"}
          amount={initialAmount}
          customerName={customerName}
          customerEmail={customerEmail}
          customerPhone={customerPhone}
          userId={userId}
          applicationId={applicationId}
          couponCode={appliedCoupon?.code || defaultCouponCode || null}
          discountAmount={appliedCoupon?.discountAmount || 0}
          onSuccess={() => {
            onOpenChange(false);
            onSuccess?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
