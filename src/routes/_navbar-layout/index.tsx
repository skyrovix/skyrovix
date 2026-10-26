import { useState, useEffect, useRef, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getPublicFeeSettings, type PublicFeeSettings } from "@/lib/fee-service";
import { getPublicPlatformStats, type PublicPlatformStats } from "@/lib/platform-stats";
import { Button } from "@/components/ui/button";
import { FounderProfileView } from "@/components/FounderProfileView";
import { DOMAINS, COMPANY, DURATIONS, durationConfig, generateInternId } from "@/lib/constants";
import { ApplicationFormDialog } from "@/components/ApplicationFormDialog";
import { supabase } from "@/lib/db-client";
import { useAuth } from "@/lib/auth";
import { useRecentReviews, computeStats } from "@/lib/reviews";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { AuroraBackground } from "@/components/AuroraBackground";
import { FadeUp, Reveal, ScaleIn, FadeIn, MotionRiseIn, MotionStagger } from "@/components/motion";
import { motion } from "framer-motion";
import {
  easings,
  durations,
  springs,
  transitions,
  fade,
  slideUp,
  scaleIn,
  pop,
  stagger,
  brightChatCaret,
  inViewRiseIn,
  inViewFadeIn,
  buttonHoverTap,
  cardHoverElevation,
} from "@/lib/symboolic.com-motion.framer";
import {
  BookOpen, Layers, Monitor, Server, BarChart3, Brain, Palette,
  Code2, Shield, TrendingUp, ArrowRight, Award, FileCheck, Rocket,
  ShieldCheck, GraduationCap, IndianRupee, HelpCircle, Trophy,
  Sparkles, ChevronRight, CheckCircle2, Quote, Star,
  ArrowUpRight, Globe, Zap, Users, Target, HeartHandshake,
  Clock, MessageSquare, Briefcase, Laptop, Building2,
  Loader2, Play, FileText, Cloud, LayoutGrid,
} from "lucide-react";
import { MobileFloatingIcons } from "@/components/MobileFloatingIcons";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { FAQ_DATA } from "@/lib/seo";
import heroTeamImage from "@/assets/hero section team img.webp";
import gcetjLogo from "../../assets/college-logo/thanjavur.png";
import srustiLogo from "../../assets/college-logo/SRUSTI-removebg-preview.png";
import snistLogo from "../../assets/college-logo/Sreenidhi.png";
import mzcetLogo from "../../assets/college-logo/mzcet-logo__1_-removebg-preview.png";
import annaLogo from "../../assets/college-logo/anna.png";
import srrcLogo from "../../assets/college-logo/sri raja.png";
import yrTechLogo from "@/assets/yr-tech logo.png";
import vinixLogo from "@/assets/vinix.png";
import msmeLogo from "@/assets/msme.png";
import skyrovixLogo from "@/assets/logo.png";
import { CollegeLogoMarquee } from "@/components/CollegeLogoMarquee";

const COURSE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen, Layers, Monitor, Server, BarChart3, Brain, Palette, Code2, Shield, TrendingUp,
};

