import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getCouponsAdmin,
  createCouponAdmin,
  toggleCouponAdmin,
  deleteCouponAdmin,
  getCouponRedemptionsAdmin,
} from "@/lib/fee-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tag,
  Plus,
  Trash2,
  Users,
  Copy,
  Clock,
  Sparkles,
  Percent,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  Calendar,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface CouponManagementSectionProps {
  adminId: string;
}

export function CouponManagementSection({ adminId }: CouponManagementSectionProps) {
  const qc = useQueryClient();

  // Create Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState<"percentage" | "fixed" | "free">("percentage");
  const [newValue, setNewValue] = useState<number>(100);
  const [newAppliesTo, setNewAppliesTo] = useState<"certificate" | "application" | "both">("certificate");
  const [newUsageLimit, setNewUsageLimit] = useState<number>(0);
  const [newSingleUse, setNewSingleUse] = useState<boolean>(true);
  const [newExpiresAt, setNewExpiresAt] = useState<string>("");
  const [newActive, setNewActive] = useState<boolean>(true);

  // Redemptions Drawer state
  const [selectedCouponForRedemptions, setSelectedCouponForRedemptions] = useState<{ id: string; code: string } | null>(null);

  const { data: coupons = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-coupons-list", adminId],
    queryFn: async () => {
      return getCouponsAdmin({ data: { adminId } });
    },
    enabled: Boolean(adminId),
  });

  const { data: redemptions = [], isLoading: loadingRedemptions } = useQuery({
    queryKey: ["admin-coupon-redemptions", selectedCouponForRedemptions?.id],
    queryFn: async () => {
      if (!selectedCouponForRedemptions) return [];
      return getCouponRedemptionsAdmin({
        data: {
          adminId,
          couponId: selectedCouponForRedemptions.id,
        },
      });
    },
    enabled: Boolean(selectedCouponForRedemptions?.id),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return createCouponAdmin({
        data: {
          adminId,
          code: newCode.trim().toUpperCase(),
          description: newDesc.trim(),
          discountType: newType,
          discountValue: newType === "free" ? 100 : Number(newValue),
          appliesTo: newAppliesTo,
          usageLimit: Number(newUsageLimit),
          singleUsePerUser: newSingleUse,
          expiresAt: newExpiresAt ? new Date(newExpiresAt).toISOString() : null,
          isActive: newActive,
        },
      });
    },
    onSuccess: () => {
      toast.success("Coupon created successfully!");
      setCreateOpen(false);
      resetForm();
      qc.invalidateQueries({ queryKey: ["admin-coupons-list"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create coupon");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ couponId, isActive }: { couponId: string; isActive: boolean }) => {
      return toggleCouponAdmin({ data: { adminId, couponId, isActive } });
    },
    onSuccess: () => {
      toast.success("Coupon status updated!");
      qc.invalidateQueries({ queryKey: ["admin-coupons-list"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update coupon status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (couponId: string) => {
      return deleteCouponAdmin({ data: { adminId, couponId } });
    },
    onSuccess: (res) => {
      toast.success(res.message);
      qc.invalidateQueries({ queryKey: ["admin-coupons-list"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete coupon");
    },
  });

  const resetForm = () => {
    setNewCode("");
    setNewDesc("");
    setNewType("percentage");
    setNewValue(100);
    setNewAppliesTo("certificate");
    setNewUsageLimit(0);
    setNewSingleUse(true);
    setNewExpiresAt("");
    setNewActive(true);
  };

  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter((c: any) => c.is_active).length;
    const totalRedeemed = coupons.reduce((acc: number, c: any) => acc + (c.redemption_count || 0), 0);
    const freeCoupons = coupons.filter(
      (c: any) => c.discount_type === "free" || (c.discount_type === "percentage" && c.discount_value >= 100)
    ).length;

    return { total, active, totalRedeemed, freeCoupons };
  }, [coupons]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Coupon code ${text} copied!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Tag className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground">Coupons & Promos</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Create and manage promotional discounts, 100% Free certificate waivers, and usage limits.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="rounded-xl h-10 gap-2 border-border/60"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>

          <Button
            onClick={() => {
              resetForm();
              setCreateOpen(true);
            }}
            className="rounded-xl h-10 px-5 font-bold brand-gradient text-white border-0 shadow-md gap-2"
          >
            <Plus className="size-4" /> Create Coupon
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/50 shadow-sm bg-card/80 p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Coupons</p>
          <p className="text-3xl font-extrabold text-foreground mt-2">{stats.total}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Configured in system</p>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm bg-card/80 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Coupons</p>
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{stats.active}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Ready for redemption</p>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm bg-card/80 p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">100% Free Waivers</p>
          <p className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-2">{stats.freeCoupons}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Zero-fee certificate passes</p>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm bg-card/80 p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Redemptions</p>
          <p className="text-3xl font-extrabold text-primary mt-2">{stats.totalRedeemed}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Claims by students</p>
        </Card>
      </div>

      {/* Coupons Table */}
      <Card className="rounded-2xl border-border/50 shadow-sm bg-card/80 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/30 text-muted-foreground font-semibold border-b border-border/30">
                <tr>
                  <th className="py-3.5 px-4">Coupon Code</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Applies To</th>
                  <th className="py-3.5 px-4">Usage / Limit</th>
                  <th className="py-3.5 px-4">Expiry Date</th>
                  <th className="py-3.5 px-4">Active</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <Loader2 className="size-6 animate-spin mx-auto mb-2 text-primary" />
                      Loading coupons...
                    </td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      No coupons created yet. Click "Create Coupon" to get started.
                    </td>
                  </tr>
                ) : (
                  coupons.map((c: any) => {
                    const isFree =
                      c.discount_type === "free" ||
                      (c.discount_type === "percentage" && c.discount_value >= 100);
                    const isExpired = c.expires_at && new Date(c.expires_at) < new Date();

                    return (
                      <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                        {/* Code */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-sm text-foreground bg-primary/10 text-primary px-2.5 py-1 rounded-lg">
                              {c.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(c.code)}
                              className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                            >
                              <Copy className="size-3" />
                            </button>
                          </div>
                          {c.description && (
                            <p className="text-[11px] text-muted-foreground mt-1 max-w-xs truncate" title={c.description}>
                              {c.description}
                            </p>
                          )}
                        </td>

                        {/* Discount */}
                        <td className="py-3.5 px-4">
                          {isFree ? (
                            <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20 font-bold text-[11px] gap-1">
                              <Sparkles className="size-3" /> 100% FREE
                            </Badge>
                          ) : c.discount_type === "percentage" ? (
                            <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                              {c.discount_value}% OFF
                            </span>
                          ) : (
                            <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">
                              ₹{c.discount_value} OFF
                            </span>
                          )}
                        </td>

                        {/* Applies To */}
                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                            {c.applies_to || "certificate"}
                          </Badge>
                          {c.single_use_per_user && (
                            <span className="text-[10px] text-muted-foreground block mt-0.5">1 per student</span>
                          )}
                        </td>

                        {/* Usage / Limit */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-foreground">
                            {c.current_uses} {c.max_uses > 0 ? `/ ${c.max_uses}` : "/ Unlimited"}
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {c.redemption_count || c.current_uses} redeemed
                          </span>
                        </td>

                        {/* Expiry */}
                        <td className="py-3.5 px-4">
                          {c.expires_at ? (
                            <div>
                              <div
                                className={`text-xs ${
                                  isExpired ? "text-red-500 font-bold" : "text-muted-foreground"
                                }`}
                              >
                                {new Date(c.expires_at).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </div>
                              {isExpired && (
                                <Badge variant="destructive" className="text-[9px] px-1.5 py-0 mt-0.5">
                                  Expired
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Never</span>
                          )}
                        </td>

                        {/* Active Toggle */}
                        <td className="py-3.5 px-4">
                          <Switch
                            checked={c.is_active}
                            onCheckedChange={(val) =>
                              toggleMutation.mutate({ couponId: c.id, isActive: val })
                            }
                          />
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 rounded-xl text-xs gap-1 border-border/60"
                              onClick={() => setSelectedCouponForRedemptions({ id: c.id, code: c.code })}
                            >
                              <Users className="size-3.5" /> Redemptions ({c.redemption_count || c.current_uses})
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="size-8 p-0 text-red-500 hover:text-red-600 rounded-xl"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete/deactivate coupon "${c.code}"?`)) {
                                  deleteMutation.mutate(c.id);
                                }
                              }}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Coupon Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="size-5 text-primary" />
              <span>Create New Coupon</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Add an admin-controlled coupon code for students to apply during certificate or application checkout.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Coupon Code */}
            <div className="space-y-1.5">
              <Label htmlFor="createCode" className="text-xs font-bold text-foreground">
                Coupon Code *
              </Label>
              <Input
                id="createCode"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="e.g. SKYROFREE, FIRST100, SUMMER50"
                className="h-10 rounded-xl font-mono text-sm font-bold uppercase"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="createDesc" className="text-xs font-bold text-foreground">
                Description / Purpose
              </Label>
              <Input
                id="createDesc"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="e.g. 100% Free certificate for top performing cohort"
                className="h-10 rounded-xl text-xs"
              />
            </div>

            {/* Discount Type & Value */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Discount Type *</Label>
                <select
                  value={newType}
                  onChange={(e) => {
                    const t = e.target.value as any;
                    setNewType(t);
                    if (t === "free") setNewValue(100);
                  }}
                  className="h-10 w-full rounded-xl text-xs bg-background border border-border/60 px-3 font-semibold text-foreground focus:outline-none"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                  <option value="free">100% FREE Certificate</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Discount Value *</Label>
                <Input
                  type="number"
                  min="0"
                  max={newType === "percentage" ? 100 : 10000}
                  value={newType === "free" ? 100 : newValue}
                  disabled={newType === "free"}
                  onChange={(e) => setNewValue(Number(e.target.value))}
                  className="h-10 rounded-xl font-bold"
                />
              </div>
            </div>

            {/* Applies To & Usage Limit */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Applies To *</Label>
                <select
                  value={newAppliesTo}
                  onChange={(e) => setNewAppliesTo(e.target.value as any)}
                  className="h-10 w-full rounded-xl text-xs bg-background border border-border/60 px-3 font-semibold text-foreground focus:outline-none"
                >
                  <option value="certificate">Certificate Fee</option>
                  <option value="application">Application Fee</option>
                  <option value="both">Both Fees</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">
                  Total Usage Limit (0 = Unlimited)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={newUsageLimit}
                  onChange={(e) => setNewUsageLimit(Math.max(0, Number(e.target.value)))}
                  className="h-10 rounded-xl font-bold"
                />
              </div>
            </div>

            {/* Expiry Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Expiry Date & Time (Optional)</Label>
              <Input
                type="datetime-local"
                value={newExpiresAt}
                onChange={(e) => setNewExpiresAt(e.target.value)}
                className="h-10 rounded-xl text-xs"
              />
            </div>

            {/* Toggles */}
            <div className="pt-2 border-t border-border/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">Single Use Per Student</p>
                  <p className="text-[11px] text-muted-foreground">
                    Prevents the same student from redeeming this coupon multiple times.
                  </p>
                </div>
                <Switch checked={newSingleUse} onCheckedChange={setNewSingleUse} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">Enable Coupon Immediately</p>
                  <p className="text-[11px] text-muted-foreground">Students can apply this code right away.</p>
                </div>
                <Switch checked={newActive} onCheckedChange={setNewActive} />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-10"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={createMutation.isPending || !newCode.trim()}
              onClick={() => createMutation.mutate()}
              className="rounded-xl h-10 px-5 font-bold brand-gradient text-white border-0 shadow-md gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Creating...
                </>
              ) : (
                "Create Coupon"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Redemptions List Dialog */}
      <Dialog
        open={Boolean(selectedCouponForRedemptions)}
        onOpenChange={(open) => {
          if (!open) setSelectedCouponForRedemptions(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="size-5 text-primary" />
              <span>Redemption History: {selectedCouponForRedemptions?.code}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              List of all students who have redeemed this coupon.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-96 overflow-y-auto py-2">
            {loadingRedemptions ? (
              <div className="py-12 text-center text-muted-foreground">
                <Loader2 className="size-6 animate-spin mx-auto mb-2 text-primary" />
                Loading redemptions...
              </div>
            ) : redemptions.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No redemptions recorded for this coupon yet.
              </div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/30 text-muted-foreground font-semibold border-b border-border/30">
                  <tr>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Intern ID</th>
                    <th className="py-2.5 px-3">Domain</th>
                    <th className="py-2.5 px-3">Discount</th>
                    <th className="py-2.5 px-3">Redeemed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {redemptions.map((r: any) => (
                    <tr key={r.id} className="hover:bg-muted/20">
                      <td className="py-2.5 px-3 font-bold text-foreground">
                        {r.student_name || "Student"}
                        <span className="block text-[10px] text-muted-foreground font-normal">
                          {r.student_email}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">{r.intern_id || "—"}</td>
                      <td className="py-2.5 px-3 capitalize">{r.domain || "—"}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{r.discount_amount}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {new Date(r.redeemed_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
