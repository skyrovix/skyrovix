import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAdminCashfreeOrdersServer,
  syncCashfreeOrderAdminServer,
  type CashfreeOrderRecord,
} from "@/lib/cashfree-service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  RefreshCw,
  Copy,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  IndianRupee,
  CreditCard,
  Smartphone,
  Building,
  Wallet,
  Zap,
} from "lucide-react";

interface CashfreeOrdersAdminSectionProps {
  adminId: string;
}

export function CashfreeOrdersAdminSection({ adminId }: CashfreeOrdersAdminSectionProps) {
  const qc = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<CashfreeOrderRecord | null>(null);
  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-cashfree-orders", adminId, statusFilter, searchQuery],
    queryFn: async () => {
      return getAdminCashfreeOrdersServer({
        data: {
          adminId,
          statusFilter,
          searchQuery,
          limit: 100,
          offset: 0,
        },
      });
    },
    enabled: Boolean(adminId),
  });

  const orders = data?.orders || [];
  const stats = data?.stats || {
    paid_count: 0,
    total_paid_amount: 0,
    pending_count: 0,
    failed_count: 0,
    total_orders: 0,
  };

  const syncMutation = useMutation({
    mutationFn: async (orderId: string) => {
      setSyncingOrderId(orderId);
      return syncCashfreeOrderAdminServer({
        data: { adminId, orderId },
      });
    },
    onSuccess: (res) => {
      toast.success(`Order ${res.orderId} updated: Status is now ${res.status}`);
      qc.invalidateQueries({ queryKey: ["admin-cashfree-orders"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to sync order with Cashfree");
    },
    onSettled: () => {
      setSyncingOrderId(null);
    },
  });

  const copyText = (txt: string, label: string) => {
    navigator.clipboard.writeText(txt);
    toast.success(`${label} copied to clipboard!`);
  };

  const renderStatusBadge = (status: string) => {
    const st = (status || "").toUpperCase();
    if (st === "PAID" || st === "SUCCESS") {
      return (
        <Badge className="bg-emerald-600 text-white font-bold text-[10px] gap-1">
          <CheckCircle2 className="size-3" /> PAID
        </Badge>
      );
    }
    if (st === "PENDING" || st === "CREATED") {
      return (
        <Badge className="bg-amber-600 text-white font-bold text-[10px] gap-1">
          <Clock className="size-3" /> PENDING
        </Badge>
      );
    }
    if (st === "CANCELLED" || st === "USER_DROPPED") {
      return (
        <Badge variant="outline" className="border-slate-400 text-slate-600 dark:text-slate-400 font-bold text-[10px] gap-1">
          <AlertCircle className="size-3" /> CANCELLED
        </Badge>
      );
    }
    return (
      <Badge className="bg-rose-600 text-white font-bold text-[10px] gap-1">
        <XCircle className="size-3" /> FAILED
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/50 shadow-sm bg-card/80 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Collected</p>
            <Zap className="size-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            ₹{Number(stats.total_paid_amount || 0).toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Across all Cashfree verified payments</p>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm bg-card/80 p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Paid Orders</p>
          <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
            {stats.paid_count || 0}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Successful transactions</p>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm bg-card/80 p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Orders</p>
          <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
            {stats.pending_count || 0}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Awaiting checkout completion</p>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm bg-card/80 p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Failed / Cancelled</p>
          <p className="text-3xl font-extrabold text-slate-500 mt-2">
            {stats.failed_count || 0}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Declined or closed by user</p>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="rounded-2xl border-border/50 shadow-sm bg-card/80 p-4">
        <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
          <div className="relative w-full md:w-80">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Order ID, Name, Email, Phone..."
              className="pl-9 h-10 rounded-xl text-xs bg-background/50 border-border/60"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-muted-foreground">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-xl text-xs bg-background border border-border/60 px-3 font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Orders</option>
                <option value="PAID">Paid / Success</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="rounded-xl h-9 gap-1.5 border-border/60 text-xs"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="rounded-2xl border-border/50 shadow-sm bg-card/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border/50 text-muted-foreground uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Product / Service</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Cashfree Ref</th>
                <th className="p-4">Date &amp; Time</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    <RefreshCw className="size-5 animate-spin mx-auto mb-2 text-primary" />
                    Loading Cashfree transactions...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    No Cashfree orders found matching current filter.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                    {/* Order ID */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-foreground">{o.order_id}</span>
                        <button
                          onClick={() => copyText(o.order_id, "Order ID")}
                          className="text-muted-foreground hover:text-foreground"
                          title="Copy Order ID"
                        >
                          <Copy className="size-3" />
                        </button>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {o.product_type}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="p-4">
                      <p className="font-bold text-foreground">{o.customer_name}</p>
                      <p className="text-[11px] text-muted-foreground">{o.customer_email}</p>
                      {o.customer_phone && (
                        <p className="text-[10px] text-muted-foreground font-mono">{o.customer_phone}</p>
                      )}
                    </td>

                    {/* Product */}
                    <td className="p-4">
                      <p className="font-medium text-foreground max-w-[200px] truncate" title={o.product_service}>
                        {o.product_service}
                      </p>
                      {o.coupon_code && (
                        <span className="text-[10px] text-emerald-600 font-bold">
                          Coupon: {o.coupon_code} (-₹{o.discount_amount})
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="p-4">
                      <span className="font-extrabold text-foreground text-sm flex items-center">
                        <IndianRupee className="size-3 inline" />
                        {o.amount}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4">{renderStatusBadge(o.payment_status)}</td>

                    {/* Cashfree Ref */}
                    <td className="p-4 font-mono text-[11px]">
                      {o.cashfree_payment_id ? (
                        <span className="text-foreground font-semibold">{o.cashfree_payment_id}</span>
                      ) : o.cf_order_id ? (
                        <span className="text-muted-foreground">CF #{o.cf_order_id}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="p-4 text-muted-foreground text-[11px]">
                      {new Date(o.created_at).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-1 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedOrder(o)}
                        className="h-8 px-2 text-xs"
                        title="View Full Details"
                      >
                        <Eye className="size-3.5 mr-1" /> View
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => syncMutation.mutate(o.order_id)}
                        disabled={syncingOrderId === o.order_id}
                        className="h-8 px-2.5 text-xs rounded-lg border-border/60"
                        title="Sync latest status from Cashfree API"
                      >
                        <RefreshCw
                          className={`size-3 mr-1 ${syncingOrderId === o.order_id ? "animate-spin text-primary" : ""}`}
                        />
                        Sync
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Details Dialog */}
      {selectedOrder && (
        <Dialog open={Boolean(selectedOrder)} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-lg rounded-2xl border-border/60 bg-white dark:bg-[#0f172a] shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Cashfree Order Details</DialogTitle>
              <DialogDescription className="text-xs">
                Detailed transaction parameters and server records
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs pt-2">
              <div className="rounded-xl border border-border/60 bg-slate-50 dark:bg-slate-900/50 p-4 space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-mono font-bold">{selectedOrder.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span>{renderStatusBadge(selectedOrder.payment_status)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-bold text-foreground">₹{selectedOrder.amount} {selectedOrder.currency}</span>
                </div>
                {selectedOrder.cashfree_payment_id && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cashfree Payment ID:</span>
                    <span className="font-mono font-bold">{selectedOrder.cashfree_payment_id}</span>
                  </div>
                )}
                {selectedOrder.payment_method && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="font-semibold">{selectedOrder.payment_method}</span>
                  </div>
                )}
                {selectedOrder.payment_time && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Time:</span>
                    <span>{new Date(selectedOrder.payment_time).toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>

              {/* Customer info */}
              <div className="rounded-xl border border-border/60 bg-slate-50 dark:bg-slate-900/50 p-4 space-y-2">
                <h4 className="font-bold text-foreground">Customer Information</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium text-foreground">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium text-foreground">{selectedOrder.customer_email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium text-foreground">{selectedOrder.customer_phone}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Product Type:</span>
                    <p className="font-medium text-foreground uppercase">{selectedOrder.product_type}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  onClick={() => {
                    syncMutation.mutate(selectedOrder.order_id);
                    setSelectedOrder(null);
                  }}
                  className="rounded-xl h-9 text-xs"
                >
                  <RefreshCw className="size-3.5 mr-1" /> Re-verify with Cashfree
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-xl h-9 text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
