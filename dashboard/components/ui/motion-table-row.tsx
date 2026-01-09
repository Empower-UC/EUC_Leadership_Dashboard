"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MotionTableRowProps {
  children: ReactNode;
  className?: string;
  isActive?: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

export function MotionTableRow({
  children,
  className,
  isActive,
  onHoverStart,
  onHoverEnd,
}: MotionTableRowProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <tr className={cn("border-b border-gray-100", className)}>
        {children}
      </tr>
    );
  }

  return (
    <motion.tr
      className={cn(
        "border-b border-gray-100 transition-colors",
        isActive === false && "opacity-40",
        className
      )}
      initial={false}
      animate={{
        backgroundColor: isActive ? "rgba(59, 130, 246, 0.04)" : "rgba(255, 255, 255, 0)",
      }}
      whileHover={{
        backgroundColor: "rgba(59, 130, 246, 0.06)",
      }}
      transition={{ duration: 0.15 }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
    >
      {children}
    </motion.tr>
  );
}
