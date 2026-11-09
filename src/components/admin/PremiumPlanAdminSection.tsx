import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAdminPremiumPayments,
  updateAdminPremiumPayment,
  getAdminPremiumCoupons,
  createAdminPremiumCoupon,
  type AdminPremiumPaymentRecord,
} from "@/lib/admin-service";
import { toggleCouponAdmin, deleteCouponAdmin } from "@/lib/fee-service";
import {
  Crown,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Tag,
  Search,
  RefreshCw,
  Gift,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Percent,
  Plus,
  Trash2,
  Copy,
  Users,
  Eye,
  CreditCard,
  Building,
  Filter,
  Loader2,
  Calendar,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PremiumPlanAdminSectionProps {
  adminId: string;
}

export function PremiumPlanAdminSection({ adminId }: PremiumPlanAdminSectionProps) {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"payments" | "coupons">("payments");

  // Payments Tab States
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "cashfree" | "manual" | "free" | "offer_discount" | "pending">("all");

  // Manual Pay Modal State
  const [manualPayTarget, setManualPayTarget] = useState<AdminPremiumPaymentRecord | null>(null);
  const [manualAmount, setManualAmount] = useState<number>(200);
  const [manualMethod, setManualMethod] = useState<string>("manual_upi");
  const [manualUtr, setManualUtr] = useState<string>("");
  const [manualNotes, setManualNotes] = useState<string>("");
  const [submittingManual, setSubmittingManual] = useState(false);

  // Free Grant Modal State
  const [freeGrantTarget, setFreeGrantTarget] = useState<AdminPremiumPaymentRecord | null>(null);
  const [freeNotes, setFreeNotes] = useState<string>("100% Free Premium access granted by Admin");
  const [submittingFree, setSubmittingFree] = useState(false);

  // Custom Offer Modal State
  const [customOfferTarget, setCustomOfferTarget] = useState<AdminPremiumPaymentRecord | null>(null);
  const [offerDiscount, setOfferDiscount] = useState<number>(50);
  const [submittingOffer, setSubmittingOffer] = useState(false);

  // Revert Modal State
  const [revertTarget, setRevertTarget] = useState<AdminPremiumPaymentRecord | null>(null);
  const [submittingRevert, setSubmittingRevert] = useState(false);

  // Create Coupon Modal State
  const [createCouponOpen, setCreateCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponDesc, setCouponDesc] = useState("");
  const [discountType, setDiscountType] = useState<"fixed" | "percentage" | "free">("fixed");
  const [discountValue, setDiscountValue] = useState<number>(50);
  const [usageLimit, setUsageLimit] = useState<number>(0);
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [submittingCoupon, setSubmittingCoupon] = useState(false);

  // 1. Fetch Premium Payments data
  const { data: paymentsData, isLoading: loadingPayments, isFetching: fetchingPayments, refetch: refetchPayments } = useQuery({
    queryKey: ["admin-premium-payments"],
    queryFn: async () => {
      const res = await getAdminPremiumPayments();
      return res;
    },
    refetchInterval: 30_000,
  });

  // 2. Fetch Premium Coupons data
  const { data: couponsData, isLoading: loadingCoupons, refetch: refetchCoupons } = useQuery({
    queryKey: ["admin-premium-coupons"],
    queryFn: async () => {
      const res = await getAdminPremiumCoupons();
      return res ?? [];
    },
    refetchInterval: 30_000,
  });

  const records = paymentsData?.records || [];
  const stats = paymentsData?.stats || {
    totalStudents: 0,
    cashfreePaid: 0,
    manualPaid: 0,
    freeWaivers: 0,
    discountedOffers: 0,
    pendingUnpaid: 0,
    totalRevenue: 0,
  };

  // Filtered Payments List
  const filteredRecords = useMemo(() => {
    let list = records;
    if (categoryFilter !== "all") {
      list = list.filter((r) => r.payment_category === categoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.full_name?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q) ||
          r.intern_id?.toLowerCase().includes(q) ||
          r.phone?.includes(q) ||
          r.coupon_code?.toLowerCase().includes(q) ||
          r.plan_payment_id?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [records, categoryFilter, search]);

  // Handle Mark as Paid (Manual)
  const handleConfirmManualPay = async () => {
    if (!manualPayTarget) return;
    setSubmittingManual(true);
    try {
      const res = await updateAdminPremiumPayment({
        data: {
          applicationId: manualPayTarget.application_id,
          status: "paid",
          agreedFee: Number(manualAmount) || 200,
          paymentMethod: manualMethod,
          referenceId: manualUtr.trim(),
          adminNotes: manualNotes.trim() || `Manual payment recorded by Admin`,
        },
      });

      if (res.success) {
        toast.success(`Marked as Paid: ${manualPayTarget.full_name} (${manualPayTarget.intern_id})`);
        qc.invalidateQueries({ queryKey: ["admin-premium-payments"] });
        qc.invalidateQueries({ queryKey: ["admin-apps"] });
        qc.invalidateQueries({ queryKey: ["admin-overview"] });
        setManualPayTarget(null);
      } else {
        toast.error(res.error || "Failed to update payment");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update payment");
    } finally {
      setSubmittingManual(false);
    }
  };

  // Handle Grant Free Premium Access
  const handleConfirmFreeGrant = async () => {
    if (!freeGrantTarget) return;
    setSubmittingFree(true);
    try {
      const res = await updateAdminPremiumPayment({
        data: {
          applicationId: freeGrantTarget.application_id,
          status: "free",
          paymentMethod: "admin_free_waiver",
          agreedFee: 0,
          referenceId: "FREE_GRANT",
          adminNotes: freeNotes.trim() || "100% Free Premium access granted by Admin",
        },
      });

      if (res.success) {
        toast.success(`100% Free Premium access granted to ${freeGrantTarget.full_name}`);
        qc.invalidateQueries({ queryKey: ["admin-premium-payments"] });
        qc.invalidateQueries({ queryKey: ["admin-apps"] });
        qc.invalidateQueries({ queryKey: ["admin-overview"] });
        setFreeGrantTarget(null);
      } else {
        toast.error(res.error || "Failed to grant free access");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to grant free access");
    } finally {
      setSubmittingFree(false);
    }
  };

  // Handle Apply Custom Offer
  const handleConfirmCustomOffer = async () => {
    if (!customOfferTarget) return;
    setSubmittingOffer(true);
    try {
      const baseFee = Number(customOfferTarget.plan_fee || 200);
      const discount = Number(offerDiscount) || 0;
      const finalFee = Math.max(0, baseFee - discount);

      const res = await updateAdminPremiumPayment({
        data: {
          applicationId: customOfferTarget.application_id,
          status: customOfferTarget.plan_payment_status === "paid" ? "paid" : "pending",
          agreedFee: finalFee,
          discountAmount: discount,
          couponCode: `OFFER-₹${discount}`,
          adminNotes: `Special offer applied by Admin: ₹${discount} OFF (Payable: ₹${finalFee})`,
        },
      });

      if (res.success) {
        toast.success(`Special Offer Applied: ₹${discount} OFF (Payable: ₹${finalFee}) for ${customOfferTarget.full_name}`);
        qc.invalidateQueries({ queryKey: ["admin-premium-payments"] });
        setCustomOfferTarget(null);
      } else {
        toast.error(res.error || "Failed to apply offer");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to apply offer");
    } finally {
      setSubmittingOffer(false);
    }
  };

  // Handle Revert to Unpaid
  const handleConfirmRevert = async () => {
    if (!revertTarget) return;
    setSubmittingRevert(true);
    try {
      const res = await updateAdminPremiumPayment({
        data: {
          applicationId: revertTarget.application_id,
          status: "pending",
          paymentMethod: "",
          referenceId: "",
          adminNotes: "Status reset to pending by Admin",
        },
      });

      if (res.success) {
        toast.success(`Payment status reset to pending for ${revertTarget.full_name}`);
        qc.invalidateQueries({ queryKey: ["admin-premium-payments"] });
        setRevertTarget(null);
      } else {
        toast.error(res.error || "Failed to reset status");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to reset status");
    } finally {
      setSubmittingRevert(false);
    }
  };

  // Quick 1-Click Offer Creator
  const handleQuickCreateOffer = async (preset: { code: string; type: "fixed" | "free"; value: number; desc: string }) => {
    const toastId = toast.loading(`Creating ${preset.code} coupon...`);
    try {
      const res = await createAdminPremiumCoupon({
        data: {
          adminId,
          code: preset.code,
          description: preset.desc,
          discountType: preset.type,
          discountValue: preset.value,
          usageLimit: 0,
          isActive: true,
        },
      });

      if (res.success) {
        toast.success(`Coupon ${preset.code} created successfully!`, { id: toastId });
        qc.invalidateQueries({ queryKey: ["admin-premium-coupons"] });
        qc.invalidateQueries({ queryKey: ["admin-coupons"] });
      } else {
        toast.error("Failed to create coupon", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create coupon", { id: toastId });
    }
  };

  // Handle Create Custom Coupon
  const handleCreateCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    setSubmittingCoupon(true);
    try {
      const res = await createAdminPremiumCoupon({
        data: {
          adminId,
          code: couponCode.trim().toUpperCase(),
          description: couponDesc.trim() || `Premium Plan Offer (${discountType === "free" ? "100% Free" : discountType === "fixed" ? `₹${discountValue} OFF` : `${discountValue}% OFF`})`,
          discountType,
          discountValue: discountType === "free" ? 100 : Number(discountValue),
          usageLimit: Number(usageLimit) || 0,
          expiresAt: expiresAt || undefined,
          isActive: true,
        },
      });

      if (res.success) {
        toast.success(`Premium Coupon ${couponCode.toUpperCase()} created!`);
        qc.invalidateQueries({ queryKey: ["admin-premium-coupons"] });
        qc.invalidateQueries({ queryKey: ["admin-coupons"] });
        setCreateCouponOpen(false);
        setCouponCode("");
        setCouponDesc("");
      } else {
        toast.error("Failed to create coupon");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create coupon");
    } finally {
      setSubmittingCoupon(false);
    }
  };

  // Copy coupon code helper
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code ${code} copied to clipboard!`);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/30 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-transparent backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="size-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 shrink-0">
            <Crown className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                Premium Plan Hub
              </h2>
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[10px] px-2 py-0.5 border-0 shadow-sm">
                EXCLUSIVE
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Comprehensive real-time tracking for Online Cashfree, Manual UPI, Free Waivers &amp; ₹50/₹25 Offer Coupons.
            </p>
          </div>
        </div>

        {/* Tab Switcher & Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-card border border-border/80 p-1 shadow-xs">
            <button
              onClick={() => setActiveTab("payments")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "payments"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <IndianRupee className="size-3.5" />
              <span>Payments &amp; Students ({records.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("coupons")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "coupons"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Tag className="size-3.5" />
              <span>Offers &amp; Coupons ({couponsData?.length || 0})</span>
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              refetchPayments();
              refetchCoupons();
              toast.success("Refreshed Premium Plan data");
            }}
            className="rounded-xl h-9 text-xs border-border/80 gap-1.5 cursor-pointer hover:bg-accent"
          >
            <RefreshCw className={`size-3.5 ${fetchingPayments ? "animate-spin text-amber-500" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* ── KPI Metrics Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Students */}
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-bold">Total Students</span>
            <Users className="size-4 text-slate-500" />
          </div>
          <div className="text-2xl font-black text-foreground">{stats.totalStudents}</div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Premium Track</p>
        </div>

        {/* Cashfree Online */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20 p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-1">
            <span className="text-[11px] font-bold">Gateway Paid</span>
            <CreditCard className="size-4" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.cashfreePaid}</div>
          <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">Cashfree Online</p>
        </div>

        {/* Manual UPI */}
        <div className="rounded-2xl border border-blue-500/30 bg-blue-50/20 dark:bg-blue-950/20 p-4 shadow-xs">
          <div className="flex items-center justify-between text-blue-700 dark:text-blue-400 mb-1">
            <span className="text-[11px] font-bold">Manual UPI</span>
            <Building className="size-4" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{stats.manualPaid}</div>
          <p className="text-[10px] text-blue-700/80 dark:text-blue-400/80 mt-0.5">Admin Approved</p>
        </div>

        {/* Free Waivers */}
        <div className="rounded-2xl border border-purple-500/30 bg-purple-50/20 dark:bg-purple-950/20 p-4 shadow-xs">
          <div className="flex items-center justify-between text-purple-700 dark:text-purple-400 mb-1">
            <span className="text-[11px] font-bold">100% Free (₹0)</span>
            <Gift className="size-4" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{stats.freeWaivers}</div>
          <p className="text-[10px] text-purple-700/80 dark:text-purple-400/80 mt-0.5">Admin Granted</p>
        </div>

        {/* Discounted Offers */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/20 p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-1">
            <span className="text-[11px] font-bold">Offers Applied</span>
            <Tag className="size-4" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.discountedOffers}</div>
          <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">₹50 / ₹25 / Coupons</p>
        </div>

        {/* Total Revenue */}
        <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-amber-500/10 via-card to-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-bold">Total Revenue</span>
            <TrendingUp className="size-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-[#f95c4b]">₹{stats.totalRevenue.toLocaleString("en-IN")}</div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Collected Funds</p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TAB 1: PAYMENTS & STUDENTS DIRECTORY
         ══════════════════════════════════════════════ */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          {/* Controls Bar: Filters & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: "All Students", count: records.length },
                { id: "cashfree", label: "Gateway Paid", count: stats.cashfreePaid },
                { id: "manual", label: "Manual UPI", count: stats.manualPaid },
                { id: "free", label: "100% Free", count: stats.freeWaivers },
                { id: "offer_discount", label: "Offers / Coupons", count: stats.discountedOffers },
                { id: "pending", label: "Pending", count: stats.pendingUnpaid },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setCategoryFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    categoryFilter === f.id
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                      : "bg-muted/60 text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <span>{f.label}</span>
                  <span className="text-[10px] opacity-75">({f.count})</span>
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search student, email, ID, UTR..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-xl pl-9 text-xs border-border/80"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/80 bg-muted/40 text-[11px] font-black uppercase tracking-wider text-muted-foreground select-none">
                <tr>
                  <th className="px-4 py-3">Student &amp; Domain</th>
                  <th className="px-4 py-3">Track &amp; Duration</th>
                  <th className="px-4 py-3">Base vs Agreed Fee</th>
                  <th className="px-4 py-3">Payment Type</th>
                  <th className="px-4 py-3">Reference / Order / Coupon</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-sans">
                {loadingPayments ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="size-6 animate-spin text-amber-500" />
                        <span className="text-xs">Loading Premium Plan records...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <p className="text-sm font-semibold">No students found matching your filter criteria</p>
                      <p className="text-xs opacity-75 mt-0.5">Try searching with a different term or filter</p>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => {
                    const isPaid = r.plan_payment_status === "paid" || r.plan_payment_status === "waived" || r.plan_payment_status === "free";
                    const isFree = r.plan_payment_status === "free" || r.agreed_fee === 0;

                    return (
                      <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                        {/* Student Details */}
                        <td className="px-4 py-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground text-xs sm:text-sm">{r.full_name}</span>
                              {r.intern_id && (
                                <span className="font-mono text-[10px] text-muted-foreground px-1.5 py-0.2 rounded-md bg-muted border border-border/50">
                                  {r.intern_id}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate">{r.email}</div>
                            {r.phone && <div className="text-[10px] text-muted-foreground/75 font-mono">{r.phone}</div>}
                          </div>
                        </td>

                        {/* Track & Duration */}
                        <td className="px-4 py-3 text-xs whitespace-nowrap">
                          <div className="font-semibold text-foreground capitalize">{r.domain}</div>
                          <span className="text-[11px] text-muted-foreground">{r.duration} Months Track</span>
                        </td>

                        {/* Fee & Discount */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-bold text-foreground text-sm">
                              {isFree ? "₹0 (Free)" : `₹${r.agreed_fee || r.plan_fee}`}
                            </span>
                            {r.discount_amount > 0 && (
                              <span className="text-[10.5px] line-through text-muted-foreground font-mono">
                                ₹{r.plan_fee}
                              </span>
                            )}
                          </div>
                          {r.discount_amount > 0 && (
                            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                              <Tag className="size-2.5" />
                              <span>₹{r.discount_amount} OFF</span>
                            </div>
                          )}
                        </td>

                        {/* Payment Type */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {r.payment_category === "cashfree" ? (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10.5px] font-bold flex items-center gap-1 w-fit">
                              <CreditCard className="size-3" /> Cashfree Gateway
                            </Badge>
                          ) : r.payment_category === "manual" ? (
                            <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 text-[10.5px] font-bold flex items-center gap-1 w-fit">
                              <Building className="size-3" /> Manual UPI
                            </Badge>
                          ) : r.payment_category === "free" ? (
                            <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30 text-[10.5px] font-bold flex items-center gap-1 w-fit">
                              <Gift className="size-3" /> 100% Free Waiver
                            </Badge>
                          ) : r.payment_category === "offer_discount" ? (
                            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10.5px] font-bold flex items-center gap-1 w-fit">
                              <Sparkles className="size-3" /> Offer Discounted
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-500 border-border text-[10.5px] font-bold flex items-center gap-1 w-fit">
                              <Clock className="size-3" /> Unpaid / Pending
                            </Badge>
                          )}
                        </td>

                        {/* Reference / Coupon / ID */}
                        <td className="px-4 py-3 text-xs whitespace-nowrap">
                          {r.coupon_code && (
                            <div className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/30">
                              <span>Coupon: {r.coupon_code}</span>
                            </div>
                          )}
                          {r.plan_payment_id && (
                            <div className="font-mono text-[10px] text-muted-foreground truncate max-w-[160px]" title={r.plan_payment_id}>
                              Ref: {r.plan_payment_id}
                            </div>
                          )}
                          {!r.coupon_code && !r.plan_payment_id && (
                            <span className="text-muted-foreground/60 text-xs">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                              <CheckCircle2 className="size-3.5" />
                              <span>{isFree ? "Free Access" : "Confirmed"}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-bold">
                              <Clock className="size-3.5" />
                              <span>Pending</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Mark Paid (Manual) */}
                            {!isPaid && (
                              <button
                                onClick={() => {
                                  setManualPayTarget(r);
                                  setManualAmount(r.agreed_fee || r.plan_fee || 200);
                                  setManualUtr("");
                                  setManualNotes("");
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
                                title="Mark manual payment as paid"
                              >
                                <CheckCircle2 className="size-3.5" />
                                <span>Mark Paid</span>
                              </button>
                            )}

                            {/* Grant Free Access */}
                            {!isFree && (
                              <button
                                onClick={() => setFreeGrantTarget(r)}
                                className="px-2 py-1 rounded-lg border border-purple-500/40 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                title="Grant 100% free premium access"
                              >
                                <Gift className="size-3.5" />
                                <span>Free</span>
                              </button>
                            )}

                            {/* Set Custom Offer */}
                            <button
                              onClick={() => {
                                setCustomOfferTarget(r);
                                setOfferDiscount(50);
                              }}
                              className="px-2 py-1 rounded-lg border border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                              title="Apply custom discount offer (e.g. ₹50 or ₹25 off)"
                            >
                              <Tag className="size-3" />
                              <span>Offer</span>
                            </button>

                            {/* Revert if paid */}
                            {isPaid && (
                              <button
                                onClick={() => setRevertTarget(r)}
                                className="px-2 py-1 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent text-xs font-medium transition cursor-pointer"
                                title="Reset status to pending"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 2: EXCLUSIVE PREMIUM OFFERS & COUPONS
         ══════════════════════════════════════════════ */}
      {activeTab === "coupons" && (
        <div className="space-y-6">
          {/* Quick 1-Click Launchpad */}
          <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/15 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <Zap className="size-4 text-amber-500" />
                  <span>1-Click Premium Offer Generator</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Instantly launch standard ₹50 or ₹25 offer discounts or 100% Free Waiver coupons for Premium Plan students.
                </p>
              </div>

              <Button
                onClick={() => setCreateCouponOpen(true)}
                className="rounded-xl h-8 text-xs font-bold bg-[#181619] dark:bg-white dark:text-slate-900 text-white gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="size-3.5" />
                <span>Create Custom Offer</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Preset 1: ₹50 OFF */}
              <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-sm text-amber-600 dark:text-amber-400">PREM50</span>
                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-0 text-[10px] font-bold">
                      ₹50 OFF
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Student pays ₹150 instead of ₹200</p>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    handleQuickCreateOffer({
                      code: "PREM50",
                      type: "fixed",
                      value: 50,
                      desc: "Flat ₹50 OFF Early Bird Offer on Premium Plan",
                    })
                  }
                  className="rounded-lg h-7 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white border-0 cursor-pointer"
                >
                  Launch
                </Button>
              </div>

              {/* Preset 2: ₹25 OFF */}
              <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-sm text-orange-600 dark:text-orange-400">PREM25</span>
                    <Badge className="bg-orange-500/15 text-orange-700 dark:text-orange-300 border-0 text-[10px] font-bold">
                      ₹25 OFF
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Student pays ₹175 instead of ₹200</p>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    handleQuickCreateOffer({
                      code: "PREM25",
                      type: "fixed",
                      value: 25,
                      desc: "Flat ₹25 OFF Instant Discount on Premium Plan",
                    })
                  }
                  className="rounded-lg h-7 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white border-0 cursor-pointer"
                >
                  Launch
                </Button>
              </div>

              {/* Preset 3: 100% Free */}
              <div className="rounded-xl border border-purple-500/30 bg-card p-3.5 shadow-xs flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-sm text-purple-600 dark:text-purple-400">PREMFREE</span>
                    <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-300 border-0 text-[10px] font-bold">
                      100% FREE
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Full ₹200 waiver (₹0 Free Access)</p>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    handleQuickCreateOffer({
                      code: "PREMFREE",
                      type: "free",
                      value: 100,
                      desc: "100% Free Full Waiver for Premium Plan",
                    })
                  }
                  className="rounded-lg h-7 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white border-0 cursor-pointer"
                >
                  Launch
                </Button>
              </div>
            </div>
          </div>

          {/* Active Premium Coupons Table */}
          <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-xs">
            <div className="p-4 border-b border-border/80 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-foreground">Active Premium Plan Coupons &amp; Offers</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  These codes are exclusively valid when students upgrade to the Premium Plan.
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-semibold">
                {couponsData?.length || 0} Coupons
              </Badge>
            </div>

            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/80 bg-muted/40 text-[11px] font-black uppercase tracking-wider text-muted-foreground select-none">
                <tr>
                  <th className="px-4 py-3">Coupon Code</th>
                  <th className="px-4 py-3">Discount Type</th>
                  <th className="px-4 py-3">Discount Value</th>
                  <th className="px-4 py-3">Redemptions / Limit</th>
                  <th className="px-4 py-3">Expires At</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loadingCoupons ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted-foreground">
                      <Loader2 className="size-5 animate-spin mx-auto text-amber-500 mb-2" />
                      <span className="text-xs">Loading coupons...</span>
                    </td>
                  </tr>
                ) : !couponsData || couponsData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted-foreground text-xs">
                      No exclusive Premium coupons created yet. Use the 1-Click launcher above!
                    </td>
                  </tr>
                ) : (
                  couponsData.map((c: any) => {
                    const isFree = c.discount_type === "free" || Number(c.discount_value) >= 100;
                    return (
                      <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                        {/* Code */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-foreground text-sm">{c.code}</span>
                            <button
                              onClick={() => copyCode(c.code)}
                              className="text-muted-foreground hover:text-foreground transition cursor-pointer"
                              title="Copy code"
                            >
                              <Copy className="size-3.5" />
                            </button>
                          </div>
                          {c.description && (
                            <p className="text-[11px] text-muted-foreground truncate max-w-xs">{c.description}</p>
                          )}
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3 text-xs capitalize">
                          <Badge variant="outline" className="text-[10px] font-semibold">
                            {c.discount_type}
                          </Badge>
                        </td>

                        {/* Value */}
                        <td className="px-4 py-3 font-bold text-sm text-foreground">
                          {isFree ? (
                            <span className="text-purple-600 dark:text-purple-400 font-extrabold">100% FREE</span>
                          ) : c.discount_type === "percentage" ? (
                            <span className="text-amber-600 dark:text-amber-400 font-extrabold">{c.discount_value}% OFF</span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-extrabold">₹{c.discount_value} OFF</span>
                          )}
                        </td>

                        {/* Redemptions */}
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          <span className="font-bold text-foreground">{c.redemption_count || c.current_uses || 0}</span>
                          <span> / {c.max_uses > 0 ? c.max_uses : "∞ Unlimited"}</span>
                        </td>

                        {/* Expiry */}
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {c.expires_at ? new Date(c.expires_at).toLocaleDateString("en-IN") : "No Expiry"}
                        </td>

                        {/* Status Toggle */}
                        <td className="px-4 py-3">
                          <Switch
                            checked={Boolean(c.is_active)}
                            onCheckedChange={async (val) => {
                              try {
                                await toggleCouponAdmin({ data: { adminId, couponId: c.id, isActive: val } });
                                toast.success(`Coupon ${c.code} ${val ? "activated" : "deactivated"}`);
                                qc.invalidateQueries({ queryKey: ["admin-premium-coupons"] });
                              } catch (err: any) {
                                toast.error(err.message || "Failed to update coupon status");
                              }
                            }}
                          />
                        </td>

                        {/* Delete Action */}
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={async () => {
                              if (!confirm(`Delete coupon ${c.code}?`)) return;
                              try {
                                await deleteCouponAdmin({ data: { adminId, couponId: c.id } });
                                toast.success(`Coupon ${c.code} deleted`);
                                qc.invalidateQueries({ queryKey: ["admin-premium-coupons"] });
                              } catch (err: any) {
                                toast.error(err.message || "Failed to delete coupon");
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                            title="Delete coupon"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          MODALS / DIALOGS
         ══════════════════════════════════════════════ */}

      {/* 1. Mark as Paid (Manual) Modal */}
      <Dialog open={!!manualPayTarget} onOpenChange={(o) => !o && setManualPayTarget(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-bold text-lg">
              <CheckCircle2 className="size-5 text-emerald-500" />
              <span>Mark Manual Payment as Paid</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Confirm receipt of manual UPI or bank transfer payment for this student's Premium Plan.
            </DialogDescription>
          </DialogHeader>

          {manualPayTarget && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-muted/60 space-y-1">
                <p><span className="font-bold text-foreground">Student:</span> {manualPayTarget.full_name} ({manualPayTarget.intern_id})</p>
                <p><span className="font-bold text-foreground">Email:</span> {manualPayTarget.email}</p>
                <p><span className="font-bold text-foreground">Track:</span> {manualPayTarget.domain} • {manualPayTarget.duration} Months</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Received Amount (₹)</Label>
                <Input
                  type="number"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(Number(e.target.value))}
                  placeholder="200"
                  className="rounded-xl h-9 text-xs"
                />
                <p className="text-[10.5px] text-muted-foreground">Standard Premium Fee: ₹200. (Or ₹150 for ₹50 offer / ₹175 for ₹25 offer).</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Payment Method</Label>
                <select
                  value={manualMethod}
                  onChange={(e) => setManualMethod(e.target.value)}
                  className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-medium"
                >
                  <option value="manual_upi">Direct UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="bank_transfer">Direct IMPS / NEFT Bank Transfer</option>
                  <option value="cash_office">Cash at Office / Partner</option>
                  <option value="special_approval">Special Leadership Approval</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Transaction Reference / UTR Number</Label>
                <Input
                  value={manualUtr}
                  onChange={(e) => setManualUtr(e.target.value)}
                  placeholder="e.g. 431289123891 or GPay ref"
                  className="rounded-xl h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Admin Verification Notes (Optional)</Label>
                <Input
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="e.g. Verified payment screenshot on WhatsApp"
                  className="rounded-xl h-9 text-xs"
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setManualPayTarget(null)} disabled={submittingManual}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmManualPay}
              disabled={submittingManual}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {submittingManual ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
              <span>Confirm &amp; Unlock Premium</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Grant 100% Free Access Modal */}
      <Dialog open={!!freeGrantTarget} onOpenChange={(o) => !o && setFreeGrantTarget(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-bold text-lg">
              <Gift className="size-5 text-purple-600" />
              <span>Grant 100% Free Premium Access</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              This will completely waive the ₹200 premium fee (₹0) and instantly unlock all premium features, tasks, and student kit.
            </DialogDescription>
          </DialogHeader>

          {freeGrantTarget && (
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-500/30 space-y-1">
                <p><span className="font-bold text-foreground">Student:</span> {freeGrantTarget.full_name} ({freeGrantTarget.intern_id})</p>
                <p><span className="font-bold text-foreground">Email:</span> {freeGrantTarget.email}</p>
                <p><span className="font-bold text-foreground">Track:</span> {freeGrantTarget.domain} • {freeGrantTarget.duration} Months</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Waiver Reason / Notes</Label>
                <Input
                  value={freeNotes}
                  onChange={(e) => setFreeNotes(e.target.value)}
                  placeholder="e.g. Merit waiver / Special scholarship grant"
                  className="rounded-xl h-9 text-xs"
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setFreeGrantTarget(null)} disabled={submittingFree}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmFreeGrant}
              disabled={submittingFree}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              {submittingFree ? <Loader2 className="size-3.5 animate-spin" /> : <Gift className="size-3.5" />}
              <span>Grant Free Premium Access</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Apply Custom Offer Modal */}
      <Dialog open={!!customOfferTarget} onOpenChange={(o) => !o && setCustomOfferTarget(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-bold text-lg">
              <Tag className="size-5 text-amber-500" />
              <span>Apply Custom Offer / Discount</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Set an instant discount for this student (e.g. ₹50 OFF or ₹25 OFF).
            </DialogDescription>
          </DialogHeader>

          {customOfferTarget && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-muted/60 space-y-1">
                <p><span className="font-bold text-foreground">Student:</span> {customOfferTarget.full_name}</p>
                <p><span className="font-bold text-foreground">Base Fee:</span> ₹{customOfferTarget.plan_fee || 200}</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Discount Amount (₹)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={offerDiscount}
                    onChange={(e) => setOfferDiscount(Number(e.target.value))}
                    className="rounded-xl h-9 text-xs font-bold"
                  />
                  <div className="flex gap-1 shrink-0">
                    <Button type="button" size="sm" variant="outline" onClick={() => setOfferDiscount(50)} className="h-9 px-2 text-xs">
                      ₹50 OFF
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setOfferDiscount(25)} className="h-9 px-2 text-xs">
                      ₹25 OFF
                    </Button>
                  </div>
                </div>
                <p className="text-[11px] font-bold text-emerald-600 mt-1">
                  New Payable Amount: ₹{Math.max(0, (customOfferTarget.plan_fee || 200) - offerDiscount)}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setCustomOfferTarget(null)} disabled={submittingOffer}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmCustomOffer}
              disabled={submittingOffer}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold"
            >
              {submittingOffer ? <Loader2 className="size-3.5 animate-spin" /> : <Tag className="size-3.5" />}
              <span>Apply Offer</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Reset / Revert Modal */}
      <Dialog open={!!revertTarget} onOpenChange={(o) => !o && setRevertTarget(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-bold text-lg">
              <AlertTriangle className="size-5 text-amber-500" />
              <span>Reset Status to Pending</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to revert {revertTarget?.full_name}'s payment status back to pending?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setRevertTarget(null)} disabled={submittingRevert}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleConfirmRevert}
              disabled={submittingRevert}
            >
              {submittingRevert ? <Loader2 className="size-3.5 animate-spin" /> : "Yes, Reset to Pending"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5. Create Custom Coupon Modal */}
      <Dialog open={createCouponOpen} onOpenChange={setCreateCouponOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-bold text-lg">
              <Plus className="size-5 text-amber-500" />
              <span>Create Exclusive Premium Coupon</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              This coupon will be strictly valid only for students paying for the Premium Internship Plan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCouponSubmit} className="space-y-4 pt-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Coupon Code *</Label>
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="e.g. FESTIVE50 or SPECIAL25"
                className="rounded-xl h-9 text-xs font-mono font-bold tracking-wider"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Discount Type</Label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-medium"
                >
                  <option value="fixed">Flat Amount (₹ OFF)</option>
                  <option value="percentage">Percentage (% OFF)</option>
                  <option value="free">100% Free Waiver</option>
                </select>
              </div>

              {discountType !== "free" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">
                    {discountType === "fixed" ? "Discount (₹)" : "Discount (%)"}
                  </Label>
                  <Input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    min={1}
                    className="rounded-xl h-9 text-xs font-bold"
                    required
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Usage Limit (0 = Unlimited)</Label>
                <Input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(Number(e.target.value))}
                  min={0}
                  className="rounded-xl h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Expiry Date (Optional)</Label>
                <Input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="rounded-xl h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Description (Optional)</Label>
              <Input
                value={couponDesc}
                onChange={(e) => setCouponDesc(e.target.value)}
                placeholder="e.g. ₹50 Special discount on 3-month Premium Track"
                className="rounded-xl h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateCouponOpen(false)} disabled={submittingCoupon}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submittingCoupon} className="bg-amber-500 hover:bg-amber-600 text-white font-bold">
                {submittingCoupon ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                <span>Create Premium Coupon</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
