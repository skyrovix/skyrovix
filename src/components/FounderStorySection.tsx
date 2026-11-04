import { FadeUp, Reveal } from "@/components/motion";
import { Target, Rocket, ArrowRight } from "lucide-react";
import founderPortrait from "@/assets/founder-portrait-real.png";
import founderStoryBg from "@/assets/founder story background.jpeg";

export function FounderStorySection() {
  return (
    <section className="relative py-6 sm:py-8 lg:py-8 overflow-hidden bg-white dark:bg-[#141316] flex flex-col justify-center">
      {/* ─── Section Background Artwork (Scaled and Contained to Fit Screen) ─── */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden flex items-center justify-center">
        <img
          src={founderStoryBg}
          alt=""
          className="w-full h-full max-w-[1440px] object-cover sm:object-contain lg:object-cover object-center opacity-100 dark:opacity-25"
        />
        {/* Subtle dark mode overlay for contrast in dark theme */}
        <div className="absolute inset-0 bg-transparent dark:bg-[#141316]/80" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* ─── Header: Eyebrow + Title + Subtitle (Compact) ─── */}
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-5 lg:mb-5">
            <div className="inline-flex items-center justify-center gap-2 mb-1">
              <span className="h-px w-6 sm:w-10 bg-[#f95c4b]/50" />
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#f95c4b] dark:text-[#ee9590]">
                04. Founder Story
              </span>
              <span className="h-px w-6 sm:w-10 bg-[#f95c4b]/50" />
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Founder{" "}
              <span className="bg-gradient-to-r from-[#f95c4b] via-[#ee9590] to-orange-500 bg-clip-text text-transparent">
                Story
              </span>
            </h2>

            <p className="mt-1 text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 font-medium">
              From a Student&apos;s Dream to a Platform for Every Learner
            </p>
          </div>
        </Reveal>

        {/* ─── Main Content Grid: Sized to Fit Within Laptop Height ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center">
          {/* 1. Left Column: Compact Founder Photo & Profile Badge */}
          <div className="lg:col-span-4 xl:col-span-4 flex flex-col items-center">
            <FadeUp>
              <div className="relative w-full max-w-[210px] sm:max-w-[230px] lg:max-w-[240px] group">
                {/* Founder Photo Container */}
                <div className="relative rounded-[22px] sm:rounded-[26px] overflow-hidden bg-white/70 dark:bg-slate-900/50 p-1.5 sm:p-2 shadow-lg shadow-orange-500/10 border border-white/80 dark:border-white/10 backdrop-blur-xs">
                  <div className="relative rounded-[18px] sm:rounded-[20px] overflow-hidden">
                    <img
                      src={founderPortrait}
                      alt="Hariharan S. — Founder & Lead Developer"
                      className="w-full h-[210px] sm:h-[230px] lg:h-[240px] object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                </div>

                {/* Profile Card beneath photo (Compact) */}
                <div className="relative z-20 -mt-4 mx-auto w-[92%] rounded-[18px] sm:rounded-[20px] bg-white/95 dark:bg-[#1e1721]/95 p-3 sm:p-3.5 text-center border border-slate-200/80 dark:border-white/10 shadow-lg shadow-[#f95c4b]/8 backdrop-blur-md transition-all duration-300 group-hover:border-[#f95c4b]/30">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Hariharan S.
                  </h3>
                  <p className="text-[10.5px] sm:text-[11px] font-bold text-[#f95c4b] dark:text-[#ee9590] mt-0.5 tracking-wide uppercase">
                    Founder &amp; Lead Developer
                  </p>
                  <p className="text-[9.5px] sm:text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug font-medium line-clamp-1">
                    Technology Enthusiast | Full Stack Developer | Entrepreneur
                  </p>

                  <div className="mt-2.5 flex justify-center">
                    <a
                      href="https://www.linkedin.com/in/hariharan-s-92b566381"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/btn inline-flex items-center justify-center gap-1.5 rounded-full bg-[#141216] dark:bg-white text-white dark:text-[#141216] px-3.5 py-1.5 text-[11px] sm:text-xs font-bold shadow-xs hover:bg-[#f95c4b] dark:hover:bg-[#f95c4b] dark:hover:text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                      title="Connect with Hariharan S. on LinkedIn"
                    >
                      {/* LinkedIn Icon */}
                      <svg
                        className="size-3.5 fill-current transition-transform group-hover/btn:scale-110"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                      </svg>
                      <span>Connect on LinkedIn</span>
                      <ArrowRight className="size-3 transition-transform group-hover/btn:translate-x-0.5" />
                    </a>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>

          {/* 2. Middle Column: Story Narrative (Exact Official Copy) */}
          <div className="lg:col-span-5 xl:col-span-5 relative z-10">
            <FadeUp delay={0.1}>
              <div className="space-y-2 sm:space-y-2.5 text-slate-700 dark:text-slate-300 text-xs sm:text-[12.5px] lg:text-[13px] leading-relaxed">
                <p>
                  Every meaningful journey begins with an idea. For{" "}
                  <strong className="text-slate-900 dark:text-white font-semibold">
                    Skyrovix
                  </strong>
                  , that idea came from a student who believed that education should go beyond
                  textbooks, theory, and certificates.
                </p>

                <p>
                  As a technology enthusiast and aspiring entrepreneur, Hariharan began his
                  journey with a passion for software development, innovation, and helping students
                  build practical skills.
                </p>

                <p>
                  During his own learning and internship journey, he recognised a challenge: many
                  students complete their academic studies but still need more opportunities to
                  practise what they learn, develop projects, and gain exposure to professional
                  workflows.
                </p>

                <p>
                  That realisation became a turning point. Instead of simply accepting the gap
                  between academic learning and practical experience, he decided to build something
                  that could help address it.
                </p>

                {/* Prominent Callout */}
                <div className="py-0.5">
                  <p className="text-xs sm:text-[13.5px] font-bold text-slate-900 dark:text-white">
                    With that vision,{" "}
                    <span className="text-[#f95c4b] dark:text-[#ee9590] font-black">
                      Skyrovix
                    </span>{" "}
                    was born.
                  </p>
                </div>

                <p>
                  What started as an idea gradually developed into a virtual internship and training
                  platform designed to give students opportunities to learn, build projects, develop
                  technical confidence, and showcase their abilities.
                </p>

                <p>
                  As Founder and Lead Developer, Hariharan continues to focus on building the
                  platform, improving its technology, and creating meaningful learning experiences
                  for students.
                </p>
              </div>
            </FadeUp>
          </div>

          {/* 3. Right Column: Dedicated Space so Background Rocket is 100% Unobstructed */}
          <div className="lg:col-span-3 xl:col-span-3 hidden lg:block" />
        </div>

        {/* ─── Bottom Highlight Banner: A Message from the Founder (Exact Official Text) ─── */}
        <Reveal delay={0.2}>
          <div className="mt-4 sm:mt-5 rounded-xl sm:rounded-2xl border border-[#f95c4b]/20 bg-gradient-to-r from-orange-50/90 via-rose-50/70 to-amber-50/90 dark:from-[#26171b] dark:via-[#1e1722] dark:to-[#1a1724] p-3.5 sm:p-4 lg:p-4.5 shadow-xs relative overflow-hidden backdrop-blur-xs">
            {/* Ambient glow in background */}
            <div className="absolute -top-12 -right-12 size-36 rounded-full bg-[#f95c4b]/10 blur-xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center relative z-10">
              {/* Left Sub-Card: A Message from the Founder */}
              <div className="lg:col-span-7 flex items-start gap-3">
                <div className="size-8 sm:size-9 rounded-xl bg-[#f95c4b]/15 border border-[#f95c4b]/25 grid place-items-center shrink-0 text-[#f95c4b] dark:text-[#ee9590] shadow-2xs">
                  <Target className="size-4 sm:size-4.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-[13px] font-black text-slate-900 dark:text-white tracking-tight">
                    A{" "}
                    <span className="text-[#f95c4b] dark:text-[#ee9590]">Message</span>{" "}
                    from the Founder
                  </h4>
                  <p className="mt-0.5 text-[11px] sm:text-[11.5px] text-slate-700 dark:text-slate-300 italic leading-snug">
                    &ldquo;I started Skyrovix not just to build a company, but to create
                    opportunities for students who are looking for a chance to learn, build, and
                    prove their abilities. I believe every student deserves an opportunity to gain
                    practical experience and move forward with confidence.&rdquo;
                  </p>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1 block">
                    — Hariharan S.
                  </span>
                </div>
              </div>

              {/* Vertical Divider on large screens */}
              <div className="hidden lg:block lg:col-span-1 h-14 w-px bg-slate-300/60 dark:bg-white/10 mx-auto" />

              {/* Right Sub-Card: Transforming Students Tagline */}
              <div className="lg:col-span-4 flex items-start gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-300/40 dark:border-white/10">
                <div className="size-8 sm:size-8.5 rounded-lg bg-orange-500/15 border border-orange-500/25 grid place-items-center shrink-0 text-[#f95c4b] dark:text-[#ee9590] shadow-2xs">
                  <Rocket className="size-3.5 sm:size-4" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-[10.5px] text-slate-600 dark:text-slate-400 font-medium leading-tight">
                    Transforming Students Through Real-World Learning and Internships.
                  </p>
                  <p className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white mt-1 leading-snug">
                    <span className="text-[#f95c4b]">Learn.</span>{" "}
                    <span className="text-orange-500">Build.</span>{" "}
                    <span className="text-[#f95c4b]">Experience.</span>{" "}
                    <span className="text-orange-500">Grow.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
