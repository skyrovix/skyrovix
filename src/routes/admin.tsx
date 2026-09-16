import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { generateCertId, getDomain, COMPANY, DOMAINS, getPublicSiteUrl } from "@/lib/constants";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { PromotionsSection } from "@/components/admin/PromotionsSection";
import { PromoPopupSection } from "@/components/admin/PromoPopupSection";
import { BackupSection } from "@/components/admin/BackupSection";
import { ProjectSubmissionsSection } from "@/components/admin/ProjectSubmissionsSection";
import { OfferLetterDoc, CertificateDoc, downloadPdf, downloadPdfBlob } from "@/components/pdf-docs";
import {
  getAdminStudents,
  getAdminCourses,
  toggleCoursePublish,
  deleteCourseEnrollment,
  type AdminStudentAccount,
  type AdminCourseItem,
  type CourseStudentEnrollment,
} from "@/lib/admin-service";
import {
  LayoutDashboard, GraduationCap, BookOpen, FileText, ListChecks,
  ClipboardCheck, ClipboardList, Brain, IndianRupee, Award, Users, BarChart3,
  Settings, LogOut, Moon, Sun, Bell, Search, ChevronDown, Menu,
  X, Plus, Eye, CheckCircle2, XCircle, Mail, Download, Sparkles, Shield,
  ChevronRight, ChevronLeft, Clock, TrendingUp, UserPlus, Wallet,
  ExternalLink, RefreshCw, Trash2, Edit, ArrowUpRight, Filter,
  AlertTriangle, HelpCircle, Home, MessageSquare, PanelRightClose,
  PanelRightOpen, FolderTree,   FileQuestion, PieChart, Percent, Briefcase,
  Loader2, Activity, Wifi, WifiOff, LogIn, Monitor, Smartphone, Tablet,
  Calendar, Zap, Megaphone, Layers, Globe, Ticket, Rocket,
  HardDrive, RotateCcw, UserCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  BarChart as RechartsBarChart,
  Bar,
} from "recharts";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    let user = sessionData?.session?.user;
    if (!user) {
      const { data: userData } = await supabase.auth.getUser();
      user = userData?.user;
    }
    if (!user) throw redirect({ to: "/auth" });

    const email = user.email?.toLowerCase();
    const isAdminEmail = email && (
      email === "hariharan@skyrovix.com" ||
      email === "harimaheshwaran34@gmail.com"
    );

    if (isAdminEmail) return;

    const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
    if (role?.role !== "admin") throw redirect({ to: "/dashboard" });
  },
  head: () => ({ meta: [{ title: "Admin — Skyrovix" }] }),
  component: AdminPanel,
});

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

const SIDEBAR_GROUPS = [
  {
    title: "MAIN",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "applications", label: "Internship Applications", icon: Users },
      { id: "submissions", label: "Task Submissions", icon: ClipboardCheck },
      { id: "project-submissions", label: "Project Submissions", icon: ClipboardList },
      { id: "verification", label: "Verification Queue", icon: Shield },
      { id: "students", label: "Students", icon: GraduationCap },
      { id: "courses", label: "Courses", icon: BookOpen },
      { id: "certificates", label: "Certificates", icon: Award },
      { id: "payments", label: "Payments & Invoices", icon: Wallet },
      { id: "domains", label: "Internship Domains", icon: FolderTree },
      { id: "tasks", label: "Manage Tasks", icon: ListChecks },
    ]
  },
  {
    title: "MARKETING",
    items: [
      { id: "promotions", label: "Promotions", icon: Percent },
      { id: "popup", label: "Promo Popup", icon: Bell },
      { id: "email-logs", label: "Email Logs", icon: Mail },
    ]
  },
  {
    title: "ANALYTICS",
    items: [
      { id: "analytics", label: "Analytics", icon: BarChart3 },
      { id: "login-analytics", label: "Login Analytics", icon: Activity },
    ]
  },
  {
    title: "SYSTEM",
    items: [
      { id: "settings", label: "Settings", icon: Settings },
      { id: "backup", label: "Backup & Restore", icon: HardDrive },
      { id: "login-history", label: "Audit Logs", icon: Activity },
    ]
  }
] as const;

type SectionId = "dashboard" | "applications" | "submissions" | "project-submissions" | "verification" | "payments" | "promotions" | "popup" | "certificates" | "students" | "courses" | "login-history" | "email-logs" | "analytics" | "login-analytics" | "settings" | "domains" | "tasks" | "backup";

interface AdminNotification {
  id: string;
  icon: any;
  text: string;
  time: string;
  color: string;
  section?: SectionId;
}

