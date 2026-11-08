import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Download,
  Loader2,
  X,
  Printer,
  Copy,
  Check,
  Award,
  Crown,
  FileText,
  Layers,
  Sliders,
  Star,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { downloadAdvancedDocPdf, type AdvancedDocData } from "@/components/advanced-pdf-docs";
import {
  LorSheet,
  ExperienceLetterSheet,
  ProjectCertificateSheet,
  PerformanceReportSheet,
  AppreciationCertificateSheet,
  SkillCertificateSheet,
} from "@/components/documents/CredentialSheets";

interface Props {
  data: AdvancedDocData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdvancedDocPreviewDialog({ data, open, onOpenChange }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const dateStr = new Date(data.issuedAt || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const getDocTypeMeta = () => {
    switch (data.documentType) {
      case "lor":
        return {
          title: "Letter of Recommendation (LOR)",
          badge: "Premium Credential",
          icon: Crown,
          iconColor: "text-amber-500",
        };
      case "experience_letter":
        return {
          title: "Experience & Relieving Letter",
          badge: "Verified Tenure",
          icon: FileText,
          iconColor: "text-emerald-500",
        };
      case "project_certificate":
        return {
          title: "Project Completion Certificate",
          badge: "Capstone Engineering",
          icon: Layers,
          iconColor: "text-orange-500",
        };
      case "evaluation_report":
        return {
          title: "Performance Evaluation Report",
          badge: "Academic Scorecard",
          icon: Sliders,
          iconColor: "text-indigo-500",
        };
      case "appreciation_certificate":
        return {
          title: "Certificate of Appreciation",
          badge: "Merit Citation",
          icon: Star,
          iconColor: "text-rose-500",
        };
      case "skill_certificate":
        return {
          title: "Skill Achievement Certificate",
          badge: "Competency Mastery",
          icon: CheckCircle2,
          iconColor: "text-teal-500",
        };
      default:
        return {
          title: "Internship Credential",
          badge: "Official Document",
          icon: Award,
          iconColor: "text-[#b45309]",
        };
    }
  };

  const meta = getDocTypeMeta();
  const IconComponent = meta.icon;

  const handleCopyId = () => {
    navigator.clipboard.writeText(data.documentId);
    setCopied(true);
    toast.success(`Document ID ${data.documentId} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    setDownloading(true);
    const toastId = toast.loading(`Generating official ${meta.title} PDF...`);
    try {
      await downloadAdvancedDocPdf(data);
      toast.success(`${meta.title} downloaded successfully!`, { id: toastId });
    } catch (err: any) {
      console.error("PDF download failed:", err);
      toast.error(`Download failed: ${err.message}`, { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  const renderSheet = () => {
    const sheetProps = {
      fullName: data.fullName,
      internId: data.internId,
      documentId: data.documentId,
      domainName: data.domainName,
      durationMonths: data.durationMonths,
      issuedAt: data.issuedAt,
      verifyUrl: data.verifyUrl,
      planType: data.planType,
      grade: data.metadata?.finalRating,
      metadata: data.metadata,
      id: "advanced-doc-printable-sheet",
    };

    switch (data.documentType) {
      case "lor":
        return <LorSheet {...sheetProps} />;
      case "experience_letter":
        return <ExperienceLetterSheet {...sheetProps} />;
      case "project_certificate":
        return <ProjectCertificateSheet {...sheetProps} />;
      case "evaluation_report":
        return <PerformanceReportSheet {...sheetProps} />;
      case "appreciation_certificate":
        return <AppreciationCertificateSheet {...sheetProps} />;
      case "skill_certificate":
        return <SkillCertificateSheet {...sheetProps} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[96vw] sm:w-[92vw] max-h-[94vh] flex flex-col p-0 overflow-hidden bg-slate-100 dark:bg-slate-950 border-border/70 shadow-2xl rounded-2xl sm:rounded-3xl [&>button:last-child]:hidden">
        {/* Print Stylesheet */}
        <style>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #advanced-doc-printable-sheet, #advanced-doc-printable-sheet * {
              visibility: visible !important;
            }
            #advanced-doc-printable-sheet {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 24px !important;
              box-shadow: none !important;
              border: 1px solid #94a3b8 !important;
              border-radius: 6px !important;
              background: #ffffff !important;
              color: #0f172a !important;
              z-index: 999999 !important;
            }
          }
        `}</style>

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white dark:bg-slate-900 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid size-9 sm:size-10 shrink-0 place-items-center rounded-xl bg-[#181619] shadow-xs ring-2 ring-[#f95c4b]/20">
              <IconComponent className={`size-4.5 sm:size-5 ${meta.iconColor}`} />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-sm sm:text-base font-bold text-foreground truncate">
                  {meta.title}
                </DialogTitle>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f95c4b]/10 text-[#f95c4b] border border-[#f95c4b]/20">
                  <span className="size-1.5 rounded-full bg-[#f95c4b] animate-pulse" />
                  {meta.badge}
                </span>
              </div>
              <DialogDescription className="text-[11px] text-muted-foreground truncate flex items-center gap-2 mt-0.5">
                <span>Ref: <strong className="font-mono text-foreground">{data.documentId}</strong></span>
                <span>•</span>
                <span>Intern: <strong className="text-foreground">{data.fullName}</strong> ({data.internId})</span>
                <span>•</span>
                <span>Issued: {dateStr}</span>
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="h-8 sm:h-9 text-xs rounded-xl gap-1.5 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 cursor-pointer"
              onClick={handleCopyId}
              title="Copy Document ID"
            >
              {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              <span className="hidden md:inline">{copied ? "Copied" : "Copy ID"}</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-8 sm:h-9 text-xs rounded-xl gap-1.5 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 cursor-pointer"
              onClick={handlePrint}
              title="Print Document"
            >
              <Printer className="size-3.5 text-slate-600 dark:text-slate-300" />
              <span className="hidden md:inline">Print</span>
            </Button>

            <Button
              size="sm"
              className="brand-gradient text-white rounded-xl h-8 sm:h-9 text-xs font-bold gap-1.5 shadow-xs hover:shadow-md transition-all cursor-pointer"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span className="hidden sm:inline">Generating...</span>
                </>
              ) : (
                <>
                  <Download className="size-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="size-8 sm:size-9 p-0 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 cursor-pointer"
              onClick={() => onOpenChange(false)}
              title="Close Preview"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Document Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 bg-slate-200/80 dark:bg-slate-950/80 flex items-center justify-center">
          <div className="w-full max-w-[760px] mx-auto">
            {renderSheet()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

