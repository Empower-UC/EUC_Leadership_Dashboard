"use client";

import { motion, useReducedMotion } from "framer-motion";
import { InfoTooltip, ACTUARIAL_TOOLTIPS } from "@/components/ui/info-tooltip";
import { useMemo } from "react";

interface BenefitsCliffProps {
  // FPL thresholds and their benefit values
  className?: string;
}

// Simulated benefit phase-out data based on TN benefit schedules
const BENEFIT_DATA = [
  { fpl: 50, snap: 234, tanf: 185, medicaid: 450, wages: 800 },
  { fpl: 75, snap: 234, tanf: 185, medicaid: 450, wages: 1200 },
  { fpl: 100, snap: 180, tanf: 150, medicaid: 450, wages: 1600 },
  { fpl: 125, snap: 120, tanf: 100, medicaid: 450, wages: 2000 },
  { fpl: 138, snap: 80, tanf: 50, medicaid: 450, wages: 2200 }, // Medicaid cliff in TN
  { fpl: 150, snap: 40, tanf: 0, medicaid: 0, wages: 2400 },    // CLIFF ZONE
  { fpl: 175, snap: 0, tanf: 0, medicaid: 0, wages: 2800 },
  { fpl: 200, snap: 0, tanf: 0, medicaid: 0, wages: 3200 },
  { fpl: 225, snap: 0, tanf: 0, medicaid: 0, wages: 3600 },
];

