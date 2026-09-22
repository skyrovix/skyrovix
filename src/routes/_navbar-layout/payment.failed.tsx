import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { XCircle, RotateCcw, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_navbar-layout/payment/failed")({
  validateSearch: (search: Record<string, unknown>) => ({
    order_id: (search.order_id as string) || "",
    reason: (search.reason as string) || "",
  }),
  head: () => ({
    meta: [
      { title: "Payment Failed | Skyrovix" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PaymentFailedPage,
});

function PaymentFailedPage() {
  const { order_id, reason } = useSearch({ from: "/_navbar-layout/payment/failed" });

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-white/90 dark:bg-[#0f172a]/90 p-8 sm:p-10 shadow-2xl backdrop-blur text-center relative overflow-hidden">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mb-4">
          <XCircle className="size-9" />
        </div>

        <span className="inline-block rounded-full bg-rose-100 dark:bg-rose-950/50 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300 mb-2">
          Payment Not Completed
        </span>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Transaction Incomplete
        </h1>

        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {reason === "cancelled"
            ? "The payment session was closed before completion. If your account was debited, the amount will be automatically reversed by your bank."
            : "The payment attempt could not be processed. You can try again using UPI, Debit/Credit Card, or Net Banking."}
        </p>

        {order_id && (
          <div className="mt-6 rounded-2xl border border-border/60 bg-slate-50 dark:bg-slate-900/60 p-3.5 text-xs text-left">
            <span className="text-muted-foreground">Order Reference:</span>
            <span className="font-mono font-bold text-foreground block mt-0.5">{order_id}</span>
          </div>
        )}

        <div className="mt-8 space-y-3">
          <Button asChild size="lg" className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25">
            <Link to="/dashboard">
              <RotateCcw className="size-4 mr-2" /> Return to Dashboard &amp; Try Again
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="w-full h-10 rounded-xl border-border/60 text-xs">
            <Link to="/contact">
              <MessageSquare className="size-3.5 mr-1.5" /> Need Assistance?
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
