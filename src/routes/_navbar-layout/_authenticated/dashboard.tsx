import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ApplicationFormDialog } from "@/components/ApplicationFormDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { INDIA_STATES, STATE_DISTRICTS } from "@/lib/india-locations";
import { DOMAINS, DURATIONS, durationConfig, PAYMENT, COMPANY, generateInternId, generateCertId, getDomain, getPublicSiteUrl } from "@/lib/constants";
import { validateCoupon, calculateDiscountedAmount, formatDiscount } from "@/lib/coupons";
import type { CouponResult } from "@/lib/coupons";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { IDCard } from "@/components/IDCard";
import { TasksSection } from "@/components/TasksSection";
import { OfferLetterDoc, CertificateDoc, IDCardDoc, downloadIDCard, downloadOfferLetter, downloadPdf } from "@/components/pdf-docs";
import { OfferLetterPreviewDialog } from "@/components/OfferLetterPreviewDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Copy, Download, FileText, CheckCircle2, Clock, XCircle, X, Upload, Award,
  BookOpen, GraduationCap, ArrowRight, Sparkles, User, Mail, Building,
  Phone, Calendar, ChevronRight, ExternalLink, Shield, Bell, Trophy,
  Target, BarChart3, Layers, Brain, Linkedin, Play, ChevronLeft,
  ListChecks, LayoutDashboard, Flag, AlertTriangle, AlertCircle, Zap, Hash, Circle, Loader2,
  TrendingUp, Lock, Eye, LogOut,
  Settings, Wallet, CreditCard, ScrollText, Briefcase, Code2,
  Share2, HelpCircle, Package, Users, Instagram,
} from "lucide-react";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); obs.unobserve(el); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function Confetti({ active }: { active: boolean }) {
  const [pieces, setPieces] = useState<Array<{ id: number; x: number; color: string; delay: number; size: number }>>([]);
  useEffect(() => {
    if (!active) { setPieces([]); return; }
    const colors = ["#7c3aed", "#3b82f6", "#ec4899", "#10b981", "#f59e0b", "#ef4444"];
    const generated = Array.from({ length: 60 }, (_, i) => ({
      id: i, x: Math.random() * 100, color: colors[i % colors.length],
      delay: Math.random() * 0.5, size: 6 + Math.random() * 8,
    }));
    setPieces(generated);
    const t = setTimeout(() => setPieces([]), 4000);
    return () => clearTimeout(t);
  }, [active]);
  if (!pieces.length) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <div key={p.id} className="absolute animate-fall" style={{
          left: `${p.x}%`, top: "-10px", width: p.size, height: p.size,
          backgroundColor: p.color, borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          animationDelay: `${p.delay}s`, animationDuration: `${2.5 + Math.random() * 1.5}s`,
        }} />
      ))}
      <style>{`
        @keyframes fall { to { transform: translateY(105vh) rotate(720deg); opacity: 0; } }
        .animate-fall { animation: fall linear forwards; }
      `}</style>
    </div>
  );
}

function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function DashboardHero({ badge, title, description, icon: Icon }: {
  badge: string; title: string; description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#07284a]/8 via-[#07284a]/3 to-blue-400/8 p-8 sm:p-12">
      <div className="absolute -right-24 -top-24 size-64 rounded-full bg-[#07284a]/15 blur-[120px]" />
      <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-blue-400/10 blur-[100px]" />
      <div className="absolute right-1/4 bottom-0 size-32 rounded-full bg-emerald-400/5 blur-[80px]" />
      <div className="relative flex items-start gap-6">
        <div className="hidden sm:grid size-16 shrink-0 place-items-center rounded-2xl brand-gradient text-white shadow-lg shadow-[#07284a]/20">
          <Icon className="size-8" />
        </div>
        <div>
          <Badge variant="secondary" className="mb-4 px-3 py-1.5 text-xs"><Sparkles className="mr-1.5 size-3" />{badge}</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold font-display">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground/80 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_navbar-layout/_authenticated/dashboard")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  head: () => ({ meta: [{ title: "Dashboard — Skyrovix" }] }),
  component: Dashboard,
});

type Application = {
  id: string; user_id: string; domain: string; intern_id: string;
  full_name: string; email: string; phone: string | null;
  college: string | null; course: string | null; year: string | null;
  photo_url: string | null; offer_issued_at: string;
  created_at: string; status: string; completed_at?: string | null;
  duration?: number; total_tasks?: number;
  coupon_code?: string | null;
  submission_status?: string;
  submitted_at?: string | null;
  verified?: boolean;
  verified_by?: string | null;
  verified_at?: string | null;
  verification_notes?: string | null;
  rejection_reason?: string | null;
  certificate_generated?: boolean;
  certificate_generated_at?: string | null;
};

