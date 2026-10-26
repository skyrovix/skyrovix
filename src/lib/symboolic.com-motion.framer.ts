import type { Variants, Transition } from "framer-motion";

/**
 * Symboolic Motion Presets (extracted from https://symboolic.com/)
 * Core design system easing curves, durations, springs, and reusable Framer Motion variants.
 */

export const easings = {
  easeOut: [0.22, 1, 0.36, 1],
  custom2: [0.4, 0, 0.2, 1],
  easeInOut: [0.25, 0.1, 0.25, 1],
  spring: [0.34, 1.7, 0.64, 1],
  custom7: [0.65, 0, 0.35, 1],
} as const;

export const durations = {
  xs: 0.1,
  sm: 0.2,
  md: 0.3,
  lg: 0.45,
} as const;

export const springs = {
  soft: { type: "spring", stiffness: 700, damping: 8, mass: 1 },
} as const;

export const transitions = {
  base: { duration: durations.md, ease: easings.easeOut } as Transition,
  fast: { duration: 0.15, ease: easings.easeOut } as Transition,
  slow: { duration: durations.lg, ease: easings.easeOut } as Transition,
  spring: springs.soft as Transition,
} as const;

// ─── Reusable Framer Motion Variants ───

/**
 * fade: opacity 1 by default so SSR and slow hydration never hide content
 */
export const fade: Variants = {
  initial: { opacity: 1 },
  animate: { opacity: 1, transition: transitions.base },
  exit: { opacity: 0, transition: transitions.fast },
};

/**
 * slideUp: opacity 1 by default so SSR and slow hydration never hide content
 */
export const slideUp: Variants = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0, transition: transitions.base },
  exit: { opacity: 0, y: 16, transition: transitions.fast },
};

/**
 * scaleIn: opacity 1 by default so SSR and slow hydration never hide content
 */
export const scaleIn: Variants = {
  initial: { opacity: 1, scale: 1 },
  animate: { opacity: 1, scale: 1, transition: transitions.base },
  exit: { opacity: 0, scale: 0.96, transition: transitions.fast },
};

/**
 * pop: opacity 1 by default so SSR and slow hydration never hide content
 */
export const pop: Variants = {
  initial: { opacity: 1, scale: 1 },
  animate: { opacity: 1, scale: 1, transition: transitions.spring },
  exit: { opacity: 0, scale: 0.9, transition: transitions.fast },
};

/**
 * stagger: stagger children by 0.075 seconds
 */
export const stagger: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.075,
      delayChildren: 0.05,
    },
  },
};

/**
 * brightChatCaret: subtle opacity animation for an existing text cursor
 */
export const brightChatCaret: Variants = {
  initial: { opacity: 1 },
  animate: {
    opacity: [1, 0, 1],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

/**
 * homeClientLogosMarquee: continuous horizontal marquee loop
 */
export const homeClientLogosMarquee: Variants = {
  animate: {
    x: ["0%", "-50%"],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 30,
        ease: "linear",
      },
    },
  },
};

// ─── Reusable InView Presets ───

export const inView = {
  viewport: { once: true, amount: 0.3 } as const,

  fadeIn: {
    initial: { opacity: 1 },
    whileInView: { opacity: 1 },
    viewport: { once: true, amount: 0.1 },
    transition: transitions.base,
  },

  riseIn: {
    initial: { opacity: 1, y: 0 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.1 },
    transition: transitions.base,
  },
} as const;

export const inViewFadeIn = inView.fadeIn;
export const inViewRiseIn = inView.riseIn;

// ─── Reusable Interactive Micro-interactions ───

export const buttonHoverTap = {
  whileHover: { y: -2, transition: transitions.fast },
  whileTap: { scale: 0.98, transition: transitions.fast },
} as const;

export const cardHoverElevation = {
  whileHover: { y: -4, transition: transitions.base },
} as const;
