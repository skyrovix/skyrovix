import {
  type ReactNode,
  type HTMLAttributes,
} from "react";
import {
  motion,
  type MotionProps,
  type Variants,
} from "framer-motion";
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

// ─── Framer Motion Components Using Symboolic Presets ───

/**
 * Slide upward (y = 16 to y = 0) with Symboolic easeOut
 */
export function MotionSlideUp({
  children,
  delay = 0,
  className = "",
  ...props
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
} & MotionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: durations.md,
        ease: easings.easeOut,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Fade in with Symboolic transition
 */
export function MotionFade({
  children,
  delay = 0,
  className = "",
  ...props
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
} & MotionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: durations.md,
        ease: easings.easeOut,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scale in (0.96 to 1) with Symboolic transition
 */
export function MotionScaleIn({
  children,
  delay = 0,
  className = "",
  ...props
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
} & MotionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: durations.md,
        ease: easings.easeOut,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Pop in with Symboolic spring preset
 */
export function MotionPop({
  children,
  delay = 0,
  className = "",
  ...props
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
} & MotionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        ...springs.soft,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Rise in on viewport entry (y = 16 to y = 0, opacity 0 to 1, viewport: { once: true, amount: 0.3 })
 */
export function MotionRiseIn({
  children,
  delay = 0,
  className = "",
  ...props
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
} & MotionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: durations.md,
        ease: easings.easeOut,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger container for animating children with 0.075s interval
 */
export function MotionStagger({
  children,
  className = "",
  staggerDelay = 0.075,
  delay = 0.05,
  ...props
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delay?: number;
} & MotionProps) {
  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ─── Backward-Compatible Wrappers Upgraded to Symboolic Motion Presets ───

/**
 * FadeUp: Upgraded to Symboolic slideUp preset (y=16, duration=0.3s, ease: [0.22, 1, 0.36, 1])
 */
export function FadeUp({
  children,
  delay = 0,
  duration = durations.md,
  y = 16,
  className = "",
  ...props
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
} & MotionProps & HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        ease: easings.easeOut,
        delay,
      }}
      className={className}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}

/**
 * FadeIn: Upgraded to Symboolic fade preset
 */
export function FadeIn({
  children,
  delay = 0,
  duration = durations.md,
  className = "",
  ...props
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
} & MotionProps & HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration,
        ease: easings.easeOut,
        delay,
      }}
      className={className}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScaleIn: Upgraded to Symboolic scaleIn preset (scale 0.96 -> 1)
 */
export function ScaleIn({
  children,
  delay = 0,
  className = "",
  ...props
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
} & MotionProps & HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: durations.md,
        ease: easings.easeOut,
        delay,
      }}
      className={className}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}

/**
 * Reveal: Upgraded to Symboolic inView riseIn preset ({ once: true, amount: 0.3 }, y = 16)
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  threshold = 0.3,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: threshold }}
      transition={{
        duration: durations.md,
        ease: easings.easeOut,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger: Upgraded to Symboolic stagger interval (0.075s)
 */
export function Stagger({
  children,
  className = "",
  staggerDelay = 0.075,
  baseDelay = 0.05,
}: {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  baseDelay?: number;
}) {
  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: baseDelay,
          },
        },
      }}
      className={className}
    >
      {children.map((child, i) => (
        <motion.div
          key={i}
          variants={slideUp}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * SlideLeft: Upgraded to Symboolic easeOut
 */
export function SlideLeft({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: durations.md,
        ease: easings.easeOut,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * SlideRight: Upgraded to Symboolic easeOut
 */
export function SlideRight({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: durations.md,
        ease: easings.easeOut,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
