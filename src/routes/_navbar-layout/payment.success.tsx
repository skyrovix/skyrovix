import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { CheckCircle2, FileCheck, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_navbar-layout/payment/success")({
  validateSearch: (search: Record<string, unknown>) => ({
    order_id: (search.order_id as string) || "",
  }),
  head: () => ({
    meta: [
      { title: "Payment Successful | Skyrovix" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PaymentSuccessPage,
});

function PaymentSuccessPage() {
  const { order_id } = useSearch({ from: "/_navbar-layout/payment/success" });

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md rounded-3xl border border-emerald-500/30 bg-white/90 dark:bg-[#0f172a]/90 p-8 sm:p-10 shadow-2xl backdrop-blur text-center relative overflow-hidden">
        <div className="absolute -top-12 -right-12 size-36 rounded-full bg-emerald-500/10 blur-2xl" />

        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-4">
          <CheckCircle2 className="size-9" />
        </div>

        <span className="inline-block rounded-full bg-emerald-100 dark:bg-emerald-950/50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
          Verified Online Payment
        </span>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Payment Successful!
        </h1>

        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Your payment was processed and verified via Cashfree Payment Gateway. Your internship certificate and records have been unlocked.
        </p>

        {order_id && (
          <div className="mt-6 rounded-2xl border border-border/60 bg-slate-50 dark:bg-slate-900/60 p-3.5 text-xs text-left">
            <span className="text-muted-foreground">Order ID:</span>
            <span className="font-mono font-bold text-foreground block mt-0.5">{order_id}</span>
          </div>
        )}

        <div className="mt-8 space-y-3">
          <Button asChild size="lg" className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25">
            <Link to="/dashboard">
              <FileCheck className="size-4 mr-2" /> Go to Dashboard &amp; Claim Certificate
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="w-full h-10 rounded-xl border-border/60 text-xs">
            <Link to="/contact">Need an Invoice Copy?</Link>
          </Button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="size-3.5 text-emerald-500" />
          <span>Instant verification · Safe &amp; Secure</span>
        </div>
      </div>
    </div>
  );
}
