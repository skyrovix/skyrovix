import { createFileRoute, Link } from "@tanstack/react-router";
import { AuroraBackground } from "@/components/AuroraBackground";
import { FadeUp, Reveal } from "@/components/motion";
import { 
  Target, Sparkles, ArrowRight, CheckCircle2, 
  Lightbulb, Compass, HeartHandshake, ShieldCheck, 
  Flame, BookOpen, UserCheck, TrendingUp, Laptop, 
  Code, GraduationCap, Briefcase, RefreshCw, Layers
} from "lucide-react";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { FounderStorySection } from "@/components/FounderStorySection";
import msme from "@/assets/msme.png";

export const Route = createFileRoute("/_navbar-layout/about")({
  head: () => ({
    meta: [
      { title: "About Skyrovix | Transforming Students Through Real-World Learning and Internships" },
      { 
        name: "description", 
        content: "Learn about Skyrovix — a virtual internship and training platform focused on helping students develop practical skills, gain project-based experience, and prepare for future career opportunities." 
      },
      { 
        name: "keywords", 
        content: "about skyrovix, skyrovix virtual internship, student training platform, practical learning, project based learning, technical skills, career readiness, MSME registered training, virtual internship India" 
      },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Skyrovix" },
      { property: "og:title", content: "About Skyrovix — Transforming Students Through Real-World Learning" },
      { 
        property: "og:description", 
        content: "Skyrovix is a virtual internship and training platform helping students build portfolios, develop skills, and prepare for meaningful careers." 
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
      { name: "twitter:title", content: "About Skyrovix — Transforming Students Through Real-World Learning" },
      { 
        name: "twitter:description", 
        content: "Skyrovix is a virtual internship and training platform helping students build portfolios, develop skills, and prepare for meaningful careers." 
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
        title="About Skyrovix — Transforming Students Through Real-World Learning and Internships"
        description="Skyrovix is a virtual internship and training platform focused on helping students develop practical skills, gain project-based experience, and prepare for future career opportunities."
        url="https://skyrovix.online/about"
      />

      {/* ─────────────────────────────────────────────────────────────
          HEADER / HERO: SKYROVIX - ABOUT US
      ───────────────────────────────────────────────────────────── */}
      <AuroraBackground>
        <section className="mx-auto max-w-5xl px-4 pt-4 sm:pt-8 pb-10 sm:pb-16 text-center">
          <FadeUp>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f95c4b]/20 bg-[#f95c4b]/10 px-3.5 sm:px-4 py-1.5 text-[11px] sm:text-xs font-bold text-[#f95c4b] dark:text-[#ee9590] shadow-xs backdrop-blur mb-5 tracking-widest uppercase">
              <Sparkles className="size-3 sm:size-3.5" /> SKYROVIX · ABOUT US
            </div>
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.15]">
              Transforming Students Through{" "}
              <span className="brand-text">Real-World Learning</span> and Internships.
            </h1>
            <p className="mt-4 mx-auto max-w-2xl text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed font-medium">
              Learn. Build. Experience. Grow.
            </p>
          </FadeUp>
        </section>
      </AuroraBackground>

      {/* ─────────────────────────────────────────────────────────────
          01. ABOUT SKYROVIX
      ───────────────────────────────────────────────────────────── */}
      <section className="border-y border-[#e5e7eb] dark:border-white/10 bg-[#faf8f2] dark:bg-[#181619] py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f95c4b]/20 bg-[#f95c4b]/10 px-3 py-1 text-xs font-bold tracking-widest text-[#f95c4b] dark:text-[#ee9590] uppercase mb-3">
                01. About Skyrovix
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Who We Are
              </h2>
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <FadeUp>
                <p>
                  <strong className="text-foreground font-semibold">Skyrovix</strong> is a virtual internship and training platform focused on helping students develop practical skills, gain project-based experience, and prepare for future career opportunities.
                </p>
                <p>
                  We aim to connect academic knowledge with practical implementation through structured learning programs, hands-on projects, skill development, and virtual internship opportunities.
                </p>
                <p>
                  Our platform encourages students to explore technology, strengthen their abilities, build portfolios, and turn what they learn into practical outcomes.
                </p>
              </FadeUp>
            </div>

            {/* Right Card: What We Focus On */}
            <div className="lg:col-span-5">
              <FadeUp delay={0.15}>
                <div className="rounded-2xl sm:rounded-3xl border border-[#e5e7eb] dark:border-white/10 bg-white/70 dark:bg-[#201d22]/90 p-6 sm:p-7 shadow-xs card-elevated hover:card-elevated-hover">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#f95c4b] dark:text-[#ee9590] mb-4">
                    <Layers className="size-4" /> What We Focus On
                  </div>
                  <ul className="space-y-3">
                    {[
                      "Virtual internship programs",
                      "Industry-focused training",
                      "Practical, project-based learning",
                      "Technical and professional skill development",
                      "Portfolio building and career readiness",
                    ].map((focusItem) => (
                      <li key={focusItem} className="flex items-start gap-3 text-xs sm:text-sm text-foreground font-medium">
                        <CheckCircle2 className="size-4 shrink-0 text-[#f95c4b] mt-0.5" />
                        <span>{focusItem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          02. OUR STORY
      ───────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 bg-white dark:bg-[#141316]">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f95c4b]/20 bg-[#f95c4b]/10 px-3 py-1 text-xs font-bold tracking-widest text-[#f95c4b] dark:text-[#ee9590] uppercase mb-3">
                <Lightbulb className="size-3.5" /> 02. Our Story
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                An Idea That Became an <span className="brand-text">Opportunity</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Story Text */}
            <div className="lg:col-span-8 space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <FadeUp>
                <p>
                  Skyrovix started with a simple thought: students need more than academic knowledge to prepare for the professional world.
                </p>
                <p>
                  Through learning technology and experiencing internship opportunities, our founder recognised how valuable practical exposure, project development, and industry-oriented skills can be. That experience inspired the idea of creating a platform where students could move beyond theory and learn by building.
                </p>
                <p>
                  What began as an individual vision gradually developed into a virtual internship and training platform with a clear purpose: to make practical learning opportunities more accessible and help students take confident steps towards their goals.
                </p>
              </FadeUp>
            </div>

            {/* Side Callout / Recognition Card */}
            <div className="lg:col-span-4">
              <FadeUp delay={0.2}>
                <div className="rounded-2xl sm:rounded-3xl border border-[#f95c4b]/20 bg-gradient-to-br from-orange-50/70 via-rose-50/40 to-amber-50/70 dark:from-[#26171b] dark:via-[#1e1722] dark:to-[#17141b] p-6 text-center shadow-xs">
                  <img src={msme} alt="MSME Registered Enterprise" className="h-12 w-auto mx-auto object-contain mb-3" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Govt. MSME Certified
                  </p>
                  <p className="text-[11px] font-mono text-muted-foreground mt-1">
                    UDYAM-TN-17-0076606
                  </p>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                    Dedicated to democratizing practical computer science and software development education across India.
                  </p>
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          03. OUR VISION & MISSION
      ───────────────────────────────────────────────────────────── */}
      <section className="border-y border-[#e5e7eb] dark:border-white/10 bg-[#faf8f2] dark:bg-[#181619] py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f95c4b]/20 bg-[#f95c4b]/10 px-3 py-1 text-xs font-bold tracking-widest text-[#f95c4b] dark:text-[#ee9590] uppercase mb-3">
                <Compass className="size-3.5" /> 03. Our Vision &amp; Mission
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                The Purpose That Guides Our Work
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            {/* Vision Card */}
            <FadeUp delay={0.1} className="h-full">
              <div className="relative h-full flex flex-col justify-between rounded-3xl border border-[#f95c4b]/25 bg-white/70 dark:bg-[#201d22]/90 p-7 sm:p-9 shadow-sm card-elevated hover:card-elevated-hover">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-[#f95c4b]/15 p-3 text-[#f95c4b] dark:text-[#ee9590] mb-4">
                    <Compass className="size-6" />
                  </div>
                  <h3 className="text-xs font-bold text-[#f95c4b] dark:text-[#ee9590] uppercase tracking-wider">
                    Our Vision
                  </h3>
                  <h4 className="text-xl sm:text-2xl font-bold text-foreground mt-1 tracking-tight">
                    Accessible Practical Learning for Every Student
                  </h4>
                  <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                    To create a future where every student has access to practical learning, real-world experience, and opportunities to build a meaningful career.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50 text-xs font-semibold text-[#f95c4b] dark:text-[#ee9590]">
                  Learn · Build · Experience · Grow
                </div>
              </div>
            </FadeUp>

            {/* Mission Card */}
            <FadeUp delay={0.2} className="h-full">
              <div className="relative h-full flex flex-col justify-between rounded-3xl border border-orange-500/25 bg-white/70 dark:bg-[#201d22]/90 p-7 sm:p-9 shadow-sm card-elevated hover:card-elevated-hover">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-orange-500/15 p-3 text-orange-600 dark:text-orange-400 mb-4">
                    <Target className="size-6" />
                  </div>
                  <h3 className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                    Our Mission
                  </h3>
                  <h4 className="text-xl sm:text-2xl font-bold text-foreground mt-1 tracking-tight">
                    Connecting Academic Learning with Industry Needs
                  </h4>
                  <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                    To empower students through industry-focused training, hands-on projects, virtual internships, and skill development that helps connect academic learning with industry expectations.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50 text-xs font-semibold text-orange-600 dark:text-orange-400">
                  Transforming Students Through Real-World Learning and Internships
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          04. FOUNDER STORY (NO CHANGE CURRENT - FULL COMPONENT)
      ───────────────────────────────────────────────────────────── */}
      <FounderStorySection />

      {/* ─────────────────────────────────────────────────────────────
          05. OUR CORE VALUES
      ───────────────────────────────────────────────────────────── */}
      <section className="border-y border-[#e5e7eb] dark:border-white/10 bg-[#faf8f2] dark:bg-[#181619] py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f95c4b]/20 bg-[#f95c4b]/10 px-3 py-1 text-xs font-bold tracking-widest text-[#f95c4b] dark:text-[#ee9590] uppercase mb-3">
                <ShieldCheck className="size-3.5" /> 05. Our Core Values
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                The Principles Behind Every Decision
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Flame,
                title: "Innovation",
                desc: "We explore new ideas, technologies, and better ways to make learning useful and engaging.",
              },
              {
                icon: BookOpen,
                title: "Practical Learning",
                desc: "We encourage students to learn by doing, experimenting, solving problems, and building projects.",
              },
              {
                icon: ShieldCheck,
                title: "Integrity",
                desc: "We aim to communicate clearly and act with honesty, transparency, and responsibility.",
              },
              {
                icon: UserCheck,
                title: "Student Empowerment",
                desc: "We want learners to build confidence, independence, and the skills to take ownership of their growth.",
              },
              {
                icon: TrendingUp,
                title: "Continuous Growth",
                desc: "We value curiosity, lifelong learning, and adapting to changing technologies and industry needs.",
              },
            ].map((v, i) => (
              <FadeUp key={v.title} delay={0.08 * i}>
                <div className="rounded-2xl border border-[#e5e7eb] dark:border-white/10 bg-white/70 dark:bg-[#201d22]/90 p-6 h-full flex flex-col justify-between card-elevated hover:card-elevated-hover">
                  <div>
                    <div className="grid size-11 place-items-center rounded-xl bg-[#f95c4b]/10 dark:bg-[#f95c4b]/20 text-[#f95c4b] dark:text-[#ee9590] mb-4">
                      <v.icon className="size-5" />
                    </div>
                    <h3 className="font-bold text-base sm:text-lg text-foreground">{v.title}</h3>
                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          06. OUR COMMITMENT TO STUDENTS
      ───────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 bg-white dark:bg-[#141316]">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f95c4b]/20 bg-[#f95c4b]/10 px-3 py-1 text-xs font-bold tracking-widest text-[#f95c4b] dark:text-[#ee9590] uppercase mb-3">
                <HeartHandshake className="size-3.5" /> 06. Our Commitment to Students
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Your Growth Is Our <span className="brand-text">Priority</span>
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                At Skyrovix, we are committed to creating a supportive learning environment where students can strengthen their abilities through practical experiences and structured opportunities.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Laptop,
                title: "Accessible Opportunities",
                desc: "Virtual learning and internship opportunities designed to reach students in different locations.",
              },
              {
                icon: Code,
                title: "Hands-on Experience",
                desc: "Assignments and project-based activities that encourage practical application.",
              },
              {
                icon: TrendingUp,
                title: "Skill Development",
                desc: "Opportunities to strengthen technical knowledge, communication, and problem-solving.",
              },
              {
                icon: GraduationCap,
                title: "Learning Support",
                desc: "Guidance and a structured learning journey to help students make progress.",
              },
              {
                icon: Briefcase,
                title: "Career Preparation",
                desc: "Encouragement to build portfolios, document projects, and develop professional confidence.",
              },
              {
                icon: RefreshCw,
                title: "Continuous Improvement",
                desc: "A commitment to improving the platform and learning experience based on student needs.",
              },
            ].map((c, i) => (
              <FadeUp key={c.title} delay={0.08 * i}>
                <div className="rounded-2xl border border-border/60 bg-white/60 dark:bg-[#201d22]/70 p-6 shadow-xs card-elevated hover:card-elevated-hover h-full flex flex-col justify-between">
                  <div>
                    <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center mb-4">
                      <c.icon className="size-5" />
                    </div>
                    <h3 className="font-bold text-base text-foreground">{c.title}</h3>
                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          07. START BUILDING YOUR FUTURE (CLOSING MESSAGE & CTA)
      ───────────────────────────────────────────────────────────── */}
      <section className="px-4 py-16 sm:py-24 border-t border-[#e5e7eb] dark:border-white/10 bg-[#faf8f2] dark:bg-[#181619]">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#181619] via-[#201d22] to-[#181619] border border-white/10 p-8 sm:p-12 md:p-16 text-center text-white shadow-2xl shadow-black/40">
              {/* Background ambient lighting */}
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_40%,rgba(255,255,255,0.02)_50%,transparent_60%)]" />
              <div className="absolute -top-32 -right-32 size-[450px] rounded-full bg-[#f95c4b]/20 blur-[120px]" />
              <div className="absolute -bottom-32 -left-32 size-[350px] rounded-full bg-[#ee9590]/15 blur-[100px]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/8 px-4 py-1.5 text-xs font-semibold text-white/80 border border-white/10 mb-4 backdrop-blur-sm">
                  <span>07. Start Building Your Future · Our Closing Message</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight leading-[1.15] text-white">
                  Your Future Starts With What You <span className="bg-gradient-to-r from-[#f95c4b] via-[#ee9590] to-white bg-clip-text text-transparent">Build Today.</span>
                </h2>
                <p className="mt-3.5 text-sm sm:text-base text-white/70 max-w-xl mx-auto leading-relaxed">
                  Explore new skills, gain practical experience, and take the next step in your professional journey with Skyrovix.
                </p>

                <p className="mt-4 text-xs sm:text-sm font-bold tracking-widest uppercase text-[#f95c4b] dark:text-[#ee9590]">
                  SKYROVIX — Learn. Build. Grow.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link to="/internship">
                    <span className="group inline-flex items-center gap-2 rounded-xl bg-[#f95c4b] text-white px-7 py-3.5 text-sm font-bold shadow-xl shadow-[#f95c4b]/30 hover:bg-[#e04b3a] transition-all btn-premium hover:btn-premium-hover active:btn-premium-active cursor-pointer">
                      Browse Internships <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                  <Link to="/contact">
                    <span className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/15 text-white/90 px-7 py-3.5 text-sm font-semibold hover:bg-white/10 hover:text-white backdrop-blur-sm transition-all btn-premium active:btn-premium-active cursor-pointer">
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
