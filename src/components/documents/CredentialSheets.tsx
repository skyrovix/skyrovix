import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { EMAIL_ASSETS } from "@/lib/email-assets";
import { COMPANY } from "@/lib/constants";
import type { AdvancedDocMetadata } from "@/components/advanced-pdf-docs";

export interface CredentialSheetProps {
  fullName: string;
  internId: string;
  documentId?: string;
  domainName: string;
  durationMonths?: number;
  issuedAt: string;
  verifyUrl: string;
  planType?: "standard" | "premium";
  grade?: string;
  metadata?: AdvancedDocMetadata;
  id?: string;
}

const logoImg = EMAIL_ASSETS?.logo || "";
const sealImg = EMAIL_ASSETS?.seal || "";
const msmeImg = EMAIL_ASSETS?.msme || "";
const yrTechImg = EMAIL_ASSETS?.yrTech || "";
const vinixImg = EMAIL_ASSETS?.vinix || "";
const sigFounderImg = EMAIL_ASSETS?.sigFounder || "";
const sigCofounderImg = EMAIL_ASSETS?.sigCofounder || "";

// ─────────────────────────────────────────────────────────────────────────────
// 1. COMPLETION CERTIFICATE SHEET (A4 Landscape)
// ─────────────────────────────────────────────────────────────────────────────
export function CompletionCertificateSheet({
  fullName,
  internId,
  documentId = "SKX-CERT-2026-15713",
  domainName,
  issuedAt,
  verifyUrl,
  grade = "A+ (Outstanding)",
  id = "completion-cert-sheet",
}: CredentialSheetProps) {
  const displayDate = new Date(issuedAt || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      id={id}
      className="relative w-full rounded-2xl overflow-hidden shadow-xl border bg-[#faf8f2] text-slate-900 border-[#b45309]/50 select-none"
      style={{ aspectRatio: "1.414 / 1" }}
    >
      {/* Double Border Frame */}
      <div className="absolute inset-3 rounded-xl pointer-events-none border-2 border-[#b45309]" />
      <div className="absolute inset-5 rounded-lg pointer-events-none border border-[#d97706]/40" />

      <div className="relative h-full flex flex-col justify-between p-5 sm:p-7 md:p-8">
        {/* Header with Govt & Partner Logos */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {logoImg && <img src={logoImg} alt="Skyrovix" className="h-8 sm:h-9 w-auto object-contain" />}
            {vinixImg && <img src={vinixImg} alt="Vinix" className="h-4.5 sm:h-5.5 w-auto object-contain" />}
          </div>
          <div className="text-center px-2">
            <h1 className="text-base sm:text-lg md:text-xl font-extrabold tracking-[0.25em] text-[#b45309] uppercase font-serif">
              SKYROVIX
            </h1>
            <p className="text-[7.5px] sm:text-[8.5px] font-bold tracking-wider text-slate-700">
              Skill Development & Future Tech Innovations • MSME Certified
            </p>
            <p className="text-[6.5px] sm:text-[7px] text-[#b45309] tracking-wide mt-0.5">
              Registered under MSME, Ministry of MSME, Govt. of India (UDYAM-TN-17-0076606)
            </p>
          </div>
          <div className="flex items-center gap-2">
            {yrTechImg && <img src={yrTechImg} alt="YR Tech" className="h-4.5 sm:h-5.5 w-auto object-contain" />}
            {msmeImg && <img src={msmeImg} alt="MSME" className="h-6 sm:h-7 w-auto object-contain" />}
          </div>
        </div>

        {/* Certificate Body Title & Awardee */}
        <div className="text-center my-auto py-1">
          <h2 className="text-base sm:text-lg md:text-xl font-extrabold tracking-[0.2em] uppercase font-serif text-slate-900">
            CERTIFICATE OF EXCELLENCE
          </h2>
          <p className="text-[7.5px] sm:text-[8.5px] font-bold tracking-[0.25em] text-[#b45309] uppercase mt-0.5">
            VIRTUAL INTERNSHIP & SKILL DEVELOPMENT
          </p>
          <div className="mx-auto w-16 h-0.5 bg-[#d97706] mt-1 mb-1.5" />

          <p className="text-[8.5px] sm:text-[9.5px] font-serif italic text-slate-600">
            This certificate is proudly awarded to
          </p>
          <h3 className="text-lg sm:text-xl md:text-2xl font-black tracking-wide uppercase font-display text-slate-900 mt-0.5">
            {(fullName || "STUDENT INTERN").toUpperCase()}
          </h3>
          <div className="mx-auto w-28 sm:w-36 h-0.5 bg-[#d97706] my-1" />
          <p className="text-[7.5px] sm:text-[8.5px] md:text-[9px] max-w-lg mx-auto leading-relaxed text-slate-700">
            In recognition of outstanding performance and successful completion of the industry-oriented virtual internship program in{" "}
            <span className="font-bold text-[#b45309]">{domainName}</span>, demonstrating technical proficiency, professional dedication, and successful completion of the assigned capstone project.
          </p>

          {/* Metadata Badges */}
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full mt-2 text-[7px] sm:text-[8px] font-mono border bg-white border-slate-300 text-slate-800 shadow-2xs">
            <span>CERT ID: <strong className="text-slate-900 font-bold">{documentId}</strong></span>
            <span className="text-slate-300">|</span>
            <span>INTERN ID: <strong className="text-[#b45309] font-bold">{internId}</strong></span>
            <span className="text-slate-300">|</span>
            <span>GRADE: <strong className="text-emerald-600 font-bold">{grade}</strong></span>
            <span className="text-slate-300">|</span>
            <span>ISSUED: <strong className="text-slate-900 font-bold">{displayDate}</strong></span>
          </div>
        </div>

        {/* 4-Column Bottom: Signatures + Seal + QR */}
        <div className="grid grid-cols-4 items-end pt-1">
          <div className="text-center">
            {sigFounderImg && <img src={sigFounderImg} alt="Sign" className="h-6 sm:h-7 mx-auto object-contain" />}
            <div className="w-16 sm:w-20 h-px mx-auto my-0.5 bg-slate-400" />
            <p className="font-bold text-[8px] sm:text-[9px] text-slate-900">{COMPANY.founder.name}</p>
            <p className="text-[6.5px] sm:text-[7px] text-[#b45309] font-bold">{COMPANY.founder.title}</p>
          </div>

          <div className="text-center">
            {sealImg && <img src={sealImg} alt="Seal" className="size-7 sm:size-8 mx-auto object-contain" />}
            <p className="text-[6.5px] font-bold text-slate-500 mt-0.5">Official Verified Seal</p>
            <p className="text-[6px] text-[#b45309] font-semibold">SKYROVIX • MSME</p>
          </div>

          <div className="text-center">
            <div className="p-0.5 inline-block rounded bg-white border border-slate-200">
              <QRCodeSVG value={verifyUrl} size={30} />
            </div>
            <p className="text-[6.5px] font-bold text-slate-500 mt-0.5">Digitally Verified</p>
            <p className="text-[6px] text-slate-400 font-mono">Scan to verify online</p>
          </div>

          <div className="text-center">
            {sigCofounderImg && <img src={sigCofounderImg} alt="Sign" className="h-6 sm:h-7 mx-auto object-contain" />}
            <div className="w-16 sm:w-20 h-px mx-auto my-0.5 bg-slate-400" />
            <p className="font-bold text-[8px] sm:text-[9px] text-slate-900">{COMPANY.cofounder.name}</p>
            <p className="text-[6.5px] sm:text-[7px] text-[#b45309] font-bold">{COMPANY.cofounder.title}</p>
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-between text-[6px] sm:text-[7px] text-slate-500 pt-1 border-t border-slate-300 mt-1">
          <span>A digitally verifiable credential issued by SKYROVIX IT Solutions (Udyam Registered – Ministry of MSME, Govt. of India).</span>
          <span>Official verification portal: <span className="text-[#b45309] font-bold">https://skyrovix.in/verify-certificate</span></span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. OFFICIAL OFFER LETTER SHEET (A4 Portrait Formal Letterhead)
// ─────────────────────────────────────────────────────────────────────────────
export function OfferLetterSheet({
  fullName,
  internId,
  domainName,
  durationMonths = 3,
  issuedAt,
  id = "offer-letter-sheet",
}: CredentialSheetProps) {
  const displayDate = new Date(issuedAt || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const endDate = new Date(issuedAt || Date.now());
  endDate.setMonth(endDate.getMonth() + (durationMonths || 1));
  const displayEndDate = endDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const durLabel = `${durationMonths} Month${durationMonths > 1 ? "s" : ""}`;

  return (
    <div
      id={id}
      className="relative w-full bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-300 p-6 sm:p-8 font-sans text-xs sm:text-[13px] leading-relaxed select-text"
    >
      {/* Letterhead */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-300">
        <div className="flex items-center gap-3">
          {logoImg && <img src={logoImg} alt="Skyrovix" className="size-11 sm:size-12 object-contain" />}
          <div className="h-9 w-px bg-slate-300 mx-0.5" />
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-wide text-[#181619] leading-tight">SKYROVIX</h2>
            <p className="text-[11px] font-bold text-[#f95c4b] leading-tight">Empowering Future Innovators</p>
            <p className="text-[10px] text-slate-500 mt-0.5">www.skyrovix.in | skyrovix@gmail.com</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">INTERNSHIP ID</div>
          <div className="text-xs sm:text-sm font-black font-mono text-[#f95c4b]">{internId}</div>
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-1.5">ISSUE DATE</div>
          <div className="text-xs font-bold text-[#181619]">{displayDate}</div>
        </div>
      </div>

      {/* Document Title Banner */}
      <div className="mt-4 mb-3">
        <h1 className="text-lg sm:text-xl font-black tracking-wide uppercase text-[#181619]">INTERNSHIP OFFER LETTER</h1>
        <p className="text-xs font-bold text-[#f95c4b] mt-0.5">Date: {displayDate}</p>
      </div>

      {/* Greeting & Introductory Statement */}
      <div className="space-y-2 text-xs sm:text-[13px] text-slate-700 leading-relaxed mb-4">
        <p>Dear <strong className="text-slate-900 font-bold">{fullName}</strong>,</p>
        <p>
          We are delighted to offer you the position of <strong className="text-slate-900 font-bold">Virtual Intern – {domainName}</strong> at <strong className="text-slate-900 font-bold">Skyrovix</strong> (accessible at <strong className="text-slate-900 font-bold">skyrovix.in</strong>). After reviewing your application, technical aptitude, and enthusiasm, we are confident that your skills make you a valuable addition to our engineering cohort.
        </p>
        <p>Your virtual internship details, work deliverables, and engagement particulars are finalized as follows:</p>
      </div>

      {/* Particulars Table (8 Rows) */}
      <div className="rounded border border-slate-300 overflow-hidden mb-4 shadow-2xs">
        <div className="bg-[#181619] text-white px-3.5 py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
          INTERNSHIP PROGRAM PARTICULARS
        </div>
        <div className="text-xs divide-y divide-slate-200">
          <div className="grid grid-cols-12 px-3.5 py-1.5 bg-white">
            <span className="col-span-5 text-slate-600 font-medium">Internship Track</span>
            <span className="col-span-7 font-bold text-slate-900">{domainName}</span>
          </div>
          <div className="grid grid-cols-12 px-3.5 py-1.5 bg-[#faf8f2]">
            <span className="col-span-5 text-slate-600 font-medium">Intern ID</span>
            <span className="col-span-7 font-mono font-bold text-[#f95c4b]">{internId}</span>
          </div>
          <div className="grid grid-cols-12 px-3.5 py-1.5 bg-white">
            <span className="col-span-5 text-slate-600 font-medium">Program Duration</span>
            <span className="col-span-7 font-bold text-slate-900">{durLabel}</span>
          </div>
          <div className="grid grid-cols-12 px-3.5 py-1.5 bg-[#faf8f2]">
            <span className="col-span-5 text-slate-600 font-medium">Commencement Date</span>
            <span className="col-span-7 font-bold text-slate-900">{displayDate}</span>
          </div>
          <div className="grid grid-cols-12 px-3.5 py-1.5 bg-white">
            <span className="col-span-5 text-slate-600 font-medium">Estimated Completion</span>
            <span className="col-span-7 font-bold text-slate-900">{displayEndDate}</span>
          </div>
          <div className="grid grid-cols-12 px-3.5 py-1.5 bg-[#faf8f2]">
            <span className="col-span-5 text-slate-600 font-medium">Stipend Specification</span>
            <span className="col-span-7 font-bold text-slate-900">Unpaid (Performance-Based Internship)</span>
          </div>
          <div className="grid grid-cols-12 px-3.5 py-1.5 bg-white">
            <span className="col-span-5 text-slate-600 font-medium">Location & Model</span>
            <span className="col-span-7 font-bold text-slate-900">Remote / Virtual (Task-Based, Flexible Hours)</span>
          </div>
          <div className="grid grid-cols-12 px-3.5 py-1.5 bg-[#faf8f2]">
            <span className="col-span-5 text-slate-600 font-medium">Official Domain Portal</span>
            <span className="col-span-7 font-mono font-bold text-[#181619]">https://skyrovix.in</span>
          </div>
        </div>
      </div>

      {/* General Terms & Conditions */}
      <div className="rounded-md bg-[#faf8f2] border border-slate-200/90 p-3 sm:p-3.5 mb-3">
        <h3 className="text-[11px] sm:text-xs font-bold text-[#181619] uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#f95c4b]" />
          GENERAL TERMS & CONDITIONS OF INTERNSHIP:
        </h3>
        <div className="space-y-1.5 text-xs text-slate-600 leading-snug">
          <p><strong className="text-slate-900 font-semibold">1. Task Execution & Milestones:</strong> You will work on production-grade tasks and project modules aligned with {domainName}. Timely submission of weekly progress updates and milestone deliverables via skyrovix.in is mandatory.</p>
          <p><strong className="text-slate-900 font-semibold">2. Code of Conduct & Integrity:</strong> Plagiarism, unauthorized code dissemination, or any form of professional misconduct will lead to immediate cancellation of your internship program.</p>
          <p><strong className="text-slate-900 font-semibold">3. Confidentiality & Non-Disclosure:</strong> Any documentation, source code, architecture designs, or mock datasets shared during this program are strictly confidential and the intellectual property of Skyrovix.</p>
          <p><strong className="text-slate-900 font-semibold">4. Mentorship & Continuous Evaluation:</strong> You will receive structured technical guidance and feedback throughout your tenure to foster industry-standard development capabilities.</p>
          <p><strong className="text-slate-900 font-semibold">5. Certification:</strong> An official Certificate of Internship Completion will be issued only upon successful submission and mentor approval of all milestone tasks.</p>
        </div>
      </div>

      {/* Certificate of Completion Policy */}
      <div className="rounded-md bg-[#faf8f2] border border-slate-200/90 p-3 sm:p-3.5 mb-3">
        <h3 className="text-[11px] sm:text-xs font-bold text-[#f95c4b] uppercase tracking-wide mb-1 flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#f95c4b]" />
          CERTIFICATE OF COMPLETION
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Upon successful completion of the internship tenure and fulfillment of all assigned tasks, you will receive an official Certificate of Internship from Skyrovix, verifiable on our official domain at <strong className="text-slate-900 font-mono font-medium">skyrovix.in/verify-certificate</strong>.
        </p>
      </div>

      <p className="text-xs text-slate-700 leading-relaxed mb-4">
        Please return the signed copy of this letter as a token of your formal acceptance of this offer. We look forward to a mutually rewarding learning experience.
      </p>

      {/* Signatures & Seal Section */}
      <div className="flex items-end justify-between mt-3 mb-2">
        <div className="flex flex-col items-start text-left w-44">
          {sigFounderImg && <img src={sigFounderImg} alt="Founder Signature" className="h-12 sm:h-14 object-contain mb-1" />}
          <div className="w-36 sm:w-40 border-t-2 border-[#181619] mb-1" />
          <span className="text-xs sm:text-[13px] font-bold text-[#181619]">{COMPANY.founder.name}</span>
          <span className="text-[10px] font-bold text-[#f95c4b] uppercase tracking-wider">{COMPANY.founder.title}</span>
          <span className="text-[9px] text-slate-400">Skyrovix</span>
        </div>

        <div className="text-center">
          {sealImg && <img src={sealImg} alt="Official Seal" className="size-12 sm:size-14 object-contain mx-auto" />}
          <p className="text-[8px] font-bold text-slate-500 mt-1 uppercase tracking-wider">OFFICIAL SEAL</p>
        </div>

        <div className="flex flex-col items-end text-right w-44">
          {sigCofounderImg && <img src={sigCofounderImg} alt="Co-Founder Signature" className="h-12 sm:h-14 object-contain mb-1" />}
          <div className="w-36 sm:w-40 border-t-2 border-[#181619] mb-1" />
          <span className="text-xs sm:text-[13px] font-bold text-[#181619]">{COMPANY.cofounder.name}</span>
          <span className="text-[10px] font-bold text-[#f95c4b] uppercase tracking-wider">{COMPANY.cofounder.title}</span>
          <span className="text-[9px] text-slate-400">Skyrovix</span>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 pt-2.5 mt-3 text-[9px] text-slate-400 flex items-center justify-between">
        <span>SKYROVIX IT Solutions • UDYAM-TN-17-0076606</span>
        <span>skyrovix.in</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. LETTER OF RECOMMENDATION (LOR) SHEET (A4 Portrait Regal Letterhead)
// ─────────────────────────────────────────────────────────────────────────────
export function LorSheet({
  fullName,
  internId,
  documentId = "SKX-LOR-2026-44182",
  domainName,
  durationMonths = 3,
  issuedAt,
  verifyUrl,
  metadata,
  id = "lor-sheet",
}: CredentialSheetProps) {
  const displayDate = new Date(issuedAt || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const projectTitle = metadata?.projectTitle || "Enterprise Cloud Platform with Scalable Microservices";
  const mentorRemarks =
    metadata?.mentorRemarks ||
    "Exemplary technical proficiency, clean architectural adherence, proactive sprint delivery, and exceptional problem-solving acumen throughout the tenure.";

  return (
    <div
      id={id}
      className="relative w-full bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-300 p-6 sm:p-9 font-sans text-xs sm:text-[13px] leading-relaxed select-text overflow-hidden"
    >
      {/* Decorative Inner Frames */}
      <div className="absolute inset-3 rounded-xl pointer-events-none border border-slate-900/80" />
      <div className="absolute inset-5 rounded-lg pointer-events-none border border-[#f95c4b]/30" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#f95c4b] mb-4">
          <div className="flex items-center gap-2.5">
            {logoImg && <img src={logoImg} alt="Skyrovix" className="size-11 object-contain" />}
            <div className="h-9 w-px bg-slate-300 mx-1" />
            <div>
              <h2 className="text-base font-extrabold tracking-wider text-[#181619] leading-tight">SKYROVIX</h2>
              <p className="text-[10px] font-bold text-[#f95c4b]">Skill Development & Future Tech Innovations</p>
              <p className="text-[9px] text-slate-500">MSME UDYAM-TN-17-0076606 | www.skyrovix.in</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[8px] font-bold text-slate-400 block uppercase tracking-wider">DOCUMENT REF</span>
            <span className="text-xs font-mono font-bold text-[#f95c4b] block">{documentId}</span>
            <span className="text-[8px] font-bold text-slate-400 block uppercase tracking-wider mt-1">DATE OF ISSUANCE</span>
            <span className="text-xs font-bold text-slate-800 block">{displayDate}</span>
          </div>
        </div>

        {/* Document Title */}
        <div className="text-center mb-4">
          <h1 className="text-base sm:text-lg font-black tracking-[0.18em] uppercase text-[#181619]">
            LETTER OF RECOMMENDATION
          </h1>
          <div className="w-16 h-0.5 bg-[#f95c4b] mx-auto mt-1" />
        </div>

        {/* Salutation */}
        <p className="font-extrabold text-xs text-[#181619] uppercase tracking-wider mb-2">
          TO WHOM IT MAY CONCERN
        </p>

        {/* Candidate Summary Box */}
        <div className="p-3 rounded-xl bg-[#faf8f2] border border-amber-300/80 flex items-center justify-between mb-4 text-xs">
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-bold block">Candidate Information</span>
            <span className="font-extrabold text-sm text-[#181619]">{fullName}</span>
            <span className="text-[11px] text-slate-600 block mt-0.5">
              Internship Domain: <strong className="text-slate-900">{domainName}</strong> ({durationMonths} Month{durationMonths > 1 ? "s" : ""})
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-500 uppercase font-bold block">Internship ID</span>
            <span className="font-mono font-bold text-xs text-[#f95c4b]">{internId}</span>
            <span className="text-[10px] font-semibold text-amber-700 block mt-0.5">Track: Premium Verified Scholar</span>
          </div>
        </div>

        {/* Formal Recommendation Paragraphs */}
        <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed text-justify mb-4">
          <p>
            It is with immense pleasure that I formally write this Letter of Recommendation for <strong className="text-slate-900 font-bold">{fullName}</strong>, who has successfully completed a rigorous, hands-on virtual internship in <strong className="text-slate-900 font-bold">{domainName}</strong> at Skyrovix IT Solutions.
          </p>
          <p>
            Throughout the {durationMonths}-month intensive tenure, {fullName} exhibited exemplary technical competence, analytical acumen, and an exceptional dedication to engineering standards. The candidate spearheaded end-to-end full stack architecture implementations, robust API microservices, database schemas, and dynamic user interfaces with clean modular code and thorough unit validation.
          </p>
          <p>
            In their capstone initiative, <strong className="text-slate-900">"{projectTitle}"</strong>, {fullName} demonstrated deep technical mastery in modern web architectures, agile software delivery, responsive UI design, and production deployment resilience.
          </p>
          <p>
            Beyond technical capabilities, {fullName} demonstrated exemplary professionalism, punctuality, and proactive communication. The candidate consistently incorporated constructive code review feedback and collaborated harmoniously with mentors and peers.
          </p>

          {/* Mentor Assessment Quote */}
          <div className="p-2.5 rounded-xl bg-[#faf8f2] border border-slate-200 text-[11px] font-medium text-slate-800 italic">
            "{mentorRemarks}"
          </div>

          <p className="text-[11px] text-slate-500 pt-1">
            Please feel free to reach out to us at <strong className="text-[#f95c4b]">contact@skyrovix.in</strong> should you require further background information.
          </p>
        </div>

        {/* 4-Column Bottom: Signatures + Seal + QR */}
        <div className="grid grid-cols-4 items-end pt-3 border-t border-slate-200">
          <div className="text-center">
            {sigFounderImg && <img src={sigFounderImg} alt="Sign" className="h-8 mx-auto object-contain" />}
            <div className="w-20 h-px mx-auto my-0.5 bg-slate-400" />
            <p className="font-bold text-[9px] text-slate-900">{COMPANY.founder.name}</p>
            <p className="text-[7.5px] text-[#f95c4b] font-bold">{COMPANY.founder.title}</p>
          </div>

          <div className="text-center">
            {sealImg && <img src={sealImg} alt="Seal" className="size-9 mx-auto object-contain" />}
            <p className="text-[7px] font-bold text-slate-500 mt-0.5">Official Verified Seal</p>
          </div>

          <div className="text-center">
            <div className="p-0.5 inline-block rounded bg-white border border-slate-200">
              <QRCodeSVG value={verifyUrl} size={34} />
            </div>
            <p className="text-[7px] font-bold text-slate-500 mt-0.5">Scan to Verify</p>
          </div>

          <div className="text-center">
            {sigCofounderImg && <img src={sigCofounderImg} alt="Sign" className="h-8 mx-auto object-contain" />}
            <div className="w-20 h-px mx-auto my-0.5 bg-slate-400" />
            <p className="font-bold text-[9px] text-slate-900">{COMPANY.cofounder.name}</p>
            <p className="text-[7.5px] text-[#f95c4b] font-bold">{COMPANY.cofounder.title}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[7px] text-slate-400 pt-2 border-t border-slate-100 mt-2">
          <span>A digitally verifiable document issued by Skyrovix IT Solutions (MSME Registered, Govt. of India).</span>
          <span>Verify online: {verifyUrl}</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. EXPERIENCE & RELIEVING LETTER SHEET (A4 Portrait Relieving Certificate)
// ─────────────────────────────────────────────────────────────────────────────
export function ExperienceLetterSheet({
  fullName,
  internId,
  documentId = "SKX-EXP-2026-61928",
  domainName,
  durationMonths = 3,
  issuedAt,
  verifyUrl,
  id = "experience-letter-sheet",
}: CredentialSheetProps) {
  const displayDate = new Date(issuedAt || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      id={id}
      className="relative w-full bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-300 p-6 sm:p-9 font-sans text-xs sm:text-[13px] leading-relaxed select-text overflow-hidden"
    >
      <div className="absolute inset-3 rounded-xl pointer-events-none border border-slate-900/80" />
      <div className="absolute inset-5 rounded-lg pointer-events-none border border-emerald-500/30" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-emerald-600 mb-4">
          <div className="flex items-center gap-2.5">
            {logoImg && <img src={logoImg} alt="Skyrovix" className="size-11 object-contain" />}
            <div className="h-9 w-px bg-slate-300 mx-1" />
            <div>
              <h2 className="text-base font-extrabold tracking-wider text-[#181619] leading-tight">SKYROVIX</h2>
              <p className="text-[10px] font-bold text-emerald-600">Skill Development & Future Tech Innovations</p>
              <p className="text-[9px] text-slate-500">MSME UDYAM-TN-17-0076606 | Chennai, India</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[8px] font-bold text-slate-400 block uppercase tracking-wider">EXPERIENCE CERT REF</span>
            <span className="text-xs font-mono font-bold text-emerald-700 block">{documentId}</span>
            <span className="text-[8px] font-bold text-slate-400 block uppercase tracking-wider mt-1">ISSUANCE DATE</span>
            <span className="text-xs font-bold text-slate-800 block">{displayDate}</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-4">
          <h1 className="text-base sm:text-lg font-black tracking-[0.18em] uppercase text-[#181619]">
            INTERNSHIP EXPERIENCE & RELIEVING LETTER
          </h1>
          <div className="w-16 h-0.5 bg-emerald-600 mx-auto mt-1" />
        </div>

        {/* Candidate Details Box */}
        <div className="p-3 rounded-xl bg-[#faf8f2] border border-emerald-300/80 flex items-center justify-between mb-4 text-xs">
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-bold block">Intern Details</span>
            <span className="font-extrabold text-sm text-[#181619]">{fullName}</span>
            <span className="text-[11px] text-slate-600 block mt-0.5">
              Designation: <strong className="text-slate-900">Software Development Intern ({domainName})</strong>
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-500 uppercase font-bold block">Intern ID</span>
            <span className="font-mono font-bold text-xs text-emerald-700">{internId}</span>
            <span className="text-[10px] font-semibold text-slate-600 block mt-0.5">Tenure: {durationMonths} Months</span>
          </div>
        </div>

        {/* Body Text */}
        <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed text-justify mb-4">
          <p>
            This is to certify that <strong className="text-slate-900 font-bold">{fullName}</strong> (Intern ID: <strong className="font-mono text-slate-900">{internId}</strong>) has successfully served as a <strong className="text-slate-900 font-bold">{domainName} Intern</strong> at Skyrovix IT Solutions for the period of <strong className="text-slate-900">{durationMonths} Months</strong>.
          </p>
          <p>
            During this tenure, {fullName} actively contributed to the full lifecycle of software development sprints, demonstrating hands-on proficiency in the following core engineering responsibilities:
          </p>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px]">
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold shrink-0">•</span>
              <p><strong className="text-slate-900">Architecture & Design:</strong> Engineered responsive web application components, component state pipelines, and scalable database schemas.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold shrink-0">•</span>
              <p><strong className="text-slate-900">API Integration & Microservices:</strong> Built, debugged, and documented secure RESTful endpoints, data validation layers, and third-party API handlers.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold shrink-0">•</span>
              <p><strong className="text-slate-900">Quality Assurance & Delivery:</strong> Maintained high code quality through unit testing, Git version control, branch merging workflows, and automated deployment checks.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold shrink-0">•</span>
              <p><strong className="text-slate-900">Collaborative Problem Solving:</strong> Participated in peer code reviews, sprint task retrospectives, and technical mentoring feedback loops.</p>
            </div>
          </div>

          <p>
            {fullName} has demonstrated commendable discipline, technical curiosity, and an admirable work ethic throughout the internship. The candidate's contributions have adhered strictly to industry-standard software engineering best practices.
          </p>
          <p>
            {fullName} stands relieved of their internship duties effective {displayDate} following full verification and approval of all assigned deliverables. We wish them every success in all future professional and academic pursuits.
          </p>
        </div>

        {/* 4-Column Bottom */}
        <div className="grid grid-cols-4 items-end pt-3 border-t border-slate-200">
          <div className="text-center">
            {sigFounderImg && <img src={sigFounderImg} alt="Sign" className="h-8 mx-auto object-contain" />}
            <div className="w-20 h-px mx-auto my-0.5 bg-slate-400" />
            <p className="font-bold text-[9px] text-slate-900">{COMPANY.founder.name}</p>
            <p className="text-[7.5px] text-emerald-700 font-bold">{COMPANY.founder.title}</p>
          </div>

          <div className="text-center">
            {sealImg && <img src={sealImg} alt="Seal" className="size-9 mx-auto object-contain" />}
            <p className="text-[7px] font-bold text-slate-500 mt-0.5">Official Verified Seal</p>
          </div>

          <div className="text-center">
            <div className="p-0.5 inline-block rounded bg-white border border-slate-200">
              <QRCodeSVG value={verifyUrl} size={34} />
            </div>
            <p className="text-[7px] font-bold text-slate-500 mt-0.5">Scan to Verify</p>
          </div>

          <div className="text-center">
            {sigCofounderImg && <img src={sigCofounderImg} alt="Sign" className="h-8 mx-auto object-contain" />}
            <div className="w-20 h-px mx-auto my-0.5 bg-slate-400" />
            <p className="font-bold text-[9px] text-slate-900">{COMPANY.cofounder.name}</p>
            <p className="text-[7.5px] text-emerald-700 font-bold">{COMPANY.cofounder.title}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[7px] text-slate-400 pt-2 border-t border-slate-100 mt-2">
          <span>Official Skyrovix IT Solutions Experience Record • UDYAM-TN-17-0076606</span>
          <span>Portal: {verifyUrl}</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PROJECT COMPLETION CERTIFICATE SHEET (A4 Landscape Regal Certificate)
// ─────────────────────────────────────────────────────────────────────────────
export function ProjectCertificateSheet({
  fullName,
  internId,
  documentId = "SKX-PRJ-2026-83021",
  domainName,
  issuedAt,
  verifyUrl,
  grade = "A+ (Outstanding)",
  metadata,
  id = "project-cert-sheet",
}: CredentialSheetProps) {
  const displayDate = new Date(issuedAt || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const projectTitle = metadata?.projectTitle || "Enterprise Cloud Platform with Scalable Microservices";
  const technologies = metadata?.technologies || ["React", "Node.js", "Express", "MongoDB", "REST APIs", "Tailwind CSS"];

  return (
    <div
      id={id}
      className="relative w-full rounded-2xl overflow-hidden shadow-xl border bg-[#faf8f2] text-slate-900 border-[#b45309]/50 select-none"
      style={{ aspectRatio: "1.414 / 1" }}
    >
      <div className="absolute inset-3 rounded-xl pointer-events-none border-2 border-[#b45309]" />
      <div className="absolute inset-5 rounded-lg pointer-events-none border border-[#f95c4b]/40" />

      <div className="relative h-full flex flex-col justify-between p-5 sm:p-7 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {logoImg && <img src={logoImg} alt="Skyrovix" className="h-8 sm:h-9 w-auto object-contain" />}
            {vinixImg && <img src={vinixImg} alt="Vinix" className="h-4.5 sm:h-5.5 w-auto object-contain" />}
          </div>
          <div className="text-center px-2">
            <h1 className="text-base sm:text-lg md:text-xl font-extrabold tracking-[0.25em] text-[#b45309] uppercase font-serif">
              SKYROVIX
            </h1>
            <p className="text-[7.5px] sm:text-[8.5px] font-bold tracking-wider text-slate-700">
              Skill Development & Future Tech Innovations • MSME Certified
            </p>
            <p className="text-[6.5px] sm:text-[7px] text-[#b45309] tracking-wide mt-0.5">
              UDYAM-TN-17-0076606 • Ministry of MSME, Govt. of India
            </p>
          </div>
          <div className="flex items-center gap-2">
            {yrTechImg && <img src={yrTechImg} alt="YR Tech" className="h-4.5 sm:h-5.5 w-auto object-contain" />}
            {msmeImg && <img src={msmeImg} alt="MSME" className="h-6 sm:h-7 w-auto object-contain" />}
          </div>
        </div>

        {/* Certificate Title */}
        <div className="text-center my-auto py-1">
          <h2 className="text-base sm:text-lg md:text-xl font-extrabold tracking-[0.2em] uppercase font-serif text-slate-900">
            PROJECT COMPLETION CERTIFICATE
          </h2>
          <p className="text-[7.5px] sm:text-[8.5px] font-bold tracking-[0.25em] text-[#f95c4b] uppercase mt-0.5">
            CAPSTONE ENGINEERING & PRODUCTION DEPLOYMENT
          </p>

          <p className="text-[8px] sm:text-[9px] font-serif italic text-slate-600 mt-1">This is proudly presented to</p>
          <h3 className="text-lg sm:text-xl md:text-2xl font-black tracking-wide uppercase font-display text-slate-900 mt-0.5">
            {(fullName || "STUDENT INTERN").toUpperCase()}
          </h3>
          <div className="mx-auto w-28 sm:w-36 h-0.5 bg-[#f95c4b] my-1" />
          <p className="text-[7.5px] sm:text-[8.5px] max-w-lg mx-auto leading-relaxed text-slate-700">
            for outstanding execution, technical rigor, and successful live deployment of the capstone project in the domain of{" "}
            <span className="font-bold text-[#b45309]">{domainName}</span>.
          </p>

          {/* Project Box */}
          <div className="mt-2 mx-auto max-w-xl p-2.5 rounded-xl bg-white border border-slate-300 text-left flex items-center justify-between shadow-2xs">
            <div className="flex-1 pr-3">
              <span className="text-[7px] uppercase font-bold text-slate-400 block">Capstone Project Title</span>
              <span className="font-bold text-xs sm:text-sm text-[#f95c4b] line-clamp-1">{projectTitle}</span>
              <span className="text-[7.5px] text-slate-600 block mt-0.5 line-clamp-1">
                Tech Stack: {technologies.join(" • ")}
              </span>
            </div>
            <div className="border-l border-slate-200 pl-3 text-right shrink-0">
              <span className="text-[7px] uppercase font-bold text-slate-400 block">Evaluation Status</span>
              <span className="font-bold text-[8.5px] text-emerald-600 block">Verified & Approved</span>
              <span className="text-[7.5px] font-semibold text-slate-700 block">Grade: {grade}</span>
            </div>
          </div>

          {/* Badges */}
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full mt-2 text-[7px] sm:text-[8px] font-mono border bg-white border-slate-300 text-slate-800 shadow-2xs">
            <span>DOC ID: <strong className="text-[#f95c4b] font-bold">{documentId}</strong></span>
            <span className="text-slate-300">|</span>
            <span>INTERN ID: <strong className="text-slate-900 font-bold">{internId}</strong></span>
            <span className="text-slate-300">|</span>
            <span>DATE ISSUED: <strong className="text-slate-900 font-bold">{displayDate}</strong></span>
          </div>
        </div>

        {/* 4-Column Bottom */}
        <div className="grid grid-cols-4 items-end pt-1">
          <div className="text-center">
            {sigFounderImg && <img src={sigFounderImg} alt="Sign" className="h-6 sm:h-7 mx-auto object-contain" />}
            <div className="w-16 sm:w-20 h-px mx-auto my-0.5 bg-slate-400" />
            <p className="font-bold text-[8px] sm:text-[9px] text-slate-900">{COMPANY.founder.name}</p>
            <p className="text-[6.5px] sm:text-[7px] text-[#b45309] font-bold">{COMPANY.founder.title}</p>
          </div>

          <div className="text-center">
            {sealImg && <img src={sealImg} alt="Seal" className="size-7 sm:size-8 mx-auto object-contain" />}
            <p className="text-[6.5px] font-bold text-slate-500 mt-0.5">Official Verified Seal</p>
          </div>

          <div className="text-center">
            <div className="p-0.5 inline-block rounded bg-white border border-slate-200">
              <QRCodeSVG value={verifyUrl} size={30} />
            </div>
            <p className="text-[6.5px] font-bold text-slate-500 mt-0.5">Scan to verify</p>
          </div>

          <div className="text-center">
            {sigCofounderImg && <img src={sigCofounderImg} alt="Sign" className="h-6 sm:h-7 mx-auto object-contain" />}
            <div className="w-16 sm:w-20 h-px mx-auto my-0.5 bg-slate-400" />
            <p className="font-bold text-[8px] sm:text-[9px] text-slate-900">{COMPANY.cofounder.name}</p>
            <p className="text-[6.5px] sm:text-[7px] text-[#b45309] font-bold">{COMPANY.cofounder.title}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[6px] sm:text-[7px] text-slate-500 pt-1 border-t border-slate-300 mt-1">
          Official verification portal: {verifyUrl} • Skyrovix IT Solutions
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. PERFORMANCE EVALUATION REPORT SHEET (A4 Portrait Executive Audit Scorecard)
// ─────────────────────────────────────────────────────────────────────────────
export function PerformanceReportSheet({
  fullName,
  internId,
  documentId = "SKX-PERF-2026-72819",
  domainName,
  durationMonths = 3,
  issuedAt,
  verifyUrl,
  planType = "premium",
  grade = "A+ (Outstanding)",
  metadata,
  id = "performance-report-sheet",
}: CredentialSheetProps) {
  const displayDate = new Date(issuedAt || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const codeQuality = metadata?.codeQuality ?? 9.7;
  const technicalSkills = metadata?.technicalSkills ?? 9.8;
  const problemSolving = metadata?.problemSolving ?? 9.6;
  const teamwork = metadata?.teamwork ?? 9.5;
  const projectPerformance = metadata?.projectPerformance ?? 9.8;
  const mentorRemarks =
    metadata?.mentorRemarks ||
    "The student exhibited exceptional technical problem-solving capabilities, adherence to clean architectural principles, and timely submission of all structured milestones.";

  return (
    <div
      id={id}
      className="relative w-full bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-300 p-6 sm:p-9 font-sans text-xs sm:text-[13px] leading-relaxed select-text overflow-hidden"
    >
      <div className="absolute inset-3 rounded-xl pointer-events-none border border-slate-900/80" />
      <div className="absolute inset-5 rounded-lg pointer-events-none border border-indigo-500/30" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-indigo-600 mb-4">
          <div className="flex items-center gap-2.5">
            {logoImg && <img src={logoImg} alt="Skyrovix" className="size-11 object-contain" />}
            <div className="h-9 w-px bg-slate-300 mx-1" />
            <div>
              <h2 className="text-base font-extrabold tracking-wider text-[#181619] leading-tight">SKYROVIX</h2>
              <p className="text-[10px] font-bold text-indigo-600">Engineering & Academic Assessment Division</p>
              <p className="text-[9px] text-slate-500">MSME UDYAM-TN-17-0076606</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[8px] font-bold text-slate-400 block uppercase tracking-wider">REPORT REF</span>
            <span className="text-xs font-mono font-bold text-indigo-700 block">{documentId}</span>
            <span className="text-[8px] font-bold text-slate-400 block uppercase tracking-wider mt-1">EVALUATION DATE</span>
            <span className="text-xs font-bold text-slate-800 block">{displayDate}</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-4">
          <h1 className="text-base sm:text-lg font-black tracking-[0.18em] uppercase text-[#181619]">
            PERFORMANCE EVALUATION REPORT
          </h1>
          <div className="w-16 h-0.5 bg-indigo-600 mx-auto mt-1" />
        </div>

        {/* Candidate Info Box */}
        <div className="p-3 rounded-xl bg-[#faf8f2] border border-indigo-200 flex items-center justify-between mb-4 text-xs">
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-bold block">Candidate Information</span>
            <span className="font-extrabold text-sm text-[#181619]">{fullName}</span>
            <span className="text-[11px] text-slate-600 block mt-0.5">
              Domain: <strong className="text-slate-900">{domainName}</strong> | Duration: {durationMonths} Months
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-500 uppercase font-bold block">Internship Reference</span>
            <span className="font-mono font-bold text-xs text-[#f95c4b]">{internId}</span>
            <span className="text-[10px] font-semibold text-emerald-600 block mt-0.5">
              Task Completion: 100% (All Tasks Approved)
            </span>
          </div>
        </div>

        {/* Section 1: Quantitative Metrics Table */}
        <div className="mb-4">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 mb-2">
            1. Quantitative Competency Metrics
          </h3>
          <div className="rounded border border-slate-300 overflow-hidden text-xs">
            <div className="bg-[#181619] text-white px-3 py-1.5 flex justify-between font-bold text-[10px] uppercase tracking-wider">
              <span className="w-48">Evaluation Category</span>
              <span className="flex-1">Performance Indicators</span>
              <span className="w-20 text-right">Score (10)</span>
            </div>
            <div className="divide-y divide-slate-200">
              <div className="flex justify-between items-center px-3 py-1.5 bg-white">
                <span className="w-48 font-bold text-slate-900">Code Quality & Architecture</span>
                <span className="flex-1 text-slate-600 text-[11px]">Clean modular structure, DRY & SOLID adherence</span>
                <span className="w-20 text-right font-bold text-[#f95c4b]">{codeQuality} / 10</span>
              </div>
              <div className="flex justify-between items-center px-3 py-1.5 bg-[#faf8f2]">
                <span className="w-48 font-bold text-slate-900">Technical Skill Mastery</span>
                <span className="flex-1 text-slate-600 text-[11px]">RESTful APIs, state pipelines, database schema modeling</span>
                <span className="w-20 text-right font-bold text-[#f95c4b]">{technicalSkills} / 10</span>
              </div>
              <div className="flex justify-between items-center px-3 py-1.5 bg-white">
                <span className="w-48 font-bold text-slate-900">Problem-Solving & Debugging</span>
                <span className="flex-1 text-slate-600 text-[11px]">Algorithm efficiency, error handling, proactive troubleshooting</span>
                <span className="w-20 text-right font-bold text-[#f95c4b]">{problemSolving} / 10</span>
              </div>
              <div className="flex justify-between items-center px-3 py-1.5 bg-[#faf8f2]">
                <span className="w-48 font-bold text-slate-900">Project Execution & Capstone</span>
                <span className="flex-1 text-slate-600 text-[11px]">Full stack features, deployment readiness, UI/UX polish</span>
                <span className="w-20 text-right font-bold text-[#f95c4b]">{projectPerformance} / 10</span>
              </div>
              <div className="flex justify-between items-center px-3 py-1.5 bg-white">
                <span className="w-48 font-bold text-slate-900">Communication & Teamwork</span>
                <span className="flex-1 text-slate-600 text-[11px]">Sprint progress reporting, peer collaboration, mentor responsiveness</span>
                <span className="w-20 text-right font-bold text-[#f95c4b]">{teamwork} / 10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Final Cumulative Rating Callout */}
        <div className="p-3 rounded-xl bg-[#faf8f2] border-2 border-[#f95c4b] flex items-center justify-between mb-4">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">FINAL CUMULATIVE RATING</span>
            <span className="text-base font-extrabold text-[#f95c4b]">{grade}</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase font-bold text-slate-500 block">CLASSIFICATION</span>
            <span className="text-xs font-bold text-slate-900">High-Performance Scholar</span>
          </div>
        </div>

        {/* Section 2: Qualitative Feedback */}
        <div className="mb-4">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 mb-1.5">
            2. Mentor & Technical Supervisor Feedback
          </h3>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 italic leading-relaxed">
            "{mentorRemarks}"
          </div>
        </div>

        <p className="text-[11px] text-slate-600 leading-relaxed mb-4">
          This Performance Evaluation Report has been compiled by the Skyrovix Technical Assessment Board following exhaustive automated code verification and manual mentor sign-off on all task submissions.
        </p>

        {/* 4-Column Bottom */}
        <div className="grid grid-cols-4 items-end pt-3 border-t border-slate-200">
          <div className="text-center">
            {sigFounderImg && <img src={sigFounderImg} alt="Sign" className="h-8 mx-auto object-contain" />}
            <div className="w-20 h-px mx-auto my-0.5 bg-slate-400" />
            <p className="font-bold text-[9px] text-slate-900">{COMPANY.founder.name}</p>
            <p className="text-[7.5px] text-indigo-700 font-bold">{COMPANY.founder.title}</p>
          </div>

          <div className="text-center">
            {sealImg && <img src={sealImg} alt="Seal" className="size-9 mx-auto object-contain" />}
            <p className="text-[7px] font-bold text-slate-500 mt-0.5">Official Assessment Seal</p>
          </div>

          <div className="text-center">
            <div className="p-0.5 inline-block rounded bg-white border border-slate-200">
              <QRCodeSVG value={verifyUrl} size={34} />
            </div>
            <p className="text-[7px] font-bold text-slate-500 mt-0.5">Scan to Verify</p>
          </div>

          <div className="text-center">
            {sigCofounderImg && <img src={sigCofounderImg} alt="Sign" className="h-8 mx-auto object-contain" />}
            <div className="w-20 h-px mx-auto my-0.5 bg-slate-400" />
            <p className="font-bold text-[9px] text-slate-900">{COMPANY.cofounder.name}</p>
            <p className="text-[7.5px] text-indigo-700 font-bold">{COMPANY.cofounder.title}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[7px] text-slate-400 pt-2 border-t border-slate-100 mt-2">
          <span>Confidential Academic & Performance Record • Skyrovix IT Solutions (MSME Certified)</span>
          <span>Online Verification: {verifyUrl}</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. CERTIFICATE OF APPRECIATION SHEET (A4 Landscape Regal Certificate)
// ─────────────────────────────────────────────────────────────────────────────
export function AppreciationCertificateSheet({
  fullName,
  internId,
  documentId = "SKX-APR-2026-53810",
  domainName,
  issuedAt,
  verifyUrl,
  metadata,
  id = "appreciation-cert-sheet",
}: CredentialSheetProps) {
  const displayDate = new Date(issuedAt || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const reason =
    metadata?.appreciationReason ||
    "demonstrating remarkable technical innovation, outstanding problem-solving capability, and exemplary commitment during the virtual internship program.";

  return (
    <div
      id={id}
      className="relative w-full rounded-2xl overflow-hidden shadow-xl border bg-[#faf8f2] text-slate-900 border-[#f95c4b]/50 select-none"
      style={{ aspectRatio: "1.414 / 1" }}
    >
      <div className="absolute inset-3 rounded-xl pointer-events-none border-2 border-[#f95c4b]" />
      <div className="absolute inset-5 rounded-lg pointer-events-none border border-[#b45309]/50" />

      <div className="relative h-full flex flex-col justify-between p-5 sm:p-7 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {logoImg && <img src={logoImg} alt="Skyrovix" className="h-8 sm:h-9 w-auto object-contain" />}
            {vinixImg && <img src={vinixImg} alt="Vinix" className="h-4.5 sm:h-5.5 w-auto object-contain" />}
          </div>
          <div className="text-center px-2">
            <h1 className="text-base sm:text-lg md:text-xl font-extrabold tracking-[0.25em] text-[#f95c4b] uppercase font-serif">
              SKYROVIX
            </h1>
            <p className="text-[7.5px] sm:text-[8.5px] font-bold tracking-wider text-slate-700">
              Skill Development & Future Tech Innovations • MSME Certified
            </p>
            <p className="text-[6.5px] sm:text-[7px] text-[#b45309] tracking-wide mt-0.5">
              Registered under MSME, Ministry of MSME, Govt. of India (UDYAM-TN-17-0076606)
            </p>
          </div>
          <div className="flex items-center gap-2">
            {yrTechImg && <img src={yrTechImg} alt="YR Tech" className="h-4.5 sm:h-5.5 w-auto object-contain" />}
            {msmeImg && <img src={msmeImg} alt="MSME" className="h-6 sm:h-7 w-auto object-contain" />}
          </div>
        </div>

        {/* Certificate Title */}
        <div className="text-center my-auto py-1">
          <h2 className="text-base sm:text-lg md:text-xl font-extrabold tracking-[0.2em] uppercase font-serif text-slate-900">
            CERTIFICATE OF APPRECIATION
          </h2>
          <p className="text-[7.5px] sm:text-[8.5px] font-bold tracking-[0.25em] text-[#b45309] uppercase mt-0.5">
            HONORING OUTSTANDING ENGINEERING MERIT
          </p>

          <p className="text-[8px] sm:text-[9px] font-serif italic text-slate-600 mt-1">This certificate is gratefully presented to</p>
          <h3 className="text-lg sm:text-xl md:text-2xl font-black tracking-wide uppercase font-display text-[#f95c4b] mt-0.5">
            {(fullName || "STUDENT INTERN").toUpperCase()}
          </h3>
          <div className="mx-auto w-28 sm:w-36 h-0.5 bg-[#b45309] my-1" />
          <p className="text-[7.5px] sm:text-[8.5px] md:text-[9px] max-w-lg mx-auto leading-relaxed text-slate-700">
            in recognition of outstanding and invaluable performance in the{" "}
            <span className="font-bold text-slate-900">{domainName}</span> internship track, specifically for {reason}
          </p>

          {/* Badges */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full mt-2.5 text-[7px] sm:text-[8px] font-mono border bg-white border-slate-300 text-slate-800 shadow-2xs">
            <span>CERT ID: <strong className="text-[#f95c4b] font-bold">{documentId}</strong></span>
            <span className="text-slate-300">|</span>
            <span>INTERN ID: <strong className="text-slate-900 font-bold">{internId}</strong></span>
            <span className="text-slate-300">|</span>
            <span>AWARD DATE: <strong className="text-slate-900 font-bold">{displayDate}</strong></span>
            <span className="text-slate-300">|</span>
            <span>HONOR: <strong className="text-emerald-600 font-bold">Exemplary High-Performer</strong></span>
          </div>
        </div>

        {/* 4-Column Bottom */}
        <div className="grid grid-cols-4 items-end pt-1">
          <div className="text-center">
            {sigFounderImg && <img src={sigFounderImg} alt="Sign" className="h-6 sm:h-7 mx-auto object-contain" />}
            <div className="w-16 sm:w-20 h-px mx-auto my-0.5 bg-slate-400" />
            <p className="font-bold text-[8px] sm:text-[9px] text-slate-900">{COMPANY.founder.name}</p>
            <p className="text-[6.5px] sm:text-[7px] text-[#b45309] font-bold">{COMPANY.founder.title}</p>
          </div>

          <div className="text-center">
            {sealImg && <img src={sealImg} alt="Seal" className="size-7 sm:size-8 mx-auto object-contain" />}
            <p className="text-[6.5px] font-bold text-slate-500 mt-0.5">Official Verified Seal</p>
          </div>

          <div className="text-center">
            <div className="p-0.5 inline-block rounded bg-white border border-slate-200">
              <QRCodeSVG value={verifyUrl} size={30} />
            </div>
            <p className="text-[6.5px] font-bold text-slate-500 mt-0.5">Scan to verify</p>
          </div>

          <div className="text-center">
            {sigCofounderImg && <img src={sigCofounderImg} alt="Sign" className="h-6 sm:h-7 mx-auto object-contain" />}
            <div className="w-16 sm:w-20 h-px mx-auto my-0.5 bg-slate-400" />
            <p className="font-bold text-[8px] sm:text-[9px] text-slate-900">{COMPANY.cofounder.name}</p>
            <p className="text-[6.5px] sm:text-[7px] text-[#b45309] font-bold">{COMPANY.cofounder.title}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[6px] sm:text-[7px] text-slate-500 pt-1 border-t border-slate-300 mt-1">
          Official verification portal: {verifyUrl} • Skyrovix IT Solutions
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. SKILL ACHIEVEMENT CERTIFICATE SHEET (A4 Landscape Regal Certificate)
// ─────────────────────────────────────────────────────────────────────────────
export function SkillCertificateSheet({
  fullName,
  internId,
  documentId = "SKX-SKL-2026-92147",
  domainName,
  issuedAt,
  verifyUrl,
  metadata,
  id = "skill-cert-sheet",
}: CredentialSheetProps) {
  const displayDate = new Date(issuedAt || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const skillName = metadata?.skillName || `${domainName} — Advanced System Architecture & Engineering`;
  const assessmentScore = metadata?.assessmentScore || "96 / 100 (Grade A+)";
  const skillsDemonstrated = metadata?.skillsDemonstrated || [
    "Full-Stack Web Architecture & Responsive UI Design",
    "RESTful API Engineering & Server-Side Controllers",
    "Database Modeling, Normalization & Query Optimization",
    "Production Deployment, Environment Security & Monitoring",
  ];

  return (
    <div
      id={id}
      className="relative w-full rounded-2xl overflow-hidden shadow-xl border bg-[#faf8f2] text-slate-900 border-[#b45309]/50 select-none"
      style={{ aspectRatio: "1.414 / 1" }}
    >
      <div className="absolute inset-3 rounded-xl pointer-events-none border-2 border-[#b45309]" />
      <div className="absolute inset-5 rounded-lg pointer-events-none border border-[#f95c4b]/40" />

      <div className="relative h-full flex flex-col justify-between p-5 sm:p-7 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {logoImg && <img src={logoImg} alt="Skyrovix" className="h-8 sm:h-9 w-auto object-contain" />}
            {vinixImg && <img src={vinixImg} alt="Vinix" className="h-4.5 sm:h-5.5 w-auto object-contain" />}
          </div>
          <div className="text-center px-2">
            <h1 className="text-base sm:text-lg md:text-xl font-extrabold tracking-[0.25em] text-[#b45309] uppercase font-serif">
              SKYROVIX
            </h1>
            <p className="text-[7.5px] sm:text-[8.5px] font-bold tracking-wider text-slate-700">
              Skill Development & Future Tech Innovations • MSME Certified
            </p>
            <p className="text-[6.5px] sm:text-[7px] text-[#b45309] tracking-wide mt-0.5">
              UDYAM-TN-17-0076606 • Ministry of MSME, Govt. of India
            </p>
          </div>
          <div className="flex items-center gap-2">
            {yrTechImg && <img src={yrTechImg} alt="YR Tech" className="h-4.5 sm:h-5.5 w-auto object-contain" />}
            {msmeImg && <img src={msmeImg} alt="MSME" className="h-6 sm:h-7 w-auto object-contain" />}
          </div>
        </div>

        {/* Certificate Title */}
        <div className="text-center my-auto py-1">
          <h2 className="text-base sm:text-lg md:text-xl font-extrabold tracking-[0.2em] uppercase font-serif text-slate-900">
            SKILL ACHIEVEMENT CERTIFICATE
          </h2>
          <p className="text-[7.5px] sm:text-[8.5px] font-bold tracking-[0.25em] text-[#f95c4b] uppercase mt-0.5">
            PRACTICAL COMPETENCY ASSESSMENT & MASTERY
          </p>

          <p className="text-[8px] sm:text-[9px] font-serif italic text-slate-600 mt-1">This validates that</p>
          <h3 className="text-lg sm:text-xl md:text-2xl font-black tracking-wide uppercase font-display text-slate-900 mt-0.5">
            {(fullName || "STUDENT INTERN").toUpperCase()}
          </h3>
          <div className="mx-auto w-28 sm:w-36 h-0.5 bg-[#f95c4b] my-1" />
          <p className="text-[7.5px] sm:text-[8.5px] text-slate-700">
            has demonstrated exceptional practical competence and technical proficiency in:
          </p>
          <p className="text-[9.5px] sm:text-[11px] font-bold text-[#b45309] mt-0.5">
            {skillName}
          </p>

          {/* Skill Matrix Box */}
          <div className="mt-2 mx-auto max-w-xl p-2.5 rounded-xl bg-white border border-slate-300 text-left shadow-2xs">
            <span className="text-[7px] uppercase font-bold text-slate-400 block mb-1">
              Verified Core Technical Competencies
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[7.5px] sm:text-[8.5px] text-slate-700">
              {skillsDemonstrated.map((sk, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="text-[#f95c4b] font-bold">✓</span>
                  <span className="line-clamp-1">{sk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full mt-2 text-[7px] sm:text-[8px] font-mono border bg-white border-slate-300 text-slate-800 shadow-2xs">
            <span>DOC ID: <strong className="text-[#f95c4b] font-bold">{documentId}</strong></span>
            <span className="text-slate-300">|</span>
            <span>ASSESSMENT RESULT: <strong className="text-emerald-600 font-bold">{assessmentScore}</strong></span>
            <span className="text-slate-300">|</span>
            <span>DATE: <strong className="text-slate-900 font-bold">{displayDate}</strong></span>
          </div>
        </div>

        {/* 4-Column Bottom */}
        <div className="grid grid-cols-4 items-end pt-1">
          <div className="text-center">
            {sigFounderImg && <img src={sigFounderImg} alt="Sign" className="h-6 sm:h-7 mx-auto object-contain" />}
            <div className="w-16 sm:w-20 h-px mx-auto my-0.5 bg-slate-400" />
            <p className="font-bold text-[8px] sm:text-[9px] text-slate-900">{COMPANY.founder.name}</p>
            <p className="text-[6.5px] sm:text-[7px] text-[#b45309] font-bold">{COMPANY.founder.title}</p>
          </div>

          <div className="text-center">
            {sealImg && <img src={sealImg} alt="Seal" className="size-7 sm:size-8 mx-auto object-contain" />}
            <p className="text-[6.5px] font-bold text-slate-500 mt-0.5">Official Verified Seal</p>
          </div>

          <div className="text-center">
            <div className="p-0.5 inline-block rounded bg-white border border-slate-200">
              <QRCodeSVG value={verifyUrl} size={30} />
            </div>
            <p className="text-[6.5px] font-bold text-slate-500 mt-0.5">Scan to verify</p>
          </div>

          <div className="text-center">
            {sigCofounderImg && <img src={sigCofounderImg} alt="Sign" className="h-6 sm:h-7 mx-auto object-contain" />}
            <div className="w-16 sm:w-20 h-px mx-auto my-0.5 bg-slate-400" />
            <p className="font-bold text-[8px] sm:text-[9px] text-slate-900">{COMPANY.cofounder.name}</p>
            <p className="text-[6.5px] sm:text-[7px] text-[#b45309] font-bold">{COMPANY.cofounder.title}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[6px] sm:text-[7px] text-slate-500 pt-1 border-t border-slate-300 mt-1">
          Official verification portal: {verifyUrl} • Skyrovix IT Solutions
        </div>
      </div>
    </div>
  );
}
