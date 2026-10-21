import React from "react";
import { motion } from "framer-motion";
import { homeClientLogosMarquee } from "@/lib/symboolic.com-motion.framer";

// Dynamically import ALL logos ONLY from college-loge-right-to-left folder
const rightToLeftLogos = import.meta.glob<{ default: string }>(
  "/src/assets/college-loge-right-to-left/*.{png,jpg,jpeg,webp,svg}",
  { eager: true }
);

export interface CollegeItem {
  id: string;
  name: string;
  src: string;
}

const COLLEGE_LOGOS: CollegeItem[] = Object.entries(rightToLeftLogos).map(([path, module], idx) => {
  const filename = path.split("/").pop() || `college-${idx}`;
  const rawName = filename.replace(/\.(png|jpg|jpeg|webp|svg)$/i, "").replace(/-transparent$/i, "");
  let name = rawName;
  if (rawName.startsWith("WhatsApp Image")) {
    name = "Partner College";
  } else {
    name = rawName.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return {
    id: `college-logo-${idx}`,
    name,
    src: module.default,
  };
});

export function CollegeLogoMarquee() {
  // Duplicate list for seamless infinite right-to-left loop
  const duplicatedLogos = [...COLLEGE_LOGOS, ...COLLEGE_LOGOS];

  return (
    <section
      aria-label="Students From Leading Colleges"
      className="relative w-full border-b border-border/30 bg-white/60 dark:bg-slate-950/20 py-10 sm:py-12 lg:py-14 overflow-hidden z-10"
    >
      {/* Continuous Right-to-Left Marquee CSS */}
      <style>{`
        @keyframes college-marquee-left-scroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .college-marquee-track {
          display: flex !important;
          width: max-content !important;
          will-change: transform;
          animation: college-marquee-left-scroll 32s linear infinite !important;
        }
        .college-marquee-track:hover {
          animation-play-state: paused !important;
        }
        @media (max-width: 640px) {
          .college-marquee-track {
            animation-duration: 22s !important;
          }
        }
      `}</style>

      {/* Section Heading */}
      <div className="mx-auto max-w-4xl px-4 text-center mb-7 sm:mb-9">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
          Students From Leading Colleges
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-medium max-w-xl mx-auto">
          Empowering students through real-world internships and learning opportunities.
        </p>
      </div>

      {/* Marquee Container with Left and Right Fade Overlays */}
      <div className="relative w-full overflow-hidden">
        {/* Left Fade Overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 lg:w-40 z-20 bg-gradient-to-r from-white/90 dark:from-[#020617] to-transparent"
        />

        {/* Right Fade Overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 lg:w-40 z-20 bg-gradient-to-l from-white/90 dark:from-[#020617] to-transparent"
        />

        {/* Marquee Track — Pure Transparent Logos with Symboolic Marquee Preset */}
        <div className="overflow-hidden py-3">
          <motion.div
            variants={homeClientLogosMarquee}
            animate="animate"
            className="flex items-center gap-8 sm:gap-12 md:gap-16 px-6 w-max"
          >
            {duplicatedLogos.map((college, idx) => (
              <div
                key={`${college.id}-${idx}`}
                title={college.name}
                className="flex items-center justify-center shrink-0 h-12 sm:h-14 md:h-16 px-2 select-none cursor-default transition-all duration-300 hover:scale-110 opacity-90 hover:opacity-100"
              >
                <img
                  src={college.src}
                  alt={college.name}
                  loading="lazy"
                  className="h-10 sm:h-12 md:h-14 w-auto max-w-[130px] sm:max-w-[160px] md:max-w-[190px] object-contain dark:brightness-110 pointer-events-none drop-shadow-xs"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
