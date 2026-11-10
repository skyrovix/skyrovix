import { useState, useEffect, useRef, useMemo, lazy, Suspense } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getPublicFeeSettings, type PublicFeeSettings } from "@/lib/fee-service";
import { getPublicPlatformStats, type PublicPlatformStats } from "@/lib/platform-stats";
import { Button } from "@/components/ui/button";
import { DOMAINS } from "@/lib/constants";
import { useAuth } from "@/lib/auth";
import { useRecentReviews } from "@/lib/reviews";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { AuroraBackground } from "@/components/AuroraBackground";
import { FadeUp, Reveal } from "@/components/motion";
import {
  BookOpen, Layers, Monitor, Server, BarChart3, Brain, Palette,
  Code2, Shield, TrendingUp, ArrowRight, Award, FileCheck, Rocket,
  ShieldCheck, GraduationCap, IndianRupee, Sparkles, ChevronRight, CheckCircle2,
  Star, Globe, Users, Clock, MessageSquare, Briefcase, Play, FileText, Cloud, LayoutGrid,
} from "lucide-react";
import { MobileFloatingIcons } from "@/components/MobileFloatingIcons";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { FAQ_DATA } from "@/lib/seo";
import heroTeamImage from "@/assets/hero section team img.webp";
import { HeroRunningLetters } from "@/components/HeroRunningLetters";
import { HeroRunningTicker } from "@/components/HeroRunningTicker";

import yrTechLogo from "@/assets/yr-tech.webp";
import vinixLogo from "@/assets/vinix.webp";
import skyrovixLogo from "@/assets/logo.webp";
import skyrovixLogoWhite from "@/assets/sk-logo-white.webp";

