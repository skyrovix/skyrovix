import { createFileRoute, Link } from "@tanstack/react-router";
import { AuroraBackground } from "@/components/AuroraBackground";
import { FadeUp, Reveal } from "@/components/motion";
import { 
  ShieldCheck, Target, Award, Sparkles, ArrowRight, 
  CheckCircle2, Quote, BadgeCheck, FileText, Search, 
  Users, GraduationCap, Building2, Globe, Laptop, 
  Code2, Database, Lock, Server, Cpu
} from "lucide-react";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import msme from "@/assets/msme.png";

export const Route = createFileRoute("/_navbar-layout/about")({
  head: () => ({
    meta: [
      { title: "About Skyrovix | MSME-Registered Virtual Internship Platform for Students India" },
      { 
        name: "description", 
        content: "Learn about Skyrovix — an MSME-registered virtual internship and training platform helping college students, engineering students, CSE and IT students, and fresh graduates gain industry-ready skills through project-based internships. Get offer letters, digital ID cards, and QR-verified certificates." 
      },
      { 
        name: "keywords", 
        content: "about skyrovix, skyrovix internship platform, virtual internship company India, MSME registered training, project based internship platform, internship for college students, internship for CSE students, internship for IT students, internship for engineering students, skill development platform India, internship with real projects, work from home internship India, summer internship 2026" 
      },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Skyrovix" },
      { property: "og:title", content: "About Skyrovix — MSME-Registered Virtual Internship Platform" },
      { 
        property: "og:description", 
        content: "MSME-registered virtual internship platform helping students gain real-world skills through task-based projects across 25+ domains." 
      },
      { property: "og:url", content: "https://skyrovix.online/about" },
      { property: "og:image", content: "https://skyrovix.online/og-default.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "About Skyrovix — Virtual Internship Platform" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@skyrovix" },
      { name: "twitter:title", content: "About Skyrovix — MSME-Registered Virtual Internship Platform" },
      { 
        name: "twitter:description", 
        content: "MSME-registered virtual internship platform helping students gain real-world skills through task-based projects across 25+ domains." 
      },
      { name: "twitter:image", content: "https://skyrovix.online/og-default.png" },
      { name: "twitter:image:alt", content: "About Skyrovix — Virtual Internship Platform" },
      { rel: "canonical", href: "https://skyrovix.online/about" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://skyrovix.online/" },
          { name: "About Skyrovix", url: "https://skyrovix.online/about" },
        ]}
      />
      <WebPageJsonLd
        title="About Skyrovix — MSME-Registered Virtual Internship Platform"
        description="Learn about Skyrovix, an MSME-registered virtual internship and training platform helping college students, fresh graduates, and job seekers gain real-world skills through task-based projects."
        url="https://skyrovix.online/about"
      />

      {/* ─── HERO ─── */}
      <AuroraBackground>
        <section className="mx-auto max-w-5xl px-4 pt-4 sm:pt-8 pb-12 sm:pb-20 md:pb-24 text-center">
          <FadeUp>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#07284a]/15 bg-white/60 dark:bg-[#0f172a]/60 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-medium text-[#07284a] dark:text-[#60a5fa] shadow-sm backdrop-blur mb-6">
              <Sparkles className="size-3 sm:size-3.5" /> About Skyrovix
            </div>
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
              Bridging <span className="brand-text">education &amp; industry</span>
            </h1>
            <p className="mt-5 mx-auto max-w-2xl text-sm sm:text-lg text-muted-foreground">
              We run a task-based virtual internship program that helps students gain genuine,
              portfolio-grade experience — not just a certificate.
            </p>
          </FadeUp>
        </section>
      </AuroraBackground>

      {/* ─── MISSION + STATS ─── */}
      <section className="border-y border-border/40 bg-[#f8fafc]/50 dark:bg-[#020617]/50 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <p className="inline-flex items-center gap-1.5 rounded-full border border-[#07284a]/30 bg-[#07284a]/10 px-3 py-1 text-xs font-semibold tracking-widest text-[#07284a] uppercase mb-4">
                  Our Mission
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.15]">
                  MSME-registered. <span className="brand-text">Industry-focused.</span>
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  The gap between college coursework and real-world engineering work is huge. We close
                  that gap with structured, mentor-reviewed internship tracks across 25+
                  in-demand technology domains.
                </p>
                <div className="mt-5 space-y-2">
                  {[
                    "Instant offer letter & digital ID card",
                    "Real-world practical projects per track",
                    "QR-verified certificate on completion",
                    "MSME-registered — UDYAM-TN-17-0076606",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "25+", label: "Domains" },
                  { value: "300+", label: "Projects" },
                  { value: "100%", label: "Self-paced" },
                  { value: "₹0", label: "Application fee" },
                ].map((s, i) => (
                  <FadeUp key={s.label} delay={0.1 + i * 0.08}>
                    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-white/60 dark:bg-[#0f172a]/60 p-6 text-center card-elevated hover:card-elevated-hover">
                      <div className="absolute -top-6 -right-6 size-20 rounded-full bg-[#07284a]/5 dark:bg-[#07284a]/10 blur-2xl" />
                      <div className="relative">
                        <div className="text-3xl font-bold brand-text">{s.value}</div>
                        <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
                      </div>
                    </div>
                  </FadeUp>
                ))}
                <FadeUp delay={0.35}>
                  <div className="col-span-2 flex items-center gap-3.5 rounded-2xl border border-border/50 bg-white/60 dark:bg-[#0f172a]/60 p-4 card-elevated hover:card-elevated-hover">
                    <img src={msme} alt="MSME Registered" className="h-10 w-auto object-contain" />
                    <div className="text-xs">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Govt. Registered Enterprise</p>
                      <p className="text-muted-foreground font-mono text-[11px]">UDYAM-TN-17-0076606 · Ministry of MSME</p>
                    </div>
                  </div>
                </FadeUp>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── VALUES ─── */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/50 dark:bg-[#0f172a]/50 px-4 py-1.5 text-xs font-medium text-muted-foreground mb-4">
                What We Stand For
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Our Values</h2>
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Target, title: "Real Skills", desc: "Every task mirrors real industry work — no toy projects, no fillers." },
              { icon: ShieldCheck, title: "Verifiable", desc: "Unique ID & QR on every certificate for instant verification by employers." },
              { icon: Award, title: "Student-First", desc: "Built for learners with mentor-style task reviews and self-paced tracks." },
              { icon: Building2, title: "MSME Registered", desc: "Registered under Govt. of India MSME (UDYAM-TN-17-0076606)." },
            ].map((v, i) => (
              <FadeUp key={v.title} delay={0.1 + i * 0.1}>
                <div className="group rounded-2xl border border-border/50 bg-white/60 dark:bg-[#0f172a]/60 p-6 transition-all card-elevated hover:card-elevated-hover text-center sm:text-left">
                  <div className="mx-auto sm:mx-0 grid size-11 place-items-center rounded-xl bg-[#07284a]/10 dark:bg-[#07284a]/20 text-[#07284a] dark:text-[#60a5fa] transition-all group-hover:bg-[#07284a] group-hover:text-white">
                    <v.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{v.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{v.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="border-y border-border/40 bg-[#f8fafc]/50 dark:bg-[#020617]/50 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/50 dark:bg-[#0f172a]/50 px-4 py-1.5 text-xs font-medium text-muted-foreground mb-4">
                <GraduationCap className="size-3.5" /> How It Works
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Your internship journey</h2>
              <p className="mt-3 text-muted-foreground">From signup to certificate — four simple steps.</p>
            </div>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "01", icon: FileText, title: "Apply & Get Offer", desc: "Pick a domain, fill your details, and receive your offer letter instantly — no interview needed." },
              { step: "02", icon: Users, title: "Receive ID Card", desc: "Get your digital identity card with a unique intern ID. You're officially part of Skyrovix." },
              { step: "03", icon: Search, title: "Complete Projects", desc: "Work through 5-12 real-world tasks per track. Each task is reviewed by mentors." },
              { step: "04", icon: BadgeCheck, title: "Earn Certificate", desc: "Finish your track, get a QR-verified certificate. Share it on LinkedIn, resume, everywhere." },
            ].map((s, i) => (
              <FadeUp key={s.step} delay={0.1 + i * 0.1}>
                <div className="group relative rounded-2xl border border-border/50 bg-white/60 dark:bg-[#0f172a]/60 p-6 transition-all card-elevated hover:card-elevated-hover">
                  <div className="absolute -top-3 -right-3 flex size-8 items-center justify-center rounded-full bg-[#07284a] text-[10px] font-bold text-white shadow-sm">
                    {s.step}
                  </div>
                  <div className="grid size-11 place-items-center rounded-xl bg-[#07284a]/10 dark:bg-[#07284a]/20 text-[#07284a] dark:text-[#60a5fa] transition-all group-hover:bg-[#07284a] group-hover:text-white">
                    <s.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── THE SKYROVIX PLATFORM & ORGANIZATION DETAILS ─── */}
      <section className="relative border-y border-border/40 bg-[#f8fafc]/50 dark:bg-[#020617]/50 overflow-hidden py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <div className="text-center mb-14 sm:mb-20">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/50 dark:bg-[#0f172a]/50 px-4 py-1.5 text-xs font-medium text-muted-foreground mb-4">
                <Sparkles className="size-3.5" /> Organization &amp; Ecosystem
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
                The <span className="brand-text">Skyrovix</span> Platform
              </h2>
              <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                An industry-standard virtual internship and technical training environment designed to equip students with verifiable, portfolio-grade engineering capability.
              </p>
            </div>
          </Reveal>

          {/* 2-Column Organization Details Grid */}
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            {/* Column 1: Core Company & Mission */}
            <Reveal className="h-full">
              <div className="relative h-full flex flex-col justify-between rounded-3xl border border-border/60 bg-white/70 dark:bg-[#0f172a]/70 p-8 sm:p-10 shadow-sm backdrop-blur">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#07284a]/20 bg-[#07284a]/10 px-3 py-1 text-xs font-semibold text-[#07284a] dark:text-[#60a5fa] uppercase tracking-wider">
                    <Building2 className="size-3.5" /> Company Profile
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Empowering Next-Gen Developers Across India
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Skyrovix is an MSME-registered enterprise dedicated to democratizing practical computer science and engineering education. Founded with the mission to solve the chronic disconnect between classroom theory and modern industry demands, Skyrovix provides real-world, self-paced internship experiences across 25+ cutting-edge domains.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3 text-xs sm:text-sm text-muted-foreground">
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                      <span><strong>MSME Registration:</strong> Officially recognized under Government of India (UDYAM-TN-17-0076606).</span>
                    </div>
                    <div className="flex items-start gap-3 text-xs sm:text-sm text-muted-foreground">
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                      <span><strong>Hands-On Architecture:</strong> Practical GitHub repositories, hosted web demos, and live API deployments.</span>
                    </div>
                    <div className="flex items-start gap-3 text-xs sm:text-sm text-muted-foreground">
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                      <span><strong>Zero Application Barrier:</strong> 100% free application process so every student has an equal opportunity to learn.</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#07284a]/10 bg-[#07284a]/5 dark:bg-[#07284a]/15 p-4 flex items-start gap-3">
                    <Quote className="mt-0.5 size-4 shrink-0 text-[#07284a]" />
                    <p className="text-xs text-muted-foreground italic leading-relaxed">
                      &ldquo;Our vision is simple: ensure every engineering, arts, and science student graduates with functional, portfolio-ready code and an authentic understanding of real-world software development.&rdquo;
                    </p>
                  </div>
                </div>

                <div className="pt-8 border-t border-border/40 mt-8 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Headquarters</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">Tamil Nadu, India</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Official Email</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">skyrovix@gmail.com</p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Column 2: Platform Standards & Trust */}
            <Reveal className="h-full" delay={0.15}>
              <div className="relative h-full flex flex-col justify-between rounded-3xl border border-border/60 bg-white/70 dark:bg-[#0f172a]/70 p-8 sm:p-10 shadow-sm backdrop-blur">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-950/30 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                    <ShieldCheck className="size-3.5" /> Integrity &amp; Verification
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Verifiable Credentials Trusted by Employers
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    At Skyrovix, we adhere to strict verification and quality controls. We do not issue certificates for passive video watching; every credential reflects tangible project code thoroughly reviewed by technical mentors.
                  </p>

                  <div className="grid gap-3.5 pt-2">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <Award className="size-4 text-blue-600" /> Tamper-Proof Cryptographic Certificates
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Every certificate includes a unique Certificate ID, cryptographic SHA verification hash, and direct QR code authentication via <code className="text-blue-600 font-mono">/verify-certificate</code>.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <Search className="size-4 text-purple-600" /> Mentor Review &amp; Code Quality Audits
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Experienced developers review student pull requests and hosted deployments. Constructive revisions ensure work meets genuine production benchmarks.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <Lock className="size-4 text-emerald-600" /> Student Data Security &amp; Privacy
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Enterprise-level PostgreSQL database security with Row-Level Security (RLS) and a strict zero-data-selling guarantee.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-border/40 mt-8 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Recognition</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">Govt. MSME Certified</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Verification</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">24/7 Online QR Portal</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Technology Domains Grid */}
          <div className="mt-12 sm:mt-16 rounded-3xl border border-border/60 bg-white/50 dark:bg-[#0f172a]/50 p-6 sm:p-10 text-center">
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3">Industry-Ready Domains Offered at Skyrovix</h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto mb-6">
              Our structured internship curricula cover the full spectrum of high-demand technology disciplines:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                "Full Stack Web Development", "Python Programming", "Java Development", "MERN Stack",
                "Data Science", "Machine Learning & AI", "Cloud Computing", "DevOps & CI/CD",
                "UI/UX Product Design", "Cyber Security", "Android App Development", "Flutter & React Native",
                "Data Analytics & Power BI", "Database Management", "Prompt Engineering", "Software Testing"
              ].map((domain) => (
                <span key={domain} className="rounded-xl border border-border/60 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs">
                  {domain}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-[#07284a]/20 bg-gradient-to-br from-[#07284a] via-[#0d3b66] to-[#1d4ed8] p-8 sm:p-12 md:p-16 text-center text-white shadow-2xl shadow-[#07284a]/25">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
              <div className="absolute -right-20 -top-20 size-80 rounded-full bg-white/5 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 size-60 rounded-full bg-white/5 blur-3xl" />
              <div className="relative">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Be part of the Skyrovix journey</h2>
                <p className="mt-3 text-sm sm:text-base text-white/80 max-w-lg mx-auto">Get your offer letter in seconds. No application fee.</p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link to="/domains">
                    <span className="group inline-flex items-center gap-2 rounded-xl bg-white text-[#07284a] px-7 py-3.5 text-sm font-semibold shadow-lg hover:bg-white/90 transition-all btn-premium hover:btn-premium-hover active:btn-premium-active cursor-pointer">
                      Browse Internships <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                  <Link to="/contact">
                    <span className="inline-flex items-center gap-2 rounded-xl bg-transparent border-2 border-white/30 text-white px-7 py-3.5 text-sm font-semibold hover:bg-white/10 transition-all btn-premium active:btn-premium-active cursor-pointer">
                      Get in Touch
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
