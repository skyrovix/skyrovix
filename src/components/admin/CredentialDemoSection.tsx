import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { EMAIL_ASSETS } from "@/lib/email-assets";
import { downloadCertificate, downloadIDCard } from "@/components/pdf-docs";
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
} from "lucide-react";

export function CredentialDemoSection() {
  // Demo State
  const [activeTab, setActiveTab] = useState<"all" | "cert" | "idcard">("all");
  const [studentName, setStudentName] = useState("Mainak Mondal");
  const [internId, setInternId] = useState("SKX-2026-8566");
  const [certId, setCertId] = useState("SKX-CERT-2026-36848");
  const [selectedDomain, setSelectedDomain] = useState("cybersecurity");
  const [grade, setGrade] = useState("A+ (Outstanding)");
  const [issuedDate, setIssuedDate] = useState(new Date().toISOString().slice(0, 10));
  const [validUntil, setValidUntil] = useState(`31 Dec ${new Date().getFullYear()}`);
  const [bloodGroup, setBloodGroup] = useState("B+");
  const [emergencyPhone, setEmergencyPhone] = useState("+91 98765 43210");
  const [idCardFlipped, setIdCardFlipped] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);
  const [downloadingId, setDownloadingId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Derive domain name
  const domainObj = DOMAINS.find((d) => d.slug === selectedDomain);
  const domainTitle = domainObj ? domainObj.name : "Cyber Security";

  // Verification URL
  const verifyUrl = `${getPublicSiteUrl()}/verify?id=${encodeURIComponent(certId.trim())}`;
  const idVerifyUrl = `${getPublicSiteUrl()}/verify?id=${encodeURIComponent(internId.trim())}`;

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
    navigator.clipboard.writeText(verifyUrl);
    setCopiedLink(true);
    toast.success("Verification link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadCertPdf = async () => {
    setDownloadingCert(true);
    const toastId = toast.loading("Rendering high-resolution Certificate PDF...");
    try {
      await downloadCertificate({
        fullName: studentName || "Student Intern",
        internId: internId || "SKX-INT",
        domain: domainTitle,
        certId: certId || "SKX-CERT",
        issuedAt: issuedDate,
        verifyUrl,
        grade,
      });
      toast.success("Demo Certificate downloaded successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(`Download failed: ${err.message}`, { id: toastId });
    } finally {
      setDownloadingCert(false);
    }
  };

  const handleDownloadIdPdf = async () => {
    setDownloadingId(true);
    const toastId = toast.loading("Rendering high-resolution ID Card PDF...");
    try {
      await downloadIDCard({
        fullName: studentName || "Student Intern",
        internId: internId || "SKX-INT",
        domain: domainTitle,
        issuedAt: issuedDate,
        validUpto: validUntil,
        email: `${studentName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      });
      toast.success("Demo ID Card downloaded successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(`Download failed: ${err.message}`, { id: toastId });
    } finally {
      setDownloadingId(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ─── Header & Top Actions ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="size-4" />
            </span>
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase font-mono">
              Skyrovix Executive Studio
            </span>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-mono">
              LIVE PREVIEW & DEMO
            </Badge>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Credential Preview & Demo Studio</h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
            Interactive designer, visual validator, and instant generator for Official Certificates of Completion and Smart Executive ID Cards.
          </p>
        </div>

        {/* Action Controls */}
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
          <Button
            size="sm"
            onClick={handleDownloadCertPdf}
            disabled={downloadingCert}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold border-0 text-xs gap-1.5 h-9 shadow-lg shadow-amber-500/20"
          >
            <Download className="size-3.5" />
            {downloadingCert ? "Generating..." : "Download Cert PDF"}
          </Button>
          <Button
            size="sm"
            onClick={handleDownloadIdPdf}
            disabled={downloadingId}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold border-0 text-xs gap-1.5 h-9 shadow-lg shadow-blue-500/20"
          >
            <IdCardIcon className="size-3.5" />
            {downloadingId ? "Generating..." : "Download ID PDF"}
          </Button>
        </div>
      </div>

      {/* ─── Mode Switcher Bar ─── */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/40">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "all"
                ? "bg-white dark:bg-slate-800 text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Side-by-Side (Both)
          </button>
          <button
            onClick={() => setActiveTab("cert")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "cert"
                ? "bg-white dark:bg-slate-800 text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Award className="size-3.5 text-amber-500" />
            Certificate Only
          </button>
          <button
            onClick={() => setActiveTab("idcard")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "idcard"
                ? "bg-white dark:bg-slate-800 text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <IdCardIcon className="size-3.5 text-blue-500" />
            ID Card Only
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 px-2.5 py-1 rounded-lg">
            Theme: Imperial Ivory & Gold (Official)
          </span>
        </div>
      </div>

      {/* ─── Main Content Grid: Controls & Visual Canvas ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ─── LEFT: Interactive Controls (4 cols) ─── */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="rounded-2xl border-border/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur shadow-sm">
            <div className="p-4 border-b border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="size-4 text-primary" />
                <h3 className="font-bold text-sm">Demo Customizer</h3>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">REAL-TIME</span>
            </div>

            <CardContent className="p-4 space-y-3.5 text-xs">
              {/* Student Name */}
              <div>
                <Label className="text-[11px] font-semibold text-muted-foreground">Student Full Name</Label>
                <Input
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Mainak Mondal"
                  className="mt-1 h-9 rounded-xl text-xs"
                />
                <div className="flex gap-1.5 mt-1.5">
                  {["Mainak Mondal", "Hariharan S", "Aarav Sharma", "Priya Patel"].map((name) => (
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
                  className="mt-1 w-full h-9 rounded-xl border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {DOMAINS.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Certificate & Intern IDs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[11px] font-semibold text-muted-foreground">Certificate ID</Label>
                  <Input
                    value={certId}
                    onChange={(e) => setCertId(e.target.value)}
                    className="mt-1 h-8 rounded-xl font-mono text-[11px]"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold text-muted-foreground">Intern ID</Label>
                  <Input
                    value={internId}
                    onChange={(e) => setInternId(e.target.value)}
                    className="mt-1 h-8 rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Grade & Issue Date */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[11px] font-semibold text-muted-foreground">Performance Grade</Label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="mt-1 w-full h-8 rounded-xl border border-input bg-background px-2 text-xs"
                  >
                    <option value="A+ (Outstanding)">A+ (Outstanding)</option>
                    <option value="A (Excellent)">A (Excellent)</option>
                    <option value="B+ (Very Good)">B+ (Very Good)</option>
                    <option value="Merit Honors">Merit Honors</option>
                  </select>
                </div>
                <div>
                  <Label className="text-[11px] font-semibold text-muted-foreground">Issue Date</Label>
                  <Input
                    type="date"
                    value={issuedDate}
                    onChange={(e) => setIssuedDate(e.target.value)}
                    className="mt-1 h-8 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* ID Card Specific Customization */}
              <div className="pt-2 border-t border-border/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  ID Card Details
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Blood Group</Label>
                    <Input
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      placeholder="e.g. B+"
                      className="mt-0.5 h-8 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Valid Until</Label>
                    <Input
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      placeholder="e.g. 31 Dec 2026"
                      className="mt-0.5 h-8 rounded-xl text-xs"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <Label className="text-[10px] text-muted-foreground">Emergency Contact</Label>
                  <Input
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="mt-0.5 h-8 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Verification & Quick Info */}
              <div className="pt-3 border-t border-border/40 text-[11px] space-y-1.5 text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Govt. Registration:</span>
                  <span className="font-mono font-semibold text-foreground">UDYAM-TN-17-0076606</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Accreditation:</span>
                  <span className="font-semibold text-foreground">MSME Certified</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Signatories:</span>
                  <span className="font-semibold text-foreground">{COMPANY.founder.name} & {COMPANY.cofounder.name}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── RIGHT: Visual Previews (8 cols) ─── */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. CERTIFICATE LIVE PREVIEW (Imperial Ivory & Gold) */}
          {(activeTab === "all" || activeTab === "cert") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="size-4 text-amber-500" />
                  <h3 className="font-bold text-sm">Certificate of Excellence (Visual Render)</h3>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    A4 LANDSCAPE
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadCertPdf}
                  disabled={downloadingCert}
                  className="rounded-xl text-xs h-7 gap-1 border-border/60"
                >
                  <Download className="size-3" />
                  Download PDF
                </Button>
              </div>

              {/* High-Resolution Certificate Canvas: Imperial Ivory */}
              <div
                className="relative w-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 border bg-[#faf8f2] text-slate-900 border-amber-600/40"
                style={{
                  aspectRatio: "1.414 / 1",
                  maxHeight: "620px",
                }}
              >
                {/* Outer & Inner Dual Gold Ornamental Borders */}
                <div className="absolute inset-3 rounded-xl pointer-events-none border-2 border-[#b45309]" />
                <div className="absolute inset-5 rounded-lg pointer-events-none border border-[#d97706]/40" />

                {/* 4 Corner Ornamental Brackets */}
                <div className="absolute top-5 left-5 size-6 border-t-2 border-l-2 border-amber-600" />
                <div className="absolute top-5 right-5 size-6 border-t-2 border-r-2 border-amber-600" />
                <div className="absolute bottom-5 left-5 size-6 border-b-2 border-l-2 border-amber-600" />
                <div className="absolute bottom-5 right-5 size-6 border-b-2 border-r-2 border-amber-600" />

                {/* Content Container */}
                <div className="relative h-full flex flex-col justify-between p-7 sm:p-9 select-none">
                  {/* 1. Header: Logos & Recognition */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 w-36 justify-start">
                      {EMAIL_ASSETS?.logo ? (
                        <img src={EMAIL_ASSETS.logo} alt="Skyrovix" className="h-10 w-auto object-contain" />
                      ) : (
                        <div className="size-10 rounded-lg bg-amber-500/20 grid place-items-center font-bold text-amber-600">
                          SK
                        </div>
                      )}
                      {EMAIL_ASSETS?.vinix && (
                        <img src={EMAIL_ASSETS.vinix} alt="Vinix" className="h-6 w-auto object-contain hidden sm:inline" />
                      )}
                    </div>

                    <div className="flex-1 text-center">
                      <h1 className="text-xl sm:text-2xl font-extrabold tracking-[0.25em] text-amber-600 uppercase font-display leading-none">
                        SKYROVIX
                      </h1>
                      <p className="text-[8px] sm:text-[9px] font-semibold tracking-wider mt-1 text-slate-700">
                        Skill Development & Future Tech Innovations • MSME Certified
                      </p>
                      <p className="text-[7.5px] font-medium tracking-wide text-amber-700/80 mt-0.5">
                        Registered under MSME, Ministry of MSME, Govt. of India (UDYAM-TN-17-0076606)
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-36 justify-end">
                      {EMAIL_ASSETS?.yrTech && (
                        <img src={EMAIL_ASSETS.yrTech} alt="YR Tech" className="h-6 w-auto object-contain hidden sm:inline" />
                      )}
                      {EMAIL_ASSETS?.msme ? (
                        <img src={EMAIL_ASSETS.msme} alt="MSME Govt of India" className="h-8 w-auto object-contain" />
                      ) : (
                        <span className="text-[9px] font-bold text-amber-600 border border-amber-600/40 px-2 py-0.5 rounded">
                          MSME INDIA
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 2. Certificate Title */}
                  <div className="text-center my-auto py-1.5">
                    <div className="inline-block relative">
                      <h2 className="text-lg sm:text-2xl font-extrabold tracking-[0.2em] uppercase font-serif text-slate-900">
                        CERTIFICATE OF EXCELLENCE
                      </h2>
                      <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] text-amber-600 uppercase mt-0.5">
                        VIRTUAL INTERNSHIP & SKILL DEVELOPMENT
                      </p>
                      <div className="mx-auto w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mt-1.5" />
                    </div>

                    <p className="text-[9.5px] sm:text-[11px] font-serif italic mt-2.5 text-slate-600">
                      This certificate is proudly awarded to
                    </p>

                    {/* Recipient Name */}
                    <div className="my-1.5">
                      <h3 className="text-xl sm:text-3xl font-extrabold tracking-wide uppercase font-display text-slate-900">
                        {studentName || "STUDENT INTERN"}
                      </h3>
                      <div className="mx-auto w-40 h-0.5 bg-amber-500 mt-1" />
                    </div>

                    {/* Citation */}
                    <p className="text-[9px] sm:text-[10.5px] max-w-xl mx-auto leading-relaxed mt-1.5 text-slate-700">
                      In recognition of outstanding performance and successful completion of the industry-oriented virtual internship program in{" "}
                      <span className="font-bold text-amber-600 underline decoration-amber-500/40 underline-offset-2">
                        {domainTitle}
                      </span>
                      , demonstrating technical proficiency, professional dedication, and successful completion of the assigned capstone project.
                    </p>

                    {/* Metadata Badge Bar */}
                    <div className="inline-flex items-center justify-center gap-2.5 sm:gap-4 px-4 py-1 rounded-full mt-2 text-[8px] sm:text-[9px] font-mono border bg-white/95 border-slate-300 text-slate-800 shadow-xs max-w-xl mx-auto">
                      <span>
                        CERT ID: <strong className="text-amber-600">{certId}</strong>
                      </span>
                      <span className="text-slate-300">|</span>
                      <span>
                        INTERN ID: <strong className="text-amber-600">{internId}</strong>
                      </span>
                      <span className="text-slate-300">|</span>
                      <span>
                        GRADE: <strong className="text-emerald-600 font-bold">{grade}</strong>
                      </span>
                      <span className="text-slate-300">|</span>
                      <span>
                        ISSUED: <strong>{displayDate}</strong>
                      </span>
                    </div>
                  </div>

                  {/* 3. Footer: Signatures, Seal & Live QR Code */}
                  <div className="grid grid-cols-4 items-end pt-2 px-2 sm:px-4">
                    {/* Col 1: Founder Signature */}
                    <div className="text-center flex flex-col items-center">
                      <div className="h-10 sm:h-12 flex items-end justify-center">
                        {EMAIL_ASSETS?.sigFounder ? (
                          <img
                            src={EMAIL_ASSETS.sigFounder}
                            alt="Hariharan S"
                            className="h-9 sm:h-11 max-w-[120px] object-contain"
                          />
                        ) : (
                          <div className="h-9" />
                        )}
                      </div>
                      <div className="w-24 sm:w-28 h-px mx-auto my-1 bg-slate-400" />
                      <p className="font-bold text-[9.5px] sm:text-[10px] text-slate-900 leading-tight">
                        {COMPANY.founder.name}
                      </p>
                      <p className="text-[7.5px] sm:text-[8px] text-amber-600 font-semibold leading-tight mt-0.5">{COMPANY.founder.title}</p>
                    </div>

                    {/* Col 2: Official Seal */}
                    <div className="text-center flex flex-col items-center">
                      <div className="h-10 sm:h-12 flex items-center justify-center">
                        {EMAIL_ASSETS?.seal ? (
                          <img
                            src={EMAIL_ASSETS.seal}
                            alt="Official Seal"
                            className="size-11 sm:size-13 object-contain drop-shadow-sm"
                          />
                        ) : (
                          <div className="size-11 rounded-full border-2 border-amber-500 grid place-items-center text-[7px] font-bold text-amber-500">
                            SEAL
                          </div>
                        )}
                      </div>
                      <div className="w-16 h-px mx-auto my-1 bg-transparent" />
                      <p className="text-[7.5px] font-semibold text-slate-500 leading-tight">Official Verified Seal</p>
                      <p className="text-[7px] text-amber-600/80 font-mono leading-tight mt-0.5">SKYROVIX • MSME</p>
                    </div>

                    {/* Col 3: QR Code for Verification */}
                    <div className="text-center flex flex-col items-center">
                      <div className="h-10 sm:h-12 flex items-center justify-center">
                        <div className="p-0.5 rounded bg-white shadow-xs border border-amber-200">
                          <QRCodeSVG value={verifyUrl} size={38} level="M" />
                        </div>
                      </div>
                      <div className="w-16 h-px mx-auto my-1 bg-transparent" />
                      <p className="text-[7.5px] font-semibold text-slate-500 leading-tight">Digitally Verified Certificate</p>
                      <p className="text-[7px] text-slate-400 font-mono leading-tight mt-0.5">Scan to verify online</p>
                    </div>

                    {/* Col 4: Co-Founder Signature */}
                    <div className="text-center flex flex-col items-center">
                      <div className="h-10 sm:h-12 flex items-end justify-center">
                        {EMAIL_ASSETS?.sigCofounder ? (
                          <img
                            src={EMAIL_ASSETS.sigCofounder}
                            alt="Maheshwaran S"
                            className="h-9 sm:h-11 max-w-[120px] object-contain"
                          />
                        ) : (
                          <div className="h-9" />
                        )}
                      </div>
                      <div className="w-24 sm:w-28 h-px mx-auto my-1 bg-slate-400" />
                      <p className="font-bold text-[9.5px] sm:text-[10px] text-slate-900 leading-tight">
                        {COMPANY.cofounder.name}
                      </p>
                      <p className="text-[7.5px] sm:text-[8px] text-amber-600 font-semibold leading-tight mt-0.5">{COMPANY.cofounder.title}</p>
                    </div>
                  </div>

                  {/* 4. Bottom Security Strip */}
                  <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-slate-300 text-[6.8px] sm:text-[7.5px] text-slate-500 font-mono">
                    <span>A digitally verifiable credential issued by SKYROVIX IT Solutions (Udyam Registered – Ministry of MSME, Government of India).</span>
                    <span>Official verification portal: <strong className="text-amber-600">https://skyrovix.in/verify-certificate</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. EXECUTIVE ID CARD LIVE PREVIEW */}
          {(activeTab === "all" || activeTab === "idcard") && (
            <div className="space-y-3 pt-4 border-t border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IdCardIcon className="size-4 text-blue-500" />
                  <h3 className="font-bold text-sm">Smart Executive ID Card (Interactive Preview)</h3>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    CR80 STANDARD
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIdCardFlipped(!idCardFlipped)}
                    className="rounded-xl text-xs h-7 gap-1 border-border/60"
                  >
                    <RotateCw className="size-3" />
                    {idCardFlipped ? "View Front Side" : "Flip to Back Side"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownloadIdPdf}
                    disabled={downloadingId}
                    className="rounded-xl text-xs h-7 gap-1 border-border/60"
                  >
                    <Download className="size-3" />
                    Download ID PDF
                  </Button>
                </div>
              </div>

              {/* ID Card Display Area */}
              <div className="p-6 sm:p-10 rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900/80 dark:to-slate-950 border border-border/50 flex flex-col items-center justify-center">
                {!idCardFlipped ? (
                  // Front Side
                  <div className="transition-all duration-300 transform hover:scale-[1.02]">
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
                  // Back Side
                  <div className="w-full max-w-[340px] sm:max-w-[350px] rounded-[22px] bg-white text-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-slate-800 transition-all duration-300">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#f95c4b]">
                        TERMS & CONDITIONS
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">OFFICIAL CREDENTIAL</span>
                    </div>

                    <div className="space-y-2 py-3 text-[9px] text-slate-600 leading-relaxed">
                      <p>1. This card certifies active virtual internship enrollment with Skyrovix IT Solutions.</p>
                      <p>2. Property of Skyrovix. If found, please return to: support@skyrovix.in or official address.</p>
                      <p>3. Digitally signed and valid until completion of assigned curriculum tasks.</p>
                    </div>

                    {/* Medical / Emergency Metadata */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[9.5px] space-y-1 mb-3">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Blood Group:</span>
                        <span className="font-bold text-slate-900">{bloodGroup}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Emergency Phone:</span>
                        <span className="font-mono font-semibold text-slate-900">{emergencyPhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Valid Upto:</span>
                        <span className="font-semibold text-emerald-600">{validUntil}</span>
                      </div>
                    </div>

                    {/* QR Code & Authority Block */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="p-1 rounded bg-slate-100">
                        <QRCodeSVG value={idVerifyUrl} size={48} />
                      </div>
                      <div className="text-right">
                        {EMAIL_ASSETS?.sigFounder && (
                          <img
                            src={EMAIL_ASSETS.sigFounder}
                            alt="Signature"
                            className="h-8 ml-auto object-contain"
                          />
                        )}
                        <span className="text-[8.5px] font-bold block text-slate-900 mt-0.5">
                          {COMPANY.founder.name}
                        </span>
                        <span className="text-[7.5px] text-[#f95c4b] block">Authorized Signatory</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