const FounderProfileView = lazy(() =>
  import("@/components/FounderProfileView").then((m) => ({ default: m.FounderProfileView }))
);
const ApplicationFormDialog = lazy(() =>
  import("@/components/ApplicationFormDialog").then((m) => ({ default: m.ApplicationFormDialog }))
);
const FlyingRocketAnimation = lazy(() =>
  import("@/components/FlyingRocketAnimation").then((m) => ({ default: m.FlyingRocketAnimation }))
);

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
      links: [
        {
          rel: "preload",
          as: "image",
          href: heroTeamImage,
          type: "image/webp",
          fetchPriority: "high",
        },
      ],
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
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#faf8f2]" />}>
        <FounderProfileView />
      </Suspense>
    );
  }

  return (
    <div className="w-full">
      <FAQJsonLd faqs={FAQ_DATA} />
      <BreadcrumbJsonLd items={[{ name: "Home", url: "https://skyrovix.online/" }]} />
      {/* ─── MOBILE HERO (Clean Single Section, Full Viewport) ─── */}
      <section className="lg:hidden relative w-full min-h-[100dvh] pt-20 sm:pt-24 pb-0 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#faf8f2] via-[#fff5f3]/80 to-[#faf8f2] dark:from-[#181619] dark:via-[#1e191d] dark:to-[#181619]">
        {/* Soft background ambient glow */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-12 -right-12 size-64 rounded-full bg-[#f95c4b]/12 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute top-1/2 -left-16 size-60 rounded-full bg-[#ee9590]/15 blur-3xl" />

        <div className="relative z-10 w-full max-w-lg mx-auto px-4 flex flex-col items-start text-left flex-1 justify-center">
          {/* Internship Platform Badge */}
          <FadeUp delay={0.02} duration={0.5}>
            <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-[#f95c4b]/25 bg-gradient-to-r from-[#f95c4b]/10 via-[#ee9590]/10 to-[#f95c4b]/5 px-3 py-1.5 text-[10px] sm:text-[11px] font-extrabold text-[#f95c4b] dark:text-[#ee9590] shadow-2xs backdrop-blur-md">
              <span className="relative flex size-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f95c4b] opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-[#f95c4b]" />
              </span>
              <span className="tracking-wide">INDIA'S MOST PRACTICAL VIRTUAL INTERNSHIP</span>
            </div>
          </FadeUp>

          {/* Primary Heading with Running Letters Dynamic Animation */}
          <FadeUp delay={0.06} duration={0.6}>
            <h1 className="font-display text-[29px] sm:text-4xl leading-[1.14] font-black tracking-tight text-[#181619] dark:text-white text-left break-words">
              Build Skills.<br />
              Gain Experience.<br />
              <HeroRunningLetters
                words={[
                  "Get Certified.",
                  "Launch Your Career.",
                  "Earn Verified LOR.",
                  "Master Future Tech.",
                  "Land Dream Jobs.",
                ]}
              />
            </h1>
          </FadeUp>

          {/* Sub-headline description */}
          <FadeUp delay={0.10} duration={0.6}>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-left font-medium">
              Skyrovix empowers students and aspiring engineers with hands-on capstone projects, 1-on-1 mentor guidance, and verified MSME credentials that accelerate your tech career.
            </p>
          </FadeUp>

          {/* Checklist items — 2x2 grid */}
          <FadeUp delay={0.14} duration={0.6} className="w-full">
            <div className="mt-3 grid grid-cols-2 gap-2 w-full">
              {[
                { label: "Real-world Projects", icon: Code2, desc: "GitHub Tasks", color: "text-[#f95c4b]" },
                { label: "Mentor Guidance", icon: Users, desc: "1-on-1 Review", color: "text-[#f95c4b] dark:text-[#ee9590]" },
                { label: "Certificate & LOR", icon: FileText, desc: "MSME Verified", color: "text-emerald-600 dark:text-emerald-400" },
                { label: "100% Remote", icon: Globe, desc: "Self Paced", color: "text-[#f95c4b]" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-2.5 py-1.5 sm:py-2 rounded-xl border border-border/60 bg-white/90 dark:bg-[#201d22]/90 backdrop-blur-sm shadow-2xs min-w-0"
                >
                  <div className={`size-7 rounded-lg bg-[#f95c4b]/10 dark:bg-white/10 flex items-center justify-center ${item.color} shrink-0`}>
                    <item.icon className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white/95 block truncate">{item.label}</span>
                    <span className="text-[9px] text-muted-foreground font-semibold block">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>

          {/* Buttons Row */}
          <FadeUp delay={0.18} duration={0.6} className="w-full">
            <div className="mt-3 flex flex-row items-center gap-2.5 w-full">
              <Link to="/internship" className="flex-1">
                <Button size="default" className="w-full rounded-xl bg-gradient-to-r from-[#f95c4b] to-[#ea5342] text-white border-0 px-3 py-2.5 text-xs font-bold shadow-md shadow-[#f95c4b]/25 flex items-center justify-center gap-1.5 cursor-pointer">
                  Explore Internships <ArrowRight className="size-3.5" />
                </Button>
              </Link>
              <a href="#how-it-works" className="flex-1">
                <Button size="default" variant="outline" className="w-full rounded-xl border border-border/70 dark:border-white/15 px-3 py-2.5 text-xs font-bold text-[#181619] dark:text-white bg-white/70 dark:bg-white/5 backdrop-blur-md flex items-center justify-center gap-1.5 cursor-pointer">
                  <Play className="size-3 fill-current text-[#f95c4b]" />
                  How It Works
                </Button>
              </a>
            </div>

            {/* Social Proof & Rating */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
              <div className="flex -space-x-1.5 shrink-0 select-none">
                <div className="size-6 rounded-full ring-2 ring-white dark:ring-[#181619] bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-black text-[10px] grid place-items-center shadow-xs">
                  <span>H</span>
                </div>
                <div className="size-6 rounded-full ring-2 ring-white dark:ring-[#181619] bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-black text-[10px] grid place-items-center shadow-xs">
                  <span>P</span>
                </div>
                <div className="size-6 rounded-full ring-2 ring-white dark:ring-[#181619] bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-black text-[10px] grid place-items-center shadow-xs">
                  <span>S</span>
                </div>
                <div className="size-6 rounded-full ring-2 ring-white dark:ring-[#181619] bg-gradient-to-tr from-purple-500 to-pink-500 text-white font-black text-[10px] grid place-items-center shadow-xs">
                  <span>R</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <span className="font-extrabold text-[#181619] dark:text-white text-[11px]">4.9/5</span>
                <span className="text-[10px] text-muted-foreground font-medium">(1,000+ Students)</span>
              </div>

              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                <CheckCircle2 className="size-3" /> Govt MSME Registered
              </span>
            </div>
          </FadeUp>

          {/* Coupon Banner - Fixed wrap and legible on mobile */}
          <FadeUp delay={0.22} duration={0.6} className="w-full">
            <div className="mt-3 p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-50/60 to-amber-500/5 dark:from-amber-500/10 dark:via-[#201d22]/90 dark:to-transparent border border-amber-500/30 w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 backdrop-blur-md shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="size-7.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Sparkles className="size-3.5" />
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-[10.5px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">FIRST100 COUPON</p>
                    <span className="text-[8px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-500/30 whitespace-nowrap inline-flex">Limited</span>
                  </div>
                  <p className="text-[9.5px] text-slate-600 dark:text-slate-400 font-medium">First 100 students get 100% Free Virtual Internship!</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setApplyDomain(DOMAINS[0]?.slug)}
                className="w-full sm:w-auto shrink-0 px-3 py-1.5 rounded-xl bg-[#181619] hover:bg-[#f95c4b] dark:bg-[#f95c4b] text-white text-[10.5px] font-extrabold shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-1"
              >
                <span>Apply with FIRST100</span>
                <ChevronRight className="size-3" />
              </button>
            </div>
          </FadeUp>
        </div>

        {/* Continuous Running Letters Highlights Ticker on Mobile (Full Width at Bottom) */}
        <div className="relative z-20 w-full shrink-0 mt-4">
          <HeroRunningTicker />
        </div>
      </section>

      {/* ─── DESKTOP HERO (lg+) ─── */}
      <div className="hidden lg:block w-full">
        <AuroraBackground className="h-screen max-h-screen flex flex-col justify-between overflow-hidden">
          <section className="relative flex-1 pt-16 lg:pt-16 pb-2 flex items-center justify-center overflow-hidden">
            {/* Floating programming language icons across entire hero */}
            <MobileFloatingIcons />
            <div className="mx-auto max-w-7xl px-4 relative z-10 w-full">
              <div className="grid grid-cols-12 gap-8 items-center">

              {/* Left Column: Hero Text Content with Clean, Fast Rendering */}
              <div className="lg:col-span-7 flex flex-col items-start text-left w-full px-2 sm:px-0">

                {/* Internship Platform Badge */}
                <FadeUp delay={0.02} duration={0.5}>
                  <div className="mb-3 sm:mb-3.5 inline-flex items-center gap-2 rounded-full border border-[#f95c4b]/25 bg-gradient-to-r from-[#f95c4b]/10 via-[#ee9590]/10 to-[#f95c4b]/5 px-3.5 py-1.5 text-[10px] sm:text-[11px] font-extrabold text-[#f95c4b] dark:text-[#ee9590] shadow-2xs backdrop-blur-md">
                    <span className="relative flex size-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f95c4b] opacity-75" />
                      <span className="relative inline-flex rounded-full size-2 bg-[#f95c4b]" />
                    </span>
                    <span className="tracking-wide">INDIA'S MOST PRACTICAL VIRTUAL INTERNSHIP PLATFORM</span>
                  </div>
                </FadeUp>

                {/* Primary Heading with Running Letters Dynamic Animation */}
                <FadeUp delay={0.08} duration={0.65}>
                  <h1 className="font-display text-2xl sm:text-4xl lg:text-[44px] xl:text-[50px] leading-[1.12] font-black tracking-tight text-[#181619] dark:text-white text-left break-words">
                    Build Skills.<br />
                    Gain Experience.<br />
                    <HeroRunningLetters
                      words={[
                        "Get Certified.",
                        "Launch Your Career.",
                        "Earn Verified LOR.",
                        "Master Future Tech.",
                        "Land Dream Jobs.",
                      ]}
                    />
                  </h1>
                </FadeUp>

                {/* Sub-headline description */}
                <FadeUp delay={0.14} duration={0.65}>
                  <p className="mt-2.5 sm:mt-3 max-w-xl text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-left font-medium break-words">
                    Skyrovix empowers students and aspiring engineers with hands-on capstone projects, 1-on-1 mentor guidance, and verified MSME credentials that accelerate your tech career.
                  </p>
                </FadeUp>

                {/* Checklist items — glassmorphism on dark */}
                <FadeUp delay={0.20} duration={0.65} className="w-full max-w-lg">
                  <div className="mt-3 sm:mt-3.5 grid grid-cols-2 gap-1.5 sm:gap-2 max-w-lg w-full min-w-0">
                    {[
                      { label: "Real-world Projects", icon: Code2, desc: "GitHub Tasks", color: "text-[#f95c4b]", bg: "bg-white/90 dark:bg-[#201d22]/90 border-border/60 hover:border-[#f95c4b]/40" },
                      { label: "Mentor Guidance", icon: Users, desc: "1-on-1 Review", color: "text-[#403b42] dark:text-[#ee9590]", bg: "bg-white/90 dark:bg-[#201d22]/90 border-border/60 hover:border-[#f95c4b]/40" },
                      { label: "Certificate & LOR", icon: FileText, desc: "MSME Verified", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-white/90 dark:bg-[#201d22]/90 border-border/60 hover:border-[#f95c4b]/40" },
                      { label: "100% Remote", icon: Globe, desc: "Self Paced", color: "text-[#f95c4b]", bg: "bg-white/90 dark:bg-[#201d22]/90 border-border/60 hover:border-[#f95c4b]/40" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border ${item.bg} backdrop-blur-sm transition-all duration-300 shadow-2xs hover:scale-[1.02] hover:shadow-md cursor-default min-w-0`}
                      >
                        <div className={`size-6 sm:size-7 rounded-lg bg-[#f95c4b]/10 dark:bg-white/10 flex items-center justify-center ${item.color} shrink-0 shadow-2xs`}>
                          <item.icon className="size-3 sm:size-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10.5px] sm:text-xs font-bold text-slate-900 dark:text-white/95 block truncate">{item.label}</span>
                          <span className="text-[8.5px] sm:text-[9.5px] text-muted-foreground font-semibold block">{item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </FadeUp>

                {/* Buttons Row with smooth CSS hover & tap */}
                <FadeUp delay={0.26} duration={0.65} className="w-full sm:w-auto">
                  <div className="mt-3.5 sm:mt-4 flex flex-row items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                    <Link to="/internship" className="block">
                      <Button size="default" className="group rounded-xl bg-gradient-to-r from-[#f95c4b] to-[#ea5342] hover:opacity-95 text-white border-0 px-5 sm:px-6 py-2.5 sm:py-5 text-xs sm:text-sm font-bold shadow-lg shadow-[#f95c4b]/25 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0">
                        Explore Internships <ArrowRight className="ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </Button>
                    </Link>
                    <a href="#how-it-works" className="block">
                      <Button size="default" variant="outline" className="rounded-xl border border-border/70 dark:border-white/15 px-4 sm:px-5 py-2.5 sm:py-5 text-xs sm:text-sm font-bold text-[#181619] dark:text-white hover:bg-white dark:hover:bg-white/10 hover:border-[#f95c4b] transition-all flex items-center justify-center gap-2 bg-white/60 dark:bg-white/5 backdrop-blur-md cursor-pointer hover:-translate-y-0.5 active:scale-95 duration-200 shadow-2xs">
                        <div className="size-5 rounded-full bg-[#f95c4b]/10 dark:bg-white/15 flex items-center justify-center text-[#f95c4b] dark:text-white">
                          <Play className="size-2.5 fill-current ml-0.5" />
                        </div>
                        How It Works
                      </Button>
                    </a>
                  </div>

                  {/* Trust & Social Proof Row with perfectly centered student circle avatars */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs text-muted-foreground font-medium">
                    {/* Overlapping Student Circle Avatars with 100% centered letters */}
                    <div className="flex -space-x-2 shrink-0 select-none">
                      <div className="size-6 sm:size-6.5 rounded-full ring-2 ring-white dark:ring-[#181619] bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-black text-[10px] sm:text-[10.5px] grid place-items-center shadow-xs">
                        <span className="translate-y-[0.5px]">H</span>
                      </div>
                      <div className="size-6 sm:size-6.5 rounded-full ring-2 ring-white dark:ring-[#181619] bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-black text-[10px] sm:text-[10.5px] grid place-items-center shadow-xs">
                        <span className="translate-y-[0.5px]">P</span>
                      </div>
                      <div className="size-6 sm:size-6.5 rounded-full ring-2 ring-white dark:ring-[#181619] bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-black text-[10px] sm:text-[10.5px] grid place-items-center shadow-xs">
                        <span className="translate-y-[0.5px]">S</span>
                      </div>
                      <div className="size-6 sm:size-6.5 rounded-full ring-2 ring-white dark:ring-[#181619] bg-gradient-to-tr from-purple-500 to-pink-500 text-white font-black text-[10px] sm:text-[10.5px] grid place-items-center shadow-xs">
                        <span className="translate-y-[0.5px]">R</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="size-3 sm:size-3.5 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                      <span className="font-extrabold text-[#181619] dark:text-white text-[11px] sm:text-xs">4.9/5 Rating</span>
                      <span className="text-[10.5px] sm:text-[11px] text-muted-foreground font-medium">(1,000+ Students)</span>
                    </div>

                    <span className="hidden sm:inline text-muted-foreground/30">•</span>
                    <span className="inline-flex items-center gap-1 text-[10.5px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                      <CheckCircle2 className="size-3 sm:size-3.5" /> Govt MSME Registered
                    </span>
                  </div>
                </FadeUp>

                {/* Coupon banner */}
                <FadeUp delay={0.30} duration={0.65} className="w-full max-w-lg">
                  <div className="mt-3 sm:mt-3.5 p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-white/90 to-amber-500/5 dark:from-amber-500/10 dark:via-[#201d22]/90 dark:to-transparent border border-amber-500/30 max-w-lg w-full flex flex-row items-center justify-between gap-2.5 backdrop-blur-md shadow-2xs min-w-0 transition-transform duration-300 hover:shadow-md">
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                      <div className="size-7 sm:size-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                        <Sparkles className="size-3.5 sm:size-4" />
                      </div>
                      <div className="text-left min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">FIRST100 COUPON</p>
                          <span className="text-[8.5px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded-full border border-amber-500/30">Limited</span>
                        </div>
                        <p className="text-[9.5px] sm:text-[10.5px] text-slate-600 dark:text-slate-400 font-medium truncate">First 100 students get 100% Free Virtual Internship!</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setApplyDomain(DOMAINS[0]?.slug)}
                      className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-lg bg-[#181619] hover:bg-[#f95c4b] dark:bg-[#f95c4b] text-white text-[10.5px] sm:text-xs font-extrabold shadow-sm transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-1"
                    >
                      <span>Apply with FIRST100</span>
                      <ChevronRight className="size-3" />
                    </button>
                  </div>
                </FadeUp>

              </div>

              {/* Right Column: Dynamic Graphic & Stats overlay */}
              <div className="lg:col-span-5 flex flex-col items-center relative w-full lg:mt-0 mt-6">

                {/* Student team image - clean without blue background, enlarged for high impact */}
                <div className="relative w-full max-w-[480px] sm:max-w-[520px] lg:max-w-[530px] xl:max-w-[560px] flex items-center justify-center">
                  <img
                    src={heroTeamImage}
                    alt="Skyrovix Interns"
                    width={612}
                    height={408}
                    loading="eager"
                    fetchPriority="high"
                    decoding="sync"
                    className="relative z-10 w-full max-w-[360px] sm:max-w-[460px] lg:max-w-[500px] xl:max-w-[540px] h-auto object-contain select-none pointer-events-none drop-shadow-sm"
                  />

                  {/* Floating Badge Cards positioned relative to the student team image */}
                  {/* Real-world Projects — left side */}
                  <div className="animate-float-badge-1 absolute top-[28%] -left-2 sm:-left-6 lg:-left-10 xl:-left-14 bg-white dark:bg-[#201d22] border border-[#e5e7eb] dark:border-white/10 rounded-xl p-2 shadow-lg backdrop-blur-md flex items-center gap-2 z-20 cursor-default hover:scale-105 transition-transform duration-200">
                    <div className="size-6 sm:size-7 rounded-lg bg-[#f95c4b]/10 flex items-center justify-center text-[#f95c4b] font-bold shrink-0 shadow-2xs"><Code2 className="size-3 sm:size-3.5" /></div>
                    <span className="text-[9.5px] sm:text-[10.5px] font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">Real-world Projects</span>
                  </div>

                  {/* Industry Recognized Certificate — top center */}
                  <div className="animate-float-badge-2 absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 bg-white dark:bg-[#201d22] border border-[#e5e7eb] dark:border-white/10 rounded-xl p-2 shadow-lg backdrop-blur-md flex items-center gap-2 z-20 whitespace-nowrap cursor-default hover:scale-105 transition-transform duration-200">
                    <div className="size-6 sm:size-7 rounded-lg bg-[#f95c4b]/10 flex items-center justify-center text-[#f95c4b] font-bold shrink-0 shadow-2xs"><GraduationCap className="size-3 sm:size-3.5" /></div>
                    <span className="text-[9.5px] sm:text-[10.5px] font-bold text-gray-800 dark:text-gray-200">Industry Certificate</span>
                  </div>

                  {/* Internship Offer Letter — right side top */}
                  <div className="animate-float-badge-3 absolute top-[20%] -right-2 sm:-right-6 lg:-right-10 xl:-right-14 bg-white dark:bg-[#201d22] border border-[#e5e7eb] dark:border-white/10 rounded-xl p-2 shadow-lg backdrop-blur-md flex items-center gap-2 z-20 cursor-default hover:scale-105 transition-transform duration-200">
                    <div className="size-6 sm:size-7 rounded-lg bg-[#f95c4b]/10 flex items-center justify-center text-[#f95c4b] font-bold shrink-0 shadow-2xs"><FileText className="size-3 sm:size-3.5" /></div>
                    <span className="text-[9.5px] sm:text-[10.5px] font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">Offer Letter</span>
                  </div>

                  {/* Task-based internship — right side bottom */}
                  <div className="animate-float-badge-4 absolute bottom-[26%] -right-2 sm:-right-6 lg:-right-10 xl:-right-14 bg-white dark:bg-[#201d22] border border-[#e5e7eb] dark:border-white/10 rounded-xl p-2 shadow-lg backdrop-blur-md flex items-center gap-2 z-20 cursor-default hover:scale-105 transition-transform duration-200">
                    <div className="size-6 sm:size-7 rounded-lg bg-[#f95c4b]/10 flex items-center justify-center text-[#f95c4b] font-bold shrink-0 shadow-2xs"><Users className="size-3 sm:size-3.5" /></div>
                    <span className="text-[9.5px] sm:text-[10.5px] font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">Task-based</span>
                  </div>
                </div>

                {/* Statistics Card — 2×2 on mobile, 4-col on sm+ with compact padding */}
                <FadeUp delay={0.25} duration={0.65} className="relative z-30 w-full mt-2 sm:mt-2.5">
                  <div className="relative z-30 w-full bg-white dark:bg-[#201d22] rounded-2xl border border-[#e5e7eb] dark:border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.06)] grid grid-cols-2 sm:grid-cols-4 max-w-xl overflow-hidden backdrop-blur-md">
                    {/* Students Enrolled */}
                    <div className="text-center flex flex-col items-center justify-center py-2.5 sm:py-3 px-1.5 border-r border-b sm:border-b-0 border-slate-100 dark:border-slate-800/80 transition-colors duration-200 hover:bg-slate-50/50 dark:hover:bg-white/5">
                      <div className="size-7 sm:size-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mb-1">
                        <Users className="size-3.5 sm:size-4" />
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-[#181619] dark:text-white leading-tight tracking-tight">
                        {stats?.studentsEnrolledDisplay || "1,077+"}
                      </div>
                      <div className="mt-0.5 text-[9.5px] sm:text-[10px] text-muted-foreground font-bold leading-tight">Students Enrolled</div>
                    </div>

                    {/* Internship Domains */}
                    <div className="text-center flex flex-col items-center justify-center py-2.5 sm:py-3 px-1.5 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800/80 transition-colors duration-200 hover:bg-slate-50/50 dark:hover:bg-white/5">
                      <div className="size-7 sm:size-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 mb-1">
                        <Briefcase className="size-3.5 sm:size-4" />
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-[#181619] dark:text-white leading-tight tracking-tight">
                        {stats?.internshipDomainsDisplay || "25+"}
                      </div>
                      <div className="mt-0.5 text-[9.5px] sm:text-[10px] text-muted-foreground font-bold leading-tight">Internship Domains</div>
                    </div>

                    {/* Projects Available */}
                    <div className="text-center flex flex-col items-center justify-center py-2.5 sm:py-3 px-1.5 border-r border-slate-100 dark:border-slate-800/80 transition-colors duration-200 hover:bg-slate-50/50 dark:hover:bg-white/5">
                      <div className="size-7 sm:size-8 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 mb-1">
                        <Code2 className="size-3.5 sm:size-4" />
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-[#181619] dark:text-white leading-tight tracking-tight">
                        {stats?.projectsAvailableDisplay || "175+"}
                      </div>
                      <div className="mt-0.5 text-[9.5px] sm:text-[10px] text-muted-foreground font-bold leading-tight">Projects Available</div>
                    </div>

                    {/* Average Rating */}
                    <div className="text-center flex flex-col items-center justify-center py-2.5 sm:py-3 px-1.5 transition-colors duration-200 hover:bg-slate-50/50 dark:hover:bg-white/5">
                      <div className="size-7 sm:size-8 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-500 mb-1">
                        <Star className="size-3.5 sm:size-4 fill-amber-500" />
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-[#181619] dark:text-white leading-tight tracking-tight">
                        {stats?.averageRating || "4.9/5"}
                      </div>
                      <div className="mt-0.5 text-[9.5px] sm:text-[10px] text-muted-foreground font-bold leading-tight">Average Rating</div>
                    </div>
                  </div>
                </FadeUp>

              </div>
            </div>
          </div>
        </section>

        {/* Continuous Running Letters Highlights Ticker */}
        <HeroRunningTicker />
      </AuroraBackground>
    </div>

      {/* ─── OUR IMPACT (TRUSTED BY STUDENTS, BUILT FOR A BETTER FUTURE) ─── */}
      <Reveal delay={0.1}>
        <section className="relative border-b border-[#e5e7eb] dark:border-white/10 bg-gradient-to-b from-[#faf8f2] via-white to-white dark:from-[#181619] dark:via-[#161418] dark:to-[#181619] py-14 sm:py-18 lg:py-20 overflow-hidden z-10">
          {/* Soft ambient decorative shapes in Skyrovix signature coral brand colors */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-24 size-80 sm:size-96 rounded-full bg-gradient-to-tr from-[#f95c4b]/15 via-[#ee9590]/10 to-transparent dark:from-[#f95c4b]/10 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -right-20 size-72 sm:size-80 rounded-full bg-[#f95c4b]/10 dark:bg-[#ee9590]/10 blur-3xl"
          />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Styled in Skyrovix signature website colors */}
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                {/* Badge + Horizontal Line */}
                <div className="flex items-center gap-3.5">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider bg-[#f95c4b]/10 text-[#f95c4b] dark:text-[#ee9590] border border-[#f95c4b]/20 shadow-2xs">
                    OUR IMPACT
                  </span>
                  <span
                    aria-hidden="true"
                    className="w-10 sm:w-12 h-[2.5px] rounded-full bg-[#f95c4b] dark:bg-[#ee9590]"
                  />
                </div>

                {/* Main Heading */}
                <h2 className="mt-6 text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black tracking-tight text-slate-900 dark:text-white leading-[1.16]">
                  Trusted by Students,
                  <br />
                  Built for a{" "}
                  <span className="relative inline-block bg-gradient-to-r from-[#f95c4b] via-[#f95c4b] to-[#ee9590] bg-clip-text text-transparent">
                    Better Future
                    {/* Decorative hand-drawn curved scribble underline SVG matching the image */}
                    <svg
                      className="absolute -bottom-2.5 sm:-bottom-3 left-0 w-[104%] h-3 sm:h-3.5 text-[#f95c4b] dark:text-[#ee9590] pointer-events-none overflow-visible"
                      viewBox="0 0 250 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 11C55 4.5 175 4 247 9.5"
                        stroke="currentColor"
                        strokeWidth="3.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h2>

                {/* Description */}
                <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-xl">
                  SKYROVIX has already empowered thousands of students with industry-relevant skills, hands-on projects and internship opportunities. Our growing community is a testament to the trust and support we receive from learners across India.
                </p>

                {/* Learn | Build | Grow Badges */}
                <div className="mt-9 sm:mt-11 flex flex-wrap items-center gap-3 sm:gap-5">
                  {/* Learn */}
                  <div className="flex items-center gap-2.5 sm:gap-3 group cursor-default">
                    <div className="size-11 sm:size-12 rounded-full bg-[#f95c4b]/10 dark:bg-[#f95c4b]/15 border border-[#f95c4b]/20 flex items-center justify-center text-[#f95c4b] dark:text-[#ee9590] shadow-2xs shrink-0 transition-transform duration-300 group-hover:scale-105">
                      <GraduationCap className="size-5 sm:size-5.5 stroke-[2.2]" />
                    </div>
                    <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                      Learn
                    </span>
                  </div>

                  {/* Divider */}
                  <span className="text-slate-300 dark:text-slate-700 font-light select-none text-base sm:text-lg">|</span>

                  {/* Build */}
                  <div className="flex items-center gap-2.5 sm:gap-3 group cursor-default">
                    <div className="size-11 sm:size-12 rounded-full bg-[#f95c4b]/10 dark:bg-[#f95c4b]/15 border border-[#f95c4b]/20 flex items-center justify-center text-[#f95c4b] dark:text-[#ee9590] shadow-2xs shrink-0 transition-transform duration-300 group-hover:scale-105">
                      <Code2 className="size-5 sm:size-5.5 stroke-[2.2]" />
                    </div>
                    <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                      Build
                    </span>
                  </div>

                  {/* Divider */}
                  <span className="text-slate-300 dark:text-slate-700 font-light select-none text-base sm:text-lg">|</span>

                  {/* Grow */}
                  <div className="flex items-center gap-2.5 sm:gap-3 group cursor-default">
                    <div className="size-11 sm:size-12 rounded-full bg-[#f95c4b]/10 dark:bg-[#f95c4b]/15 border border-[#f95c4b]/20 flex items-center justify-center text-[#f95c4b] dark:text-[#ee9590] shadow-2xs shrink-0 transition-transform duration-300 group-hover:scale-105">
                      <Rocket className="size-5 sm:size-5.5 stroke-[2.2]" />
                    </div>
                    <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                      Grow
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Animated Flying Rocket */}
              <div className="lg:col-span-5 w-full flex items-center justify-center">
                <Suspense fallback={<div className="h-48 w-48" />}>
                  <FlyingRocketAnimation />
                </Suspense>
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


      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="border-y border-[#e5e7eb] dark:border-white/10 bg-[#faf8f2] dark:bg-[#181619] py-20 sm:py-24 relative z-10 scroll-mt-20">
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
                className="group relative rounded-2xl border border-border/50 bg-white/70 dark:bg-[#201d22]/70 p-6 backdrop-blur motion-card-hover cursor-default"
              >
                <div className="absolute -top-3 left-6 grid size-7 place-items-center rounded-full bg-[#f95c4b] text-xs font-extrabold text-white shadow-md shadow-[#f95c4b]/30 ring-4 ring-[#f95c4b]/15 transition-transform duration-300 group-hover:scale-110">{i + 1}</div>
                <div className="size-11 rounded-2xl bg-[#f95c4b]/10 flex items-center justify-center text-[#f95c4b] group-hover:bg-[#f95c4b] group-hover:text-white transition-all duration-300 mb-4 mt-1 shadow-sm">
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
                width={48}
                height={48}
                loading="lazy"
                decoding="async"
                className="h-9 sm:h-12 w-auto object-contain transition-all duration-300 hover:scale-105 opacity-90 hover:opacity-100 dark:hidden"
              />
              <img
                src={skyrovixLogoWhite}
                alt="Skyrovix IT Solutions"
                width={48}
                height={48}
                loading="lazy"
                decoding="async"
                className="h-9 sm:h-12 w-auto object-contain transition-all duration-300 hover:scale-105 opacity-90 hover:opacity-100 hidden dark:block"
              />
              <img
                src={vinixLogo}
                alt="Vinix Partner"
                width={100}
                height={44}
                loading="lazy"
                decoding="async"
                className="h-8 sm:h-11 w-auto object-contain transition-all duration-300 hover:scale-105 opacity-90 hover:opacity-100 dark:brightness-110"
              />
              <img
                src={yrTechLogo}
                alt="YR Tech"
                width={72}
                height={48}
                loading="lazy"
                decoding="async"
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
                className="group rounded-2xl border border-border/50 bg-white/70 dark:bg-[#201d22]/70 p-6 motion-card-hover cursor-default"
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
                    className="h-full"
                  >
                    <Link
                      to="/internship"
                      search={{ apply: undefined }}
                      className="group block h-full rounded-2xl border border-border/50 bg-white/70 dark:bg-[#201d22]/70 motion-card-hover"
                    >
                      {cardContent}
                    </Link>
                  </div>
                );
              }

              return (
                <div
                  key={i}
                  className="h-full"
                >
                  <button
                    onClick={() => setApplyDomain(d.slug)}
                    className="group w-full h-full text-left rounded-2xl border border-border/50 bg-white/70 dark:bg-[#201d22]/70 motion-card-hover cursor-pointer"
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
                    <div className="transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]">
                      <Button asChild size="lg" className="rounded-xl bg-[#f95c4b] text-white hover:bg-[#e04b3a] border-0 shadow-xl shadow-[#f95c4b]/30 font-bold h-12 px-8 transition-all duration-300 group cursor-pointer">
                        <Link to="/auth" search={{ redirect: undefined }}>
                          Apply now
                          <ArrowRight className="ml-1.5 size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </Link>
                      </Button>
                    </div>
                    <div className="transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]">
                      <Button asChild size="lg" variant="outline" className="rounded-xl bg-white/5 border border-white/15 text-white/90 hover:bg-white/12 hover:text-white h-12 px-8 backdrop-blur-sm transition-all duration-300 cursor-pointer">
                        <Link to="/internship" search={{ apply: undefined }}>Explore Internships</Link>
                      </Button>
                    </div>
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
      {applyDomain && (
        <Suspense fallback={null}>
          <ApplicationFormDialog
            open={!!applyDomain}
            onOpenChange={(o) => { if (!o) setApplyDomain(null); }}
            defaultDomain={applyDomain ?? undefined}
          />
        </Suspense>
      )}
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
          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 rounded-full px-2 py-0.5 border border-emerald-300/60 dark:border-emerald-800 shrink-0">
            ✓ Verified
          </span>
        </div>

        {/* Review text */}
        <p className="flex-1 text-[13px] leading-[1.8] text-slate-700 dark:text-slate-300 relative z-10 line-clamp-4">
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
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate mt-0.5">{item.role}</p>
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
              type="button"
              onClick={() => {
                const el = scrollRef.current;
                if (el) el.scrollTo({ left: el.clientWidth * i, behavior: "smooth" });
              }}
              className="min-h-[28px] min-w-[24px] inline-flex items-center justify-center p-1 cursor-pointer focus-visible:outline-none"
              aria-label={`Go to review ${i + 1}`}
            >
              <span
                className={`h-1.5 rounded-full transition-all duration-300 block ${
                  i === activeIdx ? "w-6 bg-[#f95c4b]" : "w-1.5 bg-gray-400 dark:bg-white/30"
                }`}
              />
            </button>
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
        <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 rounded-full px-2 py-0.5 border border-emerald-300/60 dark:border-emerald-800 shrink-0">
          ✓ Verified
        </span>
      </div>

      {/* Review text */}
      <p className="text-[13px] leading-[1.8] text-slate-700 dark:text-slate-300 mb-4 relative z-10 line-clamp-4">
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
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate mt-0.5">{item.role}</p>
        </div>
      </div>
    </div>
  );
}
