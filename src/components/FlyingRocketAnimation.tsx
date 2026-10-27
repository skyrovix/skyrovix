import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function FlyingRocketAnimation() {
  return (
    <div className="relative w-full h-[360px] sm:h-[420px] flex items-center justify-center overflow-visible select-none">
      {/* ─── Ambient Glow in Website Coral Colors ─── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute size-72 sm:size-96 rounded-full bg-gradient-to-tr from-[#f95c4b]/20 via-[#ee9590]/15 to-transparent blur-3xl dark:from-[#f95c4b]/15 dark:via-[#ee9590]/10"
      />

      {/* ─── Concentric Orbit Rings ─── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute size-64 sm:size-80 rounded-full border border-dashed border-[#f95c4b]/15 dark:border-[#ee9590]/10 animate-[spin_80s_linear_infinite]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute size-44 sm:size-56 rounded-full border border-dotted border-[#f95c4b]/20 dark:border-[#ee9590]/15 animate-[spin_50s_linear_infinite_reverse]"
      />

      {/* ─── Ambient Twinkling Cosmic Sparkles ─── */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute top-10 left-10 text-[#f95c4b]"
        animate={{
          scale: [0.8, 1.25, 0.8],
          rotate: [0, 90, 180],
          opacity: [0.3, 0.85, 0.3],
        }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles className="size-5" />
      </motion.div>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-12 right-12 text-[#ee9590]"
        animate={{
          scale: [1, 0.75, 1],
          opacity: [0.35, 0.9, 0.35],
        }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <Sparkles className="size-4" />
      </motion.div>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute top-16 right-20 size-2 rounded-full bg-[#f95c4b]"
        animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.8, 1.4, 0.8] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-20 left-16 size-1.5 rounded-full bg-[#ee9590]"
        animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.6, 1] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />

      {/* ─── Unified Rocket Flight Stage (Trajectory + Rocket + Engine Flame All-in-One) ─── */}
      <svg
        className="w-full h-full max-w-[420px] max-h-[380px] pointer-events-none overflow-visible"
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* Fuselage metallic shading */}
          <linearGradient id="fuselageBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="35%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          {/* Signature Skyrovix Coral Gradient for Nose & Fins */}
          <linearGradient id="coralBrand" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f95c4b" />
            <stop offset="100%" stopColor="#ee9590" />
          </linearGradient>

          {/* Cockpit Window Glare Gradient */}
          <linearGradient id="windowGlass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="60%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* Engine Flame Gradients */}
          <linearGradient id="outerFlame" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffe680" />
            <stop offset="25%" stopColor="#ff9e2c" />
            <stop offset="65%" stopColor="#f95c4b" />
            <stop offset="100%" stopColor="#f95c4b" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="midFlame" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#ffbe3b" />
            <stop offset="100%" stopColor="#f95c4b" />
          </linearGradient>

          {/* Launch Trajectory Gradient */}
          <linearGradient id="trajectoryGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f95c4b" stopOpacity="0" />
            <stop offset="30%" stopColor="#f95c4b" stopOpacity="0.2" />
            <stop offset="70%" stopColor="#f95c4b" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ee9590" stopOpacity="0.9" />
          </linearGradient>

          {/* Drop shadow for 3D depth */}
          <filter id="rocketShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="8" dy="16" stdDeviation="12" floodColor="#f95c4b" floodOpacity="0.18" />
          </filter>

          {/* Flame Glow */}
          <filter id="flameGlow" x="-50%" y="-20%" width="200%" height="200%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#f95c4b" floodOpacity="0.75" />
          </filter>
        </defs>

        {/* ─── Launch Trajectory Line (Precisely aligned through flight axis) ─── */}
        <motion.path
          d="M 30 290 C 85 235, 140 180, 290 30"
          stroke="url(#trajectoryGrad)"
          strokeWidth="2.5"
          strokeDasharray="6 8"
          strokeLinecap="round"
          animate={{ strokeDashoffset: [0, -56] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        />

        {/* ─── Animated Rocket Group (Smooth inertia float & banking) ─── */}
        <motion.g
          animate={{
            x: [0, 8, -4, 10, 0],
            y: [0, -14, -2, -18, 0],
            rotate: [0, 2.5, -1.5, 2, 0],
          }}
          transition={{
            duration: 4.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "160px 160px" }}
        >
          {/* Centered at (160, 160) and rotated 45 degrees so nose points to top-right */}
          <g transform="translate(160, 160) rotate(45)" filter="url(#rocketShadow)">
            {/* ─── EXHAUST SMOKE PUFFS (Drifting backwards from nozzle) ─── */}
            <motion.circle
              cx="0"
              cy="95"
              r="10"
              fill="#f95c4b"
              animate={{
                cy: [85, 145],
                r: [6, 22],
                opacity: [0.45, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
            <motion.circle
              cx="-4"
              cy="110"
              r="12"
              fill="#ee9590"
              animate={{
                cy: [90, 165],
                r: [8, 26],
                opacity: [0.4, 0],
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.35,
              }}
            />
            <motion.circle
              cx="5"
              cy="125"
              r="14"
              fill="#ffaa40"
              animate={{
                cy: [95, 185],
                r: [10, 30],
                opacity: [0.35, 0],
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.7,
              }}
            />

            {/* ─── THRUSTER FLAME (Directly anchored to nozzle rim at Y = 56) ─── */}
            <motion.g
              animate={{
                scaleY: [1, 1.3, 0.92, 1.25, 1],
                scaleX: [1, 0.92, 1.06, 0.94, 1],
              }}
              transition={{
                duration: 0.35,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ transformOrigin: "0px 56px" }}
              filter="url(#flameGlow)"
            >
              {/* Outer Vibrant Flame */}
              <path
                d="M -14 56 C -18 80, -14 110, 0 135 C 14 110, 18 80, 14 56 Z"
                fill="url(#outerFlame)"
              />
              {/* Mid Golden Flame */}
              <path
                d="M -9 56 C -12 75, -8 95, 0 110 C 8 95, 12 75, 9 56 Z"
                fill="url(#midFlame)"
              />
              {/* Core White-Hot Flame Core */}
              <path
                d="M -5 56 C -7 68, -4 78, 0 85 C 4 78, 7 68, 5 56 Z"
                fill="#ffffff"
              />
            </motion.g>

            {/* ─── ENGINE NOZZLE (Y = 48 to 56) ─── */}
            <path
              d="M -14 48 L -17 56 L 17 56 L 14 48 Z"
              fill="#334155"
              stroke="#1e293b"
              strokeWidth="1"
            />
            <ellipse cx="0" cy="56" rx="17" ry="2.5" fill="#0f172a" />

            {/* ─── LEFT DELTA FIN (Wing) ─── */}
            <path
              d="M -22 14 C -36 24, -48 38, -50 50 C -42 50, -26 46, -18 44 Z"
              fill="url(#coralBrand)"
              stroke="#f95c4b"
              strokeWidth="0.8"
            />
            {/* Fin bevel highlight */}
            <path
              d="M -22 14 L -50 50"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeOpacity="0.4"
            />

            {/* ─── RIGHT DELTA FIN (Wing) ─── */}
            <path
              d="M 22 14 C 36 24, 48 38, 50 50 C 42 50, 26 46, 18 44 Z"
              fill="url(#coralBrand)"
              stroke="#f95c4b"
              strokeWidth="0.8"
            />
            {/* Fin bevel highlight */}
            <path
              d="M 22 14 L 50 50"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeOpacity="0.4"
            />

            {/* ─── MAIN FUSELAGE (Rocket Body) ─── */}
            <path
              d="M -20 -28 C -26 -6, -26 22, -18 48 L 18 48 C 26 22, 26 -6, 20 -28 Z"
              fill="url(#fuselageBody)"
              stroke="#cbd5e1"
              strokeWidth="1"
            />

            {/* Body specular gloss line */}
            <path
              d="M -14 -20 C -18 0, -18 20, -12 42"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeOpacity="0.85"
            />

            {/* ─── NOSE CONE (Signature Coral) ─── */}
            <path
              d="M 0 -68 C -10 -54, -18 -40, -20 -28 L 20 -28 C 18 -40, 10 -54, 0 -68 Z"
              fill="url(#coralBrand)"
            />
            {/* Nose cone tip highlight */}
            <path
              d="M 0 -68 C -5 -56, -9 -44, -10 -32"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeOpacity="0.6"
            />

            {/* ─── CENTER DORSAL FIN / RIDGE ─── */}
            <path
              d="M 0 -12 L 0 46"
              stroke="url(#coralBrand)"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* ─── PORTHOLE COCKPIT WINDOW ─── */}
            {/* Outer Bezel */}
            <circle
              cx="0"
              cy="6"
              r="13"
              fill="#1e293b"
              stroke="#f95c4b"
              strokeWidth="2.5"
            />
            {/* Inner Glass */}
            <circle
              cx="0"
              cy="6"
              r="10"
              fill="url(#windowGlass)"
            />
            {/* Glass Curved Glare Reflex */}
            <path
              d="M -6 1 Q 0 -5, 6 1"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeOpacity="0.9"
            />
          </g>
        </motion.g>
      </svg>
    </div>
  );
}
