"use client";

import { motion } from "framer-motion";
import { Clock, TrendingUp } from "lucide-react";

interface LearningCurveData {
  bracket: string;
  count?: number;
  successRate: number;
  avgWageGain: number;
}

interface LearningCurveChartProps {
  data: LearningCurveData[];
  title?: string;
  subtitle?: string;
}

export function LearningCurveChart({
  data,
  title = "Outcomes Improve With Time",
  subtitle = "Success rates and wage gains by program tenure"
}: LearningCurveChartProps) {
  // Find max for scaling
  const maxSuccessRate = Math.max(...data.map(d => d.successRate));
  const maxWageGain = Math.max(...data.map(d => d.avgWageGain));

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-[#4A7CCC]/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Clock className="w-6 h-6 text-[#4A7CCC]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-4">
        {data.map((bracket, index) => (
          <motion.div
            key={bracket.bracket}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 w-24">
                {bracket.bracket}
              </span>
              {bracket.count !== undefined && (
                <span className="text-xs text-gray-400">
                  {bracket.count} families
                </span>
              )}
            </div>

            {/* Success rate bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#4A7CCC] to-[#6B9BE0] rounded-full flex items-center justify-end pr-2"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(5, (bracket.successRate / maxSuccessRate) * 100)}%` }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                >
                  {bracket.successRate > 10 && (
                    <span className="text-xs font-bold text-white">
                      {bracket.successRate.toFixed(0)}%
                    </span>
                  )}
                </motion.div>
              </div>

              {/* Wage gain indicator */}
              <div className="w-24 text-right">
                {bracket.avgWageGain > 0 ? (
                  <span className="text-sm font-data font-semibold text-[#8B9E8B]">
                    +${(bracket.avgWageGain / 1000).toFixed(1)}K
                  </span>
                ) : (
                  <span className="text-sm font-data text-gray-400">
                    —
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Key insight callout */}
      <div className="mt-6 p-4 bg-[#4A7CCC]/10 rounded-xl border border-[#4A7CCC]/20">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-[#4A7CCC] mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#1E3A5F]">
              Key Insight: Patience Pays Off
            </p>
            <p className="text-xs text-[#5A6C7D] mt-1">
              Families in the program 18+ months show 64-69% success rates vs. 0-2% in the first 6 months.
              Sustainable outcomes require sustained engagement.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
