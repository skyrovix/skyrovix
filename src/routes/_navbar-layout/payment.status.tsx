import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { verifyPaymentOrderServer } from "@/lib/cashfree-service";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  IndianRupee,
  Loader2,
  FileCheck,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BreadcrumbJsonLd } from "@/components/JsonLd";

export const Route = createFileRoute("/_navbar-layout/payment/status")({
  validateSearch: (search: Record<string, unknown>) => ({
    order_id: (search.order_id as string) || "",
  }),
  head: () => ({
    meta: [
      { title: "Payment Status | Skyrovix" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PaymentStatusPage,
});

function PaymentStatusPage() {
  const { order_id } = useSearch({ from: "/_navbar-layout/payment/status" });

  const [loading, setLoading] = useState(true);
  const [verifyingText, setVerifyingText] = useState("Connecting to Cashfree to verify payment...");
  const [status, setStatus] = useState<"PAID" | "PENDING" | "FAILED" | "CANCELLED" | "ERROR">("PENDING");
  const [order, setOrder] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const verifyOrder = async (isManualRefresh = false) => {
    if (!order_id) {
      setLoading(false);
      setStatus("ERROR");
      setErrorMessage("No Order ID provided in payment return URL.");
      return;
    }

    if (isManualRefresh) {
      setLoading(true);
      setVerifyingText("Re-checking status with Cashfree...");
    }

    try {
      const res = await verifyPaymentOrderServer({
        data: { orderId: order_id },
      });

      if (res.success && res.order) {
        setOrder(res.order);
        const st = (res.status || "").toUpperCase();
        if (st === "PAID" || st === "SUCCESS") {
          setStatus("PAID");
        } else if (st === "CANCELLED" || st === "USER_DROPPED") {
          setStatus("CANCELLED");
        } else if (st === "FAILED" || st === "EXPIRED") {
          setStatus("FAILED");
        } else {
          setStatus("PENDING");
        }
      } else {
        setStatus("PENDING");
      }
    } catch (err: any) {
      console.error("[Payment Status Verification Error]:", err);
      if (isManualRefresh) {
        toast.error(err.message || "Failed to verify payment status");
      }
      setErrorMessage(err.message || "An unexpected error occurred during verification.");
      setStatus("ERROR");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyOrder();
  }, [order_id]);

  const copyOrderId = () => {
    if (order_id) {
      navigator.clipboard.writeText(order_id);
      toast.success("Order ID copied to clipboard!");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.skyrovix.online/" },
          { name: "Payment Status", url: "https://www.skyrovix.online/payment/status" },
        ]}
      />

      <div className="w-full max-w-lg">
        {loading ? (
          <div className="rounded-3xl border border-border/60 bg-white/80 dark:bg-[#0f172a]/80 p-8 sm:p-12 text-center shadow-xl backdrop-blur space-y-4">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#f95c4b]/10 text-[#f95c4b]">
              <Loader2 className="size-8 animate-spin" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Verifying Your Payment</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">{verifyingText}</p>
            <p className="text-xs text-muted-foreground/70">
              Please do not close or refresh this page.
            </p>
          </div>
        ) : status === "PAID" ? (
          /* SUCCESS STATE */
          <div className="rounded-3xl border border-emerald-500/30 bg-white/90 dark:bg-[#0f172a]/90 p-8 sm:p-10 shadow-2xl backdrop-blur relative overflow-hidden">
            <div className="absolute -top-12 -right-12 size-36 rounded-full bg-emerald-500/10 blur-2xl" />

            <div className="text-center space-y-3">
              <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-inner">
                <CheckCircle2 className="size-9" />
              </div>
              <span className="inline-block rounded-full bg-emerald-100 dark:bg-emerald-950/50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                Payment Successful &amp; Verified
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Thank You!
              </h1>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Your payment has been securely confirmed via Cashfree Payment Gateway.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="mt-8 rounded-2xl border border-border/60 bg-slate-50 dark:bg-slate-900/60 p-5 space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-border/40 pb-2.5">
                <span className="text-muted-foreground">Order ID:</span>
                <span
                  onClick={copyOrderId}
                  className="font-mono font-semibold text-foreground flex items-center gap-1 cursor-pointer hover:text-[#f95c4b]"
                  title="Click to copy"
                >
                  {order_id} <Copy className="size-3 text-muted-foreground" />
                </span>
              </div>

              {order?.cashfree_payment_id && (
                <div className="flex justify-between items-center border-b border-border/40 pb-2.5">
                  <span className="text-muted-foreground">Cashfree Ref ID:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {order.cashfree_payment_id}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center border-b border-border/40 pb-2.5">
                <span className="text-muted-foreground">Product / Service:</span>
                <span className="font-semibold text-foreground">{order?.product_service || "Certificate Fee"}</span>
              </div>

              <div className="flex justify-between items-center pt-1 text-sm font-bold">
                <span className="text-foreground">Amount Paid:</span>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center text-base">
                  <IndianRupee className="size-4 inline" />
                  {order?.amount ?? 100}
                </span>
              </div>
            </div>

            {/* Next Steps Buttons */}
            <div className="mt-8 space-y-3">
              <Button asChild size="lg" className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25">
                <Link to="/dashboard">
                  <FileCheck className="size-4 mr-2" />
                  {order?.product_type === "premium_plan"
                    ? "Go to Premium Dashboard & Get Started"
                    : order?.product_type === "application"
                    ? "Go to Dashboard & View Offer Letter"
                    : "Go to Dashboard & Claim Certificate"}
                </Link>
              </Button>

              <Button asChild variant="outline" size="sm" className="w-full h-10 rounded-xl border-border/60 text-xs">
                <Link to="/contact">Need Help or Invoice Copy?</Link>
              </Button>
            </div>
          </div>
        ) : status === "PENDING" ? (
          /* PENDING STATE */
          <div className="rounded-3xl border border-amber-500/30 bg-white/90 dark:bg-[#0f172a]/90 p-8 sm:p-10 shadow-2xl backdrop-blur relative overflow-hidden">
            <div className="text-center space-y-3">
              <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Clock className="size-9" />
              </div>
              <span className="inline-block rounded-full bg-amber-100 dark:bg-amber-950/50 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                Payment Under Processing
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Awaiting Bank Confirmation
              </h1>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Your payment is currently being authorized by your bank. This typically takes 30–60 seconds.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-border/60 bg-slate-50 dark:bg-slate-900/60 p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono font-semibold">{order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-semibold text-amber-600">Pending Authorization</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Button
                onClick={() => verifyOrder(true)}
                size="lg"
                className="w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm"
              >
                <RotateCcw className="size-4 mr-2" /> Refresh Payment Status
              </Button>

              <Button asChild variant="outline" size="sm" className="w-full h-10 rounded-xl border-border/60 text-xs">
                <Link to="/dashboard">Return to Dashboard</Link>
              </Button>
            </div>
          </div>
        ) : (
          /* FAILED OR CANCELLED STATE */
          <div className="rounded-3xl border border-rose-500/30 bg-white/90 dark:bg-[#0f172a]/90 p-8 sm:p-10 shadow-2xl backdrop-blur relative overflow-hidden">
            <div className="text-center space-y-3">
              <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <XCircle className="size-9" />
              </div>
              <span className="inline-block rounded-full bg-rose-100 dark:bg-rose-950/50 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300">
                {status === "CANCELLED" ? "Payment Cancelled" : "Payment Incomplete / Failed"}
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {status === "CANCELLED" ? "Transaction Cancelled" : "Payment Did Not Complete"}
              </h1>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {errorMessage ||
                  (status === "CANCELLED"
                    ? "You closed or cancelled the checkout session before completing payment. No money was debited."
                    : "The payment attempt was declined or timed out by the bank. If money was debited, it will be refunded automatically by your bank within 24–48 hours.")}
              </p>
            </div>

            {order_id && (
              <div className="mt-6 rounded-2xl border border-border/60 bg-slate-50 dark:bg-slate-900/60 p-4 text-xs flex justify-between">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono font-semibold">{order_id}</span>
              </div>
            )}

            <div className="mt-8 space-y-3">
              <Button asChild size="lg" className="w-full h-12 rounded-xl brand-gradient hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-[#f95c4b]/25 border-0">
                <Link to="/dashboard">
                  <RotateCcw className="size-4 mr-2" /> Return to Dashboard &amp; Try Again
                </Link>
              </Button>

              <Button asChild variant="outline" size="sm" className="w-full h-10 rounded-xl border-border/60 text-xs">
                <Link to="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
