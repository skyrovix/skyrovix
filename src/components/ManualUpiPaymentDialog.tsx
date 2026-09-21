import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { submitPaymentProof, validateCouponServer, claimFreeCouponCertificate } from "@/lib/fee-service";
import {
  CreditCard,
  QrCode,
  Copy,
  ExternalLink,
  Upload,
  CheckCircle2,
  Clock,
  Loader2,
  FileImage,
  AlertCircle,
  Tag,
  Sparkles,
  X,
  Shield,
} from "lucide-react";

interface ManualUpiPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  paymentType: "application" | "certificate";
  amount: number;
  upiId: string;
  payeeName: string;
  qrCodeUrl?: string | null;
  applicationId?: string;
  userId: string;
  couponCode?: string | null;
  allowCoupon?: boolean;
  onSuccess?: () => void;
}

export function ManualUpiPaymentDialog({
  open,
  onOpenChange,
  title,
  description,
  paymentType,
  amount: initialAmount,
  upiId,
  payeeName,
  qrCodeUrl,
  applicationId,
  userId,
  couponCode: defaultCouponCode,
  allowCoupon = true,
  onSuccess,
}: ManualUpiPaymentDialogProps) {
  const [utrNumber, setUtrNumber] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState(defaultCouponCode || "");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: string;
    discountAmount: number;
    finalAmount: number;
  } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const effectiveAmount = appliedCoupon ? appliedCoupon.finalAmount : initialAmount;
  const isFreeClaim = effectiveAmount === 0;

  const displayTitle =
    title || (paymentType === "application" ? "Application Fee Payment" : "Certificate Fee Payment");
  const displayDesc =
    description ||
    (paymentType === "application"
      ? "Complete your application fee payment to proceed with admin verification and offer letter issuance."
      : "Complete your certificate fee payment to proceed with admin verification and certificate issuance.");

  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${effectiveAmount}&cu=INR&tn=${encodeURIComponent(
    paymentType === "application" ? "Skyrovix Application Fee" : "Skyrovix Certificate Fee"
  )}`;

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId);
    toast.success("UPI ID copied to clipboard!");
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setValidatingCoupon(true);
    try {
      const res = await validateCouponServer({
        data: {
          code: couponInput.trim(),
          userId,
          applicationId,
          target: paymentType,
        },
      });
      if (res.valid) {
        setAppliedCoupon({
          code: res.code || couponInput.trim(),
          discountType: res.discountType || "fixed",
          discountAmount: res.discountAmount,
          finalAmount: res.finalAmount,
        });
        if (res.finalAmount === 0) {
          toast.success("🎉 100% Free Certificate Waiver applied! No payment screenshot required.");
        } else {
          toast.success(`Coupon applied! Saved ₹${res.discountAmount}`);
        }
      } else {
        toast.error(res.error || "Invalid coupon code");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to validate coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, JPEG)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Screenshot file must be under 10MB");
      return;
    }

    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. If 100% free coupon applied, directly claim free waiver
    if (isFreeClaim) {
      if (!appliedCoupon?.code) {
        toast.error("Coupon code required for free claim");
        return;
      }
      setSubmitting(true);
      const toastId = toast.loading("Claiming your free certificate waiver...");
      try {
        const res = await claimFreeCouponCertificate({
          data: {
            userId,
            applicationId: applicationId!,
            couponCode: appliedCoupon.code,
          },
        });
        toast.success(res.message || "Free certificate waiver claimed successfully!", { id: toastId });
        onOpenChange(false);
        onSuccess?.();
        return;
      } catch (err: any) {
        toast.error(err.message || "Failed to claim free certificate", { id: toastId });
        return;
      } finally {
        setSubmitting(false);
      }
    }

    // 2. Otherwise require valid UTR and Screenshot
    const cleanUtr = utrNumber.trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      toast.error("Please enter a valid 12-digit UTR / UPI Transaction Reference number");
      return;
    }

    if (!screenshotFile) {
      toast.error("Please upload your payment confirmation screenshot");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Uploading payment proof and submitting details...");

    try {
      // 1. Upload screenshot to Supabase storage
      let screenshotUrl: string | null = null;
      const ext = screenshotFile.name.split(".").pop() || "png";
      const filePath = `${userId}/${Date.now()}_${paymentType}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("payment-screenshots")
        .upload(filePath, screenshotFile, { upsert: true });

      if (uploadErr) {
        console.warn("[Storage upload error]:", uploadErr.message);
      } else {
        const { data: urlData } = supabase.storage
          .from("payment-screenshots")
          .getPublicUrl(filePath);
        screenshotUrl = urlData?.publicUrl || null;
      }

      // 2. Submit payment proof via server function
      const res = await submitPaymentProof({
        data: {
          userId,
          applicationId: applicationId || null,
          paymentType,
          utrNumber: cleanUtr,
          screenshotUrl,
          couponCode: appliedCoupon?.code || defaultCouponCode || null,
        },
      });

      if (!res.success) {
        throw new Error("Failed to submit payment details");
      }

      toast.success(
        "Payment submitted successfully! Your submission is now pending admin verification.",
        { id: toastId, duration: 6000 }
      );

      // Reset state
      setUtrNumber("");
      setScreenshotFile(null);
      setScreenshotPreview(null);
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit payment proof", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-3xl p-0 overflow-hidden bg-card border-border/60 shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-border/30 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 text-primary grid place-items-center">
              <CreditCard className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">{displayTitle}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {displayDesc}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Mandatory Skyrovix Disclaimer */}
          {paymentType === "application" ? (
            <div className="rounded-2xl border border-blue-200/80 bg-blue-50/80 dark:border-blue-900/40 dark:bg-blue-950/40 p-3.5 text-xs text-blue-900 dark:text-blue-200 leading-relaxed shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-bold flex items-center gap-1.5 text-blue-800 dark:text-blue-300">
                  <Shield className="size-3.5" /> Application Processing Fee
                </p>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 text-[10px] font-bold">
                  Application Processing Fee — Not a Certification Fee
                </Badge>
              </div>
              <p className="text-[11px] leading-relaxed">
                Application processing fee only. This charge is applicable only to your internship application. It is NOT a certification fee. Certificate charges, if applicable, are separate and are governed by the certificate eligibility and promotional rules.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/80 dark:border-indigo-900/40 dark:bg-indigo-950/40 p-3.5 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-bold flex items-center gap-1.5 text-indigo-800 dark:text-indigo-300">
                  <Shield className="size-3.5" /> Certificate Issuance Fee
                </p>
                <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300 text-[10px] font-bold">
                  Official Certificate Verification & Issuance
                </Badge>
              </div>
              <p className="text-[11px] leading-relaxed">
                Standard certificate issuance fee for verified internship completion. This charge is applicable to applications not covered by promotional certificate waiver offers.
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-12 gap-6 items-start">
            {/* Left: QR Code & UPI Details (hidden if free claim) */}
            {!isFreeClaim ? (
              <div className="md:col-span-5 rounded-2xl border border-border/40 bg-gradient-to-br from-slate-50/60 to-white dark:from-slate-800/40 dark:to-slate-900/40 p-5 flex flex-col items-center text-center gap-3 shadow-sm">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-muted-foreground">
                  Scan & Pay via any UPI App
                </span>

                {/* QR Container */}
                <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 flex items-center justify-center size-44 overflow-hidden">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="Scan UPI QR Code"
                      className="size-full object-contain"
                    />
                  ) : (
                    <QRCodeSVG
                      value={upiIntentUrl}
                      size={160}
                      includeMargin={true}
                      level="M"
                      bgColor="#ffffff"
                      fgColor="#000000"
                      style={{ width: "100%", height: "auto" }}
                    />
                  )}
                </div>

                {/* Tap to Pay Direct Button */}
                <a
                  href={upiIntentUrl}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <ExternalLink className="size-3.5" /> Pay in UPI App
                </a>

                {/* Supported Apps */}
                <div className="flex gap-1 text-[9px] font-bold flex-wrap justify-center pt-1 border-t border-border/20 w-full">
                  <span className="bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded">GPay</span>
                  <span className="bg-purple-600/10 text-purple-600 px-2 py-0.5 rounded">PhonePe</span>
                  <span className="bg-sky-600/10 text-sky-600 px-2 py-0.5 rounded">Paytm</span>
                  <span className="bg-emerald-600/10 text-emerald-600 px-2 py-0.5 rounded">BHIM</span>
                </div>

                {/* UPI ID */}
                <div className="w-full pt-1 border-t border-border/20 text-left space-y-1">
                  <p className="text-[10px] text-muted-foreground font-semibold">UPI ID</p>
                  <div className="flex items-center justify-between bg-muted/40 px-2.5 py-1.5 rounded-lg border border-border/30">
                    <span className="font-mono text-xs font-bold text-foreground truncate select-all">
                      {upiId}
                    </span>
                    <button
                      type="button"
                      onClick={copyUpi}
                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Payee: <strong className="text-foreground">{payeeName}</strong>
                  </p>
                </div>
              </div>
            ) : (
              <div className="md:col-span-5 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-6 flex flex-col items-center text-center gap-3">
                <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-600 grid place-items-center">
                  <Sparkles className="size-8" />
                </div>
                <h4 className="font-bold text-base text-foreground">100% Free Certificate</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your coupon code covers the entire certificate fee. No payment proof is needed.
                </p>
                <Badge className="bg-emerald-600 text-white font-mono text-xs mt-2">
                  CODE: {appliedCoupon?.code}
                </Badge>
              </div>
            )}

            {/* Right: Payment Instructions & Submission Form */}
            <div className="md:col-span-7 space-y-4">
              {/* Fee Summary Banner */}
              <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-emerald-50/40 to-white dark:from-emerald-950/20 dark:to-slate-900/40 p-4 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Total Amount Due
                  </p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <p className={`text-2xl font-black ${isFreeClaim ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
                      ₹{effectiveAmount}
                    </p>
                    {appliedCoupon && appliedCoupon.discountAmount > 0 && (
                      <span className="text-xs text-muted-foreground line-through">
                        ₹{initialAmount}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-muted-foreground bg-secondary/60 px-2.5 py-1 rounded-lg">
                    {isFreeClaim ? "100% Free Waiver" : "Manual UPI"}
                  </span>
                  {appliedCoupon && (
                    <p className="text-[10px] text-emerald-600 font-bold mt-1">
                      Saved ₹{appliedCoupon.discountAmount}!
                    </p>
                  )}
                </div>
              </div>

              {/* Certificate Coupon Input (Available only after tasks approved) */}
              {paymentType === "certificate" && allowCoupon && (
                <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-3.5 space-y-2">
                  <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Tag className="size-3.5 text-primary" /> Certificate Coupon / Promo Code
                  </Label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-2.5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Sparkles className="size-4 text-emerald-600" />
                        <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          {appliedCoupon.code}
                        </span>
                        <Badge className="bg-emerald-600 text-white text-[10px]">
                          {appliedCoupon.discountAmount >= initialAmount ? "100% OFF" : `-₹${appliedCoupon.discountAmount}`}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-red-500"
                      >
                        <X className="size-3.5 mr-1" /> Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="e.g. SKYROFREE"
                        className="h-9 text-xs font-mono uppercase bg-background"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon || !couponInput.trim()}
                        className="h-9 px-4 text-xs font-bold shrink-0"
                      >
                        {validatingCoupon ? <Loader2 className="size-3.5 animate-spin" /> : "Apply"}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Step by step guide (if not free) */}
              {!isFreeClaim && (
                <div className="rounded-xl border border-border/30 bg-muted/20 p-3 text-[11px] text-muted-foreground space-y-1">
                  <p className="font-bold text-foreground text-xs">Payment Steps:</p>
                  <ol className="list-decimal list-inside space-y-0.5">
                    <li>Scan QR or pay ₹{effectiveAmount} to <strong>{upiId}</strong>.</li>
                    <li>Copy the 12-digit UPI UTR / Transaction reference number.</li>
                    <li>Take a clear screenshot of your completed payment receipt.</li>
                    <li>Submit below for admin verification.</li>
                  </ol>
                </div>
              )}

              {/* UTR & Screenshot inputs (only if amount > 0) */}
              {!isFreeClaim ? (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="utrInput" className="text-xs font-bold text-foreground">
                      UPI Transaction UTR / Ref Number *
                    </Label>
                    <Input
                      id="utrInput"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder="Enter 12-digit UTR from your UPI app receipt"
                      className="h-10 rounded-xl font-mono text-xs bg-background/50 border-border/60"
                      required
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Look for "UPI Ref No", "UTR", or "Transaction ID" in your app history.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Payment Screenshot Proof *</Label>
                    <div className="border-2 border-dashed border-border/50 hover:border-primary/50 transition-colors rounded-2xl p-4 text-center bg-background/30">
                      {screenshotPreview ? (
                        <div className="flex items-center gap-3">
                          <img
                            src={screenshotPreview}
                            alt="Preview"
                            className="size-14 rounded-lg object-cover border border-border/50 shadow-sm"
                          />
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{screenshotFile?.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {((screenshotFile?.size || 0) / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs text-red-500 hover:text-red-600 h-8"
                            onClick={() => {
                              setScreenshotFile(null);
                              setScreenshotPreview(null);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <label className="cursor-pointer block space-y-1">
                          <Upload className="size-6 mx-auto text-muted-foreground/60" />
                          <span className="text-xs font-bold text-primary block">Click to upload screenshot</span>
                          <span className="text-[10px] text-muted-foreground block">
                            PNG, JPG, or JPEG (Max 10MB)
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                            required
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting || !utrNumber.trim() || !screenshotFile}
                    className="w-full h-11 rounded-2xl font-bold text-xs brand-gradient text-white border-0 shadow-lg gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Verifying & Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-4" /> Submit Payment for Admin Verification
                      </>
                    )}
                  </Button>
                </>
              ) : (
                /* Free claim submit button */
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Claiming Waiver...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" /> Claim 100% Free Certificate Waiver
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
