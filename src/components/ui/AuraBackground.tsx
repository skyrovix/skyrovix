import type { ReactNode } from "react";

interface AuraBackgroundProps {
  children?: ReactNode;
  className?: string;
  minHeight?: string;
  animate?: boolean;
}

/**
 * Orchid Bloom Aura Gradient Background
 * Designed with Symboolic & Orchid Bloom specifications:
 * - Base background: #faf8f2
 * - Transparent gradient container blending with mix-blend-mode: multiply
 * - Layer 1 & Layer 2 exact stops
 * - 90px blur on mobile, 130px blur on desktop
 * - transform: translateZ(0), will-change: transform
 * - pointer-events: none, aria-hidden: true on decorative layers
 * - Content positioned at relative z-index: 1
 */
export function AuraBackground({
  children,
  className = "",
  minHeight,
  animate = true,
}: AuraBackgroundProps) {
  return (
    <div
      className={`relative overflow-hidden w-full ${className}`}
      style={{
        minHeight: minHeight ?? undefined,
        backgroundColor: "transparent",
      }}
    >
      {/* ── Base background layer: #faf8f2 ── */}
      <div
        className="absolute inset-0 bg-[#faf8f2] dark:bg-[#181619] -z-20 pointer-events-none"
        aria-hidden="true"
      />

      {/* ── Transparent Aura Gradient Container ── */}
      <div
        className="absolute inset-0 pointer-events-none -z-10 overflow-hidden bg-transparent"
        aria-hidden="true"
      >
        {/* Layer 1 */}
        <div
          className={`absolute inset-0 pointer-events-none ${
            animate ? "aura-animate-drift" : ""
          }`}
          style={{
            transform: "translateZ(0)",
            willChange: "transform",
            mixBlendMode: "multiply",
            background:
              "linear-gradient( rgba(0,0,0,0) 0%, rgba(242,61,224,0.12) 28%, rgb(255,255,255) 18%, rgb(139,92,246) 68%, rgb(61,139,255) 100% )",
            filter: "blur(var(--aura-blur, 90px))",
            opacity: 0.85,
          }}
        />

        {/* Layer 2 */}
        <div
          className={`absolute inset-0 pointer-events-none ${
            animate ? "aura-animate-drift" : ""
          }`}
          style={{
            transform: "translateZ(0)",
            willChange: "transform",
            mixBlendMode: "multiply",
            background:
              "linear-gradient( rgba(0,0,0,0) 0%, rgba(242,61,224,0.22) 34%, rgb(255,255,255) 66%, rgb(139,92,246) 82%, rgb(61,139,255) 100% )",
            filter: "blur(var(--aura-blur, 90px))",
            opacity: 0.9,
            animationDirection: "alternate-reverse",
          }}
        />

        {/* Subtle noise/atmosphere texture for depth */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "180px 180px",
          }}
        />
      </div>

      {/* ── Content on top ── */}
      <div className="relative z-[1] w-full">{children}</div>
    </div>
  );
}

export default AuraBackground;
