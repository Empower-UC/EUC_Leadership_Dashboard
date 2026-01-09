"use client";

import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, Car, Target, Users } from "lucide-react";

interface InvestmentThesis {
  id: number;
  title: string;
  insight: string;
  metric: string;
  metric_label: string;
  detail: string;
  color: "sage" | "blue" | "amber" | "navy";
}

interface InvestmentThesisCardsProps {
  theses: InvestmentThesis[];
}

const colorConfig = {
  sage: {
    bg: "bg-[#8B9E8B]/10",
    border: "border-[#8B9E8B]/30",
    metric: "text-[#8B9E8B]",
    icon: "bg-[#8B9E8B]/20 text-[#8B9E8B]",
    glow: "shadow-[#8B9E8B]/10",
  },
  blue: {
    bg: "bg-[#4A7CCC]/10",
    border: "border-[#4A7CCC]/30",
    metric: "text-[#4A7CCC]",
    icon: "bg-[#4A7CCC]/20 text-[#4A7CCC]",
    glow: "shadow-[#4A7CCC]/10",
  },
  amber: {
    bg: "bg-[#D4A574]/10",
    border: "border-[#D4A574]/30",
    metric: "text-[#D4A574]",
    icon: "bg-[#D4A574]/20 text-[#D4A574]",
    glow: "shadow-[#D4A574]/10",
  },
  navy: {
    bg: "bg-[#1E3A5F]/10",
    border: "border-[#1E3A5F]/30",
    metric: "text-[#1E3A5F]",
    icon: "bg-[#1E3A5F]/20 text-[#1E3A5F]",
    glow: "shadow-[#1E3A5F]/10",
  },
};

const iconMap: Record<string, React.ElementType> = {
  "Success Dividend": TrendingUp,
  "Transportation Multiplier": Car,
  "Deep Poverty ROI": Target,
  "Navigator Variance": Users,
};

export function InvestmentThesisCards({ theses }: InvestmentThesisCardsProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-2 gap-4">
      {theses.map((thesis, index) => {
        const colors = colorConfig[thesis.color] || colorConfig.blue;
        const Icon = iconMap[thesis.title] || TrendingUp;

        return (
          <motion.div
            key={thesis.id}
            className={`relative rounded-2xl border ${colors.border} ${colors.bg} p-6 overflow-hidden`}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={prefersReducedMotion ? {} : { y: -2, boxShadow: "0 8px 30px -10px rgba(0,0,0,0.1)" }}
          >
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03]">
              <Icon className="w-full h-full" />
            </div>

            {/* Content */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.icon}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{thesis.title}</h3>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold font-data ${colors.metric}`}>
                    {thesis.metric}
                  </span>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">
                    {thesis.metric_label}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                {thesis.insight}
              </p>

              <p className="text-xs text-gray-500 font-mono leading-relaxed">
                {thesis.detail}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