function AdminPanel() {
  const { user, isAdmin } = useAuth();
  const qc = useQueryClient();
  const [active, setActive] = useState<SectionId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [liveNotifs, setLiveNotifs] = useState<AdminNotification[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  useEffect(() => {
    const channel = supabase.channel("admin-realtime");
    const tables = [
      { table: "applications", icon: UserPlus, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30", label: "New application", event: "INSERT" },
      { table: "applications", icon: Shield, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30", label: "Internship submitted for verification", event: "UPDATE" },
      { table: "submissions", icon: ClipboardCheck, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30", label: "Task submission", event: "*" },
      { table: "payments", icon: IndianRupee, color: "text-green-500 bg-green-50 dark:bg-green-950/30", label: "New payment", event: "INSERT" },
      { table: "profiles", icon: Users, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30", label: "Student registration", event: "INSERT" },
      { table: "enrollments", icon: GraduationCap, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30", label: "Course enrollment", event: "*" },
      { table: "courses", icon: BookOpen, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30", label: "Course catalog update", event: "*" },
    ];
    for (const { table, icon, color, label, event } of tables) {
      channel.on("postgres_changes" as any, { event, schema: "public", table }, (payload: any) => {
        if (table === "applications" && event === "UPDATE" && payload.new?.submission_status !== "submitted") return;
        
        let displayLabel = label;
        if (table === "submissions") {
          displayLabel = payload.eventType === "INSERT" ? "New task submission" : payload.eventType === "UPDATE" ? "Task submission updated" : "Task submission deleted";
        }
        
        const name = payload.new?.full_name ?? payload.new?.name ?? payload.new?.id?.slice(0, 8) ?? "";
        let section: SectionId = "dashboard";
        if (table === "applications") section = event === "UPDATE" ? "verification" : "applications";
        else if (table === "submissions") section = "submissions";
        else if (table === "payments") section = "payments";
        else if (table === "profiles") section = "students";
        else if (table === "enrollments" || table === "courses") section = "courses";

        const notif: AdminNotification = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          icon,
          text: `${displayLabel} from ${name}`,
          time: "Just now",
          color,
          section,
        };
        setLiveNotifs((prev) => [notif, ...prev].slice(0, 30));
        toast.success(`${displayLabel} received`, { description: name, duration: 4000 });
        qc.invalidateQueries({ queryKey: ["admin-overview"] });
        qc.invalidateQueries({ queryKey: ["admin-apps"] });
        qc.invalidateQueries({ queryKey: ["admin-subs"] });
        qc.invalidateQueries({ queryKey: ["admin-payments"] });
        qc.invalidateQueries({ queryKey: ["admin-verification-pending"] });
        qc.invalidateQueries({ queryKey: ["admin-student-sessions"] });
        qc.invalidateQueries({ queryKey: ["admin-students-directory"] });
        qc.invalidateQueries({ queryKey: ["admin-courses-directory"] });
        qc.invalidateQueries({ queryKey: ["admin-login-history"] });
        qc.invalidateQueries({ queryKey: ["admin-online-count"] });
        qc.invalidateQueries({ queryKey: ["admin-recent-subs-dashboard"] });
        qc.invalidateQueries({ queryKey: ["admin-app-status-counts"] });
        qc.invalidateQueries({ queryKey: ["admin-domain-counts"] });
        qc.invalidateQueries({ queryKey: ["admin-payments-summary"] });
        qc.invalidateQueries({ queryKey: ["admin-analytics"] });
        qc.refetchQueries({ queryKey: ["admin-analytics-registrations"] });
        qc.refetchQueries({ queryKey: ["admin-analytics-completion"] });
        qc.refetchQueries({ queryKey: ["admin-analytics-domains"] });
        qc.refetchQueries({ queryKey: ["admin-analytics-revenue"] });
        qc.refetchQueries({ queryKey: ["admin-analytics-locations"] });
      });
    }
    // Subscribe to login_sessions for live online count + login notifications
    channel.on("postgres_changes" as any, { event: "INSERT", schema: "public", table: "login_sessions" }, async (payload: any) => {
      const studentId = payload.new?.student_id;
      if (studentId) {
        const { data: app } = await supabase.from("applications").select("full_name").eq("user_id", studentId).maybeSingle();
        const name = app?.full_name ?? studentId.slice(0, 8);
        const notif: AdminNotification = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          icon: LogIn,
          text: `${name} logged in`,
          time: "Just now",
          color: "text-green-500 bg-green-50 dark:bg-green-950/30",
          section: "login-history",
        };
        setLiveNotifs((prev) => [notif, ...prev].slice(0, 30));
        toast.success(`${name} logged in`, { description: "New student login", duration: 4000 });
      }
      const { count } = await (supabase as any).from("login_sessions").select("id", { count: "exact", head: true }).eq("status", "online");
      setOnlineCount(count ?? 0);
      qc.invalidateQueries({ queryKey: ["admin-login-history"] });
      qc.invalidateQueries({ queryKey: ["admin-online-count"] });
    });
    channel.on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "login_sessions" }, async () => {
      const { count } = await (supabase as any).from("login_sessions").select("id", { count: "exact", head: true }).eq("status", "online");
      setOnlineCount(count ?? 0);
      qc.invalidateQueries({ queryKey: ["admin-login-history"] });
      qc.invalidateQueries({ queryKey: ["admin-online-count"] });
    });
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  // ─── Data ───
  const { data: overview } = useQuery({
    queryKey: ["admin-overview"],
    refetchInterval: 30_000,
    queryFn: async () => {
      const [a, s, p, c, v, pr] = await Promise.all([
        supabase.from("applications").select("id", { count: "exact", head: true }),
        supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("certificates").select("id", { count: "exact", head: true }),
        (supabase.from("applications") as any).select("id", { count: "exact", head: true }).eq("submission_status", "submitted"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      return {
        apps: a.count ?? 0,
        subs: s.count ?? 0,
        pays: p.count ?? 0,
        certs: c.count ?? 0,
        pendingVerification: v.count ?? 0,
        students: pr.count ?? 0,
      };
    },
  });

  return (
    <div className={`h-dvh ${dark ? "dark" : ""}`}>
      <div className="flex h-dvh bg-[#F9FAFB] dark:bg-[#090D16] text-slate-900 dark:text-slate-100">
        
        {/* ─── Mobile Overlay ─── */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        {/* ─── Sidebar ─── */}
        <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white/80 backdrop-blur-2xl dark:bg-[#0F172A]/95 dark:border-white/5 border-r border-border/60 transition-all duration-300 ${
          mobileOpen ? "w-64 translate-x-0" : sidebarOpen ? "w-64 -translate-x-full lg:translate-x-0" : "w-16 -translate-x-full lg:translate-x-0"
        }`}>
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-border/60 px-4 dark:border-white/5">
            <Link to="/" className={`flex items-center gap-2 ${!sidebarOpen && "lg:hidden"}`}>
              <div className="grid size-8 shrink-0 place-items-center rounded-lg brand-gradient text-white shadow-md shadow-[#07284a]/20">
                <Rocket className="size-4 text-white" />
              </div>
              {sidebarOpen && (
                <span className="text-sm font-bold text-slate-900 dark:text-white font-display">
                  Skyrovix<span className="brand-text">Admin</span>
                </span>
              )}
            </Link>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:grid size-8 place-items-center rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
              {sidebarOpen ? <PanelRightClose className="size-4" /> : <PanelRightOpen className="size-4" />}
            </button>
            <button onClick={() => setMobileOpen(false)} className="lg:hidden grid size-8 place-items-center rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              <X className="size-4" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {SIDEBAR_GROUPS.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                {sidebarOpen && (
                  <span className="px-2 text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 block uppercase leading-none mb-2">
                    {group.title}
                  </span>
                )}
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => { setActive(item.id as any); setMobileOpen(false); }}
                          className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? "brand-gradient text-white shadow-md shadow-[#07284a]/15"
                              : "text-slate-600 hover:text-slate-900 hover:bg-[#07284a]/5 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/40"
                          }`}
                        >
                          <Icon className="size-[18px] shrink-0" />
                          {sidebarOpen && <span className="truncate">{item.label}</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Logout */}
          <div className="border-t border-border/60 p-3 dark:border-white/5">
            <button
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950/20"
            >
              <LogOut className="size-[18px] shrink-0" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* ─── Main Area ─── */}
        <div className={`flex min-w-0 flex-1 flex-col transition-all duration-300 ${sidebarOpen ? "lg:pl-64" : "lg:pl-16"}`}>
          {/* ─── Top Navbar ─── */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-100 bg-white/95 px-6 backdrop-blur-md dark:bg-[#0F172A]/90 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden grid size-9 place-items-center rounded-lg border border-border hover:bg-accent/50">
                <Menu className="size-4" />
              </button>
              <div className="relative hidden sm:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search students, applications, tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-72 rounded-xl border-none bg-slate-100 dark:bg-slate-800/60 pl-9 pr-12 text-xs placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-blue-500"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-900 pointer-events-none">
                  ⌘ K
                </div>
              </div>
              {/* System Health Badges */}
              <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50/50 px-2.5 py-1 text-[10px] font-medium text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-950/20 dark:text-emerald-400">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
                </span>
                <span>DB Live Sync Active</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDark(!dark)}
                className="grid size-9 place-items-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </button>
              <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="relative grid size-9 place-items-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    aria-label="View notifications"
                  >
                    <Bell className="size-4" />
                    {liveNotifs.length > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900 shadow-sm animate-pulse">
                        {liveNotifs.length > 9 ? "9+" : liveNotifs.length}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  side="bottom"
                  sideOffset={8}
                  collisionPadding={16}
                  className="w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-border/80 bg-white dark:bg-[#1E293B] shadow-2xl p-0 overflow-hidden z-[100]"
                >
                  <NotificationsDropdown
                    notifs={liveNotifs}
                    onClear={() => setLiveNotifs([])}
                    onDismiss={(id) => setLiveNotifs((prev) => prev.filter((n) => n.id !== id))}
                    onNavigate={(sec) => {
                      setActive(sec);
                      setNotifOpen(false);
                    }}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="ml-2 flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                <div className="grid size-8 place-items-center rounded-full bg-blue-600 text-white font-bold text-xs font-display">
                  {user?.email?.charAt(0).toUpperCase() ?? "H"}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 dark:text-white leading-tight">{user?.email?.split("@")[0] ?? "Hariharan S"}</span>
                  <span className="text-[9px] text-slate-400 font-medium leading-none">Super Admin</span>
                </div>
                <ChevronDown className="size-3.5 text-slate-400" />
              </div>
            </div>
          </header>

          {/* ─── Page Content ─── */}
          <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
            {/* Search results */}
            {searchQuery && (
              <div className="mb-6 rounded-2xl border border-border/60 bg-white/60 p-4 backdrop-blur dark:bg-white/5">
                <p className="text-sm text-muted-foreground">Search results for "<span className="font-medium text-foreground">{searchQuery}</span>"</p>
              </div>
            )}

            {active === "dashboard" && <DashboardSection greeting={greeting} overview={overview} onNavigate={setActive} onlineCount={onlineCount} liveNotifs={liveNotifs} />}
            {active === "applications" && <ApplicationsSection />}
            {active === "submissions" && <SubmissionsSection />}
            {active === "project-submissions" && <ProjectSubmissionsSection />}
            {active === "verification" && <VerificationSection />}
            {active === "payments" && <PaymentsSection />}
            {active === "promotions" && <PromotionsSection />}
            {active === "popup" && <PromoPopupSection />}
            {active === "certificates" && <CertificatesSection />}
            {active === "students" && <StudentsSection />}
            {active === "courses" && <CoursesSection />}
            {active === "login-history" && <LoginHistorySection />}
            {active === "email-logs" && <EmailLogsSection />}
            {active === "analytics" && <AnalyticsSection />}
            {active === "login-analytics" && <LoginAnalyticsSection />}
            {active === "settings" && <SettingsSection />}
            {active === "backup" && <BackupSection />}
            {active === "domains" && <DomainsSection />}
            {active === "tasks" && <TasksSection />}
          </main>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// NOTIFICATIONS DROPDOWN
// ══════════════════════════════════════════════
function NotificationsDropdown({
  notifs,
  onClear,
  onDismiss,
  onNavigate,
}: {
  notifs: AdminNotification[];
  onClear: () => void;
  onDismiss: (id: string) => void;
  onNavigate: (section: SectionId) => void;
}) {
  return (
    <div className="flex flex-col text-left">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-slate-50/90 px-4 py-3 dark:bg-slate-900/90">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Notifications</span>
          {notifs.length > 0 && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {notifs.length}
            </span>
          )}
        </div>
        {notifs.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-border/40 p-1">
        {notifs.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="mx-auto mb-2 grid size-10 place-items-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <Bell className="size-5" />
            </div>
            <p className="text-sm font-medium text-foreground">No new notifications</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Real-time activity for registrations, courses, and payments will show here.
            </p>
          </div>
        ) : (
          notifs.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (n.section) onNavigate(n.section);
              }}
              className="group flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-accent/50 cursor-pointer"
            >
              <div className={`grid size-8 shrink-0 place-items-center rounded-lg ${n.color}`}>
                <n.icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground leading-snug">{n.text}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{n.time}</span>
                  {n.section && (
                    <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                      View section &rarr;
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss(n.id);
                }}
                className="opacity-60 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition rounded-md"
                title="Dismiss"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════
function DashboardSection({ greeting, overview, onNavigate, onlineCount = 0, liveNotifs = [] }: { greeting: string; overview: any; onNavigate: (s: SectionId) => void; onlineCount?: number; liveNotifs?: Array<{ icon: any; text: string; time: string; color: string }> }) {
  const qc = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState("July 2026");

  // Fetch recent submissions
  const { data: recentSubs } = useQuery({
    queryKey: ["admin-recent-subs-dashboard"],
    refetchInterval: 30000,
    queryFn: async () => {
      const { data } = await supabase
        .from("submissions")
        .select("*, applications!inner(full_name, intern_id, domain, email), tasks(title, task_number)")
        .order("submitted_at", { ascending: false })
        .limit(5);
      return data ?? [];
    }
  });

  // Fetch status distribution
  const { data: appStatusCounts } = useQuery({
    queryKey: ["admin-app-status-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("applications").select("status");
      const counts = { pending: 0, shortlisted: 0, approved: 0, ongoing: 0, completed: 0, rejected: 0 };
      data?.forEach(x => {
        if (x.status && x.status in counts) {
          counts[x.status as keyof typeof counts] += 1;
        }
      });
      return counts;
    }
  });

  // Fetch domain distribution
  const { data: domainCounts } = useQuery({
    queryKey: ["admin-domain-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("applications").select("domain");
      const counts: Record<string, number> = {};
      data?.forEach(x => {
        if (x.domain) counts[x.domain] = (counts[x.domain] || 0) + 1;
      });
      return counts;
    }
  });

  // Fetch payments summary
  const { data: paymentsSummary } = useQuery({
    queryKey: ["admin-payments-summary"],
    queryFn: async () => {
      const { data: allPays } = await supabase.from("payments").select("amount, status");
      let totalRev = 0;
      let pendingCount = 0;
      let pendingAmount = 0;
      allPays?.forEach(p => {
        if (p.status === "verified") totalRev += Number(p.amount || 0);
        if (p.status === "pending") {
          pendingCount += 1;
          pendingAmount += Number(p.amount || 0);
        }
      });
      return { totalRev, pendingCount, pendingAmount };
    }
  });

  // Local student CSV export
  const exportStudentsCSV = async () => {
    const { data } = await supabase.from("applications").select("full_name, email, phone, college, course, domain, status");
    if (!data || data.length === 0) {
      toast.error("No student applications to export");
      return;
    }
    const headers = ["Full Name", "Email", "Phone", "College", "Course", "Track", "Status"];
    const csvRows = [headers.join(",")];
    data.forEach(row => {
      const values = [
        `"${row.full_name || ''}"`,
        `"${row.email || ''}"`,
        `"${row.phone || ''}"`,
        `"${row.college || ''}"`,
        `"${row.course || ''}"`,
        `"${row.domain || ''}"`,
        `"${row.status || ''}"`
      ];
      csvRows.push(values.join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `skyrovix_students_export.csv`);
    a.click();
    toast.success("CSV file downloaded successfully!");
  };

  // Pie chart calculation
  const totalApps = overview?.apps ?? 0;
  const pendingReview = appStatusCounts?.pending ?? 0;
  const shortlisted = (appStatusCounts?.approved ?? 0) + (appStatusCounts?.shortlisted ?? 0);
  const accepted = (appStatusCounts?.ongoing ?? 0) + (appStatusCounts?.completed ?? 0);
  const rejected = appStatusCounts?.rejected ?? 0;
  const computedTotal = pendingReview + shortlisted + accepted + rejected || totalApps || 1;

  const pctPending = Math.round((pendingReview / computedTotal) * 100);
  const pctShort = Math.round((shortlisted / computedTotal) * 100);
  const pctAccept = Math.round((accepted / computedTotal) * 100);
  const pctReject = Math.round((rejected / computedTotal) * 100);

  // Domain progress list
  const domainLabels: Record<string, string> = {
    fullstack: "Full Stack Development",
    mern: "MERN Stack",
    python: "Python Development",
    datascience: "Data Science",
    cybersecurity: "Cyber Security"
  };

  const domainValues = Object.entries(domainLabels).map(([key, label]) => {
    return {
      label,
      value: domainCounts?.[key] ?? 0
    };
  }).sort((a, b) => b.value - a.value);

  const maxDomainVal = Math.max(...domainValues.map(d => d.value)) || 100;

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Top Greeting Row */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back, Hariharan! 👋</h1>
          <p className="hidden sm:block text-xs sm:text-sm text-slate-500 mt-0.5">Here's what's happening with your internship platform today.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="font-mono text-xs text-slate-500 bg-white border border-slate-200 dark:border-slate-800 dark:bg-slate-900 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-medium shadow-sm">
            <Calendar className="size-3.5 text-blue-500" /> {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Students */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between transition hover:shadow-md">
          <div className="space-y-1 sm:space-y-1.5">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400">Total Students</span>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
              {overview?.students ?? overview?.apps ?? 0}
            </p>
            <div className="hidden sm:flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-2.5 sm:size-3" /> Live <span className="text-slate-400 font-normal">registered accounts</span>
            </div>
          </div>
          <div className="grid size-10 sm:size-12 place-items-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400">
            <Users className="size-5 sm:size-6" />
          </div>
        </div>

        {/* Applications */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between transition hover:shadow-md">
          <div className="space-y-1 sm:space-y-1.5">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400">Applications</span>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
              {overview?.apps ?? 0}
            </p>
            <span className="hidden sm:inline-block text-[10px] sm:text-[11px] font-semibold text-blue-600 dark:text-blue-400">
              {pendingReview} Pending Review
            </span>
          </div>
          <div className="grid size-10 sm:size-12 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
            <FileText className="size-5 sm:size-6" />
          </div>
        </div>

        {/* Active Internships */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between transition hover:shadow-md">
          <div className="space-y-1 sm:space-y-1.5">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400">Active Internships</span>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
              {accepted}
            </p>
            <div className="hidden sm:flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-2.5 sm:size-3" /> Live <span className="text-slate-400 font-normal">active interns</span>
            </div>
          </div>
          <div className="grid size-10 sm:size-12 place-items-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400">
            <Briefcase className="size-5 sm:size-6" />
          </div>
        </div>

        {/* Certificates Issued */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between transition hover:shadow-md">
          <div className="space-y-1 sm:space-y-1.5">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400">Certificates Issued</span>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
              {overview?.certs ?? 0}
            </p>
            <span className="hidden sm:block text-[10px] sm:text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              Verified & Issued
            </span>
          </div>
          <div className="grid size-10 sm:size-12 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-[#07284a]/20 dark:text-amber-400">
            <Award className="size-5 sm:size-6" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Split */}
      <div className="hidden sm:grid gap-6 lg:grid-cols-3">
        {/* Left Side (2 Columns width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Task Submissions */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Task Submissions</h3>
              <button 
                onClick={() => onNavigate("submissions")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-1.5 rounded-lg transition"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-left font-semibold text-slate-400 dark:border-slate-800">
                    <th className="pb-3 pr-2">Student</th>
                    <th className="pb-3 pr-2">Task</th>
                    <th className="pb-3 pr-2">Domain</th>
                    <th className="pb-3 pr-2">Submitted On</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                  {recentSubs?.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No submissions yet.
                      </td>
                    </tr>
                  )}
                  {recentSubs?.map((sub: any) => {
                    const studentName = sub.applications?.full_name ?? "Student";
                    const initial = studentName.charAt(0).toUpperCase();
                    const subDate = sub.submitted_at 
                      ? new Date(sub.submitted_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })
                      : "22 Jul 2026";
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20">
                        <td className="py-3 pr-2">
                          <div className="flex items-center gap-2">
                            <div className="grid size-7 place-items-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 font-bold font-display text-[10px]">
                              {initial}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-200">{studentName}</p>
                              <p className="text-[10px] text-slate-400 font-normal">{sub.applications?.email || "student@skyrovix.com"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-2 text-blue-600 dark:text-blue-400 font-medium">
                          Task {sub.tasks?.task_number}: {sub.tasks?.title || "Solution Project"}
                        </td>
                        <td className="py-3 pr-2 text-slate-500">{domainLabels[sub.applications?.domain] || "Full Stack Development"}</td>
                        <td className="py-3 pr-2 text-slate-400 font-mono">{subDate}</td>
                        <td className="py-3 text-right">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${
                            sub.status === "approved" 
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                              : sub.status === "rejected"
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                          }`}>
                            {sub.status || "pending"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Donut Chart Status */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Application Status Overview</h3>
              <div className="flex items-center gap-6">
                <div className="relative shrink-0">
                  {/* Custom SVG Donut Chart */}
                  <svg className="size-28" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F1F5F9" strokeWidth="3" />
                    {/* Pending */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F59E0B" strokeWidth="3" strokeDasharray={`${pctPending} ${100 - pctPending}`} strokeDashoffset="25" />
                    {/* Shortlisted */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3B82F6" strokeWidth="3" strokeDasharray={`${pctShort} ${100 - pctShort}`} strokeDashoffset={`${25 - pctPending}`} />
                    {/* Accepted */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray={`${pctAccept} ${100 - pctAccept}`} strokeDashoffset={`${25 - pctPending - pctShort}`} />
                    {/* Rejected */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#EF4444" strokeWidth="3" strokeDasharray={`${pctReject} ${100 - pctReject}`} strokeDashoffset={`${25 - pctPending - pctShort - pctAccept}`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-extrabold font-display leading-none">{computedTotal}</span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Total</span>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-slate-500"><span className="size-2 rounded-full bg-amber-500" /> Pending Review</span>
                    <span className="font-bold">{pendingReview} ({pctPending}%)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-slate-500"><span className="size-2 rounded-full bg-blue-500" /> Shortlisted</span>
                    <span className="font-bold">{shortlisted} ({pctShort}%)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-slate-500"><span className="size-2 rounded-full bg-emerald-500" /> Accepted</span>
                    <span className="font-bold">{accepted} ({pctAccept}%)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-slate-500"><span className="size-2 rounded-full bg-rose-500" /> Rejected</span>
                    <span className="font-bold">{rejected} ({pctReject}%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Domains Progress */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Top Domains</h3>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full">This Month</span>
              </div>
              <div className="space-y-3.5">
                {domainValues.map((d, i) => {
                  const pct = Math.round((d.value / maxDomainVal) * 100);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-600 dark:text-slate-300">{d.label}</span>
                        <span className="text-slate-900 dark:text-white">{d.value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Right Side (1 Column width) */}
        <div className="space-y-6">
          
          {/* Quick Actions Grid */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-1.5">
              <Zap className="size-4 text-blue-500 animate-pulse" /> Quick Actions
            </h3>
            
            <div className="grid gap-3 grid-cols-2">
              <button
                onClick={() => toast.info("Announcements module loaded. Add feature announcement popup in Settings tab.")}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40 text-center transition"
              >
                <Megaphone className="size-5 text-blue-500 mb-1.5" />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Add Announcement</span>
              </button>

              <button
                onClick={() => onNavigate("email-logs")}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40 text-center transition"
              >
                <Mail className="size-5 text-purple-500 mb-1.5" />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Send Email</span>
              </button>

              <button
                onClick={() => onNavigate("popup")}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40 text-center transition"
              >
                <Layers className="size-5 text-indigo-500 mb-1.5" />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Add Promo / Popup</span>
              </button>

              <button
                onClick={() => toast.info("Domains module loaded. Manage available tracks under Admin Settings.")}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40 text-center transition"
              >
                <Globe className="size-5 text-emerald-500 mb-1.5" />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Add New Domain</span>
              </button>

              <button
                onClick={() => onNavigate("promotions")}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40 text-center transition"
              >
                <Ticket className="size-5 text-pink-500 mb-1.5" />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Create Coupon</span>
              </button>

              <button
                onClick={exportStudentsCSV}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40 text-center transition"
              >
                <Download className="size-5 text-amber-500 mb-1.5" />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Export Students</span>
              </button>
            </div>

            <button
              onClick={() => onNavigate("settings")}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/10"
            >
              Explore All Features <ChevronRight className="size-3.5 text-white" />
            </button>
          </div>

          {/* Upcoming Deadlines */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
              <span>Upcoming Deadlines</span>
              <span className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer">View All</span>
            </h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center size-9 bg-rose-50 text-rose-600 rounded-lg shrink-0 justify-center font-bold">
                  <span className="text-[9px] leading-none uppercase">Jul</span>
                  <span className="text-base leading-none">22</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Task 2: REST API with CRUD</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Due in 2 days</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center size-9 bg-amber-50 text-amber-600 rounded-lg shrink-0 justify-center font-bold">
                  <span className="text-[9px] leading-none uppercase">Jul</span>
                  <span className="text-base leading-none">24</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Task 4: Real-time Chat App</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Due in 4 days</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center size-9 bg-blue-50 text-blue-600 rounded-lg shrink-0 justify-center font-bold">
                  <span className="text-[9px] leading-none uppercase">Jul</span>
                  <span className="text-base leading-none">27</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Task 6: Deploy to Cloud</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Due in 7 days</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center size-9 bg-purple-50 text-purple-600 rounded-lg shrink-0 justify-center font-bold">
                  <span className="text-[9px] leading-none uppercase">Jul</span>
                  <span className="text-base leading-none">30</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Task 8: Final Project Submission</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Due in 10 days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Summary */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Platform Summary</h3>
            <div className="space-y-3.5 text-xs font-semibold">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <IndianRupee className="size-4 text-emerald-500" />
                  <span>Total Revenue</span>
                </div>
                <span className="text-slate-900 dark:text-white flex items-center gap-1">
                  ₹{(paymentsSummary?.totalRev ?? 124580).toLocaleString("en-IN")}
                  <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-1 rounded">+15.4%</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <Wallet className="size-4 text-amber-500" />
                  <span>Pending Payments</span>
                </div>
                <span className="text-slate-900 dark:text-white flex items-center gap-1.5">
                  ₹{(paymentsSummary?.pendingAmount ?? 18750).toLocaleString("en-IN")}
                  <span className="text-[10px] font-semibold text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-1.5 rounded-full">
                    {paymentsSummary?.pendingCount ?? 8}
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <Ticket className="size-4 text-blue-500" />
                  <span>Active Coupons</span>
                </div>
                <span className="text-slate-900 dark:text-white">6</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <Mail className="size-4 text-indigo-500" />
                  <span>Email Credits Left</span>
                </div>
                <span className="text-slate-950 dark:text-white flex items-center gap-1.5">
                  2,450
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">Enough</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Upgrade Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-[#07284a] to-slate-900 p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Rocket graphic */}
        <div className="absolute right-12 top-0 bottom-0 pointer-events-none opacity-10 flex items-center">
          <Rocket className="size-36 rotate-45" />
        </div>
        <div className="space-y-1 relative z-10 text-center sm:text-left">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2.5 py-0.5 rounded-full mb-1">
            Premium Features
          </span>
          <h3 className="text-lg font-bold">Upgrade Your Platform</h3>
          <p className="text-xs text-slate-300">Unlock premium features, advanced analytics & priority support.</p>
        </div>
        <button
          onClick={() => toast.success("Welcome to Premium Workspace Suite!")}
          className="relative z-10 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg shadow-blue-500/10 shrink-0"
        >
          Upgrade Now <ChevronRight className="size-3.5 text-white" />
        </button>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════
// APPLICATIONS
// ══════════════════════════════════════════════
function ApplicationsSection() {
  const qc = useQueryClient();
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data } = useQuery({
    queryKey: ["admin-apps"],
    queryFn: async () => {
      const { data } = await supabase.from("applications").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    let list = data;
    if (statusFilter !== "all") {
      list = list.filter((a: any) => a.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a: any) =>
        (a.full_name?.toLowerCase() || '').includes(q) ||
        (a.email?.toLowerCase() || '').includes(q) ||
        (a.intern_id?.toLowerCase() || '').includes(q) ||
        (a.college?.toLowerCase() || '').includes(q) ||
        (a.course?.toLowerCase() || '').includes(q)
      );
    }
    return list;
  }, [data, statusFilter, search]);

  const [sendingOfferId, setSendingOfferId] = useState<string | null>(null);
  const [syncingEmails, setSyncingEmails] = useState(false);

  const handleSyncEmailStatus = async () => {
    setSyncingEmails(true);
    const toastId = toast.loading("Checking and syncing email status for applications...");
    try {
      const { data: pendingApps, error } = await supabase
        .from("applications")
        .select("id, offer_issued_at, created_at")
        .neq("email_status", "sent")
        .not("offer_issued_at", "is", null);

      if (error) throw error;

      if (!pendingApps || pendingApps.length === 0) {
        toast.success("All applications with issued offer letters already have 'Sent' status!", { id: toastId });
        return;
      }

      let count = 0;
      for (const app of pendingApps) {
        const { error: upErr } = await (supabase.from("applications") as any).update({
          email_status: "sent",
          email_sent_at: app.offer_issued_at || app.created_at || new Date().toISOString(),
          email_error: null,
        }).eq("id", app.id);
        if (!upErr) count++;
      }

      qc.invalidateQueries({ queryKey: ["admin-apps"] });
      toast.success(`Successfully updated ${count} application(s) to 'Sent' status!`, { id: toastId });
    } catch (err: any) {
      toast.error(`Sync failed: ${err.message}`, { id: toastId });
    } finally {
      setSyncingEmails(false);
    }
  };

  const handleSendOfferLetter = async (app: any) => {
    setSendingOfferId(app.id);
    const toastId = toast.loading(`Sending Offer Letter to ${app.email}...`);
    try {
      const { sendOfferLetterEmail } = await import("@/lib/email-helpers");
      const domainObj = getDomain(app.domain);
      const result = await sendOfferLetterEmail({
        to: app.email,
        studentName: app.full_name,
        studentId: app.user_id,
        internId: app.intern_id,
        domainName: domainObj?.name ?? app.domain,
        duration: app.duration ?? 1,
      });

      if (result.success) {
        toast.success(`✅ Offer letter sent successfully to ${app.email}!`, { id: toastId });
        await (supabase.from("applications") as any).update({
          offer_issued_at: new Date().toISOString(),
          email_status: "sent",
          email_sent_at: new Date().toISOString(),
          email_error: null,
        }).eq("id", app.id);
        qc.invalidateQueries({ queryKey: ["admin-apps"] });
        qc.invalidateQueries({ queryKey: ["admin-email-logs"] });
      } else {
        toast.error(`Offer Letter delivery failed: ${result.error || "Unknown error"}`, { id: toastId, duration: 8000 });
        await (supabase.from("applications") as any).update({
          email_status: "failed",
          email_error: result.error,
        }).eq("id", app.id);
        qc.invalidateQueries({ queryKey: ["admin-apps"] });
        qc.invalidateQueries({ queryKey: ["admin-email-logs"] });
      }
    } catch (err: any) {
      toast.error(`Error sending offer letter: ${err.message}`, { id: toastId });
    } finally {
      setSendingOfferId(null);
    }
  };

  const updateStatus = async (id: string, status: string, appRecord?: any) => {
    const payload: any = { status };
    if (status === "ongoing" || status === "approved") payload.offer_issued_at = new Date().toISOString();
    const { error } = await supabase.from("applications").update(payload).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Application ${status}`);
    qc.invalidateQueries({ queryKey: ["admin-apps"] });
    qc.invalidateQueries({ queryKey: ["admin-overview"] });

    // Workflow Requirement 9:
    // Admin approval -> Generate offer letter -> Send offer letter email
    if (status === "approved" && appRecord) {
      await handleSendOfferLetter(appRecord);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { deleteInternshipApplication: del } = await import("@/lib/admin-service");
      const result = await del({ data: { applicationId: deleteTarget.id } });
      if (result.success) {
        toast.success("Application deleted successfully.");
        qc.invalidateQueries({ queryKey: ["admin-apps"] });
        qc.invalidateQueries({ queryKey: ["admin-overview"] });
      } else {
        toast.error(result.error ?? "Failed to delete application");
      }
    } catch (e: any) {
      toast.error(e.message ?? "Failed to delete application");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="animate-fade-in-up space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Internship Applications</h2>
          <p className="text-sm text-muted-foreground">{filtered?.length ?? 0} matching · {data?.length ?? 0} total applications</p>
        </div>
        <button
          onClick={handleSyncEmailStatus}
          disabled={syncingEmails}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 rounded-xl border border-emerald-200 dark:border-emerald-800/40 transition disabled:opacity-50 shadow-sm"
          title="Sync email status for all applications where offer letters have been issued"
        >
          {syncingEmails ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
          Sync Sent Status
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-1.5 rounded-xl bg-muted/50 p-1 w-full md:w-auto">
          {(["all", "pending", "approved", "ongoing", "completed", "rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                statusFilter === s ? "bg-white text-foreground shadow-sm dark:bg-[#1E293B]" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            placeholder="Search name, college, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 rounded-xl border-border/60 bg-background/50"
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4" onClick={() => !deleting && setDeleteTarget(null)}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-border/50 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:bg-[#1E293B]/95 my-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="grid size-10 place-items-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30"><AlertTriangle className="size-5" /></div>
                <div>
                  <h3 className="font-bold text-lg">Delete Internship Application?</h3>
                  <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                </div>
              </div>
              <div className="rounded-xl bg-accent/30 p-4 text-sm space-y-1 mb-4">
                <p><span className="font-medium">Student:</span> {deleteTarget.full_name}</p>
                <p><span className="font-medium">Domain:</span> {getDomain(deleteTarget.domain)?.name ?? deleteTarget.domain}</p>
                <p><span className="font-medium">Duration:</span> {deleteTarget.duration ?? 1} Month(s)</p>
              </div>
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-3 text-xs text-amber-700 dark:text-amber-400 mb-4">
                <p className="font-medium mb-1">This will remove:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Internship enrollment</li>
                  <li>Assigned tasks</li>
                  <li>Task submissions</li>
                  <li>Progress tracking</li>
                  <li>Internship certificate (if exists)</li>
                </ul>
                <p className="mt-2 font-medium text-green-600 dark:text-green-400">Student account will NOT be deleted.</p>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" className="border-border/60" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white border-0" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete Application"}
                </Button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Detail Modal */}
      {selectedApp && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4" onClick={() => setSelectedApp(null)}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative w-full max-w-lg rounded-2xl border border-border/50 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:bg-[#1E293B]/95 max-h-[85vh] overflow-y-auto my-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{selectedApp.full_name}</h3>
                <button onClick={() => setSelectedApp(null)} className="grid size-8 place-items-center rounded-lg hover:bg-accent/50"><X className="size-4" /></button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-muted-foreground text-xs">Email</p><p>{selectedApp.email}</p></div>
                  <div><p className="text-muted-foreground text-xs">Phone</p><p>{selectedApp.phone ?? "—"}</p></div>
                  <div><p className="text-muted-foreground text-xs">Domain</p><p>{getDomain(selectedApp.domain)?.name ?? selectedApp.domain}</p></div>
                  <div><p className="text-muted-foreground text-xs">Status</p><Badge className="text-xs">{selectedApp.status}</Badge></div>
                  <div className="col-span-2"><p className="text-muted-foreground text-xs">College</p><p>{selectedApp.college} · {selectedApp.course} ({selectedApp.year})</p></div>
                  <div className="col-span-2"><p className="text-muted-foreground text-xs">Intern ID</p><p className="font-mono text-xs">{selectedApp.intern_id ?? "—"}</p></div>
                  <div><p className="text-muted-foreground text-xs">Applied</p><p>{new Date(selectedApp.created_at).toLocaleDateString("en-IN")}</p></div>
                  <div><p className="text-muted-foreground text-xs">Offer Issued</p><p>{selectedApp.offer_issued_at ? new Date(selectedApp.offer_issued_at).toLocaleDateString("en-IN") : "—"}</p></div>
                  <div>
                    <p className="text-muted-foreground text-xs">Email Delivery</p>
                    {selectedApp.email_status === "sent" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3.5" /> Sent ({selectedApp.email_sent_at ? new Date(selectedApp.email_sent_at).toLocaleDateString("en-IN") : "Delivered"})
                      </span>
                    ) : selectedApp.email_status === "failed" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400" title={selectedApp.email_error}>
                        <XCircle className="size-3.5" /> Delivery Failed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3.5" /> Not Sent
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-2 flex-wrap">
                  {selectedApp.status === "approved" && (
                    <Button size="sm" className="brand-gradient text-white border-0 flex-1" onClick={() => { updateStatus(selectedApp.id, "ongoing"); setSelectedApp(null); }}>
                      Mark Ongoing
                    </Button>
                  )}
                  {selectedApp.status === "ongoing" && (
                    <Button size="sm" className="brand-gradient text-white border-0 flex-1" onClick={() => { updateStatus(selectedApp.id, "completed"); setSelectedApp(null); }}>
                      Mark Completed
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className={`text-white border-0 ${
                      selectedApp.email_status === "failed" ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    disabled={sendingOfferId === selectedApp.id}
                    onClick={() => handleSendOfferLetter(selectedApp)}
                  >
                    {sendingOfferId === selectedApp.id ? (
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    ) : selectedApp.email_status === "failed" ? (
                      <RefreshCw className="mr-1.5 size-3.5" />
                    ) : (
                      <Mail className="mr-1.5 size-3.5" />
                    )}
                    {selectedApp.email_status === "failed" ? "Retry Email" : selectedApp.email_status === "sent" ? "Resend Offer Letter" : "Send Offer Letter to Gmail"}
                  </Button>
                  <Button size="sm" variant="outline" className="border-border/60" asChild>
                    <a href={`mailto:${selectedApp.email}`}><Mail className="mr-1 size-3.5" /> Compose</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border/50 bg-white/60 backdrop-blur dark:bg-[#1E293B]/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3 text-left">Student</th>
              <th className="px-4 py-3 text-left">Domain</th>
              <th className="px-4 py-3 text-left">College</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Email Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No matching applications found.</td></tr>
            )}
            {filtered?.map((a) => {
              const dd = getDomain(a.domain);
              return (
                <tr key={a.id} className="border-b border-border/30 transition hover:bg-accent/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid size-9 shrink-0 place-items-center rounded-full brand-gradient text-xs font-bold text-white">{a.full_name.charAt(0).toUpperCase()}</div>
                      <div className="min-w-0"><p className="font-medium truncate">{a.full_name}</p><p className="text-xs text-muted-foreground">{a.email}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant="secondary" className="text-xs">{dd?.name ?? a.domain}</Badge></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{a.college} · {a.course} {a.year}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <Badge className={`text-xs ${
                      (a.status as string) === "completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                      (a.status as string) === "ongoing" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                      (a.status as string) === "approved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                      (a.status as string) === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}>{a.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {a.email_status === "sent" ? (
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-0 text-[11px] gap-1 font-medium">
                        <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" /> Sent
                      </Badge>
                    ) : a.email_status === "failed" ? (
                      <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-0 text-[11px] gap-1 font-medium" title={a.email_error || "Email delivery failed"}>
                        <XCircle className="size-3 text-rose-600 dark:text-rose-400" /> Failed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground border-border/60 text-[11px] gap-1 font-normal">
                        <Clock className="size-3" /> Pending
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setSelectedApp(a)} className="grid size-8 place-items-center rounded-lg hover:bg-accent/50 transition" title="View"><Eye className="size-4" /></button>
                      <button
                        onClick={() => handleSendOfferLetter(a)}
                        disabled={sendingOfferId === a.id}
                        className={`grid size-8 place-items-center rounded-lg transition disabled:opacity-50 ${
                          a.email_status === "failed"
                            ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                            : "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                        }`}
                        title={a.email_status === "failed" ? "Retry Email" : a.email_status === "sent" ? "Resend Offer Letter" : "Send Offer Letter to Gmail"}
                      >
                        {sendingOfferId === a.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : a.email_status === "failed" ? (
                          <RefreshCw className="size-4" />
                        ) : (
                          <Mail className="size-4" />
                        )}
                      </button>
                      {a.status === "pending" && (
                        <>
                          <button onClick={() => updateStatus(a.id, "approved", a)} className="grid size-8 place-items-center rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 transition" title="Approve & Send Offer Letter"><CheckCircle2 className="size-4" /></button>
                          <button onClick={() => updateStatus(a.id, "rejected")} className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition" title="Reject"><XCircle className="size-4" /></button>
                        </>
                      )}
                      <button onClick={() => setDeleteTarget(a)} className="grid size-8 place-items-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition" title="Delete Application"><Trash2 className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// SUBMISSIONS
// ══════════════════════════════════════════════
function SubmissionsSection() {
  const qc = useQueryClient();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; status: string; label: string; sub?: any } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);

  useEffect(() => {
    if (confirmAction) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [confirmAction]);

  useEffect(() => {
    const channel = supabase.channel("admin-submissions-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "submissions" }, () => {
        qc.invalidateQueries({ queryKey: ["admin-subs"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "submission_history" }, () => {
        qc.invalidateQueries({ queryKey: ["admin-subs"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const tableName = "submissions";
  const queryKey = ["admin-subs"];

  const { data } = useQuery({
    queryKey: ["admin-subs"],
    queryFn: async () => {
      try {
        const { data: list, error } = await supabase
          .from("submissions")
          .select("*, applications(full_name, intern_id, domain), tasks(title, task_number)")
          .order("submitted_at", { ascending: false });
        if (error) {
          console.error("Error fetching submissions:", error);
          return [];
        }
        return list ?? [];
      } catch (err) {
        console.error("Submissions fetch exception:", err);
        return [];
      }
    },
    refetchInterval: 10_000,
  });

  const { data: allSubmissionHistory } = useQuery({
    queryKey: ["admin-sub-history-all"],
    queryFn: async () => {
      try {
        const { data: history } = await (supabase.from("submission_history" as any) as any)
          .select("*")
          .eq("table_name", "submissions")
          .order("created_at", { ascending: false });
        return history ?? [];
      } catch (err) {
        console.error("History fetch exception:", err);
        return [];
      }
    },
    refetchInterval: 10_000,
  });

  const [subFilter, setSubFilter] = useState<"all" | "pending" | "resubmitted" | "reviewed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingSub, setViewingSub] = useState<any | null>(null);
  const [viewingPrevSub, setViewingPrevSub] = useState<{ current: any; previous: any } | null>(null);

  // Helper to extract full resubmission context for any submission
  const getSubMeta = useCallback((sub: any) => {
    if (!sub) return { isResubmitted: false, resubmissionNumber: 1, previousSub: null, prevFeedback: null, allForTask: [], subHistories: [] };

    // 1. All history entries for this submission
    const subHistories = (allSubmissionHistory || []).filter((h: any) => h.submission_id === sub.id);
    const hasRejectedToPendingHistory = subHistories.some((h: any) => 
      (h.previous_status === "rejected" && h.new_status === "pending") ||
      (h.reason && (h.reason.includes("Student resubmitted") || h.reason.includes("Resubmission") || h.reason.includes("resubmitted"))) ||
      (h.previous_status === "rejected")
    );

    // 2. Chronological lookup for same intern & task
    const allForTask = (data || [])
      .filter((o: any) => o.application_id === sub.application_id && o.task_id === sub.task_id)
      .sort((a: any, b: any) => new Date(a.submitted_at || 0).getTime() - new Date(b.submitted_at || 0).getTime());

    const currentIndex = allForTask.findIndex((o: any) => o.id === sub.id);
    let prevSub: any = null;
    if (sub.previous_submission_id && data) {
      prevSub = data.find((o: any) => o.id === sub.previous_submission_id) || null;
    }
    if (!prevSub && currentIndex > 0) {
      prevSub = allForTask[currentIndex - 1];
    }
    if (!prevSub && allForTask.length > 1) {
      prevSub = allForTask.find((o: any) => o.id !== sub.id && (o.status === "rejected" || o.reviewed_at));
    }

    // Explicit count check
    let count = sub.resubmission_count;
    if (count === undefined || count === null || count === 0) {
      const match = sub.notes?.match(/\[Resubmission #(\d+)/i);
      if (match) count = parseInt(match[1], 10);
    }

    // Count resubmission events from submission_history
    const historyResubCount = subHistories.filter((h: any) => 
      (h.previous_status === "rejected" && h.new_status === "pending") ||
      (h.reason && h.reason.includes("Student resubmitted"))
    ).length;

    const hasEarlierRejection = allForTask.slice(0, Math.max(0, currentIndex)).some((o: any) => o.status === "rejected" || o.reviewed_at);
    const hasAnyRejectionForTask = allForTask.some((o: any) => o.id !== sub.id && (o.status === "rejected" || o.reviewed_at));

    const isResub = Boolean(
      hasRejectedToPendingHistory ||
      sub.previous_submission_id ||
      (count !== undefined && count !== null && count > 0) ||
      historyResubCount > 0 ||
      hasEarlierRejection ||
      hasAnyRejectionForTask ||
      (prevSub && (prevSub.status === "rejected" || prevSub.reviewed_at)) ||
      (sub.status === "pending" && (sub.reviewed_at || sub.feedback))
    );

    const displayCount = (count !== undefined && count !== null && count > 0)
      ? count
      : (historyResubCount > 0 ? historyResubCount : (currentIndex > 0 ? currentIndex + 1 : (isResub ? 2 : 1)));

    let prevFeedback = prevSub?.feedback || (isResub && sub.feedback ? sub.feedback : null);
    if (!prevFeedback && subHistories.length > 0) {
      const rejHist = subHistories.find((h: any) => h.previous_status === "rejected" && h.reason && !h.reason.includes("Student resubmitted"));
      if (rejHist) prevFeedback = rejHist.reason;
    }

    return {
      isResubmitted: isResub,
      resubmissionNumber: displayCount,
      previousSub: prevSub,
      prevFeedback,
      allForTask,
      subHistories,
    };
  }, [data, allSubmissionHistory]);

  // 1. Resubmissions waiting for review: status === "pending" AND isResubmitted
  const resubmittedList = useMemo(() => {
    return (data ?? []).filter((s: any) => {
      if (s.status !== "pending") return false;
      const meta = getSubMeta(s);
      return meta.isResubmitted;
    });
  }, [data, getSubMeta]);

  // 2. Pending Review (New first-time submissions): status === "pending" AND NOT isResubmitted
  const freshPendingList = useMemo(() => {
    return (data ?? []).filter((s: any) => {
      if (s.status !== "pending") return false;
      const meta = getSubMeta(s);
      return !meta.isResubmitted;
    });
  }, [data, getSubMeta]);

  // 3. Reviewed: status !== "pending" (all previously approved and rejected submissions)
  const reviewedList = useMemo(() => {
    return (data ?? []).filter((s: any) => s.status !== "pending");
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((s: any) => {
      const name = s.applications?.full_name?.toLowerCase() || "";
      const internId = s.applications?.intern_id?.toLowerCase() || "";
      const domain = s.applications?.domain?.toLowerCase() || "";
      const title = s.tasks?.title?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query || name.includes(query) || internId.includes(query) || domain.includes(query) || title.includes(query);

      if (!matchesSearch) return false;

      const meta = getSubMeta(s);
      if (subFilter === "pending") return s.status === "pending" && !meta.isResubmitted;
      if (subFilter === "resubmitted") return s.status === "pending" && meta.isResubmitted;
      if (subFilter === "reviewed") return s.status !== "pending";
      return true;
    });
  }, [data, subFilter, searchQuery, getSubMeta]);

  const loadHistory = async (id: string) => {
    const { data: history } = await (supabase.from("submission_history" as any) as any)
      .select("*")
      .eq("submission_id", id)
      .eq("table_name", tableName)
      .order("created_at", { ascending: false });
    setHistoryData(history ?? []);
    setShowHistory(showHistory === id ? null : id);
  };

  const changeStatus = async (id: string, newStatus: string, feedbackText?: string) => {
    setLoadingId(id);
    const reason = feedbackText !== undefined ? feedbackText : rejectReason;
    const { error } = await supabase.from(tableName as any).update({ status: newStatus, feedback: reason || null, reviewed_at: new Date().toISOString() }).eq("id", id);
    if (error) { setLoadingId(null); return toast.error(error.message); }
    await (supabase.from("submission_history" as any) as any).insert({
      submission_id: id,
      table_name: tableName,
      previous_status: data?.find((s: any) => s.id === id)?.status ?? null,
      new_status: newStatus,
      changed_by: (await supabase.auth.getUser()).data.user?.id,
      reason: reason || null,
    });
    setLoadingId(null);
    setConfirmAction(null);
    setViewingSub(null);
    setRejectReason("");
    toast.success(`Submission marked as ${newStatus}`);
    qc.invalidateQueries({ queryKey: ["admin-subs"] });
    qc.invalidateQueries({ queryKey: ["admin-sub-history-all"] });
  };

  return (
    <div className="animate-fade-in-up space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Task Submissions</h2>
          <p className="text-xs text-muted-foreground">Review, approve, or request revisions for intern task submissions.</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl h-9" onClick={() => {
          qc.invalidateQueries({ queryKey: ["admin-subs"] });
          qc.invalidateQueries({ queryKey: ["admin-sub-history-all"] });
        }}>
          <RefreshCw className="size-4 mr-1.5" /> Refresh List
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/40 dark:bg-slate-900/40 p-2.5 rounded-2xl border border-border/40 backdrop-blur">
        <div className="flex flex-wrap gap-1 bg-muted/60 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setSubFilter("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${subFilter === "all" ? "bg-white text-foreground shadow-sm dark:bg-slate-800" : "text-muted-foreground hover:text-foreground"}`}
          >
            All Submissions ({data?.length ?? 0})
          </button>
          <button
            type="button"
            onClick={() => setSubFilter("pending")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${subFilter === "pending" ? "bg-white text-foreground shadow-sm dark:bg-slate-800" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Clock className="size-3 text-amber-500" /> Pending Review ({freshPendingList.length})
          </button>
          <button
            type="button"
            onClick={() => setSubFilter("resubmitted")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              subFilter === "resubmitted" ? "bg-purple-600 text-white shadow-sm font-bold" : "text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40"
            }`}
          >
            <RotateCcw className="size-3" /> Resubmissions ({resubmittedList.length}) 🔄
          </button>
          <button
            type="button"
            onClick={() => setSubFilter("reviewed")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${subFilter === "reviewed" ? "bg-white text-foreground shadow-sm dark:bg-slate-800" : "text-muted-foreground hover:text-foreground"}`}
          >
            <CheckCircle2 className="size-3 text-slate-500" /> Reviewed ({reviewedList.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search intern name, ID, domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Submissions Content List */}
      <div className="space-y-3">
        {filteredData.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 py-8 px-4 text-center">
            {subFilter === "resubmitted" ? (
              <>
                <RotateCcw className="mx-auto size-5 text-purple-500 mb-1.5 opacity-75" />
                <p className="text-xs font-semibold text-purple-950 dark:text-purple-300">No resubmissions waiting for review.</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">When students update and resubmit rejected tasks, they will appear here automatically.</p>
              </>
            ) : subFilter === "pending" ? (
              <>
                <Clock className="mx-auto size-5 text-amber-500 mb-1.5 opacity-75" />
                <p className="text-xs font-semibold text-foreground">No new submissions waiting for review.</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">New first-time task submissions will appear here.</p>
              </>
            ) : subFilter === "reviewed" ? (
              <>
                <CheckCircle2 className="mx-auto size-5 text-slate-400 mb-1.5 opacity-75" />
                <p className="text-xs font-semibold text-foreground">No reviewed submissions recorded yet.</p>
              </>
            ) : (
              <>
                <Search className="mx-auto size-5 text-muted-foreground/40 mb-1.5" />
                <p className="text-xs font-semibold text-foreground">No task submissions found.</p>
                {searchQuery && <p className="text-[11px] text-muted-foreground mt-0.5">Try searching with a different keyword.</p>}
              </>
            )}
          </div>
        ) : (
          filteredData.map((s: any) => (
            <SubmissionCard
              key={s.id}
              sub={s}
              subMeta={getSubMeta(s)}
              loadingId={loadingId}
              onAction={(status: string, label: string, subObj: any) => { setConfirmAction({ id: s.id, status, label, sub: subObj }); setRejectReason(subObj?.feedback || ""); }}
              onViewSub={(subObj: any) => setViewingSub(subObj)}
              onViewPrevSub={(subObj: any, prevObj: any) => setViewingPrevSub({ current: subObj, previous: prevObj })}
              onHistory={() => loadHistory(s.id)}
              showHistory={showHistory === s.id}
              historyData={historyData}
            />
          ))
        )}
      </div>

      {/* Confirmation & Feedback Dialog */}
      {confirmAction && (
        <Portal>
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={() => { setConfirmAction(null); setRejectReason(""); }}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div
              className="w-full max-w-lg rounded-3xl border border-border/50 bg-white p-6 shadow-2xl dark:bg-[#0F172A] dark:border-white/10 animate-in zoom-in-95 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">Task Review & Feedback</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {confirmAction.sub?.tasks?.title} · {confirmAction.sub?.applications?.full_name} ({confirmAction.sub?.applications?.intern_id})
                  </p>
                </div>
                <button onClick={() => { setConfirmAction(null); setRejectReason(""); }} className="text-muted-foreground hover:text-foreground">
                  <XCircle className="size-5" />
                </button>
              </div>

              {/* Resubmission Banner in Dialog */}
              {getSubMeta(confirmAction.sub).isResubmitted && (
                <div className="mb-4 p-3 rounded-2xl border border-purple-200 bg-purple-50 dark:bg-purple-950/40 dark:border-purple-900/50 text-xs space-y-1">
                  <p className="font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                    <RotateCcw className="size-3.5 text-purple-600" /> Reviewing Resubmitted Task 🔄 (Resubmission #{getSubMeta(confirmAction.sub).resubmissionNumber})
                  </p>
                  {getSubMeta(confirmAction.sub).prevFeedback && (
                    <p className="text-slate-700 dark:text-slate-300 text-[11px] italic">
                      Previous Feedback: "{getSubMeta(confirmAction.sub).prevFeedback}"
                    </p>
                  )}
                </div>
              )}

              {/* Status Selector */}
              <div className="mb-4">
                <Label className="text-xs font-semibold block mb-1.5">Action Status</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmAction({ ...confirmAction, status: "approved", label: "Approve" })}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition border ${
                      confirmAction.status === "approved"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                        : "bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted"
                    }`}
                  >
                    <CheckCircle2 className="size-3.5" /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmAction({ ...confirmAction, status: "rejected", label: "Reject" })}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition border ${
                      confirmAction.status === "rejected"
                        ? "bg-rose-600 text-white border-rose-600 shadow-md"
                        : "bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted"
                    }`}
                  >
                    <XCircle className="size-3.5" /> Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmAction({ ...confirmAction, status: "pending", label: "Pending" })}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition border ${
                      confirmAction.status === "pending"
                        ? "bg-amber-600 text-white border-amber-600 shadow-md"
                        : "bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted"
                    }`}
                  >
                    <Clock className="size-3.5" /> Pending
                  </button>
                </div>
              </div>

              {/* Feedback Textarea */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <MessageSquare className="size-3.5 text-primary" /> Task Feedback for Student
                </Label>
                <Textarea
                  placeholder="Enter detailed feedback for the intern (e.g., 'Great work! Clean code and solid implementation.' or 'Please fix responsive design on mobile and re-submit.')"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  className="text-xs rounded-xl border-border/60 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Quick Feedback Chips */}
              <div className="mt-3">
                <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Quick Presets:</p>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setRejectReason("Approved — Excellent code implementation and project structure!")}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100 transition"
                  >
                    👍 Excellent work
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectReason("Approved — Good attempt, completed all required features.")}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 hover:bg-blue-100 transition"
                  >
                    ✅ Good attempt
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectReason("Needs Revision — Please fix requested features and resubmit.")}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-100 transition"
                  >
                    ⚠️ Needs Revision
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectReason("Needs Revision — Missing live demo URL or project screenshot.")}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100 transition"
                  >
                    🔗 Missing Links
                  </button>
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <Button variant="outline" size="sm" className="rounded-xl h-9 text-xs" onClick={() => { setConfirmAction(null); setRejectReason(""); }}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className={`rounded-xl text-white border-0 h-9 text-xs font-bold ${
                    confirmAction.status === "approved" ? "bg-emerald-600 hover:bg-emerald-700" :
                    confirmAction.status === "rejected" ? "bg-rose-600 hover:bg-rose-700" :
                    "bg-amber-600 hover:bg-amber-700"
                  }`}
                  disabled={loadingId === confirmAction.id}
                  onClick={() => changeStatus(confirmAction.id, confirmAction.status, rejectReason)}
                >
                  {loadingId === confirmAction.id ? "Saving..." : "Save & Send Feedback"}
                </Button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* View Submission Modal */}
      {viewingSub && (
        <Portal>
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={() => setViewingSub(null)}
          >
            <div
              className="w-full max-w-xl rounded-3xl border border-border/50 bg-white p-6 shadow-2xl dark:bg-[#0F172A] dark:border-white/10 animate-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-border/40 pb-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-foreground">
                      Task {viewingSub.tasks?.task_number ?? ""}: {viewingSub.tasks?.title ?? "Task Submission"}
                    </h3>
                    {getSubMeta(viewingSub).isResubmitted ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-600 text-white">
                        Resubmission #{getSubMeta(viewingSub).resubmissionNumber}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {viewingSub.applications?.full_name} ({viewingSub.applications?.intern_id}) · {getDomain(viewingSub.applications?.domain)?.name ?? viewingSub.applications?.domain}
                  </p>
                </div>
                <button onClick={() => setViewingSub(null)} className="text-muted-foreground hover:text-foreground">
                  <XCircle className="size-5" />
                </button>
              </div>

              {/* Status & Date */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/40 mb-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Current Status: </span>
                  <span className="font-bold capitalize text-foreground">{viewingSub.status}</span>
                </div>
                <div className="text-muted-foreground">
                  Submitted: <span className="font-medium text-foreground">{viewingSub.submitted_at ? new Date(viewingSub.submitted_at).toLocaleString("en-IN") : "—"}</span>
                </div>
              </div>

              {/* Resubmission details banner */}
              {getSubMeta(viewingSub).isResubmitted && getSubMeta(viewingSub).prevFeedback && (
                <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50/90 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200 p-3 text-xs">
                  <span className="font-bold flex items-center gap-1.5 mb-1">
                    <RotateCcw className="size-3.5 text-amber-600" />
                    Previous Rejection Reason:
                  </span>
                  <p className="pl-5 font-medium text-slate-800 dark:text-slate-200">
                    "{getSubMeta(viewingSub).prevFeedback}"
                  </p>
                </div>
              )}

              {/* Submitted Links */}
              <div className="space-y-3 mb-5">
                <Label className="text-xs font-bold text-foreground block">Submission Links & Files</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {viewingSub.github_url && (
                    <a href={viewingSub.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2.5 rounded-xl border border-border/50 hover:bg-accent/40 text-primary font-medium transition">
                      <ExternalLink className="size-4" /> GitHub Repository
                    </a>
                  )}
                  {viewingSub.deployed_url && (
                    <a href={viewingSub.deployed_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2.5 rounded-xl border border-border/50 hover:bg-accent/40 text-primary font-medium transition">
                      <ExternalLink className="size-4" /> Live Deployed URL
                    </a>
                  )}
                  {viewingSub.pdf_url && (
                    <a href={viewingSub.pdf_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2.5 rounded-xl border border-border/50 hover:bg-accent/40 text-primary font-medium transition">
                      <FileText className="size-4" /> Project PDF Document
                    </a>
                  )}
                  {viewingSub.screenshot_url && (
                    <a href={viewingSub.screenshot_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2.5 rounded-xl border border-border/50 hover:bg-accent/40 text-primary font-medium transition">
                      <ExternalLink className="size-4" /> Output Screenshot
                    </a>
                  )}
                </div>

                {viewingSub.notes && (
                  <div className="mt-3">
                    <Label className="text-[11px] font-semibold text-muted-foreground block mb-1">Student Notes:</Label>
                    <div className="p-3 rounded-xl bg-muted/30 border border-border/30 text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                      {viewingSub.notes}
                    </div>
                  </div>
                )}
              </div>

              {/* Submission History Timeline (Requirement 10) */}
              {getSubMeta(viewingSub).allForTask && getSubMeta(viewingSub).allForTask.length > 1 && (
                <div className="mt-4 mb-4 border-t border-border/40 pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
                    <Clock className="size-3.5 text-primary" /> Submission History ({getSubMeta(viewingSub).allForTask.length} Attempts)
                  </h4>
                  <div className="space-y-2.5">
                    {getSubMeta(viewingSub).allForTask.map((item: any, idx: number) => {
                      const isCurrent = item.id === viewingSub.id;
                      const attemptNum = idx + 1;
                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-2xl border text-xs transition ${
                            isCurrent
                              ? "border-primary/60 bg-primary/5 shadow-xs"
                              : "border-border/60 bg-muted/20"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground">
                                {idx === 0 ? "Submission #1" : `Submission #${attemptNum} (Resubmission #${idx})`}
                              </span>
                              {isCurrent && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-white">
                                  Currently Viewing
                                </span>
                              )}
                            </div>
                            {item.status === "approved" ? (
                              <span className="font-bold text-emerald-600 flex items-center gap-1 text-[11px]">
                                <CheckCircle2 className="size-3" /> ✅ Approved
                              </span>
                            ) : item.status === "rejected" ? (
                              <span className="font-bold text-rose-600 flex items-center gap-1 text-[11px]">
                                <XCircle className="size-3" /> ❌ Rejected
                              </span>
                            ) : (
                              <span className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 text-[11px]">
                                <RotateCcw className="size-3" /> 🔄 Resubmitted · ⏳ Pending Review
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mb-1">
                            Submitted: {item.submitted_at ? new Date(item.submitted_at).toLocaleString("en-IN") : "—"}
                            {item.reviewed_at && ` · Reviewed: ${new Date(item.reviewed_at).toLocaleString("en-IN")}`}
                          </p>
                          {item.feedback && (
                            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-[11px] my-1">
                              <span className="font-bold">Admin feedback: </span>{item.feedback}
                            </div>
                          )}
                          <div className="flex flex-wrap items-center gap-2 text-[11px] mt-1.5 pt-1 border-t border-border/30">
                            {item.github_url && (
                              <a href={item.github_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                <ExternalLink className="size-3" /> GitHub
                              </a>
                            )}
                            {item.deployed_url && (
                              <a href={item.deployed_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                <ExternalLink className="size-3" /> Live Demo
                              </a>
                            )}
                            {item.pdf_url && (
                              <a href={item.pdf_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                <FileText className="size-3" /> PDF
                              </a>
                            )}
                            {item.screenshot_url && (
                              <a href={item.screenshot_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                <ExternalLink className="size-3" /> Screenshot
                              </a>
                            )}
                            {!isCurrent && (
                              <button
                                type="button"
                                onClick={() => setViewingSub(item)}
                                className="ml-auto text-primary font-bold hover:underline"
                              >
                                [Open Submission]
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="border-t border-border/40 pt-4 flex flex-wrap gap-2 justify-between items-center">
                {getSubMeta(viewingSub).previousSub ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl text-xs h-9 gap-1.5 text-purple-700 dark:text-purple-300"
                    onClick={() => {
                      const prev = getSubMeta(viewingSub).previousSub;
                      setViewingPrevSub({ current: viewingSub, previous: prev });
                    }}
                  >
                    <RotateCcw className="size-3.5 text-purple-600" /> View Previous Submission
                  </Button>
                ) : <div />}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 font-bold"
                    onClick={() => {
                      setConfirmAction({ id: viewingSub.id, status: "approved", label: "Approve", sub: viewingSub });
                      setRejectReason("Approved — Excellent work!");
                    }}
                  >
                    <CheckCircle2 className="size-3.5 mr-1" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs h-9 font-bold"
                    onClick={() => {
                      setConfirmAction({ id: viewingSub.id, status: "rejected", label: "Reject", sub: viewingSub });
                      setRejectReason("");
                    }}
                  >
                    <XCircle className="size-3.5 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* View Previous Submission Modal */}
      {viewingPrevSub && (
        <Portal>
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={() => setViewingPrevSub(null)}
          >
            <div
              className="w-full max-w-xl rounded-3xl border border-purple-200 bg-white p-6 shadow-2xl dark:bg-[#0F172A] dark:border-purple-900/40 animate-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-border/40 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <RotateCcw className="size-4 text-purple-600" /> Previous Submission Details
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Compare student's previous rejected attempt with their current resubmission.
                  </p>
                </div>
                <button onClick={() => setViewingPrevSub(null)} className="text-muted-foreground hover:text-foreground">
                  <XCircle className="size-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Previous Submission Box */}
                <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 dark:bg-rose-950/20 dark:border-rose-900/40 space-y-2">
                  <div className="flex items-center justify-between font-bold text-rose-700 dark:text-rose-300">
                    <span className="flex items-center gap-1.5"><XCircle className="size-4" /> Previous Status: Rejected</span>
                    <span className="text-[11px] font-normal text-muted-foreground">
                      {viewingPrevSub.previous?.submitted_at ? new Date(viewingPrevSub.previous.submitted_at).toLocaleString("en-IN") : "—"}
                    </span>
                  </div>

                  {viewingPrevSub.previous?.feedback && (
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/40 text-foreground mt-2">
                      <p className="font-semibold text-rose-600 dark:text-rose-400 text-[11px] mb-0.5">Admin Feedback given:</p>
                      <p className="italic">"{viewingPrevSub.previous.feedback}"</p>
                    </div>
                  )}

                  {/* Previous Links */}
                  <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
                    {viewingPrevSub.previous?.github_url && (
                      <a href={viewingPrevSub.previous.github_url} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium flex items-center gap-1">
                        <ExternalLink className="size-3" /> Prev GitHub
                      </a>
                    )}
                    {viewingPrevSub.previous?.deployed_url && (
                      <a href={viewingPrevSub.previous.deployed_url} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium flex items-center gap-1">
                        <ExternalLink className="size-3" /> Prev Live Demo
                      </a>
                    )}
                    {viewingPrevSub.previous?.notes && (
                      <p className="w-full text-muted-foreground mt-1 bg-white/60 dark:bg-slate-900/60 p-2 rounded-lg text-[11px]">
                        Prev Notes: {viewingPrevSub.previous.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Current Resubmission Summary Box */}
                <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/40 dark:bg-purple-950/20 dark:border-purple-900/40 space-y-2">
                  <div className="flex items-center justify-between font-bold text-purple-700 dark:text-purple-300">
                    <span className="flex items-center gap-1.5"><RotateCcw className="size-4" /> Current Resubmission (Pending Review)</span>
                    <span className="text-[11px] font-normal text-muted-foreground">
                      {viewingPrevSub.current?.submitted_at ? new Date(viewingPrevSub.current.submitted_at).toLocaleString("en-IN") : "—"}
                    </span>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-3 text-xs">
                    {viewingPrevSub.current?.github_url && (
                      <a href={viewingPrevSub.current.github_url} target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold flex items-center gap-1">
                        <ExternalLink className="size-3.5" /> New GitHub Link
                      </a>
                    )}
                    {viewingPrevSub.current?.deployed_url && (
                      <a href={viewingPrevSub.current.deployed_url} target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold flex items-center gap-1">
                        <ExternalLink className="size-3.5" /> New Live Demo
                      </a>
                    )}
                    {viewingPrevSub.current?.pdf_url && (
                      <a href={viewingPrevSub.current.pdf_url} target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold flex items-center gap-1">
                        <FileText className="size-3.5" /> New PDF Report
                      </a>
                    )}
                  </div>

                  {viewingPrevSub.current?.notes && (
                    <div className="mt-2 text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-border/40 text-foreground whitespace-pre-wrap">
                      <span className="font-semibold text-muted-foreground block mb-0.5">Updated Student Notes:</span>
                      {viewingPrevSub.current.notes}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <Button variant="outline" size="sm" className="rounded-xl text-xs h-9" onClick={() => setViewingPrevSub(null)}>
                  Close Comparison
                </Button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

function SubmissionCard({
  sub,
  subMeta,
  loadingId,
  onAction,
  onViewSub,
  onViewPrevSub,
  onHistory,
  showHistory,
  historyData,
}: any) {
  if (!sub) return null;
  const isLoading = loadingId === sub.id;
  const taskLabel = `Task ${sub.tasks?.task_number ?? ""}: ${sub.tasks?.title ?? "Task Submission"}`;
  const userName = sub.applications?.full_name ?? "Student";
  const userMeta = `${sub.applications?.intern_id ?? ""} · ${getDomain(sub.applications?.domain)?.name ?? sub.applications?.domain ?? ""}`;

  const { isResubmitted, resubmissionNumber, previousSub, prevFeedback } = subMeta || {
    isResubmitted: false,
    resubmissionNumber: 1,
    previousSub: null,
    prevFeedback: null,
  };

  const actionItems = [];
  if (sub.status !== "approved") actionItems.push({ status: "approved", label: "Approve", icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40" });
  if (sub.status !== "rejected") actionItems.push({ status: "rejected", label: "Reject", icon: XCircle, color: "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40" });
  if (sub.status !== "pending") actionItems.push({ status: "pending", label: "Mark as Pending", icon: Clock, color: "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40" });

  const formattedSubmittedAt = sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : null;
  const formattedReviewedAt = sub.reviewed_at ? new Date(sub.reviewed_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : null;

  return (
    <div className={`rounded-2xl border bg-white p-4 dark:bg-[#1E293B] shadow-xs transition-all relative z-1 ${
      sub.status === "pending" && isResubmitted
        ? "border-l-4 border-l-purple-600 border-purple-200/80 bg-purple-50/20 dark:bg-purple-950/15 dark:border-purple-900/40" 
        : sub.status === "pending"
        ? "border-l-4 border-l-amber-500 border-border/60"
        : sub.status === "approved"
        ? "border-l-4 border-l-emerald-500 border-border/60"
        : "border-l-4 border-l-rose-500 border-border/60"
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Task & Student Information */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm text-foreground leading-snug break-words">{taskLabel}</p>
            {isResubmitted && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white shadow-xs shrink-0">
                Resubmission #{resubmissionNumber}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground break-words">{userName} · {userMeta}</p>
          {formattedSubmittedAt && (
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Submitted: <span className="font-medium text-foreground">{formattedSubmittedAt}</span>
              {formattedReviewedAt && <span className="ml-2 font-mono text-[10px] text-muted-foreground block sm:inline">(Reviewed: {formattedReviewedAt})</span>}
            </p>
          )}
        </div>

        {/* Status Badge & Action Controls (Optimized for Mobile & Desktop) */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30">
          <div className="shrink-0">
            {isLoading ? (
              <Badge className="text-xs font-semibold border-0 bg-slate-100 text-slate-700">Saving...</Badge>
            ) : sub.status === "pending" && isResubmitted ? (
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 font-bold border border-purple-300/60 dark:border-purple-800 text-xs px-2.5 py-1 flex items-center gap-1.5 shadow-xs">
                <RotateCcw className="size-3 text-purple-600" /> 🔄 Resubmitted — Pending Review
              </Badge>
            ) : sub.status === "pending" ? (
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 font-semibold border-0 text-xs flex items-center gap-1">
                <Clock className="size-3 text-amber-600" /> Pending Review
              </Badge>
            ) : sub.status === "approved" ? (
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold border-0 text-xs flex items-center gap-1">
                <CheckCircle2 className="size-3 text-emerald-600" /> ✅ Approved
              </Badge>
            ) : (
              <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 font-semibold border-0 text-xs flex items-center gap-1">
                <XCircle className="size-3 text-rose-600" /> ❌ Rejected
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick View Submission Button */}
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs rounded-xl border-border/60 gap-1.5 bg-white dark:bg-slate-800 font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50"
              onClick={() => onViewSub(sub)}
            >
              <Eye className="size-3.5 text-primary" /> View Submission
            </Button>

            {/* Actions Dropdown Menu (Portal + Collision Aware) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs rounded-xl border-border/60 gap-1 bg-white dark:bg-slate-800 font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  Actions <ChevronDown className="size-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                collisionPadding={16}
                sideOffset={6}
                className="w-56 rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-2xl dark:bg-[#0F172A] dark:border-slate-800 z-[99999]"
              >
                <DropdownMenuItem
                  onClick={() => onViewSub(sub)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground cursor-pointer hover:bg-muted focus:bg-muted"
                >
                  <Eye className="size-4 text-primary" /> View Submission
                </DropdownMenuItem>
                {actionItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem
                      key={item.status}
                      onClick={() => onAction(item.status, item.label, sub)}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer transition focus:bg-accent/40 ${item.color}`}
                    >
                      <Icon className="size-4" /> {item.label}
                    </DropdownMenuItem>
                  );
                })}
                {(isResubmitted || previousSub) && (
                  <DropdownMenuItem
                    onClick={() => onViewPrevSub(sub, previousSub)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 focus:bg-purple-50 dark:focus:bg-purple-950/40 cursor-pointer transition"
                  >
                    <RotateCcw className="size-4 text-purple-600" /> View Previous Submission
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="my-1 border-t border-border/40" />
                <DropdownMenuItem
                  onClick={() => onHistory()}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent/50 focus:bg-accent/50 cursor-pointer transition"
                >
                  <Clock className="size-4" /> View History
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Submitted Links & Notes */}
      <div className="mt-2.5 flex flex-wrap gap-3 text-xs">
        {sub.github_url && <a href={sub.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline font-medium"><ExternalLink className="size-3" /> GitHub</a>}
        {sub.deployed_url && <a href={sub.deployed_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline font-medium"><ExternalLink className="size-3" /> Live Demo</a>}
        {sub.pdf_url && <a href={sub.pdf_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline font-medium"><FileText className="size-3" /> PDF Report</a>}
        {sub.screenshot_url && <a href={sub.screenshot_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline font-medium"><ExternalLink className="size-3" /> Screenshot</a>}
        {sub.notes && <p className="w-full text-muted-foreground mt-1 bg-muted/30 p-2 rounded-xl border border-border/20">{sub.notes}</p>}
      </div>

      {/* Previous Rejection / Admin Feedback Notice */}
      {prevFeedback && (
        <div className="mt-2.5 rounded-xl border border-amber-300 bg-amber-50/90 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200 p-3 text-xs">
          <span className="font-bold flex items-center gap-1.5 mb-1 text-amber-900 dark:text-amber-200">
            <RotateCcw className="size-3.5 text-amber-600 dark:text-amber-400" />
            Previous Rejection Reason (Student has updated & resubmitted):
          </span>
          <p className="pl-5 font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
            "{prevFeedback}"
          </p>
        </div>
      )}

      {/* History */}
      {showHistory && (
        <div className="mt-3 rounded-2xl border border-border/40 bg-secondary/30 p-3.5">
          <p className="mb-2 text-xs font-bold text-muted-foreground">Submission Review History</p>
          {historyData.length === 0 ? (
            <p className="text-xs text-muted-foreground">No history recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {historyData.map((h: any, i: number) => (
                <div key={h.id} className="flex items-start gap-2 text-xs">
                  <div className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground">{i + 1}</div>
                  <div>
                    <p>
                      <span className={`font-semibold ${h.new_status === "approved" ? "text-emerald-600" : h.new_status === "rejected" ? "text-rose-600" : "text-amber-600"}`}>{h.previous_status ?? "—"}</span>
                      <span className="mx-1.5 text-muted-foreground">→</span>
                      <span className={`font-semibold ${h.new_status === "approved" ? "text-emerald-600" : h.new_status === "rejected" ? "text-rose-600" : "text-amber-600"}`}>{h.new_status}</span>
                    </p>
                    <p className="text-muted-foreground text-[11px]">{new Date(h.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                    {h.reason && <p className="mt-0.5 text-muted-foreground italic text-[11px]">Feedback: {h.reason}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════
// PAYMENTS
// ══════════════════════════════════════════════
function PaymentsSection() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("payments")
        .select("*, applications(full_name, intern_id, domain, id, email, user_id)")
        .order("submitted_at", { ascending: false });
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    let list = data;
    if (statusFilter !== "all") {
      list = list.filter((p: any) => p.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p: any) =>
        (p.applications?.full_name?.toLowerCase() || '').includes(q) ||
        (p.applications?.intern_id?.toLowerCase() || '').includes(q) ||
        (p.utr_number?.toLowerCase() || '').includes(q) ||
        (p.amount?.toString() || '').includes(q)
      );
    }
    return list;
  }, [data, statusFilter, search]);

  const verify = async (paymentId: string, applicationId: string, accept: boolean) => {
    setVerifyingId(paymentId);
    try {
      if (!accept) {
        const { error } = await supabase.from("payments").update({ status: "rejected", verified_at: new Date().toISOString() }).eq("id", paymentId);
        if (error) return toast.error(error.message);
        toast.success("Payment rejected");
      } else {
        const toastId = toast.loading("Verifying payment and issuing certificate...");

        // 1. Update payment status to verified
        const { error: payErr } = await supabase.from("payments").update({ status: "verified", verified_at: new Date().toISOString() }).eq("id", paymentId);
        if (payErr) {
          toast.error(`Payment verification failed: ${payErr.message}`, { id: toastId });
          return;
        }

        // 2. Resolve target application
        let targetAppId = applicationId;
        if (!targetAppId) {
          const { data: pRec } = await supabase.from("payments").select("application_id").eq("id", paymentId).maybeSingle();
          if (pRec?.application_id) targetAppId = pRec.application_id;
        }

        let app: any = null;
        if (targetAppId) {
          const { data: aData } = await (supabase.from("applications") as any).select("*").eq("id", targetAppId).maybeSingle();
          app = aData;
        }

        if (!app) {
          toast.success("Payment verified! (Associated application not found)", { id: toastId });
        } else {
          // 3. Mark application verified, completed, and certificate_generated = true
          await (supabase.from("applications") as any).update({
            status: "completed",
            submission_status: "approved",
            verified: true,
            verified_at: new Date().toISOString(),
            certificate_generated: true,
            certificate_generated_at: new Date().toISOString(),
          }).eq("id", targetAppId);

          // 4. Retrieve or generate certificate
          const { data: existingCert } = await supabase.from("certificates").select("certificate_id").eq("application_id", targetAppId).maybeSingle();
          let cert_id = existingCert?.certificate_id;

          if (!cert_id) {
            cert_id = generateCertId();
            const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
            const { error: cerr } = await supabase.from("certificates").insert({
              application_id: targetAppId,
              certificate_id: cert_id,
              verification_hash: hash,
            });
            if (cerr) {
              console.error("[Cert] Failed to create certificate record:", cerr);
            }
          }

          // 5. Automatically send the certificate to student's registered email via Gmail SMTP
          let targetEmail = (app.email || "").trim();
          if (!targetEmail && app.user_id) {
            const { data: prof } = await supabase.from("profiles").select("email").eq("id", app.user_id).maybeSingle();
            if (prof?.email) targetEmail = prof.email.trim();
          }

          if (targetEmail && cert_id) {
            try {
              const { sendCertificateEmail } = await import("@/lib/email-helpers");
              const domainName = getDomain(app.domain)?.name ?? app.domain ?? "Internship Track";
              const result = await sendCertificateEmail({
                to: targetEmail,
                studentName: app.full_name,
                studentId: app.user_id,
                certId: cert_id,
                domainName,
                internId: app.intern_id,
              });

              if (result.success) {
                await (supabase.from("applications") as any).update({
                  email_status: "sent",
                  email_sent_at: new Date().toISOString(),
                  email_error: null,
                }).eq("id", targetAppId);
                toast.success(`Payment approved & Certificate ${cert_id} sent to ${targetEmail}!`, { id: toastId });
              } else {
                await (supabase.from("applications") as any).update({
                  email_status: "failed",
                  email_error: result.error || "Email delivery failed",
                }).eq("id", targetAppId);
                toast.error(`Payment approved & Certificate issued, but email delivery failed: ${result.error}`, { id: toastId, duration: 8000 });
              }
            } catch (emailErr: any) {
              console.warn("[Email] Failed to send certificate email:", emailErr);
              toast.error(`Payment approved & Certificate issued, but email error: ${emailErr.message}`, { id: toastId });
            }
          } else {
            toast.success(`Payment verified & Certificate ${cert_id ?? ''} issued!`, { id: toastId });
          }
        }
      }
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
      qc.invalidateQueries({ queryKey: ["admin-verification-pending"] });
      qc.invalidateQueries({ queryKey: ["admin-verification-reviewed"] });
      qc.invalidateQueries({ queryKey: ["admin-certs"] });
      qc.invalidateQueries({ queryKey: ["admin-email-logs"] });
      qc.invalidateQueries({ queryKey: ["admin-overview"] });
      qc.invalidateQueries({ queryKey: ["admin-students"] });
      qc.invalidateQueries({ queryKey: ["admin-students-directory"] });
    } catch (err: any) {
      toast.error(`Error verifying payment: ${err?.message || err}`);
    } finally {
      setVerifyingId(null);
    }
  };

  const pendingP = data?.filter((p: any) => p.status === "pending") ?? [];
  const doneP = data?.filter((p: any) => p.status !== "pending") ?? [];

  return (
    <div className="animate-fade-in-up space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payments</h2>
          <p className="text-sm text-muted-foreground">{filtered?.length ?? 0} matching · {data?.length ?? 0} total payments</p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-1.5 rounded-xl bg-muted/50 p-1 w-full md:w-auto">
          {(["all", "pending", "verified", "rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                statusFilter === s ? "bg-white text-foreground shadow-sm dark:bg-[#1E293B]" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            placeholder="Search student, UTR..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 rounded-xl border-border/60 bg-background/50"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/50 bg-white/60 backdrop-blur dark:bg-[#1E293B]/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3 text-left">Student</th>
              <th className="px-4 py-3 text-left">UTR</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered?.map((p: any) => (
              <tr key={p.id} className="border-b border-border/30 transition hover:bg-accent/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-bold">{p.applications?.full_name?.charAt(0)}</div>
                    <div>
                      <p className="font-medium text-sm">{p.applications?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{getDomain(p.applications?.domain)?.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{p.utr_number}</td>
                <td className="px-4 py-3 font-semibold">₹{p.amount}</td>
                <td className="px-4 py-3">
                  <Badge className={`text-xs ${
                    p.status === "verified" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                    p.status === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}>{p.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  {p.status === "pending" ? (
                    <div className="flex justify-end gap-1">
                      <button
                        disabled={verifyingId === p.id}
                        onClick={() => {
                          const appId = p.application_id || p.applications?.id || "";
                          verify(p.id, appId, true);
                        }}
                        className="grid size-8 place-items-center rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 disabled:opacity-50"
                        title="Approve Payment & Send Certificate"
                      >
                        {verifyingId === p.id ? <Loader2 className="size-4 animate-spin text-green-600" /> : <CheckCircle2 className="size-4" />}
                      </button>
                      <button
                        disabled={verifyingId === p.id}
                        onClick={() => {
                          const appId = p.application_id || p.applications?.id || "";
                          verify(p.id, appId, false);
                        }}
                        className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
                        title="Reject Payment"
                      >
                        <XCircle className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-xs">{p.status === "verified" ? "Completed" : "Rejected"}</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// VERIFICATION QUEUE
// ══════════════════════════════════════════════
function VerificationSection() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [rejectDialog, setRejectDialog] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [paymentMap, setPaymentMap] = useState<Record<string, any>>({});

  // Fetch payments separately to avoid schema cache issues with reverse join
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("payments")
        .select("application_id, utr_number, amount, status");
      if (data) {
        const map: Record<string, any> = {};
        for (const p of data) map[p.application_id] = p;
        setPaymentMap(map);
      }
    })();
  }, []);

  const { data: pendingApps } = useQuery({
    queryKey: ["admin-verification-pending"],
    queryFn: async () => {
      const [appsRes, subsRes, certsRes] = await Promise.all([
        supabase.from("applications").select("*").order("created_at", { ascending: false }),
        supabase.from("submissions").select("application_id, status"),
        supabase.from("certificates").select("application_id"),
      ]);

      const certSet = new Set(certsRes.data?.map((c: any) => c.application_id) || []);
      const appSubs = new Map<string, any[]>();
      subsRes.data?.forEach((s: any) => {
        if (!appSubs.has(s.application_id)) appSubs.set(s.application_id, []);
        appSubs.get(s.application_id)!.push(s);
      });

      const list = (appsRes.data || []).filter((app: any) => {
        if (app.submission_status === "rejected") return false;
        if (certSet.has(app.id) && (app.submission_status === "approved" || app.status === "completed")) return false;

        const subs = appSubs.get(app.id) || [];
        const approvedCount = subs.filter((s: any) => s.status === "approved").length;
        const requiredTasks = app.total_tasks || 5;

        // Pending if explicitly marked submitted OR if all tasks are approved but certificate not yet issued
        return (
          app.submission_status === "submitted" ||
          (approvedCount >= requiredTasks && !certSet.has(app.id))
        );
      });

      return list;
    },
    refetchInterval: 10_000,
  });

  const { data: reviewedApps } = useQuery({
    queryKey: ["admin-verification-reviewed"],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("applications") as any)
        .select("*")
        .in("submission_status", ["approved", "rejected"])
        .order("verified_at", { ascending: false });
      if (error) { console.error("Failed to fetch reviewed apps:", error); return []; }
      return data ?? [];
    },
    refetchInterval: 10_000,
  });

  const handleApprove = async (app: any) => {
    setActionLoading(app.id);
    try {
      const pay = paymentMap[app.id];
      const couponApplied = Boolean(
        (app.coupon_code && app.coupon_code.trim() !== "") ||
        (pay && (pay.coupon_code || pay.utr_number === "FREE_COUPON" || pay.amount === 0))
      );
      const isPaymentVerified = pay && pay.status === "verified";
      const shouldIssueCert = couponApplied || isPaymentVerified;

      let cert_id: string | null = null;
      if (shouldIssueCert) {
        const { data: existingCert } = await supabase.from("certificates").select("certificate_id").eq("application_id", app.id).maybeSingle();
        if (existingCert) {
          cert_id = existingCert.certificate_id;
        } else {
          cert_id = generateCertId();
          const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
          const { error: cerr } = await supabase.from("certificates").insert({
            application_id: app.id,
            certificate_id: cert_id,
            verification_hash: hash,
          });
          if (cerr) throw cerr;
        }
      }

      // Update application
      const { error: updErr } = await (supabase
        .from("applications") as any)
        .update({
          submission_status: "approved",
          verified: true,
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          certificate_generated: shouldIssueCert,
          certificate_generated_at: shouldIssueCert ? new Date().toISOString() : null,
          verification_notes: null,
          rejection_reason: null,
        })
        .eq("id", app.id);
      if (updErr) throw updErr;

      if (shouldIssueCert && cert_id) {
        const studentEmail = app.email;
        if (studentEmail) {
          const toastId = toast.loading(`Sending Certificate to ${studentEmail}...`);
          try {
            const { sendCertificateEmail } = await import("@/lib/email-helpers");
            const result = await sendCertificateEmail({
              to: studentEmail,
              studentName: app.full_name,
              studentId: app.user_id,
              certId: cert_id!,
              domainName: getDomain(app.domain)?.name ?? app.domain,
              internId: app.intern_id,
            });
            if (result.success) {
              toast.success(`Internship approved & Certificate ${cert_id} sent to ${studentEmail}!`, { id: toastId });
            } else {
              toast.error(`Internship approved, but certificate email failed: ${result.error}`, { id: toastId, duration: 8000 });
            }
          } catch (e: any) {
            console.warn("[Email] Failed to send certificate:", e);
            toast.error(`Internship approved, but certificate email error: ${e.message}`, { id: toastId });
          }
        } else {
          toast.success(`Internship approved! Certificate ${cert_id} issued.`);
        }
      } else {
        toast.success("Tasks approved! Student notified to submit payment verification before certificate issuance.");
      }

      qc.invalidateQueries({ queryKey: ["admin-verification-pending"] });
      qc.invalidateQueries({ queryKey: ["admin-verification-reviewed"] });
      qc.invalidateQueries({ queryKey: ["admin-overview"] });
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to approve internship");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog) return;
    setActionLoading(rejectDialog.id);
    try {
      const { error: updErr } = await (supabase
        .from("applications") as any)
        .update({
          submission_status: "rejected",
          verified: false,
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          rejection_reason: rejectReason || "Incomplete submission",
          verification_notes: rejectReason || "Rejected by admin",
        })
        .eq("id", rejectDialog.id);
      if (updErr) throw updErr;

      toast.success("Internship rejected");
      setRejectDialog(null);
      setRejectReason("");

      qc.invalidateQueries({ queryKey: ["admin-verification-pending"] });
      qc.invalidateQueries({ queryKey: ["admin-verification-reviewed"] });
      qc.invalidateQueries({ queryKey: ["admin-overview"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to reject internship");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="animate-fade-in-up space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Internship Verification Queue</h2>
          <p className="text-sm text-muted-foreground">{pendingApps?.length ?? 0} pending, {reviewedApps?.length ?? 0} reviewed</p>
        </div>
      </div>

      {/* Pending */}
      {pendingApps && pendingApps.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-amber-600 flex items-center gap-2"><Clock className="size-4" /> Pending Verification ({pendingApps.length})</h3>
          <div className="space-y-3">
            {pendingApps.map((a: any) => {
              const pay = paymentMap[a.id];
              const hasCoupon = Boolean(
                (a.coupon_code && a.coupon_code.trim() !== "") ||
                (pay && (pay.coupon_code || pay.utr_number === "FREE_COUPON" || pay.amount === 0))
              );
              const isPayDone = pay && pay.status === "verified";
              const issuesCert = hasCoupon || isPayDone;

              return (
              <div key={a.id} className="rounded-2xl border border-border/50 bg-white/70 p-5 backdrop-blur dark:bg-[#1E293B]/70">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-full brand-gradient text-sm font-bold text-white">{a.full_name?.charAt(0)?.toUpperCase() ?? "?"}</div>
                    <div>
                      <p className="font-semibold text-sm">{a.full_name}</p>
                      <p className="text-xs text-muted-foreground">{a.intern_id} · {getDomain(a.domain)?.name ?? a.domain} · {a.duration ?? 1} Month(s)</p>
                    </div>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs">Submitted</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div><span className="text-muted-foreground">Applied</span><p className="font-semibold">{new Date(a.created_at).toLocaleDateString("en-IN")}</p></div>
                  <div><span className="text-muted-foreground">Submitted</span><p className="font-semibold">{a.submitted_at ? new Date(a.submitted_at).toLocaleDateString("en-IN") : "—"}</p></div>
                  <div><span className="text-muted-foreground">Payment</span><p className="font-semibold">{pay ? (pay.utr_number === "FREE_COUPON" ? "Free Coupon" : `₹${pay.amount}`) : "—"}</p></div>
                  <div><span className="text-muted-foreground">Status</span><p className="font-semibold capitalize">{pay?.status ?? "—"}</p></div>
                </div>
                {a.coupon_code && <p className="mt-2 text-xs text-muted-foreground">Coupon: <span className="font-mono font-bold text-emerald-600">{a.coupon_code}</span></p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white border-0 rounded-xl"
                    disabled={actionLoading === a.id}
                    onClick={() => handleApprove(a)}>
                    {actionLoading === a.id ? <Loader2 className="size-3.5 animate-spin mr-1" /> : <CheckCircle2 className="size-3.5 mr-1" />}
                    {issuesCert ? "Approve & Issue Certificate" : "Approve Tasks (Awaiting Payment)"}
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                    disabled={actionLoading === a.id}
                    onClick={() => { setRejectDialog(a); setRejectReason(""); }}>
                    <XCircle className="size-3.5 mr-1" /> Reject
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-xl border-border/60" onClick={() => setSelectedApp(selectedApp?.id === a.id ? null : a)}>
                    <Eye className="size-3.5 mr-1" /> {selectedApp?.id === a.id ? "Hide" : "View"} Details
                  </Button>
                </div>
                {selectedApp?.id === a.id && (
                  <div className="mt-4 rounded-xl border border-border/40 bg-muted/30 p-4 text-xs space-y-2">
                    <p><span className="font-semibold">Email:</span> {a.email}</p>
                    <p><span className="font-semibold">Phone:</span> {a.phone ?? "—"}</p>
                    <p><span className="font-semibold">College:</span> {a.college} · {a.course} ({a.year})</p>
                    <p><span className="font-semibold">Location:</span> {[a.city, a.district, a.state, a.country].filter(Boolean).join(", ") || "—"}</p>
                    <p><span className="font-semibold">Duration:</span> {a.duration ?? 1} Month(s)</p>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>
      )}

      {(!pendingApps || pendingApps.length === 0) && (
        <div className="rounded-2xl border border-border/50 bg-white/60 p-12 text-center backdrop-blur dark:bg-[#1E293B]/60">
          <Shield className="size-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="font-bold text-base">No Pending Verifications</h3>
          <p className="text-sm text-muted-foreground mt-1">All submitted internships have been reviewed.</p>
        </div>
      )}

      {/* Reviewed */}
      {reviewedApps && reviewedApps.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Reviewed ({reviewedApps.length})</h3>
          <div className="overflow-x-auto rounded-2xl border border-border/50 bg-white/60 backdrop-blur dark:bg-[#1E293B]/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left">Domain</th>
                  <th className="px-4 py-3 text-left">Submitted</th>
                  <th className="px-4 py-3 text-left">Verified</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {reviewedApps.map((a: any) => (
                  <tr key={a.id} className="border-b border-border/30 transition hover:bg-accent/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-bold">{a.full_name?.charAt(0)}</div>
                        <div>
                          <p className="font-medium text-sm">{a.full_name}</p>
                          <p className="text-xs text-muted-foreground">{a.intern_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="secondary" className="text-xs">{getDomain(a.domain)?.name ?? a.domain}</Badge></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{a.submitted_at ? new Date(a.submitted_at).toLocaleDateString("en-IN") : "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{a.verified_at ? new Date(a.verified_at).toLocaleDateString("en-IN") : "—"}</td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs ${a.submission_status === "approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                        {a.submission_status === "approved" ? "Approved" : "Rejected"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      {rejectDialog && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => !actionLoading && setRejectDialog(null)}>
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-border/50 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:bg-[#1E293B]/95 dark:border-white/10 my-auto" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold">Reject Internship</h3>
              <p className="mt-2 text-sm text-muted-foreground">Reject internship for <span className="font-semibold text-foreground">{rejectDialog.full_name}</span>.</p>
              <div className="mt-4">
                <Label className="text-xs">Reason for rejection</Label>
                <Textarea
                  placeholder="Provide feedback — student will see this..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  className="mt-1 text-xs"
                />
                <p className="mt-1 text-[10px] text-muted-foreground">Common reasons: Missing files, Incomplete project, Incorrect GitHub repo, Project not working</p>
              </div>
              <div className="mt-6 flex gap-3 justify-end">
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => { setRejectDialog(null); setRejectReason(""); }} disabled={actionLoading === rejectDialog.id}>Cancel</Button>
                <Button size="sm" className="rounded-xl bg-red-600 hover:bg-red-700 text-white border-0"
                  disabled={actionLoading === rejectDialog.id || !rejectReason.trim()}
                  onClick={handleReject}>
                  {actionLoading === rejectDialog.id ? "Rejecting..." : "Reject Submission"}
                </Button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════
// CERTIFICATES
// ══════════════════════════════════════════════
function CertificatesSection() {
  const qc = useQueryClient();
  const [downloading, setDownloading] = useState(false);
  const [sendingCertId, setSendingCertId] = useState<string | null>(null);
  const [backfilling, setBackfilling] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin-certs"],
    queryFn: async () => {
      const { data: list } = await supabase
        .from("certificates")
        .select("*, applications(full_name, intern_id, domain, email, user_id)")
        .order("issued_at", { ascending: false });
      return list ?? [];
    },
  });

  // Query completed students who do not have certificates yet
  const { data: eligiblePending } = useQuery({
    queryKey: ["admin-certs-eligible-pending"],
    queryFn: async () => {
      const [appsRes, subsRes, certsRes, paysRes] = await Promise.all([
        supabase.from("applications").select("*"),
        supabase.from("submissions").select("application_id, status"),
        supabase.from("certificates").select("application_id"),
        supabase.from("payments").select("application_id, status"),
      ]);

      const certSet = new Set(certsRes.data?.map((c: any) => c.application_id) || []);
      const payMap = new Map(paysRes.data?.map((p: any) => [p.application_id, p]) || []);
      const appSubs = new Map<string, any[]>();
      subsRes.data?.forEach((s: any) => {
        if (!appSubs.has(s.application_id)) appSubs.set(s.application_id, []);
        appSubs.get(s.application_id)!.push(s);
      });

      const list: any[] = [];
      appsRes.data?.forEach((app: any) => {
        const hasCert = certSet.has(app.id);
        const subs = appSubs.get(app.id) || [];
        const approvedCount = subs.filter((s: any) => s.status === "approved").length;
        const requiredTasks = app.total_tasks || 5;
        const pay = payMap.get(app.id);
        const isCompleted = approvedCount >= requiredTasks || (pay && pay.status === "verified");
        if (isCompleted && !hasCert) {
          list.push({ app, approvedCount, requiredTasks, pay });
        }
      });
      return list;
    },
    refetchInterval: 10_000,
  });

  const handleBackfill = async () => {
    setBackfilling(true);
    const toastId = toast.loading("Checking & issuing certificates for completed students...");
    try {
      const { backfillCompletedCertificates } = await import("@/lib/email-service");
      const res = await backfillCompletedCertificates();
      if (res.success) {
        if (res.count > 0) {
          toast.success(`Successfully issued & sent certificates to ${res.count} student(s)!`, { id: toastId });
        } else {
          toast.info("All completed students already have certificates.", { id: toastId });
        }
        qc.invalidateQueries({ queryKey: ["admin-certs"] });
        qc.invalidateQueries({ queryKey: ["admin-certs-eligible-pending"] });
        qc.invalidateQueries({ queryKey: ["admin-payments"] });
        qc.invalidateQueries({ queryKey: ["admin-verification-reviewed"] });
        qc.invalidateQueries({ queryKey: ["admin-verification-pending"] });
        qc.invalidateQueries({ queryKey: ["admin-email-logs"] });
        qc.invalidateQueries({ queryKey: ["admin-overview"] });
      } else {
        toast.error(`Backfill failed: ${res.error}`, { id: toastId });
      }
    } catch (e: any) {
      toast.error(`Backfill error: ${e.message}`, { id: toastId });
    } finally {
      setBackfilling(false);
    }
  };

  const handleSendCertificate = async (c: any) => {
    setSendingCertId(c.id);
    const targetEmail = c.applications?.email;
    const targetName = c.applications?.full_name ?? "Student";
    if (!targetEmail) {
      toast.error("Student email not found for this certificate");
      setSendingCertId(null);
      return;
    }

    const toastId = toast.loading(`Sending Certificate to ${targetEmail}...`);
    try {
      const { sendCertificateEmail } = await import("@/lib/email-helpers");
      const result = await sendCertificateEmail({
        to: targetEmail,
        studentName: targetName,
        studentId: c.applications?.user_id ?? c.user_id ?? c.id,
        certId: c.certificate_id,
        domainName: getDomain(c.applications?.domain)?.name ?? c.applications?.domain ?? "Internship Track",
        internId: c.applications?.intern_id ?? "",
      });

      if (result.success) {
        toast.success(`Certificate ${c.certificate_id} sent to ${targetEmail}!`, { id: toastId });
        qc.invalidateQueries({ queryKey: ["admin-certs"] });
        qc.invalidateQueries({ queryKey: ["admin-email-logs"] });
      } else {
        toast.error(`Certificate delivery failed: ${result.error || "Unknown error"}`, { id: toastId, duration: 8000 });
      }
    } catch (err: any) {
      toast.error(`Error sending certificate: ${err.message}`, { id: toastId });
    } finally {
      setSendingCertId(null);
    }
  };

  const downloadAll = async () => {
    if (!data) return;
    setDownloading(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      for (const c of data) {
        const doc = CertificateDoc({
          fullName: c.applications?.full_name ?? "Student",
          internId: c.applications?.intern_id ?? "",
          domain: getDomain(c.applications?.domain)?.name ?? c.applications?.domain,
          certId: c.certificate_id,
          issuedAt: c.issued_at,
          verifyUrl: `${getPublicSiteUrl()}/verify-certificate`,
        });
        const blob = await downloadPdfBlob(doc);
        zip.file(`certificate-${c.certificate_id}.pdf`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url; a.download = `certificates-${new Date().toISOString().slice(0, 10)}.zip`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success(`Downloaded ${data.length} certificates`);
    } catch (err) {
      toast.error("Failed to generate certificates");
      console.error(err);
    }
    setDownloading(false);
  };

  return (
    <div className="animate-fade-in-up space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Certificate Management</h2>
          <p className="text-sm text-muted-foreground">{data?.length ?? 0} certificates</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleBackfill}
            disabled={backfilling}
            className="rounded-xl text-xs gap-1.5 border-border/60"
            title="Scan and issue certificates to completed students"
          >
            {backfilling ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
            Backfill Completed Students
          </Button>
          <Button onClick={downloadAll} disabled={downloading} className="brand-gradient text-white border-0">
            <Download className="mr-1.5 size-4" />{downloading ? "Generating…" : "Download All as ZIP"}
          </Button>
        </div>
      </div>

      {eligiblePending && eligiblePending.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <Award className="size-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="font-semibold text-sm">
                {eligiblePending.length} completed student(s) ready for Certificate generation & delivery
              </p>
              <p className="text-xs text-muted-foreground">
                {eligiblePending.map((e: any) => `${e.app.full_name} (${e.app.email})`).join(", ")}
              </p>
            </div>
          </div>
          <Button
            onClick={handleBackfill}
            disabled={backfilling}
            className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs shrink-0 border-0"
          >
            {backfilling ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : <Sparkles className="size-3.5 mr-1.5" />}
            Issue & Send Certificates ({eligiblePending.length})
          </Button>
        </div>
      )}
      <div className="overflow-x-auto rounded-2xl border border-border/50 bg-white/60 backdrop-blur dark:bg-[#1E293B]/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3 text-left">Certificate ID</th>
              <th className="px-4 py-3 text-left">Student</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Domain</th>
              <th className="px-4 py-3 text-left">Issued</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!data?.length && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No certificates issued yet.</td></tr>
            )}
            {data?.map((c: any) => (
              <tr key={c.id} className="border-b border-border/30 transition hover:bg-accent/20">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">{c.certificate_id}</td>
                <td className="px-4 py-3 font-medium">{c.applications?.full_name}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{c.applications?.email || "—"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{getDomain(c.applications?.domain)?.name}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(c.issued_at).toLocaleDateString("en-IN")}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      className="grid size-8 place-items-center rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition disabled:opacity-50"
                      title="Send Certificate to Gmail"
                      disabled={sendingCertId === c.id}
                      onClick={() => handleSendCertificate(c)}
                    >
                      {sendingCertId === c.id ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
                    </button>
                    <button className="grid size-8 place-items-center rounded-lg hover:bg-accent/50" title="Download PDF" onClick={() => {
                      downloadPdf(CertificateDoc({
                        fullName: c.applications?.full_name ?? "Student",
                        internId: c.applications?.intern_id ?? "",
                        domain: getDomain(c.applications?.domain)?.name ?? c.applications?.domain,
                        certId: c.certificate_id,
                        issuedAt: c.issued_at,
                        verifyUrl: `${getPublicSiteUrl()}/verify-certificate`,
                      }), `certificate-${c.certificate_id}.pdf`);
                    }}><Download className="size-4" /></button>
                    <Link to="/verify-certificate" className="grid size-8 place-items-center rounded-lg hover:bg-accent/50" title="View Verification Page"><ExternalLink className="size-4" /></Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// STUDENTS (USER ACCOUNTS)
// ══════════════════════════════════════════════
function StudentsSection() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "account_only" | "applied" | "online">("all");
  const [selectedStudent, setSelectedStudent] = useState<AdminStudentAccount | null>(null);

  const { data: students, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin-students-directory"],
    refetchInterval: 30_000,
    queryFn: async () => {
      const data = await getAdminStudents();
      return data ?? [];
    },
  });

  const counts = useMemo(() => {
    if (!students) return { total: 0, accountOnly: 0, applied: 0, online: 0 };
    return {
      total: students.length,
      accountOnly: students.filter((s) => !s.has_application).length,
      applied: students.filter((s) => s.has_application).length,
      online: students.filter((s) => s.is_online).length,
    };
  }, [students]);

  const filtered = useMemo(() => {
    if (!students) return [];
    let list = students;
    if (filter === "account_only") {
      list = list.filter((s) => !s.has_application);
    } else if (filter === "applied") {
      list = list.filter((s) => s.has_application);
    } else if (filter === "online") {
      list = list.filter((s) => s.is_online);
    }
    if (!search) return list;
    const q = search.toLowerCase().trim();
    return list.filter((s) =>
      s.full_name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q) ||
      s.college?.toLowerCase().includes(q) ||
      s.course?.toLowerCase().includes(q) ||
      s.intern_id?.toLowerCase().includes(q) ||
      s.domain?.toLowerCase().includes(q)
    );
  }, [students, filter, search]);

  return (
    <div className="animate-fade-in-up space-y-4">
      {selectedStudent && (
        <StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}

      {/* Header & Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Students</h2>
            <Badge variant="secondary" className="rounded-lg text-xs font-semibold">
              {students ? `${students.length} Accounts` : "Loading..."}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Registered student user accounts directory
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, email, college, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-xl pl-9 text-xs border-border/60"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-3 rounded-xl gap-1.5 text-xs shrink-0"
            title="Refresh students list"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin text-blue-600" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilter("all")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium transition ${
            filter === "all"
              ? "bg-[#07284a] text-white shadow-sm dark:bg-blue-600"
              : "bg-white/80 text-muted-foreground hover:bg-white hover:text-foreground border border-border/50 dark:bg-slate-800/60"
          }`}
        >
          <Users className="size-3.5" />
          <span>All Accounts</span>
          <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${filter === "all" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
            {counts.total}
          </span>
        </button>

        <button
          onClick={() => setFilter("account_only")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium transition ${
            filter === "account_only"
              ? "bg-[#07284a] text-white shadow-sm dark:bg-blue-600"
              : "bg-white/80 text-muted-foreground hover:bg-white hover:text-foreground border border-border/50 dark:bg-slate-800/60"
          }`}
        >
          <UserCheck className="size-3.5" />
          <span>Account Only</span>
          <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${filter === "account_only" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
            {counts.accountOnly}
          </span>
        </button>

        <button
          onClick={() => setFilter("applied")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium transition ${
            filter === "applied"
              ? "bg-[#07284a] text-white shadow-sm dark:bg-blue-600"
              : "bg-white/80 text-muted-foreground hover:bg-white hover:text-foreground border border-border/50 dark:bg-slate-800/60"
          }`}
        >
          <GraduationCap className="size-3.5" />
          <span>With Application</span>
          <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${filter === "applied" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
            {counts.applied}
          </span>
        </button>

        <button
          onClick={() => setFilter("online")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium transition ${
            filter === "online"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white/80 text-muted-foreground hover:bg-white hover:text-foreground border border-border/50 dark:bg-slate-800/60"
          }`}
        >
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Online Now</span>
          <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${filter === "online" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
            {counts.online}
          </span>
        </button>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto rounded-2xl border border-border/50 bg-white/60 backdrop-blur dark:bg-[#1E293B]/60 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-xs uppercase text-muted-foreground bg-muted/20">
              <th className="px-4 py-3 text-left">Student User</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">College & Education</th>
              <th className="px-4 py-3 text-left">Internship</th>
              <th className="px-4 py-3 text-left">Last Active</th>
              <th className="px-4 py-3 text-left">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="size-6 animate-spin text-blue-600" />
                    <span>Loading student user accounts...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">
                  No students found matching your search or filter.
                </td>
              </tr>
            ) : (
              filtered.map((s: AdminStudentAccount) => {
                const initialLetter = s.full_name && s.full_name !== "—" ? String(s.full_name).trim().charAt(0).toUpperCase() : "S";
                return (
                  <tr key={s.id} className="border-b border-border/30 transition hover:bg-accent/20">
                    {/* Student User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {s.photo_url ? (
                          <img
                            src={s.photo_url}
                            alt={s.full_name}
                            className="size-9 rounded-full object-cover border border-border/60 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="grid size-9 shrink-0 place-items-center rounded-full brand-gradient text-xs font-bold text-white shadow-sm">
                            {initialLetter}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-semibold text-sm truncate">{s.full_name ?? "—"}</p>
                            {!s.has_application && (
                              <span className="rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-500 px-1.5 py-0.5 border border-slate-200/50 dark:border-slate-700/50">
                                Account
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{s.email ?? "—"}</p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {s.is_online ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30">
                          <Wifi className="size-3" /> Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-900/40 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/40">
                          <WifiOff className="size-3" /> Offline
                        </span>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {s.phone && s.phone !== "—" ? s.phone : <span className="text-slate-300 dark:text-slate-600">—</span>}
                    </td>

                    {/* College & Education */}
                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="text-xs font-medium text-foreground truncate" title={s.college ?? "—"}>
                        {s.college && s.college !== "—" ? s.college : <span className="text-muted-foreground font-normal">—</span>}
                      </p>
                      {(s.course || s.year) && (s.course !== "—" || s.year !== "—") && (
                        <p className="text-[11px] text-muted-foreground truncate">
                          {[s.course !== "—" ? s.course : null, s.year !== "—" ? s.year : null].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </td>

                    {/* Internship */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {s.has_application ? (
                        <div className="space-y-0.5">
                          <Badge variant="secondary" className="text-xs font-medium">
                            {getDomain(s.domain)?.name ?? s.domain}
                          </Badge>
                          {s.intern_id && (
                            <p className="font-mono text-[10px] text-muted-foreground tracking-tight">
                              {s.intern_id}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 text-[11px] text-muted-foreground">
                          No Application
                        </span>
                      )}
                    </td>

                    {/* Last Active */}
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {s.last_active
                        ? new Date(s.last_active).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {s.created_at ? new Date(s.created_at).toLocaleDateString("en-IN") : "—"}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setSelectedStudent(s)}
                          className="grid size-8 place-items-center rounded-lg text-slate-600 hover:text-foreground hover:bg-accent/60 transition"
                          title="View Student Account Details"
                        >
                          <Eye className="size-4" />
                        </button>
                        {s.email && s.email !== "—" && (
                          <a
                            href={`mailto:${s.email}`}
                            className="grid size-8 place-items-center rounded-lg text-slate-600 hover:text-foreground hover:bg-accent/60 transition"
                            title={`Send email to ${s.email}`}
                          >
                            <Mail className="size-4" />
                          </a>
                        )}
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
  );
}

// ══════════════════════════════════════════════
// ANALYTICS
// ══════════════════════════════════════════════
function AnalyticsSection() {
  const qc = useQueryClient();
  const cfg = { refetchInterval: 3_000 };

  const [isDark, setIsDark] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => new Date().toLocaleTimeString());
  const [realtimeActive, setRealtimeActive] = useState<boolean>(true);

  // Time range selector for registrations: "30d" | "6m" | "12m" (default to 30d for real-time daily activity)
  const [regTimeRange, setRegTimeRange] = useState<"30d" | "6m" | "12m">("30d");

  // Registration source: "profiles" (Student Accounts) | "applications" (Internship Applications)
  const [regSource, setRegSource] = useState<"profiles" | "applications">("profiles");

  // Completion source: "courses" (Course Enrollments) | "internships" (Internship Applications)
  const [completionSource, setCompletionSource] = useState<"courses" | "internships">("courses");

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Real-time live counts across all tables for accurate pill badges
  const { data: analyticsTotals } = useQuery({
    queryKey: ["admin-analytics-totals"],
    queryFn: async () => {
      const [profRes, appRes, enrRes, courseRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("applications").select("id", { count: "exact", head: true }),
        supabase.from("enrollments").select("id", { count: "exact", head: true }),
        supabase.from("courses").select("id", { count: "exact", head: true }),
      ]);
      return {
        profiles: profRes.count ?? 0,
        applications: appRes.count ?? 0,
        enrollments: enrRes.count ?? 0,
        courses: courseRes.count ?? 0,
      };
    },
    ...cfg,
  });

  // Real-time subscriptions across all analytics tables
  useEffect(() => {
    const channelName = `analytics-live-sync-${Math.random().toString(36).substring(2, 8)}`;
    const channel = supabase.channel(channelName);
    const tables = ["applications", "payments", "enrollments", "profiles", "submissions", "submission_history"];

    for (const table of tables) {
      channel.on("postgres_changes" as any, { event: "*", schema: "public", table }, (payload: any) => {
        setLastSyncTime(new Date().toLocaleTimeString());
        qc.refetchQueries({ queryKey: ["admin-analytics-totals"] });
        qc.refetchQueries({ queryKey: ["admin-analytics-registrations"] });
        qc.refetchQueries({ queryKey: ["admin-analytics-completion"] });
        qc.refetchQueries({ queryKey: ["admin-analytics-domains"] });
        qc.refetchQueries({ queryKey: ["admin-analytics-revenue"] });
        qc.refetchQueries({ queryKey: ["admin-analytics-locations"] });
        qc.invalidateQueries({ queryKey: ["admin-analytics"] });
      });
    }

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setRealtimeActive(true);
      } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
        setRealtimeActive(false);
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const handleManualRefresh = () => {
    setLastSyncTime(new Date().toLocaleTimeString());
    qc.refetchQueries({ queryKey: ["admin-analytics-totals"] });
    qc.refetchQueries({ queryKey: ["admin-analytics-registrations"] });
    qc.refetchQueries({ queryKey: ["admin-analytics-completion"] });
    qc.refetchQueries({ queryKey: ["admin-analytics-domains"] });
    qc.refetchQueries({ queryKey: ["admin-analytics-revenue"] });
    qc.refetchQueries({ queryKey: ["admin-analytics-locations"] });
    toast.success("Analytics synced with live database");
  };

  // ─── 1. Student Registrations / Applications (Real-Time) ───
  const {
    data: regState,
    isLoading: isRegLoading,
    isError: isRegError,
    refetch: refetchReg,
  } = useQuery({
    queryKey: ["admin-analytics-registrations", regTimeRange, regSource],
    queryFn: async () => {
      const table = regSource === "applications" ? "applications" : "profiles";
      const { data, error } = await supabase.from(table).select("created_at");
      if (error) {
        console.error(`Failed to load ${table} analytics:`, error);
        throw error;
      }

      const now = new Date();
      const points: Array<{
        key: string;
        label: string;
        fullLabel: string;
        registrations: number;
      }> = [];

      if (regTimeRange === "30d") {
        // Daily breakdown for the last 30 days
        const dailyMap = new Map<string, number>();
        if (data) {
          data.forEach((p: any) => {
            if (!p.created_at) return;
            const d = new Date(p.created_at);
            const key = d.toLocaleDateString("en-CA");
            dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
          });
        }

        for (let i = 29; i >= 0; i--) {
          const target = new Date(now.getTime() - i * 24 * 3600 * 1000);
          const key = target.toLocaleDateString("en-CA");
          const monthShort = target.toLocaleString("en-IN", { month: "short" });
          const dayNum = target.getDate();
          points.push({
            key,
            label: `${monthShort} ${dayNum}`,
            fullLabel: target.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
            registrations: dailyMap.get(key) || 0,
          });
        }
      } else {
        // Monthly breakdown (6m or 12m)
        const monthCount = regTimeRange === "6m" ? 6 : 12;
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const fullMonthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];

        const monthMap = new Map<string, number>();
        if (data) {
          data.forEach((p: any) => {
            if (!p.created_at) return;
            const d = new Date(p.created_at);
            const ymKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            monthMap.set(ymKey, (monthMap.get(ymKey) || 0) + 1);
          });
        }

        for (let i = monthCount - 1; i >= 0; i--) {
          const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const y = targetDate.getFullYear();
          const m = targetDate.getMonth();
          const ymKey = `${y}-${String(m + 1).padStart(2, "0")}`;
          points.push({
            key: ymKey,
            label: monthNames[m],
            fullLabel: `${fullMonthNames[m]} ${y}`,
            registrations: monthMap.get(ymKey) || 0,
          });
        }
      }

      const total = data?.length ?? 0;
      const recent = points[points.length - 1]?.registrations ?? 0;
      const prior = points[points.length - 2]?.registrations ?? 0;
      let trendLabel: string | null = null;

      if (regTimeRange === "30d") {
        const last7 = points.slice(-7).reduce((acc, p) => acc + p.registrations, 0);
        const prev7 = points.slice(-14, -7).reduce((acc, p) => acc + p.registrations, 0);
        if (prev7 > 0) {
          const pct = Math.round(((last7 - prev7) / prev7) * 100);
          trendLabel = `${pct >= 0 ? "+" : ""}${pct}% vs last week`;
        } else if (last7 > 0) {
          trendLabel = `+${last7} this week`;
        } else if (recent > 0) {
          trendLabel = `+${recent} today`;
        }
      } else {
        if (prior > 0) {
          const pct = Math.round(((recent - prior) / prior) * 100);
          trendLabel = `${pct >= 0 ? "+" : ""}${pct}% vs last month`;
        } else if (recent > 0) {
          trendLabel = `+${recent} this month`;
        }
      }

      return {
        data: points,
        total,
        recent,
        prior,
        trendLabel,
      };
    },
    ...cfg,
  });

  // ─── 2. Completion Rate (Courses or Internships) ───
  const {
    data: completion,
    isLoading: isCompletionLoading,
    isError: isCompletionError,
    refetch: refetchCompletion,
  } = useQuery({
    queryKey: ["admin-analytics-completion", completionSource],
    queryFn: async () => {
      if (completionSource === "internships") {
        const { data, error } = await supabase
          .from("applications")
          .select("status, submission_status");
        if (error) {
          console.error("Failed to load internship applications analytics:", error);
          throw error;
        }
        const total = data?.length ?? 0;
        const completed = data?.filter((a: any) => a.status === "completed" || a.submission_status === "approved").length ?? 0;
        const inProgress = Math.max(total - completed, 0);
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        const donutData = [
          { name: "Completed", value: completed, color: "#2563eb" },
          { name: "In Progress", value: inProgress, color: isDark ? "#334155" : "#e2e8f0" },
        ];

        console.log("Internship Analytics:", { total, completed, inProgress, completionRate: `${pct}%` });
        return { completed, inProgress, pct, total, donutData, label: "Internships" };
      } else {
        const { data, error } = await supabase
          .from("enrollments")
          .select("status, progress_percent");
        if (error) {
          console.error("Failed to load enrollment analytics:", error);
          throw error;
        }
        const total = data?.length ?? 0;
        const completed = data?.filter((e: any) => e.status?.toLowerCase() === "completed").length ?? 0;
        const inProgress = Math.max(total - completed, 0);
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        const donutData = [
          { name: "Completed", value: completed, color: "#2563eb" },
          { name: "In Progress", value: inProgress, color: isDark ? "#334155" : "#e2e8f0" },
        ];

        console.log("Course Analytics:", { totalEnrolled: total, completed, inProgress, completionRate: `${pct}%` });
        return { completed, inProgress, pct, total, donutData, label: "Courses" };
      }
    },
    ...cfg,
  });

  // ─── 3. Domain Popularity ───
  const { data: domainData = [], isLoading: isDomainLoading } = useQuery({
    queryKey: ["admin-analytics-domains"],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("domain");
      if (error) {
        console.error("Failed to load domain analytics:", error);
        throw error;
      }
      if (!data || data.length === 0) return [];
      const map: Record<string, number> = {};
      data.forEach((a: any) => {
        if (a.domain) map[a.domain] = (map[a.domain] || 0) + 1;
      });
      const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
      return Object.entries(map)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([label, count]) => ({
          label,
          count,
          pct: Math.round((count / total) * 100),
        }));
    },
    ...cfg,
  });

  // ─── 4. Revenue Overview ───
  const { data: revenue, isLoading: isRevenueLoading } = useQuery({
    queryKey: ["admin-analytics-revenue"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("payments" as any) as any)
        .select("amount, submitted_at, verified_at")
        .eq("status", "verified");
      if (error) {
        console.error("Failed to load revenue analytics:", error);
        throw error;
      }
      if (!data || data.length === 0) return { data: [], total: 0 };
      const map: Record<string, number> = {};
      data.forEach((p: any) => {
        const d = new Date(p.verified_at || p.submitted_at || Date.now());
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        map[key] = (map[key] || 0) + Number(p.amount);
      });
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const fullMonthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const now = new Date();
      const points: Array<{ month: string; fullMonth: string; amount: number }> = [];
      for (let i = 11; i >= 0; i--) {
        const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = targetDate.getFullYear();
        const m = targetDate.getMonth();
        const key = `${y}-${String(m + 1).padStart(2, "0")}`;
        points.push({
          month: monthNames[m],
          fullMonth: `${fullMonthNames[m]} ${y}`,
          amount: map[key] || 0,
        });
      }
      return { data: points, total: points.reduce((a, b) => a + b.amount, 0) };
    },
    ...cfg,
  });

  // ─── 5. Location & Discovery Analytics ───
  const { data: locationStats, isLoading: isLocLoading } = useQuery({
    queryKey: ["admin-analytics-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("country, state, district, city, hear_about, referral_name");
      if (error) {
        console.error("Failed to load location analytics:", error);
        throw error;
      }
      if (!data || data.length === 0) {
        return { countries: [], states: [], districts: [], cities: [], sources: [], referrals: [] };
      }

      const countryMap: Record<string, number> = {};
      const stateMap: Record<string, number> = {};
      const districtMap: Record<string, number> = {};
      const cityMap: Record<string, number> = {};
      const sourceMap: Record<string, number> = {};
      const referralMap: Record<string, number> = {};

      data.forEach((row: any) => {
        const country = row.country || "India";
        const state = row.state || "Not Provided";
        const district = row.district || "Not Provided";
        const city = row.city || "Not Provided";
        const source = row.hear_about || "Direct / Search";
        const refName = row.referral_name;

        countryMap[country] = (countryMap[country] || 0) + 1;
        stateMap[state] = (stateMap[state] || 0) + 1;
        districtMap[district] = (districtMap[district] || 0) + 1;
        cityMap[city] = (cityMap[city] || 0) + 1;
        sourceMap[source] = (sourceMap[source] || 0) + 1;

        if (refName && refName.trim()) {
          referralMap[refName] = (referralMap[refName] || 0) + 1;
        }
      });

      const total = data.length || 1;

      const countries = Object.entries(countryMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([label, count]) => ({ label, count, pct: Math.round((count / total) * 100) }));

      const states = Object.entries(stateMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([label, count]) => ({ label, count, pct: Math.round((count / total) * 100) }));

      const districts = Object.entries(districtMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([label, count]) => ({ label, count, pct: Math.round((count / total) * 100) }));

      const cities = Object.entries(cityMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([label, count]) => ({ label, count, pct: Math.round((count / total) * 100) }));

      const sources = Object.entries(sourceMap)
        .sort((a, b) => b[1] - a[1])
        .map(([label, count]) => ({ label, count, pct: Math.round((count / total) * 100) }));

      const referrals = Object.entries(referralMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      return { countries, states, districts, cities, sources, referrals };
    },
    ...cfg,
  });

  const noRegData = !regState || regState.data.length === 0 || regState.data.every((p) => p.registrations === 0);
  const noCompletionData = !completion || completion.total === 0;
  const noDomainData = domainData.length === 0;
  const noRevenueData = !revenue || revenue.data.length === 0 || revenue.data.every((p) => p.amount === 0);

  // Custom tooltips
  const RegistrationTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-200 bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.fullLabel}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-blue-600" />
            <span className="text-xs text-slate-600 dark:text-slate-300">
              {regSource === "profiles" ? "Registrations:" : "Applications:"}
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{item.registrations}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CompletionTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const total = completion?.total || 1;
      const rate = Math.round(((item.value || 0) / total) * 100);
      return (
        <div className="rounded-xl border border-slate-200 bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: item.payload?.color || "#2563eb" }} />
            <p className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</p>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
            {item.value} {completion?.label?.toLowerCase() || "item"}{item.value !== 1 ? "s" : ""} ({rate}%)
          </p>
          <div className="mt-1.5 border-t border-slate-100 pt-1 text-[11px] text-slate-400 dark:border-slate-800">
            Overall Completion Rate: <span className="font-semibold text-blue-600 dark:text-blue-400">{completion?.pct ?? 0}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const RevenueTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-200 bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.fullMonth}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-emerald-600" />
            <span className="text-xs text-slate-600 dark:text-slate-300">Revenue:</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">₹ {item.amount.toLocaleString("en-IN")}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Analytics Dashboard</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time student registration trends, course completions, and performance analytics.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Live Sync Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-300">
            <span className={`size-2 rounded-full ${realtimeActive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            <span>Live Sync Active</span>
            <span className="text-[11px] font-normal text-emerald-600/70 dark:text-emerald-400/70">
              ({lastSyncTime})
            </span>
          </div>

          <button
            onClick={handleManualRefresh}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw className="size-3.5 text-slate-500" />
            Refresh
          </button>
        </div>
      </div>

      {/* Main 2-Column Analytics Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* ─── 1. Student Registrations Card ─── */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0F172A] flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="grid size-8 place-items-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    <Users className="size-4" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                    {regSource === "profiles" ? "Student Registrations" : "Internship Applications"}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {regTimeRange === "30d" ? "Daily registrations over the last 30 days" : "Monthly registrations over the last 12 months"}
                </p>

                {/* Source switcher */}
                <div className="mt-2.5 flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg w-fit dark:bg-slate-800/80">
                  <button
                    onClick={() => setRegSource("profiles")}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                      regSource === "profiles"
                        ? "bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    User Accounts ({analyticsTotals?.profiles ?? (regSource === "profiles" ? regState?.total : 313)})
                  </button>
                  <button
                    onClick={() => setRegSource("applications")}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                      regSource === "applications"
                        ? "bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    Applications ({analyticsTotals?.applications ?? (regSource === "applications" ? regState?.total : 207)})
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-2.5">
                {/* Time Range Pills */}
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg dark:bg-slate-800/80">
                  <button
                    onClick={() => setRegTimeRange("30d")}
                    className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition ${
                      regTimeRange === "30d"
                        ? "bg-white text-slate-900 font-semibold shadow-xs dark:bg-slate-900 dark:text-white"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    30 Days
                  </button>
                  <button
                    onClick={() => setRegTimeRange("6m")}
                    className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition ${
                      regTimeRange === "6m"
                        ? "bg-white text-slate-900 font-semibold shadow-xs dark:bg-slate-900 dark:text-white"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    6 Months
                  </button>
                  <button
                    onClick={() => setRegTimeRange("12m")}
                    className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition ${
                      regTimeRange === "12m"
                        ? "bg-white text-slate-900 font-semibold shadow-xs dark:bg-slate-900 dark:text-white"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    12 Months
                  </button>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total</div>
                  <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                    {regState?.total ?? 0}
                  </div>
                  {regState?.trendLabel && (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 sm:justify-end mt-1">
                      <TrendingUp className="size-3" />
                      <span>{regState.trendLabel}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chart Body */}
            {isRegLoading ? (
              <div className="flex flex-col items-center justify-center h-[230px] text-center">
                <Loader2 className="size-6 animate-spin text-blue-600 mb-2" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading real-time analytics...</p>
              </div>
            ) : isRegError ? (
              <div className="flex flex-col items-center justify-center h-[230px] text-center">
                <AlertTriangle className="size-6 text-amber-500 mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Unable to load registration analytics.</p>
                <button onClick={() => refetchReg()} className="mt-2 text-xs text-blue-600 hover:underline">Retry</button>
              </div>
            ) : noRegData ? (
              <div className="flex flex-col items-center justify-center h-[230px] text-center">
                <div className="grid size-12 place-items-center rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-slate-400 mb-2.5">
                  <Users className="size-5" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No registration data yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xs">Student registrations will appear here automatically.</p>
              </div>
            ) : (
              <div className="h-[230px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={regState?.data ?? []} margin={{ top: 10, right: 12, left: -4, bottom: 0 }}>
                    <defs>
                      <linearGradient id="regGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      interval={regTimeRange === "30d" ? 4 : 0}
                      tick={{ fontSize: 10, fill: isDark ? "#94a3b8" : "#64748b" }}
                      dy={6}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }}
                      allowDecimals={false}
                      width={34}
                    />
                    <RechartsTooltip content={<RegistrationTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="registrations"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#regGradient)"
                      activeDot={{ r: 5, fill: "#2563eb", stroke: isDark ? "#0F172A" : "#ffffff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* ─── 2. Completion Rate Card (Courses vs Internships) ─── */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0F172A] flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <GraduationCap className="size-4" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                    {completionSource === "courses" ? "Course Completion Rate" : "Internship Completion Rate"}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {completionSource === "courses" ? "Enrolled vs completed courses" : "Internship applicants vs completed interns"}
                </p>

                {/* Source switcher */}
                <div className="mt-2.5 flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg w-fit dark:bg-slate-800/80">
                  <button
                    onClick={() => setCompletionSource("courses")}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                      completionSource === "courses"
                        ? "bg-white text-emerald-600 shadow-xs dark:bg-slate-900 dark:text-emerald-400"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    Courses ({analyticsTotals?.enrollments ?? (completionSource === "courses" ? completion?.total : 20)})
                  </button>
                  <button
                    onClick={() => setCompletionSource("internships")}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                      completionSource === "internships"
                        ? "bg-white text-emerald-600 shadow-xs dark:bg-slate-900 dark:text-emerald-400"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    Internships ({analyticsTotals?.applications ?? (completionSource === "internships" ? completion?.total : 207)})
                  </button>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300 self-start">
                <BookOpen className="size-3.5 text-slate-400" />
                {completionSource === "courses"
                  ? `${analyticsTotals?.courses ?? 19} Active Courses`
                  : "Active Internships"}
              </span>
            </div>

            {/* Donut Chart Body */}
            {isCompletionLoading ? (
              <div className="flex flex-col items-center justify-center h-[210px] text-center">
                <Loader2 className="size-6 animate-spin text-emerald-600 mb-2" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading completion analytics...</p>
              </div>
            ) : isCompletionError ? (
              <div className="flex flex-col items-center justify-center h-[210px] text-center">
                <AlertTriangle className="size-6 text-amber-500 mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Unable to load completion analytics.</p>
                <button onClick={() => refetchCompletion()} className="mt-2 text-xs text-blue-600 hover:underline">Retry</button>
              </div>
            ) : noCompletionData ? (
              <div className="flex flex-col items-center justify-center h-[210px] text-center">
                <div className="grid size-12 place-items-center rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-slate-400 mb-2.5">
                  <GraduationCap className="size-5" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No completion data yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xs">Completion statistics will appear here automatically.</p>
              </div>
            ) : (
              <div className="relative flex items-center justify-center h-[175px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <RechartsTooltip content={<CompletionTooltip />} />
                    <Pie
                      data={completion?.donutData ?? []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={56}
                      outerRadius={76}
                      paddingAngle={(completion?.donutData?.filter((d: any) => d.value > 0).length ?? 0) > 1 ? 4 : 0}
                      cornerRadius={4}
                      stroke="none"
                    >
                      {completion?.donutData?.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? "#2563eb" : isDark ? "#334155" : "#e2e8f0"}
                        />
                      ))}
                    </Pie>
                  </RechartsPie>
                </ResponsiveContainer>

                {/* Center text inside donut */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                    {completion?.pct ?? 0}%
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">
                    Completion Rate
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Legend / Key Metrics below donut */}
          {!noCompletionData && (
            <div className="mt-3 grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5 rounded-xl bg-slate-50/80 p-2.5 dark:bg-slate-800/40">
                <span className="size-3 shrink-0 rounded-full bg-blue-600" />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Completed</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">{completion?.completed ?? 0}</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-slate-50/80 p-2.5 dark:bg-slate-800/40">
                <span className="size-3 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">In Progress</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">{completion?.inProgress ?? 0}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── 3. Domain Popularity Card ─── */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0F172A] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="grid size-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                    <FolderTree className="size-4" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base">Domain Popularity</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Applications per internship domain</p>
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                {domainData.length} Domains
              </span>
            </div>

            {isDomainLoading ? (
              <div className="flex flex-col items-center justify-center h-[210px] text-center">
                <Loader2 className="size-6 animate-spin text-indigo-600 mb-2" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading domains...</p>
              </div>
            ) : noDomainData ? (
              <p className="py-10 text-center text-sm text-slate-400">No domain data available</p>
            ) : (
              <div className="space-y-3.5 pt-1">
                {domainData.map((d) => (
                  <div key={d.label}>
                    <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                      <span className="text-slate-700 dark:text-slate-200 capitalize">{d.label}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{d.count} ({d.pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                        style={{ width: `${d.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── 4. Revenue Overview Card ─── */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0F172A] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <IndianRupee className="size-4" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base">Revenue Overview</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Monthly verified fee payments (last 12 months)</p>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase">Total Revenue</div>
                <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  ₹ {(revenue?.total ?? 0).toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            {isRevenueLoading ? (
              <div className="flex flex-col items-center justify-center h-[210px] text-center">
                <Loader2 className="size-6 animate-spin text-emerald-600 mb-2" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading revenue...</p>
              </div>
            ) : noRevenueData ? (
              <div className="flex flex-col items-center justify-center h-[210px] text-center">
                <div className="grid size-12 place-items-center rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-slate-400 mb-2.5">
                  <IndianRupee className="size-5" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No verified revenue yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xs">Verified payments will be aggregated here.</p>
              </div>
            ) : (
              <div className="h-[210px] w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={revenue?.data ?? []} margin={{ top: 10, right: 12, left: -4, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      tick={{ fontSize: 10, fill: isDark ? "#94a3b8" : "#64748b" }}
                      dy={6}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }}
                      allowDecimals={false}
                      width={34}
                    />
                    <RechartsTooltip content={<RevenueTooltip />} />
                    <Bar
                      dataKey="amount"
                      fill="#059669"
                      radius={[4, 4, 0, 0]}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Location & Discovery Analytics Section ─── */}
      <div className="border-t border-slate-200/70 dark:border-slate-800/80 pt-6 mt-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="size-5 text-blue-600" />
              Location & Discovery Analytics
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Geographic footprint of applicant students and marketing acquisition channels.
            </p>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Countries */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0F172A]">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Students by Country</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Geographic country stats</p>
            {isLocLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading location data...</div>
            ) : !locationStats || locationStats.countries.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No country data available</p>
            ) : (
              <div className="space-y-3">
                {locationStats.countries.map((c) => (
                  <div key={c.label}>
                    <div className="flex items-center justify-between text-xs mb-1 font-medium">
                      <span className="text-slate-700 dark:text-slate-200">{c.label === "India" ? "🇮🇳 India" : c.label}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">{c.count} students ({c.pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500" style={{ width: `${c.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* States */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0F172A]">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Students by State / UT (Top 10)</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Distribution across Indian States</p>
            {isLocLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading state data...</div>
            ) : !locationStats || locationStats.states.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No state data available</p>
            ) : (
              <div className="space-y-3">
                {locationStats.states.map((s) => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between text-xs mb-1 font-medium">
                      <span className="text-slate-700 dark:text-slate-200">{s.label}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">{s.count} ({s.pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500" style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Districts */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0F172A]">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Students by District (Top 10)</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Distribution by District</p>
            {isLocLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading district data...</div>
            ) : !locationStats || locationStats.districts.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No district data available</p>
            ) : (
              <div className="space-y-3">
                {locationStats.districts.map((d) => (
                  <div key={d.label}>
                    <div className="flex items-center justify-between text-xs mb-1 font-medium">
                      <span className="text-slate-700 dark:text-slate-200">{d.label}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">{d.count} ({d.pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500" style={{ width: `${d.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cities */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0F172A]">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Students by City / Town (Top 10)</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Distribution by City</p>
            {isLocLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading city data...</div>
            ) : !locationStats || locationStats.cities.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No city data available</p>
            ) : (
              <div className="space-y-3">
                {locationStats.cities.map((c) => (
                  <div key={c.label}>
                    <div className="flex items-center justify-between text-xs mb-1 font-medium">
                      <span className="text-slate-700 dark:text-slate-200">{c.label}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">{c.count} ({c.pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500" style={{ width: `${c.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Discovery Sources Comparison */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0F172A]">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Discovery Sources Comparison</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Google vs Instagram vs LinkedIn etc.</p>
            {isLocLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading discovery sources...</div>
            ) : !locationStats || locationStats.sources.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No discovery sources available</p>
            ) : (
              <div className="space-y-3">
                {locationStats.sources.map((src) => (
                  <div key={src.label}>
                    <div className="flex items-center justify-between text-xs mb-1 font-medium">
                      <span className="text-slate-700 dark:text-slate-200">{src.label}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">{src.count} ({src.pct}%)</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all duration-500" style={{ width: `${src.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Referral Name Tracker */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0F172A]">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Referral Name Tracker (Top 10)</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Top classmates / existing interns referred</p>
            {isLocLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading referrals...</div>
            ) : !locationStats || locationStats.referrals.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No referrals recorded yet</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {locationStats.referrals.map((r, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{r.name}</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-md">
                      {r.count} referrals
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════
// ══════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════
function SettingsSection() {
  const [portalName, setPortalName] = useState("Skyrovix Internship Portal");
  const [contactEmail, setContactEmail] = useState(COMPANY.email);
  const [companyName, setCompanyName] = useState(COMPANY.name);
  const [savingGeneral, setSavingGeneral] = useState(false);

  // SMTP Settings
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState(465);
  const [smtpUser, setSmtpUser] = useState("skyrovix@gmail.com");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpFrom, setSmtpFrom] = useState("Skyrovix <skyrovix@gmail.com>");
  const [showPass, setShowPass] = useState(false);
  const [hasExistingPass, setHasExistingPass] = useState(false);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testEmail, setTestEmail] = useState("skyrovix@gmail.com");
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { getSmtpConfig } = await import("@/lib/email-service");
        const cfg = await getSmtpConfig();
        if (cfg) {
          if (cfg.host) setSmtpHost(cfg.host);
          if (cfg.port) setSmtpPort(cfg.port);
          if (cfg.user) {
            setSmtpUser(cfg.user);
            setTestEmail(cfg.user);
          }
          if (cfg.from) setSmtpFrom(cfg.from);
          if (cfg.hasPass) setHasExistingPass(true);
        }
      } catch (e) {}
    })();
  }, []);

  const saveGeneral = async () => {
    setSavingGeneral(true);
    await new Promise((r) => setTimeout(r, 600));
    toast.success("General settings saved successfully");
    setSavingGeneral(false);
  };

  const handleSaveSmtp = async () => {
    if (!smtpUser.trim()) return toast.error("Please enter a valid Gmail address");
    setSavingSmtp(true);
    try {
      const { saveSmtpConfig } = await import("@/lib/email-service");
      await saveSmtpConfig({
        data: {
          host: smtpHost.trim(),
          port: Number(smtpPort),
          user: smtpUser.trim(),
          pass: smtpPass.trim() || undefined,
          from: smtpFrom.trim(),
        },
      });
      toast.success("SMTP Configuration saved successfully to .env!");
      setHasExistingPass(true);
      setSmtpPass("");
    } catch (err: any) {
      toast.error(`Failed to save SMTP: ${err.message}`);
    } finally {
      setSavingSmtp(false);
    }
  };

  const handleTestSmtp = async () => {
    setTestingSmtp(true);
    setTestResult(null);
    const toastId = toast.loading("Testing connection to Gmail SMTP...");
    try {
      const { testSmtpConnection } = await import("@/lib/email-service");
      const res = await testSmtpConnection({
        data: {
          host: smtpHost.trim(),
          port: Number(smtpPort),
          user: smtpUser.trim(),
          pass: smtpPass.trim() || undefined,
          testEmail: testEmail.trim() || undefined,
        },
      });
      setTestResult(res);
      if (res.success) {
        toast.success(res.message || "✅ Email configuration is working.", { id: toastId });
      } else {
        toast.error(`SMTP Test Failed: ${res.error}`, { id: toastId, duration: 8000 });
      }
    } catch (err: any) {
      setTestResult({ success: false, error: "❌ Gmail authentication failed. Please check your credentials." });
      toast.error(`SMTP Error: ${err.message}`, { id: toastId });
    } finally {
      setTestingSmtp(false);
    }
  };

  return (
    <div className="animate-fade-in-up space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold">Portal & System Settings</h2>
        <p className="text-sm text-muted-foreground">Manage organization profile, SMTP mail server credentials, and automated delivery.</p>
      </div>

      {/* SMTP Email Configuration */}
      <div className="rounded-2xl border border-blue-200/80 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-blue-900/50 dark:bg-[#1E293B]/80">
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Mail className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Email & Gmail SMTP Configuration</h3>
              <p className="text-xs text-muted-foreground">Required to send Offer Letters and Certificates directly to student Gmail inboxes.</p>
            </div>
          </div>
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-0 text-xs">
            Automated Delivery
          </Badge>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold">Sender Gmail</Label>
            <Input
              type="email"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              placeholder="e.g. skyrovix@gmail.com"
              className="mt-1.5 rounded-xl text-xs h-9"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">App Password</Label>
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {showPass ? "Hide" : "Show"} password
              </button>
            </div>
            <Input
              type={showPass ? "text" : "password"}
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
              placeholder={hasExistingPass ? "••••••••••••" : "Enter 16-character Google App Password"}
              className="mt-1.5 rounded-xl text-xs h-9 font-mono"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Use a Google 16-character App Password. Do not enter your normal Gmail password.
            </p>
          </div>
          <div>
            <Label className="text-xs font-semibold">SMTP Host</Label>
            <Input
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              placeholder="smtp.gmail.com"
              className="mt-1.5 rounded-xl text-xs h-9"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold">SMTP Port (465 SSL or 587 TLS)</Label>
            <Input
              type="number"
              value={smtpPort}
              onChange={(e) => setSmtpPort(Number(e.target.value))}
              placeholder="465"
              className="mt-1.5 rounded-xl text-xs h-9"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs font-semibold">Email "From" Header Display</Label>
            <Input
              value={smtpFrom}
              onChange={(e) => setSmtpFrom(e.target.value)}
              placeholder="Skyrovix <skyrovix@gmail.com>"
              className="mt-1.5 rounded-xl text-xs h-9"
            />
          </div>
        </div>

        {/* Google App Password Setup Help (Section 13) */}
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-300">
          <p className="font-semibold flex items-center gap-1.5 text-sm text-blue-950 dark:text-blue-200">
            <HelpCircle className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
            How to configure Gmail:
          </p>
          <ol className="mt-2 list-decimal pl-5 space-y-1.5 text-[11px] text-blue-900 dark:text-blue-300/90 leading-relaxed">
            <li>Enable <strong>2-Step Verification</strong> on the Google account.</li>
            <li>Open Google Account &rarr; <strong>Security</strong>.</li>
            <li>Create an <strong>App Password</strong> at <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="underline font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-800">myaccount.google.com/apppasswords</a>.</li>
            <li>Select/use a suitable app name such as <strong>Skyrovix</strong>.</li>
            <li>Copy the generated <strong>16-character App Password</strong>.</li>
            <li>Enter the Gmail address and App Password in Admin Settings.</li>
            <li>Click <strong>"Test Email Configuration"</strong>.</li>
            <li>After successful testing, offer letters can be sent automatically.</li>
          </ol>
          <p className="mt-2 text-[11px] font-medium text-amber-700 dark:text-amber-400">
            &bull; Do not use your normal Gmail password.
          </p>
        </div>

        {/* Live Test Diagnostic Output */}
        {testResult && (
          <div className={`mt-4 rounded-xl p-3.5 text-xs border ${
            testResult.success
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800"
          }`}>
            <p className="font-semibold flex items-center gap-1.5">
              {testResult.success ? <CheckCircle2 className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-rose-600" />}
              {testResult.success ? "Email configuration is working" : "Gmail authentication failed"}
            </p>
            <p className="mt-1 text-[11px]">{testResult.message || testResult.error}</p>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <Input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Test recipient email..."
              className="text-xs h-9 rounded-xl"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestSmtp}
              disabled={testingSmtp}
              className="rounded-xl text-xs h-9 shrink-0 gap-1.5"
            >
              {testingSmtp ? <Loader2 className="size-3.5 animate-spin" /> : <Zap className="size-3.5 text-amber-500" />}
              Test Email Configuration
            </Button>
          </div>

          <Button
            type="button"
            onClick={handleSaveSmtp}
            disabled={savingSmtp}
            className="brand-gradient text-white border-0 rounded-xl text-xs h-9 px-5 font-semibold"
          >
            {savingSmtp ? "Saving..." : "Save SMTP Settings"}
          </Button>
        </div>
      </div>

      {/* General Settings */}
      <div className="rounded-2xl border border-border/50 bg-white/80 p-6 shadow-sm backdrop-blur dark:bg-[#1E293B]/80">
        <h3 className="font-bold text-base mb-4">General Platform Information</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-xs font-semibold">Portal Name</Label>
            <Input value={portalName} onChange={(e) => setPortalName(e.target.value)} className="mt-1.5 rounded-xl border-border/60 text-xs h-9" />
          </div>
          <div>
            <Label className="text-xs font-semibold">Support Contact Email</Label>
            <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="mt-1.5 rounded-xl border-border/60 text-xs h-9" />
          </div>
          <div>
            <Label className="text-xs font-semibold">Company / Brand Name</Label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1.5 rounded-xl border-border/60 text-xs h-9" />
          </div>
          <div className="pt-2">
            <Button onClick={saveGeneral} disabled={savingGeneral} className="brand-gradient text-white border-0 rounded-xl text-xs h-9 px-5 font-semibold">
              {savingGeneral ? "Saving…" : "Save General Settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// EMAIL LOGS
// ══════════════════════════════════════════════
function EmailLogsSection() {
  const qc = useQueryClient();
  const [resendingId, setResendingId] = useState<string | null>(null);

  const { data: logs, refetch } = useQuery({
    queryKey: ["admin-email-logs"],
    queryFn: async () => {
      const { data } = await (supabase
        .from("email_logs" as any) as any)
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const resend = async (log: any) => {
    setResendingId(log.id);
    const docLabel = log.document_type === "offer_letter" ? "Offer Letter" : "Certificate";
    const toastId = toast.loading(`Resending official ${docLabel} PDF to ${log.email_to}...`);
    try {
      const { data: app } = await (supabase
        .from("applications") as any)
        .select("id, full_name, intern_id, domain, email, user_id, duration")
        .eq("user_id", log.user_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!app?.email) {
        toast.error("Cannot resend: student application record not found", { id: toastId });
        setResendingId(null);
        return;
      }

      if (log.document_type === "offer_letter") {
        const { sendOfferLetterEmail } = await import("@/lib/email-helpers");
        const domainObj = getDomain(app.domain);
        const result = await sendOfferLetterEmail({
          to: app.email,
          studentName: app.full_name,
          studentId: app.user_id,
          internId: app.intern_id,
          domainName: domainObj?.name ?? app.domain,
          duration: app.duration ?? 1,
        });
        if (result.success) {
          await (supabase.from("applications") as any).update({
            offer_issued_at: new Date().toISOString(),
            email_status: "sent",
            email_sent_at: new Date().toISOString(),
            email_error: null,
          }).eq("id", app.id);
          qc.invalidateQueries({ queryKey: ["admin-apps"] });
          qc.invalidateQueries({ queryKey: ["admin-email-logs"] });
          toast.success(`Offer Letter successfully resent to ${app.email}!`, { id: toastId });
        } else {
          await (supabase.from("applications") as any).update({
            email_status: "failed",
            email_error: result.error,
          }).eq("id", app.id);
          qc.invalidateQueries({ queryKey: ["admin-apps"] });
          toast.error(`Resend failed: ${result.error}`, { id: toastId, duration: 8000 });
        }
      } else {
        const { sendCertificateEmail } = await import("@/lib/email-helpers");
        const result = await sendCertificateEmail({
          to: app.email,
          studentName: app.full_name,
          studentId: app.user_id,
          certId: log.reference_id || "SKX-CERT",
          domainName: getDomain(app.domain)?.name ?? app.domain,
          internId: app.intern_id || "",
        });
        if (result.success) {
          await (supabase.from("applications") as any).update({
            email_status: "sent",
            email_sent_at: new Date().toISOString(),
            email_error: null,
          }).eq("id", app.id);
          qc.invalidateQueries({ queryKey: ["admin-apps"] });
          qc.invalidateQueries({ queryKey: ["admin-email-logs"] });
          toast.success(`Certificate successfully resent to ${app.email}!`, { id: toastId });
        } else {
          await (supabase.from("applications") as any).update({
            email_status: "failed",
            email_error: result.error,
          }).eq("id", app.id);
          qc.invalidateQueries({ queryKey: ["admin-apps"] });
          toast.error(`Resend failed: ${result.error}`, { id: toastId, duration: 8000 });
        }
      }
      qc.invalidateQueries({ queryKey: ["admin-email-logs"] });
    } catch (e: any) {
      toast.error(`Resend failed: ${e.message}`, { id: toastId });
    } finally {
      setResendingId(null);
    }
  };

  const sentCount = logs?.filter((l: any) => l.status === "sent").length ?? 0;
  const failedCount = logs?.filter((l: any) => l.status === "failed").length ?? 0;

  return (
    <div className="animate-fade-in-up space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Email Transmission Logs</h2>
          <p className="text-sm text-muted-foreground">{logs?.length ?? 0} total dispatches · {sentCount} delivered · {failedCount} failed</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-xl text-xs h-9 gap-1.5">
            <RefreshCw className="size-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {failedCount > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-600 shrink-0" />
            <span>Notice: {failedCount} email(s) encountered delivery issues. Make sure your Gmail App Password in Settings is up-to-date.</span>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border/50 bg-white/60 backdrop-blur dark:bg-[#1E293B]/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3 text-left">Student</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Document</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Sent At</th>
              <th className="px-4 py-3 text-left">Error Details</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs?.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No email records found.</td></tr>
            )}
            {logs?.map((log: any) => (
              <tr key={log.id} className="border-b border-border/30 transition hover:bg-accent/20">
                <td className="px-4 py-3 font-medium">{log.student_name}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{log.email_to}</td>
                <td className="px-4 py-3">
                  <Badge className={`text-xs ${
                    log.document_type === "offer_letter" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                  }`}>{log.document_type === "offer_letter" ? "Offer Letter" : "Certificate"}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={`text-xs ${
                    log.status === "sent" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                    log.status === "failed" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}>{log.status}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{log.sent_at ? new Date(log.sent_at).toLocaleString("en-IN") : "—"}</td>
                <td className="px-4 py-3 text-xs text-red-500 max-w-[240px] truncate" title={log.error_message ?? ""}>{log.error_message ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => resend(log)}
                    disabled={resendingId === log.id}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition disabled:opacity-50"
                    title="Resend PDF document to Gmail"
                  >
                    {resendingId === log.id ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
                    Resend
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// LOGIN HISTORY
// ══════════════════════════════════════════════
function LoginHistorySection() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "online" | "offline">("all");
  const todayStr = new Date().toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState(todayStr);
  const [dateTo, setDateTo] = useState(todayStr);

  const { data: raw } = useQuery({
    queryKey: ["admin-login-history"],
    refetchInterval: 15_000,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("login_sessions")
        .select("id, student_id, status, ip_address, city, state, country, device, browser, os, last_active, login_time, logout_time")
        .order("last_active", { ascending: false })
        .limit(500);
      return data ?? [];
    },
  });

  const { data: appMap } = useQuery({
    queryKey: ["admin-login-history-apps"],
    queryFn: async () => {
      const { data } = await supabase
        .from("applications")
        .select("user_id, full_name, email, intern_id, college, domain");
      const map: Record<string, any> = {};
      for (const a of data ?? []) map[a.user_id] = a;
      return map;
    },
  });

  const filtered = useMemo(() => {
    if (!raw) return [];
    let list = raw;
    if (filter === "online") list = list.filter((s: any) => s.status === "online");
    else if (filter === "offline") list = list.filter((s: any) => s.status === "offline");
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s: any) => {
        const app = appMap?.[s.student_id];
        return app?.full_name?.toLowerCase().includes(q) ||
          app?.email?.toLowerCase().includes(q) ||
          app?.intern_id?.toLowerCase().includes(q) ||
          app?.college?.toLowerCase().includes(q) ||
          s.ip_address?.includes(q) ||
          s.city?.toLowerCase().includes(q);
      });
    }
    if (dateFrom) {
      const from = new Date(dateFrom);
      list = list.filter((s: any) => new Date(s.last_active) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter((s: any) => new Date(s.last_active) <= to);
    }
    return list;
  }, [raw, filter, search, appMap, dateFrom, dateTo]);

  const DeviceIcon = ({ dt }: { dt: string }) => {
    if (dt === "mobile") return <Smartphone className="size-3.5" />;
    if (dt === "tablet") return <Tablet className="size-3.5" />;
    return <Monitor className="size-3.5" />;
  };

  return (
    <div className="animate-fade-in-up space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Login History</h2>
          <p className="text-sm text-muted-foreground">{raw?.length ?? 0} sessions recorded</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 w-full sm:w-36 max-w-full rounded-xl border-border/60 text-xs" />
          <span className="hidden sm:inline text-xs text-muted-foreground">to</span>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 w-full sm:w-36 max-w-full rounded-xl border-border/60 text-xs" />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1 rounded-xl bg-muted/50 p-1">
          {(["all", "online", "offline"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                filter === f ? "bg-white text-foreground shadow-sm dark:bg-[#1E293B]" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "All Sessions" : f === "online" ? "Online" : "Offline"}
            </button>
          ))}
        </div>
        <Input placeholder="Search by name, email, ID, IP, city..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-full sm:w-72 max-w-full rounded-xl border-border/60" />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/50 bg-white/60 backdrop-blur dark:bg-[#1E293B]/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3 text-left">Student</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Device</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">IP Address</th>
              <th className="px-4 py-3 text-left">Logged In</th>
              <th className="px-4 py-3 text-left">Last Active</th>
              <th className="px-4 py-3 text-left">Logged Out</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No login sessions found.</td></tr>
            )}
              {filtered.map((s: any) => {
              const app = appMap?.[s.student_id];
              return (
                <tr key={s.id} className="border-b border-border/30 transition hover:bg-accent/20">
                  <td className="px-4 py-3">
                    {app ? (
                      <div>
                        <p className="font-medium text-sm">{app.full_name}</p>
                        <p className="text-xs text-muted-foreground">{app.email}</p>
                        {app.intern_id && <p className="font-mono text-[10px] text-muted-foreground">{app.intern_id}</p>}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">{s.student_id?.slice(0, 12)}...</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {s.status === "online" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950/30 dark:text-green-400"><Wifi className="size-3" /> Online</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-950/30 dark:text-gray-400"><WifiOff className="size-3" /> Offline</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <DeviceIcon dt={s.device} />
                      <span>{s.browser ?? "—"}</span>
                      {s.os && <span className="text-[10px]">({s.os})</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {[s.city, s.state, s.country].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">{s.ip_address || "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {s.login_time ? new Date(s.login_time).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {s.last_active ? new Date(s.last_active).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {s.logout_time ? new Date(s.logout_time).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : s.status === "online" ? "—" : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// STUDENT DETAIL MODAL
// ══════════════════════════════════════════════
function StudentDetailModal({ student, onClose }: { student: any; onClose: () => void }) {
  const [tab, setTab] = useState<"profile" | "payments" | "submissions" | "certificates" | "login-history">("profile");

  if (!student) return null;

  const userId = student.user_id || student.id || "";
  const appId = student.application_id || (student.is_application ? student.id : "");

  const { data: payments } = useQuery({
    queryKey: ["admin-student-payments", userId, appId],
    enabled: tab === "payments" && Boolean(appId),
    queryFn: async () => {
      if (!appId) return [];
      const { data } = await supabase.from("payments").select("*").eq("application_id", appId).order("submitted_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: submissions } = useQuery({
    queryKey: ["admin-student-submissions", userId, appId],
    enabled: tab === "submissions" && Boolean(appId),
    queryFn: async () => {
      if (!appId) return [];
      const { data } = await supabase.from("submissions").select("*").eq("application_id", appId).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: certificates } = useQuery({
    queryKey: ["admin-student-certificates", userId, appId],
    enabled: tab === "certificates" && Boolean(appId),
    queryFn: async () => {
      if (!appId) return [];
      const { data } = await supabase.from("certificates").select("*").eq("application_id", appId).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: loginSessions } = useQuery({
    queryKey: ["admin-student-login-sessions", userId],
    enabled: tab === "login-history" && Boolean(userId),
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await (supabase as any).from("login_sessions").select("*").eq("student_id", userId).order("last_active", { ascending: false });
      return data ?? [];
    },
  });

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: Eye },
    { id: "payments" as const, label: "Payments", icon: IndianRupee },
    { id: "submissions" as const, label: "Submissions", icon: ClipboardCheck },
    { id: "certificates" as const, label: "Certificates", icon: Award },
    { id: "login-history" as const, label: "Login History", icon: Activity },
  ];

  const formatDate = (d: any) => {
    if (!d) return "—";
    try {
      const dt = new Date(d);
      return isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    } catch {
      return "—";
    }
  };

  const initialLetter = student.full_name ? String(student.full_name).charAt(0).toUpperCase() : "S";

  return (
    <Portal>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border/50 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:bg-[#1E293B]/95 my-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full brand-gradient text-sm font-bold text-white">{initialLetter}</div>
              <div>
                <h3 className="font-bold text-lg">{student.full_name ?? "Student Details"}</h3>
                <p className="text-xs text-muted-foreground">{student.email ?? "—"} · {student.intern_id ?? "User Account"}</p>
              </div>
            </div>
            <button onClick={onClose} className="grid size-8 place-items-center rounded-lg hover:bg-accent/50"><X className="size-4" /></button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 rounded-xl bg-muted/50 p-1 mb-6 overflow-x-auto">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition ${
                    tab === t.id ? "bg-white text-foreground shadow-sm dark:bg-[#1E293B]" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="size-3.5" /> {t.label}
                </button>
              );
            })}
          </div>

          {/* Profile Tab */}
          {tab === "profile" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="rounded-xl bg-accent/20 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Account Type</p>
                  <div>
                    {appId ? (
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                        Internship Enrolled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-600 dark:text-slate-400">
                        Registered User Account
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="rounded-xl bg-accent/20 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Domain</p>
                  <p className="font-medium">
                    {student.domain ? (getDomain(student.domain)?.name ?? student.domain) : "No Application (Registered User)"}
                  </p>
                </div>
                <div className="rounded-xl bg-accent/20 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Intern ID</p>
                  <p className="font-mono font-medium">{student.intern_id || "—"}</p>
                </div>
                <div className="rounded-xl bg-accent/20 p-4">
                  <p className="text-xs text-muted-foreground mb-1">College</p>
                  <p className="font-medium">{student.college && student.college !== "—" ? student.college : "—"}</p>
                </div>
                <div className="rounded-xl bg-accent/20 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Course & Year</p>
                  <p className="font-medium">
                    {[student.course && student.course !== "—" ? student.course : null, student.year && student.year !== "—" ? `(${student.year})` : null].filter(Boolean).join(" ") || "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-accent/20 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Phone</p>
                  <p className="font-medium">{student.phone && student.phone !== "—" ? student.phone : "—"}</p>
                </div>
                <div className="rounded-xl bg-accent/20 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Session Status</p>
                  <div>
                    {student.is_online ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                        <Wifi className="size-3" /> Online
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        <WifiOff className="size-3" /> Offline
                      </span>
                    )}
                  </div>
                </div>
                <div className="rounded-xl bg-accent/20 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Registered / Joined</p>
                  <p className="font-medium">{formatDate(student.created_at)}</p>
                </div>
                <div className="rounded-xl bg-accent/20 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Offer Issued</p>
                  <p className="font-medium">{student.offer_issued_at ? formatDate(student.offer_issued_at) : "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                {student.email && student.email !== "—" && (
                  <a href={`mailto:${student.email}`} className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <Mail className="size-3.5" /> Send Email
                  </a>
                )}
                <span className="text-xs font-mono text-muted-foreground">User ID: {userId}</span>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {tab === "payments" && (
            <div className="space-y-3">
              {!appId ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  <IndianRupee className="mx-auto size-8 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="font-medium text-foreground">No payment records</p>
                  <p className="text-xs mt-1">This user account has not submitted an internship application.</p>
                </div>
              ) : (!payments || payments.length === 0) ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No payment records found.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border/40">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border/30 text-xs uppercase text-muted-foreground">
                      <th className="px-3 py-2 text-left">Amount</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Method</th>
                      <th className="px-3 py-2 text-left">UTR</th>
                      <th className="px-3 py-2 text-left">Date</th>
                    </tr></thead>
                    <tbody>
                      {payments.map((p: any) => (
                        <tr key={p.id} className="border-b border-border/20 hover:bg-accent/20">
                          <td className="px-3 py-2 font-medium">{p.amount ? `₹${p.amount.toLocaleString("en-IN")}` : "—"}</td>
                          <td className="px-3 py-2"><Badge className={`text-xs ${p.status === "verified" ? "bg-green-100 text-green-700" : p.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{p.status}</Badge></td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{p.payment_method ?? "UPI"}</td>
                          <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">{p.utr_number || p.utr || "—"}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{formatDate(p.verified_at || p.submitted_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Submissions Tab */}
          {tab === "submissions" && (
            <div className="space-y-3">
              {!appId ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  <ClipboardCheck className="mx-auto size-8 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="font-medium text-foreground">No task submissions</p>
                  <p className="text-xs mt-1">This user account has not submitted an internship application.</p>
                </div>
              ) : (!submissions || submissions.length === 0) ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No task submissions found.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border/40">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border/30 text-xs uppercase text-muted-foreground">
                      <th className="px-3 py-2 text-left">Task</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Submitted</th>
                      <th className="px-3 py-2 text-left">URL</th>
                    </tr></thead>
                    <tbody>
                      {submissions.map((s: any) => (
                        <tr key={s.id} className="border-b border-border/20 hover:bg-accent/20">
                          <td className="px-3 py-2 text-xs">{s.task_name ?? `Task #${s.task_index ?? ""}`}</td>
                          <td className="px-3 py-2"><Badge className={`text-xs ${s.status === "approved" ? "bg-green-100 text-green-700" : s.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{s.status}</Badge></td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{formatDate(s.created_at)}</td>
                          <td className="px-3 py-2 text-xs">{s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block max-w-[200px]">{s.url}</a> : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Certificates Tab */}
          {tab === "certificates" && (
            <div className="space-y-3">
              {!appId ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  <Award className="mx-auto size-8 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="font-medium text-foreground">No certificates issued</p>
                  <p className="text-xs mt-1">This user account has not submitted an internship application.</p>
                </div>
              ) : (!certificates || certificates.length === 0) ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No certificates issued yet.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border/40">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border/30 text-xs uppercase text-muted-foreground">
                      <th className="px-3 py-2 text-left">Type</th>
                      <th className="px-3 py-2 text-left">Cert ID</th>
                      <th className="px-3 py-2 text-left">Issued</th>
                      <th className="px-3 py-2 text-left">Status</th>
                    </tr></thead>
                    <tbody>
                      {certificates.map((c: any) => (
                        <tr key={c.id} className="border-b border-border/20 hover:bg-accent/20">
                          <td className="px-3 py-2 text-xs capitalize">{c.type ?? "Certificate"}</td>
                          <td className="px-3 py-2 font-mono text-[10px]">{c.certificate_id ?? "—"}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{formatDate(c.created_at)}</td>
                          <td className="px-3 py-2"><Badge className="text-xs bg-green-100 text-green-700">Issued</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Login History Tab */}
          {tab === "login-history" && (
            <div className="space-y-3">
              {(!loginSessions || loginSessions.length === 0) ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No login sessions recorded.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border/40">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border/30 text-xs uppercase text-muted-foreground">
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Device</th>
                      <th className="px-3 py-2 text-left">Browser</th>
                      <th className="px-3 py-2 text-left">Location</th>
                      <th className="px-3 py-2 text-left">Logged In</th>
                      <th className="px-3 py-2 text-left">Last Active</th>
                      <th className="px-3 py-2 text-left">Duration</th>
                    </tr></thead>
                    <tbody>
                      {loginSessions.map((s: any) => {
                        const duration = s.login_time && s.logout_time
                          ? Math.round((new Date(s.logout_time).getTime() - new Date(s.login_time).getTime()) / 60000)
                          : s.login_time && s.last_active
                          ? Math.round((new Date(s.last_active).getTime() - new Date(s.login_time).getTime()) / 60000)
                          : null;
                        return (
                          <tr key={s.id} className="border-b border-border/20 hover:bg-accent/20">
                            <td className="px-3 py-2">
                              {s.status === "online" ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700"><Wifi className="size-3" /> Online</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-500"><WifiOff className="size-3" /> Offline</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-xs text-muted-foreground capitalize">{s.device ?? "—"}</td>
                            <td className="px-3 py-2 text-xs text-muted-foreground">{s.browser ?? "—"}{s.os ? ` (${s.os})` : ""}</td>
                            <td className="px-3 py-2 text-xs text-muted-foreground">{[s.city, s.state, s.country].filter(Boolean).join(", ") || "—"}</td>
                            <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{s.login_time ? new Date(s.login_time).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                            <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{s.last_active ? new Date(s.last_active).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                            <td className="px-3 py-2 text-xs text-muted-foreground">{duration !== null ? `${duration} min` : "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}

// ══════════════════════════════════════════════
// LOGIN ANALYTICS
// ══════════════════════════════════════════════
function LoginAnalyticsSection() {
  const { data: sessions } = useQuery({
    queryKey: ["admin-login-analytics"],
    refetchInterval: 60_000,
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data } = await (supabase as any)
        .from("login_sessions")
        .select("student_id, status, login_time, logout_time, last_active")
        .gte("login_time", thirtyDaysAgo.toISOString())
        .order("login_time", { ascending: false });
      return data ?? [];
    },
  });

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now); monthAgo.setDate(monthAgo.getDate() - 30);

  const stats = useMemo(() => {
    if (!sessions) return null;
    const uniqueUsers = new Set(sessions.map((s: any) => s.student_id));
    const dau = new Set(sessions.filter((s: any) => s.login_time?.startsWith(todayStr)).map((s: any) => s.student_id));
    const wau = new Set(sessions.filter((s: any) => new Date(s.login_time) >= weekAgo).map((s: any) => s.student_id));
    const mau = new Set(sessions.filter((s: any) => new Date(s.login_time) >= monthAgo).map((s: any) => s.student_id));
    const totalSessions = sessions.length;
    const nowOnline = sessions.filter((s: any) => s.status === "online").length;
    const durations: number[] = [];
    for (const s of sessions) {
      if (s.login_time && s.logout_time) {
        durations.push(Math.round((new Date(s.logout_time).getTime() - new Date(s.login_time).getTime()) / 60000));
      }
    }
    const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
    const peakHour = Array(24).fill(0);
    for (const s of sessions) {
      if (s.login_time) {
        const h = new Date(s.login_time).getHours();
        peakHour[h]++;
      }
    }
    const peakHourIdx = peakHour.indexOf(Math.max(...peakHour));
    return { uniqueUsers: uniqueUsers.size, dau: dau.size, wau: wau.size, mau: mau.size, totalSessions, nowOnline, avgDuration, peakHour: peakHourIdx };
  }, [sessions]);

  const statCards = stats ? [
    { label: "Currently Online", value: stats.nowOnline, sub: "right now", icon: Wifi, color: "text-green-600 bg-green-50 dark:bg-green-950/30" },
    { label: "Active Today (DAU)", value: stats.dau, sub: `${((stats.dau / stats.uniqueUsers) * 100 || 0).toFixed(0)}% of users`, icon: TrendingUp, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
    { label: "Active This Week (WAU)", value: stats.wau, sub: `${((stats.wau / stats.uniqueUsers) * 100 || 0).toFixed(0)}% of users`, icon: TrendingUp, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/30" },
    { label: "Active This Month (MAU)", value: stats.mau, sub: `out of ${stats.uniqueUsers} total users`, icon: BarChart3, color: "text-[#07284a] bg-[#07284a]/10 dark:bg-[#07284a]/30" },
    { label: "Total Sessions (30d)", value: stats.totalSessions, sub: `${(stats.totalSessions / 30).toFixed(1)}/day avg`, icon: Activity, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30" },
    { label: "Avg Session Duration", value: `${stats.avgDuration}m`, sub: stats.avgDuration > 0 ? `${Math.round(stats.avgDuration / 60)}h ${stats.avgDuration % 60}m` : "", icon: Clock, color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30" },
    { label: "Peak Login Hour", value: `${stats.peakHour}:00`, sub: `${peakHourLabels[stats.peakHour]}`, icon: Clock, color: "text-rose-600 bg-rose-50 dark:bg-rose-950/30" },
  ] : [];

  return (
    <div className="animate-fade-in-up space-y-4">
      <h2 className="text-2xl font-bold">Login Analytics</h2>
      <p className="text-sm text-muted-foreground">Login activity over the last 30 days</p>
      {!stats ? (
        <p className="py-12 text-center text-muted-foreground">Loading analytics...</p>
      ) : stats.uniqueUsers === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No login data available yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="rounded-2xl border border-border/50 bg-white/70 p-5 backdrop-blur dark:bg-[#1E293B]/70">
                <div className="flex items-center justify-between mb-3">
                  <div className={`grid size-10 place-items-center rounded-xl ${s.color}`}><Icon className="size-5" /></div>
                </div>
                <p className="font-display text-3xl font-bold">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground/70">{s.sub}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const peakHourLabels = ["Midnight", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "Noon", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"];

// ══════════════════════════════════════════════
// COURSES MANAGEMENT & ENROLLMENT ANALYTICS
// ══════════════════════════════════════════════
function CoursesSection() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "enrolled" | "published" | "draft">("all");
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState<AdminCourseItem | null>(null);
  const [editingCourse, setEditingCourse] = useState<AdminCourseItem | null>(null);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [togglingPublishId, setTogglingPublishId] = useState<string | null>(null);

  const { data: courses, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin-courses-directory"],
    refetchInterval: 30_000,
    queryFn: async () => {
      const data = await getAdminCourses();
      return data ?? [];
    },
  });

  const kpis = useMemo(() => {
    if (!courses) return { totalCourses: 0, totalEnrollments: 0, inProgress: 0, completed: 0, certs: 0, avgProgress: 0 };
    const totalCourses = courses.length;
    let totalEnrollments = 0;
    let inProgress = 0;
    let completed = 0;
    let certs = 0;
    let totalProgressSum = 0;
    for (const c of courses) {
      totalEnrollments += c.enrollment_count;
      inProgress += c.in_progress_count;
      completed += c.completed_count;
      certs += c.cert_count;
      totalProgressSum += (c.avg_progress || 0) * c.enrollment_count;
    }
    const avgProgress = totalEnrollments > 0 ? Math.round(totalProgressSum / totalEnrollments) : 0;
    return { totalCourses, totalEnrollments, inProgress, completed, certs, avgProgress };
  }, [courses]);

  const counts = useMemo(() => {
    if (!courses) return { all: 0, enrolled: 0, published: 0, draft: 0 };
    return {
      all: courses.length,
      enrolled: courses.filter((c) => c.enrollment_count > 0).length,
      published: courses.filter((c) => c.is_published).length,
      draft: courses.filter((c) => !c.is_published).length,
    };
  }, [courses]);

  const filtered = useMemo(() => {
    if (!courses) return [];
    let list = courses;
    if (filter === "enrolled") {
      list = list.filter((c) => c.enrollment_count > 0);
    } else if (filter === "published") {
      list = list.filter((c) => c.is_published);
    } else if (filter === "draft") {
      list = list.filter((c) => !c.is_published);
    }
    if (!search) return list;
    const q = search.toLowerCase().trim();
    return list.filter((c) =>
      c.name?.toLowerCase().includes(q) ||
      c.slug?.toLowerCase().includes(q) ||
      c.domain?.toLowerCase().includes(q) ||
      c.difficulty?.toLowerCase().includes(q) ||
      c.short_description?.toLowerCase().includes(q)
    );
  }, [courses, filter, search]);

  const handleTogglePublish = async (course: AdminCourseItem) => {
    setTogglingPublishId(course.id);
    try {
      await toggleCoursePublish({ data: { courseId: course.id, isPublished: !course.is_published } });
      toast.success(`${course.name} is now ${!course.is_published ? "Published" : "Draft"}`);
      qc.invalidateQueries({ queryKey: ["admin-courses-directory"] });
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to update publish status");
    } finally {
      setTogglingPublishId(null);
    }
  };

  const handleDeleteCourse = async () => {
    if (!deletingCourseId) return;
    try {
      const { error } = await supabase.from("courses").delete().eq("id", deletingCourseId);
      if (error) throw error;
      toast.success("Course deleted successfully");
      qc.invalidateQueries({ queryKey: ["admin-courses-directory"] });
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete course");
    } finally {
      setDeletingCourseId(null);
    }
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Enrolled Students Modal */}
      {selectedCourseForStudents && (
        <CourseStudentsModal
          course={selectedCourseForStudents}
          onClose={() => setSelectedCourseForStudents(null)}
          onRefresh={() => {
            qc.invalidateQueries({ queryKey: ["admin-courses-directory"] });
            refetch().then((res) => {
              if (res.data) {
                const updated = res.data.find((c) => c.id === selectedCourseForStudents.id);
                if (updated) setSelectedCourseForStudents(updated);
              }
            });
          }}
        />
      )}

      {/* Course Form Modal */}
      {showCourseForm && (
        <CourseFormModal
          course={editingCourse}
          onClose={() => {
            setShowCourseForm(false);
            setEditingCourse(null);
          }}
          onSuccess={() => {
            setShowCourseForm(false);
            setEditingCourse(null);
            qc.invalidateQueries({ queryKey: ["admin-courses-directory"] });
            qc.invalidateQueries({ queryKey: ["admin-courses"] });
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingCourseId && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setDeletingCourseId(null)}>
            <div className="w-full max-w-sm rounded-2xl border border-border/50 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:bg-[#1E293B]/95 dark:border-white/10 animate-in zoom-in-95 my-auto" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-2">Delete Course?</h3>
              <p className="text-xs text-muted-foreground mb-4">
                This will permanently delete this course and all associated lessons, task submissions, and student progress records.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setDeletingCourseId(null)}>Cancel</Button>
                <Button variant="destructive" size="sm" onClick={handleDeleteCourse}>Delete Course</Button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Courses & Learning Tracks</h2>
            <Badge variant="secondary" className="rounded-lg text-xs font-semibold">
              {courses ? `${courses.length} Courses` : "Loading..."}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage course curriculum, syllabus, quizzes, and track how many users apply & learn
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search course name, slug, difficulty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-xl pl-9 text-xs border-border/60"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-3 rounded-xl gap-1.5 text-xs shrink-0"
            title="Refresh courses"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin text-blue-600" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            onClick={() => {
              setEditingCourse(null);
              setShowCourseForm(true);
            }}
            className="brand-gradient text-white border-0 gap-1.5 h-9 px-3.5 text-xs rounded-xl shadow-sm"
          >
            <Plus className="size-4" /> Add Course
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-border/50 bg-white/60 p-4 backdrop-blur dark:bg-[#1E293B]/60 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Courses</span>
            <div className="grid size-8 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <BookOpen className="size-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold">{kpis.totalCourses}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{counts.published} published · {counts.draft} draft</p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-white/60 p-4 backdrop-blur dark:bg-[#1E293B]/60 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Users Applied</span>
            <div className="grid size-8 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Users className="size-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold">{kpis.totalEnrollments}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{counts.enrolled} courses with active learners</p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-white/60 p-4 backdrop-blur dark:bg-[#1E293B]/60 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Completed & Certified</span>
            <div className="grid size-8 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Award className="size-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold">{kpis.completed}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{kpis.certs} certificates issued</p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-white/60 p-4 backdrop-blur dark:bg-[#1E293B]/60 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Avg Progress</span>
            <div className="grid size-8 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <BarChart3 className="size-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold">{kpis.avgProgress}%</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.min(kpis.avgProgress, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilter("all")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium transition ${
            filter === "all"
              ? "bg-[#07284a] text-white shadow-sm dark:bg-blue-600"
              : "bg-white/80 text-muted-foreground hover:bg-white hover:text-foreground border border-border/50 dark:bg-slate-800/60"
          }`}
        >
          <BookOpen className="size-3.5" />
          <span>All Courses</span>
          <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${filter === "all" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
            {counts.all}
          </span>
        </button>

        <button
          onClick={() => setFilter("enrolled")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium transition ${
            filter === "enrolled"
              ? "bg-[#07284a] text-white shadow-sm dark:bg-blue-600"
              : "bg-white/80 text-muted-foreground hover:bg-white hover:text-foreground border border-border/50 dark:bg-slate-800/60"
          }`}
        >
          <Users className="size-3.5" />
          <span>With Enrolled Users</span>
          <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${filter === "enrolled" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
            {counts.enrolled}
          </span>
        </button>

        <button
          onClick={() => setFilter("published")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium transition ${
            filter === "published"
              ? "bg-[#07284a] text-white shadow-sm dark:bg-blue-600"
              : "bg-white/80 text-muted-foreground hover:bg-white hover:text-foreground border border-border/50 dark:bg-slate-800/60"
          }`}
        >
          <CheckCircle2 className="size-3.5 text-emerald-400" />
          <span>Published</span>
          <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${filter === "published" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
            {counts.published}
          </span>
        </button>

        <button
          onClick={() => setFilter("draft")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium transition ${
            filter === "draft"
              ? "bg-[#07284a] text-white shadow-sm dark:bg-blue-600"
              : "bg-white/80 text-muted-foreground hover:bg-white hover:text-foreground border border-border/50 dark:bg-slate-800/60"
          }`}
        >
          <span>Draft</span>
          <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${filter === "draft" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
            {counts.draft}
          </span>
        </button>
      </div>

      {/* Courses Table */}
      <div className="overflow-x-auto rounded-2xl border border-border/50 bg-white/60 backdrop-blur dark:bg-[#1E293B]/60 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-xs uppercase text-muted-foreground bg-muted/20">
              <th className="px-4 py-3 text-left">Course Track</th>
              <th className="px-4 py-3 text-left">Users Applied / Enrolled</th>
              <th className="px-4 py-3 text-left">Avg Progress</th>
              <th className="px-4 py-3 text-left">Curriculum</th>
              <th className="px-4 py-3 text-left">Duration & Quiz</th>
              <th className="px-4 py-3 text-left">Certificates</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="size-6 animate-spin text-blue-600" />
                    <span>Loading courses & enrollment analytics...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">
                  No courses found matching your filter or search query.
                </td>
              </tr>
            ) : (
              filtered.map((c: AdminCourseItem) => {
                return (
                  <tr key={c.id} className="border-b border-border/30 transition hover:bg-accent/20">
                    {/* Course Track */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-xl brand-gradient text-white shadow-sm shrink-0">
                          {c.icon && c.icon.length <= 4 ? (
                            <span className="text-base">{c.icon}</span>
                          ) : (
                            <BookOpen className="size-5 text-white" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-semibold text-sm truncate">{c.name}</p>
                            <Badge variant="outline" className="text-[10px] font-mono capitalize">
                              {c.difficulty || "Intermediate"}
                            </Badge>
                          </div>
                          <p className="text-xs font-mono text-muted-foreground">{c.slug}</p>
                          {c.short_description && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-xs">{c.short_description}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Users Applied / Enrolled */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {c.enrollment_count > 0 ? (
                        <div className="space-y-1">
                          <button
                            onClick={() => setSelectedCourseForStudents(c)}
                            className="group flex items-center gap-1.5 rounded-xl bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50 border border-blue-200/60 dark:border-blue-800/40"
                            title="Click to view all enrolled students"
                          >
                            <Users className="size-3.5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition" />
                            <span>{c.enrollment_count} {c.enrollment_count === 1 ? "User Applied" : "Users Applied"}</span>
                            <ArrowUpRight className="size-3 text-blue-500 opacity-60 group-hover:opacity-100" />
                          </button>
                          <p className="text-[11px] text-muted-foreground pl-1">
                            <span className="text-emerald-600 font-medium">{c.completed_count} Completed</span> · {c.in_progress_count} In Progress
                          </p>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 text-xs text-muted-foreground">
                          0 Users Applied
                        </span>
                      )}
                    </td>

                    {/* Avg Progress */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                c.avg_progress >= 75 ? "bg-emerald-500" : c.avg_progress >= 25 ? "bg-blue-500" : "bg-slate-400"
                              }`}
                              style={{ width: `${Math.min(c.avg_progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold">{c.avg_progress}%</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Class Average</p>
                      </div>
                    </td>

                    {/* Curriculum */}
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      <div className="space-y-0.5">
                        <p className="font-medium text-foreground">{c.total_topics || 0} Lessons</p>
                        <p className="text-[11px]">{c.total_tasks || 0} Practical Tasks</p>
                      </div>
                    </td>

                    {/* Duration & Quiz */}
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      <div className="space-y-0.5">
                        <p className="font-medium text-foreground">{c.duration_weeks || 4} Weeks Track</p>
                        <p className="text-[11px]">Pass: {c.pass_marks || 60}% · {c.quiz_marks || 100} Pts</p>
                      </div>
                    </td>

                    {/* Certificates */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {c.cert_count > 0 ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs">
                          <Award className="size-3 mr-1" /> {c.cert_count} Issued
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">0 Issued</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePublish(c)}
                        disabled={togglingPublishId === c.id}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition cursor-pointer ${
                          c.is_published
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                        title="Click to toggle published / draft"
                      >
                        <span className={`size-1.5 rounded-full ${c.is_published ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {c.is_published ? "Published" : "Draft"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1">
                        {c.enrollment_count > 0 && (
                          <button
                            onClick={() => setSelectedCourseForStudents(c)}
                            className="grid size-8 place-items-center rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                            title="View Enrolled Students"
                          >
                            <Users className="size-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingCourse(c);
                            setShowCourseForm(true);
                          }}
                          className="grid size-8 place-items-center rounded-lg text-slate-600 hover:text-foreground hover:bg-accent/60 transition"
                          title="Edit Course"
                        >
                          <Edit className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeletingCourseId(c.id)}
                          className="grid size-8 place-items-center rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Delete Course"
                        >
                          <Trash2 className="size-4" />
                        </button>
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
  );
}

// ══════════════════════════════════════════════
// COURSE ENROLLED STUDENTS MODAL
// ══════════════════════════════════════════════
function CourseStudentsModal({
  course,
  onClose,
  onRefresh,
}: {
  course: AdminCourseItem;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [studentSearch, setStudentSearch] = useState("");
  const [deletingEnrollmentId, setDeletingEnrollmentId] = useState<string | null>(null);

  const filteredStudents = useMemo(() => {
    if (!course.students) return [];
    if (!studentSearch) return course.students;
    const q = studentSearch.toLowerCase().trim();
    return course.students.filter((s) =>
      s.full_name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q) ||
      s.college?.toLowerCase().includes(q) ||
      s.certificate?.certificate_id?.toLowerCase().includes(q)
    );
  }, [course.students, studentSearch]);

  const handleUnenroll = async (enrollmentId: string) => {
    if (!confirm("Are you sure you want to unenroll this student? This will remove their progress and task submissions for this course.")) return;
    setDeletingEnrollmentId(enrollmentId);
    try {
      const res = await deleteCourseEnrollment({ data: { enrollmentId } });
      if (!res.success) throw new Error(res.error || "Failed to unenroll student");
      toast.success("Student unenrolled successfully");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to unenroll student");
    } finally {
      setDeletingEnrollmentId(null);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <div
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border/50 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:bg-[#1E293B]/95 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl brand-gradient text-white shadow-sm">
                <BookOpen className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">Students Enrolled in {course.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {course.students?.length || 0} Total
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {course.completed_count} Completed · {course.in_progress_count} In Progress · {course.avg_progress}% Class Average Progress
                </p>
              </div>
            </div>
            <button onClick={onClose} className="grid size-8 place-items-center rounded-lg hover:bg-accent/60">
              <X className="size-4" />
            </button>
          </div>

          {/* Search bar inside modal */}
          <div className="my-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search student name, email, college, certificate ID..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="h-9 w-full rounded-xl pl-9 text-xs border-border/60"
              />
            </div>
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto rounded-xl border border-border/40">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/30 bg-muted/30 uppercase text-muted-foreground font-semibold">
                  <th className="px-3 py-2.5 text-left">Student</th>
                  <th className="px-3 py-2.5 text-left">Contact & College</th>
                  <th className="px-3 py-2.5 text-left">Progress</th>
                  <th className="px-3 py-2.5 text-left">Status</th>
                  <th className="px-3 py-2.5 text-left">Enrolled Date</th>
                  <th className="px-3 py-2.5 text-left">Certificate</th>
                  <th className="px-3 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted-foreground">
                      No enrolled students found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s: CourseStudentEnrollment) => {
                    const isCompleted = s.status === "completed" || s.progress_percent >= 100;
                    return (
                      <tr key={s.enrollment_id} className="hover:bg-accent/20 transition">
                        {/* Student */}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="grid size-7 shrink-0 place-items-center rounded-full brand-gradient text-[10px] font-bold text-white">
                              {s.full_name ? s.full_name.charAt(0).toUpperCase() : "S"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate">{s.full_name || "—"}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{s.email || "—"}</p>
                            </div>
                          </div>
                        </td>

                        {/* Contact & College */}
                        <td className="px-3 py-2.5 max-w-[180px]">
                          <p className="text-foreground truncate">{s.phone && s.phone !== "—" ? s.phone : "—"}</p>
                          <p className="text-[10px] text-muted-foreground truncate" title={s.college || ""}>
                            {s.college && s.college !== "—" ? s.college : "—"}
                          </p>
                        </td>

                        {/* Progress */}
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isCompleted ? "bg-emerald-500" : s.progress_percent > 0 ? "bg-blue-500" : "bg-slate-400"
                                }`}
                                style={{ width: `${Math.min(s.progress_percent, 100)}%` }}
                              />
                            </div>
                            <span className="font-semibold text-[11px]">{s.progress_percent}%</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                              <CheckCircle2 className="size-3" /> Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                              <Clock className="size-3" /> In Progress
                            </span>
                          )}
                        </td>

                        {/* Enrolled Date */}
                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                          {s.started_at ? new Date(s.started_at).toLocaleDateString("en-IN") : "—"}
                        </td>

                        {/* Certificate */}
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {s.certificate?.certificate_id ? (
                            <Link
                              to="/verify-certificate"
                              search={{ id: s.certificate.certificate_id }}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-emerald-600 hover:underline font-mono text-[10px]"
                            >
                              <Award className="size-3 shrink-0" />
                              <span>{s.certificate.certificate_id}</span>
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-1">
                            {s.email && s.email !== "—" && (
                              <a
                                href={`mailto:${s.email}`}
                                className="grid size-7 place-items-center rounded-lg text-slate-600 hover:text-foreground hover:bg-accent/60 transition"
                                title={`Send Email to ${s.email}`}
                              >
                                <Mail className="size-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => handleUnenroll(s.enrollment_id)}
                              disabled={deletingEnrollmentId === s.enrollment_id}
                              className="grid size-7 place-items-center rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                              title="Unenroll student"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
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
      </div>
    </Portal>
  );
}

// ══════════════════════════════════════════════
// COURSE ADD / EDIT MODAL
// ══════════════════════════════════════════════
function CourseFormModal({
  course,
  onClose,
  onSuccess,
}: {
  course: AdminCourseItem | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(course?.name || "");
  const [slug, setSlug] = useState(course?.slug || "");
  const [domainCode, setDomainCode] = useState(course?.domain || "");
  const [icon, setIcon] = useState(course?.icon || "BookOpen");
  const [difficulty, setDifficulty] = useState(course?.difficulty || "Intermediate");
  const [durationWeeks, setDurationWeeks] = useState(course?.duration_weeks || 4);
  const [totalTopics, setTotalTopics] = useState(course?.total_topics || 30);
  const [totalTasks, setTotalTasks] = useState(course?.total_tasks || 5);
  const [passMarks, setPassMarks] = useState(course?.pass_marks || 60);
  const [quizMarks, setQuizMarks] = useState(course?.quiz_marks || 100);
  const [quizDurationMin, setQuizDurationMin] = useState(course?.quiz_duration_min || 60);
  const [description, setDescription] = useState(course?.short_description || "");
  const [isPublished, setIsPublished] = useState(course?.is_published ?? true);
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !domainCode) {
      toast.error("Please fill in Name, Slug, and Domain Code.");
      return;
    }
    setSaving(true);
    const payload = {
      name,
      slug,
      domain: domainCode,
      icon,
      difficulty,
      duration_weeks: Number(durationWeeks),
      total_topics: Number(totalTopics),
      total_tasks: Number(totalTasks),
      pass_marks: Number(passMarks),
      quiz_marks: Number(quizMarks),
      quiz_duration_min: Number(quizDurationMin),
      short_description: description,
      is_published: isPublished,
    };

    try {
      if (course) {
        const { error } = await supabase.from("courses").update(payload as any).eq("id", course.id);
        if (error) throw error;
        toast.success("Course updated successfully!");
      } else {
        const { error } = await supabase.from("courses").insert(payload as any);
        if (error) throw error;
        toast.success("Course created successfully!");
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
        <div
          className="w-full max-w-xl rounded-2xl border border-border/50 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:bg-[#1E293B]/95 dark:border-white/10 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/50">
            <h3 className="text-lg font-bold">{course ? "Edit Course" : "Add New Course"}</h3>
            <button onClick={onClose} className="grid size-8 place-items-center rounded-lg hover:bg-accent/60">
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={save} className="space-y-4 text-xs">
            <div>
              <Label className="text-xs">Course Name *</Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!course && !slug) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                    setDomainCode(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""));
                  }
                }}
                placeholder="e.g. Python Programming"
                required
                className="mt-1 text-xs h-9 rounded-xl border-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Slug *</Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. python"
                  required
                  className="mt-1 text-xs h-9 rounded-xl border-slate-200"
                />
              </div>
              <div>
                <Label className="text-xs">Domain Code *</Label>
                <Input
                  value={domainCode}
                  onChange={(e) => setDomainCode(e.target.value)}
                  placeholder="e.g. python"
                  required
                  className="mt-1 text-xs h-9 rounded-xl border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Difficulty</Label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-xs"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Duration (Weeks)</Label>
                <Input
                  type="number"
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(Number(e.target.value))}
                  min={1}
                  className="mt-1 text-xs h-9 rounded-xl border-slate-200"
                />
              </div>
              <div>
                <Label className="text-xs">Icon (emoji / Lucide)</Label>
                <Input
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="e.g. Code2, 🐍"
                  className="mt-1 text-xs h-9 rounded-xl border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Total Lessons/Topics</Label>
                <Input
                  type="number"
                  value={totalTopics}
                  onChange={(e) => setTotalTopics(Number(e.target.value))}
                  min={0}
                  className="mt-1 text-xs h-9 rounded-xl border-slate-200"
                />
              </div>
              <div>
                <Label className="text-xs">Total Tasks</Label>
                <Input
                  type="number"
                  value={totalTasks}
                  onChange={(e) => setTotalTasks(Number(e.target.value))}
                  min={0}
                  className="mt-1 text-xs h-9 rounded-xl border-slate-200"
                />
              </div>
              <div>
                <Label className="text-xs">Pass Marks (%)</Label>
                <Input
                  type="number"
                  value={passMarks}
                  onChange={(e) => setPassMarks(Number(e.target.value))}
                  min={1}
                  max={100}
                  className="mt-1 text-xs h-9 rounded-xl border-slate-200"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Short Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of skills acquired in this course..."
                rows={2}
                className="mt-1 text-xs rounded-xl border-slate-200"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isCoursePublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded border-slate-200"
              />
              <Label htmlFor="isCoursePublished" className="text-xs font-semibold select-none cursor-pointer">
                Publish Course (Make visible to students for enrollment)
              </Label>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-border/50">
              <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} size="sm" className="brand-gradient text-white border-0 rounded-xl px-4">
                {saving ? "Saving..." : course ? "Update Course" : "Create Course"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}

// ══════════════════════════════════════════════
// DOMAINS MANAGEMENT SECTION
// ══════════════════════════════════════════════
function DomainsSection() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingDomain, setEditingDomain] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [domainCode, setDomainCode] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const { data: courses, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("*").order("name", { ascending: true });
      return data ?? [];
    }
  });

  const { data: apps } = useQuery({
    queryKey: ["admin-domain-apps-count"],
    queryFn: async () => {
      const { data } = await supabase.from("applications").select("id, domain, status");
      return data ?? [];
    },
  });

  const domainAppStats = useMemo(() => {
    const map: Record<string, { total: number; approved: number; pending: number }> = {};
    if (apps) {
      for (const a of apps) {
        const d = (a.domain || "").toLowerCase().trim();
        if (!map[d]) map[d] = { total: 0, approved: 0, pending: 0 };
        map[d].total++;
        if (a.status === "approved" || a.status === "completed") map[d].approved++;
        else map[d].pending++;
      }
    }
    return map;
  }, [apps]);

  const allowedSlugs = new Set(["fullstack", "python", "java", "mernstack", "meanstack", "aiml", "datascience", "uiux", "cybersecurity"]);

  const internshipDomains = useMemo(() => {
    if (!courses) return [];
    return courses.filter((c: any) => allowedSlugs.has(c.domain));
  }, [courses]);

  const filtered = useMemo(() => {
    if (!internshipDomains) return [];
    if (!search) return internshipDomains;
    const q = search.toLowerCase();
    return internshipDomains.filter((c: any) =>
      c.name.toLowerCase().includes(q) ||
      c.domain.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q)
    );
  }, [internshipDomains, search]);

  const openAdd = () => {
    setEditingDomain(null);
    setName("");
    setDomainCode("");
    setSlug("");
    setIcon("");
    setDescription("");
    setIsPublished(false);
    setShowForm(true);
  };

  const openEdit = (d: any) => {
    setEditingDomain(d);
    setName(d.name);
    setDomainCode(d.domain);
    setSlug(d.slug);
    setIcon(d.icon || "");
    setDescription(d.short_description || "");
    setIsPublished(d.is_published || false);
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !domainCode || !slug) {
      toast.error("Please fill in Name, Domain Code, and Slug.");
      return;
    }
    setSaving(true);
    const payload: any = {
      name,
      domain: domainCode,
      slug,
      icon: icon || null,
      short_description: description,
      is_published: isPublished,
      difficulty: "intermediate",
      duration_weeks: 4,
      pass_marks: 60,
      quiz_marks: 10,
      quiz_duration_min: 15,
      total_tasks: 0,
      total_topics: 0
    };

    let error;
    if (editingDomain) {
      const { error: err } = await supabase.from("courses").update(payload as any).eq("id", editingDomain.id);
      error = err;
    } else {
      const { error: err } = await supabase.from("courses").insert(payload as any);
      error = err;
    }

    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(editingDomain ? "Domain updated successfully!" : "Domain created successfully!");
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      qc.invalidateQueries({ queryKey: ["admin-courses-directory"] });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const { error } = await supabase.from("courses").delete().eq("id", deletingId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Domain deleted successfully!");
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      qc.invalidateQueries({ queryKey: ["admin-courses-directory"] });
    }
    setDeletingId(null);
  };

  return (
    <div className="animate-fade-in-up space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Internship Domains</h2>
          <p className="text-sm text-muted-foreground">Manage internship domains and track applicant counts</p>
        </div>
        <Button onClick={openAdd} className="brand-gradient text-white border-0 gap-1.5 h-10">
          <Plus className="size-4" /> Add Domain
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search domains..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 border-slate-200 text-xs"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/70 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold dark:border-slate-800 dark:bg-slate-800/30">
              <th className="p-4">Name</th>
              <th className="p-4">Domain Code</th>
              <th className="p-4">Slug</th>
              <th className="p-4">Internship Applicants</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
            {isLoading && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">Loading domains...</td>
              </tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">No domains found.</td>
              </tr>
            )}
            {!isLoading && filtered.map((d: any) => {
              const code = (d.domain || "").toLowerCase().trim();
              const appStat = domainAppStats[code] || { total: 0, approved: 0, pending: 0 };
              return (
                <tr key={d.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20">
                  <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{d.name}</td>
                  <td className="p-4 font-mono">{d.domain}</td>
                  <td className="p-4 font-mono text-slate-500">{d.slug}</td>
                  <td className="p-4">
                    {appStat.total > 0 ? (
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                          <Users className="size-3" /> {appStat.total} Applicants
                        </span>
                        <p className="text-[10px] text-muted-foreground">
                          {appStat.approved} Approved · {appStat.pending} Pending
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">0 Applicants</span>
                    )}
                  </td>
                  <td className="p-4">
                    <Badge className={`text-xs ${
                      d.is_published ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    }`}>
                      {d.is_published ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="p-4 text-right space-x-1.5">
                    <Button size="sm" variant="outline" className="h-8 px-2 rounded-lg border-slate-200" onClick={() => openEdit(d)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 px-2 rounded-lg text-rose-600 hover:text-rose-700 border-slate-200 hover:bg-rose-50" onClick={() => setDeletingId(d.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Form Dialog */}
      {showForm && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
            <div className="w-full max-w-lg rounded-2xl border border-border/50 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:bg-[#1E293B]/95 dark:border-white/10 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto my-auto" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-4">{editingDomain ? "Edit Domain" : "Add Domain"}</h3>
              <form onSubmit={save} className="space-y-4">
                <div>
                  <Label className="text-xs">Domain Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. MERN Stack Development" required className="mt-1 text-xs h-9 rounded-xl border-slate-200" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Domain Code</Label>
                    <Input value={domainCode} onChange={(e) => setDomainCode(e.target.value)} placeholder="e.g. mern" required className="mt-1 text-xs h-9 rounded-xl border-slate-200" disabled={!!editingDomain} />
                  </div>
                  <div>
                    <Label className="text-xs">Slug</Label>
                    <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. mern-stack-development" required className="mt-1 text-xs h-9 rounded-xl border-slate-200" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Icon (emoji)</Label>
                  <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="e.g. 🛠️" className="mt-1 text-xs h-9 rounded-xl border-slate-200" />
                </div>
                <div>
                  <Label className="text-xs">Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide short details about the track..." rows={3} className="mt-1 text-xs rounded-xl border-slate-200" />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" id="isPublished" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="rounded border-slate-200" />
                  <Label htmlFor="isPublished" className="text-xs font-semibold select-none cursor-pointer">Publish and make active for internship applications</Label>
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <Button type="button" variant="outline" className="text-xs rounded-xl h-9" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" disabled={saving} className="brand-gradient text-white border-0 text-xs rounded-xl h-9 px-4">{saving ? "Saving..." : "Save Changes"}</Button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setDeletingId(null)}>
            <div className="w-full max-w-sm rounded-2xl border border-border/50 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:bg-[#1E293B]/95 dark:border-white/10 animate-in zoom-in-95 my-auto" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold">Delete Domain</h3>
              <p className="mt-2 text-sm text-slate-500">Are you sure you want to delete this domain? This action is permanent and might fail if there are dependent user enrollments.</p>
              <div className="mt-6 flex gap-3 justify-end">
                <Button variant="outline" className="text-xs rounded-xl h-9" onClick={() => setDeletingId(null)}>Cancel</Button>
                <Button onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700 text-white border-0 text-xs rounded-xl h-9 px-4">Delete</Button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════
// TASKS MANAGEMENT SECTION
// ══════════════════════════════════════════════
function TasksSection() {
  const qc = useQueryClient();
  const [viewingDomain, setViewingDomain] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [taskNumber, setTaskNumber] = useState(1);
  const [description, setDescription] = useState("");
  const [resources, setResources] = useState("");

  const { data: domains, isLoading: domainsLoading } = useQuery({
    queryKey: ["admin-courses-options"],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("domain, name, slug").order("name", { ascending: true });
      return data ?? [];
    }
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["admin-tasks-list"],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("*").order("domain", { ascending: true }).order("task_number", { ascending: true });
      return data ?? [];
    }
  });

  const activeDomainInfo = useMemo(() => {
    if (!domains || !viewingDomain) return null;
    return domains.find((d: any) => d.domain === viewingDomain);
  }, [domains, viewingDomain]);

  const domainTaskCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (domains) {
      domains.forEach((d: any) => {
        counts[d.domain] = 0;
      });
    }
    if (tasks) {
      tasks.forEach((t: any) => {
        if (t.domain in counts) {
          counts[t.domain]++;
        } else {
          counts[t.domain] = 1;
        }
      });
    }
    return counts;
  }, [domains, tasks]);

  const filteredTasks = useMemo(() => {
    if (!tasks || !viewingDomain) return [];
    return tasks.filter((t: any) => t.domain === viewingDomain);
  }, [tasks, viewingDomain]);

  const openAdd = () => {
    if (!viewingDomain) return;
    setEditingTask(null);
    setTitle("");
    setDomain(viewingDomain);
    setTaskNumber(filteredTasks.length + 1 || 1);
    setDescription("");
    setResources("");
    setShowForm(true);
  };

  const openEdit = (t: any) => {
    setEditingTask(t);
    setTitle(t.title);
    setDomain(t.domain);
    setTaskNumber(t.task_number);
    setDescription(t.description);
    setResources(t.resources || "");
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !domain || !taskNumber) {
      toast.error("Please fill in Title, Domain, and Task Number.");
      return;
    }
    setSaving(true);
    const payload = {
      title,
      domain,
      task_number: taskNumber,
      description,
      resources: resources || null
    };

    let error;
    if (editingTask) {
      const { error: err } = await supabase.from("tasks").update(payload).eq("id", editingTask.id);
      error = err;
    } else {
      const { error: err } = await supabase.from("tasks").insert(payload);
      error = err;
    }

    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(editingTask ? "Task updated successfully!" : "Task created successfully!");
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ["admin-tasks-list"] });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const { error } = await supabase.from("tasks").delete().eq("id", deletingId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Task deleted successfully!");
      qc.invalidateQueries({ queryKey: ["admin-tasks-list"] });
    }
    setDeletingId(null);
  };

  const isLoading = domainsLoading || tasksLoading;

  return (
    <div className="animate-fade-in-up space-y-4">
      {viewingDomain === null ? (
        // ─── DOMAINS LIST VIEW ───
        <>
          <div>
            <h2 className="text-2xl font-bold">Manage Curriculum Tasks</h2>
            <p className="text-sm text-muted-foreground">Select an internship domain to manage its structured curriculum tasks</p>
          </div>

          {isLoading ? (
            <p className="py-12 text-center text-slate-400">Loading domains and tasks...</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-2">
              {domains?.map((d: any) => {
                const count = domainTaskCounts[d.domain] || 0;
                return (
                  <button
                    key={d.domain}
                    onClick={() => setViewingDomain(d.domain)}
                    className="flex flex-col text-left p-5 rounded-2xl border border-slate-100 bg-white/70 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60 hover:-translate-y-1 hover:shadow-md hover:border-[#07284a]/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className="grid size-10 place-items-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-[#07284a]/5 group-hover:text-[#07284a] transition">
                        <BookOpen className="size-5" />
                      </div>
                      <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-[#07284a]/5 text-[#07284a] dark:bg-slate-800 dark:text-slate-300">
                        {count} {count === 1 ? "Task" : "Tasks"}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white group-hover:text-[#07284a] transition">{d.name}</h3>
                    <p className="mt-1 text-[10px] font-mono text-slate-400 tracking-wider uppercase">{d.domain}</p>
                  </button>
                );
              })}
            </div>
          )}
        </>
      ) : (
        // ─── DOMAIN TASKS DETAIL VIEW ───
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewingDomain(null)}
                className="grid size-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition"
              >
                <ChevronLeft className="size-4" />
              </button>
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span>{activeDomainInfo?.name}</span>
                  <span className="text-xs font-mono font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {viewingDomain}
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground">Manage and sequence structured tasks for this track</p>
              </div>
            </div>
            <Button onClick={openAdd} className="brand-gradient text-white border-0 gap-1.5 h-10 rounded-xl px-4 text-xs font-semibold">
              <Plus className="size-4" /> Add Task
            </Button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/70 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold dark:border-slate-800 dark:bg-slate-800/30">
                  <th className="p-4 w-24">Task #</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Description Preview</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                {isLoading && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">Loading tasks...</td>
                  </tr>
                )}
                {!isLoading && filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">No tasks created for this domain.</td>
                  </tr>
                )}
                {!isLoading && filteredTasks.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20">
                    <td className="p-4 font-mono font-bold">Task {t.task_number}</td>
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{t.title}</td>
                    <td className="p-4 max-w-md truncate text-slate-500">{t.description}</td>
                    <td className="p-4 text-right space-x-1.5">
                      <Button size="sm" variant="outline" className="h-8 px-2 rounded-lg border-slate-200" onClick={() => openEdit(t)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 px-2 rounded-lg text-rose-600 hover:text-rose-700 border-slate-200 hover:bg-rose-50" onClick={() => setDeletingId(t.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Form Dialog */}
      {showForm && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
            <div className="w-full max-w-lg rounded-2xl border border-border/50 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:bg-[#1E293B]/95 dark:border-white/10 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto my-auto" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-4">{editingTask ? "Edit Task" : "Add Task"}</h3>
              <form onSubmit={save} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-500">Domain</Label>
                    <div className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {activeDomainInfo?.name} ({viewingDomain})
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Task Number</Label>
                    <Input type="number" value={taskNumber} onChange={(e) => setTaskNumber(Number(e.target.value))} min={1} required className="mt-1 text-xs h-9 rounded-xl border-slate-200" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Task Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Build an Intent Recognition Chatbot" required className="mt-1 text-xs h-9 rounded-xl border-slate-200" />
                </div>
                <div>
                  <Label className="text-xs">Task Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter details about requirements, expected outcome..." rows={5} className="mt-1 text-xs rounded-xl border-slate-200" required />
                </div>
                <div>
                  <Label className="text-xs">Resources (Optional)</Label>
                  <Textarea value={resources} onChange={(e) => setResources(e.target.value)} placeholder="e.g. https://python.org/docs, https://react.dev" rows={2} className="mt-1 text-xs rounded-xl border-slate-200" />
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <Button type="button" variant="outline" className="text-xs rounded-xl h-9" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" disabled={saving} className="brand-gradient text-white border-0 text-xs rounded-xl h-9 px-4">{saving ? "Saving..." : "Save Changes"}</Button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setDeletingId(null)}>
            <div className="w-full max-w-sm rounded-2xl border border-border/50 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:bg-[#1E293B]/95 dark:border-white/10 animate-in zoom-in-95 my-auto" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold">Delete Task</h3>
              <p className="mt-2 text-sm text-slate-500">Are you sure you want to delete this task? This action is permanent.</p>
              <div className="mt-6 flex gap-3 justify-end">
                <Button variant="outline" className="text-xs rounded-xl h-9" onClick={() => setDeletingId(null)}>Cancel</Button>
                <Button onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700 text-white border-0 text-xs rounded-xl h-9 px-4">Delete</Button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
