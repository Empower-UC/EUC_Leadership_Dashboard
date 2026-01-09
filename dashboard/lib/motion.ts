"use client";

import { Variants, Transition } from "framer-motion";

// Snappy easing curves for modern SaaS feel
export const easing = {
  easeOut: [0.16, 1, 0.3, 1] as [number, number, number, number],
  easeInOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
  backOut: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  spring: { type: "spring", stiffness: 300, damping: 30 } as const,
};

// Stagger configuration for card grids
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Individual card animation (slide up + fade in)
export const cardVariant: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easing.easeOut,
    },
  },
};

// Lift effect for hover
export const liftVariant: Variants = {
  rest: {
    y: 0,
    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
    transition: { duration: 0.2, ease: "easeOut" },
  },
  hover: {
    y: -4,
    boxShadow: "0 12px 24px -8px rgb(0 0 0 / 0.12)",
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

// Table row hover effect
export const rowVariant: Variants = {
  rest: {
    backgroundColor: "rgba(255, 255, 255, 0)",
    transition: { duration: 0.15 },
  },
  hover: {
    backgroundColor: "rgba(59, 130, 246, 0.04)",
    transition: { duration: 0.15 },
  },
};

// Fade in animation for sections
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easing.easeOut,
    },
  },
};

// Tooltip animation
export const tooltipVariant: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.15,
      ease: easing.easeOut,
    },
  },
};

// Bar chart grow animation
export const barVariant: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: {
      duration: 0.6,
      ease: easing.backOut,
    },
  },
};

// Spring transition for numbers
export const springTransition: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
};
