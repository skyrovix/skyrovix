import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Lock,
  Unlock,
  Clock,
  Sparkles,
  FileCheck,
  Mail,
  CreditCard,
  Award,
  ChevronRight,
} from "lucide-react";

export interface InternshipProgressTrackerProps {
  app: {
    id: string;
    domain: string;
    status: string;
    email_status?: string | null;
    submission_status?: string | null;
    offer_issued_at?: string | null;
    total_tasks?: number | null;
    certificate_offer_eligible?: boolean | null;
  } | null;
  isAppFeeRequired: boolean;
  appFeeAmount: number;
  appFeeStatus: "pending" | "under_review" | "approved" | "rejected" | "resubmission_required" | "not_required";
  tasksWithMeta: Array<{
    taskNumber: number;
    title: string;
    status: "completed" | "ongoing" | "pending" | "overdue";
    isLocked?: boolean;
    submission?: any;
  }>;
  allTasksApproved: boolean;
  certFeeAmount?: number;
  certPaymentStatus?: string;
  onOpenAppPayment?: () => void;
  onOpenCertPayment?: () => void;
  onNavigateTasks?: () => void;
  onNavigateCertificates?: () => void;
}

export function InternshipProgressTracker({
  app,
  isAppFeeRequired,
  appFeeAmount,
  appFeeStatus,
  tasksWithMeta,
  allTasksApproved,
  certFeeAmount,
  certPaymentStatus = "locked",
  onOpenAppPayment,
  onOpenCertPayment,
  onNavigateTasks,
  onNavigateCertificates,
}: InternshipProgressTrackerProps) {
  // Domain tasks (exclude LinkedIn task 0 for display steps)
  const domainTasks = useMemo(() => {
    return tasksWithMeta.filter((t) => t.taskNumber > 0);
  }, [tasksWithMeta]);

  const offerLetterSent = Boolean(app?.email_status === "sent" || app?.offer_issued_at);

  return (
    <div className="rounded-3xl border border-border/40 bg-white/70 p-6 backdrop-blur-xl dark:bg-slate-900/60 dark:border-white/5 space-y-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <h3 className="font-extrabold text-base tracking-tight text-foreground font-display">
              Internship Workflow & Milestones
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Step-by-step verified progression from application to certificate.
          </p>
        </div>
        {allTasksApproved ? (
          <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs px-3 py-1 shadow-sm gap-1.5">
            <Sparkles className="size-3.5" /> All Tasks Admin-Verified!
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs font-semibold">
            {domainTasks.filter((t) => t.status === "completed").length} of {domainTasks.length || 5} Tasks Verified
          </Badge>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Step 1: Application */}
        <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 flex items-start gap-3">
          <div className="grid size-8 place-items-center rounded-xl bg-emerald-500 text-white shrink-0 shadow-sm">
            <CheckCircle2 className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Step 1</p>
            <h4 className="text-xs font-bold text-foreground truncate">Application Submitted</h4>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">✅ Accepted</span>
          </div>
        </div>

        {/* Step 2: Offer Letter */}
        <div className={`rounded-2xl border p-3.5 flex items-start gap-3 transition-all ${
          offerLetterSent
            ? "border-emerald-200/60 bg-emerald-50/40 dark:bg-emerald-950/20"
            : "border-border/40 bg-secondary/30"
        }`}>
          <div className={`grid size-8 place-items-center rounded-xl shrink-0 ${
            offerLetterSent ? "bg-emerald-500 text-white shadow-sm" : "bg-muted text-muted-foreground"
          }`}>
            {offerLetterSent ? <CheckCircle2 className="size-4" /> : <Mail className="size-4" />}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 2</p>
            <h4 className="text-xs font-bold text-foreground truncate">Offer Letter Sent</h4>
            <span className={`text-[11px] font-semibold ${offerLetterSent ? "text-emerald-600" : "text-muted-foreground"}`}>
              {offerLetterSent ? "✅ Emailed to Student" : "Pending Dispatch"}
            </span>
          </div>
        </div>

        {/* Step 3: Application Fee */}
        {isAppFeeRequired ? (
          <div className={`rounded-2xl border p-3.5 flex items-start gap-3 transition-all ${
            appFeeStatus === "approved"
              ? "border-emerald-200/60 bg-emerald-50/40 dark:bg-emerald-950/20"
              : appFeeStatus === "pending" || appFeeStatus === "under_review"
              ? "border-amber-200/80 bg-amber-50/40 dark:bg-amber-950/20"
              : "border-rose-200/80 bg-rose-50/40 dark:bg-rose-950/20"
          }`}>
            <div className={`grid size-8 place-items-center rounded-xl shrink-0 ${
              appFeeStatus === "approved"
                ? "bg-emerald-500 text-white"
                : appFeeStatus === "pending" || appFeeStatus === "under_review"
                ? "bg-amber-500 text-white"
                : "bg-rose-500 text-white"
            }`}>
              {appFeeStatus === "approved" ? <CheckCircle2 className="size-4" /> : <CreditCard className="size-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 3</p>
              <h4 className="text-xs font-bold text-foreground truncate">Application Fee (₹{appFeeAmount})</h4>
              <div className="flex items-center justify-between mt-0.5">
                <span className={`text-[11px] font-semibold ${
                  appFeeStatus === "approved"
                    ? "text-emerald-600"
                    : appFeeStatus === "pending" || appFeeStatus === "under_review"
                    ? "text-amber-600"
                    : "text-rose-600"
                }`}>
                  {appFeeStatus === "approved" ? "✅ Admin Approved" : appFeeStatus === "pending" || appFeeStatus === "under_review" ? "⏳ In Verification" : "🔴 Payment Pending"}
                </span>
                {appFeeStatus !== "approved" && onOpenAppPayment && (
                  <button
                    type="button"
                    onClick={onOpenAppPayment}
                    className="text-[10px] font-bold text-primary hover:underline ml-1"
                  >
                    {appFeeStatus === "pending" || appFeeStatus === "under_review" ? "View Status" : "Go to Payment"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/40 bg-secondary/30 p-3.5 flex items-start gap-3">
            <div className="grid size-8 place-items-center rounded-xl bg-slate-400 text-white shrink-0">
              <CheckCircle2 className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 3</p>
              <h4 className="text-xs font-bold text-foreground truncate">Application Fee</h4>
              <span className="text-[11px] text-muted-foreground font-semibold">Not Required</span>
            </div>
          </div>
        )}

        {/* Step 4: Certificate Milestone */}
        <div className={`rounded-2xl border p-3.5 flex items-start gap-3 transition-all ${
          allTasksApproved
            ? "border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30"
            : "border-border/40 bg-secondary/30 opacity-75"
        }`}>
          <div className={`grid size-8 place-items-center rounded-xl shrink-0 ${
            allTasksApproved ? "bg-emerald-500 text-white shadow-sm" : "bg-muted text-muted-foreground"
          }`}>
            {allTasksApproved ? (
              <Award className="size-4" />
            ) : (
              <Lock className="size-4" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Final Step</p>
            <h4 className="text-xs font-bold text-foreground truncate">Certificate</h4>
            <div className="flex items-center justify-between mt-0.5">
              <span className={`text-[11px] font-bold ${
                allTasksApproved ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
              }`}>
                {allTasksApproved ? (
                  app?.certificate_offer_eligible ? (
                    "🎉 Free (Offer)"
                  ) : certPaymentStatus === "approved" || certPaymentStatus === "waived" ? (
                    "✅ Verified / Ready"
                  ) : certPaymentStatus === "pending" || certPaymentStatus === "under_review" ? (
                    "⏳ In Verification"
                  ) : certFeeAmount && certFeeAmount > 0 ? (
                    `💳 Pay ₹${certFeeAmount} Fee`
                  ) : (
                    "✅ Ready to Generate"
                  )
                ) : app?.certificate_offer_eligible ? (
                  "🎁 Free Offer Reserved"
                ) : (
                  "🔒 Complete Tasks First"
                )}
              </span>
              {allTasksApproved && onOpenCertPayment && (
                <button
                  type="button"
                  onClick={onOpenCertPayment}
                  className="text-[10px] font-bold text-primary hover:underline ml-1"
                >
                  {!app?.certificate_offer_eligible && certPaymentStatus !== "approved" && certPaymentStatus !== "waived" && certFeeAmount && certFeeAmount > 0
                    ? (certPaymentStatus === "pending" || certPaymentStatus === "under_review" ? "View Status" : "Go to Payment")
                    : "Go to Certificates"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task-by-task progression checklist */}
      <div className="space-y-2 pt-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Assigned Tasks Progression (Sequential Unlock)
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {domainTasks.map((t) => {
            const isApproved = t.status === "completed";
            const isSubmitted = t.submission && !isApproved;
            const isLocked = t.isLocked;

            return (
              <div
                key={t.taskNumber}
                className={`rounded-xl border p-3 flex items-center justify-between transition-all ${
                  isApproved
                    ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300"
                    : isSubmitted
                    ? "border-blue-200 bg-blue-50/40 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300"
                    : isLocked
                    ? "border-border/40 bg-secondary/20 text-muted-foreground opacity-60"
                    : "border-primary/30 bg-primary/5 text-primary"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`grid size-6 place-items-center rounded-lg text-xs font-bold shrink-0 ${
                    isApproved
                      ? "bg-emerald-600 text-white"
                      : isSubmitted
                      ? "bg-blue-600 text-white"
                      : isLocked
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary text-white"
                  }`}>
                    {isApproved ? <CheckCircle2 className="size-3.5" /> : t.taskNumber}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">Task {t.taskNumber}</p>
                    <p className="text-[10px] truncate opacity-80">
                      {isApproved
                        ? "Admin Verified"
                        : isSubmitted
                        ? "Under Review"
                        : isLocked
                        ? "Locked"
                        : "Available"}
                    </p>
                  </div>
                </div>
                {isLocked ? (
                  <Lock className="size-3.5 shrink-0 text-muted-foreground/60 ml-2" />
                ) : isApproved ? (
                  <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600 ml-2" />
                ) : (
                  <Unlock className="size-3.5 shrink-0 text-primary ml-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
