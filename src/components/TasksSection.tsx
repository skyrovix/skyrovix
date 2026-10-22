import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/db-client";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { getDomainTasks, getTasksByDuration, LINKEDIN_TASK } from "@/lib/tasks-data";
import {
  Lock,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  CalendarDays,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  BookOpen,
  Target,
  Sparkles,
  TrendingUp,
  Loader2,
  ChevronRight,
  Code,
  Linkedin,
  X,
  Upload,
  FileText,
  Image,
  Link2,
  MessageSquare,
  Award,
  CreditCard,
  Send,
} from "lucide-react";

const TECH_KEYWORDS = ["react", "node", "mongodb", "database", "auth", "responsive", "deploy", "api", "jwt", "tailwind", "crud", "linkedin", "network", "post", "share", "python", "javascript", "typescript", "css", "html", "github", "docker", "aws", "firebase", "sql", "graphql", "next", "express", "redux", "figma"];

function extractTechnologies(features: string[]): string[] {
  const techs = new Set<string>();
  const lower = features.join(" ").toLowerCase();
  TECH_KEYWORDS.forEach((kw) => { if (lower.includes(kw)) techs.add(kw); });
  return [...techs];
}

type TaskStatus = "completed" | "ongoing" | "pending" | "overdue";

type Submission = {
  id: string;
  task_id: string;
  status: string;
  github_url: string | null;
  deployed_url: string | null;
  notes: string | null;
  feedback: string | null;
  submitted_at?: string;
  reviewed_at?: string | null;
  previous_submission_id?: string | null;
  resubmission_count?: number | null;
};

function getTaskStatus(submission: Submission | undefined, dueDate: Date): TaskStatus {
  if (!submission) {
    const now = new Date();
    if (dueDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) return "overdue";
    return "pending";
  }
  if (submission.status === "approved") return "completed";
  return "ongoing";
}

function computeDueDate(taskNumber: number): Date {
  const d = new Date();
  if (taskNumber === 0) {
    d.setDate(d.getDate() + 3);
  } else {
    d.setDate(d.getDate() + taskNumber * 6);
  }
  return d;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function daysRemaining(date: Date): number {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function generateId(): string {
  return `task-${Math.random().toString(36).slice(2, 9)}`;
}

/* ─────────── CONFETTI ─────────── */
function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ["#22C55E", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
    }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 3 + 2,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
      });
    }
    let frame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.003;
        if (p.opacity <= 0) continue;
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      if (alive) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [active]);
  if (!active) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
}

/* ─────────── SKELETON ─────────── */
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-border/40 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="size-10 rounded-xl bg-muted" />
        <div className="h-6 w-24 rounded-full bg-muted" />
      </div>
      <div className="mt-4 h-4 w-32 rounded bg-muted" />
      <div className="mt-3 h-6 w-3/4 rounded bg-muted" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-5/6 rounded bg-muted" />
      </div>
      <div className="mt-4 h-3 w-1/3 rounded bg-muted" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-2/3 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="h-3 w-3/4 rounded bg-muted" />
      </div>
      <div className="mt-4 h-10 w-full rounded-xl bg-muted" />
    </div>
  );
}

