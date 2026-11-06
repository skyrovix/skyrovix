import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Award,
  FileText,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
} from "lucide-react";
import { resendStudentDocumentEmail } from "@/lib/admin-service";
import { getDomain } from "@/lib/constants";

export interface ResendDocumentEmailTarget {
  id?: string;
  application_id?: string;
  full_name: string;
  email: string;
  intern_id?: string;
  domain?: string;
  duration?: number;
  certificate_id?: string;
  certificate_generated?: boolean | number;
  certificates?: Array<{ certificate_id: string }>;
  applications?: any;
}

interface ResendDocumentEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app: ResendDocumentEmailTarget | null;
  defaultDoc?: "offer_letter" | "certificate" | "both";
  onSuccess?: () => void;
}

export function ResendDocumentEmailDialog({
  open,
  onOpenChange,
  app,
  defaultDoc = "both",
  onSuccess,
}: ResendDocumentEmailDialogProps) {
  const qc = useQueryClient();
  const [docType, setDocType] = useState<"offer_letter" | "certificate" | "both">(defaultDoc);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (app) {
      setRecipientEmail(app.email || "");
      setDocType(defaultDoc);
    }
  }, [app, defaultDoc, open]);

  if (!app) return null;

  const domainObj = getDomain(app.domain || "");
  const domainTitle = domainObj?.name ?? app.domain ?? "Internship Program";
  const existingCertId =
    app.certificate_id ||
    (Array.isArray(app.certificates) && app.certificates.length > 0
      ? app.certificates[0].certificate_id
      : null);

  const handleSend = async () => {
    const trimmedEmail = recipientEmail.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      toast.error("Please enter a valid recipient email address.");
      return;
    }

    setIsSending(true);
    const docLabel =
      docType === "both"
        ? "Offer Letter & Certificate"
        : docType === "offer_letter"
        ? "Offer Letter"
        : "Certificate";

    const toastId = toast.loading(`Sending official ${docLabel} PDF to ${trimmedEmail}...`);

    try {
      const targetAppId = app.id || app.application_id || app.applications?.id;
      const targetInternId = app.intern_id || app.applications?.intern_id;
      const targetCertId = app.certificate_id || existingCertId || undefined;

      const res = await resendStudentDocumentEmail({
        data: {
          applicationId: targetAppId,
          internId: targetInternId,
          certificateId: targetCertId,
          studentEmail: app.email || app.applications?.email,
          documentType: docType,
          targetEmail: trimmedEmail,
        },
      });

      if (res.success) {
        toast.success(
          `✅ ${docLabel} sent successfully to ${trimmedEmail}!`,
          { id: toastId, duration: 6000 }
        );
        qc.invalidateQueries({ queryKey: ["admin-apps"] });
        qc.invalidateQueries({ queryKey: ["admin-certs"] });
        qc.invalidateQueries({ queryKey: ["admin-email-logs"] });
        qc.invalidateQueries({ queryKey: ["admin-overview"] });
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error(`Resend failed: ${res.error || "Unknown delivery error"}`, {
          id: toastId,
          duration: 8000,
        });
      }
    } catch (err: any) {
      toast.error(`Email dispatch error: ${err.message}`, { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg p-0 overflow-hidden rounded-2xl border-border/60 bg-white dark:bg-[#0B1120] shadow-2xl">
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-coral-500/20 text-[#f95c4b] border border-[#f95c4b]/30">
              <Mail className="size-4" />
            </span>
            <span className="text-[11px] font-bold tracking-widest text-[#ffd8c8] uppercase font-mono">
              Skyrovix Email Dispatcher
            </span>
          </div>
          <DialogTitle className="text-xl font-bold text-white tracking-tight">
            Resend Document Email
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-300 mt-1">
            Dispatch official PDF credentials directly to the student&apos;s Gmail inbox with verified attachments.
          </DialogDescription>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Student Overview Pill */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Recipient Name:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {app.full_name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Domain Track:</span>
              <Badge variant="outline" className="text-[10px] py-0 font-medium border-border/80">
                {domainTitle}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Intern ID:</span>
              <span className="font-mono font-semibold text-[#f95c4b]">
                {app.intern_id || "SKX-INT"}
              </span>
            </div>
            {existingCertId && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Certificate ID:</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {existingCertId}
                </span>
              </div>
            )}
          </div>

          {/* Document Type Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Document to Resend:
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option 1: Offer Letter */}
              <button
                type="button"
                onClick={() => setDocType("offer_letter")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                  docType === "offer_letter"
                    ? "border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 shadow-xs"
                    : "border-border/60 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-muted-foreground"
                }`}
              >
                <FileText className="size-5 mb-1.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold leading-tight">Offer Letter</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Selection PDF</span>
              </button>

              {/* Option 2: Certificate */}
              <button
                type="button"
                onClick={() => setDocType("certificate")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                  docType === "certificate"
                    ? "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-xs"
                    : "border-border/60 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-muted-foreground"
                }`}
              >
                <Award className="size-5 mb-1.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold leading-tight">Certificate</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Verified PDF</span>
              </button>

              {/* Option 3: Both */}
              <button
                type="button"
                onClick={() => setDocType("both")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                  docType === "both"
                    ? "border-[#f95c4b] bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 ring-2 ring-[#f95c4b]/20 shadow-xs"
                    : "border-border/60 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-muted-foreground"
                }`}
              >
                <Layers className="size-5 mb-1.5 text-[#f95c4b]" />
                <span className="text-xs font-bold leading-tight">Both Docs</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Letter & Cert</span>
              </button>
            </div>
          </div>

          {/* Recipient Email Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="resend-email-input" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Recipient Email Address:
              </Label>
              {recipientEmail !== app.email && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                  Custom email override
                </span>
              )}
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="resend-email-input"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="student@example.com"
                className="pl-9 text-xs rounded-xl border-border/80"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              You can edit this email address if the intern reported a typo or requested delivery to another address.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 px-6 bg-slate-50 dark:bg-slate-900/60 border-t border-border/60 flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
            className="rounded-xl border-border/80 text-xs"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSend}
            disabled={isSending || !recipientEmail}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md border-0 gap-1.5"
          >
            {isSending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Dispatching Email...
              </>
            ) : (
              <>
                <Send className="size-3.5" />
                Resend {docType === "both" ? "Documents" : docType === "offer_letter" ? "Offer Letter" : "Certificate"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
