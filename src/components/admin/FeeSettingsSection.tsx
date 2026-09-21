import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  getAdminFeeSettings,
  updateAdminFeeSettings,
  type AdminFeeSettingsResponse,
} from "@/lib/fee-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  IndianRupee,
  QrCode,
  Upload,
  CheckCircle2,
  Clock,
  Shield,
  Save,
  Loader2,
  History,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Sparkles,
  Calendar,
  Tag,
  AlertTriangle,
} from "lucide-react";

interface FeeSettingsSectionProps {
  adminId: string;
}

export function FeeSettingsSection({ adminId }: FeeSettingsSectionProps) {
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery<AdminFeeSettingsResponse>({
    queryKey: ["admin-fee-settings", adminId],
    queryFn: async () => {
      let resolvedAdminId = adminId;
      if (!resolvedAdminId) {
        const { data: userData } = await supabase.auth.getUser();
        resolvedAdminId = userData?.user?.id || "";
      }
      return getAdminFeeSettings({ data: { adminId: resolvedAdminId } });
    },
    enabled: true,
  });

  // Local state for editing
  const [appFeeAmount, setAppFeeAmount] = useState<number>(50);
  const [appFeeEnabled, setAppFeeEnabled] = useState<boolean>(true);

  const [certFeeAmount, setCertFeeAmount] = useState<number>(100);
  const [certFeeEnabled, setCertFeeEnabled] = useState<boolean>(true);

  // Certificate Free Offer state
  const [offerEnabled, setOfferEnabled] = useState<boolean>(false);
  const [offerAmount, setOfferAmount] = useState<number>(0);
  const [offerName, setOfferName] = useState<string>("Certificate Free Offer");
  const [offerStartAt, setOfferStartAt] = useState<string>("");
  const [offerEndAt, setOfferEndAt] = useState<string>("");

  const [upiId, setUpiId] = useState<string>("hariharanmahesh34@oksbi");
  const [payeeName, setPayeeName] = useState<string>("Hariharan Mahesh");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const [uploadingQr, setUploadingQr] = useState(false);

  // Sync state when data loads
  useEffect(() => {
    if (!data?.settings) return;
    const app = data.settings.find((s) => s.fee_type === "application");
    const cert = data.settings.find((s) => s.fee_type === "certificate");

    if (app) {
      setAppFeeAmount(app.amount);
      setAppFeeEnabled(app.is_enabled);
    }
    if (cert) {
      setCertFeeAmount(cert.amount);
      setCertFeeEnabled(cert.is_enabled);
      setUpiId(cert.upi_id || app?.upi_id || "hariharanmahesh34@oksbi");
      setPayeeName(cert.payee_name || app?.payee_name || "Hariharan Mahesh");
      setQrCodeUrl(cert.qr_code_url || app?.qr_code_url || null);

      setOfferEnabled(Boolean(cert.offer_enabled));
      setOfferAmount(Number(cert.offer_amount ?? 0));
      setOfferName(cert.offer_name || "Certificate Free Offer");
      if (cert.offer_start_at) {
        const d = new Date(cert.offer_start_at);
        setOfferStartAt(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
      }
      if (cert.offer_end_at) {
        const d = new Date(cert.offer_end_at);
        setOfferEndAt(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
      }
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      let resolvedAdminId = adminId;
      if (!resolvedAdminId) {
        const { data: userData } = await supabase.auth.getUser();
        resolvedAdminId = userData?.user?.id || "";
      }
      if (!resolvedAdminId) {
        throw new Error("Admin session not found. Please log in again.");
      }

      if (offerEnabled && offerStartAt && offerEndAt) {
        if (new Date(offerStartAt).getTime() >= new Date(offerEndAt).getTime()) {
          throw new Error("Offer start date must be before end date");
        }
      }

      return updateAdminFeeSettings({
        data: {
          adminId: resolvedAdminId,
          applicationFee: {
            amount: Number(appFeeAmount),
            isEnabled: appFeeEnabled,
          },
          certificateFee: {
            amount: Number(certFeeAmount),
            isEnabled: certFeeEnabled,
          },
          certificateOffer: {
            isEnabled: offerEnabled,
            amount: Number(offerAmount),
            name: offerName.trim() || "Certificate Free Offer",
            startAt: offerStartAt ? new Date(offerStartAt).toISOString() : null,
            endAt: offerEndAt ? new Date(offerEndAt).toISOString() : null,
          },
          upiId: upiId.trim(),
          payeeName: payeeName.trim(),
          qrCodeUrl,
        },
      });
    },
    onSuccess: () => {
      toast.success("Fee settings & promotional offer updated successfully!");
      qc.invalidateQueries({ queryKey: ["admin-fee-settings"] });
      qc.invalidateQueries({ queryKey: ["public-fee-settings"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save fee settings");
    },
  });

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file must be under 5MB");
      return;
    }

    setUploadingQr(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const filePath = `qr/upi_qr_${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("payment-screenshots")
        .upload(filePath, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("payment-screenshots")
        .getPublicUrl(filePath);

      setQrCodeUrl(urlData.publicUrl);
      toast.success("QR code uploaded successfully! Click 'Save Changes' to apply.");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload QR code");
    } finally {
      setUploadingQr(false);
    }
  };

  const appSetting = data?.settings?.find((s) => s.fee_type === "application");
  const certSetting = data?.settings?.find((s) => s.fee_type === "certificate");

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <IndianRupee className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground">Fee Management</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Configure platform fee policies, manual UPI payment details, and review audit history.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
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
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="rounded-xl h-10 px-5 font-bold brand-gradient text-white border-0 shadow-md gap-2"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="size-4" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Grid: Application Fee & Certificate Fee */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Application Fee Card */}
        <Card className="rounded-2xl border-border/50 shadow-sm bg-card/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b border-border/30 bg-muted/20 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 grid place-items-center">
                  <IndianRupee className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Application Fee</CardTitle>
                  <CardDescription className="text-xs">Required at internship registration</CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={appFeeEnabled ? "default" : "secondary"}
                  className={`text-[11px] font-bold ${
                    appFeeEnabled
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-slate-500/10 text-muted-foreground border-border/40"
                  }`}
                >
                  {appFeeEnabled ? "Enabled" : "Disabled"}
                </Badge>
                <Switch checked={appFeeEnabled} onCheckedChange={setAppFeeEnabled} />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            {/* Quick Presets */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Quick Fee Presets
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 50, 100, 150].map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant={appFeeAmount === amount ? "default" : "outline"}
                    size="sm"
                    className={`rounded-xl h-10 font-bold text-xs ${
                      appFeeAmount === amount
                        ? "bg-blue-600 text-white shadow-sm"
                        : "hover:bg-muted/60 border-border/60"
                    }`}
                    onClick={() => {
                      setAppFeeAmount(amount);
                      if (amount > 0) setAppFeeEnabled(true);
                      else setAppFeeEnabled(false);
                    }}
                  >
                    ₹{amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="appFeeInput" className="text-xs font-bold text-foreground">
                Custom Application Fee (₹)
              </Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-sm">
                  ₹
                </span>
                <Input
                  id="appFeeInput"
                  type="number"
                  min="0"
                  step="1"
                  value={appFeeAmount}
                  onChange={(e) => setAppFeeAmount(Math.max(0, Number(e.target.value)))}
                  className="pl-8 h-11 rounded-xl text-base font-bold bg-background/50 border-border/60"
                />
              </div>
            </div>

            {/* Explanatory notice */}
            <div className="rounded-xl border border-blue-200/60 bg-blue-50/50 p-3.5 text-xs text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <HelpCircle className="size-3.5 shrink-0" />
                <span>Application Fee Policy</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                {appFeeEnabled && appFeeAmount > 0 ? (
                  <>
                    Students will be required to complete manual UPI payment of{" "}
                    <strong>₹{appFeeAmount}</strong> before receiving their offer letter and dashboard
                    access.
                  </>
                ) : (
                  <>
                    Applications are <strong>100% Free</strong>. Students receive instant approval and
                    offer letters immediately.
                  </>
                )}
              </p>
            </div>

            {/* Footer Status */}
            {appSetting && (
              <div className="pt-2 border-t border-border/20 text-[11px] text-muted-foreground flex justify-between">
                <span>
                  Last updated:{" "}
                  {new Date(appSetting.updated_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {appSetting.admin_name && (
                  <span className="font-semibold text-foreground">by {appSetting.admin_name}</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Normal Certificate Fee Card */}
        <Card className="rounded-2xl border-border/50 shadow-sm bg-card/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b border-border/30 bg-muted/20 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 grid place-items-center">
                  <IndianRupee className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Normal Certificate Fee</CardTitle>
                  <CardDescription className="text-xs">Standard fee for non-promotional applications</CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={certFeeEnabled ? "default" : "secondary"}
                  className={`text-[11px] font-bold ${
                    certFeeEnabled
                      ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20"
                      : "bg-slate-500/10 text-muted-foreground border-border/40"
                  }`}
                >
                  {certFeeEnabled ? "Enabled" : "Disabled"}
                </Badge>
                <Switch checked={certFeeEnabled} onCheckedChange={setCertFeeEnabled} />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            {/* Quick Presets */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Quick Fee Presets
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 50, 100, 150].map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant={certFeeAmount === amount ? "default" : "outline"}
                    size="sm"
                    className={`rounded-xl h-10 font-bold text-xs ${
                      certFeeAmount === amount
                        ? "bg-purple-600 text-white shadow-sm"
                        : "hover:bg-muted/60 border-border/60"
                    }`}
                    onClick={() => {
                      setCertFeeAmount(amount);
                      if (amount > 0) setCertFeeEnabled(true);
                      else setCertFeeEnabled(false);
                    }}
                  >
                    ₹{amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="certFeeInput" className="text-xs font-bold text-foreground">
                Standard Certificate Fee (₹)
              </Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-sm">
                  ₹
                </span>
                <Input
                  id="certFeeInput"
                  type="number"
                  min="0"
                  step="1"
                  value={certFeeAmount}
                  onChange={(e) => setCertFeeAmount(Math.max(0, Number(e.target.value)))}
                  className="pl-8 h-11 rounded-xl text-base font-bold bg-background/50 border-border/60"
                />
              </div>
            </div>

            {/* Policy notice */}
            <div className="rounded-xl border border-purple-200/60 bg-purple-50/50 p-3.5 text-xs text-purple-900 dark:border-purple-900/40 dark:bg-purple-950/20 dark:text-purple-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <HelpCircle className="size-3.5 shrink-0" />
                <span>Standard Certificate Fee Policy</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                This fee applies to applications that are <strong>not eligible</strong> for the Certificate Free Offer.
                {certFeeAmount > 0 ? (
                  <> Students must pay ₹{certFeeAmount} through Manual UPI after all required tasks are admin-verified.</>
                ) : (
                  <> All applications receive free certificates because the standard fee is set to ₹0.</>
                )}
              </p>
            </div>

            {/* Warning if Free Offer is overriding the Certificate Fee */}
            {certFeeEnabled && certFeeAmount > 0 && offerEnabled && (
              <div className="rounded-xl border border-amber-300/80 bg-amber-50/70 dark:bg-amber-950/30 p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5 shadow-sm">
                <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1">
                  <p className="font-bold text-amber-950 dark:text-amber-100">⚠️ Certificate Free Offer is Currently Active!</p>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    The <strong>Certificate Free Offer</strong> below is toggled ON. Students will receive certificates for <strong>₹0 (Free)</strong> instead of paying the ₹{certFeeAmount} standard fee.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px] px-2.5 font-bold border-amber-400 bg-white/70 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 hover:bg-amber-100 rounded-lg cursor-pointer"
                    onClick={() => {
                      setOfferEnabled(false);
                      toast.info("Certificate Free Offer disabled! Click 'Save Changes' to apply.");
                    }}
                  >
                    Disable Free Offer & Enforce ₹{certFeeAmount} Fee
                  </Button>
                </div>
              </div>
            )}

            {/* Footer Status */}
            {certSetting && (
              <div className="pt-2 border-t border-border/20 text-[11px] text-muted-foreground flex justify-between">
                <span>
                  Last updated:{" "}
                  {new Date(certSetting.updated_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {certSetting.admin_name && (
                  <span className="font-semibold text-foreground">by {certSetting.admin_name}</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Certificate Free Offer Promotion Card */}
      <Card className="rounded-2xl border-emerald-300/60 bg-gradient-to-br from-card via-emerald-50/20 to-card shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/30 bg-emerald-50/30 dark:bg-emerald-950/20 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 grid place-items-center">
                <Sparkles className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-bold text-foreground">Certificate Free Offer</CardTitle>
                  <Badge
                    className={`text-[11px] font-bold border ${(() => {
                      if (!offerEnabled) return "bg-slate-500/10 text-muted-foreground border-border/40";
                      if (!offerStartAt || !offerEndAt) return "bg-amber-500/10 text-amber-600 border-amber-300";
                      const now = Date.now();
                      const start = new Date(offerStartAt).getTime();
                      const end = new Date(offerEndAt).getTime();
                      if (now < start) return "bg-blue-500/10 text-blue-600 border-blue-300";
                      if (now > end) return "bg-rose-500/10 text-rose-600 border-rose-300";
                      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
                    })()}`}
                  >
                    {(() => {
                      if (!offerEnabled) return "⚪ Inactive";
                      if (!offerStartAt || !offerEndAt) return "🟡 Inactive (Dates not set)";
                      const now = Date.now();
                      const start = new Date(offerStartAt).getTime();
                      const end = new Date(offerEndAt).getTime();
                      if (now < start) return "🟡 Scheduled";
                      if (now > end) return "🔴 Expired";
                      return "🟢 Active Now";
                    })()}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Temporary promotional offer granting ₹0 certificates to applications submitted during the offer window
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground">
                {offerEnabled ? "Offer Enabled" : "Offer Disabled"}
              </span>
              <Switch checked={offerEnabled} onCheckedChange={setOfferEnabled} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Offer Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Offer Promotion Name</Label>
              <Input
                value={offerName}
                onChange={(e) => setOfferName(e.target.value)}
                placeholder="e.g. Diwali Certificate Free Offer"
                className="h-10 rounded-xl text-sm"
              />
            </div>

            {/* Offer Start Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Offer Start Date & Time</Label>
              <div className="relative">
                <Input
                  type="datetime-local"
                  value={offerStartAt}
                  onChange={(e) => setOfferStartAt(e.target.value)}
                  className="h-10 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            {/* Offer End Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Offer End Date & Time</Label>
              <div className="relative">
                <Input
                  type="datetime-local"
                  value={offerEndAt}
                  onChange={(e) => setOfferEndAt(e.target.value)}
                  className="h-10 rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Promotional Fee Display */}
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Promotional Fee Amount</span>
                <Badge className="bg-emerald-600 text-white font-bold text-xs">₹0 Free</Badge>
              </div>
              <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400/80 leading-relaxed">
                Free during promotional offer period. No payment or screenshot is required for applications that receive this offer entitlement.
              </p>
            </div>

            {/* Eligibility Rules Notice */}
            <div className="rounded-2xl border border-blue-200/80 bg-blue-50/40 dark:bg-blue-950/20 p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-xs text-blue-900 dark:text-blue-300">
                <AlertCircle className="size-3.5 shrink-0" />
                <span>Application-Specific Eligibility Rule</span>
              </div>
              <p className="text-[11px] text-blue-800/80 dark:text-blue-400/80 leading-relaxed">
                Only new applications submitted during this active window receive the offer entitlement. Old applications submitted prior do not qualify retroactively. Once entitled, the application keeps free status permanently.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* UPI & Payment Method Configuration */}
      <Card className="rounded-2xl border-border/50 shadow-sm bg-card/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="border-b border-border/30 bg-muted/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 grid place-items-center">
              <QrCode className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Manual UPI Gateway Configuration</CardTitle>
              <CardDescription className="text-xs">
                Set your receiving UPI VPA and upload the high-resolution QR code
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid md:grid-cols-12 gap-8 items-start">
            {/* Left: Fields */}
            <div className="md:col-span-7 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="upiIdInput" className="text-xs font-bold text-foreground">
                  Receiving UPI ID / VPA *
                </Label>
                <Input
                  id="upiIdInput"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@oksbi"
                  className="h-11 rounded-xl font-mono text-sm bg-background/50 border-border/60"
                />
                <p className="text-[11px] text-muted-foreground">
                  Supported apps: Google Pay, PhonePe, Paytm, BHIM UPI
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payeeNameInput" className="text-xs font-bold text-foreground">
                  Payee Account Name *
                </Label>
                <Input
                  id="payeeNameInput"
                  value={payeeName}
                  onChange={(e) => setPayeeName(e.target.value)}
                  placeholder="e.g. Skyrovix Internships / Hariharan Mahesh"
                  className="h-11 rounded-xl text-sm bg-background/50 border-border/60"
                />
                <p className="text-[11px] text-muted-foreground">
                  Displayed to students in the payment instructions and intent strings.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-foreground">Upload / Replace QR Code Image</Label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 h-11 rounded-xl border border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold transition-colors">
                    <Upload className="size-4" />
                    <span>{uploadingQr ? "Uploading..." : "Choose Image (PNG, JPG)"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleQrUpload}
                      disabled={uploadingQr}
                    />
                  </label>
                  {qrCodeUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-red-500 hover:text-red-600 h-9"
                      onClick={() => setQrCodeUrl(null)}
                    >
                      Remove Custom QR
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  If no custom QR image is uploaded, Skyrovix automatically generates a vector UPI QR code
                  using your UPI ID.
                </p>
              </div>
            </div>

            {/* Right: QR Preview */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl border border-border/40 bg-muted/20 text-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Live QR Preview
              </span>
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center size-48 overflow-hidden">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="UPI QR Code"
                    className="size-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="text-center p-4">
                    <QrCode className="size-16 mx-auto text-slate-400 mb-2" />
                    <span className="text-[10px] text-slate-500 font-semibold block">
                      Auto-generated standard UPI QR active
                    </span>
                  </div>
                )}
              </div>
              <p className="font-mono text-xs font-bold text-foreground bg-secondary/50 px-3 py-1 rounded-lg">
                {upiId}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      {data?.recentLogs && data.recentLogs.length > 0 && (
        <Card className="rounded-2xl border-border/50 shadow-sm bg-card/80 backdrop-blur-sm">
          <CardHeader className="border-b border-border/30 bg-muted/20 pb-4">
            <div className="flex items-center gap-2">
              <History className="size-4 text-muted-foreground" />
              <CardTitle className="text-base font-bold">Recent Fee Audit Logs</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/30 text-muted-foreground font-semibold border-b border-border/30">
                  <tr>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Admin</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {data.recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{log.action}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-foreground">{log.admin_name || "Admin"}</span>
                        {log.admin_email && (
                          <span className="text-[10px] text-muted-foreground block">{log.admin_email}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(log.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground max-w-xs truncate">
                        {typeof log.new_value === "object"
                          ? JSON.stringify(log.new_value).slice(0, 80) + "..."
                          : String(log.new_value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