function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`student-realtime-${user.id}`);
    channel
      .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, () => {
        qc.invalidateQueries({ queryKey: ["my-applications", user.id] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "submissions" }, () => {
        qc.invalidateQueries({ queryKey: ["all-submissions"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "certificates" }, () => {
        qc.invalidateQueries({ queryKey: ["all-certs"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => {
        qc.invalidateQueries({ queryKey: ["all-payments"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, qc]);

  const { data: profile } = useQuery({
    queryKey: ["my-profile-details", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data ?? null;
    }
  });

  const { data: appsList, isLoading } = useQuery({
    queryKey: ["my-applications", user?.id],
    queryFn: async (): Promise<Application[]> => {
      if (!user) return [];
      const { data } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
    refetchInterval: 10_000,
    staleTime: 5_000,
    placeholderData: (prev) => prev,
  });

  const appsWithProfile = useMemo(() => {
    if (!appsList) return [];
    if (!profile) return appsList;
    return appsList.map(a => ({
      ...a,
      full_name: profile.full_name || a.full_name,
      phone: profile.phone || a.phone,
      college: profile.college || a.college,
      course: profile.course || a.course,
      year: profile.year || a.year,
      photo_url: profile.photo_url || a.photo_url,
    }));
  }, [appsList, profile]);

  const app = useMemo(() => {
    if (!appsWithProfile?.length) return null;
    const active = appsWithProfile.find((a) => a.status === "ongoing" || a.status === "approved");
    return active ?? appsWithProfile[0];
  }, [appsWithProfile]);

  const completedApps = useMemo(() => {
    return appsWithProfile?.filter((a) => a.status === "completed") ?? [];
  }, [appsWithProfile]);





  const { data: allAppSubmissions } = useQuery({
    queryKey: ["all-submissions", appsList?.map((a) => a.id)],
    queryFn: async () => {
      if (!appsList?.length) return [];
      const ids = appsList.map((a) => a.id);
      const { data } = await supabase.from("submissions").select("*").in("application_id", ids).order("submitted_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!appsList?.length,
    refetchInterval: 10_000,
    placeholderData: (prev) => prev,
  });

  const { data: allAppCerts } = useQuery({
    queryKey: ["all-certs", appsList?.map((a) => a.id)],
    queryFn: async () => {
      if (!appsList?.length) return [];
      const ids = appsList.map((a) => a.id);
      const { data } = await supabase.from("certificates").select("*").in("application_id", ids);
      return data ?? [];
    },
    enabled: !!appsList?.length,
    refetchInterval: 10_000,
    placeholderData: (prev) => prev,
  });

  const { data: allTasksByDomain } = useQuery({
    queryKey: ["all-tasks-by-domain", appsList?.map((a) => a.domain)],
    queryFn: async () => {
      if (!appsList?.length) return {} as Record<string, any[]>;
      const domains = [...new Set(appsList.map((a) => a.domain))];
      const { data } = await supabase.from("tasks").select("*").in("domain", domains);
      const byDomain: Record<string, any[]> = {};
      for (const t of data ?? []) {
        if (!byDomain[t.domain]) byDomain[t.domain] = [];
        byDomain[t.domain].push(t);
      }
      return byDomain;
    },
    enabled: !!appsList?.length,
    placeholderData: (prev) => prev,
  });

  const internSubmissions = useMemo(() => {
    if (!app || !allAppSubmissions) return [];
    return allAppSubmissions.filter((s: any) => s.application_id === app.id);
  }, [allAppSubmissions, app]);

  const taskLimits: Record<number, number> = { 1: 5, 2: 8, 3: 10, 6: 12 };
  const { data: internTasks } = useQuery({
    queryKey: ["my-tasks", app?.domain, app?.duration],
    queryFn: async () => {
      if (!app) return [];
      const limit = taskLimits[app.duration ?? 1] ?? 5;
      const { data } = await supabase.from("tasks").select("id, task_number").eq("domain", app.domain).lte("task_number", limit).order("task_number");
      return data ?? [];
    },
    enabled: !!app,
    placeholderData: (prev) => prev,
  });

  const certificate = useMemo(() => {
    if (!app || !allAppCerts) return null;
    return allAppCerts.find((c: any) => c.application_id === app.id) ?? null;
  }, [allAppCerts, app]);

  const { data: allPayments } = useQuery({
    queryKey: ["all-payments", appsList?.map((a) => a.id)],
    queryFn: async () => {
      if (!appsList?.length) return [];
      const ids = appsList.map((a) => a.id);
      const { data } = await supabase.from("payments").select("*").in("application_id", ids);
      return data ?? [];
    },
    enabled: !!appsList?.length,
    placeholderData: (prev) => prev,
  });

  const payment = useMemo(() => {
    if (!app || !allPayments) return null;
    return allPayments.find((p: any) => p.application_id === app.id) ?? null;
  }, [allPayments, app]);

  const cert = certificate;
  const domain = app ? getDomain(app.domain) : null;
  const internTotal = internTasks?.length ?? 0;
  const internApproved = internSubmissions?.filter((s: any) => s.status === "approved").length ?? 0;
  const internPending = internSubmissions?.filter((s: any) => s.status === "pending").length ?? 0;
  const internCompleted = internApproved;

  // Auto-complete internships when all tasks approved + certificate exists
  useEffect(() => {
    if (!appsList || !allAppSubmissions || !allAppCerts || !allTasksByDomain) return;
    (async () => {
      for (const a of appsList) {
        if (a.status === "completed" || a.status === "pending") continue;
        try {
          const aSubs = allAppSubmissions.filter((s: any) => s.application_id === a.id);
          const aApproved = aSubs.filter((s: any) => s.status === "approved").length;
          const limit = taskLimits[a.duration ?? 1] ?? 5;
          const aCert = allAppCerts.find((c: any) => c.application_id === a.id);
          if (aApproved >= limit && aCert) {
            const { error: updErr } = await (supabase.from("applications") as any).update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", a.id);
            if (updErr) { console.error("Auto-complete update failed:", updErr); continue; }
            qc.invalidateQueries({ queryKey: ["my-applications"] });
          }
        } catch (err) {
          console.error("Auto-complete error:", err);
        }
      }
    })();
  }, [appsList, allAppSubmissions, allAppCerts, allTasksByDomain, qc]);

  const searchParams = Route.useSearch();
  const active = searchParams.tab ?? "tasks";
  const [detailView, setDetailView] = useState<{ type: "app"; id: string } | null>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"celebration" | "checkout">("celebration");
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [autoApplied, setAutoApplied] = useState(false);
  const [certStatus, setCertStatus] = useState<"idle" | "generating" | "done" | "error">("idle");
  const certTriggered = useRef(false);

  const submissionStatus = app?.submission_status ?? "in_progress";
  const hasCouponApp = Boolean(
    (app?.coupon_code && app.coupon_code.trim() !== "") ||
    (payment && ((payment as any).coupon_code || payment.utr_number === "FREE_COUPON" || payment.amount === 0)) ||
    couponResult?.valid
  );

  const isTasksCompleted = Boolean(
    app && (
      (internTotal > 0 && internApproved >= internTotal) ||
      (internApproved >= (taskLimits[app?.duration ?? 1] ?? 5))
    )
  );

  const hasAutoTriggeredRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (showPaymentModal) {
      setPaymentStep("celebration");
    }
  }, [showPaymentModal]);

  useEffect(() => {
    if (
      app &&
      isTasksCompleted &&
      !hasCouponApp &&
      payment?.status !== "verified" &&
      !hasAutoTriggeredRef.current[app.id]
    ) {
      hasAutoTriggeredRef.current[app.id] = true;
      setShowPaymentModal(true);
    }
  }, [app, isTasksCompleted, hasCouponApp, payment]);
  const timelineSteps = hasCouponApp
    ? [
        { label: "Application Submitted", done: !!app },
        { label: "Tasks Completed & Approved", done: internTotal > 0 && internApproved >= (taskLimits[app?.duration ?? 1] ?? 5) },
        { label: "Certificate Generated", done: !!certificate },
      ]
    : [
        { label: "Application Submitted", done: !!app },
        { label: "Tasks Completed & Approved", done: internTotal > 0 && internApproved >= (taskLimits[app?.duration ?? 1] ?? 5) },
        { label: "Payment Verification (₹100)", done: payment?.status === "verified" },
        { label: "Certificate Generated", done: !!certificate },
      ];
  const currentStep = timelineSteps.findIndex((s) => !s.done);

  // New Domain Application Form states
  const [newDomain, setNewDomain] = useState("");
  const [newDuration, setNewDuration] = useState(1);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponApplied, setNewCouponApplied] = useState<{ code: string; discount: string } | null>(null);
  const [validatingNewCoupon, setValidatingNewCoupon] = useState(false);
  const [submittingNewApp, setSubmittingNewApp] = useState(false);

  // New domain location + referral states
  const [newCountry, setNewCountry] = useState("India");
  const [newState, setNewState] = useState("");
  const [newDistrict, setNewDistrict] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newPincode, setNewPincode] = useState("");
  const [newHearAbout, setNewHearAbout] = useState("");
  const [newReferralName, setNewReferralName] = useState("");
  const [previewOfferApp, setPreviewOfferApp] = useState<Application | null>(null);

  const handleApplyNewCoupon = async () => {
    if (!newCouponCode.trim()) return;
    setValidatingNewCoupon(true);
    try {
      const result = await validateCoupon(newCouponCode.trim(), newDomain || undefined);
      if (result.valid) {
        setNewCouponApplied({ code: result.code!, discount: result.discountType === "percentage" ? `${result.discountValue}% OFF` : `₹${result.discountValue} OFF` });
        toast.success(`Coupon applied! ${result.discountType === "percentage" ? `${result.discountValue}%` : `₹${result.discountValue}`} discount`);
      } else {
        setNewCouponApplied(null);
        toast.error(result.error || "Invalid coupon");
      }
    } catch {
      toast.error("Failed to validate coupon");
      setNewCouponApplied(null);
    } finally {
      setValidatingNewCoupon(false);
    }
  };

  const handleRemoveNewCoupon = () => {
    setNewCouponCode("");
    setNewCouponApplied(null);
  };

  const handleApplyNewDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain) return toast.error("Please select a domain");

    // Location & Discovery validation
    if (!newState) return toast.error("State / Union Territory is required");
    if (!newDistrict) return toast.error("District is required");
    if (!newCity.trim()) return toast.error("City / Town is required");
    if (!/^\d{6}$/.test(newPincode)) {
      return toast.error("PIN Code must be exactly 6 digits");
    }
    if (!newHearAbout) return toast.error("Please select how you heard about us");
    if ((newHearAbout === "Friend / Classmate" || newHearAbout === "Existing Skyrovix Intern") && !newReferralName.trim()) {
      return toast.error("Referral Name is required for selected referral source");
    }
    
    // Check if already enrolled in this domain and active/pending
    const alreadyEnrolled = appsList?.some(a => a.domain === newDomain && (a.status === "ongoing" || a.status === "approved" || a.status === "pending"));
    if (alreadyEnrolled) {
      return toast.error("You are already enrolled or have a pending application in this domain!");
    }

    setSubmittingNewApp(true);
    try {
      const intern_id = generateInternId();
      const dur = durationConfig(newDuration);
      const payload: Record<string, any> = {
        user_id: user!.id,
        domain: newDomain,
        duration: newDuration,
        total_tasks: dur?.tasks ?? 5,
        intern_id,
        full_name: app?.full_name || user?.user_metadata?.full_name || "",
        email: user?.email || app?.email || "",
        phone: app?.phone ?? "",
        college: app?.college ?? "",
        course: app?.course ?? "",
        year: app?.year ?? "",
        photo_url: app?.photo_url ?? null,
        coupon_code: newCouponApplied?.code ?? null,
        status: "approved",
        submission_status: "in_progress",
        offer_issued_at: new Date().toISOString(),
        email_status: "pending",
        country: newCountry,
        state: newState,
        district: newDistrict,
        city: newCity,
        pincode: newPincode,
        hear_about: newHearAbout,
        referral_name: (newHearAbout === "Friend / Classmate" || newHearAbout === "Existing Skyrovix Intern") ? newReferralName : null,
      };

      const { error: insertError } = await (supabase.from("applications" as any) as any).insert(payload);
      if (insertError) throw insertError;

      // Invalidate queries to refresh list
      qc.invalidateQueries({ queryKey: ["my-applications", user?.id] });
      
      const studentEmail = (user?.email || payload.email || "").trim();
      const domainObj = getDomain(newDomain);
      const domainName = domainObj?.name ?? newDomain;

      if (studentEmail) {
        toast.loading(`Sending your Offer Letter to ${studentEmail}...`, { id: "offer-letter-delivery" });
        try {
          const { sendOfferLetterEmail } = await import("@/lib/email-helpers");
          const result = await sendOfferLetterEmail({
            to: studentEmail,
            studentName: payload.full_name,
            studentId: user!.id,
            internId: intern_id,
            domainName,
            duration: newDuration,
          });
          if (result.success) {
            await (supabase.from("applications" as any) as any).update({
              email_status: "sent",
              email_sent_at: new Date().toISOString(),
              email_error: null,
              offer_issued_at: new Date().toISOString(),
            }).eq("intern_id", intern_id);
            qc.invalidateQueries({ queryKey: ["my-applications", user?.id] });
            toast.success("Application submitted successfully! Your Offer Letter has been sent to your registered email address.", { id: "offer-letter-delivery", duration: 8000 });
          } else {
            console.warn("[Email] Delivery warning:", result.error);
            await (supabase.from("applications" as any) as any).update({
              email_status: "failed",
              email_error: result.error || "Email delivery failed",
            }).eq("intern_id", intern_id);
            toast.success("Application submitted successfully! You can view and download your Offer Letter from your Dashboard.", { id: "offer-letter-delivery", duration: 8000 });
          }
        } catch (e: any) {
          console.warn("Failed to send offer letter email for new domain:", e);
          await (supabase.from("applications" as any) as any).update({
            email_status: "failed",
            email_error: e?.message || "Email delivery failed",
          }).eq("intern_id", intern_id);
          toast.success("Application submitted successfully! You can view and download your Offer Letter from your Dashboard.", { id: "offer-letter-delivery", duration: 8000 });
        }
      } else {
        toast.success("Application submitted successfully! Your Offer Letter has been sent to your registered email address.", { duration: 8000 });
      }

      // Reset form
      setNewDomain("");
      setNewDuration(1);
      setNewCouponCode("");
      setNewCouponApplied(null);
      setNewCountry("India");
      setNewState("");
      setNewDistrict("");
      setNewCity("");
      setNewPincode("");
      setNewHearAbout("");
      setNewReferralName("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit application");
    } finally {
      setSubmittingNewApp(false);
    }
  };

  // Auto-apply coupon from application record
  useEffect(() => {
    if (app?.coupon_code && !autoApplied && !couponResult) {
      setAutoApplied(true);
      setCouponCode(app.coupon_code);
      validateCoupon(app.coupon_code, app.domain).then((result) => {
        if (result.valid) setCouponResult(result);
      });
    }
  }, [app?.coupon_code, app?.domain, autoApplied]);

  // No auto-certificate generation — certificate is only issued after admin approval

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const result = await validateCoupon(couponCode.trim(), app?.domain);
      if (result.valid) {
        setCouponResult(result);
        toast.success(`Coupon applied! You save ₹${result.discountAmount}`);
      } else {
        setCouponResult(null);
        toast.error(result.error || "Invalid coupon");
      }
    } catch {
      toast.error("Failed to validate coupon");
      setCouponResult(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponResult(null);
  };

  const handlePaymentSubmit = async () => {
    if (!app || !utrNumber.trim()) return;
    setSubmittingPayment(true);
    try {
      let screenshotUrl: string | null = null;
      if (paymentScreenshot) {
        try {
          const ext = paymentScreenshot.name.split(".").pop() ?? "png";
          const path = `${user!.id}/${Date.now()}.${ext}`;
          const { error: uploadErr } = await supabase.storage.from("payment-screenshots").upload(path, paymentScreenshot);
          if (uploadErr) throw uploadErr;
          const { data: urlData } = supabase.storage.from("payment-screenshots").getPublicUrl(path);
          screenshotUrl = urlData.publicUrl;
        } catch (uploadErr: any) {
          console.error("Screenshot upload failed:", uploadErr);
          toast.warning("Screenshot upload failed, but payment will still be submitted.");
        }
      }
      const { error } = await (supabase.from("payments" as any) as any).insert({
        application_id: app.id,
        utr_number: utrNumber.trim(),
        screenshot_url: screenshotUrl,
        amount: couponResult?.finalAmount ?? PAYMENT.amount,
        coupon_code: couponResult?.code ?? null,
        discount_amount: couponResult?.discountAmount ?? 0,
        status: "pending",
      });
      if (error) throw error;
      toast.success("Payment submitted successfully! Awaiting verification.");
      setUtrNumber("");
      setPaymentScreenshot(null);
      setCouponCode("");
      setCouponResult(null);
      qc.invalidateQueries({ queryKey: ["all-payments"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to submit payment");
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Only creates a free payment record - certificate is generated by admin on approval
  const doFreeCertificate = async (coupon: CouponResult, applicationId: string) => {
    try {
      const { data: existingPay } = await (supabase.from("payments" as any) as any).select("id").eq("application_id", applicationId).maybeSingle();
      if (!existingPay) {
        const { error: payErr } = await (supabase.from("payments" as any) as any).insert({
          application_id: applicationId,
          utr_number: "FREE_COUPON",
          screenshot_url: null,
          amount: 0,
          coupon_code: coupon.code,
          discount_amount: coupon.discountAmount,
          status: "verified",
          verified_at: new Date().toISOString(),
        });
        if (payErr) throw payErr;
      }
      toast.success("Free internship applied!");
      qc.invalidateQueries({ queryKey: ["all-payments"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to process free internship");
    }
  };

  const [submittingInternship, setSubmittingInternship] = useState(false);

  const handleSubmitInternship = async () => {
    if (!app) return;
    setSubmittingInternship(true);
    try {
      const { error } = await (supabase
        .from("applications") as any)
        .update({
          submission_status: "submitted",
          submitted_at: new Date().toISOString(),
        })
        .eq("id", app.id);
      if (error) throw error;
      toast.success("Internship submitted for verification!");
      qc.invalidateQueries({ queryKey: ["my-applications"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to submit internship");
    } finally {
      setSubmittingInternship(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };  if (authLoading || isLoading) return <LoadingSkeleton />;

  const renderContent = () => {
    if (!appsList?.length || !app) {
      if (active === "profile") {
        return (
          <div className="space-y-6">
            <DashboardHero badge="Profile" title="Your Profile" description="Manage your personal details, photo, and internship information." icon={User} />
            <div className="rounded-3xl border border-dashed border-border/50 bg-white/40 p-12 text-center backdrop-blur-xl dark:bg-slate-900/40">
              <User className="size-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-base font-bold text-foreground">Profile Uninitialized</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">Please apply for a virtual internship first to initialize your profile details.</p>
              <Button size="sm" className="mt-5 brand-gradient text-white border-0 rounded-2xl px-5 h-10 font-medium" onClick={() => navigate({ search: { tab: "overview" } as any })}>Go to Overview</Button>
            </div>
          </div>
        );
      }
      if (active === "tasks" || active === "certificates") {
        return (
          <div className="space-y-6">
            <DashboardHero
              badge={active === "tasks" ? "My Tasks" : "Certificates"}
              title={active === "tasks" ? "Internship Tasks" : "Your Certificates"}
              description={active === "tasks" ? "Track and complete your internship tasks with mentor feedback." : "View and download your verified internship certificates."}
              icon={active === "tasks" ? ListChecks : Award}
            />
            <div className="rounded-3xl border border-dashed border-border/50 bg-white/40 p-12 text-center backdrop-blur-xl dark:bg-slate-900/40">
              <Briefcase className="size-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-base font-bold text-foreground">No Internships Active</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">You do not have any active internships. Apply for an internship domain to unlock tasks.</p>
              <Button size="sm" className="mt-5 brand-gradient text-white border-0 rounded-2xl px-5 h-10 font-medium" onClick={() => navigate({ search: { tab: "overview" } as any })}>Go to Overview</Button>
            </div>
          </div>
        );
      }
      return (
        <AnimatedSection>
          <WelcomeDashboard
            user={user}
            onCreated={() => qc.invalidateQueries()}
          />
        </AnimatedSection>
      );
    }

    if (active === "overview" || active === "tasks") {
      if (detailView?.type === "app") {
        const da = appsList?.find((a) => a.id === detailView.id);
        if (!da) {
          return (
            <div className="space-y-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">Internship details not found.</p>
              <Button variant="outline" size="sm" onClick={() => setDetailView(null)}>Back to Overview</Button>
            </div>
          );
        }
        const dd = getDomain(da.domain);
        const daSubs = allAppSubmissions?.filter((s: any) => s.application_id === da.id) ?? [];
        const daApproved = daSubs.filter((s: any) => s.status === "approved").length;
        const daTotal = allTasksByDomain?.[da.domain]?.length ?? 5;
        const daCert = allAppCerts?.find((c: any) => c.application_id === da.id) ?? null;
        const daPayment = allPayments?.find((p: any) => p.application_id === da.id) ?? null;
        
        const daSubmissionStatus = da.submission_status ?? "in_progress";
        const hasCouponDa = Boolean(
          (da.coupon_code && da.coupon_code.trim() !== "") ||
          (daPayment && ((daPayment as any).coupon_code || daPayment.utr_number === "FREE_COUPON" || daPayment.amount === 0))
        );
        const daSteps = hasCouponDa
          ? [
              { label: "Application Submitted", done: true },
              { label: "Tasks Completed & Approved", done: daApproved >= daTotal },
              { label: "Certificate Issued", done: !!daCert },
            ]
          : [
              { label: "Application Submitted", done: true },
              { label: "Tasks Completed & Approved", done: daApproved >= daTotal },
              { label: "Payment Verification (₹100)", done: daPayment?.status === "verified" },
              { label: "Certificate Issued", done: !!daCert },
            ];
        const daCurrentStep = daSteps.findIndex((s) => !s.done);

        return (
          <div className="space-y-6">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground rounded-xl" onClick={() => setDetailView(null)}>
                <ChevronLeft className="size-4" /> Back to Overview
              </Button>
            </div>

            {/* Internship Title */}
            <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-white/60 p-6 sm:p-8 backdrop-blur-xl dark:bg-slate-900/60 dark:border-white/5">
              <div className="absolute -right-16 -top-16 size-48 rounded-full bg-[#07284a]/10 blur-[80px]" />
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${dd?.color ?? "from-[#07284a] to-blue-600"} text-white shadow-md`}>
                    <span className="text-2xl font-bold">{dd?.icon ?? "?"}</span>
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold">{dd?.name ?? da.domain}</h2>
                    <p className="text-xs text-muted-foreground mt-1">{da.intern_id} · {da.duration} Month{(da.duration ?? 1) > 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={`text-xs px-3 py-1.5 rounded-xl border-0 ${
                    da.status === "completed" ? "bg-emerald-500 text-white" :
                    da.status === "ongoing" ? "bg-blue-600 text-white" :
                    da.status === "approved" ? "bg-amber-500 text-white" :
                    "bg-gray-500 text-white"
                  }`}>
                    {da.status === "completed" ? "Completed" :
                     da.status === "ongoing" ? "Ongoing" :
                     da.status === "approved" ? "Approved" :
                     da.status === "pending" ? "Pending Approval" : da.status}
                  </Badge>
                  <SubmissionStatusBadge status={daSubmissionStatus} />
                </div>
              </div>
            </div>

            {/* Progress Timeline */}
            <TimelineSection steps={daSteps} currentStep={daCurrentStep} />

            {/* Grid details */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-6">
                {/* Documents & Details */}
                <IDCardSection app={da} onViewOfferLetter={() => setPreviewOfferApp(da)} />

                {/* Offer Letter View/Download Card */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl border border-border/40 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-2xl brand-gradient text-white shadow-md">
                      <FileText className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Internship Offer Letter</h4>
                      <p className="text-xs text-muted-foreground">
                        Ref: <span className="font-mono font-semibold">{da.intern_id}</span> · Issued: {new Date(da.offer_issued_at || da.created_at).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1.5 h-9 bg-white dark:bg-slate-800" onClick={() => setPreviewOfferApp(da)}>
                      <Eye className="size-3.5 text-blue-500" /> View Offer Letter
                    </Button>
                    <Button size="sm" className="brand-gradient text-white rounded-xl text-xs gap-1.5 h-9 font-bold shadow-sm" onClick={() => downloadOfferLetter({
                      fullName: da.full_name,
                      internId: da.intern_id,
                      domain: dd?.name ?? da.domain,
                      issuedAt: da.offer_issued_at || da.created_at,
                      duration: da.duration ?? 1,
                    })}>
                      <Download className="size-3.5" /> Download Offer Letter
                    </Button>
                  </div>
                </div>

                {/* Summary Panel */}
                <div className="rounded-3xl border border-border/40 bg-white/60 p-6 backdrop-blur-xl dark:bg-slate-900/60 dark:border-white/5 space-y-4">
                  <h3 className="flex items-center gap-2 font-bold text-sm"><ScrollText className="size-4 text-primary" /> Application Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="rounded-xl border border-border/30 bg-secondary/30 p-3"><p className="text-muted-foreground">Start Date</p><p className="font-semibold mt-0.5">{new Date(da.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p></div>
                    <div className="rounded-xl border border-border/30 bg-secondary/30 p-3"><p className="text-muted-foreground">End Date</p><p className="font-semibold mt-0.5">{da.completed_at ? new Date(da.completed_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</p></div>
                    <div className="rounded-xl border border-border/30 bg-secondary/30 p-3"><p className="text-muted-foreground">Approved Tasks</p><p className="font-semibold mt-0.5">{daApproved} of {daTotal}</p></div>
                    <div className="rounded-xl border border-border/30 bg-secondary/30 p-3">
                      <p className="text-muted-foreground">Payment Details</p>
                      {daPayment ? (
                        <span className={`font-semibold mt-0.5 inline-flex items-center gap-1 ${daPayment.status === "verified" ? "text-emerald-600" : "text-amber-500"}`}>
                          {daPayment.status === "verified" ? "Verified" : "Pending"}
                        </span>
                      ) : <p className="font-semibold mt-0.5 text-muted-foreground">—</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* UTR Invoice scan section if tasks done but verification pending */}
              <div className="space-y-6">
                {daCert ? (
                  <UnlockedCertificateCard app={da} cert={daCert} domain={dd} />
                ) : (
                  <LockedCertificateCard
                    app={da}
                    internApproved={daApproved}
                    internTotal={daTotal}
                    payment={daPayment}
                    couponResult={couponResult}
                    validatingCoupon={validatingCoupon}
                    couponCode={couponCode}
                    setCouponCode={setCouponCode}
                    handleApplyCoupon={handleApplyCoupon}
                    handleRemoveCoupon={handleRemoveCoupon}
                    utrNumber={utrNumber}
                    setUtrNumber={setUtrNumber}
                    paymentScreenshot={paymentScreenshot}
                    setPaymentScreenshot={setPaymentScreenshot}
                    submittingPayment={submittingPayment}
                    handlePaymentSubmit={handlePaymentSubmit}
                    certStatus={certStatus}
                    doFreeCertificate={doFreeCertificate}
                    showPaymentModal={showPaymentModal}
                    setShowPaymentModal={setShowPaymentModal}
                  />
                )}
              </div>
            </div>

            {/* Quest Log / Tasks Section for Ongoing & Approved Internships (not for completed) */}
            {da.status !== "completed" && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold font-display flex items-center gap-2 text-foreground">
                    <ListChecks className="size-5 text-primary" /> Quest Log — {dd?.name ?? da.domain} Tasks
                  </h2>
                </div>
                <TasksSection
                  domainSlug={da.domain}
                  submissions={daSubs ?? []}
                  appId={da.id}
                  duration={da.duration}
                  submissionStatus={daSubmissionStatus}
                  onChange={() => {
                    qc.invalidateQueries({ queryKey: ["all-submissions"] });
                    qc.invalidateQueries({ queryKey: ["my-applications"] });
                  }}
                />
              </div>
            )}

            {/* Task Submission history for debug/mentors */}
            {daSubs.length > 0 && (
              <div className="rounded-3xl border border-border/40 bg-white/60 p-6 backdrop-blur-xl dark:bg-slate-900/60 dark:border-white/5 space-y-4">
                <h3 className="font-bold text-sm">Task Submissions Logs</h3>
                <div className="divide-y divide-border/40 text-xs">
                  {daSubs.map((sub: any) => (
                    <div key={sub.id} className="py-2.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate">Task Reference {sub.task_id ? sub.task_id.slice(-6) : sub.id?.slice(-6) ?? "—"}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Submitted {new Date(sub.submitted_at ?? sub.created_at).toLocaleDateString("en-IN")}</p>
                      </div>
                      <Badge className={`text-[9px] font-bold ${sub.status === "approved" ? "bg-emerald-500/10 text-emerald-600/90 border-0" : "bg-amber-500/10 text-amber-500 border-0"}`}>
                        {sub.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      return (
        <div className="space-y-6">
          {/* Welcome Banner */}
          <HeroSection app={app} internApproved={internApproved} durationLimit={internTotal} cert={cert} payment={payment} setShowPaymentModal={setShowPaymentModal} onViewOfferLetter={(targetApp) => setPreviewOfferApp(targetApp)} />
          
          {/* Stats details card row */}
          <StatsCards internApproved={internApproved} internPending={internPending} durationLimit={internTotal} cert={cert} payment={payment} setShowPaymentModal={setShowPaymentModal} />
          
          {/* Stepper progress timeline */}
          <TimelineSection steps={timelineSteps} currentStep={currentStep} setShowPaymentModal={setShowPaymentModal} />

          {/* Quest Log: Active Tasks grid list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold font-display flex items-center gap-2 text-foreground">
                <ListChecks className="size-5 text-primary" /> Quest Log
              </h2>
            </div>
            <TasksSection
              domainSlug={app.domain}
              submissions={internSubmissions ?? []}
              appId={app.id}
              duration={app.duration}
              submissionStatus={submissionStatus}
              onChange={() => {
                qc.invalidateQueries({ queryKey: ["all-submissions"] });
                qc.invalidateQueries({ queryKey: ["my-applications"] });
              }}
            />
          </div>





          {submissionStatus === "approved" && (
            <div className="rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 to-white p-6 backdrop-blur-xl dark:from-emerald-950/20 dark:to-slate-900/60 dark:border-emerald-800/30">
              <div className="flex items-start gap-3">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 className="size-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Internship Approved!</h3>
                  <p className="text-sm text-muted-foreground mt-1">Your internship has been verified and approved by the admin.</p>
                </div>
              </div>
            </div>
          )}

          {submissionStatus === "rejected" && app?.rejection_reason && (
            <div className="rounded-3xl border border-red-200/60 bg-gradient-to-br from-red-50/80 to-white p-6 backdrop-blur-xl dark:from-red-950/20 dark:to-slate-900/60 dark:border-red-800/30">
              <div className="flex items-start gap-3">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-red-500/10 text-red-600">
                  <AlertCircle className="size-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Internship Needs Revision</h3>
                  <p className="text-sm text-muted-foreground mt-1">Your internship was not approved. Please review the feedback and resubmit.</p>
                  <div className="mt-3 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800/30 p-3">
                    <p className="text-xs font-semibold text-red-700">Admin Feedback:</p>
                    <p className="text-xs text-red-600 mt-1">{app.rejection_reason}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Render past/multiple domains ONLY if they have more than 1 application */}
          {appsList && appsList.length > 1 && (
            <AnimatedSection>
              <div className="flex items-center justify-between mb-4 mt-8">
                <h2 className="text-base font-display font-bold flex items-center gap-2 text-foreground">
                  <Briefcase className="size-4 text-primary" /> Other Enrolled Domains
                </h2>
              </div>
              <div className="grid gap-3">
                {appsList.filter(a => a.id !== app.id).map((a) => {
                  const d = getDomain(a.domain);
                  const aSubs = allAppSubmissions?.filter((s: any) => s.application_id === a.id) ?? [];
                  const aApproved = aSubs.filter((s: any) => s.status === "approved").length;
                  const aCert = allAppCerts?.find((c: any) => c.application_id === a.id) ?? null;
                  const appTaskCount = taskLimits[a.duration ?? 1] ?? 5;
                  return (
                    <div key={a.id} onClick={() => setDetailView({ type: "app", id: a.id })}
                      className="w-full text-left rounded-2xl border border-border/40 bg-white/60 p-4 backdrop-blur-xl transition-all hover:shadow-md hover:bg-white/80 dark:bg-slate-900/60 dark:hover:bg-slate-900/80 group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className={`grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${d?.color ?? "from-[#07284a] to-blue-600"} text-white shadow-sm`}>
                          <span className="text-lg font-bold">{d?.icon ?? "?"}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-sm text-foreground">{d?.name ?? a.domain}</p>
                            <Badge className={`text-[10px] px-2 py-0.5 rounded-md border-0 ${
                              a.status === "completed" ? "bg-emerald-600 text-white" :
                              a.status === "ongoing" ? "bg-blue-600 text-white" :
                              a.status === "approved" ? "bg-amber-500 text-white" :
                              "bg-gray-550 text-white"
                            }`}>
                              {a.status === "completed" ? "Completed" :
                               a.status === "ongoing" ? "Ongoing" :
                               a.status === "approved" ? "Approved" :
                               a.status === "pending" ? "Pending" : a.status}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">{a.intern_id} · Applied {new Date(a.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-5 text-xs text-right shrink-0">
                          <div><p className="text-muted-foreground text-[10px]">Tasks</p><p className="font-semibold text-foreground mt-0.5">{aApproved}/{appTaskCount}</p></div>
                          <div><p className="text-muted-foreground text-[10px]">Award</p><p className={`font-semibold mt-0.5 ${aCert ? "text-emerald-500 font-bold" : "text-muted-foreground"}`}>{aCert ? "Issued" : "—"}</p></div>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition shrink-0" />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border/30">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl h-8 text-xs bg-white dark:bg-slate-800 border-border/60 hover:bg-slate-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewOfferApp(a);
                          }}
                        >
                          <Eye className="mr-1.5 size-3.5 text-blue-500" /> View Offer Letter
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl h-8 text-xs bg-white dark:bg-slate-800 border-border/60 hover:bg-slate-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadOfferLetter({
                              fullName: a.full_name,
                              internId: a.intern_id,
                              domain: d?.name ?? a.domain,
                              issuedAt: a.offer_issued_at || a.created_at,
                              duration: a.duration ?? 1,
                            });
                          }}
                        >
                          <Download className="mr-1.5 size-3.5 text-emerald-500" /> Download Offer Letter
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AnimatedSection>
          )}
        </div>
      );
    }

    if (active === "certificates") {
      const isTasksDone = internTotal > 0 && internApproved >= internTotal;
      if (!cert) {
        return (
          <div className="space-y-6">
            <DashboardHero badge="Certificates" title="Your Certificates" description="Generate and view your verified internship certificates." icon={Award} />
            <LockedCertificateCard 
              app={app} 
              internApproved={internApproved} 
              internTotal={internTotal} 
              payment={payment} 
              couponResult={couponResult} 
              validatingCoupon={validatingCoupon} 
              couponCode={couponCode} 
              setCouponCode={setCouponCode} 
              handleApplyCoupon={handleApplyCoupon} 
              handleRemoveCoupon={handleRemoveCoupon} 
              utrNumber={utrNumber} 
              setUtrNumber={setUtrNumber} 
              paymentScreenshot={paymentScreenshot} 
              setPaymentScreenshot={setPaymentScreenshot} 
              submittingPayment={submittingPayment} 
              handlePaymentSubmit={handlePaymentSubmit}
              certStatus={certStatus}
              doFreeCertificate={doFreeCertificate}
              showPaymentModal={showPaymentModal}
              setShowPaymentModal={setShowPaymentModal}
            />
          </div>
        );
      }
      return (
        <div className="space-y-6">
          <DashboardHero badge="Certificates" title="Your Certificates" description="View and download your verified internship certificates." icon={Award} />
          <UnlockedCertificateCard app={app} cert={cert} domain={domain} />
          
          {/* Details Overview */}
          <div className="rounded-3xl border border-border/40 bg-white/60 p-6 backdrop-blur-xl dark:bg-slate-900/60 dark:border-white/5 space-y-4">
            <h3 className="flex items-center gap-2 font-bold text-sm"><ScrollText className="size-4 text-primary" /> Certificate Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div><p className="text-muted-foreground">Verification ID</p><p className="font-semibold mt-0.5 font-mono text-xs text-foreground">{cert.certificate_id}</p></div>
              <div><p className="text-muted-foreground">Recipient Name</p><p className="font-semibold mt-0.5 text-foreground">{app.full_name}</p></div>
              <div><p className="text-muted-foreground">Syllabus Domain</p><p className="font-semibold mt-0.5 text-foreground">{domain?.name ?? app.domain}</p></div>
              <div><p className="text-muted-foreground">Verified Date</p><p className="font-semibold mt-0.5 text-foreground">{cert.issued_at ? new Date(cert.issued_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</p></div>
            </div>
          </div>
        </div>
      );
    }

    if (active === "profile") {
      return (
        <div className="space-y-6">
          <DashboardHero badge="Profile" title="Your Profile" description="Manage your personal details, photo, and internship information." icon={User} />
          
          <ProfilePanel app={app} onChange={() => qc.invalidateQueries({ queryKey: ["my-applications", user?.id] })} />

          <IDCardSection app={app} onViewOfferLetter={(targetApp) => setPreviewOfferApp(targetApp)} />
        </div>
      );
    }

    if (active === "internships") {
      const enrolledSlugsForNew = new Set(appsList?.filter(a => a.status === "ongoing" || a.status === "approved" || a.status === "pending").map(a => a.domain) ?? []);
      const ongoingApps = appsList?.filter(a => a.status === "ongoing" || a.status === "approved" || a.status === "pending") ?? [];
      const completedAppsList = appsList?.filter(a => a.status === "completed") ?? [];

      // Check if an internship detail is selected
      const selectedId = detailView?.type === "app" ? detailView.id : null;
      const selectedApp = selectedId ? appsList?.find(a => a.id === selectedId) ?? null : null;

      if (selectedApp) {
        const da = selectedApp;
        const dd = getDomain(da.domain);
        const daSubs = allAppSubmissions?.filter((s: any) => s.application_id === da.id) ?? [];
        const daApproved = daSubs.filter((s: any) => s.status === "approved").length;
        const daTotal = allTasksByDomain?.[da.domain]?.length ?? 5;
        const daCert = allAppCerts?.find((c: any) => c.application_id === da.id) ?? null;
        const daPayment = allPayments?.find((p: any) => p.application_id === da.id) ?? null;
        const daSubmissionStatus = da.submission_status ?? "in_progress";
        const hasCouponDa2 = Boolean(
          (da.coupon_code && da.coupon_code.trim() !== "") ||
          (daPayment && ((daPayment as any).coupon_code || daPayment.utr_number === "FREE_COUPON" || daPayment.amount === 0))
        );
        const daSteps = hasCouponDa2
          ? [
              { label: "Application Submitted", done: true },
              { label: "Tasks Completed & Approved", done: daApproved >= daTotal },
              { label: "Certificate Issued", done: !!daCert },
            ]
          : [
              { label: "Application Submitted", done: true },
              { label: "Tasks Completed & Approved", done: daApproved >= daTotal },
              { label: "Payment Verification (₹100)", done: daPayment?.status === "verified" },
              { label: "Certificate Issued", done: !!daCert },
            ];
        const daCurrentStep = daSteps.findIndex((s) => !s.done);

        return (
          <div className="space-y-6">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground rounded-xl" onClick={() => setDetailView(null)}>
                <ChevronLeft className="size-4" /> Back to Internships
              </Button>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-white/60 p-6 sm:p-8 backdrop-blur-xl dark:bg-slate-900/60 dark:border-white/5">
              <div className="absolute -right-16 -top-16 size-48 rounded-full bg-[#07284a]/10 blur-[80px]" />
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${dd?.color ?? "from-[#07284a] to-blue-600"} text-white shadow-md`}>
                    <span className="text-2xl font-bold">{dd?.icon ?? "?"}</span>
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold">{dd?.name ?? da.domain}</h2>
                    <p className="text-xs text-muted-foreground mt-1">{da.intern_id} · {da.duration} Month{(da.duration ?? 1) > 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={`text-xs px-3 py-1.5 rounded-xl border-0 ${da.status === "completed" ? "bg-emerald-500 text-white" : da.status === "ongoing" ? "bg-blue-600 text-white" : da.status === "approved" ? "bg-amber-500 text-white" : "bg-gray-500 text-white"}`}>
                    {da.status === "completed" ? "Completed" : da.status === "ongoing" ? "Ongoing" : da.status === "approved" ? "Approved" : da.status === "pending" ? "Pending Approval" : da.status}
                  </Badge>
                  <SubmissionStatusBadge status={daSubmissionStatus} />
                </div>
              </div>
            </div>
            <TimelineSection steps={daSteps} currentStep={daCurrentStep} />
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <IDCardSection app={da} onViewOfferLetter={(targetApp) => setPreviewOfferApp(targetApp)} />

                {/* Offer Letter View/Download Card */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl border border-border/40 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-2xl brand-gradient text-white shadow-md">
                      <FileText className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Internship Offer Letter</h4>
                      <p className="text-xs text-muted-foreground">
                        Ref: <span className="font-mono font-semibold">{da.intern_id}</span> · Issued: {new Date(da.offer_issued_at || da.created_at).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1.5 h-9 bg-white dark:bg-slate-800" onClick={() => setPreviewOfferApp(da)}>
                      <Eye className="size-3.5 text-blue-500" /> View Offer Letter
                    </Button>
                    <Button size="sm" className="brand-gradient text-white rounded-xl text-xs gap-1.5 h-9 font-bold shadow-sm" onClick={() => downloadOfferLetter({
                      fullName: da.full_name,
                      internId: da.intern_id,
                      domain: dd?.name ?? da.domain,
                      issuedAt: da.offer_issued_at || da.created_at,
                      duration: da.duration ?? 1,
                    })}>
                      <Download className="size-3.5" /> Download Offer Letter
                    </Button>
                  </div>
                </div>

                <div className="rounded-3xl border border-border/40 bg-white/60 p-6 backdrop-blur-xl dark:bg-slate-900/60 dark:border-white/5 space-y-4">
                  <h3 className="flex items-center gap-2 font-bold text-sm"><ScrollText className="size-4 text-primary" /> Application Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="rounded-xl border border-border/30 bg-secondary/30 p-3"><p className="text-muted-foreground">Start Date</p><p className="font-semibold mt-0.5">{new Date(da.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p></div>
                    <div className="rounded-xl border border-border/30 bg-secondary/30 p-3"><p className="text-muted-foreground">End Date</p><p className="font-semibold mt-0.5">{da.completed_at ? new Date(da.completed_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</p></div>
                    <div className="rounded-xl border border-border/30 bg-secondary/30 p-3"><p className="text-muted-foreground">Approved Tasks</p><p className="font-semibold mt-0.5">{daApproved} of {daTotal}</p></div>
                    <div className="rounded-xl border border-border/30 bg-secondary/30 p-3">
                      <p className="text-muted-foreground">Payment Details</p>
                      {daPayment ? (
                        <span className={`font-semibold mt-0.5 inline-flex items-center gap-1 ${daPayment.status === "verified" ? "text-emerald-600" : "text-amber-500"}`}>{daPayment.status === "verified" ? "Verified" : "Pending"}</span>
                      ) : <p className="font-semibold mt-0.5 text-muted-foreground">—</p>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                {daCert ? (
                  <UnlockedCertificateCard app={da} cert={daCert} domain={dd} />
                ) : (
                  <LockedCertificateCard
                    app={da} internApproved={daApproved} internTotal={daTotal} payment={daPayment}
                    couponResult={couponResult} validatingCoupon={validatingCoupon} couponCode={couponCode}
                    setCouponCode={setCouponCode} handleApplyCoupon={handleApplyCoupon}
                    handleRemoveCoupon={handleRemoveCoupon} utrNumber={utrNumber}
                    setUtrNumber={setUtrNumber} paymentScreenshot={paymentScreenshot}
                    setPaymentScreenshot={setPaymentScreenshot} submittingPayment={submittingPayment}
                    handlePaymentSubmit={handlePaymentSubmit} certStatus={certStatus}
                    doFreeCertificate={doFreeCertificate}
                    showPaymentModal={showPaymentModal}
                    setShowPaymentModal={setShowPaymentModal}
                  />
                )}
              </div>
            </div>

            {/* Quest Log / Tasks Section for Ongoing & Approved Internships (not for completed) */}
            {da.status !== "completed" && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold font-display flex items-center gap-2 text-foreground">
                    <ListChecks className="size-5 text-primary" /> Quest Log — {dd?.name ?? da.domain} Tasks
                  </h2>
                </div>
                <TasksSection
                  domainSlug={da.domain}
                  submissions={daSubs ?? []}
                  appId={da.id}
                  duration={da.duration}
                  submissionStatus={daSubmissionStatus}
                  onChange={() => {
                    qc.invalidateQueries({ queryKey: ["all-submissions"] });
                    qc.invalidateQueries({ queryKey: ["my-applications"] });
                  }}
                />
              </div>
            )}

            {daSubs.length > 0 && (
              <div className="rounded-3xl border border-border/40 bg-white/60 p-6 backdrop-blur-xl dark:bg-slate-900/60 dark:border-white/5 space-y-4">
                <h3 className="font-bold text-sm">Task Submissions Logs</h3>
                <div className="divide-y divide-border/40 text-xs">
                  {daSubs.map((sub: any) => (
                    <div key={sub.id} className="py-2.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate">Task Reference {sub.task_id ? sub.task_id.slice(-6) : sub.id?.slice(-6) ?? "—"}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Submitted {new Date(sub.submitted_at ?? sub.created_at).toLocaleDateString("en-IN")}</p>
                      </div>
                      <Badge className={`text-[9px] font-bold ${sub.status === "approved" ? "bg-emerald-500/10 text-emerald-600/90 border-0" : "bg-amber-500/10 text-amber-500 border-0"}`}>{sub.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      return (
        <div className="space-y-6">
          <DashboardHero badge="My Internships" title="My Internships" description="View all your enrolled internship domains, track progress, and apply for new internship streams." icon={Briefcase} />

          {/* Current Internships */}
          {ongoingApps.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1 flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Current Internships
              </h4>
              <div className="space-y-3">
                {ongoingApps.map((a) => {
                  const d = getDomain(a.domain);
                  const aSubs = allAppSubmissions?.filter((s: any) => s.application_id === a.id) ?? [];
                  const aApproved = aSubs.filter((s: any) => s.status === "approved").length;
                  const aTotal = taskLimits[a.duration ?? 1] ?? 5;
                  const pct = aTotal > 0 ? Math.round((aApproved / aTotal) * 100) : 0;
                  const aCert = allAppCerts?.find((c: any) => c.application_id === a.id);
                  return (
                    <div key={a.id} onClick={() => setDetailView({ type: "app", id: a.id })} className="w-full text-left rounded-3xl border border-emerald-200/60 bg-gradient-to-r from-emerald-50/50 to-white/60 p-5 backdrop-blur-xl dark:from-emerald-950/20 dark:to-slate-900/60 dark:border-emerald-800/30 shadow-sm hover:shadow-md hover:border-emerald-300/80 transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer">
                      <div className="flex items-start gap-4">
                        <div className={`grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${d?.color ?? "from-[#07284a] to-blue-600"} text-white shadow-md text-2xl`}>
                          {d?.icon ?? "🎓"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-bold text-base text-foreground">{d?.name ?? a.domain}</h3>
                            <Badge className="text-[10px] px-2 py-0.5 rounded-lg border-0 bg-emerald-500 text-white">{a.status === "ongoing" ? "Active" : a.status}</Badge>
                            {aCert && <Badge className="text-[10px] px-2 py-0.5 rounded-lg border-0 bg-emerald-600 text-white">Certified</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">ID: <span className="font-mono font-bold">{a.intern_id}</span> · {a.duration ?? 1} month{(a.duration ?? 1) > 1 ? "s" : ""} · Applied {new Date(a.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs font-bold text-foreground shrink-0">{aApproved}/{aTotal} tasks</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-emerald-200/40 dark:border-emerald-800/20">
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl h-8 text-xs bg-white dark:bg-slate-800 border-border/60 hover:bg-slate-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewOfferApp(a);
                              }}
                            >
                              <Eye className="mr-1.5 size-3.5 text-blue-500" /> View Offer Letter
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl h-8 text-xs bg-white dark:bg-slate-800 border-border/60 hover:bg-slate-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadOfferLetter({
                                  fullName: a.full_name,
                                  internId: a.intern_id,
                                  domain: d?.name ?? a.domain,
                                  issuedAt: a.offer_issued_at || a.created_at,
                                  duration: a.duration ?? 1,
                                });
                              }}
                            >
                              <Download className="mr-1.5 size-3.5 text-emerald-500" /> Download Offer Letter
                            </Button>
                          </div>
                        </div>
                        <ChevronRight className="size-5 text-muted-foreground/40 group-hover:text-muted-foreground/80 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past Internships */}
          {completedAppsList.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Past Internships</h4>
              <div className="space-y-3">
                {completedAppsList.map((a) => {
                  const d = getDomain(a.domain);
                  const aCert = allAppCerts?.find((c: any) => c.application_id === a.id);
                  return (
                    <div key={a.id} onClick={() => setDetailView({ type: "app", id: a.id })} className="w-full text-left rounded-3xl border border-border/40 bg-white/50 p-5 backdrop-blur-xl dark:bg-slate-900/50 dark:border-white/5 shadow-sm hover:shadow-md hover:border-border/60 transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer">
                      <div className="flex items-start gap-4">
                        <div className={`grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${d?.color ?? "from-[#07284a] to-blue-600"} text-white shadow-md text-2xl opacity-70`}>
                          {d?.icon ?? "🎓"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-bold text-base text-foreground">{d?.name ?? a.domain}</h3>
                            <Badge className="text-[10px] px-2 py-0.5 rounded-lg border-0 bg-slate-400 text-white">Completed</Badge>
                            {aCert && <Badge className="text-[10px] px-2 py-0.5 rounded-lg border-0 bg-emerald-600 text-white">Certified</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">ID: <span className="font-mono font-bold">{a.intern_id}</span> · {a.duration ?? 1} month{(a.duration ?? 1) > 1 ? "s" : ""} · {a.completed_at ? `Completed ${new Date(a.completed_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}` : ""}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border/30">
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl h-8 text-xs bg-white dark:bg-slate-800 border-border/60 hover:bg-slate-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewOfferApp(a);
                              }}
                            >
                              <Eye className="mr-1.5 size-3.5 text-blue-500" /> View Offer Letter
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl h-8 text-xs bg-white dark:bg-slate-800 border-border/60 hover:bg-slate-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadOfferLetter({
                                  fullName: a.full_name,
                                  internId: a.intern_id,
                                  domain: d?.name ?? a.domain,
                                  issuedAt: a.offer_issued_at || a.created_at,
                                  duration: a.duration ?? 1,
                                });
                              }}
                            >
                              <Download className="mr-1.5 size-3.5 text-emerald-500" /> Download Offer Letter
                            </Button>
                          </div>
                        </div>
                        <ChevronRight className="size-5 text-muted-foreground/40 group-hover:text-muted-foreground/80 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!appsList?.length && (
            <div className="rounded-3xl border border-dashed border-border/50 bg-white/40 p-8 text-center backdrop-blur-xl dark:bg-slate-900/40">
              <Briefcase className="size-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-base font-bold">No Internships Yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Use the form below to apply for your first internship.</p>
            </div>
          )}

          {/* ─── Apply for New Internship Form ─── */}
          <div className="rounded-3xl border border-[#07284a]/20 bg-gradient-to-br from-[#07284a]/5 to-blue-400/5 backdrop-blur-xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="grid size-10 shrink-0 place-items-center rounded-2xl brand-gradient text-white shadow-md">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Apply for New Internship Domain</h3>
                <p className="text-xs text-muted-foreground">Fill in the details to start a new internship stream instantly.</p>
              </div>
            </div>

            <form onSubmit={handleApplyNewDomain} className="space-y-5">
              {/* Domain Selector */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-bold text-foreground">Select Internship Domain *</Label>
                <Select value={newDomain} onValueChange={setNewDomain} required>
                  <SelectTrigger className="rounded-xl h-11 bg-background/50 border-border/60">
                    <SelectValue placeholder="Choose a learning stream..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DOMAINS.map((d) => {
                      const isEnrolled = enrolledSlugsForNew.has(d.slug);
                      return (
                        <SelectItem key={d.slug} value={d.slug} disabled={isEnrolled}>
                          {d.icon} {d.name} {isEnrolled && "(Already Enrolled)"}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-bold text-foreground">Internship Duration *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setNewDuration(d.value)}
                      className={`rounded-2xl border p-3.5 text-left transition-all ${
                        newDuration === d.value
                          ? "border-[#07284a] bg-[#07284a]/5 dark:border-blue-500 dark:bg-blue-500/10 ring-1 ring-[#07284a]/10"
                          : "border-border/60 bg-background/30 hover:border-border"
                      }`}
                    >
                      <p className="text-xs sm:text-sm font-extrabold text-foreground">{d.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{d.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Details */}
              <div className="border-t border-border/40 pt-5">
                <h4 className="text-xs sm:text-sm font-extrabold text-foreground mb-3 flex items-center gap-1.5">📍 Location Details</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-bold text-foreground">Country *</Label>
                    <Select value={newCountry} onValueChange={setNewCountry} required>
                      <SelectTrigger className="rounded-xl h-11 bg-background/50 border-border/60">
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="India">🇮🇳 India</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-bold text-foreground">State / Union Territory *</Label>
                    <SearchableSelect
                      options={INDIA_STATES}
                      value={newState}
                      onChange={(val) => { setNewState(val); setNewDistrict(""); }}
                      placeholder="Select State / UT"
                      searchPlaceholder="Search State..."
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3 mt-4">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-bold text-foreground">District *</Label>
                    <SearchableSelect
                      options={newState ? STATE_DISTRICTS[newState] || [] : []}
                      value={newDistrict}
                      onChange={setNewDistrict}
                      placeholder="Select District"
                      searchPlaceholder="Search District..."
                      disabled={!newState}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-bold text-foreground">City / Town *</Label>
                    <Input
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      required
                      placeholder="Enter your City / Town"
                      className="h-11 rounded-xl bg-background/50 border-border/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-bold text-foreground">PIN Code *</Label>
                    <Input
                      type="number"
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      required
                      placeholder="6 Digit PIN Code"
                      className="h-11 rounded-xl bg-background/50 border-border/60"
                    />
                  </div>
                </div>
              </div>

              {/* Discovery Source */}
              <div className="border-t border-border/40 pt-5">
                <h4 className="text-xs sm:text-sm font-extrabold text-foreground mb-3 flex items-center gap-1.5">❓ Discovery</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-bold text-foreground">How did you hear about Skyrovix? *</Label>
                    <SearchableSelect
                      options={["Google Search","Instagram","LinkedIn","YouTube","Facebook","WhatsApp","Telegram","Friend / Classmate","Existing Skyrovix Intern","Other"]}
                      value={newHearAbout}
                      onChange={setNewHearAbout}
                      placeholder="Select Source"
                      searchPlaceholder="Search options..."
                    />
                  </div>
                  {(newHearAbout === "Friend / Classmate" || newHearAbout === "Existing Skyrovix Intern") && (
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-bold text-foreground">Referral Name *</Label>
                      <Input
                        value={newReferralName}
                        onChange={(e) => setNewReferralName(e.target.value)}
                        required
                        placeholder="Enter friend/intern's full name"
                        className="h-11 rounded-xl bg-background/50 border-border/60"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Coupon Code */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-bold text-foreground">Promo / Coupon Code (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    disabled={!!newCouponApplied}
                    className="rounded-xl h-11 bg-background/50 border-border/60"
                  />
                  {newCouponApplied ? (
                    <Button type="button" variant="outline" className="rounded-xl h-11 px-4 text-red-500" onClick={handleRemoveNewCoupon}>Remove</Button>
                  ) : (
                    <Button type="button" variant="outline" className="rounded-xl h-11 px-5" onClick={handleApplyNewCoupon} disabled={validatingNewCoupon || !newCouponCode.trim()}>
                      {validatingNewCoupon ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
                    </Button>
                  )}
                </div>
                {newCouponApplied && (
                  <p className="text-xs text-emerald-600 font-bold mt-1">Coupon applied: {newCouponApplied.discount}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full brand-gradient text-white border-0 rounded-2xl h-12 text-sm font-extrabold shadow-lg shadow-[#07284a]/15 hover:shadow-xl hover:shadow-[#07284a]/25 transition-all"
                disabled={submittingNewApp}
              >
                {submittingNewApp ? (
                  <span className="flex items-center gap-2 justify-center">
                    <Loader2 className="size-4 animate-spin" /> Submitting Application...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    Apply & Launch Internship <ArrowRight className="size-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>
      );
    }

    if (active === "payment") {
      const isPaymentDone = payment?.status === "verified";
      return (
        <div className="space-y-6">
          <DashboardHero badge="Payment" title="Payment" description="View your payment status and submit payment proof for your certificate." icon={CreditCard} />

          {/* Status Banner */}
          {isPaymentDone ? (
            <div className="rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 to-white p-6 backdrop-blur-xl dark:from-emerald-950/20 dark:to-slate-900/60 dark:border-emerald-800/30">
              <div className="flex items-center gap-3">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 className="size-6" />
                </div>
                <div>
                  <p className="font-bold text-base text-foreground">Payment Verified</p>
                  <p className="text-xs text-muted-foreground">Your payment has been received and verified.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs pt-4 mt-4 border-t border-emerald-200/40">
                <div><p className="text-muted-foreground">Status</p><p className="font-bold text-emerald-600 mt-0.5 capitalize">{payment?.status}</p></div>
                <div><p className="text-muted-foreground">UTR / Reference</p><p className="font-bold font-mono mt-0.5">{payment?.utr_number || "—"}</p></div>
                <div><p className="text-muted-foreground">Verified On</p><p className="font-bold mt-0.5">{payment?.verified_at ? new Date(payment.verified_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</p></div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-white p-6 backdrop-blur-xl dark:from-amber-950/20 dark:to-slate-900/60 dark:border-amber-800/30">
              <div className="flex items-center gap-3">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
                  <Clock className="size-6" />
                </div>
                <div>
                  <p className="font-bold text-base text-foreground">Payment Pending</p>
                  <p className="text-xs text-muted-foreground">Complete your certification fee payment to proceed with verification.</p>
                </div>
              </div>
            </div>
          )}

          {/* QR Code & Payment Form — always visible */}
          <div className="rounded-3xl border border-border/40 bg-white/60 p-6 sm:p-8 backdrop-blur-xl dark:bg-slate-900/60 dark:border-white/5 space-y-6">
            <div>
              <h3 className="flex items-center gap-2 font-bold text-base text-foreground"><CreditCard className="size-5 text-primary" /> Certificate Fee Payment</h3>
              <p className="text-xs text-muted-foreground mt-1">Scan the QR code or use the UPI ID below to pay the certification fee.</p>
            </div>

            <div className="grid md:grid-cols-12 gap-8 items-start">
              {/* QR Code Section */}
              <div className="md:col-span-5 rounded-2xl border border-border/30 bg-gradient-to-br from-slate-50/50 to-white p-6 flex flex-col items-center text-center gap-4 relative overflow-hidden shadow-sm dark:from-slate-800/30 dark:to-slate-900/30">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Scan QR Code via GPay, PhonePe, Paytm or BHIM</span>

                {/* High Contrast Clean QR Code Container for Google Pay & All UPI Apps */}
                <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200 flex items-center justify-center">
                  <QRCodeSVG 
                    value={`upi://pay?pa=${PAYMENT.upiId}&pn=${encodeURIComponent(PAYMENT.payeeName)}&am=${couponResult?.valid ? couponResult.finalAmount : PAYMENT.amount}&cu=INR&tn=${encodeURIComponent("Certificate Fee")}`} 
                    size={220} 
                    includeMargin={true}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#000000"
                    style={{ width: "100%", maxWidth: "220px", height: "auto" }} 
                  />
                </div>

                {/* Tap to Pay Direct Button */}
                <a 
                  href={`upi://pay?pa=${PAYMENT.upiId}&pn=${encodeURIComponent(PAYMENT.payeeName)}&am=${couponResult?.valid ? couponResult.finalAmount : PAYMENT.amount}&cu=INR&tn=${encodeURIComponent("Certificate Fee")}`}
                  className="w-full max-w-[220px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <ExternalLink className="size-3.5" /> Pay via GPay / UPI App
                </a>

                <div className="flex flex-col items-center gap-1.5 w-full pt-1 border-t border-border/10">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Supported Payment Apps</span>
                  <div className="flex gap-1.5 text-[10px] font-bold flex-wrap justify-center">
                    <span className="bg-blue-600/10 text-blue-600 px-2.5 py-1 rounded-md border border-blue-600/10">GPay</span>
                    <span className="bg-purple-600/10 text-purple-600 px-2.5 py-1 rounded-md border border-purple-600/10">PhonePe</span>
                    <span className="bg-sky-600/10 text-sky-600 px-2.5 py-1 rounded-md border border-sky-600/10">Paytm</span>
                    <span className="bg-emerald-600/10 text-emerald-600 px-2.5 py-1 rounded-md border border-emerald-600/10">BHIM UPI</span>
                  </div>
                </div>

                <div className="space-y-1.5 w-full pt-2 border-t border-border/10">
                  <p className="text-[10px] text-muted-foreground">UPI ID</p>
                  <p className="font-mono font-bold text-sm text-foreground bg-secondary/30 px-3 py-1.5 rounded-lg select-all">{PAYMENT.upiId}</p>
                  <p className="text-[11px] text-muted-foreground">Payee: <span className="font-semibold text-foreground">{PAYMENT.payeeName}</span></p>
                </div>

                <Button size="sm" variant="outline" className="rounded-xl h-8 text-[11px] border-border/50 gap-1.5 shadow-sm bg-white w-full max-w-[220px]"
                  onClick={() => {
                    navigator.clipboard.writeText(PAYMENT.upiId);
                    toast.success("UPI ID copied to clipboard!");
                  }}>
                  <Copy className="size-3.5" /> Copy UPI ID
                </Button>
              </div>

              {/* Payment Form */}
              <div className="md:col-span-7 space-y-5">
                {/* Fee Summary */}
                <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-slate-50/50 to-white p-5 shadow-sm dark:from-slate-800/30 dark:to-slate-900/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Certification Fee</p>
                      <p className="font-extrabold text-3xl mt-1 text-emerald-600 dark:text-emerald-400">₹{PAYMENT.amount}</p>
                    </div>
                  </div>
                  {isPaymentDone && (
                    <div className="mt-4 pt-4 border-t border-border/30 flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 className="size-4" />
                      <span className="text-xs font-bold">Payment already completed and verified</span>
                    </div>
                  )}
                </div>

                {!isPaymentDone && (
                  <>
                    {/* UTR Number Input */}
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-bold text-foreground">UPI Transaction UTR / Reference Number *</Label>
                      <Input
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        placeholder="Enter the 12-digit UTR number from your payment"
                        className="h-12 rounded-xl bg-background/50 border-border/60 text-sm font-mono"
                      />
                      <p className="text-[10px] text-muted-foreground">You can find this in your UPI app payment history</p>
                    </div>

                    {/* Payment Screenshot Upload */}
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-bold text-foreground">Payment Screenshot (Optional)</Label>
                      <div className="border-2 border-dashed border-border/40 rounded-2xl p-5 text-center hover:border-border/60 transition-colors bg-background/30">
                        <input
                          type="file"
                          accept="image/*"
                          className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                          onChange={e => setPaymentScreenshot(e.target.files?.[0] ?? null)}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      className="w-full h-12 rounded-2xl font-bold text-sm gap-2 brand-gradient text-white border-0 shadow-lg"
                      disabled={!utrNumber.trim() || submittingPayment}
                      onClick={handlePaymentSubmit}
                    >
                      {submittingPayment ? (
                        <><Loader2 className="size-4 animate-spin" /> Submitting payment details...</>
                      ) : (
                        <><CreditCard className="size-4" /> Pay Fee ₹{PAYMENT.amount} & Verify</>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }



    if (active === "help") {
      const faqs = [
        { q: "How do I submit a task?", a: "Click 'Submit Task' on any task card in the My Tasks section. Fill in the form with your GitHub link, PDF, or screenshot and click Submit for Review." },
        { q: "How long does task review take?", a: "Task reviews are typically completed within 2–5 business days. You'll receive feedback in your task card." },
        { q: "How do I get my certificate?", a: "Complete all assigned tasks and get them approved. Then go to the Certificates section to generate and download your certificate." },
        { q: "Can I apply for multiple domains?", a: "Yes! You can apply for multiple internship domains. Each domain is tracked separately with its own tasks and certificate." },
        { q: "How do I request a physical certificate?", a: "Go to Physical Certificate in the sidebar, fill in your delivery address, and submit. A nominal shipping fee applies." },
        { q: "Who do I contact for support?", a: "Reach out to us at support@skyrovix.com or use the chat button below for instant help." },
      ];
      return (
        <div className="space-y-6">
          <DashboardHero badge="Help Center" title="Help & Support" description="Find answers to common questions or reach out to our support team." icon={HelpCircle} />
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group rounded-2xl border border-border/40 bg-white/60 backdrop-blur-xl dark:bg-slate-900/60 dark:border-white/5 overflow-hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-semibold text-sm text-foreground list-none">
                  {faq.q}
                  <ChevronRight className="size-4 text-muted-foreground shrink-0 transition-transform duration-200 group-open:rotate-90" />
                </summary>
                <div className="border-t border-border/40 px-5 py-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
          <div className="rounded-3xl border border-border/40 bg-white/60 p-6 backdrop-blur-xl dark:bg-slate-900/60 dark:border-white/5 text-center space-y-3">
            <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-[#07284a] to-blue-600 text-white mx-auto shadow-lg">
              <Mail className="size-6" />
            </div>
            <h3 className="font-bold text-base">Still need help?</h3>
            <p className="text-sm text-muted-foreground">Our support team is available Mon–Sat, 9am–6pm IST.</p>
            <Button asChild className="brand-gradient text-white border-0 rounded-2xl px-6 h-10 font-semibold shadow-md">
              <a href="mailto:support@skyrovix.com">Email Support</a>
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  const navItems = [
    { id: "overview",   label: "Overview",              icon: LayoutDashboard },
    { id: "tasks",      label: "My Tasks",               icon: ListChecks },
    { id: "internships",label: "My Internships",         icon: Briefcase },
    { id: "payment",    label: "Payment",                icon: CreditCard },
    { id: "certificates",label: "Certificates",          icon: Award },
    { id: "profile",    label: "Profile",                icon: User },

  ];



  return (
    <div className="min-h-screen overflow-x-hidden">
      <style>{`
        @keyframes drift-sphere-1 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(40px, -60px) scale(1.15); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes drift-sphere-2 {
          0% { transform: translate(0px, 0px) scale(1.1); }
          50% { transform: translate(-50px, 50px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1.1); }
        }
        @keyframes premium-glow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-drift-1 {
          animation: drift-sphere-1 20s infinite alternate ease-in-out;
        }
        .animate-drift-2 {
          animation: drift-sphere-2 16s infinite alternate ease-in-out;
        }
        .animate-premium-glow {
          background-size: 200% 200%;
          animation: premium-glow 8s ease infinite;
        }
      `}</style>
      <div className="flex min-h-screen overflow-x-hidden bg-gradient-to-br from-[#F8FAFC] to-[#EEF2FF] dark:from-[#0B1120] dark:to-[#0F172A]">
        {/* Background blobs */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -left-40 size-96 rounded-full bg-[#07284a]/15 blur-[120px] dark:bg-[#07284a]/20 animate-drift-1" />
          <div className="absolute top-1/3 -right-32 size-80 rounded-full bg-blue-400/15 blur-[100px] dark:bg-blue-600/10 animate-drift-2" />
          <div className="absolute -bottom-48 left-1/3 size-[500px] rounded-full bg-violet-400/10 blur-[140px] dark:bg-violet-600/5 animate-drift-1" />
          <div className="absolute top-2/3 left-1/4 size-64 rounded-full bg-emerald-400/5 blur-[80px] dark:bg-emerald-600/5 animate-drift-2" />
        </div>

        <Confetti active={!!cert} />

        {/* ─── Main Area ─── */}
        <div className="flex-1 min-w-0">
          <main className="mx-auto max-w-7xl px-4 py-8 min-w-0">
            {renderContent()}
          </main>
        </div>
      </div>

      {/* Global Root-Level Completion Popup Modal via React Portal */}
      {showPaymentModal && createPortal(
        <div 
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-[6px] animate-in fade-in duration-200"
          style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 9998, backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
          onClick={() => setShowPaymentModal(false)}
        >
          <div 
            className="relative z-[9999] w-[calc(100vw-32px)] max-w-[520px] rounded-[24px] bg-white dark:bg-slate-900 p-6 sm:p-8 border border-slate-100 dark:border-slate-800 text-center shadow-[0_25px_70px_rgba(0,0,0,0.25)] animate-in zoom-in-95 duration-200 overflow-hidden text-slate-900 dark:text-slate-100"
            style={{ position: 'relative', zIndex: 9999, opacity: 1, visibility: 'visible', transform: 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button X */}
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer z-10"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>

            {/* Success Section */}
            <div className="flex flex-col items-center text-center pt-2">
              {/* Icon Badge & Confetti */}
              <div className="relative mb-5 grid size-20 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 animate-in zoom-in-50 duration-300">
                <div className="absolute top-1 left-3 size-2 rounded-full bg-teal-400" />
                <div className="absolute top-3 left-14 w-2.5 h-1 bg-amber-400 -rotate-45 rounded-full" />
                <div className="absolute top-0 right-4 size-1.5 rounded-full bg-emerald-500" />
                <div className="absolute bottom-2 left-2 size-2 rounded-full bg-blue-400" />
                <div className="absolute bottom-1 right-3 w-2.5 h-1 bg-purple-400 rotate-45 rounded-full" />

                <div className="grid size-12 place-items-center rounded-full bg-[#10b981] text-white shadow-md shadow-emerald-500/20">
                  <CheckCircle2 className="size-7 stroke-[2.5]" />
                </div>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0f172a] dark:text-white tracking-tight">
                All Internship Tasks Completed!
              </h3>

              <p className="mt-2.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto font-normal">
                Congratulations! You have successfully completed all internship tasks. Your submissions have been approved by the admin.
              </p>
            </div>

            {/* Certificate Fee Section */}
            <div className="mt-6 rounded-2xl bg-[#e6f7ef] dark:bg-emerald-950/40 p-4 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3.5 text-left">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#10b981] text-white font-extrabold text-base shadow-sm">
                <span className="font-sans">₹</span>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#059669] dark:text-emerald-400">
                  Certificate Fee
                </p>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium mt-0.5">
                  Pay ₹100 to receive your verified internship certificate.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <Button
                onClick={() => {
                  setShowPaymentModal(false);
                  navigate({ search: { tab: "payment" } as any });
                }}
                className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-2xl h-12 text-sm font-bold shadow-lg shadow-blue-500/25 border-0 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                Proceed to Payment
              </Button>

              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors block w-full py-2 text-center cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Offer Letter Interactive Preview Dialog */}
      <OfferLetterPreviewDialog
        app={previewOfferApp}
        open={!!previewOfferApp}
        onOpenChange={(open) => {
          if (!open) setPreviewOfferApp(null);
        }}
      />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#EEF2FF] dark:from-[#0B1120] dark:to-[#0F172A]">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="space-y-6">
          <div className="h-40 animate-pulse rounded-3xl bg-white/60 dark:bg-slate-900/60" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/60 dark:bg-slate-900/60" />)}
          </div>
          <div className="h-64 animate-pulse rounded-2xl bg-white/60 dark:bg-slate-900/60" />
        </div>
      </main>
    </div>
  );
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let start = 0;
    const end = value;
    const dur = 800;
    const step = Math.max(1, Math.floor(end / 30));
    const t = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(t); }
      else setCount(start);
    }, dur / 30);
    return () => clearInterval(t);
  }, [value]);
  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── HERO ───

function HeroSection({ app, internApproved, durationLimit, cert, payment, setShowPaymentModal, onViewOfferLetter }: { app: any; internApproved: number; durationLimit: number; cert?: any; payment?: any; setShowPaymentModal?: (val: boolean) => void; onViewOfferLetter?: (app: any) => void }) {
  const domain = getDomain(app.domain);
  const internTotal = durationLimit || 4;
  const pct = durationLimit > 0 ? Math.min(100, Math.round((internApproved / durationLimit) * 100)) : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#06182c] via-[#092b4f] to-[#0c3f73] text-white p-4 sm:p-7 md:p-9 shadow-2xl shadow-[#06182c]/40 border border-white/10 animate-premium-glow hover:shadow-blue-500/10 transition-all duration-500">
      {/* Decorative ambient lights */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.07),transparent_60%)] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-blue-500/15 blur-[90px] pointer-events-none" />
      <div className="absolute -top-24 right-1/4 size-64 rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />
      
      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 md:gap-8">
        
        {/* Main Content Area */}
        <div className="space-y-3.5 min-w-0 flex-1">
          
          {/* Top Profile Header (Avatar + Name & Info + Mobile Progress Ring) */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* User Avatar with verified ring */}
              <div className="relative shrink-0">
                {app.photo_url ? (
                  <img src={app.photo_url} alt="" className="size-12 sm:size-14 rounded-2xl object-cover border-2 border-white/20 shadow-md" />
                ) : (
                  <div className="size-12 sm:size-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-lg sm:text-xl shadow-md border-2 border-white/20">
                    {app.full_name?.charAt(0)?.toUpperCase() ?? "I"}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 grid size-4.5 place-items-center rounded-full bg-emerald-500 text-white ring-2 ring-[#06182c]">
                  <CheckCircle2 className="size-3" />
                </div>
              </div>

              {/* Name & Domain info */}
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-widest text-blue-200 border border-white/10 backdrop-blur-md mb-0.5">
                  <Sparkles className="size-2.5 text-amber-300" /> Welcome Intern
                </div>
                <h1 className="text-xl sm:text-3xl md:text-4xl font-black font-display leading-tight tracking-tight text-white truncate">
                  {app.full_name}
                </h1>
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-xs font-semibold text-cyan-300 truncate">{domain?.name ?? app.domain}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(app.intern_id);
                      toast.success(`Copied Intern ID: ${app.intern_id}`);
                    }}
                    title="Click to copy Intern ID"
                    className="inline-flex items-center gap-1 text-[10.5px] font-mono text-blue-200/90 bg-white/10 hover:bg-white/20 active:scale-95 px-2 py-0.5 rounded-md border border-white/10 transition-all cursor-pointer"
                  >
                    <span>ID: {app.intern_id}</span>
                    <Copy className="size-2.5 opacity-70" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile-only Compact Circular Progress Ring */}
            <div className="md:hidden shrink-0 flex flex-col items-center justify-center p-2 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md shadow-inner">
              <div className="relative size-12 flex items-center justify-center">
                <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="url(#progress-gradient-mob)" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray="251.32" strokeDashoffset={251.32 - (251.32 * pct) / 100} style={{ transition: "stroke-dashoffset 1s ease" }} />
                  <defs>
                    <linearGradient id="progress-gradient-mob" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute text-[11px] font-black text-white">{pct}%</span>
              </div>
              <span className="text-[8.5px] font-bold text-emerald-300 uppercase tracking-wider mt-0.5">Progress</span>
            </div>
          </div>

          {/* Minimalist Frosted Meta Strip (Eliminates bulky dark boxes) */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-blue-200/90 backdrop-blur-md">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-cyan-300 shrink-0" />
              <span>Enrolled: <strong className="text-white font-semibold">{new Date(app.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-cyan-300 shrink-0" />
              <span>Duration: <strong className="text-white font-semibold">{app.duration ?? 1} Month{(app.duration ?? 1) > 1 ? "s" : ""}</strong></span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <ListChecks className="size-3.5 text-emerald-300 shrink-0" />
              <span>Tasks: <strong className="text-emerald-300 font-semibold">{internApproved} / {durationLimit} Completed</strong></span>
            </div>
          </div>

          {/* Quick Actions Dock: Modern App-Icon Grid on Mobile, Full Buttons on Desktop */}
          <div className="space-y-2.5 pt-1">
            
            {/* Mobile 4-Column Action Dock */}
            <div className="grid grid-cols-4 gap-2 md:hidden">
              <button
                type="button"
                onClick={() => onViewOfferLetter?.(app)}
                className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] active:scale-90 border border-white/10 transition-all text-center group cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="grid size-10 place-items-center rounded-xl bg-blue-500/20 text-blue-300 group-hover:scale-110 group-hover:bg-blue-500/30 transition-all">
                  <Eye className="size-5" />
                </div>
                <span className="mt-1 text-[10px] font-bold text-slate-200 leading-tight">View Offer</span>
              </button>

              <button
                type="button"
                onClick={() => downloadOfferLetter({
                  fullName: app.full_name,
                  internId: app.intern_id,
                  domain: domain?.name ?? app.domain,
                  issuedAt: app.offer_issued_at || app.created_at,
                  duration: app.duration ?? 1,
                })}
                className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] active:scale-90 border border-white/10 transition-all text-center group cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="grid size-10 place-items-center rounded-xl bg-sky-500/20 text-sky-300 group-hover:scale-110 group-hover:bg-sky-500/30 transition-all">
                  <Download className="size-5" />
                </div>
                <span className="mt-1 text-[10px] font-bold text-slate-200 leading-tight">Offer Letter</span>
              </button>

              <button
                type="button"
                onClick={() => downloadIDCard({
                  fullName: app.full_name, internId: app.intern_id, domain: domain?.name ?? app.domain, issuedAt: app.offer_issued_at || app.created_at, photoUrl: app.photo_url, email: app.email
                })}
                className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] active:scale-90 border border-white/10 transition-all text-center group cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="grid size-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300 group-hover:scale-110 group-hover:bg-emerald-500/30 transition-all">
                  <Download className="size-5" />
                </div>
                <span className="mt-1 text-[10px] font-bold text-slate-200 leading-tight">ID Card</span>
              </button>

              <button
                type="button"
                onClick={cert ? () => downloadPdf(
                  <CertificateDoc fullName={app.full_name} internId={app.intern_id} domain={domain?.name ?? app.domain} certId={cert.certificate_id} issuedAt={cert.issued_at} verifyUrl={`${getPublicSiteUrl()}/verify-certificate`} />,
                  `Certificate_${cert.certificate_id}.pdf`
                ) : undefined}
                disabled={!cert}
                className={`flex flex-col items-center justify-center p-2 rounded-2xl ${cert ? "bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-90 border-emerald-400/30 cursor-pointer shadow-sm hover:shadow-emerald-500/20" : "bg-white/[0.03] border-white/5 opacity-40 cursor-not-allowed"} border transition-all text-center group`}
              >
                <div className={`grid size-10 place-items-center rounded-xl ${cert ? "bg-emerald-500/30 text-emerald-300 group-hover:scale-110" : "bg-white/5 text-white/40"} transition-all`}>
                  <Award className="size-5" />
                </div>
                <span className="mt-1 text-[10px] font-bold text-slate-200 leading-tight">{cert ? "Certificate" : "Locked"}</span>
              </button>
            </div>

            {/* Desktop Full Buttons */}
            <div className="hidden md:flex flex-wrap gap-2.5">
              <Button size="sm" variant="ghost" className="rounded-2xl h-10 text-xs font-bold bg-white/10 hover:!bg-white/20 border border-white/10 hover:border-white/20 text-white hover:!text-white gap-2 transition-all hover:scale-105 active:scale-95 shadow-black/10 hover:shadow-lg"
                onClick={() => onViewOfferLetter?.(app)}>
                <Eye className="size-4 text-blue-300" /> View Offer Letter
              </Button>

              <Button size="sm" variant="ghost" className="rounded-2xl h-10 text-xs font-bold bg-white/10 hover:!bg-white/20 border border-white/10 hover:border-white/20 text-white hover:!text-white gap-2 transition-all hover:scale-105 active:scale-95 shadow-black/10 hover:shadow-lg"
                onClick={() => downloadOfferLetter({
                  fullName: app.full_name,
                  internId: app.intern_id,
                  domain: domain?.name ?? app.domain,
                  issuedAt: app.offer_issued_at || app.created_at,
                  duration: app.duration ?? 1,
                })}>
                <Download className="size-4 text-blue-300" /> Download Offer Letter
              </Button>

              <Button size="sm" variant="ghost" className="rounded-2xl h-10 text-xs font-bold bg-white/10 hover:!bg-white/20 border border-white/10 hover:border-white/20 text-white hover:!text-white gap-2 transition-all hover:scale-105 active:scale-95 shadow-black/10 hover:shadow-lg"
                onClick={() => downloadIDCard({
                  fullName: app.full_name, internId: app.intern_id, domain: domain?.name ?? app.domain, issuedAt: app.offer_issued_at || app.created_at, photoUrl: app.photo_url, email: app.email
                })}>
                <Download className="size-4 text-emerald-300" /> Download ID Card
              </Button>

              {cert && (
                <Button size="sm" className="rounded-2xl h-10 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white hover:!text-white border-0 gap-2 shadow-lg shadow-emerald-950/20 transition-all hover:scale-105 active:scale-95 hover:shadow-emerald-500/30"
                  onClick={() => downloadPdf(
                    <CertificateDoc fullName={app.full_name} internId={app.intern_id} domain={domain?.name ?? app.domain} certId={cert.certificate_id} issuedAt={cert.issued_at} verifyUrl={`${getPublicSiteUrl()}/verify-certificate`} />,
                    `Certificate_${cert.certificate_id}.pdf`
                  )}>
                  <Award className="size-4 text-emerald-100" /> Download Certificate
                </Button>
              )}
            </div>

            {/* Official Community / Social Channels (WhatsApp + Instagram) */}
            <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 pt-0.5">
              <Button size="sm" className="w-full md:w-auto rounded-2xl h-10 text-xs font-bold bg-[#25D366] hover:!bg-[#20ba59] text-white hover:!text-white border-0 gap-2 shadow-md shadow-[#25D366]/20 transition-all hover:scale-105 active:scale-95"
                onClick={() => window.open("https://whatsapp.com/channel/0029VbD67bgEFeXexEbYGI1f", "_blank")}>
                <svg className="size-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="truncate">WhatsApp Group</span>
              </Button>

              <Button size="sm" className="w-full md:w-auto rounded-2xl h-10 text-xs font-bold bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white hover:!text-white border-0 gap-2 shadow-md shadow-pink-500/20 transition-all hover:scale-105 active:scale-95"
                onClick={() => window.open("https://www.instagram.com/skyrovix?stkn=ZXY2ZXdxZTM5czNr", "_blank")}>
                <Instagram className="size-4 shrink-0" />
                <span className="truncate">Instagram</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop-only Large Circular Progress Ring */}
        <div className="hidden md:flex shrink-0 flex-col items-center">
          <div className="relative size-28 shrink-0 flex items-center justify-center bg-white/5 rounded-full p-2 border border-white/5 backdrop-blur-md shadow-inner">
            <svg className="size-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="url(#progress-gradient)" strokeWidth="6" strokeLinecap="round"
                strokeDasharray="263.89" strokeDashoffset={263.89 - (263.89 * pct) / 100} style={{ transition: "stroke-dashoffset 1s ease" }} />
              <defs>
                <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-white tracking-tight">{pct}%</span>
              <span className="text-[7.5px] text-white/55 font-bold uppercase tracking-wider mt-0.5">Progress</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── STATS CARDS ───

function StatsCards({ internApproved, internPending, durationLimit, cert, payment, setShowPaymentModal }: any) {
  const stats = [
    {
      icon: CheckCircle2, label: "Approved Tasks", value: `${internApproved} / ${durationLimit}`,
      sub: "Completed Tasks", color: "from-emerald-500 to-green-600", bg: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: Clock, label: "Pending Review", value: `${internPending}`,
      sub: "Submitted Tasks", color: "from-amber-500 to-orange-500", bg: "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400",
    },
    {
      icon: Award, label: "Verified Certificate", value: cert ? "Issued" : "None",
      sub: cert ? "Download PDF" : "Locked",
      color: "from-rose-500 to-pink-600", bg: "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <div key={i}
            onClick={() => {
              if ((s.label === "Verified Certificate" || s.label === "Approved Tasks") && setShowPaymentModal && (!payment || payment.status !== "verified")) {
                setShowPaymentModal(true);
              }
            }}
            className={`group rounded-3xl border border-border/40 bg-white/60 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900/60 dark:border-white/5 ${setShowPaymentModal && (!payment || payment.status !== "verified") ? "cursor-pointer" : ""}`}
          >
            <div className="flex items-start justify-between">
              <div className={`grid size-11 shrink-0 place-items-center rounded-2xl ${s.bg}`}>
                <Icon className="size-5" />
              </div>
              <span className={`rounded-lg bg-gradient-to-br ${s.color} px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider`}>{s.sub}</span>
            </div>
            <p className="mt-4 font-display text-2xl font-bold text-foreground">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground font-medium">{s.label}</p>
          </div>
        );
      })}
    </div>
  );
}

// ─── PROFILE ───

function ProfilePanel({ app, onChange }: { app: Application; onChange: () => void }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { user } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (photoFile) {
      const url = URL.createObjectURL(photoFile);
      setPhotoPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPhotoPreview(null);
    }
  }, [photoFile]);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      let photo_url = app.photo_url;
      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("profile-photos").upload(path, photoFile, { upsert: true });
        if (upErr) {
          console.warn("Profile photo upload failed:", upErr.message);
          toast.warning("Photo upload failed, profile saved without photo.");
        } else {
          const { data: signed } = await supabase.storage.from("profile-photos").createSignedUrl(path, 60 * 60 * 24 * 365);
          photo_url = signed?.signedUrl ?? photo_url;
        }
      }
      const updates = {
        full_name: String(fd.get("full_name")),
        phone: String(fd.get("phone")),
        college: String(fd.get("college")),
        course: String(fd.get("course")),
        year: String(fd.get("year")),
        photo_url,
      };
      
      try {
        await supabase.from("applications").update(updates).eq("id", app.id);
      } catch (err) {
        console.warn("RLS restriction on applications update ignored:", err);
      }

      const { error: profileErr } = await supabase.from("profiles").upsert({
        id: user.id,
        ...updates,
      });
      if (profileErr) throw profileErr;

      toast.success("Profile updated successfully! 🎉");
      await qc.refetchQueries({ queryKey: ["my-profile-details", user.id] });
      await qc.refetchQueries({ queryKey: ["my-applications", user.id] });
      setEditing(false);
      setPhotoFile(null);
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const domain = getDomain(app.domain);

  if (editing) return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-3xl border-border/40 bg-white/60 backdrop-blur-xl dark:bg-slate-900/60 dark:border-white/5 shadow-xl transition-all duration-300">
        <div className="relative bg-gradient-to-br from-[#07284a] via-[#0a3d6b] to-[#0d5a9e] px-6 py-8 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none" />
          <div className="absolute -right-12 -top-12 size-40 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute -bottom-12 -left-12 size-40 rounded-full bg-blue-400/5 blur-2xl" />
          <div className="relative z-10">
            <h3 className="text-xl font-extrabold font-display">Edit Profile Information</h3>
            <p className="text-xs text-blue-200 mt-1">Make sure all details are accurate to ensure clean certificate generation.</p>
          </div>
        </div>
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={save} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl border border-dashed border-border/60 bg-gradient-to-br from-slate-50/50 to-white p-6 dark:from-slate-800/20 dark:to-slate-900/20">
              <div className="relative group shrink-0">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-[#07284a] to-blue-500 opacity-30 blur-sm group-hover:opacity-50 transition-opacity" />
                {(photoPreview || app.photo_url) ? (
                  <img src={photoPreview || app.photo_url || ""} alt="" className="relative size-24 rounded-2xl object-cover border-4 border-white dark:border-slate-800 shadow-md transition-all group-hover:scale-105" />
                ) : (
                  <div className="relative grid size-24 place-items-center rounded-2xl border-4 border-white dark:border-slate-800 brand-gradient text-3xl font-extrabold text-white shadow-md transition-all group-hover:scale-105">
                    {app.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="text-sm font-bold text-foreground">Profile Photo</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 mb-3">Upload a clear, professional photo for your ID card and certificate.</p>
                <Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} className="h-10 file:text-xs rounded-xl border-border/60 bg-white max-w-xs cursor-pointer" />
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400 tracking-wider uppercase border-b border-border/20 pb-2">
                <User className="size-3.5" /> Personal Information
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs font-semibold text-foreground">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input name="full_name" defaultValue={app.full_name} required className="h-12 rounded-xl border-border/60 bg-white text-sm pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input name="phone" type="tel" defaultValue={app.phone ?? ""} required className="h-12 rounded-xl border-border/60 bg-white text-sm pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground">Year of Study *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input name="year" defaultValue={app.year ?? ""} required placeholder="e.g. 3rd Year" className="h-12 rounded-xl border-border/60 bg-white text-sm pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground">College / Institution *</Label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input name="college" defaultValue={app.college ?? ""} required className="h-12 rounded-xl border-border/60 bg-white text-sm pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground">Course / Branch *</Label>
                  <div className="relative">
                    <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input name="course" defaultValue={app.course ?? ""} required className="h-12 rounded-xl border-border/60 bg-white text-sm pl-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border/20">
              <Button type="submit" disabled={saving} className="brand-gradient text-white border-0 rounded-xl px-8 h-12 font-bold shadow-lg shadow-[#07284a]/15 gap-2 hover:-translate-y-0.5 active:translate-y-0 transition-all">
                {saving ? <><Loader2 className="size-4 animate-spin" /> Saving Details…</> : <><CheckCircle2 className="size-4" /> Save Changes</>}
              </Button>
              <Button type="button" variant="outline" className="rounded-xl px-8 h-12 font-bold border-border/60 gap-2 hover:-translate-y-0.5 active:translate-y-0 transition-all" onClick={() => { setEditing(false); setPhotoFile(null); }}>
                <X className="size-4" /> Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Profile Info & Stats */}
      <Card className="overflow-hidden rounded-3xl border-border/40 bg-white/60 backdrop-blur-xl dark:bg-slate-900/60 dark:border-white/5 shadow-xl transition-all duration-300">
        {/* Modern Radial Gradient Banner */}
        <div className="h-32 bg-gradient-to-r from-[#07284a] via-[#093a6c] to-[#0a4c8f] relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none" />
          <div className="absolute top-4 right-4 flex gap-1.5">
            <Badge className="bg-white/15 text-white border-0 backdrop-blur-md rounded-lg font-mono text-[10px] tracking-wide uppercase px-2 py-0.5">
              {app.status}
            </Badge>
          </div>
        </div>
        
        <CardContent className="pt-0 px-6 pb-6 relative">
          {/* Main User Block */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-12 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              {app.photo_url ? (
                <img src={app.photo_url} alt="" className="size-24 rounded-3xl border-4 border-white dark:border-slate-900 object-cover shadow-lg relative z-10" />
              ) : (
                <div className="grid size-24 place-items-center rounded-3xl border-4 border-white dark:border-slate-900 brand-gradient text-3xl font-extrabold text-white shadow-lg relative z-10">
                  {app.full_name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="pb-1">
                <h3 className="text-2xl font-extrabold font-display text-foreground leading-snug tracking-tight">{app.full_name}</h3>
                <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                  <Mail className="size-3.5 text-primary shrink-0" />
                  <span className="font-semibold">{app.email}</span>
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl border-border/60 h-9 font-semibold gap-1.5 bg-white/40 shadow-sm shrink-0 mb-1 hover:-translate-y-0.5 transition-transform" onClick={() => setEditing(true)}>
              <User className="size-4 text-primary" /> Edit Profile
            </Button>
          </div>

          {/* Grid Layout Cards */}
          <div className="grid gap-6 md:grid-cols-2 mt-4">
            {/* Personal Details Panel */}
            <div className="rounded-2xl border border-border/30 bg-white/40 p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400 tracking-wider uppercase border-b border-border/20 pb-2">
                <User className="size-3.5" /> Personal Details
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-border/10">
                  <span className="text-muted-foreground">Phone Number</span>
                  <span className="font-bold text-foreground">{app.phone || "—"}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border/10">
                  <span className="text-muted-foreground">Year of Study</span>
                  <span className="font-bold text-foreground">{app.year || "—"}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground">Registered Email</span>
                  <span className="font-bold text-foreground">{app.email}</span>
                </div>
              </div>
            </div>

            {/* Academic Credentials Panel */}
            <div className="rounded-2xl border border-border/30 bg-white/40 p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400 tracking-wider uppercase border-b border-border/20 pb-2">
                <Building className="size-3.5" /> Academic Information
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-border/10">
                  <span className="text-muted-foreground">Institution</span>
                  <span className="font-bold text-foreground text-right truncate max-w-[180px]">{app.college || "—"}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border/10">
                  <span className="text-muted-foreground">Course / Branch</span>
                  <span className="font-bold text-foreground text-right truncate max-w-[180px]">{app.course || "—"}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground">Internship Status</span>
                  <Badge className={`text-[10px] px-2 py-0.5 rounded-lg border-0 font-bold ${
                    app.status === "completed" ? "bg-emerald-500 text-white" :
                    app.status === "ongoing" ? "bg-blue-600 text-white" :
                    "bg-amber-500 text-white"
                  }`}>{app.status}</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── TIMELINE ───

function TimelineSection({ steps, currentStep, setShowPaymentModal }: { steps: { label: string; done: boolean }[]; currentStep: number; setShowPaymentModal?: (val: boolean) => void }) {
  return (
    <div className="rounded-3xl border border-border/40 bg-white/60 p-6 backdrop-blur-xl dark:bg-slate-900/60 dark:border-white/5 relative overflow-hidden">
      <style>{`
        @keyframes stepper-pulse {
          0% { transform: scale(0.9); opacity: 0.9; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .animate-stepper-pulse {
          animation: stepper-pulse 2s infinite ease-out;
        }
      `}</style>
      <h3 className="mb-6 flex items-center gap-2 font-bold text-sm text-foreground"><Flag className="size-4 text-primary" /> Internship Progress</h3>
      
      {/* Desktop Horizontal Stepper */}
      <div className="hidden md:flex items-center justify-between relative px-4">
        {/* Connection Line */}
        <div className="absolute left-8 right-8 top-5 h-0.5 bg-muted dark:bg-slate-800 -z-10">
          <div 
            className="h-full bg-gradient-to-r from-[#07284a] via-blue-500 to-emerald-500 transition-all duration-700 ease-out" 
            style={{ width: `${currentStep < 0 ? 100 : (currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
        
        {steps.map((s, i) => {
          const isActive = i === currentStep;
          const isDone = s.done;
          return (
            <div key={i} 
              onClick={() => {
                if (i === 2 && setShowPaymentModal) setShowPaymentModal(true);
              }}
              className={`flex flex-col items-center text-center relative z-10 w-32 ${i === 2 && setShowPaymentModal ? "cursor-pointer" : ""}`}>
              <div className="relative">
                {isActive && (
                  <div className="absolute -inset-2 rounded-full border-2 border-[#07284a] dark:border-blue-500 animate-stepper-pulse pointer-events-none" />
                )}
                <div className={`grid size-10 place-items-center rounded-full transition-all duration-500 border-2 ${
                  isDone 
                    ? "bg-emerald-500 border-emerald-400 text-white scale-100 shadow-md shadow-emerald-500/20" 
                    : isActive 
                      ? "bg-[#07284a] border-blue-500 text-white ring-4 ring-[#07284a]/20 dark:ring-[#07284a]/50" 
                      : "bg-white dark:bg-slate-800 border-muted dark:border-slate-700 text-muted-foreground"
                }`}>
                  {isDone ? <CheckCircle2 className="size-5" /> : <span className="text-xs font-bold">{i + 1}</span>}
                </div>
              </div>
              <p className={`mt-3 text-xs font-medium max-w-full leading-snug ${isActive ? "text-[#07284a] dark:text-[#07284a]/85 font-bold" : isDone ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
                {s.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Mobile Vertical Stepper */}
      <div className="md:hidden relative pl-6 space-y-6">
        {/* Connecting line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-muted dark:bg-slate-800 -z-10">
          <div 
            className="w-full bg-gradient-to-b from-[#07284a] via-blue-500 to-emerald-500 transition-all duration-700 ease-out" 
            style={{ height: `${currentStep < 0 ? 100 : (currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
        
        {steps.map((s, i) => {
          const isActive = i === currentStep;
          const isDone = s.done;
          return (
            <div key={i} className="flex items-center gap-4 relative">
              <div className="relative shrink-0">
                {isActive && (
                  <div className="absolute -inset-1 rounded-full border border-[#07284a] dark:border-blue-500 animate-stepper-pulse pointer-events-none" />
                )}
                <div className={`grid size-6 place-items-center rounded-full transition-all duration-500 border ${
                  isDone 
                    ? "bg-emerald-500 border-emerald-400 text-white shadow-sm" 
                    : isActive 
                      ? "bg-[#07284a] border-blue-500 text-white ring-2 ring-[#07284a]/20" 
                      : "bg-white dark:bg-slate-800 border-muted dark:border-slate-700 text-muted-foreground"
                }`}>
                  {isDone ? <CheckCircle2 className="size-3.5" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                </div>
              </div>
              <div className={`min-w-0 ${isActive ? "font-semibold text-foreground" : isDone ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
                <p className={`text-xs ${isActive ? "text-[#07284a] dark:text-[#07284a]/80" : ""}`}>{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── CERTIFICATES ───

function UnlockedCertificateCard({ app, cert, domain }: any) {
  if (!cert) return null;
  const issuedDate = cert.issued_at
    ? new Date(cert.issued_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
  const certId = cert.certificate_id || "—";
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-white/60 p-6 backdrop-blur-xl dark:bg-slate-900/60 dark:border-white/5">
        {/* Glow behind certificate icon */}
        <div className="absolute -right-20 -top-20 size-64 rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="grid size-16 place-items-center rounded-2xl brand-gradient text-white shadow-xl shadow-[#07284a]/10 shrink-0">
            <Award className="size-9" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <Badge className="bg-emerald-600 text-white text-[10px] rounded-lg px-2.5 py-1 mb-2 border-0"><CheckCircle2 className="mr-1 size-3" /> VERIFIED CERTIFICATE</Badge>
            <h2 className="text-lg font-bold font-display text-foreground">{domain?.name ?? app?.domain} Internship Certificate</h2>
            <p className="text-xs text-muted-foreground mt-1">Issued to <span className="font-semibold text-foreground">{app?.full_name}</span> on {issuedDate}</p>
            <p className="text-[9px] font-mono text-muted-foreground mt-1.5">Certificate ID: {certId}</p>
          </div>
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
            <Button size="sm" className="brand-gradient text-white border-0 rounded-2xl h-10 px-6 font-semibold shadow-md gap-1.5"
              onClick={() => downloadPdf(<CertificateDoc fullName={app?.full_name} internId={app?.intern_id} domain={domain?.name ?? app?.domain} certId={certId} issuedAt={cert.issued_at} verifyUrl={`${getPublicSiteUrl()}/verify-certificate`} />, `Certificate_${certId}.pdf`)}>
              <Download className="size-4" /> Download PDF
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-2xl border-border/60 h-10 px-6 font-semibold gap-1.5 bg-white/40">
              <Link to="/verify-certificate"><ExternalLink className="size-4" /> Verify Certificate</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LockedCertificateCard({ app, internApproved, internTotal, payment, utrNumber, setUtrNumber, paymentScreenshot, setPaymentScreenshot, submittingPayment, handlePaymentSubmit, couponResult, showPaymentModal, setShowPaymentModal, ...rest }: any) {
  const domain = getDomain(app?.domain);
  const isTasksDone = internTotal > 0 && internApproved >= internTotal;
  const isPaymentDone = payment?.status === "verified";
  const submissionStatus = app?.submission_status ?? "in_progress";
  const hasCoupon = Boolean(
    (app?.coupon_code && app.coupon_code.trim() !== "") ||
    (payment && (payment.coupon_code || payment.utr_number === "FREE_COUPON" || payment.amount === 0)) ||
    couponResult?.valid
  );

  const [paymentStep, setPaymentStep] = useState<"celebration" | "checkout">("celebration");

  useEffect(() => {
    if (showPaymentModal) {
      setPaymentStep("celebration");
    }
  }, [showPaymentModal]);

  useEffect(() => {
    if (isTasksDone && !hasCoupon && !isPaymentDone && payment?.status !== "pending") {
      setShowPaymentModal?.(true);
    }
  }, [isTasksDone, hasCoupon, isPaymentDone, payment, setShowPaymentModal]);

  const steps = hasCoupon
    ? [
        { label: "Complete All Tasks", done: isTasksDone, icon: ListChecks },
        { label: "Admin Approval & Certificate", done: submissionStatus === "approved" || isTasksDone, icon: CheckCircle2 },
      ]
    : [
        { label: "Complete All Tasks", done: isTasksDone, icon: ListChecks },
        { label: "Payment Verification (₹100)", done: isPaymentDone, icon: Wallet },
        { label: "Certificate Generated", done: isPaymentDone && (submissionStatus === "approved" || isTasksDone), icon: Award },
      ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border/40 bg-white/60 p-6 backdrop-blur-xl dark:bg-slate-900/60 dark:border-white/5 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-amber-500/10 blur-[80px] pointer-events-none" />
        
        <div className="grid md:grid-cols-12 gap-8 items-center">
          {/* Visual Locked Certificate Graphic */}
          <div className="md:col-span-4 flex flex-col items-center">
            <div className="relative w-full max-w-[240px] aspect-[1.414] rounded-2xl border-2 border-dashed border-muted-foreground/30 dark:border-white/10 bg-slate-100/50 dark:bg-slate-800/20 grid place-items-center overflow-hidden shadow-inner group">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#07284a]/2 to-[#07284a]/5 pointer-events-none" />
              <div className="flex flex-col items-center text-center p-4">
                <div className="grid size-14 place-items-center rounded-2xl bg-amber-500/10 text-amber-500 shadow-inner mb-3 animate-pulse">
                  <Lock className="size-6" />
                </div>
                <span className="text-xs font-bold tracking-wide uppercase text-muted-foreground">Internship Certificate</span>
                <span className="text-[10px] text-muted-foreground/60 mt-1">{domain?.name ?? app?.domain}</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-muted dark:bg-slate-800">
                <div className="h-full bg-amber-500" style={{ width: `${Math.round((internApproved / Math.max(1, internTotal)) * 100)}%` }} />
              </div>
            </div>
          </div>
          
          {/* Steps & Checkout Info */}
          <div className="md:col-span-8 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="secondary" className="mb-2 bg-amber-500/10 text-amber-600 border-0"><Lock className="mr-1 size-3" /> Certificate Path</Badge>
                <h2 className="text-xl font-bold font-display text-foreground">Certificate Progress</h2>
                <p className="text-xs text-muted-foreground mt-1">Complete tasks & payment to receive your verified certificate after admin verification.</p>
              </div>
              {hasCoupon && (
                <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs px-3 py-1 font-bold">
                  ✨ Coupon Applied
                </Badge>
              )}
            </div>
            
            <div className="grid sm:grid-cols-2 gap-3">
              {steps.map((step, i) => {
                const Icon = step.icon;
                const isDone = step.done;
                return (
                  <div key={i} className={`rounded-2xl border p-3.5 transition ${isDone ? "bg-emerald-50/50 border-emerald-200/50 dark:bg-emerald-950/10" : "bg-secondary/40 border-border/40"}`}>
                    <div className="flex items-start gap-3">
                      <div className={`grid size-7 shrink-0 place-items-center rounded-lg ${isDone ? "bg-emerald-500 text-white" : "bg-amber-500/10 text-amber-500"}`}>
                        {isDone ? <CheckCircle2 className="size-4" /> : <Icon className="size-4" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">{step.label}</h4>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Coupon Applied Banner (No payment required) */}
      {hasCoupon && !isPaymentDone && (
        <div className="rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 to-white p-6 backdrop-blur-xl dark:from-emerald-950/20 dark:to-slate-900/60 dark:border-emerald-800/30">
          <div className="flex items-start gap-3">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <Sparkles className="size-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Coupon Applied — Free Certificate</h3>
              <p className="text-sm text-muted-foreground mt-1">Your coupon code waives the certificate fee! Complete your tasks to get your certificate directly upon admin verification.</p>
            </div>
          </div>
        </div>
      )}



      {submissionStatus === "rejected" && (
        <div className="rounded-2xl border border-red-200/60 bg-red-50/50 p-4 dark:border-red-800/30 dark:bg-red-950/10">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">Internship rejected. Check feedback and resubmit tasks.</p>
        </div>
      )}

      {submissionStatus === "approved" && (
        <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-4 text-center dark:border-emerald-800/30 dark:bg-emerald-950/10">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Internship tasks approved by admin!</p>
          {!hasCoupon && !isPaymentDone && (
            <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1 font-medium">Please submit your ₹100 payment verification to receive your certificate.</p>
          )}
        </div>
      )}
    </div>
  );
}

function CertificateSection({ cert, app, compact }: any) {
  if (!cert) return null;
  const domain = getDomain(app?.domain);
  const inner = (
    <>
      <div className="rounded-xl bg-gradient-to-br from-[#07284a]/10 to-blue-50 p-4 text-center dark:from-[#07284a]/40 dark:to-blue-950/30 border border-[#07284a]/20 dark:border-[#07284a]/50">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl brand-gradient text-white shadow-md mb-3">
          <Award className="size-7" />
        </div>
        <p className="font-bold text-sm text-foreground">{domain?.name}</p>
        <p className="text-[10px] text-muted-foreground font-mono mt-1">{cert.certificate_id}</p>
      </div>
      <div className="mt-4 space-y-2">
        {app && (
          <Button size="sm" className="w-full brand-gradient text-white border-0 rounded-xl h-9"
            onClick={() => downloadPdf(
              <CertificateDoc fullName={app.full_name} internId={app.intern_id} domain={domain?.name ?? app.domain}
                certId={cert.certificate_id} issuedAt={cert.issued_at}
                verifyUrl={`${getPublicSiteUrl()}/verify-certificate`} />,
              `Certificate_${cert.certificate_id}.pdf`
            )}>
            <Download className="mr-1.5 size-4" /> Download PDF
          </Button>
        )}
        <Button asChild size="sm" variant="outline" className="w-full rounded-xl border-border/60 h-9 bg-white">
          <Link to="/verify-certificate"><ExternalLink className="mr-1.5 size-4" /> Verify Certificate</Link>
        </Button>
      </div>
    </>
  );
  if (compact) return <div className="border-b border-border/40 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">{inner}</div>;
  return <div className="rounded-2xl border border-border/50 bg-white/70 p-5 backdrop-blur-xl dark:bg-slate-900/70">{inner}</div>;
}

// ─── ID CARD ───

function IDCardSection({ app, onViewOfferLetter }: { app: Application | null; onViewOfferLetter?: (app: Application) => void }) {
  if (!app) return null;
  const domain = getDomain(app.domain);
  return (
    <div className="rounded-3xl border border-border/40 bg-white/60 p-5 backdrop-blur-xl dark:bg-slate-900/60 dark:border-white/5">
      <h3 className="flex items-center gap-2 font-bold mb-4 text-sm text-foreground"><Shield className="size-4 text-primary" /> Digital ID Card</h3>
      <IDCard internId={app.intern_id} fullName={app.full_name} domain={domain?.name ?? app.domain} photoUrl={app.photo_url} issuedAt={app.offer_issued_at} email={app.email} />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge className="bg-emerald-600 text-white text-[10px] border-0"><CheckCircle2 className="mr-1 size-3" /> ACTIVE</Badge>
        <div className="flex flex-wrap gap-2 ml-auto">
          <Button size="sm" variant="outline" className="rounded-xl h-8 text-xs border-border/60 bg-white dark:bg-slate-800 hover:bg-slate-100"
            onClick={() => onViewOfferLetter?.(app)}>
            <Eye className="mr-1 size-3 text-blue-500" /> View Offer Letter
          </Button>
          <Button size="sm" variant="outline" className="rounded-xl h-8 text-xs border-border/60 bg-white dark:bg-slate-800 hover:bg-slate-100"
            onClick={() => downloadOfferLetter({
              fullName: app.full_name,
              internId: app.intern_id,
              domain: domain?.name ?? app.domain,
              issuedAt: app.offer_issued_at || app.created_at,
              duration: app.duration ?? 1,
            })}>
            <Download className="mr-1 size-3 text-emerald-500" /> Download Offer Letter
          </Button>
          <Button size="sm" className="brand-gradient text-white border-0 rounded-xl h-8 text-xs font-semibold"
            onClick={() => downloadIDCard({
              fullName: app.full_name, internId: app.intern_id, domain: domain?.name ?? app.domain, issuedAt: app.offer_issued_at || app.created_at, photoUrl: app.photo_url, email: app.email
            })}>
            <Download className="mr-1 size-3" /> Download ID
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── SUBMISSION STATUS BADGE ───
function SubmissionStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    submitted: { label: "Submitted", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    approved: { label: "Approved", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  };
  const c = config[status] ?? { label: status, className: "bg-gray-100 text-gray-700" };
  return <Badge className={`text-xs ${c.className}`}>{c.label}</Badge>;
}

// ─── APPLY FORM ───

function WelcomeDashboard({ user, onCreated }: { user: any; onCreated: () => void }) {
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";

  return (
    <div className="space-y-8">
      {/* Hero welcome */}
      <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-white/70 backdrop-blur-xl p-6 sm:p-10 dark:bg-slate-900/60 dark:border-white/5">
        <div className="absolute -right-20 -top-20 size-64 rounded-full bg-[#07284a]/15 blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-blue-400/15 blur-[100px]" />
        <div className="relative">
          <Badge variant="secondary" className="mb-3 bg-primary/10 text-primary border-0"><Sparkles className="mr-1 size-3" /> Welcome</Badge>
          <h1 className="font-display text-3xl font-bold sm:text-4xl text-foreground">Hi {displayName} 👋</h1>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            Your Skyrovix learning hub. Select your internship domain, complete practical tasks, and apply for an internship anytime.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" className="brand-gradient text-white border-0 rounded-2xl h-11" onClick={() => setShowApplyDialog(true)}>
              <FileText className="mr-2 size-4" /> Apply for Internship
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-2xl h-11 bg-white">
              <Link to="/domains"><Layers className="mr-2 size-4" /> Explore Domains</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-2xl h-11 bg-white hover:bg-slate-50 gap-2 text-xs font-bold" onClick={() => window.open("https://www.instagram.com/skyrovix?stkn=ZXY2ZXdxZTM5czNr", "_blank")}>
              <Instagram className="size-4 text-pink-600" /> Instagram
            </Button>
          </div>
        </div>
      </div>

      <ApplicationFormDialog
        open={showApplyDialog}
        onOpenChange={setShowApplyDialog}
        onSuccess={onCreated}
      />

      {/* Quick action tiles */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/domains" className="group rounded-3xl border border-border/45 bg-white/60 p-5 backdrop-blur transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:bg-slate-900/60">
          <div className="grid size-11 place-items-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"><Layers className="size-5" /></div>
          <p className="mt-4 font-bold text-foreground">Internship Domains</p>
          <p className="text-xs text-muted-foreground mt-1">Pick a domain to specialise in.</p>
        </Link>
        <Link to="/verify-certificate" className="group rounded-3xl border border-border/45 bg-white/60 p-5 backdrop-blur transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:bg-slate-900/60">
          <div className="grid size-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"><Shield className="size-5" /></div>
          <p className="mt-4 font-bold text-foreground">Verify Certificate</p>
          <p className="text-xs text-muted-foreground mt-1">Check any Skyrovix certificate ID.</p>
        </Link>
      </div>
    </div>
  );
}
