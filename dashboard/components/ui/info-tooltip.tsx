"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Info } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface InfoTooltipProps {
  content: string;
  methodology?: string;
  className?: string;
  variant?: "light" | "dark";
}

export function InfoTooltip({ content, methodology, className = "", variant = "light" }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("top");
  const [align, setAlign] = useState<"center" | "left" | "right">("center");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      setPosition(spaceAbove > spaceBelow ? "top" : "bottom");

      // Check horizontal position - tooltip is 288px (w-72)
      const tooltipWidth = 288;
      const spaceLeft = rect.left;
      const spaceRight = window.innerWidth - rect.right;

      if (spaceLeft < tooltipWidth / 2) {
        setAlign("left");
      } else if (spaceRight < tooltipWidth / 2) {
        setAlign("right");
      } else {
        setAlign("center");
      }
    }
  }, [isOpen]);

  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        ref={triggerRef}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        className={`inline-flex items-center justify-center w-4 h-4 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          variant === "dark"
            ? "bg-white/20 hover:bg-white/30 focus:ring-white"
            : "bg-gray-100 hover:bg-gray-200 focus:ring-[#4A7CCC]"
        }`}
        aria-label="More information"
      >
        <Info className={`w-3 h-3 ${variant === "dark" ? "text-white/70" : "text-gray-500"}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: position === "top" ? 4 : -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: position === "top" ? 4 : -4, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute z-50 w-72 ${
              position === "top" ? "bottom-full mb-2" : "top-full mt-2"
            } ${
              align === "left" ? "left-0" : align === "right" ? "right-0" : "left-1/2 -translate-x-1/2"
            }`}
          >
            <div className="bg-gray-900 text-white rounded-xl p-3 shadow-xl">
              <p className="text-sm leading-relaxed">{content}</p>
              {methodology && (
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                    Methodology
                  </p>
                  <p className="text-xs text-gray-300 font-mono leading-relaxed">
                    {methodology}
                  </p>
                </div>
              )}
              {/* Arrow */}
              <div
                className={`absolute w-0 h-0 border-x-8 border-x-transparent ${
                  position === "top"
                    ? "top-full border-t-8 border-t-gray-900"
                    : "bottom-full border-b-8 border-b-gray-900"
                } ${
                  align === "left" ? "left-3" : align === "right" ? "right-3" : "left-1/2 -translate-x-1/2"
                }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Predefined actuarial tooltips for common metrics
export const ACTUARIAL_TOOLTIPS = {
  taxRevenue: {
    content: "Estimated annual tax contributions from increased wages.",
    methodology: "FICA (15.3%) + State Sales Tax (8%) applied to positive wage gains ($6.18M). Does not include federal income tax.",
  },
  breakeven: {
    content: "Years until program cost is recovered through increased tax revenue.",
    methodology: "Program Cost / Annual Tax Revenue. Uses $25M TANF allocation as denominator.",
  },
  fplChange: {
    content: "Federal Poverty Level change from enrollment to current status.",
    methodology: "Based on 686 families with both enrollment and current FPL data. 194 families lack FPL data.",
  },
  wageGain: {
    content: "Sum of all positive wage changes in the program.",
    methodology: "$6.18M total from 332 families with positive gains. 707 families have wage data; 173 lack wage data.",
  },
  graduationRate: {
    content: "Percentage of enrolled families reaching 225%+ FPL.",
    methodology: "60 graduates / 880 enrolled = 6.8%. Graduation = sustained 225%+ FPL.",
  },
  benefitsCliff: {
    content: "Risk of net income loss when benefits phase out faster than wage gains.",
    methodology: "Tennessee thresholds: SNAP (130% FPL), LIHEAP (150%), Childcare (185%), TennCare (138%).",
  },
  netCommunityGain: {
    content: "Net economic impact after accounting for all program costs and benefits.",
    methodology: "Tax Revenue + Reduced Transfers + Economic Multiplier (1.5x) - Program Cost. 10-year NPV at 3% discount.",
  },
  costPerFamily: {
    content: "Average program investment per enrolled family.",
    methodology: "$25M TANF allocation / 880 families = ~$28K. Actual spent-to-date may differ.",
  },
  benchmark: {
    content: "Comparison with similar programs. EUC shows before/after change; RCT validation pending.",
    methodology: "EUC: 22% avg FPL change (686 families). Project QUEST: 14-year RCT. Building NE Families: only other rural TANF RCT (showed 0% impact).",
  },
  improvementRate: {
    content: "Percentage of families showing positive FPL change.",
    methodology: "321 families improved / 686 with FPL data = 46.8%. Excludes 194 families without FPL data.",
  },
} as const;