export const Route = createFileRoute("/_navbar-layout/")({
  head: () => {
    const isFounderSubdomain = typeof window !== "undefined" && (
      window.location.hostname === "founder.skyrovix.online" ||
      window.location.search.includes("founder=true")
    );

    if (isFounderSubdomain) {
      return {
        meta: [
          { title: "Hariharan S | Founder & CEO of Skyrovix | Executive Profile" },
          { name: "description", content: "Hariharan S is the Founder and CEO of Skyrovix IT Solutions, leading virtual skill development, MSME-registered internships, and code-sandbox learning ecosystems." },
          { name: "keywords", content: "Hariharan S, Skyrovix Founder, Hariharan Skyrovix, Hariharan S CEO, virtual internship founder, India skill development leadership, Skyrovix CEO profile" },
          { name: "robots", content: "index, follow" },
          { property: "og:type", content: "profile" },
          { property: "og:title", content: "Hariharan S — Founder & CEO of Skyrovix" },
          { property: "og:description", content: "Leading the next generation of project-based virtual learning programs for students in India." },
          { property: "og:url", content: "https://founder.skyrovix.online" },
          { property: "og:image", content: "https://skyrovix.online/founder.jpeg" },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:title", content: "Hariharan S — Founder & CEO of Skyrovix" },
          { name: "twitter:description", content: "Leading the next generation of project-based virtual learning programs for students in India." },
          { rel: "canonical", href: "https://founder.skyrovix.online" },
        ],
      };
    }

    return {
      meta: [
        { title: "Skyrovix | Virtual Internship with Certificate & Real Projects" },
        { name: "description", content: "Skyrovix is a virtual internship platform offering hands-on projects, offer letters, certificates, and mentor support in Full Stack, AI, Python, Data Science, Cyber Security, Cloud, UI/UX, and more." },
        { name: "keywords", content: "Skyrovix Internship, Skyrovix Virtual Internship, Skyrovix IT Solutions Internship, online internship India, virtual internship with certificate, remote internship for students, project based internship, full stack development internship, Python internship, Java internship, AI internship, machine learning internship, data science internship, cyber security internship, cloud computing internship, React internship, MERN stack internship, UI UX internship, graphic design internship, internship with offer letter, internship with certificate, internship with real projects, internship for college students, engineering internship, computer science internship, free internship, work from home internship, summer internship 2026, internship program India, best virtual internship for engineering students, online internship with certificate and offer letter, internship with QR verified certificate, internship for CSE students, internship for IT students, web development internship India" },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Skyrovix" },
        { property: "og:title", content: "Skyrovix: Virtual Internship with Certificate & Real Projects | Skyrovix" },
        { property: "og:description", content: "Skyrovix is a virtual internship platform with hands-on projects, offer letters, and certificates in Full Stack, AI, Python, Data Science, Cyber Security, Cloud, UI/UX & more." },
        { property: "og:url", content: "https://skyrovix.online/" },
        { property: "og:image", content: "https://skyrovix.online/og-default.png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: "Skyrovix Virtual Internship with Certificate & Real Projects" },
        { property: "og:locale", content: "en_IN" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@skyrovix" },
        { name: "twitter:title", content: "Skyrovix: Virtual Internship with Certificate & Real Projects | Skyrovix" },
        { name: "twitter:description", content: "Skyrovix virtual internship platform — hands-on projects, offer letters, and certificates in Full Stack, AI, Python, Data Science, Cyber Security & more." },
        { name: "twitter:image", content: "https://skyrovix.online/og-default.png" },
        { name: "twitter:image:alt", content: "Skyrovix Virtual Internship with Certificate & Real Projects" },
        { rel: "canonical", href: "https://skyrovix.online/" },
      ],
    };
  },
  component: Landing,
});

function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applyDomain, setApplyDomain] = useState<string | null>(null);
  const [isFounder, setIsFounder] = useState(false);

  const { data: feeSettings } = useQuery<PublicFeeSettings>({
    queryKey: ["public-fee-settings"],
    queryFn: () => getPublicFeeSettings(),
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  const { data: stats } = useQuery<PublicPlatformStats>({
    queryKey: ["platform-stats"],
    queryFn: () => getPublicPlatformStats(),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const certFee = feeSettings?.certificateFee?.amount ?? 100;

  const steps = useMemo(() => [
    { icon: Rocket, title: "Apply", desc: "Pick a domain and submit your details." },
    { icon: FileCheck, title: "Offer + ID", desc: "Instant offer letter & digital ID card." },
    { icon: GraduationCap, title: "5 Tasks", desc: "Build real, portfolio-grade projects." },
    { icon: IndianRupee, title: "Payment", desc: `Pay ₹${certFee} certification fee via UPI/Cashfree.` },
    { icon: Award, title: "Certificate", desc: "Verified certificate with QR code." },
  ], [certFee]);

  const faqItems = useMemo(() => [
    { q: "What is the Skyrovix internship program?", a: "It is a task-based virtual internship where you complete 5 real-world projects in your chosen domain. You get an instant offer letter, digital ID card, mentor reviews, and a verified certificate with QR code upon completion." },
    { q: "Is there any application fee?", a: `No. Applying and receiving the offer letter and ID card is completely free. A ₹${certFee} certification fee is payable only after completing all 5 tasks, just before the certificate is issued.` },
    { q: "How long does the internship take?", a: "The internship is self-paced. Most students complete it in 2–4 weeks, but you can finish faster or take more time depending on your schedule." },
    { q: "What domains are available?", a: "We offer 25+ domains including Full Stack Development, Frontend, Backend, Data Science, AI & ML, UI/UX Design, Python, Java, Cyber Security, Digital Marketing, and many more." },
    { q: "Will I get an offer letter and ID card?", a: "Yes. Immediately after applying, you receive an instant offer letter and a digital ID card with your name, domain, intern ID, and a QR code." },
    { q: "Is the certificate verifiable?", a: "Yes. Every certificate has a unique ID and QR code. Employers can verify its authenticity on our Verify Certificate page." },
    { q: "Who reviews my task submissions?", a: "Each task is reviewed by our mentor team. You'll receive feedback and can resubmit if needed. A task is marked approved once it meets the required standards." },
    { q: "Do I get a certificate if I don't complete all tasks?", a: `The certificate is issued only after you complete and get approval on all 5 tasks and pay the ₹${certFee} certification fee.` },
  ], [certFee]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsFounder(
        window.location.hostname === "founder.skyrovix.online" ||
        window.location.search.includes("founder=true")
      );
    }
  }, []);

  if (isFounder) {
    return <FounderProfileView />;
  }

  return (
    <div className="w-full">
      <FAQJsonLd faqs={FAQ_DATA} />
      <BreadcrumbJsonLd items={[{ name: "Home", url: "https://skyrovix.online/" }]} />
      {/* ─── HERO ─── */}
      <AuroraBackground>
        <section className="relative min-h-[85vh] lg:min-h-[88vh] pt-28 sm:pt-32 pb-12 sm:pb-16 flex items-center justify-center overflow-x-hidden">
          {/* Floating programming language icons across entire hero */}
          <MobileFloatingIcons />
          <div className="mx-auto max-w-7xl px-4 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">

              {/* Left Column: Hero Text Content with Clean, Fast Rendering */}
              <div className="lg:col-span-7 flex flex-col items-start text-left w-full px-2 sm:px-0">

                {/* Internship Platform Badge */}
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#f95c4b]/20 bg-[#f95c4b]/10 px-4 py-2 text-[10px] sm:text-xs font-bold text-[#f95c4b] dark:text-[#ee9590] shadow-sm backdrop-blur-md">
                  <span className="animate-pulse size-2 rounded-full bg-[#f95c4b] shrink-0" />
                  <span>🎓 INDIA'S MOST PRACTICAL VIRTUAL INTERNSHIP PLATFORM</span>
                </div>

                {/* Primary Heading */}
                <h1 className="font-display text-[2.4rem] leading-[1.12] sm:text-5xl lg:text-[62px] font-extrabold tracking-tight text-[#181619] dark:text-white text-left">
                  Build Skills.<br />
                  Gain Experience.<br />
                  <span className="bg-gradient-to-r from-[#f95c4b] via-[#ee9590] to-[#f95c4b] bg-clip-text text-transparent">Get Certified.</span>
                </h1>

                {/* Sub-headline description */}
                <p className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed text-left font-medium">
                  Skyrovix Internship Program helps students and professionals work on real-world projects, gain practical skills, and receive industry-recognized certificates.
                </p>

                {/* Checklist items — glassmorphism on dark */}
                <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-2 max-w-lg w-full">
                  {[
                    { label: "Real-world Projects", icon: Code2, color: "text-[#f95c4b]", bg: "bg-white dark:bg-[#201d22] border-[#e5e7eb] dark:border-white/10" },
                    { label: "Mentor Guidance", icon: Users, color: "text-[#403b42] dark:text-[#ee9590]", bg: "bg-white dark:bg-[#201d22] border-[#e5e7eb] dark:border-white/10" },
                    { label: "Certificate & LOR", icon: FileText, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-white dark:bg-[#201d22] border-[#e5e7eb] dark:border-white/10" },
                    { label: "100% Remote", icon: Globe, color: "text-[#f95c4b]", bg: "bg-white dark:bg-[#201d22] border-[#e5e7eb] dark:border-white/10" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border ${item.bg} backdrop-blur-sm transition-all duration-200 shadow-sm hover:scale-[1.02] cursor-default`}
                    >
                      <div className={`size-7 rounded-lg bg-white/80 dark:bg-white/10 flex items-center justify-center ${item.color} shrink-0 shadow-sm`}>
                        <item.icon className="size-3.5" />
                      </div>
                      <span className="text-[11px] sm:text-sm font-semibold text-slate-800 dark:text-white/90">{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Buttons Row with smooth CSS hover & tap */}
                <div className="mt-6 sm:mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <div className="w-full sm:w-auto transition-transform hover:-translate-y-0.5 active:scale-95 duration-150">
                    <Link to="/auth" search={{ redirect: undefined }} className="w-full sm:w-auto block">
                      <Button size="lg" className="w-full sm:w-auto rounded-xl bg-[#f95c4b] hover:bg-[#e04b3a] text-white border-0 px-8 py-5 sm:py-6 text-sm sm:text-base font-bold shadow-lg shadow-[#f95c4b]/25 transition-all duration-300 cursor-pointer">
                        Explore Internships <ArrowRight className="ml-2 size-4" />
                      </Button>
                    </Link>
                  </div>
                  <div className="w-full sm:w-auto transition-transform hover:-translate-y-0.5 active:scale-95 duration-150">
                    <a href="#how-it-works" className="w-full sm:w-auto block">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-xl border border-[#e5e7eb] dark:border-white/15 px-8 py-5 sm:py-6 text-sm sm:text-base font-semibold text-[#181619] dark:text-white hover:bg-white dark:hover:bg-white/10 hover:border-[#f95c4b] transition-all flex items-center justify-center gap-2 bg-white/50 dark:bg-white/5 backdrop-blur-md cursor-pointer">
                        <div className="size-6 rounded-full bg-slate-100 dark:bg-white/15 flex items-center justify-center text-slate-800 dark:text-white"><Play className="size-3 fill-current ml-0.5" /></div>
                        How It Works
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Coupon banner */}
                <div className="mt-6 sm:mt-7 p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-[#201d22]/80 border border-[#f95c4b]/20 max-w-xl w-full flex items-center justify-between gap-3 backdrop-blur-md shadow-sm">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="size-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-300 shrink-0"><Sparkles className="size-5" /></div>
                    <div className="text-left min-w-0">
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-300">FIRST100 COUPON</p>
                      <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">First 100 students get internship for FREE!</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setApplyDomain(DOMAINS[0]?.slug)}
                    className="whitespace-nowrap shrink-0 px-3.5 sm:px-4 py-2 rounded-xl bg-[#181619] hover:bg-[#f95c4b] dark:bg-[#f95c4b] text-white text-[11px] sm:text-xs font-bold shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    Use Code: FIRST100
                  </button>
                </div>

              </div>

              {/* Right Column: Dynamic Graphic & Stats overlay */}
              <div className="lg:col-span-5 flex flex-col items-center relative w-full lg:mt-0 mt-10">

                {/* SVG Curve Background & Doodles - hidden on mobile to keep it clean */}
                <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-visible hidden sm:block">
                  <svg viewBox="0 0 500 400" className="absolute inset-0 w-full h-full text-blue-400/40 dark:text-blue-500/25" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="archGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" className="stop-color-light-start dark:stop-color-dark-start" stopOpacity="0.9" />
                        <stop offset="100%" className="stop-color-light-end dark:stop-color-dark-end" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    <style>{`
                      .stop-color-light-start { stop-color: #bfdbfe; }
                      .stop-color-light-end { stop-color: #eff6ff; }
                      .dark .stop-color-dark-start { stop-color: #1e3a8a; }
                      .dark .stop-color-dark-end { stop-color: #020617; }
                    `}</style>
                    {/* Clean curve filled arch */}
                    <path d="M-220,480 C10,-120 490,-120 720,480 Z" fill="url(#archGradient)" />
                    {/* Dashed outer line */}
                    <path d="M-220,470 C10,-140 490,-140 720,470" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6,6" className="opacity-40" />
                  </svg>

                  {/* Paper Plane SVG */}
                  <svg viewBox="0 0 24 24" className="absolute top-[5%] left-[3%] size-8 text-blue-500/60 dark:text-blue-400/40 -rotate-12 animate-float">
                    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>

                  {/* Left Arrow Doodle */}
                  <svg viewBox="0 0 100 100" className="absolute top-[48%] left-[-45px] size-14 text-blue-400/50 dark:text-blue-500/35 -rotate-45">
                    <path d="M10,80 Q50,40 90,80" fill="none" stroke="currentColor" strokeWidth="1.8" strokeDasharray="4,4" />
                    <path d="M80,65 L90,80 L75,80" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  </svg>

                  {/* Right Loop Doodle */}
                  <svg viewBox="0 0 100 100" className="absolute top-[35%] right-[-35px] size-14 text-blue-400/50 dark:text-blue-500/35 rotate-12">
                    <path d="M10,20 C40,40 65,10 85,55" fill="none" stroke="currentColor" strokeWidth="1.8" strokeDasharray="4,4" />
                    <path d="M72,42 L85,55 L90,40" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </div>

                {/* Student team image */}
                <img
                  src={heroTeamImage}
                  alt="Skyrovix Interns"
                  className="relative z-10 w-full max-w-[440px] sm:max-w-[520px] lg:max-w-[550px] lg:scale-110 lg:translate-y-4 h-auto object-contain select-none pointer-events-none"
                />

                {/* Floating Badge Cards — visible on all screens with smooth hover */}
                {/* Real-world Projects — left side */}
                <div className="absolute top-[30%] left-1 sm:-left-10 lg:-left-28 bg-white dark:bg-[#201d22] border border-[#e5e7eb] dark:border-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-xl backdrop-blur-md flex items-center gap-2 sm:gap-3 z-20 cursor-default hover:scale-105 transition-transform duration-200">
                  <div className="size-7 sm:size-9 rounded-lg sm:rounded-xl bg-[#f95c4b]/10 flex items-center justify-center text-[#f95c4b] font-bold shrink-0"><Code2 className="size-3.5 sm:size-4.5" /></div>
                  <span className="text-[10px] sm:text-xs font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">Real-world Projects</span>
                </div>

                {/* Industry Recognized Certificate — top center */}
                <div className="absolute -top-8 sm:-top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-[#201d22] border border-[#e5e7eb] dark:border-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-xl backdrop-blur-md flex items-center gap-2 sm:gap-3 z-20 whitespace-nowrap cursor-default hover:scale-105 transition-transform duration-200">
                  <div className="size-7 sm:size-9 rounded-lg sm:rounded-xl bg-[#f95c4b]/10 flex items-center justify-center text-[#f95c4b] font-bold shrink-0"><GraduationCap className="size-3.5 sm:size-4.5" /></div>
                  <span className="text-[10px] sm:text-xs font-bold text-gray-800 dark:text-gray-200">Industry Certificate</span>
                </div>

                {/* Internship Offer Letter — right side top */}
                <div className="absolute top-[22%] right-1 sm:-right-10 lg:-right-28 bg-white dark:bg-[#201d22] border border-[#e5e7eb] dark:border-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-xl backdrop-blur-md flex items-center gap-2 sm:gap-3 z-20 cursor-default hover:scale-105 transition-transform duration-200">
                  <div className="size-7 sm:size-9 rounded-lg sm:rounded-xl bg-[#f95c4b]/10 flex items-center justify-center text-[#f95c4b] font-bold shrink-0"><FileText className="size-3.5 sm:size-4.5" /></div>
                  <span className="text-[10px] sm:text-xs font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">Offer Letter</span>
                </div>

                {/* Task-based internship — right side bottom */}
                <div className="absolute bottom-[30%] right-1 sm:-right-10 lg:-right-28 bg-white dark:bg-[#201d22] border border-[#e5e7eb] dark:border-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-xl backdrop-blur-md flex items-center gap-2 sm:gap-3 z-20 cursor-default hover:scale-105 transition-transform duration-200">
                  <div className="size-7 sm:size-9 rounded-lg sm:rounded-xl bg-[#f95c4b]/10 flex items-center justify-center text-[#f95c4b] font-bold shrink-0"><Users className="size-3.5 sm:size-4.5" /></div>
                  <span className="text-[10px] sm:text-xs font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">Task-based</span>
                </div>

                {/* Statistics Card — 2×2 on mobile, 4-col on sm+ */}
                <div className="relative z-20 w-full -mt-4 sm:-mt-6 bg-white dark:bg-[#201d22] rounded-[24px] sm:rounded-[28px] border border-[#e5e7eb] dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.08)] grid grid-cols-2 sm:grid-cols-4 max-w-2xl overflow-hidden">
                  {/* Students Enrolled */}
                  <div className="text-center flex flex-col items-center justify-center py-4 px-2 border-r border-b sm:border-b-0 border-slate-100 dark:border-slate-800/80">
                    <div className="size-9 sm:size-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mb-2">
                      <Users className="size-4 sm:size-5" />
                    </div>
                    <div className="text-base sm:text-xl font-extrabold text-[#181619] dark:text-white leading-tight tracking-tight">
                      {stats?.studentsEnrolledDisplay || "1,077+"}
                    </div>
                    <div className="mt-1 text-[10px] sm:text-[11px] text-muted-foreground font-bold leading-tight">Students Enrolled</div>
                  </div>

                  {/* Internship Domains */}
                  <div className="text-center flex flex-col items-center justify-center py-4 px-2 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800/80">
                    <div className="size-9 sm:size-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 mb-2">
                      <Briefcase className="size-4 sm:size-5" />
                    </div>
                    <div className="text-base sm:text-xl font-extrabold text-[#181619] dark:text-white leading-tight tracking-tight">
                      {stats?.internshipDomainsDisplay || "25+"}
                    </div>
                    <div className="mt-1 text-[10px] sm:text-[11px] text-muted-foreground font-bold leading-tight">Internship Domains</div>
                  </div>

                  {/* Projects Available */}
                  <div className="text-center flex flex-col items-center justify-center py-4 px-2 border-r border-slate-100 dark:border-slate-800/80">
                    <div className="size-9 sm:size-10 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 mb-2">
                      <Code2 className="size-4 sm:size-5" />
                    </div>
                    <div className="text-base sm:text-xl font-extrabold text-[#181619] dark:text-white leading-tight tracking-tight">
                      {stats?.projectsAvailableDisplay || "175+"}
                    </div>
                    <div className="mt-1 text-[10px] sm:text-[11px] text-muted-foreground font-bold leading-tight">Projects Available</div>
                  </div>

                  {/* Average Rating */}
                  <div className="text-center flex flex-col items-center justify-center py-4 px-2">
                    <div className="size-9 sm:size-10 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-500 mb-2">
                      <Star className="size-4 sm:size-5 fill-amber-500" />
                    </div>
                    <div className="text-base sm:text-xl font-extrabold text-[#181619] dark:text-white leading-tight tracking-tight">
                      {stats?.averageRating || "4.9/5"}
                    </div>
                    <div className="mt-1 text-[10px] sm:text-[11px] text-muted-foreground font-bold leading-tight">Average Rating</div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>
      </AuroraBackground>

      {/* ─── TRUSTED BY COLLEGES ─── */}
      <Reveal delay={0.1}>
        <section className="border-b border-[#e5e7eb] dark:border-white/10 bg-[#faf8f2] dark:bg-[#181619] py-8 sm:py-10 relative z-10">
          <div className="mx-auto max-w-7xl px-4 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
            {/* Left Title */}
            <div className="text-center lg:text-left shrink-0 max-w-[260px]">
              <p className="text-[11px] sm:text-[12px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-tight">
                Trusted by students from leading colleges across India
              </p>
            </div>

            {/* Right Logos Container */}
            <div className="flex flex-col gap-5 w-full lg:max-w-4xl">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-6">
                {[
                  {
                    name: "Anna University",
                    shortName: "Anna University",
                    location: "Chennai",
                    image: annaLogo,
                  },
                  {
                    name: "Government College, Thanjavur",
                    shortName: "Government College of Engineering",
                    location: "Thanjavur",
                    image: gcetjLogo,
                  },
                  {
                    name: "Sreenidhi Institute, Telangana",
                    shortName: "Sreenidhi Institute of Science & Technology",
                    location: "Telangana",
                    image: snistLogo,
                  },
                  {
                    name: "Sri Raaja Raajan College, Tamil Nadu",
                    shortName: "Sri Raaja Raajan College of Engineering & Technology",
                    location: "Tamil Nadu",
                    image: srrcLogo,
                  },
                  {
                    name: "Mount Zion College, Pudukkottai",
                    shortName: "Mount Zion College of Engineering & Technology",
                    location: "Pudukkottai",
                    image: mzcetLogo,
                  },
                  {
                    name: "Srusti Academy, Odisha",
                    shortName: "Srusti Academy of Management and Technology",
                    location: "Odisha",
                    image: srustiLogo,
                  }
                ].map((uni) => (
                  <div key={uni.name} className="flex items-start gap-2 sm:gap-3 transition-all duration-350 hover:scale-[1.02] cursor-default opacity-95 hover:opacity-100">
                    {uni.image ? (
                      <img src={uni.image} alt={uni.name} className="h-8 sm:h-10 w-8 sm:w-10 object-contain shrink-0 mt-0.5 dark:brightness-110" />
                    ) : (
                      <div className="size-8 sm:size-10 rounded-lg flex items-center justify-center border shadow-sm shrink-0" />
                    )}
                    <div className="flex flex-col text-left justify-start min-w-0">
                      <span className="text-[11px] sm:text-[13px] font-extrabold tracking-tight text-slate-800 dark:text-slate-200 leading-tight block break-words">
                        {uni.shortName}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5 sm:mt-1 block">
                        {uni.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center lg:justify-end text-xs sm:text-[13px] font-extrabold text-[#f95c4b] dark:text-[#ee9590]">
                <span className="whitespace-nowrap">
                  ... and more colleges across India
                </span>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ─── COMPACT ABOUT ─── */}
      <section className="py-20 sm:py-24 overflow-hidden relative z-10">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <div className="relative rounded-3xl border border-border/60 bg-gradient-to-br from-[#faf8f2] via-white to-white dark:from-[#201d22] dark:via-[#181619] dark:to-[#181619] p-8 sm:p-12 border-[#e5e7eb] dark:border-white/10 shadow-lg">
              <div className="absolute -top-20 -right-20 size-60 rounded-full bg-blue-500/5 blur-3xl" />
              <div className="relative grid items-center gap-8 sm:grid-cols-2">
                <div>
                  <p className="inline-flex items-center gap-1.5 rounded-full border border-[#f95c4b]/20 bg-[#f95c4b]/10 px-3.5 py-1 text-xs font-bold tracking-widest text-[#f95c4b] dark:text-[#ee9590] uppercase mb-5">About Skyrovix</p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
                    MSME-registered. <span className="bg-gradient-to-r from-[#f95c4b] to-[#ee9590] bg-clip-text text-transparent">Student-built.</span>
                  </h2>
                  <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
                    Skyrovix runs a task-based virtual internship program across {stats?.internshipDomainsDisplay || "25+"} domains. Apply free, get
                    an instant offer letter and ID card, complete {stats?.projectsAvailableDisplay || "175+"} real projects, earn a QR-verified
                    certificate.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: stats?.internshipDomainsDisplay || "25+", label: "Domains", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50/50 dark:bg-violet-950/20" },
                    { value: stats?.projectsAvailableDisplay || "175+", label: "Projects", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50/50 dark:bg-emerald-950/20" },
                    { value: "100%", label: "Online", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50/50 dark:bg-blue-950/20" },
                    { value: `₹${certFee}`, label: "Cert fee", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50/50 dark:bg-amber-950/20" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="group rounded-2xl border border-slate-200/50 dark:border-slate-800/60 bg-white/70 dark:bg-[#201d22]/70 p-4 text-center shadow-sm hover:shadow-md transition-all duration-300 cursor-default hover:-translate-y-1"
                    >
                      <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                      <div className="text-[11px] text-muted-foreground font-bold mt-1 uppercase tracking-wider">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── STUDENTS FROM LEADING COLLEGES (RIGHT TO LEFT MARQUEE) ─── */}
      <CollegeLogoMarquee />

      {/* ─── HOW IT WORKS ─── */}
      <section className="border-y border-[#e5e7eb] dark:border-white/10 bg-[#faf8f2] dark:bg-[#181619] py-20 sm:py-24 relative z-10">
        <div className="mx-auto max-w-7xl px-4">
          <Reveal>
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-xs font-semibold rounded-full border border-border/60 uppercase tracking-widest text-[#f95c4b] dark:text-[#ee9590] bg-[#f95c4b]/10 border-[#f95c4b]/20">How it works</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white">Your journey to certification</h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground font-medium">A simple 5-step journey from application to certification.</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((s, i) => (
              <div
                key={i}
                className="group relative rounded-2xl border border-border/50 bg-white/70 dark:bg-[#201d22]/70 p-6 backdrop-blur transition-all duration-300 hover:shadow-[0_15px_30px_rgba(0,0,0,0.05)] hover:border-[#ee9590] hover:bg-white dark:hover:bg-[#0f172a] cursor-default hover:-translate-y-1"
              >
                <div className="absolute -top-3 left-6 grid size-7 place-items-center rounded-full bg-[#f95c4b] text-xs font-extrabold text-white shadow-md shadow-[#f95c4b]/30 ring-4 ring-[#f95c4b]/15 transition-transform duration-300 group-hover:scale-110">{i + 1}</div>
                <div className="size-11 rounded-2xl bg-[#f95c4b]/10 flex items-center justify-center text-[#f95c4b] group-hover:bg-[#f95c4b] group-hover:text-white transition-all duration-300 mb-4 mt-1">
                  <s.icon className="size-5 transition-transform duration-500 group-hover:rotate-12" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-[#f95c4b] dark:group-hover:text-[#ee9590] text-[15px]">{s.title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-normal font-medium">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INDUSTRY & ECOSYSTEM PARTNERS ─── */}
      <Reveal delay={0.15}>
        <section className="border-b border-border/30 bg-white/50 dark:bg-slate-950/10 py-8 sm:py-10 relative z-10">
          <div className="mx-auto max-w-7xl px-4 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
            {/* Left Title */}
            <div className="text-center lg:text-left shrink-0 max-w-[280px]">
              <p className="text-[11px] sm:text-[12px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-tight">
                Our Official Strategic &amp; Ecosystem Partners
              </p>
            </div>

            {/* Right Logos Only Container */}
            <div className="flex items-center justify-center lg:justify-start gap-8 sm:gap-14 flex-wrap w-full lg:max-w-4xl">
              <img
                src={skyrovixLogo}
                alt="Skyrovix IT Solutions"
                className="h-9 sm:h-12 w-auto object-contain transition-all duration-300 hover:scale-105 opacity-90 hover:opacity-100 dark:brightness-110"
              />
              <img
                src={vinixLogo}
                alt="Vinix Partner"
                className="h-8 sm:h-11 w-auto object-contain transition-all duration-300 hover:scale-105 opacity-90 hover:opacity-100 dark:brightness-110"
              />
              <img
                src={yrTechLogo}
                alt="YR Tech"
                className="h-9 sm:h-12 w-auto object-contain transition-all duration-300 hover:scale-105 opacity-90 hover:opacity-100 dark:brightness-110"
              />
            </div>
          </div>
        </section>
      </Reveal>

      {/* ─── WHY SKYROVIX ─── */}
      <section className="py-20 sm:py-24 relative z-10">
        <div className="mx-auto max-w-7xl px-4">
          <Reveal>
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-xs font-semibold rounded-full border border-border/60 uppercase tracking-widest text-[#f95c4b] dark:text-[#ee9590] bg-[#f95c4b]/10 border-[#f95c4b]/20">Why Skyrovix</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white">Built differently</h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground font-medium">Everything you need to launch your career — in one platform.</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Briefcase, title: "Real Projects", desc: "Build portfolio-grade work, not toy assignments. Every task ships production-quality code.", bg: "bg-violet-50/80 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400" },
              { icon: MessageSquare, title: "Mentor Reviews", desc: "Get detailed feedback on every submission. Revise, improve, and ship better work.", bg: "bg-emerald-50/80 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400" },
              { icon: Clock, title: "Self-Paced", desc: "Learn on your schedule. Finish in 2 weeks or take 2 months — it's up to you.", bg: "bg-amber-50/80 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400" },
              { icon: Award, title: "Verified Certificate", desc: "Every certificate has a unique ID and QR code. Share it with recruiters instantly.", bg: "bg-purple-50/80 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400" },
              { icon: ShieldCheck, title: "MSME Registered", desc: "Issued by a registered IT company. Adds real weight to your resume and LinkedIn.", bg: "bg-red-50/80 dark:bg-red-950/20 text-red-600 dark:text-red-400" },
              { icon: IndianRupee, title: "No Hidden Fees", desc: `Apply and start for free. Pay only ₹${certFee} at certification — no strings attached.`, bg: "bg-blue-50/80 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400" },
            ].map((b) => (
              <div
                key={b.title}
                className="group rounded-2xl border border-border/50 bg-white/70 dark:bg-[#201d22]/70 p-6 transition-all duration-300 hover:shadow-[0_15px_30px_rgba(0,0,0,0.05)] hover:border-[#ee9590] hover:bg-white dark:hover:bg-[#0f172a] cursor-default hover:-translate-y-1"
              >
                <div className={`grid size-11 place-items-center rounded-2xl ${b.bg} transition-all duration-300 group-hover:scale-110 shadow-sm`}>
                  <b.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-bold text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-[#f95c4b] dark:group-hover:text-[#ee9590] text-[15px]">{b.title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-normal font-medium">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DOMAINS ─── */}
      <section className="border-y border-[#e5e7eb] dark:border-white/10 bg-[#faf8f2] dark:bg-[#181619] py-20 sm:py-24 relative z-10">
        <div className="mx-auto max-w-7xl px-4">
          <Reveal>
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-xs font-semibold rounded-full border border-border/60 uppercase tracking-widest text-[#f95c4b] dark:text-[#ee9590] bg-[#f95c4b]/10 border-[#f95c4b]/20">Domains</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center justify-center gap-4">
                <span className="text-blue-500/30 text-2xl font-light">\\</span>
                Explore Internship Domains
                <span className="text-blue-500/30 text-2xl font-light">//</span>
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground font-medium">Select a track to launch your professional task-based curriculum.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { slug: "fullstack", name: "Full Stack Development", count: "12 Projects", icon: Code2, bg: "bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400" },
              { slug: "datascience", name: "Data Science & Analytics", count: "12 Projects", icon: BarChart3, bg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" },
              { slug: "aiml", name: "Artificial Intelligence", count: "12 Projects", icon: Brain, bg: "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400" },
              { slug: "mernstack", name: "Cloud Computing", count: "12 Projects", icon: Cloud, bg: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400" },
              { slug: "cybersecurity", name: "Cyber Security", count: "12 Projects", icon: Shield, bg: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400" },
              { slug: "uiux", name: "UI/UX Design", count: "12 Projects", icon: Palette, bg: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400" },
              { slug: "all", name: "View All Domains", count: "30+ Domains", icon: LayoutGrid, bg: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400", isLink: true },
            ].map((d, i) => {
              const CardIcon = d.icon;
              const cardContent = (
                <div className="flex flex-col items-center text-center p-5 h-full">
                  <div className={`size-12 rounded-2xl flex items-center justify-center shadow-sm ${d.bg} transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md`}>
                    <CardIcon className="size-5" />
                  </div>
                  <h3 className="mt-4 text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-tight transition-colors duration-300 group-hover:text-[#f95c4b] dark:group-hover:text-[#ee9590]">{d.name}</h3>
                  <p className="mt-2 text-[10px] sm:text-xs text-muted-foreground font-semibold">{d.count}</p>
                </div>
              );

              if (d.isLink) {
                return (
                  <div
                    key={i}
                    className="h-full hover:-translate-y-1 transition-transform duration-200"
                  >
                    <Link
                      to="/internship"
                      search={{ apply: undefined }}
                      className="group block h-full rounded-2xl border border-border/50 bg-white/70 dark:bg-[#201d22]/70 transition-all duration-300 hover:shadow-lg hover:border-[#ee9590] hover:bg-white dark:hover:bg-[#0f172a]"
                    >
                      {cardContent}
                    </Link>
                  </div>
                );
              }

              return (
                <div
                  key={i}
                  className="h-full hover:-translate-y-1 transition-transform duration-200"
                >
                  <button
                    onClick={() => setApplyDomain(d.slug)}
                    className="group w-full h-full text-left rounded-2xl border border-border/50 bg-white/70 dark:bg-[#201d22]/70 transition-all duration-300 hover:shadow-lg hover:border-[#ee9590] hover:bg-white dark:hover:bg-[#0f172a] cursor-pointer"
                  >
                    {cardContent}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ─── TESTIMONIALS ─── */}
      <section className="py-20 sm:py-24 overflow-hidden">
        <div className="mx-auto max-w-5xl px-4">
          <Reveal>
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-xs font-medium rounded-full border border-border/60">Testimonials</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">What students say</h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground px-2">Real reviews from interns who completed the program.</p>
            </div>
          </Reveal>
        </div>
        <ReviewsMarquee />
      </section>

      {/* ─── FAQ ─── */}
      <section className="border-y border-[#e5e7eb] dark:border-white/10 bg-[#faf8f2] dark:bg-[#181619] py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <Reveal>
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-xs font-medium rounded-full border border-border/60">FAQ</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Frequently Asked Questions</h2>
              <p className="mt-3 text-muted-foreground">Everything you need to know about the Skyrovix internship program.</p>
            </div>
          </Reveal>
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((item, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <AccordionItem value={`faq-${i}`} className="rounded-2xl border border-border/50 bg-white/60 dark:bg-[#201d22]/60 px-5 sm:px-6 transition-all hover:border-border">
                  <AccordionTrigger className="py-4 text-left text-sm sm:text-base font-medium hover:no-underline">{item.q}</AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              </Reveal>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#181619] via-[#201d22] to-[#181619] border border-white/10 p-8 sm:p-12 md:p-16 shadow-2xl shadow-black/40">
              {/* Diagonal light overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_40%,rgba(255,255,255,0.02)_50%,transparent_60%)]" />

              {/* Glow orbs */}
              <div className="absolute -top-32 -right-32 size-[500px] rounded-full bg-[#f95c4b]/20 blur-[120px]" />
              <div className="absolute -bottom-32 -left-32 size-[400px] rounded-full bg-indigo-500/8 blur-[100px]" />

              {/* Decorative rings */}
              <div className="absolute top-10 right-10 size-32 rounded-full border border-white/5" />
              <div className="absolute top-16 right-16 size-48 rounded-full border border-white/5" />
              <div className="absolute -bottom-8 -left-8 size-40 rounded-full border border-white/5" />

              <div className="relative flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                {/* Left: Content */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/8 px-4 py-1.5 text-xs font-medium text-white/70 border border-white/10 mb-5 backdrop-blur-sm">
                    <span className="size-1.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                    No application fee — pay only ₹{certFee} at certification
                  </div>

                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] text-white">
                    Ready to build
                    <br />
                    <span className="bg-gradient-to-r from-[#f95c4b] via-[#ee9590] to-white bg-clip-text text-transparent">something real?</span>
                  </h2>

                  <p className="mt-4 text-sm sm:text-base text-white/60 max-w-lg leading-relaxed">
                    Get your offer letter and ID card instantly. Complete 5 real-world tasks, get mentor feedback, and earn a verified certificate.
                  </p>

                  <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-3">
                    <motion.div
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={transitions.fast}
                    >
                      <Button asChild size="lg" className="rounded-xl bg-[#f95c4b] text-white hover:bg-[#e04b3a] border-0 shadow-xl shadow-[#f95c4b]/30 font-bold h-12 px-8 transition-all duration-300 group cursor-pointer">
                        <Link to="/auth" search={{ redirect: undefined }}>
                          Apply now
                          <ArrowRight className="ml-1.5 size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </Link>
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={transitions.fast}
                    >
                      <Button asChild size="lg" variant="outline" className="rounded-xl bg-white/5 border border-white/15 text-white/90 hover:bg-white/12 hover:text-white h-12 px-8 backdrop-blur-sm transition-all duration-300 cursor-pointer">
                        <Link to="/internship" search={{ apply: undefined }}>Explore Internships</Link>
                      </Button>
                    </motion.div>
                  </div>

                  {/* Trust line */}
                  <div className="mt-6 flex items-center justify-center lg:justify-start gap-4 text-white/40 text-xs">
                    <span className="flex items-center gap-1.5">
                      <Award size={12} />
                      25+ domains
                    </span>
                    <span className="size-1 rounded-full bg-white/20" />
                    <span className="flex items-center gap-1.5">
                      <GraduationCap size={12} />
                      Verified certificate
                    </span>
                    <span className="size-1 rounded-full bg-white/20" />
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={12} />
                      MSME registered
                    </span>
                  </div>
                </div>

                {/* Right: Visual */}
                <div className="hidden sm:block shrink-0 w-56 sm:w-64 lg:w-72">
                  <div className="relative">
                    {/* Glow behind card */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-400/20 to-purple-400/20 blur-3xl rounded-2xl" />
                    {/* Mock certificate card */}
                    <div className="relative rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm p-5 shadow-2xl">
                      <div className="hidden sm:flex items-center gap-3 mb-4">
                        <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center">
                          <Award size={20} className="text-blue-300" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">Certificate</p>
                          <p className="text-white/40 text-xs">Upon completion</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 rounded-full bg-white/10 w-3/4" />
                        <div className="h-2 rounded-full bg-white/8 w-1/2" />
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="size-6 rounded-full bg-emerald-400/20 flex items-center justify-center">
                              <ShieldCheck size={12} className="text-emerald-400" />
                            </div>
                            <span className="text-white/50 text-xs">Verified</span>
                          </div>
                          <div className="flex -space-x-1">
                            <div className="size-5 rounded-full bg-white/15 border border-white/10" />
                            <div className="size-5 rounded-full bg-white/10 border border-white/10" />
                            <div className="size-5 rounded-full bg-white/8 border border-white/10" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── APPLY DIALOG ─── */}
      <ApplicationFormDialog
        open={!!applyDomain}
        onOpenChange={(o) => { if (!o) setApplyDomain(null); }}
        defaultDomain={applyDomain ?? undefined}
      />
    </div>
  );
}

const STATIC_REVIEWS = [
  { id: "s1", rating: 5, content: "The Skyrovix Virtual Internship gave me practical experience through real-world tasks. The structured learning path, quick support, and verified certificate made it an excellent learning experience.", name: "Vishal R", role: "Full Stack Development" },
  { id: "s2", rating: 5, content: "I improved my AI and prompt engineering skills significantly during this internship. The tasks were well designed and the certificate verification made it more valuable.", name: "Gandhi Rajan", role: "Prompt Engineering" },
  { id: "s3", rating: 5, content: "The internship provided hands-on assignments that helped me understand real cybersecurity concepts. I highly recommend Skyrovix to students looking for practical learning.", name: "Rohit", role: "Cyber Security" },
  { id: "s4", rating: 5, content: "I enjoyed completing the project-based tasks. The dashboard, offer letter, and certificate verification system were smooth and professional.", name: "Sivaraman", role: "Python Development" },
  { id: "s5", rating: 5, content: "The internship helped me strengthen both frontend and backend skills. The learning was organized and the admin verification process ensured quality throughout.", name: "Manikandan", role: "Full Stack Development" },
  { id: "s6", rating: 5, content: "Skyrovix provides an excellent platform for students to gain industry-oriented experience. The practical projects and mentor feedback were extremely helpful.", name: "Sharik", role: "AI & Machine Learning" },
  { id: "s7", rating: 5, content: "Completed the UI/UX track in just 3 weeks. The design tasks were real-world and challenging. My portfolio looks 10x better now thanks to Skyrovix!", name: "Priya N", role: "UI/UX Design" },
  { id: "s8", rating: 5, content: "Got my certificate the same day I finished. The QR verification impressed my placement officer. Skyrovix is legit and highly recommended!", name: "Arjun M", role: "Data Science" },
  { id: "s9", rating: 4, content: "Very well structured internship. The tasks pushed me to learn Docker, CI/CD and REST APIs. I came out a much better developer than I was before.", name: "Karan P", role: "Backend Development" },
  { id: "s10", rating: 5, content: "The cloud computing track was fantastic. AWS basics to advanced — all covered. Perfect for anyone wanting a cloud career.", name: "Divya K", role: "Cloud Computing" },
  { id: "s11", rating: 5, content: "Self-paced format was a lifesaver during my semester exams. Completed it on weekends and still got a great certificate. 10/10!", name: "Sneha R", role: "Python Development" },
  { id: "s12", rating: 5, content: "The Java internship tasks were industry-relevant. Got hands-on with Spring Boot and REST APIs. Best investment I've spent for my career.", name: "Aditya S", role: "Java Development" },
];

type MarqueeItem = { id: string; rating: number; content: string; name: string; role: string };

const AVATAR_PALETTE = [
  { bg: "#e0e7ff", text: "#4338ca" },
  { bg: "#ede9fe", text: "#6d28d9" },
  { bg: "#cffafe", text: "#0e7490" },
  { bg: "#d1fae5", text: "#065f46" },
  { bg: "#fef3c7", text: "#92400e" },
  { bg: "#ffe4e6", text: "#be123c" },
];

function MarqueeCard({ item }: { item: MarqueeItem }) {
  const initials = item.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const p = AVATAR_PALETTE[item.name.charCodeAt(0) % AVATAR_PALETTE.length];

  return (
    <div className="relative flex-shrink-0 w-full sm:w-[350px] mx-2 sm:mx-3 select-none rounded-2xl bg-white dark:bg-[#201d22] flex flex-col overflow-hidden shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.3)] border border-border/30">
      {/* Glass accent bar */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500" />

      {/* Decorative quote */}
      <div className="absolute -top-1 right-3 text-[56px] font-serif leading-none text-blue-100 dark:text-blue-900/30 select-none">"</div>

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Stars + verified */}
        <div className="flex items-center justify-between mb-3 mt-1">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={13} fill={i < item.rating ? "#f59e0b" : "#e5e7eb"} color={i < item.rating ? "#f59e0b" : "#e5e7eb"} />
            ))}
          </div>
          <span className="text-[10px] font-semibold text-green-600 bg-green-50 dark:bg-green-950/30 rounded-full px-2 py-0.5 border border-green-200/50 shrink-0">
            ✓ Verified
          </span>
        </div>

        {/* Review text */}
        <p className="flex-1 text-[13px] leading-[1.8] text-gray-500 dark:text-gray-400 relative z-10 line-clamp-4">
          "{item.content}"
        </p>

        {/* Author */}
        <div className="flex items-center gap-3 border-t border-border/20 pt-3.5 mt-4">
          <div
            className="grid size-9 shrink-0 place-items-center rounded-xl text-xs font-bold shadow-sm ring-2 ring-white dark:ring-[#0f172a]"
            style={{ background: p.bg, color: p.text }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white text-[13px] leading-tight truncate">{item.name}</p>
            <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5">{item.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewsMarquee() {
  const { data: liveReviews = [] } = useRecentReviews(20);

  const allItems: MarqueeItem[] = [
    ...liveReviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      content: r.content,
      name: r.profiles?.full_name ?? "Anonymous",
      role: r.target_type === "internship" ? "Internship" : "Course",
    })),
    ...STATIC_REVIEWS,
  ];

  const mid = Math.ceil(allItems.length / 2);
  const row1 = [...allItems.slice(0, mid), ...allItems.slice(0, mid)];
  const row2 = [...allItems.slice(mid), ...allItems.slice(mid)];

  const duration1 = row1.length * 5;
  const duration2 = row2.length * 5;

  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoPaused = useRef(false);
  const autoTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Track scroll position
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setActiveIdx(Math.min(idx, allItems.length - 1));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [allItems.length]);

  // Auto-advance carousel
  useEffect(() => {
    if (allItems.length <= 1) return;
    const start = () => {
      autoTimer.current = setInterval(() => {
        if (autoPaused.current) return;
        const el = scrollRef.current;
        if (!el) return;
        const next = (activeIdx + 1) % allItems.length;
        el.scrollTo({ left: el.clientWidth * next, behavior: "smooth" });
      }, 4000);
    };
    start();
    return () => { if (autoTimer.current) clearInterval(autoTimer.current); };
  }, [activeIdx, allItems.length]);

  // Pause on user interaction, resume after 6s idle
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let resumeTimeout: ReturnType<typeof setTimeout>;
    const pause = () => {
      autoPaused.current = true;
      clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(() => { autoPaused.current = false; }, 6000);
    };
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("scroll", pause, { passive: true });
    return () => {
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("scroll", pause);
      clearTimeout(resumeTimeout);
    };
  }, []);

  return (
    <div className="relative mt-6 py-1">
      {/* Mobile: modern vertical-style snap carousel */}
      <div className="sm:hidden px-4">
        <div ref={scrollRef} className="flex snap-x snap-mandatory gap-0 overflow-x-auto scroll-smooth pb-6">
          {allItems.map((item, i) => (
            <div key={`m-${item.id}-${i}`} className="snap-center shrink-0 w-full px-1">
              <MobileReviewCard item={item} />
            </div>
          ))}
        </div>
        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5">
          {allItems.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                const el = scrollRef.current;
                if (el) el.scrollTo({ left: el.clientWidth * i, behavior: "smooth" });
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIdx ? "w-6 bg-[#f95c4b]" : "w-1.5 bg-gray-300 dark:bg-white/20"
              }`}
              aria-label={`Go to review ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop: animated marquee rows */}
      <div className="hidden sm:block">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#f8fafc] dark:from-[#020617] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#f8fafc] dark:from-[#020617] to-transparent" />
        <div className="space-y-4 overflow-hidden">
          <div className="flex items-stretch" style={{ animation: `marquee-left ${duration1}s linear infinite` }}>
            {row1.map((item, i) => <MarqueeCard key={`r1-${item.id}-${i}`} item={item} />)}
          </div>
          <div className="flex items-stretch" style={{ animation: `marquee-right ${duration2}s linear infinite` }}>
            {row2.map((item, i) => <MarqueeCard key={`r2-${item.id}-${i}`} item={item} />)}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .flex:hover { animation-play-state: paused; }
        .snap-x::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

function MobileReviewCard({ item }: { item: MarqueeItem }) {
  const initials = item.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const p = AVATAR_PALETTE[item.name.charCodeAt(0) % AVATAR_PALETTE.length];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-white dark:bg-[#201d22] p-5 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.3)]">
      {/* Glass accent bar */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500" />

      {/* Decorative quote */}
      <div className="absolute -top-1 right-3 text-[56px] font-serif leading-none text-blue-100 dark:text-blue-900/30 select-none">"</div>

      {/* Stars + rating row */}
      <div className="flex items-center justify-between mb-3 mt-1">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={13} fill={i < item.rating ? "#f59e0b" : "#e5e7eb"} color={i < item.rating ? "#f59e0b" : "#e5e7eb"} />
          ))}
        </div>
        <span className="text-[10px] font-semibold text-green-600 bg-green-50 dark:bg-green-950/30 rounded-full px-2 py-0.5 border border-green-200/50 shrink-0">
          ✓ Verified
        </span>
      </div>

      {/* Review text */}
      <p className="text-[13px] leading-[1.8] text-gray-500 dark:text-gray-400 mb-4 relative z-10 line-clamp-4">
        "{item.content}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 border-t border-border/20 pt-3.5">
        <div
          className="grid size-9 shrink-0 place-items-center rounded-xl text-xs font-bold shadow-sm ring-2 ring-white dark:ring-[#0f172a]"
          style={{ background: p.bg, color: p.text }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white text-[13px] leading-tight">{item.name}</p>
          <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5">{item.role}</p>
        </div>
      </div>
    </div>
  );
}



function TypingText({ texts }: { texts: string[] }) {
  const [index, setIndex] = useState(0);
  const [display, setDisplay] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = texts[index];
    let timer: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      if (display.length < current.length) {
        timer = setTimeout(() => setDisplay(current.slice(0, display.length + 1)), 50);
      } else {
        timer = setTimeout(() => setIsDeleting(true), 2000);
      }
    } else {
      if (display.length > 0) {
        timer = setTimeout(() => setDisplay(display.slice(0, -1)), 25);
      } else {
        setIsDeleting(false);
        setIndex((i) => (i + 1) % texts.length);
      }
    }

    return () => clearTimeout(timer);
  }, [display, isDeleting, index, texts]);

  return (
    <span className="font-semibold brand-text">
      {display}
      <motion.span
        variants={brightChatCaret}
        initial="initial"
        animate="animate"
        className="ml-0.5 inline-block"
      >
        |
      </motion.span>
    </span>
  );
}
