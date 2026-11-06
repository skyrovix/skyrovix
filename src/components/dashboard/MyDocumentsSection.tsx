import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FileText,
  Award,
  CheckCircle2,
  Lock,
  Clock,
  Sparkles,
  Download,
  AlertCircle,
  XCircle,
  Star,
  ShieldCheck,
  Crown,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Briefcase,
  Layers,
  Send,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  getStudentAdvancedDocsFn,
  studentRequestDocumentFn,
  type AdvancedDocType,
  type StudentAdvancedDocsSummary,
  type DocumentItemStatus,
} from "@/lib/advanced-docs-service";
import {
  downloadAdvancedDocPdf,
  type AdvancedDocData,
} from "@/components/advanced-pdf-docs";
import { AdvancedDocPreviewDialog } from "@/components/AdvancedDocPreviewDialog";

interface MyDocumentsSectionProps {
  app: any;
  user: any;
  onNavigateToTasks?: () => void;
  onUpgradeToPremium?: () => void;
}

export function MyDocumentsSection({
  app,
  user,
  onNavigateToTasks,
  onUpgradeToPremium,
}: MyDocumentsSectionProps) {
  const qc = useQueryClient();
  const [requestingDoc, setRequestingDoc] = useState<DocumentItemStatus | null>(null);
  const [studentNote, setStudentNote] = useState<string>("");
  const [downloadingType, setDownloadingType] = useState<string | null>(null);
  const [previewDocData, setPreviewDocData] = useState<AdvancedDocData | null>(null);

  // Fetch student advanced documents summary
  const { data: summary, isLoading, refetch } = useQuery({
    queryKey: ["student-advanced-documents", app?.id],
    enabled: !!app?.id,
    queryFn: async () => {
      return (await getStudentAdvancedDocsFn({
        data: {
          applicationId: app.id,
          userId: user?.id,
        },
      })) as StudentAdvancedDocsSummary | { isDomainSupported: false; reason: string };
    },
  });

  // Request Document Mutation
  const requestMutation = useMutation({
    mutationFn: async () => {
      if (!requestingDoc || !app?.id) return;
      return studentRequestDocumentFn({
        data: {
          applicationId: app.id,
          userId: user?.id || app.user_id,
          documentType: requestingDoc.documentType,
          studentNote: studentNote.trim() || undefined,
        },
      });
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Document request submitted for mentor review.");
      setRequestingDoc(null);
      setStudentNote("");
      qc.invalidateQueries({ queryKey: ["student-advanced-documents", app?.id] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to submit document request.");
    },
  });

  // Client-Side PDF Download
  const handleDownload = async (docItem: DocumentItemStatus) => {
    if (!docItem.documentRecord) return;
    try {
      setDownloadingType(docItem.documentType);
      toast.info(`Preparing ${docItem.title} download...`);

      const docData: AdvancedDocData = {
        documentId: docItem.documentRecord.document_id,
        documentType: docItem.documentType,
        fullName: app.full_name || "Scholar",
        internId: app.intern_id || "SKX-INTERN",
        domain: app.domain || "fullstack",
        domainName: (summary as any)?.domainName || "Full Stack Development",
        planType: app.plan_type === "premium" ? "premium" : "standard",
        durationMonths: Number(app.duration) || 1,
        issuedAt: docItem.documentRecord.issue_date || new Date().toISOString(),
        verifyUrl: `https://skyrovix.in/verify/${docItem.documentRecord.document_id}`,
        metadata: docItem.documentRecord.metadata,
      };

      await downloadAdvancedDocPdf(docData);
      toast.success("Download started!");
    } catch (err: any) {
      toast.error("Download failed: " + err?.message);
    } finally {
      setDownloadingType(null);
    }
  };

  // 1. If no application is active
  if (!app) {
    return (
      <div className="rounded-3xl border border-dashed border-border/60 bg-white/50 p-12 text-center backdrop-blur-sm">
        <Briefcase className="size-12 mx-auto mb-3 text-muted-foreground/40" />
        <h3 className="text-base font-bold text-[#181619]">No Active Internship Selected</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Please select an active internship application to view your document portfolio.
        </p>
      </div>
    );
  }

  // 2. Loading state
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-border/60 bg-white p-12 text-center shadow-xs">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-muted-foreground">Loading your credential portfolio...</p>
      </div>
    );
  }

  // 3. Domain Not Supported Screen
  if (summary && !summary.isDomainSupported) {
    return (
      <div className="space-y-6">
        <div className="p-8 rounded-3xl bg-white border border-border/70 shadow-sm text-center max-w-2xl mx-auto space-y-4">
          <div className="size-14 rounded-2xl bg-amber-500/10 text-amber-600 grid place-items-center mx-auto">
            <Layers className="size-7" />
          </div>
          <div>
            <Badge variant="outline" className="text-amber-700 border-amber-300 text-xs font-bold mb-2">
              Domain Specific Feature
            </Badge>
            <h3 className="text-xl font-black text-[#181619]">
              Advanced Internship Documents
            </h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {(summary as any).reason ||
                "Advanced Internship Documents are exclusively available for Full Stack, MERN Stack, and MEAN Stack Development domains."}
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateToTasks}
              className="rounded-2xl h-10 px-5 text-xs font-bold"
            >
              Go to My Tasks
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const s = summary as StudentAdvancedDocsSummary;
  const isPremium = s?.planType === "premium";

  return (
    <div className="space-y-6">
      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-white via-white/90 to-[#f95c4b]/5 p-6 sm:p-8 shadow-sm">
        <div className="absolute -right-20 -top-20 size-56 rounded-full bg-[#f95c4b]/10 blur-[80px] pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="px-3 py-1 rounded-full text-xs font-bold border border-[#f95c4b]/20 bg-[#f95c4b]/10 text-[#f95c4b] shadow-none">
                <Sparkles className="size-3 mr-1" />
                Internship Credential Portfolio
              </Badge>

              {isPremium ? (
                <Badge className="bg-amber-500/15 text-amber-700 border border-amber-500/30 text-xs font-black">
                  <Crown className="size-3 mr-1 text-amber-500" /> Premium Track Scholar
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs font-bold">
                  Standard Track
                </Badge>
              )}

              {s?.isCompleted ? (
                <Badge className="bg-emerald-600 text-white text-xs font-bold">
                  Internship Completed ✓
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground text-xs font-semibold">
                  Tasks: {s?.approvedTasks} / {s?.totalTasks} Approved
                </Badge>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#181619] tracking-tight">
              My Advanced Documents
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Official, digitally verifiable academic and professional credentials issued by Skyrovix IT Solutions (MSME Certified). Each document includes a unique document ID, anti-tamper hash, and QR code verification.
            </p>
          </div>

          {/* Quick Stats / Upgrade Prompt */}
          <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
            {!isPremium && onUpgradeToPremium && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300/80 max-w-xs text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Crown className="size-3.5 text-amber-600" />
                  Upgrade to Premium Track
                </div>
                <p className="text-[11px] text-amber-800/90 mt-1 leading-snug">
                  Unlock your official Letter of Recommendation (LOR) upon internship completion.
                </p>
                <Button
                  size="sm"
                  onClick={onUpgradeToPremium}
                  className="mt-2.5 h-7 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white w-full"
                >
                  Upgrade Track
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Merit Summary Banner (if evaluated) */}
      {s?.evaluation && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50/70 via-white to-slate-50 border border-amber-300/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-amber-500/15 text-amber-600 grid place-items-center shrink-0">
              <Star className="size-6 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-[#181619]">Mentor Performance Assessment</h4>
                <Badge className="bg-amber-500 text-white text-[10px] font-black">
                  Grade {s.evaluation.finalRating}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                "{s.evaluation.mentorRemarks || "Candidate demonstrated exceptional performance."}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs shrink-0">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Code Quality</span>
              <span className="font-bold text-primary">{s.evaluation.codeQuality}/10</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Technical Skill</span>
              <span className="font-bold text-primary">{s.evaluation.technicalSkills}/10</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">High Performer</span>
              <span className="font-bold text-emerald-600">{s.isHighPerformer ? "Verified ✓" : "Standard"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Documents Grid (6 Documents) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {s?.documents?.map((doc) => {
          const isIssued = doc.status === "approved" && Boolean(doc.documentRecord);
          const isPending = doc.status === "pending_approval";
          const isLocked = doc.status === "locked";
          const isNotEligible = doc.status === "not_eligible";
          const isRejected = doc.status === "rejected";
          const isEligible = doc.status === "eligible";

          return (
            <div
              key={doc.documentType}
              className={`flex flex-col justify-between rounded-3xl border p-5 sm:p-6 transition-all duration-200 ${
                isIssued
                  ? "bg-white border-emerald-300 shadow-sm hover:shadow-md hover:border-emerald-400"
                  : isPending
                  ? "bg-white border-amber-300 shadow-sm"
                  : isEligible
                  ? "bg-white border-border/80 shadow-xs hover:border-primary/50 hover:shadow-sm"
                  : "bg-slate-50/70 border-dashed border-border/70 opacity-90"
              }`}
            >
              {/* Card Header & Content */}
              <div className="space-y-3">
                {/* Status Badges */}
                <div className="flex items-center justify-between gap-2">
                  <div className="size-9 rounded-2xl brand-gradient text-white grid place-items-center shadow-xs">
                    <FileText className="size-4.5" />
                  </div>

                  {isIssued && (
                    <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                      <CheckCircle2 className="size-3 mr-1" /> Available
                    </Badge>
                  )}
                  {isPending && (
                    <Badge className="bg-[#f95c4b] text-white text-[10px] font-bold animate-pulse">
                      <Clock className="size-3 mr-1" /> Pending Approval
                    </Badge>
                  )}
                  {isEligible && (
                    <Badge className="bg-blue-600 text-white text-[10px] font-bold">
                      <Sparkles className="size-3 mr-1" /> Unlocked
                    </Badge>
                  )}
                  {isLocked && (
                    <Badge variant="outline" className="text-muted-foreground text-[10px] font-semibold">
                      <Lock className="size-3 mr-1" /> Locked
                    </Badge>
                  )}
                  {isNotEligible && (
                    <Badge variant="secondary" className="text-slate-600 text-[10px] font-semibold">
                      <XCircle className="size-3 mr-1" /> Not Eligible
                    </Badge>
                  )}
                  {isRejected && (
                    <Badge className="bg-red-600 text-white text-[10px] font-bold">
                      <AlertCircle className="size-3 mr-1" /> Declined
                    </Badge>
                  )}
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-[#181619] leading-snug">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    {doc.description}
                  </p>
                </div>

                {/* Issued Record Metadata Snapshot */}
                {isIssued && doc.documentRecord && (
                  <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Document ID</span>
                      <span className="font-mono text-xs font-bold text-emerald-800">
                        {doc.documentRecord.document_id}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Issued On</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {new Date(doc.documentRecord.issue_date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Status Explanation / Helper text */}
                {!isIssued && (
                  <div className="text-[11px] text-muted-foreground flex items-start gap-1.5 pt-1">
                    <AlertCircle className="size-3.5 shrink-0 text-muted-foreground/60 mt-0.5" />
                    <span>{doc.statusReason}</span>
                  </div>
                )}
              </div>

              {/* Action Button at bottom */}
              <div className="pt-4 border-t border-border/50 mt-4">
                {isIssued ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setPreviewDocData({
                          documentId: doc.documentRecord!.document_id,
                          documentType: doc.documentType,
                          fullName: app.full_name || "Scholar",
                          internId: app.intern_id || "SKX-INTERN",
                          domain: app.domain || "fullstack",
                          domainName: (summary as any)?.domainName || "Full Stack Development",
                          planType: app.plan_type === "premium" ? "premium" : "standard",
                          durationMonths: Number(app.duration) || 1,
                          issuedAt: doc.documentRecord!.issue_date || new Date().toISOString(),
                          verifyUrl: `https://skyrovix.in/verify/${doc.documentRecord!.document_id}`,
                          metadata: doc.documentRecord!.metadata,
                        })
                      }
                      className="h-10 rounded-2xl text-xs font-bold border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 gap-1.5 cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      <Eye className="size-3.5 text-primary" />
                      Preview
                    </Button>
                    <Button
                      onClick={() => handleDownload(doc)}
                      disabled={downloadingType === doc.documentType}
                      className="h-10 rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-xs gap-1.5 cursor-pointer"
                    >
                      <Download className={`size-3.5 ${downloadingType === doc.documentType ? "animate-bounce" : ""}`} />
                      {downloadingType === doc.documentType ? "Generating..." : "Download PDF"}
                    </Button>
                  </div>
                ) : isPending ? (
                  <Button
                    disabled
                    variant="outline"
                    className="w-full h-10 rounded-2xl text-xs font-bold border-amber-300 text-amber-800 bg-amber-50"
                  >
                    <Clock className="size-3.5 mr-1.5 text-amber-600" />
                    Under Review by Mentor
                  </Button>
                ) : isEligible || isRejected ? (
                  <Button
                    onClick={() => {
                      setRequestingDoc(doc);
                      setStudentNote("");
                    }}
                    className="w-full h-10 rounded-2xl font-bold brand-gradient text-white text-xs shadow-xs"
                  >
                    <Send className="size-3.5 mr-1.5" />
                    {isRejected ? "Re-apply for Document" : "Request Document"}
                  </Button>
                ) : isLocked ? (
                  <Button
                    variant="outline"
                    onClick={onNavigateToTasks}
                    className="w-full h-10 rounded-2xl text-xs font-semibold text-muted-foreground border-border/70 hover:bg-slate-100"
                  >
                    <Lock className="size-3.5 mr-1.5" />
                    Complete Tasks to Unlock
                  </Button>
                ) : (
                  <Button
                    disabled
                    variant="ghost"
                    className="w-full h-10 rounded-2xl text-xs text-muted-foreground bg-slate-100"
                  >
                    Criteria Not Met
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Verification Guarantee Footer */}
      <div className="p-4 rounded-2xl bg-white border border-border/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4.5 text-primary shrink-0" />
          <span>
            Every Skyrovix document contains cryptographic anti-tamper security and can be publicly verified at{" "}
            <a href="https://skyrovix.in/verify" target="_blank" rel="noreferrer" className="text-primary font-bold underline inline-flex items-center gap-0.5">
              skyrovix.in/verify <ExternalLink className="size-3" />
            </a>
          </span>
        </div>
        <span className="text-[11px] font-semibold text-slate-600 shrink-0">
          MSME UDYAM-TN-17-0076606
        </span>
      </div>

      {/* ==================================================================== */}
      {/* REQUEST DOCUMENT MODAL */}
      {/* ==================================================================== */}
      <Dialog open={!!requestingDoc} onOpenChange={(open) => !open && setRequestingDoc(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-[#181619] flex items-center gap-2">
              <Send className="size-4 text-[#f95c4b]" />
              Request {requestingDoc?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Submit your credential generation request for mentor review and official sign-off.
            </DialogDescription>
          </DialogHeader>

          {requestingDoc && (
            <div className="space-y-4 pt-2">
              <div className="p-3 rounded-2xl bg-slate-50 border border-border/60 text-xs space-y-1">
                <p className="font-bold text-[#181619]">{app.full_name}</p>
                <p className="font-mono text-primary font-bold">{app.intern_id}</p>
                <p className="text-muted-foreground">{s?.domainName} ({app.duration} Months)</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">
                  Optional Note for Mentors & Administration
                </Label>
                <Textarea
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  rows={3}
                  placeholder="e.g. Completed all capstone requirements; requesting for academic placement submission..."
                  className="rounded-xl text-xs"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => setRequestingDoc(null)}
                  className="rounded-xl h-10 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => requestMutation.mutate()}
                  disabled={requestMutation.isPending}
                  className="rounded-xl h-10 text-xs font-bold brand-gradient text-white"
                >
                  {requestMutation.isPending ? "Submitting Request..." : "Submit Request"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ==================================================================== */}
      {/* HIGH-FIDELITY DOCUMENT PREVIEW DIALOG */}
      {/* ==================================================================== */}
      <AdvancedDocPreviewDialog
        data={previewDocData}
        open={Boolean(previewDocData)}
        onOpenChange={(open) => !open && setPreviewDocData(null)}
      />
    </div>
  );
}

