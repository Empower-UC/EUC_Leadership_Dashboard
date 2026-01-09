"use client";

import { motion, useReducedMotion } from "framer-motion";
import { InfoTooltip, ACTUARIAL_TOOLTIPS } from "@/components/ui/info-tooltip";

interface WaterfallNode {
  id: string;
  label: string;
  value: number;
  type: "source" | "outflow" | "inflow" | "result";
  tooltip?: { content: string; methodology?: string };
}

interface WaterfallROIProps {
  programCost: number;
  taxRevenue: number;
  ficaContributions: number;
  reducedWelfare: number;
  economicMultiplier?: number;
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export function WaterfallROI({
  programCost,
  taxRevenue,
  ficaContributions,
  reducedWelfare,
  economicMultiplier = 1.5,
}: WaterfallROIProps) {
  const prefersReducedMotion = useReducedMotion();

  // Calculate net gain
  const totalReturns = taxRevenue + ficaContributions + reducedWelfare;
  const multipliedReturns = totalReturns * economicMultiplier;
  const netGain = multipliedReturns - programCost;

  const nodes: WaterfallNode[] = [
    {
      id: "investment",
      label: "Program Investment",
      value: programCost,
      type: "source",
      tooltip: ACTUARIAL_TOOLTIPS.costPerFamily,
    },
    {
      id: "tax",
      label: "Tax Revenue",
      value: taxRevenue,
      type: "inflow",
      tooltip: ACTUARIAL_TOOLTIPS.taxRevenue,
    },
    {
      id: "fica",
      label: "FICA Contributions",
      value: ficaContributions,
      type: "inflow",
    },
    {
      id: "welfare",
      label: "Reduced Transfers",
      value: reducedWelfare,
      type: "inflow",
    },
    {
      id: "net",
      label: "Net Community Gain",
      value: netGain,
      type: "result",
      tooltip: ACTUARIAL_TOOLTIPS.netCommunityGain,
    },
  ];

  // SVG dimensions
  const width = 900;
  const height = 320;
  const nodeWidth = 140;
  const nodeHeight = 80;
  const padding = 40;

  // Position nodes
  const sourceX = padding;
  const sourceY = height / 2 - nodeHeight / 2;

  const flowNodes = nodes.filter((n) => n.type === "inflow");
  const flowStartX = sourceX + nodeWidth + 80;
  const flowSpacing = (width - flowStartX - nodeWidth - padding - 80) / flowNodes.length;

  const resultX = width - nodeWidth - padding;
  const resultY = height / 2 - nodeHeight / 2;

  return (
    <div className="w-full overflow-x-auto">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="min-w-[800px]">
        <defs>
          {/* Gradient for flow pipes */}
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E3A5F" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#4A7CCC" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8B9E8B" stopOpacity="0.8" />
          </linearGradient>

          {/* Arrow marker */}
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#1E3A5F" />
          </marker>

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Source node (Investment) */}
        <g>
          <motion.rect
            x={sourceX}
            y={sourceY}
            width={nodeWidth}
            height={nodeHeight}
            rx={12}
            fill="#1E3A5F"
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />
          <text x={sourceX + nodeWidth / 2} y={sourceY + 28} textAnchor="middle" className="fill-white text-xs font-medium">
            {nodes[0].label}
          </text>
          <text x={sourceX + nodeWidth / 2} y={sourceY + 52} textAnchor="middle" className="fill-white text-lg font-bold font-mono">
            {formatCurrency(nodes[0].value)}
          </text>
        </g>

        {/* Flow pipes from source to intermediate nodes */}
        {flowNodes.map((node, i) => {
          const nodeX = flowStartX + i * flowSpacing;
          const nodeY = 60 + i * 50;

          // Curved path from source to intermediate
          const startX = sourceX + nodeWidth;
          const startY = sourceY + nodeHeight / 2;
          const endX = nodeX;
          const endY = nodeY + nodeHeight / 2;
          const midX = (startX + endX) / 2;

          const pathD = `M ${startX} ${startY} C ${midX} ${startY} ${midX} ${endY} ${endX} ${endY}`;

          return (
            <g key={node.id}>
              {/* Flow pipe */}
              <motion.path
                d={pathD}
                fill="none"
                stroke="url(#flowGradient)"
                strokeWidth={Math.max(4, (node.value / programCost) * 12)}
                strokeLinecap="round"
                opacity={0.6}
                initial={prefersReducedMotion ? {} : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.3 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* Intermediate node */}
              <motion.rect
                x={nodeX}
                y={nodeY}
                width={nodeWidth}
                height={nodeHeight}
                rx={12}
                fill="#ffffff"
                stroke="#4A7CCC"
                strokeWidth={2}
                initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
              />
              <text x={nodeX + nodeWidth / 2} y={nodeY + 28} textAnchor="middle" className="fill-gray-600 text-xs font-medium">
                {node.label}
              </text>
              <text x={nodeX + nodeWidth / 2} y={nodeY + 52} textAnchor="middle" className="fill-[#4A7CCC] text-lg font-bold font-mono">
                +{formatCurrency(node.value)}
              </text>

              {/* Flow pipe from intermediate to result */}
              {(() => {
                const outStartX = nodeX + nodeWidth;
                const outStartY = nodeY + nodeHeight / 2;
                const outEndX = resultX;
                const outEndY = resultY + nodeHeight / 2;
                const outMidX = (outStartX + outEndX) / 2;

                const outPathD = `M ${outStartX} ${outStartY} C ${outMidX} ${outStartY} ${outMidX} ${outEndY} ${outEndX} ${outEndY}`;

                return (
                  <motion.path
                    d={outPathD}
                    fill="none"
                    stroke="#4A7CCC"
                    strokeWidth={Math.max(3, (node.value / programCost) * 8)}
                    strokeLinecap="round"
                    opacity={0.4}
                    initial={prefersReducedMotion ? {} : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  />
                );
              })()}
            </g>
          );
        })}

        {/* Result node (Net Gain) */}
        <g>
          <motion.rect
            x={resultX}
            y={resultY}
            width={nodeWidth}
            height={nodeHeight}
            rx={12}
            fill={netGain >= 0 ? "#8B9E8B" : "#E07B67"}
            filter="url(#glow)"
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          />
          <text x={resultX + nodeWidth / 2} y={resultY + 28} textAnchor="middle" className="fill-white text-xs font-medium">
            {nodes[nodes.length - 1].label}
          </text>
          <motion.text
            x={resultX + nodeWidth / 2}
            y={resultY + 52}
            textAnchor="middle"
            className="fill-white text-lg font-bold font-mono"
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.5 }}
          >
            {netGain >= 0 ? "+" : ""}{formatCurrency(netGain)}
          </motion.text>
        </g>

        {/* Multiplier label */}
        <motion.g
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.4 }}
        >
          <text x={resultX + nodeWidth / 2} y={resultY + nodeHeight + 20} textAnchor="middle" className="fill-gray-500 text-[10px] font-mono uppercase tracking-wider">
            {economicMultiplier}x Economic Multiplier
          </text>
        </motion.g>
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#1E3A5F]" />
          <span>Investment</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#4A7CCC]" />
          <span>Returns</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#8B9E8B]" />
          <span>Net Gain</span>
        </div>
      </div>
    </div>
  );
}