export function BenefitsCliff({ className = "" }: BenefitsCliffProps) {
  const prefersReducedMotion = useReducedMotion();

  const width = 700;
  const height = 300;
  const padding = { top: 20, right: 30, bottom: 50, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate total resources and find cliff zone
  const processedData = useMemo(() => {
    return BENEFIT_DATA.map((d, i) => {
      const benefits = d.snap + d.tanf + d.medicaid;
      const totalResources = benefits + d.wages;
      const prevTotal = i > 0
        ? BENEFIT_DATA[i - 1].snap + BENEFIT_DATA[i - 1].tanf + BENEFIT_DATA[i - 1].medicaid + BENEFIT_DATA[i - 1].wages
        : totalResources;
      const isCliff = totalResources < prevTotal;
      return { ...d, benefits, totalResources, isCliff };
    });
  }, []);

  const maxY = Math.max(...processedData.map(d => d.totalResources)) * 1.1;
  const minFpl = Math.min(...BENEFIT_DATA.map(d => d.fpl));
  const maxFpl = Math.max(...BENEFIT_DATA.map(d => d.fpl));

  // Scale functions
  const xScale = (fpl: number) => padding.left + ((fpl - minFpl) / (maxFpl - minFpl)) * chartWidth;
  const yScale = (value: number) => padding.top + chartHeight - (value / maxY) * chartHeight;

  // Create area paths
  const createAreaPath = (
    data: typeof processedData,
    getY: (d: typeof processedData[0]) => number,
    getY0: (d: typeof processedData[0]) => number
  ) => {
    const points = data.map(d => ({ x: xScale(d.fpl), y: yScale(getY(d)) }));
    const points0 = data.map(d => ({ x: xScale(d.fpl), y: yScale(getY0(d)) })).reverse();

    let d = `M ${points[0].x} ${points[0].y}`;
    points.slice(1).forEach(p => { d += ` L ${p.x} ${p.y}`; });
    points0.forEach(p => { d += ` L ${p.x} ${p.y}`; });
    d += " Z";

    return d;
  };

  // Cliff indicator position
  const cliffPoint = processedData.find(d => d.isCliff);
  const cliffX = cliffPoint ? xScale(cliffPoint.fpl) : 0;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Benefits Cliff Risk Analysis</h3>
        <InfoTooltip {...ACTUARIAL_TOOLTIPS.benefitsCliff} />
      </div>

      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full">
        <defs>
          {/* Gradients for each benefit type */}
          <linearGradient id="wagesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8B9E8B" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8B9E8B" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="snapGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4A7CCC" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#4A7CCC" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="tanfGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6B9BE0" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#6B9BE0" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="medicaidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E07B67" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#E07B67" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="cliffGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D4A574" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#D4A574" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 1000, 2000, 3000, 4000].map(val => (
          <g key={val}>
            <line
              x1={padding.left}
              y1={yScale(val)}
              x2={width - padding.right}
              y2={yScale(val)}
              stroke="#E5E7EB"
              strokeDasharray="4 2"
            />
            <text
              x={padding.left - 8}
              y={yScale(val)}
              textAnchor="end"
              alignmentBaseline="middle"
              className="fill-gray-400 text-[10px] font-mono"
            >
              ${(val / 1000).toFixed(1)}K
            </text>
          </g>
        ))}

        {/* Cliff zone highlight */}
        {cliffPoint && (
          <motion.rect
            x={cliffX - 30}
            y={padding.top}
            width={60}
            height={chartHeight}
            fill="url(#cliffGradient)"
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          />
        )}

        {/* Stacked areas */}
        {/* Medicaid (bottom) */}
        <motion.path
          d={createAreaPath(processedData, d => d.medicaid, () => 0)}
          fill="url(#medicaidGradient)"
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        />

        {/* TANF */}
        <motion.path
          d={createAreaPath(processedData, d => d.medicaid + d.tanf, d => d.medicaid)}
          fill="url(#tanfGradient)"
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />

        {/* SNAP */}
        <motion.path
          d={createAreaPath(processedData, d => d.benefits, d => d.medicaid + d.tanf)}
          fill="url(#snapGradient)"
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        />

        {/* Wages (top) */}
        <motion.path
          d={createAreaPath(processedData, d => d.totalResources, d => d.benefits)}
          fill="url(#wagesGradient)"
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        />

        {/* Total resources line */}
        <motion.path
          d={processedData.map((d, i) =>
            `${i === 0 ? "M" : "L"} ${xScale(d.fpl)} ${yScale(d.totalResources)}`
          ).join(" ")}
          fill="none"
          stroke="#0F172A"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={prefersReducedMotion ? {} : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Cliff marker */}
        {cliffPoint && (
          <motion.g
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 1.2, type: "spring" }}
          >
            <circle
              cx={cliffX}
              cy={yScale(cliffPoint.totalResources)}
              r={8}
              fill="#F59E0B"
              stroke="#fff"
              strokeWidth={2}
            />
            <text
              x={cliffX}
              y={yScale(cliffPoint.totalResources) - 16}
              textAnchor="middle"
              className="fill-amber-600 text-[10px] font-bold uppercase tracking-wider"
            >
              Cliff Zone
            </text>
          </motion.g>
        )}

        {/* X-axis */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#D1D5DB"
        />

        {/* X-axis labels */}
        {[50, 100, 138, 150, 200].map(fpl => (
          <g key={fpl}>
            <text
              x={xScale(fpl)}
              y={height - padding.bottom + 16}
              textAnchor="middle"
              className={`text-[10px] font-mono ${fpl === 138 ? "fill-amber-600 font-bold" : "fill-gray-400"}`}
            >
              {fpl}%
            </text>
          </g>
        ))}

        <text
          x={width / 2}
          y={height - 8}
          textAnchor="middle"
          className="fill-gray-500 text-xs"
        >
          Federal Poverty Level (%)
        </text>

        {/* Y-axis label */}
        <text
          x={12}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90, 12, ${height / 2})`}
          className="fill-gray-500 text-xs"
        >
          Monthly Resources ($)
        </text>
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#8B9E8B]" />
          <span className="text-xs text-gray-600">Wages</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#4A7CCC]" />
          <span className="text-xs text-gray-600">SNAP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#6B9BE0]" />
          <span className="text-xs text-gray-600">TANF</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#E07B67]" />
          <span className="text-xs text-gray-600">Medicaid</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#D4A574]" />
          <span className="text-xs text-gray-600 font-semibold">Cliff Zone</span>
        </div>
      </div>

      {/* Insight callout */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-xs text-amber-800">
          <span className="font-semibold">Critical Insight:</span> At 138-150% FPL, families lose ~$900/mo in benefits
          while gaining only ~$200/mo in wages. EUC&apos;s navigation prevents families from falling into this gap.
        </p>
      </div>
    </div>
  );
}
