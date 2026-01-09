"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { liftVariant, cardVariant } from "@/lib/motion";

interface MotionCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  disableLift?: boolean;
}

export function MotionCard({
  children,
  className,
  delay = 0,
  disableLift = false,
}: MotionCardProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div
        className={cn(
          "bg-white rounded-3xl p-6 shadow-[0_1px_3px_0_rgb(0_0_0/0.1)]",
          className
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        "bg-white rounded-3xl p-6 shadow-[0_1px_3px_0_rgb(0_0_0/0.1)]",
        className
      )}
      variants={disableLift ? cardVariant : liftVariant}
      initial="hidden"
      animate="visible"
      whileHover={disableLift ? undefined : "hover"}
      custom={delay}
      style={{ originX: 0.5, originY: 0.5 }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
}

export function StaggerContainer({ children, className }: StaggerContainerProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          },
        },
      }}
      whileHover={{
        y: -4,
        boxShadow: "0 12px 24px -8px rgb(0 0 0 / 0.12)",
        transition: { duration: 0.2 },
      }}
    >
      {children}
    </motion.div>
  );
}
