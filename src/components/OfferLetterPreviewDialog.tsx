import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileText,
  Loader2,
  X,
  Printer,
  Copy,
  Check,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { durationConfig, getDomain } from "@/lib/constants";
import { downloadOfferLetter } from "@/components/pdf-docs";
import logo from "@/assets/logo.png";
import seal from "@/assets/seal.jpg";
import msme from "@/assets/msme.png";
import sigFounder from "@/assets/hari sig.jpeg";
import sigCofounder from "@/assets/mahesh sig.jpeg";
import yrTech from "@/assets/yr-tech logo.png";
import vinix from "@/assets/vinix.png";

export interface OfferLetterPreviewApp {
  id: string;
  intern_id: string;
  full_name: string;
  email?: string;
  domain: string;
  duration?: number | null;
  offer_issued_at?: string;
  created_at: string;
  status?: string;
}

interface Props {
  app: OfferLetterPreviewApp | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OfferLetterPreviewDialog({ app, open, onOpenChange }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!app) return null;

  const domainObj = getDomain(app.domain);
  const domainName = domainObj?.name ?? (app.domain.charAt(0).toUpperCase() + app.domain.slice(1));
  const issuedDate = new Date(app.offer_issued_at || app.created_at);
  const dateStr = issuedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const duration = app.duration ?? 1;
  const durConfig = durationConfig(duration);
  const durLabel = durConfig?.label ?? `${duration} Month${duration > 1 ? "s" : ""}`;

