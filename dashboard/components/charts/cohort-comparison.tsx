"use client";

import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, TrendingDown, Users, Clock, Target } from "lucide-react";
import { SpringCounter, SpringCurrency } from "@/components/ui/spring-counter";

interface CohortData {
  accelerators: {
    count: number;
    avg_fpl_change: number;
    avg_wage_gain: number;
    avg_days: number;
    avg_start_fpl: number;
  };
  decelerators: {
    count: number;
    avg_fpl_change: number;
    avg_wage_gain: number;
    avg_days: number;
    avg_start_fpl: number;
  };
  middle: {
    count: number;
    avg_fpl_change: number;
    avg_wage_gain: number;
  };
  thresholds: {
    wage_75th: number;
    wage_25th: number;
  };
}

interface CohortComparisonProps {
  data: CohortData;
}

function StatRow({
  label,
  accelerator,
  decelerator,
  format = "number",
  higherIsBetter = true,
}: {
  label: string;
  accelerator: number;
  decelerator: number;
  format?: "currency" | "percent" | "number" | "days";
  higherIsBetter?: boolean;
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case "currency":
        return `$${Math.abs(val).toLocaleString()}`;
      case "percent":
        return `${(val * 100).toFixed(0)}%`;
      case "days":
        return `${val.toFixed(0)} days`;
      default:
        return val.toFixed(1);
    }
  };

  const acceleratorBetter = higherIsBetter ? accelerator > decelerator : accelerator < decelerator;

  return (
    <div className="flex items-center py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600 w-32">{label}</span>
      <div className="flex-1 flex items-center justify-center gap-8">
        <span
          className={`font-data text-lg font-semibold ${
            acceleratorBetter ? "text-[#8B9E8B]" : "text-gray-600"
          }`}
        >
          {format === "currency" && accelerator >= 0 ? "+" : ""}
          {formatValue(accelerator)}
        </span>
        <div className="w-px h-6 bg-gray-200" />
        <span
          className={`font-data text-lg font-semibold ${
            !acceleratorBetter ? "text-[#E07B67]" : "text-gray-600"
          }`}
        >
          {format === "currency" && decelerator < 0 ? "" : decelerator >= 0 ? "+" : ""}
          {formatValue(decelerator)}
        </span>
      </div>
    </div>
  );
}

export function CohortComparison({ data }: CohortComparisonProps) {
  const prefersReducedMotion = useReducedMotion();

  const wageDifferential = data.accelerators.avg_wage_gain - data.decelerators.avg_wage_gain;
  const totalWithOutcomes =
    data.accelerators.count + data.decelerators.count + data.middle.count;

  return (
    <div className="space-y-6">
      {/* Hero differential */}
      <motion.div
        className="bg-gradient-to-r from-[#8B9E8B] to-[#6B9BE0] rounded-2xl p-6 text-white"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-xs font-semibold uppercase tracking-[0.08em] mb-1">
              Cohort Wage Differential
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-data">
                <SpringCurrency value={wageDifferential} />
              </span>
              <span className="text-white/80 text-sm">per year</span>
            </div>
            <p className="text-white/80 text-sm mt-2">
              Gap between top performers and families losing income
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-xs uppercase tracking-wider mb-1">Families Tracked</p>
            <p className="text-2xl font-bold font-data">{totalWithOutcomes}</p>
          </div>
        </div>
      </motion.div>

      {/* Cohort comparison cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Accelerators */}
        <motion.div
          className="bg-[#8B9E8B]/10 border border-[#8B9E8B]/30 rounded-2xl p-5"
          initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#8B9E8B]/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#8B9E8B]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1E3A5F]">Accelerators</h3>
              <p className="text-xs text-[#8B9E8B]">Top 25% by wage gain</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5A6C7D]">Families</span>
              <span className="font-data text-lg font-bold text-[#1E3A5F]">
                {data.accelerators.count}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5A6C7D]">Avg Wage Gain</span>
              <span className="font-data text-lg font-bold text-[#8B9E8B]">
                +<SpringCurrency value={data.accelerators.avg_wage_gain} />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5A6C7D]">Avg FPL Change</span>
              <span className="font-data text-sm font-semibold text-[#8B9E8B]">
                +{(data.accelerators.avg_fpl_change * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5A6C7D]">Avg Days</span>
              <span className="font-data text-sm text-[#5A6C7D]">
                {data.accelerators.avg_days.toFixed(0)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#8B9E8B]/30">
              <span className="text-xs text-[#5A6C7D]">Entry FPL</span>
              <span className="font-data text-sm text-[#5A6C7D]">
                {(data.accelerators.avg_start_fpl * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Decelerators */}
        <motion.div
          className="bg-[#E07B67]/10 border border-[#E07B67]/30 rounded-2xl p-5"
          initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#E07B67]/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-[#E07B67]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1E3A5F]">Decelerators</h3>
              <p className="text-xs text-[#E07B67]">Negative/zero wage change</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5A6C7D]">Families</span>
              <span className="font-data text-lg font-bold text-[#1E3A5F]">
                {data.decelerators.count}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5A6C7D]">Avg Wage Change</span>
              <span className="font-data text-lg font-bold text-[#E07B67]">
                <SpringCurrency value={data.decelerators.avg_wage_gain} />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5A6C7D]">Avg FPL Change</span>
              <span className="font-data text-sm font-semibold text-[#E07B67]">
                {(data.decelerators.avg_fpl_change * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5A6C7D]">Avg Days</span>
              <span className="font-data text-sm text-[#5A6C7D]">
                {data.decelerators.avg_days.toFixed(0)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#E07B67]/30">
              <span className="text-xs text-[#5A6C7D]">Entry FPL</span>
              <span className="font-data text-sm text-[#5A6C7D]">
                {(data.decelerators.avg_start_fpl * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Key insight */}
      <motion.div
        className="bg-gray-50 rounded-xl p-4 border border-gray-200"
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#4A7CCC]/20 flex items-center justify-center flex-shrink-0">
            <Target className="w-4 h-4 text-[#4A7CCC]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Key Finding</p>
            <p className="text-sm text-gray-600">
              Accelerators entered at <span className="font-data font-semibold">{(data.accelerators.avg_start_fpl * 100).toFixed(0)}%</span> FPL
              while Decelerators started at <span className="font-data font-semibold">{(data.decelerators.avg_start_fpl * 100).toFixed(0)}%</span> FPL.
              Families starting deeper in poverty have more room for gains, but those at moderate poverty levels may face benefits cliff risks.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
