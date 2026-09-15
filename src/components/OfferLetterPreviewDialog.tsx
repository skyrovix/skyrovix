import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText, CheckCircle2, Shield, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { COMPANY, durationConfig, getDomain } from "@/lib/constants";
import { OfferLetterDoc, downloadPdf } from "@/components/pdf-docs";
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
  duration?: number;
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

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadPdf(
        <OfferLetterDoc
          fullName={app.full_name}
          internId={app.intern_id}
          domain={domainName}
          issuedAt={app.offer_issued_at || app.created_at}
          duration={duration}
        />,
        `OfferLetter_${app.intern_id}.pdf`
      );
      toast.success("Offer Letter PDF downloaded successfully!");
    } catch (err) {
      console.error("Failed to download PDF:", err);
      toast.error("Failed to download Offer Letter. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] sm:w-[90vw] max-h-[92vh] flex flex-col p-0 overflow-hidden bg-slate-100 dark:bg-slate-950 border-border/60 shadow-2xl rounded-2xl sm:rounded-3xl [&>button:last-child]:hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white dark:bg-slate-900 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#07284a] text-white shadow-sm">
              <FileText className="size-4" />
            </div>
            <div className="truncate">
              <DialogTitle className="text-sm sm:text-base font-bold text-foreground truncate">
                Internship Offer Letter Preview
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground truncate">
                Ref ID: <span className="font-mono font-semibold text-foreground">{app.intern_id}</span> · Issued: {dateStr}
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              className="brand-gradient text-white rounded-xl h-8 sm:h-9 text-xs font-bold gap-1.5 shadow-sm hover:shadow-md transition-all"
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

        {/* Scrollable Letter Document Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 bg-slate-200/75 dark:bg-slate-950/85">
          <div className="w-full max-w-[720px] mx-auto min-h-fit bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-xl border border-slate-300/80 dark:border-slate-800 p-6 sm:p-10 md:p-12 font-sans text-xs sm:text-sm leading-relaxed relative selection:bg-blue-100 dark:selection:bg-blue-950">
            
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none overflow-hidden">
              <span className="font-extrabold text-7xl sm:text-9xl tracking-[0.2em] -rotate-45 text-[#07284a] dark:text-blue-200">
                SKYROVIX
              </span>
            </div>

            {/* Document Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-[#07284a] dark:border-blue-500/80">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Skyrovix Logo" className="size-10 sm:size-12 object-contain" />
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#07284a] dark:text-blue-400 leading-none">
                    {COMPANY.name}
                  </h2>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 font-medium">
                    {COMPANY.tagline}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {COMPANY.website}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <img src={vinix} alt="Vinix" className="h-6 sm:h-7 object-contain opacity-90" />
                <img src={yrTech} alt="YR Tech" className="h-6 sm:h-7 object-contain opacity-90" />
                <div className="text-right border-l border-slate-200 dark:border-slate-700 pl-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block">
                    Intern ID
                  </span>
                  <span className="text-xs sm:text-sm font-bold font-mono text-[#07284a] dark:text-blue-300 block">
                    {app.intern_id}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block mt-1">
                    Issue Date
                  </span>
                  <span className="text-[11px] font-semibold block">
                    {dateStr}
                  </span>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="mt-6 mb-4">
              <h1 className="text-base sm:text-xl font-extrabold tracking-widest uppercase text-[#07284a] dark:text-blue-400">
                INTERNSHIP OFFER LETTER
              </h1>
              <div className="w-12 h-1 bg-[#07284a] dark:bg-blue-400 rounded-full mt-1.5" />
            </div>

            {/* Date line & Greeting */}
            <div className="space-y-3 mb-4">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Date:</strong> {dateStr}
              </p>
              <p className="text-sm font-semibold">
                Dear <span className="text-[#07284a] dark:text-blue-300 font-bold">{app.full_name}</span>,
              </p>
            </div>

            {/* Intro paragraph */}
            <div className="space-y-2.5 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300">
              <p>
                We are delighted to offer you the position of{" "}
                <strong className="text-slate-900 dark:text-white font-bold">
                  Virtual Intern – {domainName}
                </strong>{" "}
                at <strong className="text-[#07284a] dark:text-blue-300 font-bold">Skyrovix</strong>.
              </p>
              <p>
                After reviewing your profile, we are confident that your skills and enthusiasm make you a valuable addition to our team. We look forward to supporting your professional growth through this internship opportunity.
              </p>
            </div>

            {/* Internship Details Table */}
            <div className="my-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#07284a] dark:text-blue-400 mb-2">
                Internship Details
              </h3>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
                <div className="grid grid-cols-3 bg-[#07284a] text-white font-bold py-2 px-3 text-[11px] uppercase tracking-wider">
                  <div className="col-span-1">Particulars</div>
                  <div className="col-span-2">Details</div>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  <div className="grid grid-cols-3 py-1.5 px-3 bg-white dark:bg-slate-900/40">
                    <div className="col-span-1 font-semibold text-muted-foreground">Full Name</div>
                    <div className="col-span-2 font-bold text-foreground">{app.full_name}</div>
                  </div>
                  <div className="grid grid-cols-3 py-1.5 px-3 bg-slate-50 dark:bg-slate-800/30">
                    <div className="col-span-1 font-semibold text-muted-foreground">Intern ID</div>
                    <div className="col-span-2 font-mono font-bold text-[#07284a] dark:text-blue-300">{app.intern_id}</div>
                  </div>
                  <div className="grid grid-cols-3 py-1.5 px-3 bg-white dark:bg-slate-900/40">
                    <div className="col-span-1 font-semibold text-muted-foreground">Domain</div>
                    <div className="col-span-2 font-bold text-foreground">{domainName}</div>
                  </div>
                  <div className="grid grid-cols-3 py-1.5 px-3 bg-slate-50 dark:bg-slate-800/30">
                    <div className="col-span-1 font-semibold text-muted-foreground">Duration</div>
                    <div className="col-span-2 font-bold text-foreground">{durLabel}</div>
                  </div>
                  <div className="grid grid-cols-3 py-1.5 px-3 bg-white dark:bg-slate-900/40">
                    <div className="col-span-1 font-semibold text-muted-foreground">Start Date</div>
                    <div className="col-span-2 font-semibold text-foreground">{dateStr}</div>
                  </div>
                  <div className="grid grid-cols-3 py-1.5 px-3 bg-slate-50 dark:bg-slate-800/30">
                    <div className="col-span-1 font-semibold text-muted-foreground">End Date</div>
                    <div className="col-span-2 font-semibold text-foreground">{endDateStr}</div>
                  </div>
                  <div className="grid grid-cols-3 py-1.5 px-3 bg-white dark:bg-slate-900/40">
                    <div className="col-span-1 font-semibold text-muted-foreground">Mode</div>
                    <div className="col-span-2 font-bold text-emerald-600 dark:text-emerald-400">Remote / Virtual</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Internship Overview */}
            <div className="my-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#07284a] dark:text-blue-400 mb-1.5">
                Internship Overview
              </h3>
              <p className="text-[11px] text-muted-foreground mb-1.5">During this internship, you will have the opportunity to:</p>
              <ul className="space-y-1 pl-1">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Work on practical, real-world <strong className="text-foreground">{domainName}</strong> projects.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Gain hands-on experience with modern development tools and technologies.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Receive mentorship and guidance from experienced professionals.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Enhance your technical and problem-solving skills through project-based learning.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Participate in periodic progress reviews and feedback sessions.</span>
                </li>
              </ul>
            </div>

            {/* Certificate of Completion */}
            <div className="my-4 text-xs text-slate-600 dark:text-slate-300">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#07284a] dark:text-blue-400 mb-1">
                Certificate of Completion
              </h3>
              <p>
                Upon successful completion of the internship and fulfillment of all assigned tasks, you will receive a{" "}
                <strong className="text-foreground font-bold">Certificate of Internship</strong> with QR-code verification for authenticity.
              </p>
            </div>

            {/* Terms & Conditions */}
            <div className="my-4 space-y-1 text-xs text-slate-600 dark:text-slate-300">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#07284a] dark:text-blue-400 mb-1">
                Terms & Conditions
              </h3>
              <ul className="space-y-1 pl-1 text-[11px]">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>This internship is conducted remotely and offers flexible working hours.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Interns are expected to maintain regular communication and submit assigned work within deadlines.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Successful completion will be determined based on performance, project submission, and adherence to internship guidelines.</span>
                </li>
              </ul>
            </div>

            <p className="text-xs font-bold text-[#07284a] dark:text-blue-300 mt-4">
              Congratulations and Welcome to the Team!
            </p>

            {/* Signatures and Seal */}
            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 items-end text-center">
              {/* Founder Signature */}
              <div className="flex flex-col items-center">
                <img src={sigFounder} alt="Founder Signature" className="h-8 sm:h-9 object-contain mb-1" />
                <div className="w-28 sm:w-36 border-t border-slate-400 dark:border-slate-600 my-1" />
                <p className="font-bold text-xs text-foreground">{COMPANY.founder.name}</p>
                <p className="text-[10px] text-muted-foreground">{COMPANY.founder.title}</p>
              </div>

              {/* Company Seal */}
              <div className="flex flex-col items-center justify-center">
                <img src={seal} alt="Company Seal" className="size-12 sm:size-14 object-contain opacity-85" />
                <p className="text-[9px] text-muted-foreground mt-1 uppercase font-semibold tracking-wider">Company Seal</p>
              </div>

              {/* Co-founder Signature */}
              <div className="flex flex-col items-center">
                <img src={sigCofounder} alt="Co-Founder Signature" className="h-8 sm:h-9 object-contain mb-1" />
                <div className="w-28 sm:w-36 border-t border-slate-400 dark:border-slate-600 my-1" />
                <p className="font-bold text-xs text-foreground">{COMPANY.cofounder.name}</p>
                <p className="text-[10px] text-muted-foreground">{COMPANY.cofounder.title}</p>
              </div>
            </div>

            {/* Document Footer */}
            <div className="mt-8 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <img src={msme} alt="MSME Registered" className="h-5 sm:h-6 object-contain" />
                <span className="font-medium">MSME: UDYAM-TN-17-0076606</span>
              </div>
              <div className="text-right font-mono">
                {COMPANY.email} | {COMPANY.website}
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-white dark:bg-slate-900 border-t border-border/40 shrink-0">
          <div className="text-xs text-muted-foreground hidden sm:flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            <span>Digitally verified official Skyrovix offer letter</span>
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
              className="brand-gradient text-white rounded-xl h-9 text-xs font-bold gap-1.5 shadow-sm"
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
