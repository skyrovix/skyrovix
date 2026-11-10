import {
  type ReactNode,
  type HTMLAttributes,
  useState,
  useEffect,
  useRef,
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

// Re-export all presets from canonical motion file
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

/**
 * High-performance, SSR-safe scroll reveal hook.
 * Uses IntersectionObserver on the client and guarantees 100% visibility for SSR and bots.
 */
export function useScrollReveal({
  threshold = 0.1,
  rootMargin = "0px 0px -40px 0px",
  once = true,
}: {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
} = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const node = ref.current;
    if (!node) return;

    // Accessibility: instant visibility for reduced motion users
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(node);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isVisible, mounted };
}

// ─── High-Performance, Smooth Reveal Components ───

export function FadeUp({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  y = 28,
  threshold = 0.08,
  style = {},
  ...rest
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  threshold?: number;
  className?: string;
  style?: React.CSSProperties;
} & MotionProps & HTMLAttributes<HTMLDivElement>) {
  const { ref, isVisible, mounted } = useScrollReveal({ threshold });
  const active = !mounted || isVisible;

  return (
    <div
      ref={ref}
      className={`will-change-[transform,opacity] transition-all ${className}`}
      style={{
        ...style,
        opacity: active ? 1 : 0,
        transform: active ? "translateY(0)" : `translateY(${y}px)`,
        transitionDuration: `${duration}s`,
        transitionDelay: `${delay}s`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      {...(rest as any)}
    >
      {children}
    </div>
  );
}

export function FadeIn({
  children,
  className = "",
  delay = 0,
  duration = 0.55,
  threshold = 0.08,
  style = {},
  ...rest
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  style?: React.CSSProperties;
} & MotionProps & HTMLAttributes<HTMLDivElement>) {
  const { ref, isVisible, mounted } = useScrollReveal({ threshold });
  const active = !mounted || isVisible;

  return (
    <div
      ref={ref}
      className={`will-change-[opacity] transition-opacity ${className}`}
      style={{
        ...style,
        opacity: active ? 1 : 0,
        transitionDuration: `${duration}s`,
        transitionDelay: `${delay}s`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      {...(rest as any)}
    >
      {children}
    </div>
  );
}

export function ScaleIn({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  threshold = 0.08,
  scale = 0.94,
  style = {},
  ...rest
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  threshold?: number;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
} & MotionProps & HTMLAttributes<HTMLDivElement>) {
  const { ref, isVisible, mounted } = useScrollReveal({ threshold });
  const active = !mounted || isVisible;

  return (
    <div
      ref={ref}
      className={`will-change-[transform,opacity] transition-all ${className}`}
      style={{
        ...style,
        opacity: active ? 1 : 0,
        transform: active ? "scale(1)" : `scale(${scale})`,
        transitionDuration: `${duration}s`,
        transitionDelay: `${delay}s`,
        transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.2)",
      }}
      {...(rest as any)}
    >
      {children}
    </div>
  );
}

export function Reveal({
  children,
  className = "",
  delay = 0,
  duration = 0.65,
  threshold = 0.08,
  style = {},
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  threshold?: number;
  style?: React.CSSProperties;
}) {
  const { ref, isVisible, mounted } = useScrollReveal({ threshold });
  const active = !mounted || isVisible;

  return (
    <div
      ref={ref}
      className={`will-change-[transform,opacity] transition-opacity transition-transform ${className}`}
      style={{
        ...style,
        opacity: active ? 1 : 0,
        transform: active ? "translateY(0)" : "translateY(24px)",
        transitionDuration: `${duration}s`,
        transitionDelay: `${delay}s`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  );
}

export function Stagger({
  children,
  className = "",
  staggerDelay = 0.08,
  baseDelay = 0,
  duration = 0.55,
  threshold = 0.08,
}: {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  baseDelay?: number;
  duration?: number;
  threshold?: number;
}) {
  const { ref, isVisible, mounted } = useScrollReveal({ threshold });
  const active = !mounted || isVisible;

  return (
    <div ref={ref} className={className}>
      {children.map((child, i) => (
        <div
          key={i}
          className="will-change-[transform,opacity] transition-all"
          style={{
            opacity: active ? 1 : 0,
            transform: active ? "translateY(0)" : "translateY(24px)",
            transitionDuration: `${duration}s`,
            transitionDelay: `${baseDelay + i * staggerDelay}s`,
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

export function SlideLeft({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  x = 36,
  threshold = 0.08,
  style = {},
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  x?: number;
  threshold?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { ref, isVisible, mounted } = useScrollReveal({ threshold });
  const active = !mounted || isVisible;

  return (
    <div
      ref={ref}
      className={`w-full min-w-0 will-change-[transform,opacity] transition-all ${className}`}
      style={{
        ...style,
        opacity: active ? 1 : 0,
        transform: active ? "translateX(0)" : `translateX(-${x}px)`,
        transitionDuration: `${duration}s`,
        transitionDelay: `${delay}s`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  );
}

export function SlideRight({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  x = 36,
  threshold = 0.08,
  style = {},
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  x?: number;
  threshold?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { ref, isVisible, mounted } = useScrollReveal({ threshold });
  const active = !mounted || isVisible;

  return (
    <div
      ref={ref}
      className={`w-full min-w-0 will-change-[transform,opacity] transition-all ${className}`}
      style={{
        ...style,
        opacity: active ? 1 : 0,
        transform: active ? "translateX(0)" : `translateX(${x}px)`,
        transitionDuration: `${duration}s`,
        transitionDelay: `${delay}s`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  );
}

// ─── Direct Mapping Wrappers for Legacy & Symboolic Support ───

export function MotionSlideUp(props: Parameters<typeof FadeUp>[0]) {
  return <FadeUp {...props} />;
}

export function MotionFade(props: Parameters<typeof FadeIn>[0]) {
  return <FadeIn {...props} />;
}

export function MotionScaleIn(props: Parameters<typeof ScaleIn>[0]) {
  return <ScaleIn {...props} />;
}

export function MotionPop(props: Parameters<typeof ScaleIn>[0]) {
  return <ScaleIn scale={0.9} duration={0.45} {...props} />;
}

export function MotionRiseIn(props: Parameters<typeof FadeUp>[0]) {
  return <FadeUp y={36} duration={0.7} {...props} />;
}

export function MotionStagger({
  children,
  className = "",
  staggerDelay = 0.08,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delay?: number;
} & MotionProps) {
  const childrenArray = Array.isArray(children) ? children : [children];
  return (
    <Stagger
      className={className}
      staggerDelay={staggerDelay}
      baseDelay={delay}
    >
      {childrenArray}
    </Stagger>
  );
}
