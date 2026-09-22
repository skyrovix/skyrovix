import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_navbar-layout/payment/processing")({
  validateSearch: (search: Record<string, unknown>) => ({
    order_id: (search.order_id as string) || "",
  }),
  head: () => ({
    meta: [
      { title: "Processing Payment | Skyrovix" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PaymentProcessingPage,
});

function PaymentProcessingPage() {
  const { order_id } = useSearch({ from: "/_navbar-layout/payment/processing" });

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md rounded-3xl border border-blue-500/30 bg-white/90 dark:bg-[#0f172a]/90 p-8 sm:p-10 shadow-2xl backdrop-blur text-center relative overflow-hidden">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-4">
          <Loader2 className="size-8 animate-spin" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Processing Payment
        </h1>

        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Please wait while we communicate with Cashfree and your bank. Do not refresh or press back.
        </p>

        {order_id && (
          <div className="mt-6 rounded-2xl border border-border/60 bg-slate-50 dark:bg-slate-900/60 p-3.5 text-xs text-left">
            <span className="text-muted-foreground">Order ID:</span>
            <span className="font-mono font-bold text-foreground block mt-0.5">{order_id}</span>
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-emerald-500" />
          <span>256-bit SSL encrypted connection</span>
        </div>
      </div>
    </div>
  );
}
