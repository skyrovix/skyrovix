import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { EMAIL_ASSETS } from "@/lib/email-assets";
import { downloadCertificate, downloadIDCard, downloadOfferLetter } from "@/components/pdf-docs";
import {
  downloadAdvancedDocPdf,
  type AdvancedDocType,
  type AdvancedDocData,
} from "@/components/advanced-pdf-docs";
import { IDCard } from "@/components/IDCard";
import { DOMAINS, COMPANY, getPublicSiteUrl } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Award,
  Download,
  Sparkles,
  RefreshCw,
  Copy,
  Sliders,
  Check,
  IdCard as IdCardIcon,
  RotateCw,
  FileText,
  Star,
  Layers,
  Crown,
  ScrollText,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

type DemoTab =
  | "all"
  | "cert"
  | "idcard"
  | "offer"
  | "lor"
  | "exp"
  | "project"
  | "report"
  | "appreciation"
  | "skill";

export function CredentialDemoSection() {
  // Demo State
  const [activeTab, setActiveTab] = useState<DemoTab>("all");
  const [studentName, setStudentName] = useState("Hariharan S");
  const [internId, setInternId] = useState("SKX-2026-9055");
  const [certId, setCertId] = useState("SKX-CERT-2026-15713");
  const [selectedDomain, setSelectedDomain] = useState("fullstack");
  const [planType, setPlanType] = useState<"standard" | "premium">("premium");
  const [durationMonths, setDurationMonths] = useState<number>(3);
  const [grade, setGrade] = useState("A+ (Outstanding)");
  const [issuedDate, setIssuedDate] = useState(new Date().toISOString().slice(0, 10));
  const [validUntil, setValidUntil] = useState(`31 Dec ${new Date().getFullYear()}`);
  const [bloodGroup, setBloodGroup] = useState("B+");
  const [emergencyPhone, setEmergencyPhone] = useState("+91 98765 43210");
  const [idCardFlipped, setIdCardFlipped] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Custom metadata for advanced documents
  const [projectTitle, setProjectTitle] = useState("Enterprise Cloud Platform with Scalable Microservices");
  const [techStack, setTechStack] = useState("React, Node.js, Express, MongoDB, Tailwind CSS, REST APIs");
  const [mentorRemarks, setMentorRemarks] = useState(
    "Exemplary technical proficiency, clean architectural adherence, proactive sprint delivery, and exceptional problem-solving acumen throughout the tenure."
  );
  const [appreciationReason, setAppreciationReason] = useState(
    "demonstrating remarkable technical innovation, high-velocity milestone delivery, and outstanding capstone architecture execution."
  );

  // Download state
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);

  // Derive domain name
  const domainObj = DOMAINS.find((d) => d.slug === selectedDomain);
  const domainTitle = domainObj ? domainObj.name : "Full Stack Development";

  // Verification URLs
  const verifyCertUrl = `${getPublicSiteUrl()}/verify?id=${encodeURIComponent(certId.trim())}`;
  const verifyInternUrl = `${getPublicSiteUrl()}/verify?id=${encodeURIComponent(internId.trim())}`;

  // Formatted display date
  const displayDate = new Date(issuedDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const generateRandomCredentials = () => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const internNum = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    setCertId(`SKX-CERT-${year}-${randomNum}`);
    setInternId(`SKX-${year}-${internNum}`);
    toast.success("Generated fresh demo IDs");
  };

  const handleCopyVerifyUrl = () => {
    navigator.clipboard.writeText(verifyCertUrl);
    setCopiedLink(true);
    toast.success("Verification link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Helper for Advanced Doc Data
  const getDemoDocData = (type: AdvancedDocType, customDocIdPrefix: string): AdvancedDocData => {
    const year = new Date().getFullYear();
    const docId = `SKX-${customDocIdPrefix}-${year}-${Math.floor(10000 + Math.random() * 90000)}`;
    const verifyUrl = `${getPublicSiteUrl()}/verify?id=${encodeURIComponent(docId)}`;

    return {
      documentId: docId,
      documentType: type,
      fullName: studentName || "Student Intern",
      internId: internId || "SKX-INT",
      domain: selectedDomain,
      domainName: domainTitle,
      planType,
      durationMonths,
      issuedAt: issuedDate,
      verifyUrl,
      metadata: {
        projectTitle,
        technologies: techStack.split(",").map((s) => s.trim()),
        mentorRemarks,
        finalRating: grade,
        codeQuality: 9.7,
        technicalSkills: 9.8,
        problemSolving: 9.6,
        teamwork: 9.5,
        projectPerformance: 9.8,
        appreciationReason,
        skillName: `${domainTitle} — Full Stack System Architecture & Engineering`,
        assessmentScore: "96 / 100 (Grade A+)",
      },
    };
  };

  // Download Handlers
  const handleDownloadCertPdf = async () => {
    setDownloadingDoc("cert");
    const toastId = toast.loading("Rendering Certificate of Excellence PDF...");
    try {
      await downloadCertificate({
        fullName: studentName || "Student Intern",
        internId: internId || "SKX-INT",
        domain: domainTitle,
        certId: certId || "SKX-CERT",
        issuedAt: issuedDate,
        verifyUrl: verifyCertUrl,
        grade,
      });
      toast.success("Certificate of Excellence downloaded!", { id: toastId });
    } catch (err: any) {
      toast.error(`Download failed: ${err.message}`, { id: toastId });
    } finally {
      setDownloadingDoc(null);
    }
  };

  const handleDownloadIdPdf = async () => {
    setDownloadingDoc("idcard");
    const toastId = toast.loading("Rendering Smart Executive ID Card PDF...");
    try {
      await downloadIDCard({
        fullName: studentName || "Student Intern",
        internId: internId || "SKX-INT",
        domain: domainTitle,
        issuedAt: issuedDate,
        validUpto: validUntil,
        email: `${studentName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      });
      toast.success("Executive ID Card downloaded!", { id: toastId });
    } catch (err: any) {
      toast.error(`Download failed: ${err.message}`, { id: toastId });
    } finally {
      setDownloadingDoc(null);
    }
  };

  const handleDownloadOfferLetterPdf = async () => {
    setDownloadingDoc("offer");
    const toastId = toast.loading("Rendering Official Offer Letter PDF...");
    try {
      await downloadOfferLetter({
        fullName: studentName || "Student Intern",
        internId: internId || "SKX-INT",
        domain: domainTitle,
        issuedAt: issuedDate,
        duration: durationMonths,
      });
      toast.success("Offer Letter downloaded!", { id: toastId });
    } catch (err: any) {
      toast.error(`Download failed: ${err.message}`, { id: toastId });
    } finally {
      setDownloadingDoc(null);
    }
  };

  const handleDownloadAdvancedPdf = async (type: AdvancedDocType, prefix: string, label: string) => {
    setDownloadingDoc(type);
    const toastId = toast.loading(`Rendering ${label} PDF...`);
    try {
      const data = getDemoDocData(type, prefix);
      await downloadAdvancedDocPdf(data);
      toast.success(`${label} downloaded!`, { id: toastId });
    } catch (err: any) {
      toast.error(`Download failed: ${err.message}`, { id: toastId });
    } finally {
      setDownloadingDoc(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ─── Header & Top Actions ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="size-4" />
            </span>
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase font-mono">
              Skyrovix Executive Credential Studio
            </span>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-mono">
              ALL 9 CREDENTIALS LIVE
            </Badge>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Full Credential & Document Studio</h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
            Real-time visual validator, live designer, and 1-click PDF download for Offer Letters, Smart ID Cards, Completion Certificates, LOR, Experience Letters, Project Certs, Performance Reports, Appreciation Certs, and Skill Certs.
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generateRandomCredentials}
            className="rounded-xl border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs gap-1.5 h-9"
          >
            <RefreshCw className="size-3.5" />
            Randomize IDs
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyVerifyUrl}
            className="rounded-xl border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs gap-1.5 h-9"
          >
            {copiedLink ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
            Copy Verify Link
          </Button>
        </div>
      </div>

      {/* ─── Document Category & Type Switcher Bar ─── */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-border/60 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
            activeTab === "all"
              ? "bg-white dark:bg-slate-800 text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Overview (All 9)
        </button>
        <button
          onClick={() => setActiveTab("cert")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition ${
            activeTab === "cert"
              ? "bg-white dark:bg-slate-800 text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Award className="size-3.5 text-amber-500" />
          Completion Cert
        </button>
        <button
          onClick={() => setActiveTab("idcard")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition ${
            activeTab === "idcard"
              ? "bg-white dark:bg-slate-800 text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <IdCardIcon className="size-3.5 text-blue-500" />
          Executive ID Card
        </button>
        <button
          onClick={() => setActiveTab("offer")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition ${
            activeTab === "offer"
              ? "bg-white dark:bg-slate-800 text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ScrollText className="size-3.5 text-purple-500" />
          Offer Letter
        </button>
        <button
          onClick={() => setActiveTab("lor")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition ${
            activeTab === "lor"
              ? "bg-white dark:bg-slate-800 text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Crown className="size-3.5 text-amber-500" />
          LOR (Premium)
        </button>
        <button
          onClick={() => setActiveTab("exp")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition ${
            activeTab === "exp"
              ? "bg-white dark:bg-slate-800 text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="size-3.5 text-emerald-500" />
          Experience Letter
        </button>
        <button
          onClick={() => setActiveTab("project")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition ${
            activeTab === "project"
              ? "bg-white dark:bg-slate-800 text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="size-3.5 text-orange-500" />
          Project Cert
        </button>
        <button
          onClick={() => setActiveTab("report")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition ${
            activeTab === "report"
              ? "bg-white dark:bg-slate-800 text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sliders className="size-3.5 text-indigo-500" />
          Performance Report
        </button>
        <button
          onClick={() => setActiveTab("appreciation")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition ${
            activeTab === "appreciation"
              ? "bg-white dark:bg-slate-800 text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Star className="size-3.5 text-rose-500" />
          Appreciation Cert
        </button>
        <button
          onClick={() => setActiveTab("skill")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition ${
            activeTab === "skill"
              ? "bg-white dark:bg-slate-800 text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CheckCircle2 className="size-3.5 text-teal-500" />
          Skill Cert
        </button>
      </div>

      {/* ─── Main Content Grid: Controls & Visual Canvas ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ─── LEFT: Interactive Controls (4 cols) ─── */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="rounded-3xl border-border/60 bg-white shadow-sm">
            <div className="p-4 border-b border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="size-4 text-primary" />
                <h3 className="font-bold text-sm">Universal Demo Controls</h3>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground font-bold">REAL-TIME</span>
            </div>

            <CardContent className="p-4 space-y-3.5 text-xs">
              {/* Student Name */}
              <div>
                <Label className="text-[11px] font-semibold text-muted-foreground">Student Full Name</Label>
                <Input
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Hariharan S"
                  className="mt-1 h-9 rounded-xl text-xs"
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {["Hariharan S", "Mainak Mondal", "Aarav Sharma", "Priya Patel"].map((name) => (
                    <button
                      key={name}
                      onClick={() => setStudentName(name)}
                      className="px-2 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground hover:text-foreground transition"
                    >
                      {name.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Domain Selection */}
              <div>
                <Label className="text-[11px] font-semibold text-muted-foreground">Internship Domain</Label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="mt-1 w-full h-9 rounded-xl border border-input bg-background px-3 text-xs"
                >
                  <optgroup label="Advanced Document Domains (Eligible)">
                    <option value="fullstack">Full Stack Development</option>
                    <option value="mernstack">MERN Stack Development</option>
                    <option value="meanstack">MEAN Stack Development</option>
                  </optgroup>
                  <optgroup label="Other Internship Domains">
                    {DOMAINS.filter(
                      (d) => !["fullstack", "mernstack", "meanstack"].includes(d.slug)
                    ).map((d) => (
                      <option key={d.slug} value={d.slug}>
                        {d.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Plan Track & Duration */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <Label className="text-[11px] font-semibold text-muted-foreground">Plan Track</Label>
                  <select
                    value={planType}
                    onChange={(e) => setPlanType(e.target.value as any)}
                    className="mt-1 w-full h-9 rounded-xl border border-input bg-background px-2.5 text-xs font-semibold"
                  >
                    <option value="premium">Premium Track (₹200)</option>
                    <option value="standard">Standard Track (₹100)</option>
                  </select>
                </div>
                <div>
                  <Label className="text-[11px] font-semibold text-muted-foreground">Tenure Duration</Label>
                  <select
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Number(e.target.value))}
                    className="mt-1 w-full h-9 rounded-xl border border-input bg-background px-2.5 text-xs"
                  >
                    <option value={1}>1 Month (Foundational)</option>
                    <option value={2}>2 Months (Intermediate)</option>
                    <option value={3}>3 Months (Advanced & Capstone)</option>
                    <option value={6}>6 Months (Comprehensive)</option>
                  </select>
                </div>
              </div>

              {/* IDs and Date */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <Label className="text-[11px] font-semibold text-muted-foreground">Intern ID</Label>
                  <Input
                    value={internId}
                    onChange={(e) => setInternId(e.target.value)}
                    className="mt-1 h-8 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold text-muted-foreground">Cert ID</Label>
                  <Input
                    value={certId}
                    onChange={(e) => setCertId(e.target.value)}
                    className="mt-1 h-8 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Grade / Final Rating */}
              <div>
                <Label className="text-[11px] font-semibold text-muted-foreground">Evaluation Grade</Label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="mt-1 w-full h-9 rounded-xl border border-input bg-background px-3 text-xs"
                >
                  <option value="A+ (Outstanding)">A+ (Outstanding — Top 5%)</option>
                  <option value="A (Excellent)">A (Excellent — High Merit)</option>
                  <option value="B+ (Very Good)">B+ (Very Good)</option>
                  <option value="B (Good)">B (Good)</option>
                </select>
              </div>

              {/* Capstone Project Title */}
              <div>
                <Label className="text-[11px] font-semibold text-muted-foreground">Capstone Project Title</Label>
                <Input
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="mt-1 h-9 rounded-xl text-xs"
                />
              </div>

              {/* Tech Stack */}
              <div>
                <Label className="text-[11px] font-semibold text-muted-foreground">Technologies Utilized</Label>
                <Input
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  className="mt-1 h-9 rounded-xl text-xs"
                />
              </div>

              {/* Quick Info Box */}
              <div className="pt-3 border-t border-border/40 text-[11px] space-y-1 text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Govt. Registration:</span>
                  <span className="font-mono font-semibold text-foreground">UDYAM-TN-17-0076606</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Signatories:</span>
                  <span className="font-semibold text-foreground">Hariharan S & Maheshwaran S</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── RIGHT: Visual Previews & Live Renders (8 cols) ─── */}
        <div className="lg:col-span-8 space-y-8">

          {/* 1. CERTIFICATE OF EXCELLENCE (Imperial Ivory & Gold) */}
          {(activeTab === "all" || activeTab === "cert") && (
            <div className="space-y-2.5 p-5 rounded-3xl bg-white border border-border/70 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="size-4.5 text-amber-500" />
                  <h3 className="font-bold text-sm text-[#181619]">1. Certificate of Excellence</h3>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    A4 LANDSCAPE
                  </Badge>
                </div>
                <Button
                  size="sm"
                  onClick={handleDownloadCertPdf}
                  disabled={downloadingDoc === "cert"}
                  className="rounded-xl text-xs h-8 gap-1.5 brand-gradient text-white font-bold shadow-xs"
                >
                  <Download className="size-3.5" />
                  {downloadingDoc === "cert" ? "Generating..." : "Download Certificate PDF"}
                </Button>
              </div>

              {/* Visual Render Canvas */}
              <div
                className="relative w-full rounded-2xl overflow-hidden shadow-lg border bg-[#faf8f2] text-slate-900 border-amber-600/40"
                style={{ aspectRatio: "1.414 / 1" }}
              >
                <div className="absolute inset-3 rounded-xl pointer-events-none border-2 border-[#b45309]" />
                <div className="absolute inset-5 rounded-lg pointer-events-none border border-[#d97706]/40" />

                <div className="relative h-full flex flex-col justify-between p-6 sm:p-8 select-none">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {EMAIL_ASSETS?.logo && (
                        <img src={EMAIL_ASSETS.logo} alt="Skyrovix" className="h-9 w-auto object-contain" />
                      )}
                      {EMAIL_ASSETS?.vinix && (
                        <img src={EMAIL_ASSETS.vinix} alt="Vinix" className="h-5 w-auto object-contain hidden sm:inline" />
                      )}
                    </div>
                    <div className="text-center">
                      <h1 className="text-lg sm:text-xl font-extrabold tracking-[0.25em] text-amber-600 uppercase">
                        SKYROVIX
                      </h1>
                      <p className="text-[8px] font-semibold tracking-wider text-slate-700">
                        Skill Development & Future Tech Innovations • MSME Certified
                      </p>
                      <p className="text-[7px] text-amber-700/80">
                        UDYAM-TN-17-0076606 • Ministry of MSME, Govt. of India
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {EMAIL_ASSETS?.yrTech && (
                        <img src={EMAIL_ASSETS.yrTech} alt="YR Tech" className="h-5 w-auto object-contain hidden sm:inline" />
                      )}
                      {EMAIL_ASSETS?.msme && (
                        <img src={EMAIL_ASSETS.msme} alt="MSME" className="h-7 w-auto object-contain" />
                      )}
                    </div>
                  </div>

                  {/* Body Title */}
                  <div className="text-center my-auto py-1">
                    <h2 className="text-lg sm:text-xl font-extrabold tracking-[0.2em] uppercase font-serif text-slate-900">
                      CERTIFICATE OF EXCELLENCE
                    </h2>
                    <p className="text-[8.5px] font-bold tracking-[0.25em] text-amber-600 uppercase mt-0.5">
                      VIRTUAL INTERNSHIP & SKILL DEVELOPMENT
                    </p>
                    <p className="text-[9.5px] font-serif italic mt-2 text-slate-600">
                      This certificate is proudly awarded to
                    </p>
                    <h3 className="text-xl sm:text-2xl font-black tracking-wide uppercase font-display text-slate-900 mt-1">
                      {studentName || "STUDENT INTERN"}
                    </h3>
                    <div className="mx-auto w-32 h-0.5 bg-amber-500 my-1.5" />
                    <p className="text-[8.5px] sm:text-[9.5px] max-w-lg mx-auto leading-relaxed text-slate-700">
                      In recognition of outstanding performance and successful completion of the industry-oriented virtual internship program in{" "}
                      <span className="font-bold text-amber-600 underline">{domainTitle}</span>, demonstrating technical proficiency and capstone execution.
                    </p>
                    {/* Badge Bar */}
                    <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full mt-2 text-[8px] font-mono border bg-white/95 border-slate-300 text-slate-800 shadow-xs">
                      <span>CERT ID: <strong className="text-amber-600">{certId}</strong></span>
                      <span>|</span>
                      <span>INTERN ID: <strong className="text-amber-600">{internId}</strong></span>
                      <span>|</span>
                      <span>GRADE: <strong className="text-emerald-600">{grade}</strong></span>
                      <span>|</span>
                      <span>ISSUED: <strong>{displayDate}</strong></span>
                    </div>
                  </div>

                  {/* Signatures & Seal */}
                  <div className="grid grid-cols-4 items-end pt-2">
                    <div className="text-center">
                      {EMAIL_ASSETS?.sigFounder && (
                        <img src={EMAIL_ASSETS.sigFounder} alt="Sign" className="h-8 mx-auto object-contain" />
                      )}
                      <div className="w-20 h-px mx-auto my-0.5 bg-slate-400" />
                      <p className="font-bold text-[9px] text-slate-900">{COMPANY.founder.name}</p>
                      <p className="text-[7px] text-amber-600 font-semibold">{COMPANY.founder.title}</p>
                    </div>

                    <div className="text-center">
                      {EMAIL_ASSETS?.seal && (
                        <img src={EMAIL_ASSETS.seal} alt="Seal" className="size-10 mx-auto object-contain" />
                      )}
                      <p className="text-[7px] font-semibold text-slate-500 mt-0.5">Official Verified Seal</p>
                    </div>

                    <div className="text-center">
                      <div className="p-0.5 inline-block rounded bg-white border border-amber-200">
                        <QRCodeSVG value={verifyCertUrl} size={34} />
                      </div>
                      <p className="text-[7px] text-slate-400 font-mono mt-0.5">Scan to verify</p>
                    </div>

                    <div className="text-center">
                      {EMAIL_ASSETS?.sigCofounder && (
                        <img src={EMAIL_ASSETS.sigCofounder} alt="Sign" className="h-8 mx-auto object-contain" />
                      )}
                      <div className="w-20 h-px mx-auto my-0.5 bg-slate-400" />
                      <p className="font-bold text-[9px] text-slate-900">{COMPANY.cofounder.name}</p>
                      <p className="text-[7px] text-amber-600 font-semibold">{COMPANY.cofounder.title}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. EXECUTIVE ID CARD (Front & Back) */}
          {(activeTab === "all" || activeTab === "idcard") && (
            <div className="space-y-2.5 p-5 rounded-3xl bg-white border border-border/70 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IdCardIcon className="size-4.5 text-blue-500" />
                  <h3 className="font-bold text-sm text-[#181619]">2. Smart Executive ID Card</h3>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    CR80 SMART NFC/QR
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIdCardFlipped(!idCardFlipped)}
                    className="rounded-xl text-xs h-8 gap-1 border-border/70"
                  >
                    <RotateCw className="size-3" />
                    {idCardFlipped ? "Flip to Front" : "Flip to Back"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDownloadIdPdf}
                    disabled={downloadingDoc === "idcard"}
                    className="rounded-xl text-xs h-8 gap-1.5 brand-gradient text-white font-bold shadow-xs"
                  >
                    <Download className="size-3.5" />
                    {downloadingDoc === "idcard" ? "Generating..." : "Download ID PDF"}
                  </Button>
                </div>
              </div>

              {/* ID Card Display Area */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-border/50 flex flex-col items-center justify-center">
                {!idCardFlipped ? (
                  <div className="transform hover:scale-[1.02] transition-transform">
                    <IDCard
                      internId={internId}
                      fullName={studentName}
                      domain={domainTitle}
                      issuedAt={issuedDate}
                      validUpto={validUntil}
                      email={`${studentName.toLowerCase().replace(/\s+/g, ".")}@example.com`}
                    />
                  </div>
                ) : (
                  <div className="w-full max-w-[340px] rounded-[22px] bg-white text-slate-900 p-5 shadow-xl border border-slate-200">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#f95c4b]">
                        TERMS & CONDITIONS
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">SMART CREDENTIAL</span>
                    </div>
                    <div className="space-y-1.5 py-2.5 text-[9px] text-slate-600 leading-relaxed">
                      <p>1. Official identification credential issued by Skyrovix IT Solutions.</p>
                      <p>2. Property of Skyrovix. If found, contact: support@skyrovix.in.</p>
                      <p>3. Digitally signed and verifiable on skyrovix.in/verify.</p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border text-[9px] space-y-1 mb-2.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Blood Group:</span>
                        <span className="font-bold text-slate-900">{bloodGroup}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Emergency Phone:</span>
                        <span className="font-mono font-semibold">{emergencyPhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Valid Upto:</span>
                        <span className="font-semibold text-emerald-600">{validUntil}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <div className="p-1 rounded bg-slate-100">
                        <QRCodeSVG value={verifyInternUrl} size={42} />
                      </div>
                      <div className="text-right">
                        {EMAIL_ASSETS?.sigFounder && (
                          <img src={EMAIL_ASSETS.sigFounder} alt="Sign" className="h-7 ml-auto object-contain" />
                        )}
                        <span className="text-[8px] font-bold block text-slate-900">{COMPANY.founder.name}</span>
                        <span className="text-[7px] text-[#f95c4b] block">Authorized Signatory</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. OFFER & APPOINTMENT LETTER */}
          {(activeTab === "all" || activeTab === "offer") && (
            <div className="space-y-2.5 p-5 rounded-3xl bg-white border border-border/70 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ScrollText className="size-4.5 text-purple-600" />
                  <h3 className="font-bold text-sm text-[#181619]">3. Official Offer & Appointment Letter</h3>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    A4 PORTRAIT
                  </Badge>
                </div>
                <Button
                  size="sm"
                  onClick={handleDownloadOfferLetterPdf}
                  disabled={downloadingDoc === "offer"}
                  className="rounded-xl text-xs h-8 gap-1.5 brand-gradient text-white font-bold shadow-xs"
                >
                  <Download className="size-3.5" />
                  {downloadingDoc === "offer" ? "Generating..." : "Download Offer PDF"}
                </Button>
              </div>

              {/* Offer Letter Preview Card */}
              <div className="p-6 rounded-2xl bg-[#faf8f2] border border-border/70 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b pb-3 border-[#f95c4b]/30">
                  <div className="flex items-center gap-2">
                    {EMAIL_ASSETS?.logo && <img src={EMAIL_ASSETS.logo} alt="Logo" className="h-8 w-auto" />}
                    <div>
                      <p className="font-bold text-sm text-[#181619]">SKYROVIX</p>
                      <p className="text-[10px] text-muted-foreground">Skill Development & Future Tech Innovations</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs font-bold text-primary">{internId}</p>
                    <p className="text-[10px] text-muted-foreground">{displayDate}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-xs uppercase text-primary">INTERNSHIP OFFER LETTER</p>
                  <p className="font-semibold text-slate-800">Dear {studentName},</p>
                  <p className="text-muted-foreground leading-relaxed">
                    We are pleased to formally offer you an internship appointment as a{" "}
                    <strong className="text-foreground">{domainTitle} Intern</strong> at Skyrovix IT Solutions for a duration of{" "}
                    <strong>{durationMonths} Month{durationMonths > 1 ? "s" : ""}</strong>.
                  </p>
                  <div className="p-3 rounded-xl bg-white border border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div><span className="text-muted-foreground block">Intern ID</span><span className="font-bold font-mono">{internId}</span></div>
                    <div><span className="text-muted-foreground block">Domain</span><span className="font-bold">{domainTitle}</span></div>
                    <div><span className="text-muted-foreground block">Track</span><span className="font-bold capitalize">{planType}</span></div>
                    <div><span className="text-muted-foreground block">Mode</span><span className="font-bold text-emerald-600">Virtual / Remote</span></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div>
                    {EMAIL_ASSETS?.sigFounder && <img src={EMAIL_ASSETS.sigFounder} alt="Sign" className="h-7 object-contain" />}
                    <p className="font-bold text-[10px]">Hariharan S</p>
                    <p className="text-[9px] text-muted-foreground">Founder & CEO, Skyrovix</p>
                  </div>
                  {EMAIL_ASSETS?.seal && <img src={EMAIL_ASSETS.seal} alt="Seal" className="size-9 object-contain" />}
                  <div>
                    {EMAIL_ASSETS?.sigCofounder && <img src={EMAIL_ASSETS.sigCofounder} alt="Sign" className="h-7 object-contain" />}
                    <p className="font-bold text-[10px]">Maheshwaran S</p>
                    <p className="text-[9px] text-muted-foreground">Co-Founder, Skyrovix</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. LETTER OF RECOMMENDATION (LOR) */}
          {(activeTab === "all" || activeTab === "lor") && (
            <div className="space-y-2.5 p-5 rounded-3xl bg-white border border-border/70 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="size-4.5 text-amber-500" />
                  <h3 className="font-bold text-sm text-[#181619]">4. Letter of Recommendation (LOR)</h3>
                  <Badge className="bg-amber-500/20 text-amber-800 text-[10px] font-bold">
                    PREMIUM EXCLUSIVE
                  </Badge>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleDownloadAdvancedPdf("lor", "LOR", "Letter of Recommendation")}
                  disabled={downloadingDoc === "lor"}
                  className="rounded-xl text-xs h-8 gap-1.5 brand-gradient text-white font-bold shadow-xs"
                >
                  <Download className="size-3.5" />
                  {downloadingDoc === "lor" ? "Generating..." : "Download LOR PDF"}
                </Button>
              </div>

              <div className="p-6 rounded-2xl bg-[#faf8f2] border border-amber-300/60 space-y-3 text-xs">
                <div className="flex justify-between border-b pb-2 border-amber-400/40">
                  <span className="font-bold text-xs uppercase tracking-wider text-[#181619]">TO WHOM IT MAY CONCERN</span>
                  <span className="font-mono text-primary font-bold">{internId}</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  It is with immense pleasure that I formally write this Letter of Recommendation for{" "}
                  <strong className="text-foreground">{studentName}</strong>, who has successfully completed a rigorous, hands-on virtual internship in{" "}
                  <strong className="text-foreground">{domainTitle}</strong>.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Throughout their tenure, {studentName} exhibited exemplary technical competence, analytical acumen, and an exceptional dedication to engineering standards in full stack microservices, clean API architectures, and responsive frontend systems.
                </p>
                <div className="p-2.5 rounded-xl bg-white border border-border/60 text-[11px] font-medium text-slate-800">
                  "{mentorRemarks}"
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="text-left">
                    <p className="font-bold text-[10px]">Hariharan S</p>
                    <p className="text-[9px] text-muted-foreground">Founder & CEO</p>
                  </div>
                  {EMAIL_ASSETS?.seal && <img src={EMAIL_ASSETS.seal} alt="Seal" className="size-8 object-contain" />}
                  <div className="text-right">
                    <p className="font-bold text-[10px]">Maheshwaran S</p>
                    <p className="text-[9px] text-muted-foreground">Co-Founder</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. EXPERIENCE & RELIEVING LETTER */}
          {(activeTab === "all" || activeTab === "exp") && (
            <div className="space-y-2.5 p-5 rounded-3xl bg-white border border-border/70 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="size-4.5 text-emerald-600" />
                  <h3 className="font-bold text-sm text-[#181619]">5. Experience & Relieving Letter</h3>
                  <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-300 font-bold">
                    HIGH PERFORMER
                  </Badge>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleDownloadAdvancedPdf("experience_letter", "EXP", "Experience Letter")}
                  disabled={downloadingDoc === "experience_letter"}
                  className="rounded-xl text-xs h-8 gap-1.5 brand-gradient text-white font-bold shadow-xs"
                >
                  <Download className="size-3.5" />
                  {downloadingDoc === "experience_letter" ? "Generating..." : "Download Experience PDF"}
                </Button>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-border/70 space-y-3 text-xs">
                <p className="font-bold text-xs uppercase tracking-wider text-slate-900">INTERNSHIP EXPERIENCE & RELIEVING CERTIFICATE</p>
                <p className="text-slate-700 leading-relaxed">
                  This is to certify that <strong className="text-foreground">{studentName}</strong> has successfully completed their software engineering internship tenure in{" "}
                  <strong>{domainTitle}</strong> for <strong>{durationMonths} Months</strong>. The candidate contributed to sprint deliverables, RESTful endpoints, and database schema designs adhering to industry software engineering best practices.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[10px]">
                  <span>Tenure: Verified & Approved</span>
                  <span className="font-mono text-primary font-bold">{internId}</span>
                </div>
              </div>
            </div>
          )}

          {/* 6. PROJECT COMPLETION CERTIFICATE */}
          {(activeTab === "all" || activeTab === "project") && (
            <div className="space-y-2.5 p-5 rounded-3xl bg-white border border-border/70 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="size-4.5 text-orange-500" />
                  <h3 className="font-bold text-sm text-[#181619]">6. Project Completion Certificate</h3>
                  <Badge variant="outline" className="text-[10px] text-orange-700 border-orange-300 font-bold">
                    CAPSTONE VERIFIED
                  </Badge>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleDownloadAdvancedPdf("project_certificate", "PRJ", "Project Certificate")}
                  disabled={downloadingDoc === "project_certificate"}
                  className="rounded-xl text-xs h-8 gap-1.5 brand-gradient text-white font-bold shadow-xs"
                >
                  <Download className="size-3.5" />
                  {downloadingDoc === "project_certificate" ? "Generating..." : "Download Project Cert PDF"}
                </Button>
              </div>

              <div className="p-6 rounded-2xl bg-[#faf8f2] border border-amber-400/60 space-y-3 text-xs">
                <p className="font-bold text-xs uppercase tracking-wider text-amber-700">PROJECT COMPLETION CERTIFICATE</p>
                <p className="text-slate-800 leading-relaxed">
                  Awarded to <strong className="text-foreground">{studentName}</strong> for successful design, engineering, and live deployment of:
                </p>
                <div className="p-3 rounded-xl bg-white border border-amber-200">
                  <p className="font-bold text-primary text-sm">{projectTitle}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Tech Stack: {techStack}</p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">Status: Verified & Live Deployed</p>
                </div>
              </div>
            </div>
          )}

          {/* 7. PERFORMANCE EVALUATION REPORT */}
          {(activeTab === "all" || activeTab === "report") && (
            <div className="space-y-2.5 p-5 rounded-3xl bg-white border border-border/70 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="size-4.5 text-indigo-600" />
                  <h3 className="font-bold text-sm text-[#181619]">7. Performance Evaluation Report</h3>
                  <Badge variant="outline" className="text-[10px] text-indigo-700 border-indigo-300 font-bold">
                    AUDIT REPORT
                  </Badge>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleDownloadAdvancedPdf("evaluation_report", "PERF", "Performance Report")}
                  disabled={downloadingDoc === "evaluation_report"}
                  className="rounded-xl text-xs h-8 gap-1.5 brand-gradient text-white font-bold shadow-xs"
                >
                  <Download className="size-3.5" />
                  {downloadingDoc === "evaluation_report" ? "Generating..." : "Download Report PDF"}
                </Button>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-border/70 space-y-3 text-xs">
                <p className="font-bold text-xs uppercase tracking-wider text-slate-900">QUANTITATIVE AUDIT & SCORECARD</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-50 border"><span className="text-muted-foreground block text-[10px]">Code Quality</span><span className="font-bold text-primary">9.7 / 10</span></div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border"><span className="text-muted-foreground block text-[10px]">Technical Skills</span><span className="font-bold text-primary">9.8 / 10</span></div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border"><span className="text-muted-foreground block text-[10px]">Problem Solving</span><span className="font-bold text-primary">9.6 / 10</span></div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border"><span className="text-muted-foreground block text-[10px]">Final Rating</span><span className="font-bold text-emerald-600">{grade}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* 8. CERTIFICATE OF APPRECIATION */}
          {(activeTab === "all" || activeTab === "appreciation") && (
            <div className="space-y-2.5 p-5 rounded-3xl bg-white border border-border/70 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="size-4.5 text-rose-500 fill-rose-500" />
                  <h3 className="font-bold text-sm text-[#181619]">8. Certificate of Appreciation</h3>
                  <Badge variant="outline" className="text-[10px] text-rose-700 border-rose-300 font-bold">
                    EXEMPLARY MERIT
                  </Badge>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleDownloadAdvancedPdf("appreciation_certificate", "APR", "Appreciation Certificate")}
                  disabled={downloadingDoc === "appreciation_certificate"}
                  className="rounded-xl text-xs h-8 gap-1.5 brand-gradient text-white font-bold shadow-xs"
                >
                  <Download className="size-3.5" />
                  {downloadingDoc === "appreciation_certificate" ? "Generating..." : "Download Appreciation PDF"}
                </Button>
              </div>

              <div className="p-6 rounded-2xl bg-[#faf8f2] border border-rose-200 space-y-3 text-xs">
                <p className="font-bold text-xs uppercase tracking-wider text-rose-700">CERTIFICATE OF APPRECIATION</p>
                <p className="text-slate-800 leading-relaxed">
                  Presented to <strong className="text-foreground">{studentName}</strong> in recognition of outstanding performance and dedication in {domainTitle}, specifically for {appreciationReason}
                </p>
              </div>
            </div>
          )}

          {/* 9. SKILL ACHIEVEMENT CERTIFICATE */}
          {(activeTab === "all" || activeTab === "skill") && (
            <div className="space-y-2.5 p-5 rounded-3xl bg-white border border-border/70 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4.5 text-teal-600" />
                  <h3 className="font-bold text-sm text-[#181619]">9. Skill Achievement Certificate</h3>
                  <Badge variant="outline" className="text-[10px] text-teal-700 border-teal-300 font-bold">
                    COMPETENCY MASTERY
                  </Badge>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleDownloadAdvancedPdf("skill_certificate", "SKL", "Skill Certificate")}
                  disabled={downloadingDoc === "skill_certificate"}
                  className="rounded-xl text-xs h-8 gap-1.5 brand-gradient text-white font-bold shadow-xs"
                >
                  <Download className="size-3.5" />
                  {downloadingDoc === "skill_certificate" ? "Generating..." : "Download Skill Cert PDF"}
                </Button>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-border/70 space-y-3 text-xs">
                <p className="font-bold text-xs uppercase tracking-wider text-teal-700">PRACTICAL SKILL MASTERY VALIDATION</p>
                <p className="text-slate-800 leading-relaxed">
                  Validates that <strong className="text-foreground">{studentName}</strong> has demonstrated verified mastery in{" "}
                  <strong>{domainTitle} — Full Stack System Architecture & Engineering</strong> with an assessment score of{" "}
                  <strong className="text-emerald-600">96 / 100 (Grade A+)</strong>.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
