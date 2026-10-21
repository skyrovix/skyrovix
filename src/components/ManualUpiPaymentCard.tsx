import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  APPLICATION_FEE_DISCLAIMER,
  APPLICATION_FEE_BADGE,
} from "@/lib/fee-helpers";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Shield,
  ArrowRight,
  Sparkles,
  Zap,
  Lock,
  Smartphone,
  Building,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import { PaymentSummaryDialog } from "@/components/payment/PaymentSummaryDialog";

export interface ManualUpiPaymentCardProps {
  paymentType: "application" | "certificate";
  amount: number;
  upiId?: string;
  payeeName?: string;
  qrCodeUrl?: string | null;
  applicationId: string;
  userId: string;
  adminNote?: string | null;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess?: () => void;
}

export function ManualUpiPaymentCard({
  paymentType,
  amount,
  applicationId,
  userId,
  adminNote,
  customerName = "Skyrovix Intern",
  customerEmail = "",
  customerPhone = "",
  onSuccess,
}: ManualUpiPaymentCardProps) {
  const [showCashfreeSummary, setShowCashfreeSummary] = useState(false);

  const isAppPayment = paymentType === "application";

  return (
    <div className="rounded-3xl border border-border/60 bg-white/80 dark:bg-[#0f172a]/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
      {/* Header & Amount */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="size-12 rounded-2xl brand-gradient text-white grid place-items-center shadow-lg shadow-[#f95c4b]/20 shrink-0">
            <CreditCard className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#f95c4b] font-display">
                {isAppPayment ? "APPLICATION FEE" : "CERTIFICATE FEE"}
              </span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                Online Payment
              </Badge>
            </div>
            <h3 className="font-display text-xl font-extrabold text-foreground mt-0.5">
              {isAppPayment ? "Application Processing Fee" : "Certificate Issuance Fee"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isAppPayment
                ? `Application Processing Fee: ₹${amount}`
                : `Certificate Issuance Fee: ₹${amount}`}
            </p>
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 self-start sm:self-auto bg-[#f95c4b]/5 dark:bg-[#f95c4b]/10 px-4 py-2 rounded-2xl border border-[#f95c4b]/20">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-display">Amount Due:</span>
          <span className="text-2xl font-black text-[#f95c4b] font-display">₹{amount}</span>
        </div>
      </div>

      {/* Admin Resubmission / Rejection Note if present */}
      {adminNote && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-950/30 p-4 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
            <AlertCircle className="size-4 shrink-0 text-amber-600" />
            <span>Admin Review Note:</span>
          </div>
          <p className="text-amber-800 dark:text-amber-300 pl-6 leading-relaxed">
            &ldquo;{adminNote}&rdquo;
          </p>
        </div>
      )}

      {/* Mandatory Dynamic Disclaimer */}
      {isAppPayment ? (
        <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 text-xs text-foreground leading-relaxed shadow-xs space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-bold flex items-center gap-1.5 text-foreground">
              <Shield className="size-4 text-[#f95c4b]" /> Application Processing Fee
            </p>
            <Badge variant="outline" className="bg-[#f95c4b]/10 text-[#f95c4b] border-[#f95c4b]/20 text-[10px] font-bold">
              {APPLICATION_FEE_BADGE}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {APPLICATION_FEE_DISCLAIMER}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 text-xs text-foreground leading-relaxed shadow-xs space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-bold flex items-center gap-1.5 text-foreground">
              <Shield className="size-4 text-[#f95c4b]" /> CERTIFICATE ISSUANCE FEE
            </p>
            <Badge variant="outline" className="bg-[#f95c4b]/10 text-[#f95c4b] border-[#f95c4b]/20 text-[10px] font-bold">
              Official Certificate Verification
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This fee applies to applications that are not covered by the Certificate Free Offer.
          </p>
        </div>
      )}

      {/* Online Payment Card via Cashfree */}
      <div className="rounded-3xl border border-[#f95c4b]/25 bg-gradient-to-br from-[#f95c4b]/[0.06] via-[#ee9590]/[0.03] to-white dark:to-[#0f172a] p-6 sm:p-8 space-y-6 shadow-xl shadow-[#f95c4b]/5 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 size-48 rounded-full bg-[#f95c4b]/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="size-14 rounded-2xl brand-gradient text-white flex items-center justify-center shadow-lg shadow-[#f95c4b]/25 shrink-0">
              <Zap className="size-7 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black uppercase tracking-wider text-[#f95c4b] font-display">
                  Instant Payment Gateway
                </span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                  Instant Verification
                </Badge>
              </div>
              <h4 className="text-xl font-extrabold text-foreground font-display">
                Pay Online with Cashfree
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-lg leading-relaxed">
                Pay securely using any UPI app (GPay, PhonePe, Paytm), Debit/Credit Card, Net Banking, or Wallet. Your certificate unlocks automatically upon payment.
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => setShowCashfreeSummary(true)}
            size="lg"
            className="w-full md:w-auto h-12 px-8 rounded-2xl brand-gradient hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-[#f95c4b]/25 shrink-0 gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 border-0"
          >
            Pay ₹{amount} Now <ArrowRight className="size-4" />
          </Button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/40 relative z-10">
          <div className="p-3 rounded-2xl bg-card/80 border border-border/60 flex items-center gap-2.5 shadow-2xs">
            <Smartphone className="size-4 text-purple-600 shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-foreground">UPI Apps</p>
              <p className="text-[10px] text-muted-foreground">GPay, PhonePe, Paytm</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-card/80 border border-border/60 flex items-center gap-2.5 shadow-2xs">
            <CreditCard className="size-4 text-[#f95c4b] shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-foreground">Cards</p>
              <p className="text-[10px] text-muted-foreground">Visa, Mastercard, RuPay</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-card/80 border border-border/60 flex items-center gap-2.5 shadow-2xs">
            <Building className="size-4 text-emerald-600 shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-foreground">Net Banking</p>
              <p className="text-[10px] text-muted-foreground">50+ Indian Banks</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-card/80 border border-border/60 flex items-center gap-2.5 shadow-2xs">
            <Wallet className="size-4 text-amber-600 shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-foreground">Wallets</p>
              <p className="text-[10px] text-muted-foreground">Paytm, Mobikwik &amp; more</p>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-muted-foreground relative z-10">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            256-bit SSL encrypted · Cashfree RBI-authorized payment aggregator
          </span>
          <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-3.5" /> No manual receipt upload required
          </span>
        </div>
      </div>

      <PaymentSummaryDialog
        open={showCashfreeSummary}
        onOpenChange={setShowCashfreeSummary}
        productType={paymentType}
        productService={isAppPayment ? "Skyrovix Application Fee" : "Skyrovix Certificate Fee"}
        amount={amount}
        customerName={customerName}
        customerEmail={customerEmail}
        customerPhone={customerPhone}
        userId={userId}
        applicationId={applicationId}
        onSuccess={onSuccess}
      />
    </div>
  );
}
