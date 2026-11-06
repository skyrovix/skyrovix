import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FileText,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Download,
  RefreshCw,
  Search,
  Filter,
  Crown,
  ChevronRight,
  Sliders,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Star,
  BookOpen,
  Briefcase,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  getAdminAdvancedDocsDataFn,
  saveStudentEvaluationFn,
  adminGenerateDocumentFn,
  adminReviewRequestFn,
  type AdvancedDocType,
  type AdvancedDocMetadata,
} from "@/lib/advanced-docs-service";
import {
  downloadAdvancedDocPdf,
  type AdvancedDocData,
} from "@/components/advanced-pdf-docs";

const DOC_DEFINITIONS: {
  type: AdvancedDocType;
  title: string;
  badge: string;
  ruleDesc: string;
  isPremiumOnly?: boolean;
}[] = [
  {
    type: "lor",
    title: "Letter of Recommendation (LOR)",
    badge: "Premium Track Exclusivity",
    ruleDesc: "Granted to ALL Premium scholars upon successful internship completion. Not available for Standard plan.",
    isPremiumOnly: true,
  },
  {
    type: "experience_letter",
    title: "Experience & Relieving Letter",
    badge: "High Performer",
    ruleDesc: "Available for High-Performing interns across both Standard and Premium tracks.",
  },
  {
    type: "project_certificate",
    title: "Project Completion Certificate",
    badge: "High Performer",
    ruleDesc: "Available for High-Performing interns upon successful completion and verification of capstone project.",
  },
  {
    type: "evaluation_report",
    title: "Performance Evaluation Report",
    badge: "High Performer",
    ruleDesc: "Detailed quantitative assessment across architecture, code quality, and problem-solving.",
  },
  {
    type: "appreciation_certificate",
    title: "Certificate of Appreciation",
    badge: "High Performer",
    ruleDesc: "Honors extraordinary dedication, rapid milestone completion, and engineering merit.",
  },
  {
    type: "skill_certificate",
    title: "Skill Achievement Certificate",
    badge: "High Performer",
    ruleDesc: "Validates technical mastery and verified practical examination score in full stack systems.",
  },
];

