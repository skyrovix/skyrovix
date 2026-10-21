import type { ReactNode } from "react";

/**
 * AuroraBackground / AuraBackground - Orchid Bloom Aura Gradient
 * Spec:
 * - Base background: #faf8f2 (dark: #181619)
 * - Gradient container is transparent
 * - Two layered linear gradients with mix-blend-mode: multiply
 * - Exact gradient stops for Layer 1 and Layer 2
 * - Blur 90px mobile, 130px desktop
 * - transform: translateZ(0), will-change: transform
 * - pointer-events: none, aria-hidden: true on decorative layers
 * - Content positioned at relative z-index: 1
 */
export function AuroraBackground({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden w-full ${className}`}
      style={{
        backgroundColor: "transparent",
      }}
    >
      {/* ── Base solid background: #faf8f2 (dark: #181619) ── */}
      <div
        className="absolute inset-0 bg-[#faf8f2] dark:bg-[#181619] -z-20 pointer-events-none"
        aria-hidden="true"
      />

      {/* ── Transparent Orchid Bloom Aura Gradient Container ── */}
      <div
        className="absolute inset-0 pointer-events-none -z-10 overflow-hidden bg-transparent"
        aria-hidden="true"
      >
        {/* Layer 1: linear-gradient( rgba(0,0,0,0) 0%, rgba(242,61,224,0.12) 28%, rgb(255,255,255) 18%, rgb(139,92,246) 68%, rgb(61,139,255) 100% ) */}
        <div
          className="absolute inset-0 pointer-events-none aura-animate-drift aura-layer-1"
          style={{
            transform: "translateZ(0)",
            willChange: "transform",
            mixBlendMode: "multiply",
            background:
              "linear-gradient( rgba(0,0,0,0) 0%, rgba(242,61,224,0.12) 28%, rgb(255,255,255) 18%, rgb(139,92,246) 68%, rgb(61,139,255) 100% )",
            opacity: 0.85,
          }}
        />

        {/* Layer 2: linear-gradient( rgba(0,0,0,0) 0%, rgba(242,61,224,0.22) 34%, rgb(255,255,255) 66%, rgb(139,92,246) 82%, rgb(61,139,255) 100% ) */}
        <div
          className="absolute inset-0 pointer-events-none aura-animate-drift aura-layer-2"
          style={{
            transform: "translateZ(0)",
            willChange: "transform",
            mixBlendMode: "multiply",
            background:
              "linear-gradient( rgba(0,0,0,0) 0%, rgba(242,61,224,0.22) 34%, rgb(255,255,255) 66%, rgb(139,92,246) 82%, rgb(61,139,255) 100% )",
            opacity: 0.9,
            animationDirection: "alternate-reverse",
          }}
        />

        {/* Subtle dot matrix pattern overlay (minimal, editorial) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(rgba(24, 22, 25, 0.15) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ── Page content cleanly above decorative layers ── */}
      <div className="relative z-[1] w-full">{children}</div>
    </div>
  );
}

export { AuroraBackground as AuraBackground };
export default AuroraBackground;

