import {
  type ReactNode,
  type HTMLAttributes,
} from "react";
import type { MotionProps } from "framer-motion";
import {
  easings,
  durations,
  springs,
  transitions,
  fade,
  slideUp,
  scaleIn,
  pop,
  stagger,
  brightChatCaret,
  homeClientLogosMarquee,
  inView,
  inViewFadeIn,
  inViewRiseIn,
  buttonHoverTap,
  cardHoverElevation,
} from "@/lib/symboolic.com-motion.framer";

// Re-export all presets from the canonical Symboolic motion file
export {
  easings,
  durations,
  springs,
  transitions,
  fade,
  slideUp,
  scaleIn,
  pop,
  stagger,
  brightChatCaret,
  homeClientLogosMarquee,
  inView,
  inViewFadeIn,
  inViewRiseIn,
  buttonHoverTap,
  cardHoverElevation,
};

// ─── High-Performance, SSR-Safe Components ───
// These components guarantee that content is 100% visible on first render (SSR and CSR)
// without ever getting stuck at opacity: 0 during hydration or network latency.

export function MotionSlideUp({
  children,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
} & MotionProps) {
  return <div className={`transition-all duration-300 ${className}`}>{children}</div>;
}

export function MotionFade({
  children,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
} & MotionProps) {
  return <div className={`transition-all duration-300 ${className}`}>{children}</div>;
}

export function MotionScaleIn({
  children,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
} & MotionProps) {
  return <div className={`transition-all duration-300 ${className}`}>{children}</div>;
}

export function MotionPop({
  children,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
} & MotionProps) {
  return <div className={`transition-all duration-300 ${className}`}>{children}</div>;
}

export function MotionRiseIn({
  children,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
} & MotionProps) {
  return <div className={`transition-all duration-300 ${className}`}>{children}</div>;
}

export function MotionStagger({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delay?: number;
} & MotionProps) {
  return <div className={className}>{children}</div>;
}

// ─── Backward-Compatible Wrappers ───

export function FadeUp({
  children,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
} & MotionProps & HTMLAttributes<HTMLDivElement>) {
  return <div className={`transition-all duration-300 ${className}`}>{children}</div>;
}

export function FadeIn({
  children,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
} & MotionProps & HTMLAttributes<HTMLDivElement>) {
  return <div className={`transition-all duration-300 ${className}`}>{children}</div>;
}

export function ScaleIn({
  children,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
} & MotionProps & HTMLAttributes<HTMLDivElement>) {
  return <div className={`transition-all duration-300 ${className}`}>{children}</div>;
}

export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
}) {
  return <div className={`transition-all duration-300 ${className}`}>{children}</div>;
}

export function Stagger({
  children,
  className = "",
}: {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  baseDelay?: number;
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <div key={i} className="transition-all duration-300">
          {child}
        </div>
      ))}
    </div>
  );
}

export function SlideLeft({
  children,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return <div className={`transition-all duration-300 w-full min-w-0 ${className}`}>{children}</div>;
}

export function SlideRight({
  children,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return <div className={`transition-all duration-300 w-full min-w-0 ${className}`}>{children}</div>;
}
