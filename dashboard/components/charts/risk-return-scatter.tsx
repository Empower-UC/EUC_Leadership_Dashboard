"use client";

import { useState } from "react";
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

interface ScatterDataPoint {
  id: string;
  risk_score: number;
  wage_gain: number;
  fpl_change: number;
  start_fpl: number;
  county: string;
  navigator: string;
}

interface RiskReturnScatterProps {
  data: ScatterDataPoint[];
}

// Generate consistent colors for counties (EUC brand palette)
const countyColors: Record<string, string> = {
  Smith: "#8B9E8B",    // Sage
  Jackson: "#4A7CCC",  // Blue
  Overton: "#6B9BE0",  // Blue Light
  Cumberland: "#E07B67", // Coral
  Putnam: "#D4A574",   // Amber
  Fentress: "#1E3A5F", // Navy
  DeKalb: "#4A7CCC",   // Blue
  Clay: "#8B9E8B",     // Sage
  Warren: "#6B9BE0",   // Blue Light
  Cannon: "#E07B67",   // Coral
  Macon: "#D4A574",    // Amber
  White: "#5A6C7D",    // Gray
  Pickett: "#E07B67",  // Coral
  Dekalb: "#4A7CCC",   // Blue
};

function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  if (absValue >= 1000) return `${value < 0 ? "-" : ""}$${(absValue / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ScatterDataPoint }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: countyColors[data.county] || "#6B7280" }}
        />
        <p className="font-semibold text-gray-900">Family #{data.id}</p>
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">County:</span>
          <span className="font-medium">{data.county}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Navigator:</span>
          <span className="font-medium">{data.navigator.split(" ")[0]}</span>
        </div>
        <div className="flex justify-between border-t border-gray-100 pt-1 mt-1">
          <span className="text-gray-500">Risk Score:</span>
          <span className="font-data font-medium">{data.risk_score.toFixed(1)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Wage Gain:</span>
          <span className={`font-data font-bold ${data.wage_gain >= 0 ? "text-[#8B9E8B]" : "text-[#E07B67]"}`}>
            {formatCurrency(data.wage_gain)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">FPL Change:</span>
          <span className={`font-data font-medium ${data.fpl_change >= 0 ? "text-[#8B9E8B]" : "text-[#E07B67]"}`}>
            {data.fpl_change >= 0 ? "+" : ""}{(data.fpl_change * 100).toFixed(0)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Start FPL:</span>
          <span className="font-data font-medium">{(data.start_fpl * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}

export function RiskReturnScatter({ data }: RiskReturnScatterProps) {
  const prefersReducedMotion = useReducedMotion();
  const [highlightCounty, setHighlightCounty] = useState<string | null>(null);

  // Get unique counties for legend
  const counties = [...new Set(data.map((d) => d.county))].sort();

  // Calculate bounds
  const minWage = Math.min(...data.map((d) => d.wage_gain));
  const maxWage = Math.max(...data.map((d) => d.wage_gain));

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {data.length} families with outcome data
          </span>
        </div>
        <InfoTooltip
          content="Each point represents a family. Risk score combines starting FPL, barrier count, and household factors."
          methodology="Higher risk score = more barriers to success. Quadrant analysis identifies which risk profiles respond best to intervention."
        />
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 40, bottom: 50, left: 70 }}>
          {/* Success zone background */}
          <ReferenceArea
            x1={55}
            x2={80}
            y1={0}
            y2={maxWage}
            fill="#8B9E8B"
            fillOpacity={0.03}
          />

          {/* Risk zone background */}
          <ReferenceArea
            x1={55}
            x2={80}
            y1={minWage}
            y2={0}
            fill="#EF4444"
            fillOpacity={0.03}
          />

          <XAxis
            type="number"
            dataKey="risk_score"
            name="Risk Score"
            domain={[55, 80]}
            tick={{ fontSize: 11, fill: "#6B7280" }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={{ stroke: "#E5E7EB" }}
          >
            <Label
              value="Risk Score"
              position="bottom"
              offset={10}
              style={{ fontSize: 11, fill: "#6B7280", textAnchor: "middle" }}
            />
          </XAxis>
          <YAxis
            type="number"
            dataKey="wage_gain"
            name="Wage Gain"
            domain={[minWage - 5000, maxWage + 5000]}
            tick={{ fontSize: 11, fill: "#6B7280" }}
            tickFormatter={(value) => formatCurrency(value)}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={{ stroke: "#E5E7EB" }}
          >
            <Label
              value="Annual Wage Gain ($)"
              angle={-90}
              position="left"
              offset={30}
              style={{ fontSize: 11, fill: "#6B7280", textAnchor: "middle" }}
            />
          </YAxis>
          <Tooltip content={<CustomTooltip />} />

          {/* Zero line */}
          <ReferenceLine y={0} stroke="#9CA3AF" strokeWidth={1} />

          <Scatter
            data={data}
            animationBegin={0}
            animationDuration={prefersReducedMotion ? 0 : 800}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={countyColors[entry.county] || "#6B7280"}
                fillOpacity={
                  highlightCounty === null || highlightCounty === entry.county ? 0.7 : 0.15
                }
                r={5}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* County legend */}
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        {counties.slice(0, 10).map((county) => (
          <button
            key={county}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all ${
              highlightCounty === county
                ? "bg-gray-200 ring-2 ring-gray-400"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => setHighlightCounty(highlightCounty === county ? null : county)}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: countyColors[county] || "#6B7280" }}
            />
            <span className="text-gray-700">{county}</span>
            <span className="font-data text-gray-400">
              {data.filter((d) => d.county === county).length}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
