"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

interface MicroSparklineProps {
  startValue: number;
  endValue: number;
  width?: number;
  height?: number;
  className?: string;
}

export function MicroSparkline({
  startValue,
  endValue,
  width = 64,
  height = 24,
  className = "",
}: MicroSparklineProps) {
  const prefersReducedMotion = useReducedMotion();

  // Generate a smooth curve between start and end with some variance
  const points = useMemo(() => {
    const numPoints = 8;
    const result: number[] = [];
    const diff = endValue - startValue;

    for (let i = 0; i <= numPoints; i++) {
      const progress = i / numPoints;
      // Ease-out curve for progression
      const easedProgress = 1 - Math.pow(1 - progress, 2);
      // Add slight variance for visual interest
      const variance = Math.sin(progress * Math.PI * 2) * (diff * 0.1);
      const value = startValue + (diff * easedProgress) + variance;
      result.push(value);
    }
    return result;
  }, [startValue, endValue]);

  // Normalize points to fit within height
  const minVal = Math.min(...points);
  const maxVal = Math.max(...points);
  const range = maxVal - minVal || 1;

  // Create SVG path
  const pathData = useMemo(() => {
    const segmentWidth = width / (points.length - 1);
    const normalizedPoints = points.map((p, i) => ({
      x: i * segmentWidth,
      y: height - ((p - minVal) / range) * (height - 4) - 2,
    }));

    // Create smooth curve using quadratic bezier
    let d = `M ${normalizedPoints[0].x} ${normalizedPoints[0].y}`;
    for (let i = 1; i < normalizedPoints.length; i++) {
      const prev = normalizedPoints[i - 1];
      const curr = normalizedPoints[i];
      const midX = (prev.x + curr.x) / 2;
      d += ` Q ${prev.x + segmentWidth * 0.3} ${prev.y} ${midX} ${(prev.y + curr.y) / 2}`;
    }
    const last = normalizedPoints[normalizedPoints.length - 1];
    d += ` L ${last.x} ${last.y}`;

    // Create fill path (area under curve)
    const fillD = d + ` L ${last.x} ${height} L 0 ${height} Z`;

    return { line: d, fill: fillD };
  }, [points, width, height, minVal, range]);

  // Determine color based on change direction
  const change = endValue - startValue;
  const isPositive = change > 0;
  const strokeColor = isPositive ? "#8B9E8B" : change < 0 ? "#E07B67" : "#64748B";
  const fillColor = isPositive ? "#8B9E8B" : change < 0 ? "#E07B67" : "#64748B";

  return (
    <div className={`inline-flex items-center ${className}`}>
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={`sparkGrad-${startValue}-${endValue}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={fillColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Fill area */}
        <motion.path
          d={pathData.fill}
          fill={`url(#sparkGrad-${startValue}-${endValue})`}
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />

        {/* Line */}
        <motion.path
          d={pathData.line}
          fill="none"
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={prefersReducedMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* End dot */}
        <motion.circle
          cx={width}
          cy={height - ((points[points.length - 1] - minVal) / range) * (height - 4) - 2}
          r={2.5}
          fill={strokeColor}
          initial={prefersReducedMotion ? false : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        />
      </svg>
    </div>
  );
}

// Compact version for table cells
export function MicroTrend({
  change,
  className = "",
}: {
  change: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const isPositive = change > 0;
  const isNeutral = change === 0;

  const color = isPositive ? "#8B9E8B" : change < 0 ? "#E07B67" : "#64748B";

  // Simple arrow indicator
  return (
    <motion.div
      className={`inline-flex items-center gap-1.5 ${className}`}
      initial={prefersReducedMotion ? false : { opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" className="flex-shrink-0">
        {isNeutral ? (
          <line x1="3" y1="8" x2="13" y2="8" stroke={color} strokeWidth="2" strokeLinecap="round" />
        ) : (
          <motion.path
            d={isPositive ? "M3 12 L8 4 L13 12" : "M3 4 L8 12 L13 4"}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={prefersReducedMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        )}
      </svg>
      <span
        className="font-data text-sm font-medium"
        style={{ color }}
      >
        {isPositive ? "+" : ""}{change.toFixed(1)}%
      </span>
    </motion.div>
  );
}
