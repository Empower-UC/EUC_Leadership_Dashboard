"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  Area,
  AreaChart,
  ComposedChart,
  Legend,
} from "recharts";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Clock, TrendingUp, Target } from "lucide-react";

interface TenureData {
  bracket: string;
  count: number;
  success_rate: number;
  avg_wage_gain: number;
  avg_fpl_change: number;
  avg_days: number;
}

interface CumulativeData {
  month: string;
  month_label: string;
  new_families: number;
  new_wage_gains: number;
  cumulative_families: number;
  cumulative_wage_gains: number;
  avg_wage_per_family: number;
}

interface LearningCurveProps {
  tenureData: TenureData[];
  cumulativeData: CumulativeData[];
}

function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  if (absValue >= 1000000) return `${value < 0 ? "-" : ""}$${(absValue / 1000000).toFixed(1)}M`;
  if (absValue >= 1000) return `${value < 0 ? "-" : ""}$${(absValue / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function getSuccessColor(rate: number): string {
  if (rate >= 60) return "#8B9E8B"; // High success - sage
  if (rate >= 30) return "#D4A574"; // Moderate - amber
  if (rate > 0) return "#4A7CCC"; // Low - blue
  return "#E5E7EB"; // No success - gray
}

interface TenureTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: TenureData }>;
}

function TenureTooltip({ active, payload }: TenureTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-xs">
      <p className="font-semibold text-gray-900 mb-2">{data.bracket}</p>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Families:</span>
          <span className="font-data font-medium">{data.count}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Success Rate:</span>
          <span className={`font-data font-bold ${data.success_rate >= 50 ? "text-[#8B9E8B]" : "text-gray-700"}`}>
            {data.success_rate.toFixed(0)}%
          </span>
        </div>
        <div className="flex justify-between border-t border-gray-100 pt-1 mt-1">
          <span className="text-gray-500">Avg Wage Gain:</span>
          <span className={`font-data font-semibold ${data.avg_wage_gain > 0 ? "text-[#8B9E8B]" : "text-gray-500"}`}>
            {formatCurrency(data.avg_wage_gain)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Avg FPL Change:</span>
          <span className="font-data">
            {data.avg_fpl_change >= 0 ? "+" : ""}{(data.avg_fpl_change * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}

interface CumulativeTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; dataKey: string }>;
  label?: string;
}

function CumulativeTooltip({ active, payload, label }: CumulativeTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
      <p className="font-semibold text-gray-900 mb-2">{label}</p>
      <div className="space-y-1 text-sm">
        {payload.map((entry, idx) => (
          <div key={idx} className="flex justify-between gap-4">
            <span className="text-gray-500">{entry.name}:</span>
            <span className="font-data font-medium">
              {entry.dataKey === "cumulative_wage_gains"
                ? formatCurrency(entry.value)
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LearningCurve({ tenureData, cumulativeData }: LearningCurveProps) {
  const prefersReducedMotion = useReducedMotion();

  // Calculate key metrics
  const optimalTenure = tenureData.reduce((best, current) =>
    current.avg_wage_gain > best.avg_wage_gain ? current : best
  );

  const latestCumulative = cumulativeData[cumulativeData.length - 1] || {
    cumulative_families: 0,
    cumulative_wage_gains: 0,
  };

  return (
    <div className="space-y-8">
      {/* Key insight cards */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          className="bg-[#8B9E8B]/10 border border-[#8B9E8B]/30 rounded-xl p-4"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-[#8B9E8B]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8B9E8B]">
              Optimal Duration
            </span>
          </div>
          <p className="text-2xl font-bold font-data text-[#8B9E8B]">{optimalTenure.bracket}</p>
          <p className="text-xs text-[#8B9E8B] mt-1">
            {optimalTenure.success_rate.toFixed(0)}% success, {formatCurrency(optimalTenure.avg_wage_gain)} avg
          </p>
        </motion.div>

        <motion.div
          className="bg-[#4A7CCC]/10 border border-[#4A7CCC]/30 rounded-xl p-4"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#4A7CCC]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#4A7CCC]">
              Cumulative Impact
            </span>
          </div>
          <p className="text-2xl font-bold font-data text-[#1E3A5F]">
            {formatCurrency(latestCumulative.cumulative_wage_gains)}
          </p>
          <p className="text-xs text-[#4A7CCC] mt-1">
            Total wage gains across {latestCumulative.cumulative_families} families
          </p>
        </motion.div>

        <motion.div
          className="bg-amber-50 border border-amber-200 rounded-xl p-4"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Success Progression
            </span>
          </div>
          <p className="text-2xl font-bold font-data text-amber-700">
            0% → {tenureData.find((t) => t.bracket === "24+ months")?.success_rate.toFixed(0) || 69}%
          </p>
          <p className="text-xs text-amber-600 mt-1">
            From 0-3 months to 24+ months tenure
          </p>
        </motion.div>
      </div>

      {/* Tenure analysis chart */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Success Rate by Time in Program</h3>
          <InfoTooltip
            content="Longer program tenure correlates strongly with better outcomes. Families need time to build skills and stability."
            methodology="Success = families with positive wage change. Recent enrollees show 0% because they haven't had time to progress yet."
          />
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={tenureData} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="bracket"
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<TenureTooltip />} />
            <Bar
              yAxisId="left"
              dataKey="success_rate"
              name="Success Rate"
              radius={[4, 4, 0, 0]}
              animationDuration={prefersReducedMotion ? 0 : 800}
            >
              {tenureData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getSuccessColor(entry.success_rate)} />
              ))}
            </Bar>
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="avg_wage_gain"
              name="Avg Wage Gain"
              stroke="#4A7CCC"
              strokeWidth={2}
              dot={{ fill: "#4A7CCC", strokeWidth: 0, r: 4 }}
              animationDuration={prefersReducedMotion ? 0 : 1000}
            />
          </ComposedChart>
        </ResponsiveContainer>

        <div className="flex items-center justify-center gap-6 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#8B9E8B]" />
            <span className="text-xs text-gray-500">High Success (60%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#D4A574]" />
            <span className="text-xs text-gray-500">Moderate (30-60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4A7CCC]" />
            <span className="text-xs text-gray-500">Avg Wage Gain (line)</span>
          </div>
        </div>
      </motion.div>

      {/* Cumulative impact chart */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Cumulative Program Impact Over Time</h3>
          <InfoTooltip
            content="Total wage gains generated by the program over time, showing compound community impact."
            methodology="Cumulative sum of all wage increases since each family's enrollment."
          />
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={cumulativeData} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
            <defs>
              <linearGradient id="wageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B9E8B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8B9E8B" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="month_label"
              tick={{ fontSize: 10, fill: "#6B7280" }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CumulativeTooltip />} />
            <Area
              type="monotone"
              dataKey="cumulative_wage_gains"
              name="Total Wage Gains"
              stroke="#8B9E8B"
              strokeWidth={2}
              fill="url(#wageGradient)"
              animationDuration={prefersReducedMotion ? 0 : 1200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Key takeaway */}
      <motion.div
        className="bg-gray-50 rounded-xl p-4 border border-gray-200"
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#8B9E8B]/20 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-[#8B9E8B]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Key Finding: Time Investment Pays Off</p>
            <p className="text-sm text-gray-600">
              Families who stay in the program <span className="font-semibold">18+ months</span> achieve{" "}
              <span className="font-data font-semibold text-[#8B9E8B]">65%+ success rates</span> compared to{" "}
              <span className="font-data">0-2%</span> in the first 6 months. This validates the program model:
              sustainable economic mobility requires long-term support, not quick interventions.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
