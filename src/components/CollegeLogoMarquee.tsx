import React from "react";
import annaLogo from "@/assets/college-loge-right-to-left/anna.png";
import thanjavurLogo from "@/assets/college-loge-right-to-left/thanjavur.png";
import snistLogo from "@/assets/college-loge-right-to-left/sreenidhi-transparent.png";
import sriRajaLogo from "@/assets/college-loge-right-to-left/sri raja.png";
import mzcetLogo from "@/assets/college-loge-right-to-left/mzcet-logo__1_-removebg-preview.png";
import srustiLogo from "@/assets/college-loge-right-to-left/SRUSTI-removebg-preview.png";
import orientalLogo from "@/assets/college-loge-right-to-left/oriental-transparent.png";
import kipLogo from "@/assets/college-loge-right-to-left/kip-transparent.png";
import vignanLogo from "@/assets/college-loge-right-to-left/vignan-transparent.png";
import gnitLogo from "@/assets/college-loge-right-to-left/gnit-transparent.png";
import presidencyLogo from "@/assets/college-loge-right-to-left/presidency-transparent.png";
import aceLogo from "@/assets/college-loge-right-to-left/ace-transparent.png";

export interface CollegeItem {
  id: string;
  name: string;
  src: string;
}

const COLLEGE_LOGOS: CollegeItem[] = [
  { id: "anna", name: "Anna University", src: annaLogo },
  { id: "thanjavur", name: "Government College of Engineering, Thanjavur", src: thanjavurLogo },
  { id: "snist", name: "Sreenidhi Institute of Science and Technology", src: snistLogo },
  { id: "vignan", name: "Vignan's University", src: vignanLogo },
  { id: "gnit", name: "Greater Noida Institute of Technology", src: gnitLogo },
  { id: "oriental", name: "Oriental University", src: orientalLogo },
  { id: "presidency", name: "Presidency College Autonomous", src: presidencyLogo },
  { id: "ace", name: "ACE Engineering Academy", src: aceLogo },
  { id: "srrc", name: "Sri Raaja Raajan College of Engineering", src: sriRajaLogo },
  { id: "mzcet", name: "Mount Zion College of Engineering and Technology", src: mzcetLogo },
  { id: "srusti", name: "Srusti Academy of Management", src: srustiLogo },
  { id: "kip", name: "Engineering and Technology Institute", src: kipLogo },
];

export function CollegeLogoMarquee() {
  // Duplicate list to create a seamless infinite loop with NO visible jump
  const duplicatedLogos = [...COLLEGE_LOGOS, ...COLLEGE_LOGOS];

  return (
    <section
      aria-label="Students From Leading Colleges"
      className="relative w-full border-b border-border/30 bg-white/50 dark:bg-slate-950/10 py-10 sm:py-12 lg:py-14 overflow-hidden z-10"
    >
      {/* Scoped CSS animation for continuous right-to-left marquee */}
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
          animation: college-marquee-left-scroll 28s linear infinite !important;
        }
        .college-marquee-track:hover {
          animation-play-state: paused !important;
        }
        @media (max-width: 640px) {
          .college-marquee-track {
            animation-duration: 20s !important;
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
        {/* Left Fade Gradient */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 lg:w-40 z-20 bg-gradient-to-r from-white/90 dark:from-[#020617] to-transparent"
        />

        {/* Right Fade Gradient */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 lg:w-40 z-20 bg-gradient-to-l from-white/90 dark:from-[#020617] to-transparent"
        />

        {/* Horizontal Marquee Moving Right to Left — Pure Logos, No Boxes */}
        <div className="overflow-hidden py-3">
          <div className="college-marquee-track flex items-center gap-8 sm:gap-12 md:gap-16 px-6">
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
                  className="h-10 sm:h-12 md:h-14 w-auto max-w-[130px] sm:max-w-[160px] md:max-w-[190px] object-contain dark:brightness-105 pointer-events-none drop-shadow-xs"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