/* ─────────── MAIN COMPONENT ─────────── */
export function TasksSection({
  domainSlug,
  submissions: rawSubmissions,
  appId,
  duration,
  totalTasks,
  planType,
  submissionStatus,
  isAppFeeRequired = false,
  appFeeAmount = 0,
  appFeePayment,
  onOpenAppPayment,
  onNavigateCertificates,
  isCertPaymentRequired = false,
  certFeeAmount = 100,
  onOpenCertPayment,
  isPremiumPlanEnabled = true,
  onChange,
}: {
  domainSlug: string;
  submissions: Submission[];
  appId: string;
  duration?: number;
  totalTasks?: number | null;
  planType?: string | null;
  submissionStatus?: string;
  isAppFeeRequired?: boolean;
  appFeeAmount?: number;
  appFeePayment?: any;
  onOpenAppPayment?: () => void;
  onNavigateCertificates?: () => void;
  isCertPaymentRequired?: boolean;
  certFeeAmount?: number;
  onOpenCertPayment?: () => void;
  isPremiumPlanEnabled?: boolean;
  onChange: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [sort, setSort] = useState<"default" | "due" | "number">("default");
  const [showSort, setShowSort] = useState(false);
  const [confettiTask, setConfettiTask] = useState<string | null>(null);
  const [taskIdMap, setTaskIdMap] = useState<Record<number, string>>({});
  const [tasksReady, setTasksReady] = useState(false);

  const isPremiumActive = Boolean(isPremiumPlanEnabled && planType === "premium");
  const effectiveLimit = useMemo(() => {
    if (domainSlug === "fullstack") {
      if (isPremiumActive) {
        const fullstackLimits: Record<number, number> = { 1: 5, 2: 8, 3: 25, 6: 50 };
        return fullstackLimits[duration ?? 1] ?? 5;
      } else {
        const standardLimits: Record<number, number> = { 1: 5, 2: 8, 3: 10, 6: 12 };
        return standardLimits[duration ?? 1] ?? 5;
      }
    }
    if (totalTasks && totalTasks > 0) return totalTasks;
    const taskLimits: Record<number, number> = { 1: 5, 2: 8, 3: 10, 6: 12 };
    return taskLimits[duration ?? 1] ?? 5;
  }, [isPremiumActive, totalTasks, domainSlug, duration]);

  const domainData = getDomainTasks(domainSlug);
  const allTasks = duration ? getTasksByDuration(domainSlug, duration, effectiveLimit) : (domainData?.tasks ?? []);

  // Fetch task IDs from DB
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let query = supabase.from("tasks").select("id, task_number").eq("domain", domainSlug);
      query = query.lte("task_number", effectiveLimit);
      const { data } = await query;
      if (cancelled) return;
      const map: Record<number, string> = {};
      for (const t of data ?? []) map[t.task_number] = t.id;
      if (!cancelled) { setTaskIdMap(map); setTasksReady(true); }
    })();
    return () => { cancelled = true; };
  }, [domainSlug, effectiveLimit]);

  const isAppFeeLocked = Boolean(isAppFeeRequired && appFeeAmount > 0 && appFeePayment?.status !== "approved");

  const tasksWithMeta = useMemo(() => {
    const getLatestSub = (tId: string) => {
      const matches = (rawSubmissions || []).filter((s) => s.task_id === tId);
      if (!matches.length) return undefined;
      return [...matches].sort((a, b) => new Date(b.submitted_at || 0).getTime() - new Date(a.submitted_at || 0).getTime())[0];
    };

    const linkedinId = taskIdMap[0] ?? `${domainSlug}-0`;
    const linkedinSub = linkedinId ? getLatestSub(linkedinId) : undefined;
    const linkedinDue = computeDueDate(1);
    const linkedinStatus = getTaskStatus(linkedinSub, linkedinDue);
    const linkedinDone = linkedinStatus === "completed"; // Approved

    const linkedinMeta = {
      ...LINKEDIN_TASK,
      id: linkedinId,
      submission: linkedinSub,
      dueDate: linkedinDue,
      status: linkedinStatus,
      remaining: daysRemaining(linkedinDue),
      isLocked: isAppFeeLocked || (!linkedinDone && submissionStatus === "submitted"),
      lockReason: isAppFeeLocked
        ? "Your internship tasks will unlock after your application fee payment is verified by the admin."
        : "Internship submitted for verification — tasks are locked.",
    };

    let prevTaskApproved = linkedinDone; // Task 1 unlocks if LinkedIn is done & App fee is paid
    const domainTasks = allTasks.map((t, idx) => {
      const id = taskIdMap[t.taskNumber] ?? `${domainSlug}-${t.taskNumber}`;
      const sub = getLatestSub(id);
      const dueDate = computeDueDate(t.taskNumber);
      const status = getTaskStatus(sub, dueDate);
      const remaining = daysRemaining(dueDate);

      let isLocked = false;
      let lockReason = "";

      if (isAppFeeLocked) {
        isLocked = true;
        lockReason = "Your internship tasks will unlock after your application fee payment is verified by the admin.";
      } else if (!linkedinDone && t.taskNumber > 0) {
        isLocked = true;
        lockReason = "Complete the LinkedIn post task first to unlock.";
      } else if (!prevTaskApproved && t.taskNumber > 1) {
        isLocked = true;
        const prevTaskNum = allTasks[idx - 1]?.taskNumber ?? (t.taskNumber - 1);
        lockReason = `Complete and get admin approval for Task ${prevTaskNum} to unlock.`;
      } else if (submissionStatus === "submitted" && status !== "completed") {
        isLocked = true;
        lockReason = "Internship submitted for verification — tasks are locked.";
      }

      // Track approved status for next task (status === 'completed' means submission.status === 'approved')
      prevTaskApproved = status === "completed";

      return {
        ...t,
        id,
        submission: sub,
        dueDate,
        status,
        remaining,
        isLocked,
        lockReason,
      };
    });

    return [linkedinMeta, ...domainTasks];
  }, [allTasks, rawSubmissions, taskIdMap, domainSlug, isAppFeeLocked, submissionStatus]);

  const stats = useMemo(() => {
    const completed = tasksWithMeta.filter((t) => t.status === "completed").length;
    const ongoing = tasksWithMeta.filter((t) => t.status === "ongoing").length;
    const pending = tasksWithMeta.filter((t) => t.status === "pending").length;
    const overdue = tasksWithMeta.filter((t) => t.status === "overdue").length;
    const total = tasksWithMeta.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, ongoing, pending, overdue, rate };
  }, [tasksWithMeta]);

  const filtered = useMemo(() => {
    let items = [...tasksWithMeta];
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
      );
    }
    if (filter !== "all") items = items.filter((t) => t.status === filter);
    if (sort === "due") items.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    else if (sort === "number") items.sort((a, b) => a.taskNumber - b.taskNumber);
    return items;
  }, [tasksWithMeta, search, filter, sort]);

  const handleChange = useCallback(() => {
    onChange();
  }, [onChange]);

  return (
    <div className="relative">
      <Confetti active={!!confettiTask} />

      {/* Floating BG blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-32 size-96 rounded-full bg-blue-400/10 blur-[120px]" />
        <div className="absolute -right-32 top-1/3 size-80 rounded-full bg-[#07284a]/10 blur-[100px]" />
        <div className="absolute -bottom-40 left-1/3 size-72 rounded-full bg-emerald-400/10 blur-[90px]" />
      </div>

      {/* Progress Summary */}
      <div className="mb-8 rounded-2xl border border-border/40 bg-white/80 px-4 sm:px-6 py-5 shadow-lg backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-primary to-primary/70 p-2.5 text-white shadow-sm">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{domainData?.name} Tasks</p>
              <p className="text-xs text-muted-foreground">
                {stats.completed}/{stats.total} completed
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <StatItem label="Total" value={stats.total} color="text-foreground" />
            <StatItem label="Done" value={stats.completed} color="text-green-600" />
            <StatItem label="In Progress" value={stats.ongoing} color="text-blue-600" />
            <StatItem label="Pending" value={stats.pending} color="text-orange-600" />
            {stats.overdue > 0 && (
              <StatItem label="Overdue" value={stats.overdue} color="text-red-600" />
            )}
            <div className="flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1.5 font-medium">
              <Sparkles className="size-3.5 text-primary" />
              <span>{stats.rate}%</span>
            </div>
          </div>
        </div>
        {/* Mini progress bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-primary to-green-500 transition-all duration-700 ease-out"
            style={{ width: `${stats.rate}%` }}
          />
        </div>
      </div>

      {/* Application Fee Payment Task (Required when Fee > 0) */}
      {isAppFeeRequired && appFeeAmount > 0 && (
        <div className={`mb-6 rounded-2xl border p-5 shadow-sm transition-all ${
          appFeePayment?.status === "approved"
            ? "border-emerald-300/80 bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-950/20 dark:to-slate-900/40"
            : "border-amber-300/80 bg-gradient-to-br from-amber-50/90 to-white dark:from-amber-950/20 dark:to-slate-900/40"
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`grid size-11 place-items-center rounded-2xl shrink-0 shadow-sm ${
                appFeePayment?.status === "approved"
                  ? "bg-emerald-500 text-white"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              }`}>
                {appFeePayment?.status === "approved" ? (
                  <CheckCircle2 className="size-6" />
                ) : (
                  <Lock className="size-6" />
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    1. First Required Task
                  </span>
                  <h3 className="font-bold text-base text-foreground">
                    Application Fee Payment (₹{appFeeAmount})
                  </h3>
                  <Badge className={
                    appFeePayment?.status === "approved"
                      ? "bg-emerald-600 text-white font-bold text-xs"
                      : appFeePayment?.status === "pending" || appFeePayment?.status === "under_review"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-bold text-xs"
                      : appFeePayment?.status === "rejected"
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 font-bold text-xs"
                      : appFeePayment?.status === "resubmission_required"
                      ? "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 font-bold text-xs"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-bold text-xs"
                  }>
                    {appFeePayment?.status === "approved"
                      ? "✅ Approved"
                      : appFeePayment?.status === "pending" || appFeePayment?.status === "under_review"
                      ? "⏳ Under Review"
                      : appFeePayment?.status === "rejected"
                      ? "❌ Rejected"
                      : appFeePayment?.status === "resubmission_required"
                      ? "🔄 Resubmission Required"
                      : "🔴 Pending Payment"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {appFeePayment?.status === "approved"
                    ? "Your application fee has been verified and approved by admin. Internship tasks are unlocked!"
                    : appFeePayment?.status === "pending" || appFeePayment?.status === "under_review"
                    ? "Your application payment proof (UTR: " + (appFeePayment?.utr_number || "—") + ") is currently under admin verification. Tasks will unlock immediately after approval."
                    : appFeePayment?.status === "rejected" || appFeePayment?.status === "resubmission_required"
                    ? `Admin Note: ${appFeePayment?.admin_note || "Please submit a clear UPI receipt screenshot and valid UTR."}`
                    : "Your internship tasks will unlock after your application fee payment is verified by the admin."}
                </p>

                {/* Mandatory Skyrovix Disclaimer */}
                <div className="mt-3 rounded-xl border border-blue-200/80 bg-blue-50/70 dark:border-blue-900/40 dark:bg-blue-950/30 p-2.5 text-[11px] text-blue-900 dark:text-blue-200 leading-relaxed space-y-1">
                  <div className="font-bold text-blue-800 dark:text-blue-300">
                    Application Processing Fee — Not a Certification Fee
                  </div>
                  <p>
                    Application processing fee only. This charge is applicable only to your internship application. It is NOT a certification fee.
                  </p>
                </div>
              </div>
            </div>

            {appFeePayment?.status !== "approved" && onOpenAppPayment && (
              <Button
                onClick={onOpenAppPayment}
                className="shrink-0 rounded-xl h-10 px-5 text-xs font-bold brand-gradient text-white border-0 shadow-md gap-2"
              >
                {appFeePayment?.status === "pending" || appFeePayment?.status === "under_review"
                  ? "View Payment Status"
                  : appFeePayment?.status === "rejected" || appFeePayment?.status === "resubmission_required"
                  ? "Resubmit Payment"
                  : "Go to Payment"}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Certificate Payment & Completion Banner */}
      {stats.total > 0 && stats.completed >= stats.total && (
        <div className={`mb-6 rounded-2xl border p-5 sm:p-6 shadow-sm transition-all ${
          isCertPaymentRequired
            ? "border-[#f95c4b]/30 bg-gradient-to-br from-[#f95c4b]/10 via-white to-[#ee9590]/5"
            : "border-emerald-300/80 bg-gradient-to-br from-emerald-50/80 to-white"
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`grid size-11 place-items-center rounded-2xl shrink-0 shadow-sm ${
                isCertPaymentRequired
                  ? "brand-gradient text-white shadow-md shadow-[#f95c4b]/20"
                  : "bg-emerald-500 text-white"
              }`}>
                <Award className="size-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-emerald-600 text-white border-0 text-[10px] font-bold">
                    🎉 ALL TASKS VERIFIED ({stats.completed}/{stats.total})
                  </Badge>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    {isCertPaymentRequired ? "Certificate Payment Required" : "Certificate Ready"}
                  </span>
                </div>
                <h3 className="font-bold text-base text-[#181619] mt-0.5">
                  {isCertPaymentRequired
                    ? `Pay Certificate Fee (₹${certFeeAmount}) to Issue Certificate`
                    : "Congratulations! Your Certificate is Ready"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xl">
                  {isCertPaymentRequired
                    ? `All your tasks have been verified by your mentor! Complete your certificate fee payment of ₹${certFeeAmount} to immediately generate and download your verified credential.`
                    : "All your tasks and verification are complete! You can now generate and download your official credential."}
                </p>
              </div>
            </div>

            {isCertPaymentRequired && onOpenCertPayment ? (
              <Button
                type="button"
                onClick={onOpenCertPayment}
                className="shrink-0 rounded-xl h-10 px-5 text-xs font-bold bg-gradient-to-r from-[#f95c4b] to-[#ee9590] hover:opacity-95 text-white border-0 shadow-md shadow-[#f95c4b]/20 gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
              >
                <CreditCard className="size-3.5" /> Pay ₹{certFeeAmount} Now
              </Button>
            ) : onNavigateCertificates ? (
              <Button
                type="button"
                onClick={onNavigateCertificates}
                className="shrink-0 rounded-xl h-10 px-5 text-xs font-bold brand-gradient text-white border-0 shadow-md gap-2 cursor-pointer"
              >
                <Award className="size-3.5" /> Go to Certificates <ArrowRight className="size-3.5" />
              </Button>
            ) : null}
          </div>
        </div>
      )}

      {/* Search + Filter + Sort */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="h-10 rounded-xl border-border/60 bg-white pl-9 text-sm shadow-sm"
          />
        </div>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-white p-1 shadow-sm w-max">
            {(["all", "completed", "ongoing", "pending", "overdue"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                filter === f
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-white px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm transition hover:text-foreground"
          >
            <ArrowUpDown className="size-3.5" /> Sort
          </button>
          {showSort && (
            <div className="absolute right-0 top-full z-10 mt-1 w-36 overflow-hidden rounded-xl border border-border/60 bg-white shadow-lg">
              {(["default", "due", "number"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSort(s);
                    setShowSort(false);
                  }}
                  className={`block w-full px-4 py-2 text-left text-xs transition hover:bg-muted/40 ${
                    sort === s
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {s === "default" ? "Default" : s === "due" ? "Due Date" : "Task Number"}
                </button>
          ))}
          </div>
          )}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-white/50 py-16 text-center">
          <Search className="mx-auto size-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">No tasks match your filters.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((task) => (
              <TaskCard
              key={task.id}
              task={task}
              domain={domainData}
              appId={appId}
              tasksReady={tasksReady}
              submissionStatus={submissionStatus}
              onSubmitted={() => {
                handleChange();
                if (task.submission?.status !== "approved") {
                  setConfettiTask(task.id);
                  setTimeout(() => setConfettiTask(null), 3000);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  );
}

/* ─────────── TASK SUBMIT DIALOG ─────────── */
function TaskSubmitDialog({
  open,
  onOpenChange,
  task,
  domain,
  appId,
  onSubmitted,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task: {
    id: string;
    taskNumber: number;
    title: string;
    description: string;
    submission: Submission | undefined;
  };
  domain: { slug: string; name: string; icon: string; color: string } | undefined;
  appId: string;
  onSubmitted: () => void;
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { submission } = task;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    try {
      if (!user) return toast.error("You must be logged in");
      let taskId = task.id;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(taskId)) {
        const { data: resolved } = await supabase
          .from("tasks").select("id").eq("domain", domain?.slug ?? "").eq("task_number", task.taskNumber).maybeSingle();
        if (resolved) {
          taskId = resolved.id;
        } else {
          const rpcName = task.taskNumber === 0 ? "ensure_linkedin_task" : "ensure_task";
          const rpcParams: Record<string, any> = task.taskNumber === 0
            ? { p_domain: domain?.slug ?? "" }
            : { p_domain: domain?.slug ?? "", p_task_number: task.taskNumber, p_title: task.title ?? `Task ${task.taskNumber}`, p_description: task.description ?? "" };
          const { data: rpcId, error: rpcErr } = await supabase.rpc(rpcName as any, rpcParams as any);
          if (rpcErr || !rpcId) {
            return toast.error(rpcErr?.message?.includes("function") ? "Task system not ready — admin must run the SQL migration." : `Could not initialise task: ${rpcErr?.message ?? "unknown error"}`);
          }
          taskId = rpcId as string;
        }
      }
      setLoading(true);
      const fd = new FormData(form);
      const githubUrl = String(fd.get("github_url") || "");
      const pdfFile = fd.get("pdf") as File | null;
      const screenshotFile = fd.get("screenshot") as File | null;
      const notes = String(fd.get("notes") || "");

      if (task.taskNumber !== 0 && !githubUrl && !pdfFile?.size && !screenshotFile?.size) {
        setLoading(false);
        return toast.error("Provide at least a GitHub link, a project PDF, or a screenshot");
      }

      if (task.taskNumber === 0) {
        const raw = String(fd.get("deployed_url") || "").trim();
        if (!raw) { setLoading(false); return toast.error("Please enter your LinkedIn post URL"); }
        const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
        try { new URL(normalized); } catch { setLoading(false); return toast.error("Please enter a valid URL"); }
        fd.set("deployed_url", normalized);
      }

      let pdfUrl = "";
      let screenshotUrl = "";

      if (pdfFile?.size) {
        const path = `${user.id}/${taskId}/${Date.now()}_${pdfFile.name}`;
        const { data: upload, error: uploadErr } = await supabase.storage.from("task-submissions").upload(path, pdfFile);
        if (uploadErr) { setLoading(false); return toast.error("Failed to upload PDF: " + uploadErr.message); }
        const { data: pub } = supabase.storage.from("task-submissions").getPublicUrl(upload.path);
        pdfUrl = pub.publicUrl;
      }

      if (screenshotFile?.size) {
        const path = `${user.id}/${taskId}/${Date.now()}_${screenshotFile.name}`;
        const { data: upload, error: uploadErr } = await supabase.storage.from("task-submissions").upload(path, screenshotFile);
        if (uploadErr) { setLoading(false); return toast.error("Failed to upload screenshot: " + uploadErr.message); }
        const { data: pub } = supabase.storage.from("task-submissions").getPublicUrl(upload.path);
        screenshotUrl = pub.publicUrl;
      }

      const deployedUrl = String(fd.get("deployed_url") || "");
      const payload: Record<string, any> = {
        application_id: appId,
        task_id: taskId,
        github_url: githubUrl,
        notes,
        status: "pending" as const,
        submitted_at: new Date().toISOString(),
      };
      if (deployedUrl) payload.deployed_url = deployedUrl;
      if (pdfUrl) payload.pdf_url = pdfUrl;
      if (screenshotUrl) payload.screenshot_url = screenshotUrl;

      // Check if a previous submission exists for this application & task
      let prevSub = submission;
      if (!prevSub) {
        const { data: existing } = await supabase
          .from("submissions")
          .select("*")
          .eq("application_id", appId)
          .eq("task_id", taskId)
          .order("submitted_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (existing) {
          prevSub = existing as any;
        }
      }

      const isResubmission = Boolean(prevSub && (prevSub.status === "rejected" || prevSub.reviewed_at));
      let insertedId: string | null = null;
      let resubCount = 1;

      if (isResubmission && prevSub) {
        // Count previous submissions for this application & task
        const { data: previousSubs } = await supabase
          .from("submissions")
          .select("id, status")
          .eq("application_id", appId)
          .eq("task_id", taskId);

        const existingCount = previousSubs?.length ?? 1;
        const prevResubCount = Number(prevSub.resubmission_count ?? 0);
        const newResubmissionCount = prevResubCount > 0 ? prevResubCount + 1 : existingCount;
        resubCount = newResubmissionCount;

        const noteHeader = `[Resubmission #${newResubmissionCount} | Prev: ${prevSub.id}]`;
        const resubNotes = notes ? `${noteHeader}\n${notes}` : noteHeader;

        const resubPayload: Record<string, any> = {
          application_id: appId,
          task_id: taskId,
          github_url: githubUrl,
          notes: resubNotes,
          status: "pending",
          submitted_at: new Date().toISOString(),
          feedback: null,
          reviewed_at: null,
          previous_submission_id: prevSub.id,
          resubmission_count: newResubmissionCount,
        };
        if (deployedUrl) resubPayload.deployed_url = deployedUrl;
        if (pdfUrl) resubPayload.pdf_url = pdfUrl;
        if (screenshotUrl) resubPayload.screenshot_url = screenshotUrl;

        // Insert new submission linked to previous submission
        let { data: newSub, error: insertErr } = await supabase
          .from("submissions")
          .insert(resubPayload as any)
          .select("id")
          .single();

        if (insertErr && (insertErr.message?.includes("column") || (insertErr as any).code === "PGRST204" || (insertErr as any).code === "42703")) {
          // Graceful fallback if columns are not yet in Supabase schema
          const fallbackPayload = { ...resubPayload };
          delete fallbackPayload.previous_submission_id;
          delete fallbackPayload.resubmission_count;
          const fallbackRes = await supabase
            .from("submissions")
            .insert(fallbackPayload as any)
            .select("id")
            .single();
          newSub = fallbackRes.data;
          insertErr = fallbackRes.error;
        }

        if (insertErr) {
          setLoading(false);
          return toast.error(insertErr.message);
        }

        insertedId = newSub?.id ?? null;

        if (insertedId) {
          try {
            await (supabase.from("submission_history" as any) as any).insert({
              submission_id: insertedId,
              table_name: "submissions",
              previous_status: "rejected",
              new_status: "pending",
              changed_by: user.id,
              reason: `Resubmission #${newResubmissionCount} (Previous submission: ${prevSub.id})`,
            });
          } catch (histErr) {
            console.warn("Could not insert submission history:", histErr);
          }
        }
      } else {
        // Standard first-time submission or draft update
        if (prevSub && prevSub.status === "pending") {
          const { error: updErr } = await supabase
            .from("submissions")
            .update(payload as any)
            .eq("id", prevSub.id);
          if (updErr) { setLoading(false); return toast.error(updErr.message); }
          insertedId = prevSub.id;
        } else {
          const { data: newSub, error: insErr } = await supabase
            .from("submissions")
            .insert(payload as any)
            .select("id")
            .single();
          if (insErr) { setLoading(false); return toast.error(insErr.message); }
          insertedId = newSub?.id ?? null;
        }
      }

      setLoading(false);
      toast.success(isResubmission ? `Resubmission #${resubCount} submitted for review! 🔄` : "Task submitted for review! 🎉");
      onOpenChange(false);
      onSubmitted();
    } catch (err: any) {
      setLoading(false);
      console.error("Submission error:", err);
      toast.error(err?.message || "Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden rounded-2xl border border-border/60 shadow-2xl">
        {/* Dialog Header */}
        <div className="relative bg-gradient-to-r from-[#181619] via-[#242026] to-[#181619] px-6 pt-6 pb-5 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none" />
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
          </button>
          <div className="flex items-center gap-3 relative z-10">
            {task.taskNumber === 0 ? (
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#0077b5] shadow-lg shrink-0">
                <Linkedin className="size-5" />
              </div>
            ) : (
              <div className="flex size-10 items-center justify-center rounded-xl bg-white/15 border border-white/20 font-bold text-white text-base shadow-lg shrink-0">
                {task.taskNumber}
              </div>
            )}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-200 mb-0.5">
                {task.taskNumber === 0 ? "LinkedIn Task" : `Task ${task.taskNumber}`}
                {submission?.status === "rejected" && " — Revision"}
              </p>
              <h2 className="text-base font-extrabold leading-snug">{task.title}</h2>
            </div>
          </div>
        </div>

        {/* Feedback banner in submission modal */}
        {submission?.feedback && (
          <div className={`mx-6 mt-4 rounded-xl border p-3 flex items-start gap-2 ${
            submission.status === "approved" ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-300" :
            submission.status === "rejected" ? "border-rose-200 bg-rose-50 text-rose-900 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-300" :
            "border-blue-200 bg-blue-50 text-blue-900 dark:bg-blue-950/30 dark:border-blue-900/40 dark:text-blue-300"
          }`}>
            <MessageSquare className="size-4 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold capitalize">Mentor Feedback ({submission.status})</p>
              <p className="mt-0.5 text-xs opacity-90 leading-relaxed">{submission.feedback}</p>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {task.taskNumber === 0 ? (
            /* LinkedIn Task */
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <Link2 className="size-3.5 text-primary" /> LinkedIn Post URL
              </Label>
              <Input
                name="deployed_url"
                type="text"
                placeholder="https://linkedin.com/posts/..."
                className="h-10 rounded-xl text-sm"
                defaultValue={submission?.deployed_url ?? ""}
                required
              />
              <p className="text-[11px] text-muted-foreground">Paste the public URL of your LinkedIn internship post.</p>
            </div>
          ) : (
            <>
              {/* GitHub */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <Code className="size-3.5 text-primary" /> GitHub Repository
                  <span className="text-xs font-normal text-muted-foreground ml-1">(optional)</span>
                </Label>
                <Input
                  name="github_url"
                  type="url"
                  placeholder="https://github.com/your-username/project"
                  className="h-10 rounded-xl text-sm"
                  defaultValue={submission?.github_url ?? ""}
                />
              </div>

              {/* PDF */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <FileText className="size-3.5 text-primary" /> Project PDF
                  <span className="text-xs font-normal text-muted-foreground ml-1">(optional)</span>
                </Label>
                <div className="relative">
                  <Input
                    name="pdf"
                    type="file"
                    accept=".pdf"
                    className="h-10 rounded-xl text-sm cursor-pointer file:mr-3 file:h-full file:border-0 file:bg-primary/10 file:px-3 file:text-xs file:font-semibold file:text-primary file:rounded-lg"
                  />
                </div>
              </div>

              {/* Screenshot */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <Image className="size-3.5 text-primary" /> Screenshot
                  <span className="text-xs font-normal text-muted-foreground ml-1">(optional)</span>
                </Label>
                <Input
                  name="screenshot"
                  type="file"
                  accept="image/*"
                  className="h-10 rounded-xl text-sm cursor-pointer file:mr-3 file:h-full file:border-0 file:bg-primary/10 file:px-3 file:text-xs file:font-semibold file:text-primary file:rounded-lg"
                />
              </div>

              <p className="text-[11px] text-muted-foreground rounded-lg bg-muted/40 px-3 py-2">
                ✦ Provide at least one: GitHub link, project PDF, or screenshot.
              </p>
            </>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold flex items-center gap-1.5">
              <BookOpen className="size-3.5 text-primary" /> Notes
              <span className="text-xs font-normal text-muted-foreground ml-1">(optional)</span>
            </Label>
            <Textarea
              name="notes"
              rows={3}
              placeholder="Describe your approach, tools used, or anything you want the mentor to know..."
              className="rounded-xl text-sm resize-none"
              defaultValue={submission?.notes ?? ""}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl font-bold text-sm brand-gradient hover:opacity-95 text-white border-0 shadow-lg shadow-[#f95c4b]/20 transition-all cursor-pointer"
          >
            {loading ? (
              <><Loader2 className="mr-2 size-4 animate-spin" /> Submitting…</>
            ) : (
              <><Send className="mr-2 size-4" /> {submission?.status === "rejected" ? "Resubmit for Review" : "Submit for Review"}</>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────── TASK CARD ─────────── */
function TaskCard({
  task,
  domain,
  appId,
  tasksReady,
  submissionStatus,
  onSubmitted,
}: {
  task: {
    id: string;
    taskNumber: number;
    title: string;
    description: string;
    features: string[];
    outcome: string;
    submission: Submission | undefined;
    dueDate: Date;
    status: TaskStatus;
    remaining: number;
    isLocked?: boolean;
    lockReason?: string;
  };
  domain: { slug: string; name: string; icon: string; color: string } | undefined;
  appId: string;
  tasksReady: boolean;
  submissionStatus?: string;
  onSubmitted: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { submission, status, dueDate, remaining, isLocked, lockReason } = task;
  const isOverdue = status === "overdue";

  const loadHistory = async () => {
    if (!submission) return;
    if (showHistory) { setShowHistory(false); return; }
    const { data } = await (supabase.from("submission_history" as any) as any)
      .select("*").eq("submission_id", submission.id)
      .eq("table_name", "submissions").order("created_at", { ascending: false });
    setHistory(data ?? []);
    setShowHistory(true);
  };

  const borderColor = isOverdue ? "#EF4444" : status === "completed" ? "#16A34A" : status === "ongoing" ? "#2563EB" : "#D97706";

  return (
    <>
      <TaskSubmitDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={task}
        domain={domain}
        appId={appId}
        onSubmitted={onSubmitted}
      />
      <div
        className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03),0_6px_20px_rgba(0,0,0,0.05)] transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${
          isLocked ? "opacity-75 bg-slate-50/50 dark:bg-slate-900/30" : "hover:-translate-y-1.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.06),0_16px_36px_rgba(0,0,0,0.08)]"
        }`}
        style={{ borderLeft: `5px solid ${borderColor}` }}
      >
        {/* Header Info: Task Badge & Status Pill */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          {task.taskNumber === 0 ? (
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#0077b5] text-white shadow-sm shrink-0">
              <Linkedin className="size-4" />
            </div>
          ) : (
            <div className="flex size-9 items-center justify-center rounded-xl border border-blue-200 bg-blue-50/50 font-bold text-blue-700 text-sm shadow-sm shrink-0">
              {task.taskNumber}
            </div>
          )}
          <StatusPill status={status} isOverdue={isOverdue} />
        </div>

        {/* Due Date & Submission Status */}
        <div className="px-5 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium">
            <CalendarDays className="size-3.5 shrink-0 text-muted-foreground/60" />
            <span>Due Date: <span className="font-bold text-foreground">{formatDate(dueDate)}</span></span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            {status === "completed" ? (
              <><CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" /><span className="text-emerald-700 font-semibold">Admin Verified ✅</span></>
            ) : status === "ongoing" ? (
              <><CheckCircle2 className="size-3.5 text-blue-500 shrink-0" /><span className="text-blue-600 font-semibold">Submitted for review</span></>
            ) : isOverdue ? (
              <><AlertCircle className="size-3.5 text-red-500 shrink-0" /><span className="text-red-600 font-semibold">Overdue Submission</span></>
            ) : (
              <><AlertCircle className="size-3.5 text-amber-500 shrink-0" /><span className="text-amber-600 font-semibold">Pending Submission</span></>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="px-5 pt-4 text-base font-extrabold text-foreground tracking-tight leading-snug">
          {task.title}
        </h3>

        {/* Description */}
        <p className="px-5 pt-1.5 text-xs text-muted-foreground leading-relaxed">
          {task.description}
        </p>

        {/* Key Features */}
        {task.features.length > 0 && (
          <div className="px-5 pt-4">
            <h4 className="text-xs font-bold text-blue-700 tracking-wide uppercase">Key Features:</h4>
            <ul className="mt-2 space-y-1">
              {task.features.map((f, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground leading-relaxed">
                  <span className="text-blue-500 font-bold select-none">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Expected Outcome */}
        {task.outcome && (
          <div className="px-5 pt-4">
            <h4 className="text-xs font-bold text-emerald-700 tracking-wide uppercase">Expected Outcome:</h4>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{task.outcome}</p>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1 min-h-[20px]" />

        {/* Action Area / Footer */}
        <div className="border-t border-border/40 p-5 mt-4">
          {status === "completed" ? (
            <div className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 py-2.5 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>Admin Verified & Passed!</span>
            </div>
          ) : isLocked ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-muted/40 border border-border/40 py-3 px-3 text-xs text-muted-foreground font-medium text-center">
              <Lock className="size-4 shrink-0 text-muted-foreground" />
              <span>{lockReason || "Task is locked."}</span>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Feedback banner on task card */}
              {submission?.feedback && (
                <div className={`rounded-xl border p-3 text-xs ${
                  submission.status === "approved" ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-300" :
                  submission.status === "rejected" ? "border-rose-200 bg-rose-50 text-rose-900 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-300" :
                  "border-blue-200 bg-blue-50 text-blue-900 dark:bg-blue-950/30 dark:border-blue-900/40 dark:text-blue-300"
                }`}>
                  <div className="flex items-center gap-1.5 font-bold mb-0.5">
                    <MessageSquare className="size-3.5 shrink-0" />
                    <span>Mentor Feedback ({submission.status}):</span>
                  </div>
                  <p className="pl-5 text-xs leading-relaxed opacity-90">{submission.feedback}</p>
                </div>
              )}
              {!tasksReady ? (
                <Button disabled className="w-full text-xs h-10 rounded-xl opacity-60">
                  <Loader2 className="mr-1.5 size-4 animate-spin" /> Syncing tasks…
                </Button>
              ) : (
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="w-full text-xs font-bold h-10 rounded-xl transition-all"
                  variant={submission?.status === "rejected" ? "destructive" : status === "ongoing" ? "outline" : isOverdue ? "destructive" : "default"}
                >
                  {submission?.status === "rejected" ? (
                    <><AlertCircle className="mr-1.5 size-4" /> Resubmit Revision</>
                  ) : status === "ongoing" ? (
                    <><ArrowRight className="mr-1.5 size-4" /> Update Submission</>
                  ) : isOverdue ? (
                    <><Clock className="mr-1.5 size-4" /> Submit Late</>
                  ) : (
                    <><ExternalLink className="mr-1.5 size-4" /> Submit Task</>
                  )}
                </Button>
              )}
              {submission && (
                <button onClick={loadHistory} className="w-full mt-1 flex items-center justify-center gap-1.5 rounded-lg bg-transparent px-3 py-1.5 text-[10px] font-medium text-muted-foreground transition hover:bg-accent/30">
                  <Clock className="size-3" /> {showHistory ? "Hide History" : "View History"}
                </button>
              )}
              {showHistory && (
                <div className="rounded-xl border border-border/40 bg-secondary/20 p-3">
                  <p className="mb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Submission History</p>
                  {history.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground">No history recorded yet.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {history.map((h: any, i: number) => (
                        <div key={h.id} className="flex items-start gap-2 text-[10px]">
                          <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-muted text-[7px] font-bold text-muted-foreground">{i + 1}</span>
                          <div>
                            <p>
                              <span className={`font-semibold ${h.new_status === "approved" ? "text-green-600" : h.new_status === "rejected" ? "text-red-600" : "text-amber-600"}`}>
                                {h.previous_status ?? "—"} → {h.new_status}
                              </span>
                            </p>
                            <p className="text-muted-foreground">{new Date(h.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                            {h.reason && <p className="text-red-500 italic">Reason: {h.reason}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}


/* ─────────── STATUS PILL ─────────── */
function StatusPill({ status, isOverdue }: { status: TaskStatus; isOverdue: boolean }) {
  const config = isOverdue
    ? {
        label: "Overdue",
        bg: "rgba(239,68,68,0.12)",
        color: "#DC2626",
        border: "#FCA5A5",
        icon: AlertCircle,
      }
    : status === "completed"
      ? {
          label: "Completed",
          bg: "rgba(22,163,74,0.12)",
          color: "#16A34A",
          border: "#86EFAC",
          icon: CheckCircle2,
        }
      : status === "ongoing"
        ? {
            label: "In Progress",
            bg: "rgba(37,99,235,0.12)",
            color: "#2563EB",
            border: "#93C5FD",
            icon: Clock,
          }
        : {
            label: "Pending",
            bg: "rgba(217,119,6,0.12)",
            color: "#D97706",
            border: "#FCD34D",
            icon: AlertCircle,
          };

  const Icon = config.icon;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold backdrop-blur-sm transition-all duration-300"
      style={{ backgroundColor: config.bg, color: config.color, borderColor: config.border }}
    >
      <Icon className="size-3" />
      {config.label}
    </span>
  );
}
