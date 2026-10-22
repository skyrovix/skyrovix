import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/db-client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectCompletionCert, ProjectAwardCert, downloadPdf } from "@/components/project-pdf-docs";
import {
  Calendar, Briefcase, Code, CheckCircle2, AlertCircle, Award,
  ArrowLeft, ArrowRight, FileText, BarChart3, Database, ShieldAlert, Sparkles, ExternalLink, Download, Clock, Loader2
} from "lucide-react";
import { FadeUp } from "@/components/motion";
import { getPublicSiteUrl } from "@/lib/constants";

// Local fallback challenge if not in database
const LOCAL_PROJECT_MAP: Record<string, any> = {
  "proj1-fallback": {
    id: "proj1-fallback",
    project_id: "PRJ-2026-001",
    title: "Smart Inventory Management System",
    industry: "Retail & E-Commerce",
    difficulty: "intermediate",
    business_background: "A mid-sized retail chain with 50+ stores struggles with manual inventory tracking. Stockouts cost ₹2Cr/month in lost revenue, and excess inventory ties up ₹5Cr in working capital. They need a real-time system.",
    problem_statement: "Develop a secure web application that tracks inventory levels, predicts reorder points based on historical usage, and provides a clear alert system for managers when stock drops below thresholds.",
    business_requirements: [
      "Real-time tracking of stock levels across multiple simulated branches.",
      "Automated computation of safety stock levels and alert triggers.",
      "Optimized order requests generation based on lead times.",
      "User role authorization: Branch Staff, Manager, Regional Admin."
    ],
    functional_requirements: [
      "Display dynamic search and sorting of stock items.",
      "Provide a clean CRUD portal for inventory entries.",
      "Trigger browser push notifications for low items.",
      "Generate monthly replenishment CSV/PDF reports."
    ],
    technical_requirements: [
      "Use React/Next.js for the UI and components.",
      "Database schema with proper primary and foreign keys.",
      "Implement rate-limiting and query optimization.",
      "Secure API routes with JWT or session auth."
    ],
    expected_deliverables: [
      "GitHub link with clear structured directories.",
      "A live hosting demo link (Vercel, Netlify, Render).",
      "PDF system design documentation upload.",
      "2-minute video presentation showing system flows."
    ],
    evaluation_criteria: [
      "Architecture clarity & design patterns.",
      "Functionality of safety stock alerts.",
      "Query speed and index optimizations.",
      "Documentation coverage."
    ],
    technologies: ["React", "TypeScript", "Node.js", "PostgreSQL", "Redis"],
    submission_deadline: "2026-09-30T23:59:59Z",
    resources: [{ name: "Database Schema Draft", url: "#" }, { name: "System Design Guide", url: "#" }]
  }
};

