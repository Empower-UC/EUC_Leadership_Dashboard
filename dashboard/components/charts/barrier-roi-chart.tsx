"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Label,
} from "recharts";
import { InfoTooltip } from "@/components/ui/info-tooltip";

interface BarrierData {
  barrier: string;
  count: number;
  prevalence: number;
  drag_coefficient: number;
  resolution_cost: number;
  roi_ratio: number;
  leverage_score: number;
}

interface BarrierROIChartProps {
  data: BarrierData[];
}

function getROIColor(roi: number): string {
  if (roi >= 1.5) return "#8B9E8B"; // High ROI - sage
  if (roi >= 1.0) return "#4A7CCC"; // Positive ROI - blue
  if (roi >= 0.5) return "#D4A574"; // Break-even - amber
  return "#E07B67"; // Negative ROI - coral
}

function getShortBarrierName(barrier: string): string {
  const shortNames: Record<string, string> = {
    "Childcare issues": "Childcare",
    "Transportation issues": "Transport",
    "Physical or Mental Health Related issues": "Health",
    "Problems with Job Skills": "Job Skills",
    "Attending school or training": "Education",
    "Housing issues": "Housing",
    "Problems with Basic Skills": "Basic Skills",
  };
  return shortNames[barrier] || barrier;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: BarrierData }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-xs">
      <p className="font-semibold text-gray-900 mb-2">{data.barrier}</p>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Prevalence:</span>
          <span className="font-data font-medium">{data.prevalence.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Income Drag:</span>
          <span className={`font-data font-medium ${data.drag_coefficient > 0 ? "text-[#E07B67]" : "text-[#8B9E8B]"}`}>
            {data.drag_coefficient > 0 ? "-" : "+"}${Math.abs(data.drag_coefficient).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Resolution Cost:</span>
          <span className="font-data font-medium">${data.resolution_cost.toLocaleString()}</span>
        </div>
        <div className="flex justify-between border-t border-gray-100 pt-1 mt-1">
          <span className="text-gray-500">ROI Ratio:</span>
          <span className={`font-data font-bold ${data.roi_ratio >= 1 ? "text-[#8B9E8B]" : "text-[#D4A574]"}`}>
            {data.roi_ratio.toFixed(2)}x
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Leverage Score:</span>
          <span className="font-data font-medium">{(data.leverage_score * 100).toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}

export function BarrierROIChart({ data }: BarrierROIChartProps) {
  const prefersReducedMotion = useReducedMotion();

  // Filter out negative drag coefficients (those are investments, not barriers)
  const barriersOnly = data.filter((d) => d.drag_coefficient > 0);

  // Calculate domain for bubble sizing
  const maxCost = Math.max(...barriersOnly.map((d) => d.resolution_cost));
  const minCost = Math.min(...barriersOnly.map((d) => d.resolution_cost));

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
            <span className="text-xs text-gray-500">High ROI (&gt;1.5x)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#4A7CCC]" />
            <span className="text-xs text-gray-500">Positive ROI (1-1.5x)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#D4A574]" />
            <span className="text-xs text-gray-500">Break-even (&lt;1x)</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Bubble size = Resolution cost</span>
          <InfoTooltip
            content="Barriers positioned by prevalence and income impact. Higher-right = high impact, common barrier."
            methodology="Drag coefficient estimated from wage differentials. Resolution costs from program intervention data."
          />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 40, bottom: 40, left: 60 }}>
          <XAxis
            type="number"
            dataKey="prevalence"
            name="Prevalence"
            domain={[0, 55]}
            tick={{ fontSize: 11, fill: "#6B7280" }}
            tickFormatter={(value) => `${value}%`}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={{ stroke: "#E5E7EB" }}
          >
            <Label
              value="Prevalence (%)"
              position="bottom"
              offset={10}
              style={{ fontSize: 11, fill: "#6B7280", textAnchor: "middle" }}
            />
          </XAxis>
          <YAxis
            type="number"
            dataKey="drag_coefficient"
            name="Income Drag"
            domain={[0, 10000]}
            tick={{ fontSize: 11, fill: "#6B7280" }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={{ stroke: "#E5E7EB" }}
          >
            <Label
              value="Estimated Income Drag ($)"
              angle={-90}
              position="left"
              offset={20}
              style={{ fontSize: 11, fill: "#6B7280", textAnchor: "middle" }}
            />
          </YAxis>
          <ZAxis
            type="number"
            dataKey="resolution_cost"
            range={[200, 1500]}
            domain={[minCost, maxCost]}
            name="Resolution Cost"
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Quadrant lines */}
          <ReferenceLine x={25} stroke="#E5E7EB" strokeDasharray="3 3" />
          <ReferenceLine y={5000} stroke="#E5E7EB" strokeDasharray="3 3" />

          <Scatter
            data={barriersOnly}
            fill="#4A7CCC"
            animationBegin={0}
            animationDuration={prefersReducedMotion ? 0 : 800}
          >
            {barriersOnly.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getROIColor(entry.roi_ratio)} fillOpacity={0.8} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Barrier labels beneath chart */}
      <div className="flex flex-wrap gap-3 mt-4 justify-center">
        {barriersOnly.map((barrier) => (
          <div
            key={barrier.barrier}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-xs"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getROIColor(barrier.roi_ratio) }}
            />
            <span className="text-gray-700">{getShortBarrierName(barrier.barrier)}</span>
            <span className="font-data text-gray-500">{barrier.prevalence.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
