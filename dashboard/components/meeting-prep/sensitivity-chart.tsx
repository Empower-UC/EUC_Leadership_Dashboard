"use client";

import { motion } from "framer-motion";
import { Scale, AlertTriangle } from "lucide-react";

interface SensitivityScenario {
  scenario: string;
  attributedGains: number;
  impliedROI: string;
}

interface SensitivityChartProps {
  data: SensitivityScenario[];
  title?: string;
  subtitle?: string;
  warningNote?: string;
}

export function SensitivityChart({
  data,
  title = "Sensitivity Analysis",
  subtitle = "ROI under different attribution scenarios",
  warningNote
}: SensitivityChartProps) {
  const maxGains = Math.max(...data.map(d => d.attributedGains));

  const formatScenarioLabel = (scenario: string) => {
    const labels: Record<string, { label: string; description: string }> = {
      "conservative_30pct": { label: "30% Attribution", description: "Most conservative" },
      "moderate_50pct": { label: "50% Attribution", description: "Moderate estimate" },
      "optimistic_70pct": { label: "70% Attribution", description: "Likely scenario" },
      "full_100pct": { label: "100% Attribution", description: "Full credit to program" }
    };
    return labels[scenario] || { label: scenario, description: "" };
  };

  const getBarColor = (scenario: string) => {
    if (scenario.includes("conservative")) return "bg-slate-400";
    if (scenario.includes("moderate")) return "bg-[#4A7CCC]";
    if (scenario.includes("optimistic")) return "bg-[#8B9E8B]";
    return "bg-[#1E3A5F]";
  };

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-[#4A7CCC]/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Scale className="w-6 h-6 text-[#4A7CCC]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
      </div>

      {/* Sensitivity scenarios */}
      <div className="space-y-4">
        {data.map((scenario, index) => {
          const { label, description } = formatScenarioLabel(scenario.scenario);
          const barColor = getBarColor(scenario.scenario);

          return (
            <motion.div
              key={scenario.scenario}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900 min-w-[120px]">
                    {label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {description}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    ${(scenario.attributedGains / 1000000).toFixed(1)}M
                  </span>
                  <span className="text-sm font-bold font-data text-[#1E3A5F] min-w-[60px] text-right">
                    {scenario.impliedROI}
                  </span>
                </div>
              </div>

              {/* Attribution bar */}
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${barColor} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(scenario.attributedGains / maxGains) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Warning note */}
      {warningNote && (
        <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                Important Context
              </p>
              <p className="text-xs text-amber-700 mt-1">
                {warningNote}
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
