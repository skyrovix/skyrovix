import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Search, Clock, Award, ShieldCheck, ScanLine, AlertTriangle } from "lucide-react";
import { getDomain } from "@/lib/constants";
import { AuroraBackground } from "@/components/AuroraBackground";
import { FadeUp } from "@/components/motion";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { verifyCredentialServerFn, type VerificationResponse, type VerificationResultData } from "@/lib/verify-service";

export type VerificationState =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "found"; data: VerificationResultData; type: "offer_letter" | "certificate" | "course" | "project" }
  | { state: "notfound" }
  | { state: "error"; message: string };

interface VerificationViewProps {
  initialId?: string;
  canonicalPath?: string;
}

export function VerificationView({ initialId = "", canonicalPath = "/verify-certificate" }: VerificationViewProps) {
  const [id, setId] = useState(initialId);
  const [result, setResult] = useState<VerificationState>({ state: "idle" });
  const hasAutoVerified = useRef(false);

  const performVerification = async (targetId: string) => {
    const trimmed = (targetId || "").trim();
    if (!trimmed) return;
    setResult({ state: "loading" });

    try {
      const res: VerificationResponse = await verifyCredentialServerFn({ data: { id: trimmed } });
      if (res.state === "found") {
        setResult({
          state: "found",
          type: res.type,
          data: res.data,
        });
      } else if (res.state === "error") {
        setResult({
          state: "error",
          message: res.message,
        });
      } else {
        setResult({ state: "notfound" });
      }
    } catch (err: any) {
      console.error("[VerificationView] Verification call failed:", err);
      setResult({
        state: "error",
        message: err?.message || "An error occurred while connecting to the verification service. Please try again.",
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim()) return;
    performVerification(id);
  };

  // Auto-verify on mount if ID is provided via prop or URL query parameter
  useEffect(() => {
    let resolvedId = initialId.trim();

    if (!resolvedId && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get("id") || params.get("cert") || params.get("intern") || "";
      if (urlId.trim()) {
        resolvedId = urlId.trim();
      }
    }

    if (resolvedId && !hasAutoVerified.current) {
      hasAutoVerified.current = true;
      setId(resolvedId);
      performVerification(resolvedId);
    }
  }, [initialId]);

  const pageUrl = `https://skyrovix.in${canonicalPath}`;

  return (
    <div className="w-full">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://skyrovix.in/" },
          { name: "Verify Certificate", url: pageUrl },
        ]}
      />
      <WebPageJsonLd
        title="Verify Skyrovix Certificate & Offer Letter — Instant Online Verification"
        description="Verify the authenticity of a Skyrovix internship offer letter, certificate, or intern ID online. Enter your ID to confirm authenticity instantly."
        url={pageUrl}
      />
      <Navbar />
      <AuroraBackground>
        <section className="relative pb-6 sm:pb-10 pt-20 sm:pt-24 md:pt-28">
          <div className="mx-auto max-w-2xl px-4">
            <FadeUp className="text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#f95c4b]/20 bg-[#f95c4b]/10 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-bold text-[#f95c4b] dark:text-[#ee9590] shadow-sm backdrop-blur">
                <ShieldCheck className="size-3 sm:size-3.5" /> Credential Verification
              </div>
              <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
                Verify <span className="brand-text">Certificate</span>
              </h1>
              <p className="mt-5 mx-auto max-w-xl text-sm sm:text-base text-muted-foreground">
                Enter an Offer Letter ID, Intern ID, or Certificate ID to verify authenticity.
              </p>
            </FadeUp>
          </div>
        </section>
      </AuroraBackground>
      <main className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <FadeUp delay={0.1}>
          <div className="rounded-2xl border border-border/50 bg-card p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 mb-1">
              <ScanLine className="size-5 text-[#f95c4b] dark:text-[#ee9590]" />
              <p className="text-sm font-semibold">Enter Offer Letter ID, Intern ID, or Certificate ID</p>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Example: <span className="font-mono font-medium text-foreground">SKX-2026-7820</span>, <span className="font-mono font-medium text-foreground">SKX-2026-XXXX</span>, or <span className="font-mono font-medium text-foreground">SKX-CERT-2026-XXXXX</span>
            </p>
            <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="e.g. SKX-2026-7820 or SKX-CERT-2026-XXXX"
                  className="w-full pl-9 font-mono text-sm"
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto bg-[#f95c4b] hover:bg-[#e04b3a] text-white font-bold shadow-md shadow-[#f95c4b]/25 hover:-translate-y-0.5 active:translate-y-0 transition-all border-0">
                <Search className="size-4 mr-1.5" /> Verify
              </Button>
            </form>
          </div>
        </FadeUp>

        {result.state === "loading" && (
          <FadeUp y={10} duration={0.4}>
            <div className="mt-6 rounded-2xl border border-border/50 bg-card p-6 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-muted" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/3 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-3 w-full rounded bg-muted" />
                ))}
              </div>
            </div>
          </FadeUp>
        )}

        {/* 1. OFFER LETTER & INTERN ID VERIFIED RESULT */}
        {result.state === "found" && (result.type === "offer_letter" || result.type === "certificate") && (() => {
          const d = result.data;
          const hasCert = !!d.cert_id;
          const isOfferLetter = result.type === "offer_letter" || !hasCert;

          return (
            <FadeUp y={10} duration={0.4}>
              <div className="mt-6 rounded-2xl border border-green-200/60 dark:border-green-900/40 bg-card p-6 sm:p-8 shadow-sm">
                {/* Header */}
                <div className="flex items-center gap-4 pb-5 border-b border-border/40">
                  <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-green-50 dark:bg-green-950/30">
                    <CheckCircle2 className="size-7 text-green-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold">Verified ✓</h2>
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-950/30 px-2.5 py-0.5 text-[10px] font-semibold text-green-700 dark:text-green-400 border border-green-200/60 dark:border-green-900/40">
                        <ShieldCheck className="size-3" /> Authentic
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {hasCert
                        ? "This internship certificate is authentic and issued by Skyrovix."
                        : "This internship offer letter and intern credential are authentic and verified by Skyrovix."}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-5 space-y-0 divide-y divide-border/40 text-sm">
                  <Row k="Candidate Name" v={d.full_name} />
                  <Row k="Domain / Role" v={getDomain(d.domain)?.name ?? d.domain} />
                  <Row k="Internship / Program" v="Skyrovix Virtual Internship" />
                  {d.intern_id && (
                    <Row
                      k={isOfferLetter ? "Offer Letter ID" : "Intern ID"}
                      v={<span className="font-mono text-green-600 dark:text-green-400 font-semibold">{d.intern_id}</span>}
                    />
                  )}
                  {d.duration !== undefined && d.duration !== null && (
                    <Row k="Duration" v={`${d.duration} Month${d.duration > 1 ? "s" : ""}`} />
                  )}
                  {d.issued_at && (
                    <Row
                      k="Issue Date"
                      v={new Date(d.issued_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    />
                  )}
                  <Row
                    k="Status"
                    v={
                      <Badge
                        variant={
                          d.status === "approved" || d.status === "completed" || d.status === "ongoing"
                            ? "default"
                            : d.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                        className="capitalize"
                      >
                        {d.status === "approved" || d.status === "completed" || d.status === "ongoing"
                          ? "Valid / Verified"
                          : d.status}
                      </Badge>
                    }
                  />
                  {d.cert_id && (
                    <Row
                      k="Certificate ID"
                      v={<span className="font-mono text-green-600 dark:text-green-400 font-semibold">{d.cert_id}</span>}
                    />
                  )}
                  {d.verification_hash && (
                    <Row
                      k="Verification Hash"
                      v={<span className="font-mono text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-xs">{d.verification_hash}</span>}
                    />
                  )}
                </div>

                {/* Footer trust badge */}
                <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#faf8f2] dark:bg-card/60 border border-border/40 px-4 py-3 text-xs text-muted-foreground">
                  <Award className="size-4 text-[#f95c4b] dark:text-[#ee9590]" />
                  <span>Digitally verified by Skyrovix — MSME-registered IT company (UDYAM-TN-17-0076606)</span>
                </div>
              </div>
            </FadeUp>
          );
        })()}

        {/* 2. COURSE CERTIFICATE VERIFIED RESULT */}
        {result.state === "found" && result.type === "course" && (() => {
          const d = result.data;
          return (
            <FadeUp y={10} duration={0.4}>
              <div className="mt-6 rounded-2xl border border-green-200/60 dark:border-green-900/40 bg-card p-6 sm:p-8 shadow-sm">
                {/* Header */}
                <div className="flex items-center gap-4 pb-5 border-b border-border/40">
                  <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-green-50 dark:bg-green-950/30">
                    <CheckCircle2 className="size-7 text-green-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold">Verified ✓</h2>
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-950/30 px-2.5 py-0.5 text-[10px] font-semibold text-green-700 dark:text-green-400 border border-green-200/60 dark:border-green-900/40">
                        <ShieldCheck className="size-3" /> Authentic
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This course completion certificate is authentic and issued by Skyrovix.
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-5 space-y-0 divide-y divide-border/40 text-sm">
                  <Row k="Student Name" v={d.full_name} />
                  <Row k="Course Completed" v={d.course_name} />
                  <Row k="Final Exam Score" v={d.score !== undefined ? `${d.score}%` : "Passed"} />
                  <Row k="Certificate ID" v={<span className="font-mono text-green-600 dark:text-green-400 font-semibold">{d.cert_id}</span>} />
                  {d.issued_at && (
                    <Row
                      k="Issued On"
                      v={new Date(d.issued_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    />
                  )}
                </div>

                {/* Footer trust badge */}
                <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#faf8f2] dark:bg-card/60 border border-border/40 px-4 py-3 text-xs text-muted-foreground">
                  <Award className="size-4 text-[#f95c4b] dark:text-[#ee9590]" />
                  <span>Digitally verified by Skyrovix — MSME-registered IT company (UDYAM-TN-17-0076606)</span>
                </div>
              </div>
            </FadeUp>
          );
        })()}

        {/* 3. PROJECT CERTIFICATE VERIFIED RESULT */}
        {result.state === "found" && result.type === "project" && (() => {
          const d = result.data;
          return (
            <FadeUp y={10} duration={0.4}>
              <div className="mt-6 rounded-2xl border border-green-200/60 dark:border-green-900/40 bg-card p-6 sm:p-8 shadow-sm">
                {/* Header */}
                <div className="flex items-center gap-4 pb-5 border-b border-border/40">
                  <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-green-50 dark:bg-green-950/30">
                    <CheckCircle2 className="size-7 text-green-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold">Verified ✓</h2>
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-950/30 px-2.5 py-0.5 text-[10px] font-semibold text-green-700 dark:text-green-400 border border-green-200/60 dark:border-green-900/40">
                        <ShieldCheck className="size-3" /> Authentic
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This real-world project challenge credential is authentic and issued by Skyrovix.
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-5 space-y-0 divide-y divide-border/40 text-sm">
                  <Row k="Participant Name" v={d.full_name} />
                  <Row k="Project Completed" v={d.project_title} />
                  <Row k="Industry Track" v={d.domain} />
                  {d.score !== undefined && <Row k="Evaluation Score" v={`${d.score}/100`} />}
                  <Row k="Certificate ID" v={<span className="font-mono text-green-600 dark:text-green-400 font-semibold">{d.cert_id}</span>} />
                  {d.issued_at && (
                    <Row
                      k="Issued On"
                      v={new Date(d.issued_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    />
                  )}
                </div>

                {/* Footer trust badge */}
                <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#faf8f2] dark:bg-card/60 border border-border/40 px-4 py-3 text-xs text-muted-foreground">
                  <Award className="size-4 text-[#f95c4b] dark:text-[#ee9590]" />
                  <span>Digitally verified by Skyrovix — MSME-registered IT company (UDYAM-TN-17-0076606)</span>
                </div>
              </div>
            </FadeUp>
          );
        })()}

        {/* 4. NOT FOUND RESULT */}
        {result.state === "notfound" && (
          <FadeUp y={10} duration={0.4}>
            <div className="mt-6 rounded-2xl border border-red-200/60 dark:border-red-900/40 bg-card p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-red-50 dark:bg-red-950/30">
                  <XCircle className="size-7 text-red-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Not Found</h2>
                  <p className="text-sm text-muted-foreground">No certificate or intern matches this ID.</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 p-4 text-sm text-muted-foreground">
                <p className="font-semibold text-amber-800 dark:text-amber-300">Did you mean to?</p>
                <ul className="mt-1.5 space-y-1 list-disc list-inside text-xs">
                  <li>Check your Offer Letter ID or Certificate ID for typos</li>
                  <li>Try entering the ID without extra punctuation or spaces</li>
                  <li>Contact our verification team at <a href="mailto:support@skyrovix.in" className="text-[#f95c4b] dark:text-[#ee9590] underline font-medium">support@skyrovix.in</a> for assistance</li>
                </ul>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#faf8f2] dark:bg-card/60 border border-border/40 px-4 py-3 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-[#f95c4b] dark:text-[#ee9590]" />
                <span>All Skyrovix credentials are QR-verified and tamper-proof.</span>
              </div>
            </div>
          </FadeUp>
        )}

        {/* 5. SEPARATE ERROR STATE */}
        {result.state === "error" && (
          <FadeUp y={10} duration={0.4}>
            <div className="mt-6 rounded-2xl border border-amber-300/60 dark:border-amber-800/40 bg-card p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-amber-50 dark:bg-amber-950/30">
                  <AlertTriangle className="size-7 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Verification Notice</h2>
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#faf8f2] dark:bg-card/60 border border-border/40 px-4 py-3 text-xs text-muted-foreground">
                <Clock className="size-4 text-[#f95c4b] dark:text-[#ee9590]" />
                <span>If the issue persists, please check your network connection or contact support.</span>
              </div>
            </div>
          </FadeUp>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string | React.ReactNode }) {
  return (
    <div className="flex justify-between items-center border-b border-border/40 py-2.5">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-right">{v}</span>
    </div>
  );
}
