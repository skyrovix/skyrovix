import { FadeUp, Reveal } from "@/components/motion";
import { Target, Rocket, ArrowRight } from "lucide-react";
import founderPortrait from "@/assets/founder-portrait-transparent.png";

export function FounderStorySection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-white dark:bg-[#141316]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-40 size-96 rounded-full bg-[#f95c4b]/6 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 size-96 rounded-full bg-orange-500/6 blur-[130px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ─── Header: Eyebrow + Title + Subtitle ─── */}
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center justify-center gap-3 mb-2.5">
              <span className="h-px w-8 sm:w-12 bg-[#f95c4b]/50" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#f95c4b] dark:text-[#ee9590]">
                Our Founder
              </span>
              <span className="h-px w-8 sm:w-12 bg-[#f95c4b]/50" />
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Founder{" "}
              <span className="bg-gradient-to-r from-[#f95c4b] via-[#ee9590] to-orange-500 bg-clip-text text-transparent">
                Story
              </span>
            </h2>

            <p className="mt-3 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 font-medium">
              From a Student&apos;s Dream to a Platform for Every Learner.
            </p>
          </div>
        </Reveal>

        {/* ─── Main Content Grid: 3 Distinct Non-Overlapping Columns ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center">
          {/* 1. Left Column: Styled Founder Portrait Artwork & Profile Badge */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <FadeUp>
              <div className="relative w-full max-w-sm sm:max-w-md group">
                {/* Ambient pulsating peach/coral aura behind the portrait */}
                <div className="absolute inset-0 -top-4 rounded-full bg-gradient-to-tr from-[#f95c4b]/20 via-orange-400/25 to-rose-300/20 blur-3xl animate-orbital-glow pointer-events-none" />

                {/* Floating Portrait Artwork with gentle 3D float animation */}
                <div className="relative flex justify-center items-center transition-transform duration-500 group-hover:scale-[1.02]">
                  <div className="relative animate-float">
                    <img
                      src={founderPortrait}
                      alt="Hariharan S — Founder & CEO of Skyrovix"
                      className="w-full max-w-[320px] sm:max-w-[350px] h-auto object-contain drop-shadow-[0_15px_35px_rgba(249,92,75,0.18)]"
                    />
                  </div>
                </div>

                {/* Profile Card beneath photo */}
                <div className="relative z-10 -mt-2 rounded-[22px] bg-gradient-to-b from-[#fff7f4] via-white to-[#faf8f6] dark:from-[#26171c] dark:via-[#1e1721] dark:to-[#17141b] p-5 text-center border border-[#f95c4b]/20 dark:border-[#f95c4b]/30 shadow-xl shadow-[#f95c4b]/5 backdrop-blur-md transition-all duration-300 group-hover:border-[#f95c4b]/40">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Hariharan S
                  </h3>
                  <p className="text-xs sm:text-[13px] font-bold text-[#f95c4b] dark:text-[#ee9590] mt-1 tracking-wide uppercase">
                    Founder &amp; Lead Developer
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-snug font-medium">
                    Technology enthusiast | Full Stack Developer | Entrepreneur
                  </p>

                  <div className="mt-4 flex justify-center">
                    <a
                      href="https://www.linkedin.com/in/hariharan-s-skyrovix"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/btn inline-flex items-center justify-center gap-2 rounded-full bg-[#141216] dark:bg-white text-white dark:text-[#141216] px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:bg-[#f95c4b] dark:hover:bg-[#f95c4b] dark:hover:text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                      title="Connect with Hariharan S on LinkedIn"
                    >
                      {/* LinkedIn Icon */}
                      <svg
                        className="size-4 fill-current transition-transform group-hover/btn:scale-110"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                      </svg>
                      <span>Connect on LinkedIn</span>
                      <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-1" />
                    </a>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>

          {/* 2. Middle Column: The Story Narrative (Unobstructed text) */}
          <div className="lg:col-span-5 relative">
            <FadeUp delay={0.1}>
              <div className="space-y-4 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                <p>
                  Every meaningful journey begins with an idea. For{" "}
                  <strong className="text-slate-900 dark:text-white font-semibold">
                    Skyrovix
                  </strong>
                  , that idea came from a student who believed that education should go beyond
                  textbooks, theory, and certificates.
                </p>

                <p>
                  As a technology enthusiast and aspiring entrepreneur, Hariharan started his
                  journey with a passion for software development, innovation, and helping students
                  build practical skills.
                </p>

                <p>
                  During his own internship journey, he discovered an important challenge: many
                  students complete their academic studies but struggle to gain the practical
                  experience and industry exposure needed to enter the professional world.
                </p>

                <p>
                  That experience became a turning point. Instead of simply accepting the gap
                  between education and industry, he decided to build something that could help
                  bridge it.
                </p>

                {/* Prominent Callout */}
                <div className="py-1">
                  <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    With that vision,{" "}
                    <span className="text-[#f95c4b] dark:text-[#ee9590] font-black">
                      Skyrovix
                    </span>{" "}
                    was born.
                  </p>
                </div>

                <p>
                  What started as an idea gradually developed into a virtual internship and training
                  platform designed to give students opportunities to learn, build real-world
                  projects, develop technical confidence, and showcase their abilities.
                </p>

                <p>
                  As Founder &amp; Lead Developer, Hariharan continues to focus on building the
                  platform, improving its technology, and creating meaningful learning experiences
                  for students.
                </p>
              </div>
            </FadeUp>
          </div>

          {/* 3. Right Column: Dedicated Ascending Rocket Illustration */}
          <div className="lg:col-span-2 hidden lg:flex flex-col items-center justify-center relative">
            <FadeUp delay={0.2}>
              <div className="relative w-40 xl:w-48 select-none pointer-events-none animate-rocket">
                <svg
                  viewBox="0 0 200 250"
                  className="w-full h-auto drop-shadow-2xl"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Glowing Aura Behind Rocket */}
                  <circle cx="100" cy="110" r="70" fill="url(#rocket-aura)" />

                  {/* Thrust Flames */}
                  <path
                    d="M 88 175 Q 100 240 100 248 Q 100 240 112 175 Z"
                    fill="url(#thrust-grad)"
                    className="animate-pulse"
                  />
                  <path
                    d="M 94 175 Q 100 215 100 225 Q 100 215 106 175 Z"
                    fill="#ffea79"
                  />

                  {/* Fluffy Exhaust Cloud Puffs */}
                  <circle cx="68" cy="215" r="18" fill="#ffe4d6" fillOpacity="0.75" />
                  <circle cx="132" cy="215" r="18" fill="#ffe4d6" fillOpacity="0.75" />
                  <circle cx="100" cy="230" r="22" fill="#ffd4c0" fillOpacity="0.85" />
                  <circle cx="82" cy="202" r="14" fill="#ffffff" fillOpacity="0.95" />
                  <circle cx="118" cy="202" r="14" fill="#ffffff" fillOpacity="0.95" />

                  {/* Rocket Fuselage rotated 25 degrees */}
                  <g transform="rotate(25 100 120)">
                    {/* Left Wing Fin */}
                    <path
                      d="M 75 140 C 60 160 55 175 60 180 C 70 180 85 165 90 155 Z"
                      fill="#f95c4b"
                    />
                    {/* Right Wing Fin */}
                    <path
                      d="M 125 140 C 140 160 145 175 140 180 C 130 180 115 165 110 155 Z"
                      fill="#f95c4b"
                    />
                    {/* Fuselage Body */}
                    <path
                      d="M 100 40 C 120 70 125 130 120 165 C 110 170 90 170 80 165 C 75 130 80 70 100 40 Z"
                      fill="#ffffff"
                      stroke="#f3f4f6"
                      strokeWidth="2"
                    />
                    {/* Nose Cone */}
                    <path
                      d="M 100 40 C 112 58 116 75 116 80 L 84 80 C 84 75 88 58 100 40 Z"
                      fill="#f95c4b"
                    />
                    {/* Outer Porthole */}
                    <circle cx="100" cy="110" r="14" fill="#0f2b48" />
                    {/* Inner Porthole Glass */}
                    <circle cx="100" cy="110" r="10" fill="#38bdf8" />
                    <circle cx="97" cy="107" r="3" fill="#ffffff" />
                    {/* Stripe */}
                    <path d="M 82 145 Q 100 150 118 145" stroke="#f95c4b" strokeWidth="4" />
                  </g>

                  {/* Sparkles / Twinkling Stars */}
                  <circle cx="35" cy="50" r="3" fill="#f95c4b" className="animate-ping" />
                  <circle cx="175" cy="80" r="2.5" fill="#f97316" />
                  <circle cx="165" cy="30" r="3" fill="#fbbf24" className="animate-pulse" />

                  <defs>
                    <radialGradient id="rocket-aura" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#f95c4b" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#f95c4b" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="thrust-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f95c4b" />
                      <stop offset="60%" stopColor="#ff7a00" />
                      <stop offset="100%" stopColor="#ffe600" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </FadeUp>
          </div>
        </div>

        {/* ─── Bottom Highlight Banner: The Vision That Drives Us ─── */}
        <Reveal delay={0.25}>
          <div className="mt-14 sm:mt-16 rounded-2xl sm:rounded-3xl border border-[#f95c4b]/20 bg-gradient-to-r from-orange-50/90 via-rose-50/70 to-amber-50/90 dark:from-[#26171b] dark:via-[#1e1722] dark:to-[#1a1724] p-6 sm:p-8 shadow-sm relative overflow-hidden">
            {/* Ambient glow in background */}
            <div className="absolute -top-16 -right-16 size-48 rounded-full bg-[#f95c4b]/10 blur-2xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
              {/* Left Sub-Card: The Vision Quote */}
              <div className="lg:col-span-7 flex items-start gap-4">
                <div className="size-11 sm:size-12 rounded-2xl bg-[#f95c4b]/15 border border-[#f95c4b]/25 grid place-items-center shrink-0 text-[#f95c4b] dark:text-[#ee9590] shadow-xs">
                  <Target className="size-6" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    The{" "}
                    <span className="text-[#f95c4b] dark:text-[#ee9590]">Vision</span>{" "}
                    That Drives Us
                  </h4>
                  <p className="mt-1.5 text-xs sm:text-[13.5px] text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    &ldquo;I started Skyrovix not just to build a company, but to create
                    opportunities for students who are looking for a chance to learn, build, and
                    prove their abilities. I believe every student deserves an opportunity to gain
                    practical experience, regardless of where they come from.&rdquo;
                  </p>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-2 block">
                    — Hariharan S
                  </span>
                </div>
              </div>

              {/* Vertical Divider on large screens */}
              <div className="hidden lg:block lg:col-span-1 h-20 w-px bg-slate-300/60 dark:bg-white/10 mx-auto" />

              {/* Right Sub-Card: The Journey & Empowerment */}
              <div className="lg:col-span-4 flex items-start gap-3.5 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-300/40 dark:border-white/10">
                <div className="size-10 sm:size-11 rounded-xl bg-orange-500/15 border border-orange-500/25 grid place-items-center shrink-0 text-[#f95c4b] dark:text-[#ee9590] shadow-xs">
                  <Rocket className="size-5" />
                </div>
                <div>
                  <p className="text-[11.5px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium leading-snug">
                    The journey is still growing.
                    <br />
                    The vision remains the same:
                  </p>
                  <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-1.5 leading-snug">
                    Empower students with{" "}
                    <span className="text-[#f95c4b]">skills</span>,{" "}
                    <span className="text-orange-500">experience</span>, and{" "}
                    <span className="text-[#f95c4b]">opportunities</span> for the future.
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