export function AdvancedDocumentsAdminSection() {
  const qc = useQueryClient();

  // Filters
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  // Modals state
  const [evaluatingStudent, setEvaluatingStudent] = useState<any | null>(null);
  const [managingStudent, setManagingStudent] = useState<any | null>(null);

  // Evaluation Form State
  const [isHighPerformer, setIsHighPerformer] = useState<boolean>(true);
  const [codeQuality, setCodeQuality] = useState<number>(9);
  const [technicalSkills, setTechnicalSkills] = useState<number>(9);
  const [problemSolving, setProblemSolving] = useState<number>(9);
  const [teamwork, setTeamwork] = useState<number>(9);
  const [projectPerformance, setProjectPerformance] = useState<number>(9);
  const [finalRating, setFinalRating] = useState<string>("A+ (Outstanding)");
  const [mentorRemarks, setMentorRemarks] = useState<string>("");

  // Custom Document Metadata inputs
  const [customProjectTitle, setCustomProjectTitle] = useState<string>("");
  const [customAppreciationReason, setCustomAppreciationReason] = useState<string>("");
  const [generatingDocType, setGeneratingDocType] = useState<string | null>(null);

  // Query Students
  const { data: students = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-advanced-documents", domainFilter, planFilter, search],
    queryFn: async () => {
      return (await getAdminAdvancedDocsDataFn({
        data: {
          domain: domainFilter === "all" ? undefined : domainFilter,
          plan: planFilter === "all" ? undefined : planFilter,
          search: search.trim() || undefined,
        },
      })) as any[];
    },
  });

  // Filter client-side for status
  const filteredStudents = students.filter((s: any) => {
    if (statusFilter === "completed") return s.isCompleted;
    if (statusFilter === "in_progress") return !s.isCompleted;
    if (statusFilter === "high_performer") return s.isHighPerformer;
    if (statusFilter === "has_requests") return s.requests?.some((r: any) => r.status === "pending");
    return true;
  });

  // Calculate Metrics
  const totalStudents = students.length;
  const completedCount = students.filter((s: any) => s.isCompleted).length;
  const highPerformerCount = students.filter((s: any) => s.isHighPerformer).length;
  const totalGeneratedDocs = students.reduce((acc: number, s: any) => acc + (s.generatedDocuments?.length || 0), 0);
  const pendingRequestsCount = students.reduce(
    (acc: number, s: any) => acc + (s.requests?.filter((r: any) => r.status === "pending").length || 0),
    0
  );

  // Mutations
  const evaluationMutation = useMutation({
    mutationFn: async () => {
      if (!evaluatingStudent) return;
      return saveStudentEvaluationFn({
        data: {
          applicationId: evaluatingStudent.id,
          isHighPerformer,
          codeQuality,
          technicalSkills,
          problemSolving,
          teamwork,
          projectPerformance,
          finalRating,
          mentorRemarks,
          evaluatedBy: "admin@skyrovix.com",
        },
      });
    },
    onSuccess: () => {
      toast.success("Student performance evaluation saved successfully!");
      setEvaluatingStudent(null);
      qc.invalidateQueries({ queryKey: ["admin-advanced-documents"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to save evaluation.");
    },
  });

  const generateDocMutation = useMutation({
    mutationFn: async ({
      student,
      docType,
      customMeta,
    }: {
      student: any;
      docType: AdvancedDocType;
      customMeta?: AdvancedDocMetadata;
    }) => {
      setGeneratingDocType(docType);
      return adminGenerateDocumentFn({
        data: {
          applicationId: student.id,
          documentType: docType,
          customMetadata: customMeta,
          generatedBy: "admin@skyrovix.com",
        },
      });
    },
    onSuccess: (data, vars) => {
      toast.success(`Successfully generated document ID: ${data.documentId}`);
      setGeneratingDocType(null);
      qc.invalidateQueries({ queryKey: ["admin-advanced-documents"] });
      // Update local managing student
      if (managingStudent) {
        refetch().then((res) => {
          if (res.data) {
            const updated = res.data.find((s: any) => s.id === managingStudent.id);
            if (updated) setManagingStudent(updated);
          }
        });
      }
    },
    onError: (err: any) => {
      setGeneratingDocType(null);
      toast.error(err?.message || "Document generation failed.");
    },
  });

  const reviewRequestMutation = useMutation({
    mutationFn: async ({
      requestId,
      status,
      adminNote,
    }: {
      requestId: string;
      status: "approved" | "rejected";
      adminNote?: string;
    }) => {
      return adminReviewRequestFn({
        data: {
          requestId,
          status,
          adminNote,
          reviewedBy: "admin@skyrovix.com",
        },
      });
    },
    onSuccess: (_data, vars) => {
      toast.success(`Request ${vars.status === "approved" ? "approved" : "rejected"} successfully.`);
      qc.invalidateQueries({ queryKey: ["admin-advanced-documents"] });
      if (managingStudent) {
        refetch().then((res) => {
          if (res.data) {
            const updated = res.data.find((s: any) => s.id === managingStudent.id);
            if (updated) setManagingStudent(updated);
          }
        });
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to review request.");
    },
  });

  // Open evaluation modal
  const handleOpenEvaluation = (student: any) => {
    setEvaluatingStudent(student);
    const existing = student.evaluation;
    if (existing) {
      setIsHighPerformer(existing.isHighPerformer);
      setCodeQuality(existing.codeQuality || 9);
      setTechnicalSkills(existing.technicalSkills || 9);
      setProblemSolving(existing.problemSolving || 9);
      setTeamwork(existing.teamwork || 9);
      setProjectPerformance(existing.projectPerformance || 9);
      setFinalRating(existing.finalRating || "A+ (Outstanding)");
      setMentorRemarks(existing.mentorRemarks || "");
    } else {
      setIsHighPerformer(true);
      setCodeQuality(9);
      setTechnicalSkills(9);
      setProblemSolving(9);
      setTeamwork(9);
      setProjectPerformance(9);
      setFinalRating("A+ (Outstanding)");
      setMentorRemarks("Candidate has demonstrated exceptional commitment, clean architecture delivery, and robust system design throughout their internship tenure.");
    }
  };

  // Open manage modal
  const handleOpenManageDocs = (student: any) => {
    setManagingStudent(student);
    setCustomProjectTitle("Enterprise Cloud Web Application with Scalable Microservices");
    setCustomAppreciationReason("demonstrating remarkable technical innovation, outstanding problem-solving capability, and exemplary commitment during the virtual internship program.");
  };

  // Direct PDF Download Handler
  const handleDownloadDoc = async (student: any, docRecord: any) => {
    try {
      toast.info(`Preparing ${docRecord.document_type.toUpperCase()} PDF download...`);
      const docData: AdvancedDocData = {
        documentId: docRecord.document_id,
        documentType: docRecord.document_type,
        fullName: student.fullName,
        internId: student.internId,
        domain: student.domain,
        domainName: student.domainName,
        planType: student.planType,
        durationMonths: student.durationMonths,
        issuedAt: docRecord.issue_date || new Date().toISOString(),
        verifyUrl: `https://skyrovix.in/verify/${docRecord.document_id}`,
        metadata: docRecord.metadata,
      };
      await downloadAdvancedDocPdf(docData);
      toast.success("Download started!");
    } catch (err: any) {
      toast.error("Download failed: " + err?.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-border/70 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#f95c4b]/10 text-[#f95c4b] mb-2">
            <Sparkles className="size-3.5" />
            Executive Document Engine
          </div>
          <h2 className="text-2xl font-black text-[#181619] tracking-tight">
            Advanced Internship Documents
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Admin verification, merit-based performance evaluation, and tamper-proof PDF generation for{" "}
            <span className="font-semibold text-foreground">Full Stack</span>,{" "}
            <span className="font-semibold text-foreground">MERN Stack</span>, and{" "}
            <span className="font-semibold text-foreground">MEAN Stack</span> internship scholars.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-xl border-border/80 h-9 px-3.5"
            disabled={isLoading}
          >
            <RefreshCw className={`size-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-border/70 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Eligible Scholars</span>
            <Briefcase className="size-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-[#181619]">{totalStudents}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Full Stack / MERN / MEAN</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-border/70 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed Interns</span>
            <CheckCircle2 className="size-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{completedCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">All tasks verified</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-border/70 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">High Performers</span>
            <Star className="size-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{highPerformerCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Admin-evaluated merit</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-border/70 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Docs Issued</span>
            <Award className="size-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-600">{totalGeneratedDocs}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Tamper-proof verifiable</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-border/70 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Requests</span>
            <Clock className="size-4 text-[#f95c4b]" />
          </div>
          <p className="text-2xl font-black text-[#f95c4b]">{pendingRequestsCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Awaiting admin review</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 p-4 rounded-2xl bg-white border border-border/70 shadow-xs">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student by name, intern ID, or email..."
            className="pl-9 h-10 rounded-xl bg-slate-50 border-border/60 text-xs"
          />
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-[180px] h-10 rounded-xl text-xs bg-slate-50 border-border/60">
              <SelectValue placeholder="Domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All 3 Domains</SelectItem>
              <SelectItem value="fullstack">Full Stack Development</SelectItem>
              <SelectItem value="mernstack">MERN Stack</SelectItem>
              <SelectItem value="meanstack">MEAN Stack</SelectItem>
            </SelectContent>
          </Select>

          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-[140px] h-10 rounded-xl text-xs bg-slate-50 border-border/60">
              <SelectValue placeholder="Plan Track" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="premium">Premium Only</SelectItem>
              <SelectItem value="standard">Standard Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] h-10 rounded-xl text-xs bg-slate-50 border-border/60">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed Interns</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="high_performer">High Performers Only</SelectItem>
              <SelectItem value="has_requests">Has Pending Requests</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Student Records Table */}
      <div className="rounded-3xl bg-white border border-border/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-border/60 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-4">Scholar Details</th>
                <th className="py-3.5 px-4">Domain & Track</th>
                <th className="py-3.5 px-4">Tasks & Progress</th>
                <th className="py-3.5 px-4">Performance Evaluation</th>
                <th className="py-3.5 px-4">Documents Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="size-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading eligible internship students...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <AlertCircle className="size-8 mx-auto mb-2 text-muted-foreground/40" />
                    No students match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s: any) => {
                  const pendingReqCount = s.requests?.filter((r: any) => r.status === "pending").length || 0;
                  const generatedCount = s.generatedDocuments?.length || 0;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Scholar Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-sm text-[#181619]">{s.fullName}</div>
                        <div className="font-mono text-[11px] font-bold text-[#f95c4b]">{s.internId}</div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">{s.email}</div>
                        {s.college && (
                          <div className="text-[10px] text-muted-foreground/80 truncate max-w-[200px] mt-0.5">
                            {s.college}
                          </div>
                        )}
                      </td>

                      {/* Domain & Track */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground">{s.domainName}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {s.durationMonths} Month{s.durationMonths > 1 ? "s" : ""}
                        </div>
                        <div className="mt-1">
                          {s.planType === "premium" ? (
                            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-bold py-0.5">
                              <Crown className="size-3 mr-1 text-amber-500" /> Premium Track
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] font-semibold py-0.5">
                              Standard Track
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Tasks Progress */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">
                            {s.approvedTasks} / {s.totalTasks}
                          </span>
                          {s.isCompleted ? (
                            <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                              Completed ✓
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                              In Progress
                            </Badge>
                          )}
                        </div>
                        <div className="w-28 h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              s.isCompleted ? "bg-emerald-500" : "bg-[#f95c4b]"
                            }`}
                            style={{
                              width: `${Math.min(100, (s.approvedTasks / (s.totalTasks || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </td>

                      {/* Performance Evaluation */}
                      <td className="py-3.5 px-4">
                        {s.evaluation ? (
                          <div className="space-y-1">
                            {s.evaluation.isHighPerformer ? (
                              <Badge className="bg-amber-500/20 text-amber-800 border border-amber-500/40 text-[10px] font-black">
                                <Star className="size-3 mr-1 fill-amber-500 text-amber-500" />
                                High Performer
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px]">
                                Standard Rating
                              </Badge>
                            )}
                            <div className="text-[11px] font-semibold text-foreground">
                              Grade: {s.evaluation.finalRating}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                              "{s.evaluation.mentorRemarks || "Evaluated"}"
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Badge variant="outline" className="text-[10px] text-muted-foreground border-dashed">
                              Not Evaluated Yet
                            </Badge>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Click Evaluate to grant merit eligibility
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Documents Status */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-foreground">{generatedCount}</span>
                            <span className="text-muted-foreground">/ 6 Issued</span>
                          </div>
                          {pendingReqCount > 0 && (
                            <Badge className="bg-[#f95c4b] text-white text-[10px] font-bold animate-pulse">
                              {pendingReqCount} Request{pendingReqCount > 1 ? "s" : ""} Pending
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEvaluation(s)}
                            className="rounded-xl h-8 px-2.5 text-xs font-semibold border-border/80"
                          >
                            <Sliders className="size-3.5 mr-1 text-primary" />
                            Evaluate
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => handleOpenManageDocs(s)}
                            className="rounded-xl h-8 px-3 text-xs font-bold brand-gradient text-white shadow-xs"
                          >
                            <FileText className="size-3.5 mr-1" />
                            Manage Docs
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* EVALUATION MODAL */}
      {/* ==================================================================== */}
      <Dialog open={!!evaluatingStudent} onOpenChange={(open) => !open && setEvaluatingStudent(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-[#181619] flex items-center gap-2">
              <Sliders className="size-5 text-[#f95c4b]" />
              Student Performance Evaluation
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define the candidate's quantitative competencies, high-performer eligibility, and official mentor feedback.
            </DialogDescription>
          </DialogHeader>

          {evaluatingStudent && (
            <div className="space-y-5 pt-3">
              {/* Scholar Snapshot */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-border/60 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-[#181619]">{evaluatingStudent.fullName}</p>
                  <p className="text-xs font-mono text-primary font-bold">{evaluatingStudent.internId}</p>
                  <p className="text-[11px] text-muted-foreground">{evaluatingStudent.domainName}</p>
                </div>
                <div className="text-right">
                  <Badge className={evaluatingStudent.planType === "premium" ? "bg-amber-500/20 text-amber-800" : "bg-slate-200 text-slate-800"}>
                    {evaluatingStudent.planType === "premium" ? "Premium Track" : "Standard Track"}
                  </Badge>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Tasks: {evaluatingStudent.approvedTasks}/{evaluatingStudent.totalTasks} Approved
                  </p>
                </div>
              </div>

              {/* High Performer Switch */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-amber-300/60 bg-amber-50/50">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                    <Star className="size-4 text-amber-500 fill-amber-500" />
                    High-Performer Eligibility
                  </Label>
                  <p className="text-xs text-amber-800/80">
                    Enables Experience Letter, Project Cert, Performance Report, Appreciation Cert, and Skill Cert.
                  </p>
                </div>
                <Switch
                  checked={isHighPerformer}
                  onCheckedChange={setIsHighPerformer}
                  className="data-[state=checked]:bg-amber-500"
                />
              </div>

              {/* Competency Ratings 1-10 */}
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Quantitative Ratings (Out of 10)
                </Label>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Code Quality & Architecture</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      step={0.1}
                      value={codeQuality}
                      onChange={(e) => setCodeQuality(Number(e.target.value))}
                      className="h-9 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Technical Skill Mastery</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      step={0.1}
                      value={technicalSkills}
                      onChange={(e) => setTechnicalSkills(Number(e.target.value))}
                      className="h-9 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Problem Solving & Debugging</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      step={0.1}
                      value={problemSolving}
                      onChange={(e) => setProblemSolving(Number(e.target.value))}
                      className="h-9 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Project Execution & Delivery</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      step={0.1}
                      value={projectPerformance}
                      onChange={(e) => setProjectPerformance(Number(e.target.value))}
                      className="h-9 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs font-semibold">Communication & Teamwork</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      step={0.1}
                      value={teamwork}
                      onChange={(e) => setTeamwork(Number(e.target.value))}
                      className="h-9 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Final Rating & Classification */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Final Cumulative Grade
                </Label>
                <Select value={finalRating} onValueChange={setFinalRating}>
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+ (Outstanding)">A+ (Outstanding — Top 5%)</SelectItem>
                    <SelectItem value="A (Excellent)">A (Excellent — High Merit)</SelectItem>
                    <SelectItem value="B+ (Very Good)">B+ (Very Good)</SelectItem>
                    <SelectItem value="B (Good)">B (Good)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mentor Remarks */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Mentor Remarks & Endorsement
                </Label>
                <Textarea
                  value={mentorRemarks}
                  onChange={(e) => setMentorRemarks(e.target.value)}
                  rows={3}
                  placeholder="Provide personalized qualitative feedback highlighting student contributions..."
                  className="rounded-xl text-xs"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => setEvaluatingStudent(null)}
                  className="rounded-xl h-10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => evaluationMutation.mutate()}
                  disabled={evaluationMutation.isPending}
                  className="rounded-xl h-10 brand-gradient text-white font-bold"
                >
                  {evaluationMutation.isPending ? "Saving Evaluation..." : "Save Evaluation"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ==================================================================== */}
      {/* MANAGE DOCUMENTS MODAL */}
      {/* ==================================================================== */}
      <Dialog open={!!managingStudent} onOpenChange={(open) => !open && setManagingStudent(null)}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-[#181619] flex items-center gap-2">
              <Award className="size-5 text-[#f95c4b]" />
              Manage Advanced Documents
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Review requests, approve generation, and download tamper-proof official PDF credentials.
            </DialogDescription>
          </DialogHeader>

          {managingStudent && (
            <div className="space-y-5 pt-3">
              {/* Scholar Header */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-extrabold text-base text-[#181619]">{managingStudent.fullName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs font-bold text-primary">{managingStudent.internId}</span>
                    <span className="text-muted-foreground text-xs">•</span>
                    <span className="text-xs text-muted-foreground">{managingStudent.domainName}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={managingStudent.planType === "premium" ? "bg-amber-500/20 text-amber-800" : "bg-slate-200 text-slate-800"}>
                    {managingStudent.planType === "premium" ? "Premium Track" : "Standard Track"}
                  </Badge>
                  {managingStudent.isCompleted ? (
                    <Badge className="bg-emerald-600 text-white">Internship Completed ✓</Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600 border-amber-300">
                      In Progress ({managingStudent.approvedTasks}/{managingStudent.totalTasks})
                    </Badge>
                  )}
                  {managingStudent.isHighPerformer && (
                    <Badge className="bg-amber-500 text-white font-bold">
                      <Star className="size-3 mr-1 fill-white" /> High Performer
                    </Badge>
                  )}
                </div>
              </div>

              {/* 6 Documents Grid */}
              <div className="space-y-3.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Document Issuance Portfolio (6 Credentials)
                </h5>

                <div className="space-y-3">
                  {DOC_DEFINITIONS.map((def) => {
                    const generatedDoc = managingStudent.generatedDocuments?.find(
                      (d: any) => d.document_type === def.type
                    );
                    const pendingReq = managingStudent.requests?.find(
                      (r: any) => r.document_type === def.type && r.status === "pending"
                    );

                    // Check eligibility
                    let canGenerate = false;
                    let blockReason = "";

                    if (!managingStudent.isCompleted) {
                      blockReason = "Internship not completed yet. All tasks must be approved.";
                    } else if (def.type === "lor") {
                      if (managingStudent.planType !== "premium") {
                        blockReason = "Standard plan students are not eligible for LOR (Premium policy).";
                      } else {
                        canGenerate = true;
                      }
                    } else {
                      if (!managingStudent.isHighPerformer) {
                        blockReason = "High-Performer eligibility not granted yet. Use 'Evaluate' to approve.";
                      } else {
                        canGenerate = true;
                      }
                    }

                    return (
                      <div
                        key={def.type}
                        className={`p-4 rounded-2xl border transition-all ${
                          generatedDoc
                            ? "bg-emerald-50/40 border-emerald-300/70"
                            : pendingReq
                            ? "bg-amber-50/50 border-amber-300/70"
                            : canGenerate
                            ? "bg-white border-border/70 hover:border-primary/40"
                            : "bg-slate-50/60 border-dashed border-border/60 opacity-80"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-sm text-[#181619]">{def.title}</span>
                              <Badge variant="outline" className="text-[10px] text-muted-foreground font-semibold">
                                {def.badge}
                              </Badge>
                              {generatedDoc && (
                                <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                                  Generated ✓ ({generatedDoc.document_id})
                                </Badge>
                              )}
                              {pendingReq && (
                                <Badge className="bg-[#f95c4b] text-white text-[10px] font-bold animate-pulse">
                                  Student Requested
                                </Badge>
                              )}
                            </div>

                            <p className="text-xs text-muted-foreground mt-1">{def.ruleDesc}</p>

                            {/* Pending Request Details */}
                            {pendingReq && (
                              <div className="mt-2 p-2.5 rounded-xl bg-amber-100/60 border border-amber-300/70 text-xs">
                                <p className="font-bold text-amber-900">Student Request Note:</p>
                                <p className="text-amber-800 mt-0.5">
                                  "{pendingReq.student_note || "No custom note provided."}"
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      reviewRequestMutation.mutate({
                                        requestId: pendingReq.id,
                                        status: "approved",
                                      })
                                    }
                                    disabled={reviewRequestMutation.isPending}
                                    className="h-7 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                                  >
                                    Approve & Issue
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      reviewRequestMutation.mutate({
                                        requestId: pendingReq.id,
                                        status: "rejected",
                                        adminNote: "Eligibility criteria not fulfilled.",
                                      })
                                    }
                                    disabled={reviewRequestMutation.isPending}
                                    className="h-7 rounded-lg text-xs text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Blocking Reason notice */}
                            {!canGenerate && !generatedDoc && (
                              <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700">
                                <AlertCircle className="size-3.5 shrink-0" />
                                <span>{blockReason}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                            {generatedDoc && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadDoc(managingStudent, generatedDoc)}
                                className="rounded-xl h-8 px-3 text-xs font-semibold border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                              >
                                <Download className="size-3.5 mr-1" />
                                Download PDF
                              </Button>
                            )}

                            {canGenerate && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  generateDocMutation.mutate({
                                    student: managingStudent,
                                    docType: def.type,
                                    customMeta: {
                                      projectTitle: customProjectTitle || undefined,
                                      appreciationReason: customAppreciationReason || undefined,
                                    },
                                  })
                                }
                                disabled={generatingDocType === def.type || generateDocMutation.isPending}
                                className={`rounded-xl h-8 px-3 text-xs font-bold ${
                                  generatedDoc
                                    ? "bg-slate-800 hover:bg-slate-900 text-white"
                                    : "brand-gradient text-white shadow-xs"
                                }`}
                              >
                                <RefreshCw
                                  className={`size-3.5 mr-1 ${
                                    generatingDocType === def.type ? "animate-spin" : ""
                                  }`}
                                />
                                {generatedDoc ? "Regenerate" : "Generate"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <DialogFooter className="pt-2 border-t border-border/50">
                <Button
                  variant="outline"
                  onClick={() => setManagingStudent(null)}
                  className="rounded-xl h-10"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
