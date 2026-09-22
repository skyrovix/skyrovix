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
          <div className="size-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white grid place-items-center shadow-md shadow-blue-500/20">
            <CreditCard className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-primary font-display">
                {isAppPayment ? "APPLICATION FEE" : "CERTIFICATE FEE"}
              </span>
              <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
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

        <div className="flex items-baseline gap-1.5 self-start sm:self-auto bg-primary/5 dark:bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Amount Due:</span>
          <span className="text-2xl font-black text-foreground">₹{amount}</span>
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
        <div className="rounded-2xl border border-blue-200/80 bg-blue-50/80 dark:border-blue-900/40 dark:bg-blue-950/40 p-4 text-xs text-blue-900 dark:text-blue-200 leading-relaxed shadow-sm space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-bold flex items-center gap-1.5 text-blue-800 dark:text-blue-300">
              <Shield className="size-4" /> Application Processing Fee
            </p>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 border-blue-300 text-[10px] font-bold">
              {APPLICATION_FEE_BADGE}
            </Badge>
          </div>
          <p className="text-xs leading-relaxed opacity-95">
            {APPLICATION_FEE_DISCLAIMER}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/80 dark:border-indigo-900/40 dark:bg-indigo-950/40 p-4 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed shadow-sm space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-bold flex items-center gap-1.5 text-indigo-800 dark:text-indigo-300">
              <Shield className="size-4" /> CERTIFICATE ISSUANCE FEE
            </p>
            <Badge variant="outline" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200 border-indigo-300 text-[10px] font-bold">
              Official Certificate Verification
            </Badge>
          </div>
          <p className="text-xs leading-relaxed opacity-95">
            This fee applies to applications that are not covered by the Certificate Free Offer.
          </p>
        </div>
      )}

      {/* Online Payment Card via Cashfree */}
      <div className="rounded-3xl border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-white dark:to-slate-900/40 p-6 sm:p-8 space-y-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
              <Zap className="size-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Instant Payment Gateway
                </span>
                <Badge className="bg-emerald-600 text-white text-[10px]">Instant Verification</Badge>
              </div>
              <h4 className="text-xl font-extrabold text-foreground">
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
            className="w-full md:w-auto h-12 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-blue-500/25 shrink-0 gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
          >
            Pay ₹{amount} Now <ArrowRight className="size-4" />
          </Button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/40">
          <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-border/40 flex items-center gap-2.5">
            <Smartphone className="size-4 text-purple-600 shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-foreground">UPI Apps</p>
              <p className="text-[10px] text-muted-foreground">GPay, PhonePe, Paytm</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-border/40 flex items-center gap-2.5">
            <CreditCard className="size-4 text-blue-600 shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-foreground">Cards</p>
              <p className="text-[10px] text-muted-foreground">Visa, Mastercard, RuPay</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-border/40 flex items-center gap-2.5">
            <Building className="size-4 text-emerald-600 shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-foreground">Net Banking</p>
              <p className="text-[10px] text-muted-foreground">50+ Indian Banks</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-border/40 flex items-center gap-2.5">
            <Wallet className="size-4 text-amber-600 shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-foreground">Wallets</p>
              <p className="text-[10px] text-muted-foreground">Paytm, Mobikwik &amp; more</p>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-muted-foreground">
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
