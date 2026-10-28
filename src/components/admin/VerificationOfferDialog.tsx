import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Gift,
  Sparkles,
  Send,
  Users,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Percent,
  RefreshCw,
  Search,
  Filter,
  Check,
  ChevronRight,
  ExternalLink,
  Flame,
} from "lucide-react";
import { getCouponsAdmin, sendVerificationQueueOffers } from "@/lib/fee-service";
import { getDomain } from "@/lib/constants";
import { getOfferCouponEmailHtml } from "@/lib/email-helpers";

interface VerificationOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminId: string;
  pendingApps: any[];
  paymentMap: Record<string, any>;
  preselectedAppId?: string | null;
  initialCouponCode?: string | null;
  onSuccess?: () => void;
}

export function VerificationOfferDialog({
  open,
  onOpenChange,
  adminId,
  pendingApps,
  paymentMap,
  preselectedAppId,
  initialCouponCode,
  onSuccess,
}: VerificationOfferDialogProps) {
  const qc = useQueryClient();

  // Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "unpaid" | "long_waiting" | "no_coupon">("unpaid");

  // Coupon configuration
  const [couponSource, setCouponSource] = useState<"existing" | "new">("new");
  const [selectedCouponCode, setSelectedCouponCode] = useState<string>(initialCouponCode || "");

  // New coupon form
  const [newCode, setNewCode] = useState("OFFER50");
  const [newDiscountType, setNewDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [newDiscountValue, setNewDiscountValue] = useState<number>(50);
  const [newExpiresAt, setNewExpiresAt] = useState<string>("");
  const [newUsageLimit, setNewUsageLimit] = useState<number>(0);
  const [newDescription, setNewDescription] = useState("Special 50% discount for waiting verification queue students");

  // Email customization
  const [emailSubject, setEmailSubject] = useState("Special 50% OFF Offer on your Skyrovix Internship Certificate! 🎓");
  const [customMessage, setCustomMessage] = useState(
    "We appreciate your patience while waiting in our verification queue. To reward your dedication and expedite your certification, here is an exclusive 50% discount code on your official Certificate of Completion!"
  );
  const [autoApply, setAutoApply] = useState(true);

  // Active view tab
  const [viewTab, setViewTab] = useState<"compose" | "preview">("compose");

  // Fetch active coupons
  const { data: coupons = [], isLoading: loadingCoupons } = useQuery({
    queryKey: ["admin-coupons-list", adminId],
    queryFn: async () => {
      return getCouponsAdmin({ data: { adminId } });
    },
    enabled: Boolean(adminId) && open,
  });

  const activeCoupons = useMemo(() => {
    return coupons.filter((c: any) => c.is_active);
  }, [coupons]);

  // Helper: Waiting Days
  const getWaitingDays = (app: any): number => {
    const submittedDate = app.submitted_at || app.created_at;
    if (!submittedDate) return 0;
    const diffMs = Date.now() - new Date(submittedDate).getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  };

  // Helper: Payment status
  const getAppStatus = (app: any) => {
    const pay = paymentMap[app.id];
    const isPaid = Boolean(
      (pay && (pay.status === "verified" || pay.status === "approved")) ||
      app.certificate_payment_status === "approved" ||
      app.certificate_payment_status === "waived"
    );
    const hasCoupon = Boolean(
      (app.coupon_code && app.coupon_code.trim() !== "") ||
      (pay && (pay.coupon_code || pay.utr_number === "FREE_COUPON" || pay.amount === 0))
    );
    const waitingDays = getWaitingDays(app);
    return { isPaid, hasCoupon, waitingDays, pay };
  };

  // Sync initial selection
  useEffect(() => {
    if (!open) return;

    if (preselectedAppId) {
      setSelectedIds([preselectedAppId]);
    } else {
      // Default: select unpaid students
      const unpaid = (pendingApps || [])
        .filter((app) => {
          const { isPaid, hasCoupon } = getAppStatus(app);
          return !isPaid && !hasCoupon;
        })
        .map((app) => app.id);
      setSelectedIds(unpaid.length > 0 ? unpaid : (pendingApps || []).map((a) => a.id));
    }

    if (initialCouponCode) {
      setSelectedCouponCode(initialCouponCode);
      setCouponSource("existing");
    }
  }, [open, preselectedAppId, initialCouponCode, pendingApps]);

  // Filtered students list
  const filteredApps = useMemo(() => {
    return (pendingApps || []).filter((app) => {
      const { isPaid, hasCoupon, waitingDays } = getAppStatus(app);

      if (filterMode === "unpaid" && (isPaid || hasCoupon)) return false;
      if (filterMode === "long_waiting" && waitingDays < 3) return false;
      if (filterMode === "no_coupon" && (app.coupon_code || hasCoupon)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = app.full_name?.toLowerCase().includes(q);
        const emailMatch = app.email?.toLowerCase().includes(q);
        const idMatch = app.intern_id?.toLowerCase().includes(q);
        const domainMatch = app.domain?.toLowerCase().includes(q);
        if (!nameMatch && !emailMatch && !idMatch && !domainMatch) return false;
      }

      return true;
    });
  }, [pendingApps, filterMode, searchQuery, paymentMap]);

  // Active coupon details for preview and sending
  const effectiveCoupon = useMemo(() => {
    if (couponSource === "existing") {
      const match = activeCoupons.find((c: any) => c.code.toUpperCase() === selectedCouponCode.toUpperCase());
      return {
        code: match?.code || selectedCouponCode || "OFFER50",
        discountType: match?.discount_type || "percentage",
        discountValue: match?.discount_value ?? 50,
        expiresAt: match?.expires_at || null,
      };
    }
    return {
      code: newCode.trim().toUpperCase() || "OFFER50",
      discountType: newDiscountType,
      discountValue: Number(newDiscountValue) || 50,
      expiresAt: newExpiresAt ? new Date(newExpiresAt).toISOString() : null,
    };
  }, [couponSource, selectedCouponCode, activeCoupons, newCode, newDiscountType, newDiscountValue, newExpiresAt]);

  // Update subject when discount value changes if user hasn't edited drastically
  useEffect(() => {
    const val = effectiveCoupon.discountValue;
    const label = effectiveCoupon.discountType === "percentage" ? `${val}% OFF` : `₹${val} OFF`;
    setEmailSubject(`Special ${label} Offer on your Skyrovix Internship Certificate! 🎓`);
  }, [effectiveCoupon.discountValue, effectiveCoupon.discountType]);

  // Toggle selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    const ids = filteredApps.map((a) => a.id);
    setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // Preview Student
  const previewStudent = useMemo(() => {
    const firstSelected = (pendingApps || []).find((a) => selectedIds.includes(a.id));
    return firstSelected || pendingApps?.[0] || {
      full_name: "Rahul Sharma",
      domain: "fullstack",
      intern_id: "SKX-2026-FLS-104",
      email: "rahul.sharma@example.com",
    };
  }, [pendingApps, selectedIds]);

  const previewHtml = useMemo(() => {
    return getOfferCouponEmailHtml({
      studentName: previewStudent.full_name || "Student",
      domainName: getDomain(previewStudent.domain)?.name || previewStudent.domain || "Full Stack Web Development",
      internId: previewStudent.intern_id || "SKX-2026-FLS-104",
      couponCode: effectiveCoupon.code,
      discountType: effectiveCoupon.discountType as any,
      discountValue: effectiveCoupon.discountValue,
      expiresAt: effectiveCoupon.expiresAt,
      customMessage: customMessage.trim() || undefined,
      dashboardUrl: typeof window !== "undefined" ? window.location.origin + "/dashboard" : "https://www.skyrovix.in/dashboard",
    });
  }, [previewStudent, effectiveCoupon, customMessage]);

  // Send Mutation
  const sendMutation = useMutation({
    mutationFn: async () => {
      if (selectedIds.length === 0) {
        throw new Error("Please select at least one student");
      }
      if (!effectiveCoupon.code) {
        throw new Error("Coupon code is required");
      }

      const res = await sendVerificationQueueOffers({
        data: {
          adminId,
          applicationIds: selectedIds,
          couponCode: effectiveCoupon.code,
          createCouponIfNeeded: couponSource === "new",
          couponDetails: couponSource === "new" ? {
            discountType: newDiscountType,
            discountValue: Number(newDiscountValue),
            usageLimit: Number(newUsageLimit),
            expiresAt: newExpiresAt ? new Date(newExpiresAt).toISOString() : null,
            description: newDescription.trim() || `Verification Queue Special Offer (${newDiscountValue}% OFF)`,
          } : undefined,
          customSubject: emailSubject.trim(),
          customMessage: customMessage.trim() || undefined,
          autoApplyToApplication: autoApply,
          dashboardUrl: typeof window !== "undefined" ? window.location.origin + "/dashboard" : "https://www.skyrovix.in/dashboard",
        },
      });

      return res;
    },
    onSuccess: (data) => {
      toast.success(
        `🎉 Successfully sent offer (${effectiveCoupon.code}) to ${data.successfulCount} student(s)!`
      );
      if (data.failedCount > 0) {
        toast.error(`${data.failedCount} email(s) could not be delivered. Check email logs.`);
      }

      qc.invalidateQueries({ queryKey: ["admin-verification-pending"] });
      qc.invalidateQueries({ queryKey: ["admin-coupons-list"] });
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
      qc.invalidateQueries({ queryKey: ["admin-email-logs"] });

      if (onSuccess) onSuccess();
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to dispatch verification offer emails");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden flex flex-col p-0 rounded-3xl border border-purple-500/20 bg-background/95 backdrop-blur-2xl shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-border/40 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white grid place-items-center shadow-md shadow-purple-500/25">
              <Gift className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-foreground flex items-center gap-2">
                <span>Verification Queue Offer Campaign</span>
                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800">
                  50% OFF / Special Coupon
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Send an exclusive promotional coupon email to students waiting in the verification queue to expedite certificate claims.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as any)} className="w-auto">
              <TabsList className="h-9 rounded-xl bg-muted/60 p-1">
                <TabsTrigger value="compose" className="text-xs rounded-lg px-3 py-1 gap-1.5 font-semibold">
                  <Tag className="size-3.5" /> Campaign Setup
                </TabsTrigger>
                <TabsTrigger value="preview" className="text-xs rounded-lg px-3 py-1 gap-1.5 font-semibold">
                  <Eye className="size-3.5" /> Live Preview
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {viewTab === "compose" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Student Selector (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <Users className="size-4 text-primary" /> Target Students ({selectedIds.length} Selected)
                    </h3>
                    <p className="text-xs text-muted-foreground">Select waiting students to receive the offer email</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={selectAllFiltered}
                      className="text-xs h-7 px-2.5 text-primary hover:bg-primary/10 rounded-lg font-medium"
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearSelection}
                      className="text-xs h-7 px-2.5 text-muted-foreground hover:bg-muted rounded-lg font-medium"
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                {/* Filter Pills & Search */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFilterMode("unpaid")}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition ${
                        filterMode === "unpaid"
                          ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                          : "bg-muted/40 border-border/60 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      Awaiting Payment (Unpaid)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterMode("long_waiting")}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition flex items-center gap-1 ${
                        filterMode === "long_waiting"
                          ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                          : "bg-muted/40 border-border/60 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Flame className="size-3" /> Waiting &gt; 3 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterMode("no_coupon")}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition ${
                        filterMode === "no_coupon"
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-muted/40 border-border/60 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      No Coupon Yet
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterMode("all")}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition ${
                        filterMode === "all"
                          ? "bg-foreground text-background border-foreground shadow-sm"
                          : "bg-muted/40 border-border/60 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      All Pending ({pendingApps?.length || 0})
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search students by name, email, intern ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 pl-8 text-xs rounded-xl border-border/60 bg-muted/20"
                    />
                  </div>
                </div>

                {/* Students List Box */}
                <div className="border border-border/60 rounded-2xl overflow-hidden bg-card/60 divide-y divide-border/30 max-h-[340px] overflow-y-auto">
                  {filteredApps.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      No students match the current filter criteria.
                    </div>
                  ) : (
                    filteredApps.map((app) => {
                      const isSelected = selectedIds.includes(app.id);
                      const { isPaid, hasCoupon, waitingDays } = getAppStatus(app);

                      return (
                        <div
                          key={app.id}
                          onClick={() => toggleSelect(app.id)}
                          className={`p-3 flex items-center justify-between gap-3 text-xs transition cursor-pointer select-none ${
                            isSelected ? "bg-purple-500/10 dark:bg-purple-950/20" : "hover:bg-muted/30"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelect(app.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="rounded-md"
                            />
                            <div className="grid size-8 shrink-0 place-items-center rounded-full brand-gradient text-[11px] font-bold text-white">
                              {app.full_name?.charAt(0)?.toUpperCase() || "S"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-foreground truncate">{app.full_name}</p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {app.email} · {app.intern_id}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {getDomain(app.domain)?.name || app.domain}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            {/* Waiting Days Badge */}
                            {waitingDays >= 5 ? (
                              <Badge className="bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 text-[10px] font-bold border border-red-200">
                                ⏳ {waitingDays} Days Waiting
                              </Badge>
                            ) : waitingDays >= 2 ? (
                              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 text-[10px] font-bold border border-amber-200">
                                ⏳ {waitingDays} Days Waiting
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                ⏳ {waitingDays === 0 ? "Today" : `${waitingDays} Day`}
                              </Badge>
                            )}

                            {/* Status info */}
                            <div className="flex items-center gap-1">
                              {isPaid ? (
                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 text-[9px]">
                                  Paid
                                </Badge>
                              ) : hasCoupon ? (
                                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/40 text-[9px]">
                                  Coupon
                                </Badge>
                              ) : (
                                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/40 text-[9px] font-bold">
                                  Unpaid
                                </Badge>
                              )}
                              {app.coupon_code && (
                                <span className="font-mono text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded">
                                  {app.coupon_code}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Coupon & Email Configuration (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Tag className="size-3.5 text-purple-600" /> Coupon Configuration
                    </Label>
                    <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg text-[10px]">
                      <button
                        type="button"
                        onClick={() => setCouponSource("new")}
                        className={`px-2 py-0.5 rounded-md font-semibold transition ${
                          couponSource === "new" ? "bg-white dark:bg-card shadow-sm text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        Create 50% Coupon
                      </button>
                      <button
                        type="button"
                        onClick={() => setCouponSource("existing")}
                        className={`px-2 py-0.5 rounded-md font-semibold transition ${
                          couponSource === "existing" ? "bg-white dark:bg-card shadow-sm text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        Existing Coupon
                      </button>
                    </div>
                  </div>

                  {couponSource === "new" ? (
                    <div className="space-y-2.5 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[11px] font-semibold text-muted-foreground">Coupon Code *</Label>
                          <Input
                            value={newCode}
                            onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                            placeholder="e.g. OFFER50"
                            className="h-8 font-mono font-bold text-sm uppercase rounded-xl mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] font-semibold text-muted-foreground">Discount Value *</Label>
                          <div className="flex items-center gap-1 mt-1">
                            <Input
                              type="number"
                              min={1}
                              max={newDiscountType === "percentage" ? 100 : 1000}
                              value={newDiscountValue}
                              onChange={(e) => setNewDiscountValue(Number(e.target.value) || 0)}
                              className="h-8 font-bold text-sm rounded-xl"
                            />
                            <Select
                              value={newDiscountType}
                              onValueChange={(val) => setNewDiscountType(val as any)}
                            >
                              <SelectTrigger className="w-16 h-8 text-xs font-bold rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">%</SelectItem>
                                <SelectItem value="fixed">₹</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[11px] font-semibold text-muted-foreground">Expires In (Optional)</Label>
                          <Input
                            type="date"
                            value={newExpiresAt}
                            onChange={(e) => setNewExpiresAt(e.target.value)}
                            className="h-8 text-xs rounded-xl mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] font-semibold text-muted-foreground">Usage Limit</Label>
                          <Input
                            type="number"
                            min={0}
                            value={newUsageLimit}
                            onChange={(e) => setNewUsageLimit(Number(e.target.value) || 0)}
                            placeholder="0 = Unlimited"
                            className="h-8 text-xs rounded-xl mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Select Active Coupon</Label>
                      <Select
                        value={selectedCouponCode}
                        onValueChange={(val) => setSelectedCouponCode(val)}
                      >
                        <SelectTrigger className="h-9 rounded-xl font-mono text-xs font-bold">
                          <SelectValue placeholder="Choose a coupon from system..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {activeCoupons.map((c: any) => (
                            <SelectItem key={c.id} value={c.code} className="font-mono text-xs">
                              {c.code} ({c.discount_type === "percentage" ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {activeCoupons.length === 0 && (
                        <p className="text-[11px] text-muted-foreground">
                          No active coupons found. Switch to "Create 50% Coupon" above.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Summary Callout */}
                  <div className="rounded-xl border border-purple-500/30 bg-purple-100/50 dark:bg-purple-950/30 p-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-purple-700 dark:text-purple-300 font-bold uppercase tracking-wider block">
                        Offer Summary
                      </span>
                      <span className="font-mono font-black text-sm text-purple-900 dark:text-purple-100">
                        {effectiveCoupon.code}
                      </span>
                    </div>
                    <Badge className="bg-purple-600 text-white font-black text-xs px-2.5 py-1">
                      {effectiveCoupon.discountType === "percentage" ? `${effectiveCoupon.discountValue}% OFF` : `₹${effectiveCoupon.discountValue} OFF`}
                    </Badge>
                  </div>
                </div>

                {/* Email Customization */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-bold text-foreground">Email Subject Line</Label>
                    <Input
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="h-8 text-xs rounded-xl mt-1 font-medium"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-foreground">Personalized Message</Label>
                    <Textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={3}
                      className="text-xs rounded-xl mt-1 leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card/60">
                    <div>
                      <p className="text-xs font-bold text-foreground">Auto-Apply to Student Dashboard</p>
                      <p className="text-[10px] text-muted-foreground">
                        Pre-fills coupon in their dashboard so they see the discount right away
                      </p>
                    </div>
                    <Switch checked={autoApply} onCheckedChange={setAutoApply} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Live Email Preview */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <p>
                  Showing sample email for <strong className="text-foreground">{previewStudent.full_name}</strong> ({previewStudent.email})
                </p>
                <Badge variant="outline" className="font-mono text-[10px]">
                  Subject: {emailSubject}
                </Badge>
              </div>

              <div className="border border-border/80 rounded-2xl overflow-hidden shadow-inner bg-[#faf8f2] p-4 max-h-[520px] overflow-y-auto">
                <div
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                  className="mx-auto"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border/40 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Ready to send to <strong>{selectedIds.length}</strong> student{selectedIds.length === 1 ? "" : "s"} with code{" "}
              <strong className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                {effectiveCoupon.code}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sendMutation.isPending}
              className="rounded-xl h-10 px-4 text-xs"
            >
              Cancel
            </Button>

            <Button
              onClick={() => sendMutation.mutate()}
              disabled={sendMutation.isPending || selectedIds.length === 0}
              className="rounded-xl h-10 px-6 font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/20 gap-2 text-xs flex-1 sm:flex-initial"
            >
              {sendMutation.isPending ? (
                <>
                  <RefreshCw className="size-4 animate-spin" /> Dispatching Emails...
                </>
              ) : (
                <>
                  <Send className="size-4" /> Send 50% Offer to {selectedIds.length} Student{selectedIds.length === 1 ? "" : "s"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
