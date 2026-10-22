import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/db-client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  generateProjectCertId,
  generateAwardId,
  EVALUATION_CRITERIA,
  AWARD_CATEGORIES,
  getPublicSiteUrl
} from "@/lib/constants";
import {
  ProjectCompletionCert,
  ProjectAwardCert,
  downloadPdf
} from "@/components/project-pdf-docs";
import {
  Clock, CheckCircle2, XCircle, Search, ExternalLink, Award, FileText,
  ShieldCheck, Loader2, RefreshCw, Github, Video, AlertTriangle, ArrowUpRight, Download
} from "lucide-react";

export function ProjectSubmissionsSection() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"pending" | "reviewed">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [gradingSub, setGradingSub] = useState<any | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");
  const [submittingGrade, setSubmittingGrade] = useState(false);

  const [rejectingSub, setRejectingSub] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submittingReject, setSubmittingReject] = useState(false);

  const [awardingSub, setAwardingSub] = useState<any | null>(null);
  const [awardRank, setAwardRank] = useState("Top 5%");
  const [awardCategory, setAwardCategory] = useState("Outstanding Performance");
  const [submittingAward, setSubmittingAward] = useState(false);

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Real-time listener for project submissions
  useEffect(() => {
    const channel = supabase.channel("admin-project-subs-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "project_submissions" }, () => {
        qc.invalidateQueries({ queryKey: ["admin-project-submissions"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  // Fetch all project submissions
  const { data: submissions = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-project-submissions"],
    queryFn: async () => {
      const [subsRes, appsRes, evalsRes, certsRes, awardsRes] = await Promise.all([
        (supabase.from("project_submissions" as any) as any)
          .select("*, project_challenges(id, title, project_id, technologies, industry)")
          .order("updated_at", { ascending: false }),
        supabase
          .from("applications")
          .select("user_id, full_name, intern_id, college, email"),
        (supabase.from("project_evaluations" as any) as any)
          .select("*"),
        (supabase.from("project_certificates" as any) as any)
          .select("*"),
        (supabase.from("project_awards" as any) as any)
          .select("*")
      ]);

      if (subsRes.error) throw subsRes.error;
      if (appsRes.error) throw appsRes.error;
      if (evalsRes.error) throw evalsRes.error;
      if (certsRes.error) throw certsRes.error;
      if (awardsRes.error) throw awardsRes.error;

      const appMap = new Map(appsRes.data?.map((a: any) => [a.user_id, a]) ?? []);
      const evalMap = new Map(evalsRes.data?.map((e: any) => [e.submission_id, e]) ?? []);
      const certMap = new Map(certsRes.data?.map((c: any) => [c.submission_id, c]) ?? []);
      const awardMap = new Map(awardsRes.data?.map((a: any) => [a.submission_id, a]) ?? []);

      return (subsRes.data ?? []).map((s: any) => ({
        ...s,
        application: appMap.get(s.user_id) || null,
        evaluation: evalMap.get(s.id) || null,
        certificate: certMap.get(s.id) || null,
        award: awardMap.get(s.id) || null
      }));
    },
    refetchInterval: 15_000
  });

  const filtered = submissions.filter((s: any) => {
    const projTitle = s.project_challenges?.title?.toLowerCase() || "";
    const studentName = s.application?.full_name?.toLowerCase() || "";
    const internId = s.application?.intern_id?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    const matchesSearch = projTitle.includes(query) || studentName.includes(query) || internId.includes(query);
    const matchesTab = activeTab === "pending" ? s.status === "pending" : s.status !== "pending";

    return matchesSearch && matchesTab;
  });

  // Open grading modal
  const handleOpenGrade = (sub: any) => {
    const initialScores: Record<string, number> = {};
    EVALUATION_CRITERIA.forEach(c => {
      initialScores[c.key] = sub.evaluation?.[c.key] || 8; // Default to 8/10
    });
    setScores(initialScores);
    setFeedback(sub.evaluation?.feedback || "");
    setGradingSub(sub);
  };

  // Submit Evaluation / Grade
  const handleSubmitGrade = async () => {
    if (!gradingSub) return;
    setSubmittingGrade(true);

    try {
      // 1. Calculate Average score out of 100
      let totalSum = 0;
      Object.values(scores).forEach(val => {
        totalSum += val;
      });
      const calculatedTotal = Number(((totalSum / 11) * 10).toFixed(1)); // out of 100

      // 2. Insert/Upsert project evaluation
      const evalData = {
        submission_id: gradingSub.id,
        feedback: feedback || null,
        evaluated_by: user?.id || null,
        ...scores
      };

      const { error: evalError } = await (supabase
        .from("project_evaluations" as any) as any)
        .upsert(evalData, { onConflict: "submission_id" });

      if (evalError) throw evalError;

      // 3. Update project_submissions status to approved and store final_score
      const { error: subError } = await (supabase
        .from("project_submissions" as any) as any)
        .update({
          status: "approved",
          final_score: calculatedTotal,
          evaluated_at: new Date().toISOString(),
          evaluator_id: user?.id || null
        })
        .eq("id", gradingSub.id);

      if (subError) throw subError;

      // 4. Automatically generate or update completion certificate
      if (gradingSub.certificate) {
        // Update existing certificate score
        const { error: certErr } = await (supabase
          .from("project_certificates" as any) as any)
          .update({ final_score: calculatedTotal })
          .eq("submission_id", gradingSub.id);
        if (certErr) throw certErr;
      } else {
        // Insert new certificate
        if (!gradingSub.application) {
          throw new Error("Student profile details missing; cannot generate certificate.");
        }
        const cert_id = generateProjectCertId();
        const { error: certErr } = await (supabase
          .from("project_certificates" as any) as any)
          .insert({
            cert_id,
            submission_id: gradingSub.id,
            user_id: gradingSub.user_id,
            project_id: gradingSub.project_challenges.id,
            participant_name: gradingSub.application.full_name,
            project_title: gradingSub.project_challenges.title,
            industry: gradingSub.project_challenges.industry,
            technologies: gradingSub.project_challenges.technologies || [],
            final_score: calculatedTotal
          });
        if (certErr) throw certErr;
      }

      toast.success(`Submission graded successfully! Score: ${calculatedTotal}/100 and certificate issued.`);
      setGradingSub(null);
      qc.invalidateQueries({ queryKey: ["admin-project-submissions"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to submit project grades.");
    } finally {
      setSubmittingGrade(false);
    }
  };

  // Reject submission
  const handleOpenReject = (sub: any) => {
    setRejectReason("");
    setRejectingSub(sub);
  };

  const handleSubmitReject = async () => {
    if (!rejectingSub) return;
    if (!rejectReason.trim()) return toast.warning("Rejection reason is required.");
    setSubmittingReject(true);

    try {
      const { error } = await (supabase
        .from("project_submissions" as any) as any)
        .update({
          status: "rejected",
          notes: `[Rejection Notes] ${rejectReason}\n\nOriginal Notes: ${rejectingSub.notes || ""}`,
          evaluated_at: new Date().toISOString(),
          evaluator_id: user?.id || null
        })
        .eq("id", rejectingSub.id);

      if (error) throw error;

      toast.success("Submission marked as rejected.");
      setRejectingSub(null);
      qc.invalidateQueries({ queryKey: ["admin-project-submissions"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to reject submission.");
    } finally {
      setSubmittingReject(false);
    }
  };

  // Issue Completion Certificate
  const handleIssueCertificate = async (sub: any) => {
    if (!sub.application) {
      return toast.error("Student profile details missing; cannot generate certificate.");
    }
    setActionLoading(sub.id + "-cert");

    try {
      const cert_id = generateProjectCertId();
      const { error } = await (supabase
        .from("project_certificates" as any) as any)
        .insert({
          cert_id,
          submission_id: sub.id,
          user_id: sub.user_id,
          project_id: sub.project_challenges.id,
          participant_name: sub.application.full_name,
          project_title: sub.project_challenges.title,
          industry: sub.project_challenges.industry,
          technologies: sub.project_challenges.technologies || [],
          final_score: Number(sub.final_score)
        });

      if (error) throw error;
      toast.success(`Completion certificate ${cert_id} issued successfully!`);
      qc.invalidateQueries({ queryKey: ["admin-project-submissions"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to issue certificate.");
    } finally {
      setActionLoading(null);
    }
  };

  // Download PDF certificate
  const handleDownloadCert = async (sub: any) => {
    const cert = sub.certificate;
    if (!cert) return toast.error("Certificate not issued.");

    const verifyUrl = `${getPublicSiteUrl()}/verify-certificate?cert=${cert.cert_id}`;
    toast.info("Generating PDF certificate...");

    await downloadPdf(
      <ProjectCompletionCert
        participantName={cert.participant_name}
        projectId={sub.project_challenges.project_id}
        projectTitle={cert.project_title}
        industry={cert.industry}
        technologies={cert.technologies || []}
        finalScore={Number(cert.final_score)}
        certId={cert.cert_id}
        completionDate={cert.completion_date}
        evaluationUrl={verifyUrl}
      />,
      `Certificate_${cert.cert_id}.pdf`
    );
  };

  // Open Award Modal
  const handleOpenAward = (sub: any) => {
    setAwardRank("Top 5%");
    setAwardCategory("Outstanding Performance");
    setAwardingSub(sub);
  };

  // Issue Performer Award
  const handleSubmitAward = async () => {
    if (!awardingSub) return;
    setSubmittingAward(true);

    try {
      const award_id = generateAwardId();
      const { error } = await (supabase
        .from("project_awards" as any) as any)
        .insert({
          award_id,
          user_id: awardingSub.user_id,
          submission_id: awardingSub.id,
          participant_name: awardingSub.application.full_name,
          project_title: awardingSub.project_challenges.title,
          rank: awardRank,
          final_score: Number(awardingSub.final_score),
          award_category: awardCategory
        });

      if (error) throw error;
      toast.success(`Best Performer Award ${award_id} issued successfully!`);
      setAwardingSub(null);
      qc.invalidateQueries({ queryKey: ["admin-project-submissions"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to issue award.");
    } finally {
      setSubmittingAward(false);
    }
  };

  // Download Performer Award PDF
  const handleDownloadAward = async (sub: any) => {
    const awd = sub.award;
    if (!awd) return toast.error("Award not issued.");

    const verifyUrl = `${getPublicSiteUrl()}/verify-certificate?cert=${awd.award_id}`;
    toast.info("Generating award PDF...");

    await downloadPdf(
      <ProjectAwardCert
        participantName={awd.participant_name}
        projectTitle={awd.project_title}
        rank={awd.rank}
        finalScore={Number(awd.final_score)}
        awardCategory={awd.award_category}
        certId={awd.award_id}
        issueDate={awd.issue_date}
        evaluationUrl={verifyUrl}
      />,
      `Award_${awd.award_id}.pdf`
    );
  };

  return (
    <div className="animate-fade-in-up space-y-5">
      {/* ─── Header ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Project Solutions Verification</h2>
          <p className="text-sm text-muted-foreground">Grade user project challenges, write review, and issue certifications.</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl h-9" onClick={() => refetch()}>
          <RefreshCw className="size-4 mr-1.5" /> Reload List
        </Button>
      </div>

      {/* ─── Search & Tabs ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/40 dark:bg-slate-900/40 p-2.5 rounded-2xl border border-border/40 backdrop-blur">
        <div className="flex gap-1 bg-muted/60 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === "pending" ? "bg-white text-foreground shadow-sm dark:bg-slate-800" : "text-muted-foreground hover:text-foreground"}`}
          >
            Pending Review ({submissions.filter((s: any) => s.status === "pending").length})
          </button>
          <button
            onClick={() => setActiveTab("reviewed")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === "reviewed" ? "bg-white text-foreground shadow-sm dark:bg-slate-800" : "text-muted-foreground hover:text-foreground"}`}
          >
            Reviewed ({submissions.filter((s: any) => s.status !== "pending").length})
          </button>
        </div>

        <div className="relative w-64 max-w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search student or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* ─── Submissions List ─── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="size-8 animate-spin text-blue-500" />
          <p className="text-sm text-muted-foreground">Fetching project submissions...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border/60 rounded-3xl bg-white/20">
          <Clock className="size-10 text-muted-foreground/60 mx-auto mb-2" />
          <p className="font-semibold text-sm">No submissions found</p>
          <p className="text-xs text-muted-foreground">There are no project submissions matching this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((s: any) => {
            const hasCert = !!s.certificate;
            const hasAward = !!s.award;
            const certLoading = actionLoading === s.id + "-cert";

            return (
              <Card key={s.id} className="border-border/50 bg-white/60 dark:bg-[#0F172A]/60 backdrop-blur hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-4">
                  {/* Card Header Info */}
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/10 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-[#07284a] text-white border-0 font-mono text-[10px]">
                          {s.project_challenges?.project_id}
                        </Badge>
                        <h4 className="font-bold text-sm text-foreground">{s.project_challenges?.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Student: <span className="text-foreground font-semibold">{s.application?.full_name || "Unknown User"}</span> ({s.application?.intern_id || "No Intern ID"}) · {s.application?.college || "No College"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {s.status === "pending" && (s.evaluated_at || s.evaluation || s.notes?.includes("Rejection")) ? (
                        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 font-bold border-0 text-xs px-2.5 py-1 animate-pulse flex items-center gap-1 shadow-xs">
                          <RefreshCw className="size-3" /> Resubmitted for Review 🔄
                        </Badge>
                      ) : (
                        <Badge className={`text-xs capitalize font-semibold ${
                          s.status === "approved" ? "bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400" :
                          s.status === "rejected" ? "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400" :
                          "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                        }`}>
                          {s.status}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Submission Links */}
                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 bg-muted/20 p-3 rounded-xl">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">GitHub Repository</span>
                      <a href={s.github_url} target="_blank" rel="noreferrer" className="text-xs text-[#07284a] dark:text-[#60a5fa] hover:underline font-medium inline-flex items-center gap-1 mt-1 truncate max-w-full">
                        <Github className="size-3.5" /> Repository <ArrowUpRight className="size-3" />
                      </a>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Live Demo URL</span>
                      {s.demo_url ? (
                        <a href={s.demo_url} target="_blank" rel="noreferrer" className="text-xs text-green-600 hover:underline font-medium inline-flex items-center gap-1 mt-1 truncate max-w-full">
                          <ExternalLink className="size-3.5" /> Live Demo <ArrowUpRight className="size-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground block mt-1">Not provided</span>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Documentation PDF</span>
                      {s.doc_url ? (
                        <a href={s.doc_url} target="_blank" rel="noreferrer" className="text-xs text-[#07284a] dark:text-[#60a5fa] hover:underline font-medium inline-flex items-center gap-1 mt-1 truncate max-w-full">
                          <FileText className="size-3.5" /> System PDF <ArrowUpRight className="size-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground block mt-1">Not provided</span>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Video Walkthrough</span>
                      {s.video_url ? (
                        <a href={s.video_url} target="_blank" rel="noreferrer" className="text-xs text-purple-600 hover:underline font-medium inline-flex items-center gap-1 mt-1 truncate max-w-full">
                          <Video className="size-3.5" /> Video Link <ArrowUpRight className="size-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground block mt-1">Not provided</span>
                      )}
                    </div>
                  </div>

                  {/* Submission Notes */}
                  {s.notes && (
                    <div className="bg-white/40 dark:bg-slate-900/40 p-3 rounded-xl border border-border/30 text-xs">
                      <span className="font-bold text-muted-foreground block mb-1">Student notes & context:</span>
                      <p className="whitespace-pre-line text-foreground/90">{s.notes}</p>
                    </div>
                  )}

                  {/* Grading Details & Certs (If Approved) */}
                  {s.status === "approved" && (
                    <div className="border-t border-border/10 pt-4 flex flex-wrap items-center justify-between gap-4">
                      {/* Evaluation score summary */}
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center font-bold text-sm border border-green-500/20">
                          {s.final_score}
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Final Grade</span>
                          <span className="text-xs font-semibold text-foreground">Graded out of 100</span>
                        </div>
                      </div>

                      {/* Certification Issuing Block */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Certificate */}
                        {hasCert ? (
                          <Button size="sm" variant="outline" onClick={() => handleDownloadCert(s)} className="rounded-xl text-xs gap-1 border-emerald-500/40 text-emerald-600 hover:bg-emerald-50/20">
                            <Download className="size-3.5" /> Completion Certificate
                          </Button>
                        ) : (
                          <Button size="sm" disabled={certLoading} onClick={() => handleIssueCertificate(s)} className="rounded-xl text-xs bg-emerald-600 text-white hover:bg-emerald-700 border-0">
                            {certLoading ? "Issuing..." : "Issue Certificate"}
                          </Button>
                        )}

                        {/* Award */}
                        {hasAward ? (
                          <Button size="sm" variant="outline" onClick={() => handleDownloadAward(s)} className="rounded-xl text-xs gap-1 border-amber-500/40 text-amber-600 hover:bg-amber-50/20">
                            <Download className="size-3.5" /> Performer Award
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => handleOpenAward(s)} className="rounded-xl text-xs bg-amber-500 text-white hover:bg-amber-600 border-0">
                            <Award className="size-3.5" /> Issue Performer Award
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions for Pending Submissions */}
                  {s.status === "pending" && (
                    <div className="flex items-center justify-end gap-2 border-t border-border/10 pt-4">
                      <Button size="sm" variant="outline" onClick={() => handleOpenReject(s)} className="rounded-xl text-xs text-rose-600 border-rose-500/30 hover:bg-rose-50/20">
                        <XCircle className="size-3.5 mr-1" /> Reject Submission
                      </Button>
                      <Button size="sm" onClick={() => handleOpenGrade(s)} className="rounded-xl text-xs bg-[#07284a] text-white hover:opacity-95 border-0">
                        <ShieldCheck className="size-3.5 mr-1" /> Grade & Approve
                      </Button>
                    </div>
                  )}

                  {/* Re-evaluation button for rejected */}
                  {s.status === "rejected" && (
                    <div className="flex items-center justify-end gap-2 border-t border-border/10 pt-4">
                      <Button size="sm" onClick={() => handleOpenGrade(s)} className="rounded-xl text-xs bg-slate-800 text-white hover:bg-slate-700 border-0">
                        <RefreshCw className="size-3.5 mr-1" /> Re-evaluate Submission
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── Grading Modal ─── */}
      {gradingSub && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border border-border/40 bg-white dark:bg-[#0F172A] p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col my-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-border/10 pb-3 shrink-0">
              <div>
                <h3 className="text-base font-bold">Grade & Evaluate Project</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{gradingSub.project_challenges?.title} · {gradingSub.application?.full_name}</p>
              </div>
              <button onClick={() => setGradingSub(null)} className="text-muted-foreground hover:text-foreground">
                <XCircle className="size-5" />
              </button>
            </div>

            {/* Criteria Form (Scrollable) */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              <div className="grid sm:grid-cols-2 gap-4">
                {EVALUATION_CRITERIA.map(c => (
                  <div key={c.key} className="space-y-1.5 bg-muted/20 p-3 rounded-2xl border border-border/20">
                    <Label className="text-xs font-semibold block">{c.label}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={scores[c.key] || ""}
                        onChange={(e) => {
                          const val = Math.min(10, Math.max(0, Number(e.target.value) || 0));
                          setScores(prev => ({ ...prev, [c.key]: val }));
                        }}
                        className="h-8 text-xs rounded-lg w-20 text-center font-bold"
                      />
                      <span className="text-xs text-muted-foreground">/ 10 marks</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Feedback & Notes for Student</Label>
                <Textarea
                  placeholder="Provide qualitative feedback, code remarks, or highlight improvements..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Footer Summary */}
            <div className="border-t border-border/10 pt-4 flex items-center justify-between gap-4 shrink-0">
              <div className="text-left">
                <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Calculated Grade</span>
                <span className="text-base font-extrabold text-green-600">
                  {((Object.values(scores).reduce((a, b) => a + b, 0) / 11) * 10).toFixed(1)}% / 100
                </span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-xl text-xs h-9" onClick={() => setGradingSub(null)}>Cancel</Button>
                <Button size="sm" disabled={submittingGrade} onClick={handleSubmitGrade} className="rounded-xl text-xs h-9 bg-green-600 hover:bg-green-700 text-white border-0">
                  {submittingGrade ? "Saving..." : "Approve & Submit Grade"}
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ─── Rejection Modal ─── */}
      {rejectingSub && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setRejectingSub(null)}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="w-full max-w-md rounded-2xl border border-border/40 bg-white dark:bg-[#0F172A] p-5 shadow-2xl animate-in zoom-in-95 my-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold">Reject Solution Submission</h3>
            <p className="text-xs text-muted-foreground mt-1">Specify why the solution is rejected (e.g. invalid repo, failed build, plagiarised code). This will allow them to submit again.</p>

            <div className="mt-4 space-y-2">
              <Label className="text-xs font-semibold">Reason for Rejection</Label>
              <Textarea
                placeholder="Write reasons to show student..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="text-xs rounded-xl"
              />
            </div>

            <div className="mt-5 flex gap-2 justify-end">
              <Button variant="outline" size="sm" className="rounded-xl text-xs h-9" onClick={() => setRejectingSub(null)}>Cancel</Button>
              <Button size="sm" disabled={submittingReject} onClick={handleSubmitReject} className="rounded-xl text-xs h-9 bg-rose-600 hover:bg-rose-700 text-white border-0">
                {submittingReject ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ─── Award Certificate Issuing Modal ─── */}
      {awardingSub && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setAwardingSub(null)}>
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-border/40 bg-white dark:bg-[#0F172A] p-5 shadow-2xl animate-in zoom-in-95 my-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-border/10 pb-2">
              <h3 className="text-sm font-bold">Issue Best Performer Award</h3>
              <button onClick={() => setAwardingSub(null)} className="text-muted-foreground hover:text-foreground">
                <XCircle className="size-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Award Category</Label>
                <select
                  value={awardCategory}
                  onChange={(e) => setAwardCategory(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border/50 bg-background px-3 py-2"
                >
                  {AWARD_CATEGORIES.map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Performance Rank Label</Label>
                <Input
                  placeholder="e.g. Top 5%, Top 1, Distinction"
                  value={awardRank}
                  onChange={(e) => setAwardRank(e.target.value)}
                  className="h-8 text-xs rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" className="rounded-xl text-xs h-8" onClick={() => setAwardingSub(null)}>Cancel</Button>
              <Button size="sm" disabled={submittingAward} onClick={handleSubmitAward} className="rounded-xl text-xs h-8 bg-amber-500 hover:bg-amber-600 text-white border-0">
                {submittingAward ? "Generating..." : "Generate & Issue Award"}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
