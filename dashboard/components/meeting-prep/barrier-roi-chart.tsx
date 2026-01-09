"use client";

import { motion } from "framer-motion";
import { Target, DollarSign } from "lucide-react";

interface BarrierData {
  barrier: string;
  prevalence: number;
  roiRatio: number;
  resolutionCost: number;
  leverageScore?: number;
}

interface BarrierROIChartProps {
  data: BarrierData[];
  title?: string;
  subtitle?: string;
}

export function BarrierROIChart({
  data,
  title = "Barrier Intervention ROI",
  subtitle = "Which barriers are most worth solving"
}: BarrierROIChartProps) {
  // Sort by ROI ratio descending
  const sortedData = [...data].sort((a, b) => b.roiRatio - a.roiRatio);
  const maxROI = Math.max(...data.map(d => d.roiRatio));

  const getBarrierShortName = (barrier: string) => {
    const shortNames: Record<string, string> = {
      "Childcare issues": "Childcare",
      "Transportation issues": "Transportation",
      "Physical or Mental Health Related issues": "Health",
      "Problems with Job Skills": "Job Skills",
      "Attending school or training": "Education",
      "Housing issues": "Housing",
      "Problems with Basic Skills": "Basic Skills"
    };
    return shortNames[barrier] || barrier;
  };

  const getROIColor = (roi: number) => {
    if (roi >= 1.5) return "sage";
    if (roi >= 1.0) return "blue";
    if (roi >= 0.5) return "amber";
    return "gray";
  };

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-[#8B9E8B]/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Target className="w-6 h-6 text-[#8B9E8B]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
      </div>

      {/* Barrier list */}
      <div className="space-y-4">
        {sortedData.map((barrier, index) => {
          const color = getROIColor(barrier.roiRatio);
          const colorClasses = {
            sage: {
              bg: "bg-[#8B9E8B]/20",
              bar: "bg-[#8B9E8B]",
              text: "text-[#8B9E8B]"
            },
            blue: {
              bg: "bg-[#4A7CCC]/20",
              bar: "bg-[#4A7CCC]",
              text: "text-[#4A7CCC]"
            },
            amber: {
              bg: "bg-[#D4A574]/20",
              bar: "bg-[#D4A574]",
              text: "text-[#D4A574]"
            },
            gray: {
              bg: "bg-gray-100",
              bar: "bg-gray-400",
              text: "text-gray-600"
            }
          }[color];

          return (
            <motion.div
              key={barrier.barrier}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">
                    {getBarrierShortName(barrier.barrier)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {barrier.prevalence.toFixed(0)}% of families
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500">
                    ${barrier.resolutionCost.toLocaleString()} to resolve
                  </span>
                  <span className={`text-sm font-bold font-data ${colorClasses.text}`}>
                    {barrier.roiRatio.toFixed(2)}x ROI
                  </span>
                </div>
              </div>

              {/* ROI bar */}
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${colorClasses.bar} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(barrier.roiRatio / maxROI) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Key insight */}
      <div className="mt-6 p-4 bg-[#8B9E8B]/10 rounded-xl border border-[#8B9E8B]/20">
        <div className="flex items-start gap-2">
          <DollarSign className="w-4 h-4 text-[#8B9E8B] mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#1E3A5F]">
              Highest Leverage Interventions
            </p>
            <p className="text-xs text-[#5A6C7D] mt-1">
              Transportation (1.77x) and Childcare (1.42x) barriers show the best ROI.
              Every $1 spent on these barriers returns more than $1 in family income gains.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