export const Route = createFileRoute("/_navbar-layout/projects/$id")({
  head: ({ match }) => {
    const id = match.params.id;
    return {
      meta: [
        { title: `Project Challenge Details | Skyrovix` },
        { name: "description", content: "Apply for a real-world developer project challenge. Complete requirements and earn a verified certification." },
      ],
    };
  },
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("requirements");

  // 1. Fetch challenge details
  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ["project-challenge", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("project_challenges")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data || LOCAL_PROJECT_MAP[id] || LOCAL_PROJECT_MAP["proj1-fallback"];
    }
  });

  // 2. Fetch user submission/application status
  const { data: submission, isLoading: isSubLoading } = useQuery({
    queryKey: ["project-submission", project?.id, user?.id],
    enabled: !!project?.id && !!user?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("project_submissions")
        .select("*")
        .eq("project_id", project!.id)
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    }
  });

  // 3. Fetch evaluations score metrics if approved
  const { data: evaluation } = useQuery({
    queryKey: ["project-evaluation", submission?.id],
    enabled: !!submission?.id && submission.status === "approved",
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("project_evaluations")
        .select("*")
        .eq("submission_id", submission!.id)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    }
  });

  // 4. Fetch certificate details
  const { data: certificate } = useQuery({
    queryKey: ["project-cert", submission?.id],
    enabled: !!submission?.id && submission.status === "approved",
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("project_certificates")
        .select("*")
        .eq("submission_id", submission!.id)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    }
  });

  // 5. Fetch best performer award details
  const { data: award } = useQuery({
    queryKey: ["project-award", submission?.id],
    enabled: !!submission?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("project_awards")
        .select("*")
        .eq("submission_id", submission!.id)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    }
  });

  // Apply Mutation: Inserts placeholder to pass the NOT NULL constraint
  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Authentication required");
      const { data, error } = await (supabase as any)
        .from("project_submissions")
        .insert({
          project_id: project.id,
          user_id: user.id,
          github_url: "pending_submission",
          status: "pending",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Applied for the project challenge successfully!");
      queryClient.invalidateQueries({ queryKey: ["project-submission", project?.id, user?.id] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to apply");
    }
  });

  const handleApply = () => {
    if (!user) {
      toast.info("Please sign in to apply for the challenge.");
      navigate({ to: "/auth", search: { redirect: `/projects/${id}` } });
      return;
    }
    applyMutation.mutate();
  };

  const handleDownloadCert = async () => {
    if (!certificate) return toast.error("Certificate detail not available.");
    const verifyUrl = `${getPublicSiteUrl()}/verify-certificate?cert=${certificate.cert_id}`;

    toast.info("Generating project completion certificate PDF...");
    await downloadPdf(
      <ProjectCompletionCert
        participantName={certificate.participant_name}
        projectId={project!.project_id}
        projectTitle={certificate.project_title}
        industry={certificate.industry}
        technologies={certificate.technologies}
        finalScore={Number(certificate.final_score)}
        certId={certificate.cert_id}
        completionDate={certificate.completion_date}
        evaluationUrl={verifyUrl}
      />,
      `Project_Certificate_${certificate.cert_id}.pdf`
    );
  };

  const handleDownloadAward = async () => {
    if (!award) return toast.error("Award detail not available.");
    const verifyUrl = `${getPublicSiteUrl()}/verify-certificate?cert=${award.award_id}`;

    toast.info("Generating project award certificate PDF...");
    await downloadPdf(
      <ProjectAwardCert
        participantName={award.participant_name}
        projectTitle={award.project_title}
        rank={award.rank}
        finalScore={Number(award.final_score)}
        awardCategory={award.award_category}
        certId={award.award_id}
        issueDate={award.issue_date}
        evaluationUrl={verifyUrl}
      />,
      `Project_Award_${award.award_id}.pdf`
    );
  };

  if (isProjectLoading || isSubLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="size-8 animate-spin text-blue-500" />
        <p className="text-sm text-muted-foreground">Loading challenge details...</p>
      </div>
    );
  }

  if (!project) return null;

  const isApplied = !!submission;
  const isSubmitted = isApplied && submission.github_url !== "pending_submission";
  const deadlineDate = project.submission_deadline
    ? new Date(project.submission_deadline).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
    : "Open Enrollment";

  // Difficulty color styling
  const diff = project.difficulty.toLowerCase();
  const diffCol =
    diff === "beginner"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20"
      : diff === "intermediate"
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20"
      : diff === "advanced"
      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20"
      : "bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-purple-500/20";

  return (
    <div className="w-full min-h-screen bg-background text-foreground pb-24">
      {/* ─── Hero Header ─── */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-16 lg:py-20 border-b border-border/20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/80 to-[#07284a]/50 mix-blend-multiply" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid lg:grid-cols-[1.3fr_0.7fr] gap-8 items-center">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-blue-500 text-white rounded-lg text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 border-0">
                {project.project_id}
              </Badge>
              <Badge className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${diffCol}`}>
                {project.difficulty}
              </Badge>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {project.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-350 font-semibold">
              <span className="flex items-center gap-1.5">
                <Briefcase className="size-4 text-blue-400" />
                {project.industry}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4 text-blue-400" />
                Deadline: {deadlineDate}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Details Grid ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid lg:grid-cols-[1.4fr_0.6fr] gap-8">
        
        {/* Left Info Panel */}
        <div className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 max-w-md bg-muted rounded-xl h-10 p-1">
              <TabsTrigger value="requirements" className="rounded-lg text-xs font-semibold">Requirements</TabsTrigger>
              <TabsTrigger value="brief" className="rounded-lg text-xs font-semibold">Business Case</TabsTrigger>
              <TabsTrigger value="evaluation" className="rounded-lg text-xs font-semibold">Criteria</TabsTrigger>
            </TabsList>

            {/* Requirements Checklist */}
            <TabsContent value="requirements" className="mt-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" /> Business Rules & Scope
                </h3>
                <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed pl-5 list-disc">
                  {project.business_requirements.map((req: string, idx: number) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Database className="size-4 text-[#f95c4b]" /> Technical Scope & Stack
                </h3>
                <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed pl-5 list-disc">
                  {project.technical_requirements.map((req: string, idx: number) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <FileText className="size-4 text-[#f95c4b]" /> Expected Deliverables
                </h3>
                <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed pl-5 list-disc">
                  {project.expected_deliverables.map((req: string, idx: number) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            {/* Brief Background */}
            <TabsContent value="brief" className="mt-6 space-y-6">
              <div className="space-y-3">
                <h3 className="text-base font-bold text-foreground">Business Background</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{project.business_background}</p>
              </div>

              <div className="space-y-3 pt-3">
                <h3 className="text-base font-bold text-foreground">Problem Statement</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{project.problem_statement}</p>
              </div>
            </TabsContent>

            {/* Evaluation Criteria */}
            <TabsContent value="evaluation" className="mt-6 space-y-4">
              <h3 className="text-base font-bold text-foreground">How We Evaluate</h3>
              <p className="text-xs text-muted-foreground">Solutions are graded across 11 key industry standards. Requirements checklist highlights:</p>
              <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed pl-5 list-disc">
                {project.evaluation_criteria.map((cri: string, idx: number) => (
                  <li key={idx}>{cri}</li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>

          {/* Submission and Scoring Breakdown Panel */}
          {isSubmitted && (
            <Card className="border border-border/50 bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur shadow rounded-2xl">
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-border/20">
                  <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                    <BarChart3 className="size-4 text-[#f95c4b]" /> Grading & Evaluation Details
                  </h3>
                  <Badge className={`rounded-xl px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                    submission.status === "approved"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0"
                      : submission.status === "rejected"
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-0"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0"
                  }`}>
                    {submission.status === "approved" ? "Approved ✓" : submission.status === "rejected" ? "Changes Requested" : "Under Evaluation"}
                  </Badge>
                </div>

                {submission.status === "approved" && evaluation ? (
                  <div className="space-y-6">
                    {/* Score Ring */}
                    <div className="grid grid-cols-[1fr_2fr] gap-6 items-center">
                      <div className="size-20 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex flex-col items-center justify-center border border-blue-500/20">
                        <span className="text-2xl font-extrabold">{Number(evaluation.total).toFixed(0)}</span>
                        <span className="text-[10px] text-muted-foreground font-semibold">/100</span>
                      </div>
                      <div className="text-xs space-y-1">
                        <p className="font-bold text-foreground">Outstanding Submission</p>
                        <p className="text-muted-foreground leading-relaxed">Evaluated: {new Date(submission.evaluated_at || "").toLocaleDateString("en-IN")}</p>
                      </div>
                    </div>

                    {/* Breakdown Slider bars */}
                    <div className="grid sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>Problem Solving</span>
                          <span>{evaluation.problem_solving}/10</span>
                        </div>
                        <Progress value={Number(evaluation.problem_solving) * 10} className="h-1" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>Code Quality</span>
                          <span>{evaluation.code_quality}/10</span>
                        </div>
                        <Progress value={Number(evaluation.code_quality) * 10} className="h-1" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>UI/UX Design</span>
                          <span>{evaluation.ui_ux_design}/10</span>
                        </div>
                        <Progress value={Number(evaluation.ui_ux_design) * 10} className="h-1" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>Documentation</span>
                          <span>{evaluation.documentation}/10</span>
                        </div>
                        <Progress value={Number(evaluation.documentation) * 10} className="h-1" />
                      </div>
                    </div>

                    {/* Evaluator Comments */}
                    {evaluation.feedback && (
                      <div className="p-4 rounded-xl bg-muted/30 border border-border/30 text-xs space-y-1.5">
                        <h4 className="font-bold text-foreground">Evaluator Feedback</h4>
                        <p className="text-muted-foreground leading-relaxed">{evaluation.feedback}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
                    <Clock className="size-10 text-muted-foreground/35 mx-auto animate-pulse" />
                    <p className="font-semibold">Review Pending</p>
                    <p className="max-w-xs mx-auto text-[10px]">Your solution has been submitted. Our industry reviewers will evaluate your codebase and update scorecard metrics within 48 hours.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right Sticky Sidebar */}
        <div className="relative">
          <div className="sticky top-24 space-y-6">
            <Card className="overflow-hidden border border-border/50 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md shadow-xl rounded-2xl">
              <CardContent className="p-6 space-y-6">
                
                {/* Apply State Button */}
                {!isApplied ? (
                  <div className="space-y-4 text-center">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Apply for the project challenge first to activate requirements tracking and solution uploads.
                    </p>
                    <Button
                      onClick={handleApply}
                      disabled={applyMutation.isPending}
                      className="w-full rounded-xl text-xs h-11 brand-gradient text-white border-0 font-semibold hover:opacity-95 shadow-md"
                    >
                      {applyMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        "Apply for Challenge"
                      )}
                    </Button>
                  </div>
                ) : !isSubmitted ? (
                  <div className="space-y-4 text-center">
                    <div className="rounded-xl bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 p-3.5 text-xs text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="size-4" /> Application Confirmed
                    </div>
                    <Button
                      asChild
                      className="w-full rounded-xl text-xs h-11 brand-gradient text-white border-0 font-semibold hover:opacity-95 shadow-md gap-1"
                    >
                      <Link to="/projects/$id/submit" params={{ id: project.id }}>
                        Submit Solution <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-blue-500/5 text-blue-600 dark:text-blue-400 border border-blue-500/20 p-3.5 text-xs text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="size-4" /> Solution Uploaded
                    </div>
                    
                    {submission.status === "approved" && (
                      <div className="space-y-2">
                        {certificate && (
                          <Button
                            onClick={handleDownloadCert}
                            className="w-full rounded-xl text-xs h-10 brand-gradient text-white border-0 font-semibold hover:opacity-95 shadow-md gap-1.5"
                          >
                            <Download className="size-4" /> Completion Certificate
                          </Button>
                        )}
                        {award && (
                          <Button
                            onClick={handleDownloadAward}
                            className="w-full rounded-xl text-xs h-10 bg-amber-500 text-white hover:bg-amber-600 border-0 font-semibold hover:opacity-95 shadow-md gap-1.5"
                          >
                            <Award className="size-4" /> Performer Award
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Sidebar details */}
                <div className="space-y-3 text-xs pt-2 border-t border-border/20">
                  <h4 className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">Project Metadata</h4>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-muted-foreground">Difficulty</span>
                    <span className="font-semibold capitalize text-foreground">{project.difficulty}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-muted-foreground">Deadline</span>
                    <span className="font-semibold text-foreground">{deadlineDate}</span>
                  </div>
                </div>

                {/* Technologies List */}
                <div className="space-y-3 pt-4 border-t border-border/20">
                  <h4 className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">Stack Requirements</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.map((tech: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="bg-muted text-muted-foreground border-0 text-[10px] font-medium">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* References resources */}
                {project.resources && Array.isArray(project.resources) && project.resources.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-border/20">
                    <h4 className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">Resources & Docs</h4>
                    <div className="space-y-2">
                      {project.resources.map((res: any, idx: number) => (
                        <a
                          key={idx}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between text-xs text-[#f95c4b] dark:text-[#ee9590] hover:underline"
                        >
                          <span className="truncate pr-2 font-medium">{res.name}</span>
                          <ExternalLink className="size-3 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
