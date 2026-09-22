import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Clock, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_navbar-layout/payment/pending")({
  validateSearch: (search: Record<string, unknown>) => ({
    order_id: (search.order_id as string) || "",
  }),
  head: () => ({
    meta: [
      { title: "Payment Pending | Skyrovix" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PaymentPendingPage,
});

function PaymentPendingPage() {
  const { order_id } = useSearch({ from: "/_navbar-layout/payment/pending" });

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md rounded-3xl border border-amber-500/30 bg-white/90 dark:bg-[#0f172a]/90 p-8 sm:p-10 shadow-2xl backdrop-blur text-center relative overflow-hidden">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mb-4">
          <Clock className="size-9" />
        </div>

        <span className="inline-block rounded-full bg-amber-100 dark:bg-amber-950/50 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 mb-2">
          Bank Processing
        </span>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Payment is Pending
        </h1>

        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Your payment authorization is currently being completed by the bank. Once confirmed, your records will update automatically.
        </p>

        {order_id && (
          <div className="mt-6 rounded-2xl border border-border/60 bg-slate-50 dark:bg-slate-900/60 p-3.5 text-xs text-left">
            <span className="text-muted-foreground">Order Reference:</span>
            <span className="font-mono font-bold text-foreground block mt-0.5">{order_id}</span>
          </div>
        )}

        <div className="mt-8 space-y-3">
          <Button asChild size="lg" className="w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-lg shadow-amber-600/25">
            <Link to="/payment/status" search={{ order_id }}>
              <RotateCcw className="size-4 mr-2" /> Check Live Status
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="w-full h-10 rounded-xl border-border/60 text-xs">
            <Link to="/dashboard">
              <Home className="size-3.5 mr-1.5" /> Return to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
