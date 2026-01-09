"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { tooltipVariant } from "@/lib/motion";

interface MotionTooltipProps {
  children: ReactNode;
  content: ReactNode;
  className?: string;
}

export function MotionTooltip({ children, content, className }: MotionTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={cn(
              "absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-xl bg-gray-900 text-white text-sm shadow-lg whitespace-nowrap",
              className
            )}
            variants={prefersReducedMotion ? undefined : tooltipVariant}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {content}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