  const endDate = new Date(issuedDate);
  endDate.setMonth(endDate.getMonth() + duration);
  const endDateStr = endDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const handleCopyId = () => {
    navigator.clipboard.writeText(app.intern_id);
    setCopied(true);
    toast.success(`Intern ID ${app.intern_id} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadOfferLetter({
        fullName: app.full_name,
        internId: app.intern_id,
        domain: domainName,
        issuedAt: app.offer_issued_at || app.created_at,
        duration: duration,
      });
      toast.success("Official Offer Letter PDF downloaded successfully!");
    } catch (err) {
      console.error("Failed to download PDF:", err);
      toast.error("Failed to download Offer Letter. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[96vw] sm:w-[92vw] max-h-[94vh] flex flex-col p-0 overflow-hidden bg-slate-100 dark:bg-slate-950 border-border/70 shadow-2xl rounded-2xl sm:rounded-3xl [&>button:last-child]:hidden">
        
        {/* Print Stylesheet for single-page paper printing */}
        <style>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #offer-letter-printable-sheet, #offer-letter-printable-sheet * {
              visibility: visible !important;
            }
            #offer-letter-printable-sheet {
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
            <div className="grid size-9 sm:size-10 shrink-0 place-items-center rounded-xl bg-[#07284a] text-white shadow-xs ring-2 ring-[#07284a]/20">
              <FileText className="size-4 sm:size-5 text-sky-400" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-sm sm:text-base font-bold text-foreground truncate">
                  Internship Offer Letter
                </DialogTitle>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Official Credential
                </span>
              </div>
              <DialogDescription className="text-[11px] text-muted-foreground truncate flex items-center gap-2 mt-0.5">
                <span>Ref: <strong className="font-mono text-foreground">{app.intern_id}</strong></span>
                <span>•</span>
                <span>Issued: {dateStr}</span>
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="h-8 sm:h-9 text-xs rounded-xl gap-1.5 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60"
              onClick={handleCopyId}
              title="Copy Intern ID"
            >
              {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              <span className="hidden md:inline">{copied ? "Copied" : "Copy ID"}</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-8 sm:h-9 text-xs rounded-xl gap-1.5 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60"
              onClick={handlePrint}
              title="Print Offer Letter"
            >
              <Printer className="size-3.5 text-slate-600 dark:text-slate-300" />
              <span className="hidden md:inline">Print</span>
            </Button>

            <Button
              size="sm"
              className="brand-gradient text-white rounded-xl h-8 sm:h-9 text-xs font-bold gap-1.5 shadow-xs hover:shadow-md transition-all"
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
              className="size-8 sm:size-9 p-0 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => onOpenChange(false)}
              title="Close Preview"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Document Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 bg-slate-200/80 dark:bg-slate-950/80">
          <div
            id="offer-letter-printable-sheet"
            className="w-full max-w-[760px] mx-auto bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-300 p-6 sm:p-9 font-sans text-xs sm:text-[13px] leading-relaxed relative overflow-hidden select-text"
          >
            {/* Document Letterhead Matching Reference Style */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-300">
              {/* Brand Information */}
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="Skyrovix Logo"
                  className="size-11 sm:size-12 object-contain"
                />
                <div className="h-9 w-px bg-slate-300 mx-0.5" />
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-wide text-[#07284a] leading-tight">
                    SKYROVIX
                  </h2>
                  <p className="text-[11px] font-bold text-sky-500 leading-tight">
                    Empowering Future Innovators
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    www.skyrovix.in | skyrovix@gmail.com
                  </p>
                </div>
              </div>

              {/* Reference ID & Issue Date Matching Reference */}
              <div className="text-right">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  INTERNSHIP ID
                </div>
                <div className="text-xs sm:text-sm font-black font-mono text-[#07284a]">
                  {app.intern_id}
                </div>
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-1.5">
                  ISSUE DATE
                </div>
                <div className="text-xs font-bold text-[#07284a]">
                  {dateStr}
                </div>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="mt-4 mb-3">
              <h1 className="text-lg sm:text-xl font-black tracking-wide uppercase text-[#07284a]">
                INTERNSHIP OFFER LETTER
              </h1>
              <p className="text-xs font-bold text-[#b45309] mt-0.5">
                Date: {dateStr}
              </p>
            </div>

            {/* Greeting & Introductory Statement */}
            <div className="space-y-2 text-xs sm:text-[13px] text-slate-700 leading-relaxed mb-4">
              <p>
                Dear <strong className="text-slate-900 font-bold">{app.full_name}</strong>,
              </p>
              <p>
                We are delighted to offer you the position of{" "}
                <strong className="text-slate-900 font-bold">Virtual Intern – {domainName}</strong> at{" "}
                <strong className="text-slate-900 font-bold">Skyrovix IT Solutions</strong> (accessible at{" "}
                <strong className="text-slate-900 font-bold">skyrovix.in</strong>). After reviewing your application, technical aptitude, and enthusiasm, we are confident that your skills make you a valuable addition to our engineering cohort.
              </p>
              <p>
                Your virtual internship details, work deliverables, and engagement particulars are finalized as follows:
              </p>
            </div>

            {/* Table: INTERNSHIP PROGRAM PARTICULARS (8 Rows) */}
            <div className="rounded border border-slate-300 overflow-hidden mb-4 shadow-2xs">
              <div className="bg-[#07284a] text-white px-3.5 py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                INTERNSHIP PROGRAM PARTICULARS
              </div>
              <div className="text-xs divide-y divide-slate-200">
                <div className="grid grid-cols-12 px-3.5 py-1.5 bg-white">
                  <span className="col-span-5 text-slate-600 font-medium">Internship Track</span>
                  <span className="col-span-7 font-bold text-slate-900">{domainName}</span>
                </div>
                <div className="grid grid-cols-12 px-3.5 py-1.5 bg-slate-50">
                  <span className="col-span-5 text-slate-600 font-medium">Intern ID</span>
                  <span className="col-span-7 font-mono font-bold text-slate-900">{app.intern_id}</span>
                </div>
                <div className="grid grid-cols-12 px-3.5 py-1.5 bg-white">
                  <span className="col-span-5 text-slate-600 font-medium">Program Duration</span>
                  <span className="col-span-7 font-bold text-slate-900">{durLabel}</span>
                </div>
                <div className="grid grid-cols-12 px-3.5 py-1.5 bg-slate-50">
                  <span className="col-span-5 text-slate-600 font-medium">Commencement Date</span>
                  <span className="col-span-7 font-bold text-slate-900">{dateStr}</span>
                </div>
                <div className="grid grid-cols-12 px-3.5 py-1.5 bg-white">
                  <span className="col-span-5 text-slate-600 font-medium">Estimated Completion</span>
                  <span className="col-span-7 font-bold text-slate-900">{endDateStr}</span>
                </div>
                <div className="grid grid-cols-12 px-3.5 py-1.5 bg-slate-50">
                  <span className="col-span-5 text-slate-600 font-medium">Stipend Specification</span>
                  <span className="col-span-7 font-bold text-slate-900">Unpaid (Performance-Based Internship)</span>
                </div>
                <div className="grid grid-cols-12 px-3.5 py-1.5 bg-white">
                  <span className="col-span-5 text-slate-600 font-medium">Location & Model</span>
                  <span className="col-span-7 font-bold text-slate-900">Remote / Virtual (Task-Based, Flexible Hours)</span>
                </div>
                <div className="grid grid-cols-12 px-3.5 py-1.5 bg-slate-50">
                  <span className="col-span-5 text-slate-600 font-medium">Official Domain Portal</span>
                  <span className="col-span-7 font-mono font-bold text-slate-900">https://skyrovix.in</span>
                </div>
              </div>
            </div>

            {/* Card 1: GENERAL TERMS & CONDITIONS OF INTERNSHIP (5 terms) */}
            <div className="rounded-md bg-slate-50 border border-slate-200/90 p-3 sm:p-3.5 mb-3">
              <h3 className="text-[11px] sm:text-xs font-bold text-[#07284a] uppercase tracking-wide mb-2">
                GENERAL TERMS & CONDITIONS OF INTERNSHIP:
              </h3>
              <div className="space-y-1.5 text-xs text-slate-600 leading-snug">
                <p>
                  <strong className="text-slate-900 font-semibold">1. Task Execution & Milestones:</strong> You will work on production-grade tasks and project modules aligned with {domainName}. Timely submission of weekly progress updates and milestone deliverables via skyrovix.in is mandatory.
                </p>
                <p>
                  <strong className="text-slate-900 font-semibold">2. Code of Conduct & Integrity:</strong> Plagiarism, unauthorized code dissemination, or any form of professional misconduct will lead to immediate cancellation of your internship program.
                </p>
                <p>
                  <strong className="text-slate-900 font-semibold">3. Confidentiality & Non-Disclosure:</strong> Any documentation, source code, architecture designs, or mock datasets shared during this program are strictly confidential and the intellectual property of Skyrovix.
                </p>
                <p>
                  <strong className="text-slate-900 font-semibold">4. Mentorship & Continuous Evaluation:</strong> You will receive structured technical guidance and feedback throughout your tenure to foster industry-standard development capabilities.
                </p>
                <p>
                  <strong className="text-slate-900 font-semibold">5. Certification:</strong> An official Certificate of Internship Completion will be issued only upon successful submission and mentor approval of all milestone tasks.
                </p>
              </div>
            </div>

            {/* Card 2: CERTIFICATE OF COMPLETION */}
            <div className="rounded-md bg-slate-50 border border-slate-200/90 p-3 sm:p-3.5 mb-3">
              <h3 className="text-[11px] sm:text-xs font-bold text-[#07284a] uppercase tracking-wide mb-1">
                CERTIFICATE OF COMPLETION
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upon successful completion of the internship tenure and fulfillment of all assigned tasks, you will receive an official Certificate of Internship from Skyrovix, verifiable on our official domain at <strong className="text-slate-900 font-mono font-medium">skyrovix.in/verify-certificate</strong>.
              </p>
            </div>

            {/* Acceptance Closing Statement matching Reference */}
            <p className="text-xs text-slate-700 leading-relaxed mb-4">
              Please return the signed copy of this letter as a token of your formal acceptance of this offer. We look forward to a mutually rewarding learning experience.
            </p>

            {/* Signatures & Seal Section: Hariharan S (Founder & CEO), Seal (Center), Maheshwaran S (Co-Founder) */}
            <div className="flex items-end justify-between mt-3 mb-7">
              {/* Founder & CEO on Left */}
              <div className="flex flex-col items-start text-left w-48">
                <img
                  src={sigFounder}
                  alt="Founder Signature"
                  className="h-14 sm:h-16 object-contain mb-1"
                />
                <div className="w-40 sm:w-44 border-t-2 border-slate-700 mb-1" />
                <span className="text-xs sm:text-[13px] font-bold text-[#07284a]">
                  Hariharan S
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Founder & CEO
                </span>
                <span className="text-[9px] text-slate-400">
                  Skyrovix
                </span>
              </div>

              {/* Company Seal in Center */}
              <div className="flex flex-col items-center text-center flex-1">
                <img
                  src={seal}
                  alt="Company Seal"
                  className="size-16 sm:size-20 object-contain drop-shadow-xs"
                />
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1.5">
                  COMPANY SEAL
                </span>
              </div>

              {/* Co-Founder on Right */}
              <div className="flex flex-col items-end text-right w-48">
                <img
                  src={sigCofounder}
                  alt="Co-Founder Signature"
                  className="h-14 sm:h-16 object-contain mb-1"
                />
                <div className="w-40 sm:w-44 border-t-2 border-slate-700 mb-1" />
                <span className="text-xs sm:text-[13px] font-bold text-[#07284a]">
                  Maheshwaran S
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Co-Founder
                </span>
                <span className="text-[9px] text-slate-400">
                  Skyrovix
                </span>
              </div>
            </div>

            {/* Corporate Accreditation Footer Matching Reference */}
            <div className="pt-2.5 pb-5 border-t border-slate-300 flex items-center justify-between text-[11px] sm:text-xs">
              {/* Left: MSME + Vinix */}
              <div className="w-44 sm:w-52 flex items-center gap-3 sm:gap-4">
                <img
                  src={msme}
                  alt="Govt. MSME Logo"
                  className="h-10 sm:h-12 object-contain"
                  title="MSME Registered: UDYAM-TN-17-0076606"
                />
                <img
                  src={vinix}
                  alt="Vinix Partner"
                  className="h-9 sm:h-10 object-contain"
                />
              </div>

              {/* Center: Legal entity & UDYAM */}
              <div className="flex-1 text-center text-slate-600">
                <div className="font-bold text-[#07284a] text-xs sm:text-sm tracking-tight">
                  SKYROVIX IT Solutions Private Limited
                </div>
                <div className="text-slate-600 text-[10px] sm:text-[11px] font-medium mt-0.5">
                  UDYAM Registry: UDYAM-TN-17-0076606
                </div>
                <div className="text-sky-600 text-[10px] sm:text-[11px] font-semibold mt-0.5">
                  skyrovix@gmail.com | www.skyrovix.in
                </div>
              </div>

              {/* Right: YR Tech Logo */}
              <div className="w-44 sm:w-52 flex justify-end">
                <img
                  src={yrTech}
                  alt="YR Tech"
                  className="h-9 sm:h-10 object-contain"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-white dark:bg-slate-900 border-t border-border/60 shrink-0">
          <div className="text-xs text-muted-foreground hidden sm:flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>Official Skyrovix Offer Letter</span>
          </div>

          <div className="flex items-center gap-2 ml-auto w-full sm:w-auto justify-end">
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl h-9 text-xs"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              size="sm"
              className="brand-gradient text-white rounded-xl h-9 text-xs font-bold gap-1.5 shadow-xs hover:shadow-md transition-all"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Downloading...
                </>
              ) : (
                <>
                  <Download className="size-3.5" /> Download PDF
                </>
              )}
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
