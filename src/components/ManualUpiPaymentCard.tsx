import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { submitPaymentProof } from "@/lib/fee-service";
import {
  APPLICATION_FEE_DISCLAIMER,
  APPLICATION_FEE_BADGE,
} from "@/lib/fee-helpers";
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
  Shield,
  ArrowRight,
  Info,
} from "lucide-react";

export interface ManualUpiPaymentCardProps {
  paymentType: "application" | "certificate";
  amount: number;
  upiId: string;
  payeeName: string;
  qrCodeUrl?: string | null;
  applicationId: string;
  userId: string;
  adminNote?: string | null;
  onSuccess?: () => void;
}

export function ManualUpiPaymentCard({
  paymentType,
  amount,
  upiId,
  payeeName,
  qrCodeUrl,
  applicationId,
  userId,
  adminNote,
  onSuccess,
}: ManualUpiPaymentCardProps) {
  const [utrNumber, setUtrNumber] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isAppPayment = paymentType === "application";

  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(
    isAppPayment ? "Skyrovix Application Fee" : "Skyrovix Certificate Fee"
  )}`;

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId);
    toast.success("UPI ID copied to clipboard!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, JPEG, WEBP)");
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
    const toastId = toast.loading("Uploading payment screenshot and submitting proof...");

    try {
      // 1. Upload screenshot to Supabase storage bucket
      let screenshotUrl: string | null = null;
      const ext = screenshotFile.name.split(".").pop() || "png";
      const filePath = `${userId}/${Date.now()}_${paymentType}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("payment-screenshots")
        .upload(filePath, screenshotFile, { upsert: true });

      if (uploadErr) {
        console.warn("[Storage upload warning]:", uploadErr.message);
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
          applicationId,
          paymentType,
          utrNumber: cleanUtr,
          screenshotUrl,
        },
      });

      if (!res.success) {
        throw new Error((res as any).message || (res as any).error || "Failed to submit payment details");
      }

      toast.success(
        "Payment submitted successfully! Your submission is now pending admin verification.",
        { id: toastId, duration: 6000 }
      );

      setUtrNumber("");
      setScreenshotFile(null);
      setScreenshotPreview(null);

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
    <div className="rounded-3xl border border-border/50 bg-white/70 backdrop-blur-xl dark:bg-slate-900/70 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/30 pb-5">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl brand-gradient text-white grid place-items-center shadow-md">
            <CreditCard className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-bold text-foreground">
                {isAppPayment ? "APPLICATION FEE" : "CERTIFICATE PAYMENT"}
              </h2>
              <Badge variant="outline" className="text-xs font-bold px-2.5 py-0.5">
                {isAppPayment ? "Manual UPI" : "Manual UPI Verification"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isAppPayment
                ? `Application Processing Fee: ₹${amount}`
                : `Certificate Issuance Fee: ₹${amount}`}
            </p>
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 self-start sm:self-auto bg-primary/5 dark:bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Amount Due:</span>
          <span className="text-2xl font-black text-foreground">₹{amount}</span>
        </div>
      </div>

      {/* Admin Resubmission / Rejection Note if present */}
      {adminNote && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-950/30 p-4 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
            <AlertCircle className="size-4 shrink-0 text-amber-600" />
            <span>Admin Review Note:</span>
          </div>
          <p className="text-amber-800 dark:text-amber-300 pl-6 leading-relaxed">
            "{adminNote}"
          </p>
        </div>
      )}

      {/* Mandatory Dynamic Disclaimer */}
      {isAppPayment ? (
        <div className="rounded-2xl border border-blue-200/80 bg-blue-50/80 dark:border-blue-900/40 dark:bg-blue-950/40 p-4 text-xs text-blue-900 dark:text-blue-200 leading-relaxed shadow-sm space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-bold flex items-center gap-1.5 text-blue-800 dark:text-blue-300">
              <Shield className="size-4" /> Application Processing Fee
            </p>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 border-blue-300 text-[10px] font-bold">
              {APPLICATION_FEE_BADGE}
            </Badge>
          </div>
          <p className="text-xs leading-relaxed opacity-95">
            {APPLICATION_FEE_DISCLAIMER}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/80 dark:border-indigo-900/40 dark:bg-indigo-950/40 p-4 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed shadow-sm space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-bold flex items-center gap-1.5 text-indigo-800 dark:text-indigo-300">
              <Shield className="size-4" /> CERTIFICATE ISSUANCE FEE
            </p>
            <Badge variant="outline" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200 border-indigo-300 text-[10px] font-bold">
              Official Certificate Verification
            </Badge>
          </div>
          <p className="text-xs leading-relaxed opacity-95">
            This fee applies to applications that are not covered by the Certificate Free Offer.
          </p>
        </div>
      )}

      {/* Main Grid: QR & UPI Info (Left) + Submission Form (Right) */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: QR Code & UPI Details */}
        <div className="lg:col-span-5 rounded-2xl border border-border/50 bg-gradient-to-br from-slate-50/70 to-white dark:from-slate-800/30 dark:to-slate-900/40 p-6 flex flex-col items-center text-center gap-4 shadow-sm">
          <span className="text-[11px] uppercase font-extrabold tracking-wider text-muted-foreground">
            Scan QR Code via any UPI App
          </span>

          {/* QR Container */}
          <div className="p-3.5 bg-white rounded-2xl shadow-md border border-slate-200 flex items-center justify-center size-52 overflow-hidden">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="Scan UPI QR Code"
                className="size-full object-contain"
              />
            ) : (
              <QRCodeSVG
                value={upiIntentUrl}
                size={180}
                includeMargin={true}
                level="M"
                bgColor="#ffffff"
                fgColor="#000000"
                style={{ width: "100%", height: "auto" }}
              />
            )}
          </div>

          {/* Direct UPI App Deep-link */}
          <a
            href={upiIntentUrl}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <ExternalLink className="size-4" /> Pay in UPI App (GPay / PhonePe / Paytm)
          </a>

          {/* Supported UPI Apps */}
          <div className="flex gap-1.5 text-[10px] font-bold flex-wrap justify-center pt-2 border-t border-border/30 w-full">
            <span className="bg-blue-600/10 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-lg">GPay</span>
            <span className="bg-purple-600/10 text-purple-600 dark:text-purple-400 px-2.5 py-0.5 rounded-lg">PhonePe</span>
            <span className="bg-sky-600/10 text-sky-600 dark:text-sky-400 px-2.5 py-0.5 rounded-lg">Paytm</span>
            <span className="bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-lg">BHIM / Any Bank</span>
          </div>

          {/* UPI ID Details */}
          <div className="w-full pt-2 border-t border-border/30 text-left space-y-1.5">
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Admin UPI ID</p>
            <div className="flex items-center justify-between bg-muted/50 px-3 py-2 rounded-xl border border-border/40">
              <span className="font-mono text-xs font-bold text-foreground truncate select-all">
                {upiId}
              </span>
              <button
                type="button"
                onClick={copyUpi}
                className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors ml-2"
                title="Copy UPI ID"
              >
                <Copy className="size-4" />
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Payee Name: <strong className="text-foreground">{payeeName}</strong>
            </p>
          </div>
        </div>

        {/* Right Column: 5-Step Instructions & Submission Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Instructions */}
          <div className="rounded-2xl border border-border/40 bg-muted/20 p-4 space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Info className="size-3.5 text-primary" /> Instructions:
            </p>
            <ol className="space-y-1.5 text-xs text-muted-foreground pl-1">
              <li className="flex items-start gap-2">
                <span className="size-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] grid place-items-center shrink-0 mt-0.5">1</span>
                <span>Scan the QR code using any UPI app (GPay, PhonePe, Paytm, etc.).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="size-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] grid place-items-center shrink-0 mt-0.5">2</span>
                <span>Complete the UPI payment of exactly <strong>₹{amount}</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="size-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] grid place-items-center shrink-0 mt-0.5">3</span>
                <span>Enter the 12-digit UTR / UPI Transaction Reference ID below.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="size-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] grid place-items-center shrink-0 mt-0.5">4</span>
                <span>Upload your payment confirmation screenshot.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="size-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] grid place-items-center shrink-0 mt-0.5">5</span>
                <span>Submit for admin manual verification.</span>
              </li>
            </ol>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* UTR Input */}
            <div className="space-y-1.5">
              <Label htmlFor="utrInput" className="text-xs font-bold text-foreground">
                UTR / UPI Transaction ID *
              </Label>
              <Input
                id="utrInput"
                placeholder="e.g. 423819482012 (12-digit reference)"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                className="h-11 rounded-xl font-mono text-sm uppercase tracking-wider bg-background/60 border-border/60"
                maxLength={30}
                required
              />
              <p className="text-[10px] text-muted-foreground">
                Check your UPI app transaction history for the 12-digit UTR or Transaction Ref number.
              </p>
            </div>

            {/* Screenshot Upload */}
            <div className="space-y-1.5">
              <Label htmlFor="screenshotInput" className="text-xs font-bold text-foreground">
                Payment Screenshot Proof *
              </Label>
              <div className="border-2 border-dashed border-border/70 hover:border-primary/60 rounded-2xl p-4 transition-all bg-background/40">
                <input
                  id="screenshotInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="screenshotInput"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2 text-center"
                >
                  {screenshotPreview ? (
                    <div className="relative group size-full max-h-48 flex items-center justify-center">
                      <img
                        src={screenshotPreview}
                        alt="Screenshot Preview"
                        className="max-h-44 rounded-xl object-contain shadow-sm border border-border/40"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white text-xs font-bold">
                        Click to change image
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="size-12 rounded-2xl bg-muted grid place-items-center text-muted-foreground">
                        <Upload className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Click to upload payment screenshot</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, JPEG up to 10MB</p>
                      </div>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={submitting || !utrNumber.trim() || !screenshotFile}
              className="w-full brand-gradient text-white border-0 rounded-2xl h-12 text-sm font-extrabold shadow-md gap-2 mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Submitting Payment Proof...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" /> Submit Payment for Verification
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
