"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Label,
  ReferenceArea,
} from "recharts";
import { InfoTooltip } from "@/components/ui/info-tooltip";

interface NavigatorData {
  navigator: string;
  caseload: number;
  positive_wage_count: number;
  success_rate: number;
  avg_wage_gain: number;
  avg_fpl_change: number;
  avg_days: number;
  velocity_score: number;
}

interface NavigatorQuadrantProps {
  data: NavigatorData[];
}

function getQuadrant(successRate: number, velocityScore: number): string {
  const successMedian = 25;
  const velocityMedian = 2500;

  if (successRate >= successMedian && velocityScore >= velocityMedian) return "star";
  if (successRate < successMedian && velocityScore >= velocityMedian) return "efficient";
  if (successRate >= successMedian && velocityScore < velocityMedian) return "steady";
  return "developing";
}

function getQuadrantColor(quadrant: string): string {
  switch (quadrant) {
    case "star":
      return "#8B9E8B"; // Sage
    case "efficient":
      return "#4A7CCC"; // Blue
    case "steady":
      return "#D4A574"; // Amber
    case "developing":
      return "#9CA3AF"; // Gray
    default:
      return "#9CA3AF";
  }
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: NavigatorData }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const quadrant = getQuadrant(data.success_rate, data.velocity_score);
  const quadrantLabel = {
    star: "Star Performer",
    efficient: "High Efficiency",
    steady: "Steady Builder",
    developing: "Developing",
  }[quadrant];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: getQuadrantColor(quadrant) }}
        />
        <p className="font-semibold text-gray-900">{data.navigator}</p>
      </div>
      <p className="text-xs text-gray-500 mb-3">{quadrantLabel}</p>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Success Rate:</span>
          <span className="font-data font-medium">{data.success_rate.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Velocity Score:</span>
          <span className="font-data font-medium">{data.velocity_score.toFixed(0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Caseload:</span>
          <span className="font-data font-medium">{data.caseload} families</span>
        </div>
        <div className="flex justify-between border-t border-gray-100 pt-1 mt-1">
          <span className="text-gray-500">Avg Wage Gain:</span>
          <span className={`font-data font-bold ${data.avg_wage_gain >= 0 ? "text-[#8B9E8B]" : "text-[#E07B67]"}`}>
            {formatCurrency(data.avg_wage_gain)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Avg Days:</span>
          <span className="font-data font-medium">{data.avg_days.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}

export function NavigatorQuadrant({ data }: NavigatorQuadrantProps) {
  const prefersReducedMotion = useReducedMotion();

  // Filter out navigators with 0 or negative velocity (no outcomes to measure)
  const activeNavigators = data.filter((n) => n.velocity_score !== 0 && n.caseload >= 3);

  // Calculate medians for quadrant lines
  const velocityValues = activeNavigators.map((n) => n.velocity_score).sort((a, b) => a - b);
  const successValues = activeNavigators.map((n) => n.success_rate).sort((a, b) => a - b);

  const velocityMedian = 2500;
  const successMedian = 25;

  const maxVelocity = Math.max(...velocityValues, 10000);
  const minVelocity = Math.min(...velocityValues, 0);

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Legend */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#8B9E8B]" />
            <span className="text-xs text-gray-500">Star Performers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#4A7CCC]" />
            <span className="text-xs text-gray-500">High Efficiency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#D4A574]" />
            <span className="text-xs text-gray-500">Steady Builders</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span className="text-xs text-gray-500">Developing</span>
          </div>
        </div>
        <InfoTooltip
          content="Navigator performance based on success rate (positive wage outcomes) and velocity score (wage gain per day)."
          methodology="Velocity = avg_wage_gain / avg_days * 100. Success rate = families with positive wage change / total families."
        />
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 40, bottom: 50, left: 60 }}>
          {/* Quadrant backgrounds */}
          <ReferenceArea
            x1={velocityMedian}
            x2={maxVelocity}
            y1={successMedian}
            y2={70}
            fill="#8B9E8B"
            fillOpacity={0.05}
          />
          <ReferenceArea
            x1={minVelocity}
            x2={velocityMedian}
            y1={successMedian}
            y2={70}
            fill="#D4A574"
            fillOpacity={0.05}
          />
          <ReferenceArea
            x1={velocityMedian}
            x2={maxVelocity}
            y1={0}
            y2={successMedian}
            fill="#4A7CCC"
            fillOpacity={0.05}
          />

          <XAxis
            type="number"
            dataKey="velocity_score"
            name="Velocity Score"
            domain={[minVelocity - 500, maxVelocity + 500]}
            tick={{ fontSize: 11, fill: "#6B7280" }}
            tickFormatter={(value) => value.toLocaleString()}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={{ stroke: "#E5E7EB" }}
          >
            <Label
              value="Velocity Score (wage gain efficiency)"
              position="bottom"
              offset={10}
              style={{ fontSize: 11, fill: "#6B7280", textAnchor: "middle" }}
            />
          </XAxis>
          <YAxis
            type="number"
            dataKey="success_rate"
            name="Success Rate"
            domain={[0, 70]}
            tick={{ fontSize: 11, fill: "#6B7280" }}
            tickFormatter={(value) => `${value}%`}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={{ stroke: "#E5E7EB" }}
          >
            <Label
              value="Success Rate (%)"
              angle={-90}
              position="left"
              offset={20}
              style={{ fontSize: 11, fill: "#6B7280", textAnchor: "middle" }}
            />
          </YAxis>
          <Tooltip content={<CustomTooltip />} />

          {/* Quadrant dividers */}
          <ReferenceLine x={velocityMedian} stroke="#9CA3AF" strokeDasharray="4 4" strokeWidth={1} />
          <ReferenceLine y={successMedian} stroke="#9CA3AF" strokeDasharray="4 4" strokeWidth={1} />

          <Scatter
            data={activeNavigators}
            fill="#4A7CCC"
            animationBegin={0}
            animationDuration={prefersReducedMotion ? 0 : 800}
          >
            {activeNavigators.map((entry, index) => {
              const quadrant = getQuadrant(entry.success_rate, entry.velocity_score);
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={getQuadrantColor(quadrant)}
                  fillOpacity={0.85}
                  r={Math.max(6, Math.min(14, entry.caseload / 2))}
                />
              );
            })}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Navigator list */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {activeNavigators
          .sort((a, b) => b.velocity_score - a.velocity_score)
          .slice(0, 6)
          .map((nav) => {
            const quadrant = getQuadrant(nav.success_rate, nav.velocity_score);
            return (
              <div
                key={nav.navigator}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-xs"
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getQuadrantColor(quadrant) }}
                />
                <span className="text-gray-700 truncate">{nav.navigator.split(" ")[0]}</span>
                <span className="font-data text-gray-500 ml-auto">{nav.success_rate.toFixed(0)}%</span>
              </div>
            );
          })}
      </div>
    </motion.div>
  );
}
