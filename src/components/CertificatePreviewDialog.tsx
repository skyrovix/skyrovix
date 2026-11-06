import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Download,
  Award,
  Loader2,
  X,
  Printer,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { COMPANY, getPublicSiteUrl, getDomain } from "@/lib/constants";
import { downloadCertificate } from "@/components/pdf-docs";
import { EMAIL_ASSETS } from "@/lib/email-assets";

export interface CertificatePreviewData {
  certId: string;
  internId: string;
  fullName: string;
  domain: string;
  grade?: string;
  issuedAt: string;
  verifyUrl?: string;
}

interface Props {
  data: CertificatePreviewData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CertificatePreviewDialog({ data, open, onOpenChange }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const domainObj = getDomain(data.domain);
  const domainName = domainObj?.name ?? data.domain ?? "Software Engineering";
  const issuedDate = new Date(data.issuedAt || Date.now());
  const dateStr = !isNaN(issuedDate.getTime())
    ? issuedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

  const verifyUrl =
    data.verifyUrl ||
    `${getPublicSiteUrl()}/verify?id=${encodeURIComponent(data.certId.trim())}`;

  const grade = data.grade || "A+ (OUTSTANDING)";

  const handleCopyId = () => {
    navigator.clipboard.writeText(data.certId);
    setCopied(true);
    toast.success(`Certificate ID ${data.certId} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadCertificate({
        fullName: data.fullName,
        internId: data.internId,
        domain: domainName,
        certId: data.certId,
        issuedAt: data.issuedAt,
        grade,
        verifyUrl,
      });
      toast.success("Certificate of Excellence PDF downloaded successfully!");
    } catch (err: any) {
      console.error("Failed to download Certificate PDF:", err);
      toast.error("Failed to download Certificate. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[96vw] sm:w-[94vw] max-h-[96vh] flex flex-col p-0 overflow-hidden bg-slate-900 border-amber-600/40 shadow-2xl rounded-2xl sm:rounded-3xl [&>button:last-child]:hidden">
        {/* Print Stylesheet */}
        <style>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #certificate-printable-sheet, #certificate-printable-sheet * {
              visibility: visible !important;
            }
            #certificate-printable-sheet {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 24px !important;
              background-color: #faf8f2 !important;
              box-shadow: none !important;
              border: none !important;
            }
          }
        `}</style>

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white dark:bg-slate-900 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid size-9 sm:size-10 shrink-0 place-items-center rounded-xl bg-[#181619] text-amber-500 shadow-xs ring-2 ring-amber-500/20">
              <Award className="size-4 sm:size-5 text-amber-500" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-sm sm:text-base font-bold text-foreground truncate">
                  Certificate of Excellence
                </DialogTitle>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Official Credential
                </span>
              </div>
              <DialogDescription className="text-[11px] text-muted-foreground truncate flex items-center gap-2 mt-0.5">
                <span>
                  Cert ID: <strong className="font-mono text-foreground">{data.certId}</strong>
                </span>
                <span>•</span>
                <span>Intern ID: {data.internId}</span>
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
              title="Copy Certificate ID"
            >
              {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              <span className="hidden md:inline">{copied ? "Copied" : "Copy ID"}</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-8 sm:h-9 text-xs rounded-xl gap-1.5 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 cursor-pointer"
              onClick={handlePrint}
              title="Print Certificate"
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
              className="size-8 sm:size-9 p-0 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              onClick={() => onOpenChange(false)}
              title="Close Preview"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Document Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 bg-slate-950/90 flex items-center justify-center">
          <div
            id="certificate-printable-sheet"
            className="w-full max-w-[860px] rounded-2xl overflow-hidden shadow-2xl relative bg-[#faf8f2] text-slate-900 border-2 border-[#b45309]"
            style={{ aspectRatio: "1.414 / 1" }}
          >
            {/* Outer and Inner Regal Gold Framing */}
            <div className="absolute inset-3 rounded-xl pointer-events-none border-2 border-[#b45309]" />
            <div className="absolute inset-5 rounded-lg pointer-events-none border border-[#d97706]/40" />

            <div className="relative h-full flex flex-col justify-between p-6 sm:p-8 select-none">
              {/* Header: Corporate & Govt Recognition Logos */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {EMAIL_ASSETS?.logo && (
                    <img src={EMAIL_ASSETS.logo} alt="Skyrovix" className="h-9 sm:h-11 w-auto object-contain" />
                  )}
                  {EMAIL_ASSETS?.vinix && (
                    <img src={EMAIL_ASSETS.vinix} alt="Vinix" className="h-6 sm:h-7 w-auto object-contain" />
                  )}
                </div>
                <div className="text-center">
                  <h1 className="text-lg sm:text-2xl font-black tracking-[0.25em] text-[#b45309] uppercase">
                    SKYROVIX
                  </h1>
                  <p className="text-[8px] sm:text-[9.5px] font-bold tracking-wider text-slate-700">
                    Skill Development & Future Tech Innovations • MSME Certified
                  </p>
                  <p className="text-[7px] sm:text-[8px] text-[#b45309] tracking-wide mt-0.5">
                    Registered under MSME, Ministry of MSME, Govt. of India (UDYAM-TN-17-0076606)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {EMAIL_ASSETS?.yrTech && (
                    <img src={EMAIL_ASSETS.yrTech} alt="YR Tech" className="h-6 sm:h-7 w-auto object-contain" />
                  )}
                  {EMAIL_ASSETS?.msme && (
                    <img src={EMAIL_ASSETS.msme} alt="MSME" className="h-8 sm:h-9 w-auto object-contain" />
                  )}
                </div>
              </div>

              {/* Body Citation Block */}
              <div className="text-center my-auto py-1">
                <h2 className="text-lg sm:text-2xl font-extrabold tracking-[0.2em] uppercase font-serif text-slate-900">
                  CERTIFICATE OF EXCELLENCE
                </h2>
                <p className="text-[9px] sm:text-[10.5px] font-bold tracking-[0.25em] text-[#b45309] uppercase mt-0.5">
                  VIRTUAL INTERNSHIP & SKILL DEVELOPMENT
                </p>
                <div className="mx-auto w-20 h-0.5 bg-[#d97706] mt-2 mb-2" />

                <p className="text-[10px] sm:text-[11px] font-serif italic text-slate-600">
                  This certificate is proudly awarded to
                </p>
                <h3 className="text-2xl sm:text-3xl font-black tracking-wide uppercase font-display text-slate-900 mt-1">
                  {(data.fullName || "Intern").toUpperCase()}
                </h3>
                <div className="mx-auto w-36 h-0.5 bg-[#d97706] my-2" />

                <p className="text-[9px] sm:text-[10.5px] max-w-xl mx-auto leading-relaxed text-slate-700">
                  In recognition of outstanding performance and successful completion of the industry-oriented virtual internship program in{" "}
                  <span className="font-bold text-[#b45309]">{domainName}</span>, demonstrating technical proficiency, professional dedication, and successful completion of the assigned capstone project.
                </p>

                {/* Metadata Pill Box */}
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full mt-3 text-[8.5px] sm:text-[9.5px] font-mono border bg-white border-slate-300 text-slate-800 shadow-xs">
                  <span>
                    CERT ID: <strong className="text-slate-900 font-bold">{data.certId}</strong>
                  </span>
                  <span className="text-slate-300">|</span>
                  <span>
                    INTERN ID: <strong className="text-[#b45309] font-bold">{data.internId}</strong>
                  </span>
                  <span className="text-slate-300">|</span>
                  <span>
                    GRADE: <strong className="text-emerald-600 font-bold">{grade}</strong>
                  </span>
                  <span className="text-slate-300">|</span>
                  <span>
                    ISSUED: <strong className="text-slate-900 font-bold">{dateStr}</strong>
                  </span>
                </div>
              </div>

              {/* Signatures & Seal Section: Symmetrical 4-Column Grid */}
              <div className="grid grid-cols-4 items-end pt-2 px-2">
                {/* Col 1: Founder */}
                <div className="text-center">
                  {EMAIL_ASSETS?.sigFounder && (
                    <img src={EMAIL_ASSETS.sigFounder} alt="Sign" className="h-9 sm:h-11 mx-auto object-contain" />
                  )}
                  <div className="w-24 h-px mx-auto my-1 bg-slate-400" />
                  <p className="font-bold text-[9.5px] sm:text-[11px] text-slate-900">{COMPANY.founder.name}</p>
                  <p className="text-[7.5px] sm:text-[8.5px] text-[#b45309] font-bold">{COMPANY.founder.title}</p>
                </div>

                {/* Col 2: Official Verified Seal */}
                <div className="text-center">
                  {EMAIL_ASSETS?.seal && (
                    <img src={EMAIL_ASSETS.seal} alt="Seal" className="size-11 sm:size-13 mx-auto object-contain" />
                  )}
                  <p className="text-[8px] sm:text-[9px] font-bold text-slate-500 mt-1">Official Verified Seal</p>
                  <p className="text-[7px] sm:text-[8px] text-[#b45309] font-semibold">SKYROVIX • MSME</p>
                </div>

                {/* Col 3: QR Code Verification */}
                <div className="text-center">
                  <div className="p-1 inline-block rounded bg-white border border-slate-200">
                    <QRCodeSVG value={verifyUrl} size={42} />
                  </div>
                  <p className="text-[8px] sm:text-[9px] font-bold text-slate-500 mt-1">Digitally Verified Certificate</p>
                  <p className="text-[7px] sm:text-[8px] text-slate-400 font-mono">Scan to verify online</p>
                </div>

                {/* Col 4: Co-Founder */}
                <div className="text-center">
                  {EMAIL_ASSETS?.sigCofounder && (
                    <img src={EMAIL_ASSETS.sigCofounder} alt="Sign" className="h-9 sm:h-11 mx-auto object-contain" />
                  )}
                  <div className="w-24 h-px mx-auto my-1 bg-slate-400" />
                  <p className="font-bold text-[9.5px] sm:text-[11px] text-slate-900">{COMPANY.cofounder.name}</p>
                  <p className="text-[7.5px] sm:text-[8.5px] text-[#b45309] font-bold">{COMPANY.cofounder.title}</p>
                </div>
              </div>

              {/* Bottom Security Footer */}
              <div className="flex items-center justify-between text-[7px] sm:text-[8px] text-slate-500 pt-2 border-t border-slate-300 mt-2">
                <span>
                  A digitally verifiable credential issued by SKYROVIX IT Solutions (Udyam Registered – Ministry of MSME, Government of India).
                </span>
                <span>
                  Official verification portal:{" "}
                  <a href="https://skyrovix.in/verify-certificate" target="_blank" rel="noreferrer" className="text-[#b45309] font-bold underline">
                    https://skyrovix.in/verify-certificate
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

