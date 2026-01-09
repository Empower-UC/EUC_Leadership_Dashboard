"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Users,
  TrendingUp,
  GraduationCap,
  Activity,
  MapPin,
  ArrowRight,
  Sparkles,
  Target,
  DollarSign,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Zap
} from "lucide-react";
import { SpringCounter, SpringCurrency } from "@/components/ui/spring-counter";
import { InfoTooltip, ACTUARIAL_TOOLTIPS } from "@/components/ui/info-tooltip";
import { ExportButton } from "@/components/ui/export-button";

interface OverviewClientProps {
  data: {
    totalParticipants: number;
    totalChildren: number;
    outcomeBreakdown: Array<{
      category: string | null;
      count: number;
      avgFplChange: string | number | null;
      avgDays: string | number | null;
    }>;
    totalWageGains: number;
    avgFplChange: number;
    countyBreakdown: Array<{ county: string | null; count: number }>;
    improvementRate: number;
  };
  graduated: number;
  active: number;
  graduationRate: number;
  costPerFamily: number;
  annualTaxRevenue: number;
  programCost: number;
  benchmarks: Array<{ name: string; value: number; isEuc: boolean }>;
}

// Color palette for the journey visualization - EUC brand colors
const journeyColors = {
  graduated: { bg: "bg-[#4A7CCC]", text: "text-[#1E3A5F]", light: "bg-[#F5F0E8]", border: "border-[#E8C9A8]" },
  active: { bg: "bg-[#D4A574]", text: "text-[#1E3A5F]", light: "bg-[#FDFBF7]", border: "border-[#E8C9A8]" },
  transitioned: { bg: "bg-[#6B9BE0]", text: "text-[#1E3A5F]", light: "bg-blue-50", border: "border-blue-200" },
  withdrawn: { bg: "bg-gray-400", text: "text-gray-600", light: "bg-gray-50", border: "border-gray-200" },
  other: { bg: "bg-gray-300", text: "text-gray-500", light: "bg-gray-50", border: "border-gray-200" },
};

export function OverviewClient({
  data,
  graduated,
  active,
  graduationRate,
  costPerFamily,
  annualTaxRevenue,
  programCost,
  benchmarks,
}: OverviewClientProps) {
  const prefersReducedMotion = useReducedMotion();

  // Process outcome data for journey visualization
  const journeyData = data.outcomeBreakdown.map(o => {
    const category = o.category?.toLowerCase() || "other";
    const displayName = category === "dismissed" ? "transitioned" : category;
    return {
      category: displayName,
      count: o.count,
      avgFplChange: Number(o.avgFplChange) || 0,
      percentage: ((o.count / data.totalParticipants) * 100).toFixed(1),
    };
  }).sort((a, b) => b.count - a.count);

  // Get max county count for bar scaling (guard against empty array returning -Infinity)
  const maxCountyCount = Math.max(0, ...data.countyBreakdown.map(c => c.count));

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFBF7] via-white to-[#F5F0E8]">
      {/* Header - minimal, defers to content */}
      <div className="border-b border-gray-200/60 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-medium text-gray-900">Executive Summary</h1>
          </div>
          <ExportButton filename="euc-executive-summary" />
        </div>
      </div>

      <motion.div
        className="px-8 py-8 space-y-8 max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ============================================
            HERO: Headline Impact Metric
            ============================================ */}
        <motion.div
          className="rounded-3xl bg-[#1E3A5F] p-8 shadow-lg"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#D4A574]" />
                <span className="text-[#E8C9A8] text-xs font-semibold uppercase tracking-wider">
                  Program Impact
                </span>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-7xl font-bold text-white tracking-tight font-data">
                  <SpringCounter value={data.avgFplChange} prefix="+" suffix="%" decimals={0} />
                </span>
                <div>
                  <span className="text-xl text-blue-100 font-medium block">
                    average FPL improvement
                  </span>
                  <span className="text-sm text-[#6B9BE0] block">
                    across {data.totalParticipants.toLocaleString()} families
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-4 bg-white rounded-2xl px-6 py-4 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-[#8B9E8B] flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-[#1E3A5F] font-data">
                  {data.improvementRate.toFixed(0)}%
                </p>
                <p className="text-sm text-gray-600 font-medium">showed positive change</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ============================================
            IMPACT GRID: 4 Colorful Metric Cards
            ============================================ */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
        >
          {/* Families Served */}
          <motion.div
            className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#1E3A5F] flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#1E3A5F] font-data">
              <SpringCounter value={data.totalParticipants} decimals={0} />
            </p>
            <p className="text-gray-900 text-sm font-medium mt-1">Families Served</p>
            <p className="text-gray-500 text-xs mt-0.5">{data.totalChildren.toLocaleString()} children</p>
          </motion.div>

          {/* Wage Gains */}
          <motion.div
            className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#4A7CCC] flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <InfoTooltip
                content={ACTUARIAL_TOOLTIPS.wageGain.content}
                methodology={ACTUARIAL_TOOLTIPS.wageGain.methodology}
              />
            </div>
            <p className="text-3xl font-bold text-[#1E3A5F] font-data">
              <SpringCurrency value={data.totalWageGains} />
            </p>
            <p className="text-gray-900 text-sm font-medium mt-1">Total Wage Gains</p>
            <p className="text-gray-500 text-xs mt-0.5">annual increase</p>
          </motion.div>

          {/* Graduated */}
          <motion.div
            className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#D4A574] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#1E3A5F] font-data">
              <SpringCounter value={graduated} decimals={0} />
            </p>
            <p className="text-gray-900 text-sm font-medium mt-1">Graduated</p>
            <p className="text-gray-500 text-xs mt-0.5">{graduationRate.toFixed(1)}% rate</p>
          </motion.div>

          {/* Active */}
          <motion.div
            className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#8B9E8B] flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#8B9E8B] animate-pulse" />
                <span className="text-xs text-[#8B9E8B] font-medium">Active</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-[#1E3A5F] font-data">
              <SpringCounter value={active} decimals={0} />
            </p>
            <p className="text-gray-900 text-sm font-medium mt-1">Currently Active</p>
            <p className="text-gray-500 text-xs mt-0.5">in program</p>
          </motion.div>
        </motion.div>

        {/* ============================================
            TWO COLUMN: Journey + Benchmark
            ============================================ */}
        <div className="grid lg:grid-cols-5 gap-6">

          {/* Participant Journey - 3 cols */}
          <motion.div
            className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Participant Journey</h2>
                <p className="text-sm text-gray-500">Where families are in the program</p>
              </div>
              <div className="text-xs text-gray-400 font-mono">
                n={data.totalParticipants}
              </div>
            </div>

            {/* Visual Journey Flow */}
            <div className="space-y-3">
              {journeyData.map((item, index) => {
                const colors = journeyColors[item.category as keyof typeof journeyColors] || journeyColors.other;
                const percentage = (item.count / data.totalParticipants) * 100;

                return (
                  <motion.div
                    key={item.category}
                    className={`relative rounded-xl p-4 ${colors.light} border ${colors.border} overflow-hidden`}
                    initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    {/* Progress bar background */}
                    <motion.div
                      className={`absolute inset-y-0 left-0 ${colors.bg} opacity-10`}
                      initial={prefersReducedMotion ? false : { scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.4 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      style={{ width: `${percentage}%`, originX: 0 }}
                    />

                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${colors.bg}`} />
                        <span className="font-medium text-gray-900 capitalize">{item.category}</span>
                        <span className={`text-sm ${colors.text} font-semibold`}>
                          {item.avgFplChange > 0 ? "+" : ""}{item.avgFplChange.toFixed(1)}% FPL
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-gray-900 font-data">{item.count}</span>
                        <span className="text-sm text-gray-500 font-mono w-14 text-right">{item.percentage}%</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Benchmark Comparison - 2 cols */}
          <motion.div
            className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            variants={itemVariants}
          >
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-gray-900">How EUC Compares</h2>
                <InfoTooltip
                  content={ACTUARIAL_TOOLTIPS.benchmark.content}
                  methodology={ACTUARIAL_TOOLTIPS.benchmark.methodology}
                />
              </div>
              <p className="text-sm text-gray-500">FPL improvement vs. similar programs</p>
            </div>

            <div className="space-y-4">
              {benchmarks.map((b, i) => (
                <motion.div
                  key={b.name}
                  className="relative"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${b.isEuc ? "font-semibold text-gray-900" : "text-gray-600"}`}>
                      {b.name}
                    </span>
                    <span className={`text-sm font-mono ${b.isEuc ? "font-bold text-[#1E3A5F]" : "text-gray-500"}`}>
                      +{b.value}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${b.isEuc
                        ? "bg-gradient-to-r from-[#1E3A5F] to-[#4A7CCC]"
                        : "bg-gray-300"
                      }`}
                      initial={prefersReducedMotion ? false : { scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.6 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      style={{ width: `${(b.value / 30) * 100}%`, originX: 0 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-6 leading-relaxed">
              Project QUEST & Building NE from RCTs. EUC from before/after (RCT in progress).
            </p>
          </motion.div>
        </div>

        {/* ============================================
            TWO COLUMN: Geography + ROI
            ============================================ */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Geographic Reach */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            variants={itemVariants}
          >
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-[#4A7CCC]" />
              <div>
                <h2 className="text-base font-semibold text-gray-900">Geographic Reach</h2>
                <p className="text-sm text-gray-500">Top counties by enrollment</p>
              </div>
            </div>

            <div className="space-y-3">
              {data.countyBreakdown.map((county, i) => {
                const percentage = (county.count / maxCountyCount) * 100;

                return (
                  <motion.div
                    key={county.county}
                    className="flex items-center gap-4"
                    initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.08 }}
                  >
                    <span className="text-sm text-gray-600 w-24 truncate">{county.county}</span>
                    <div className="flex-1 h-8 bg-gray-50 rounded-lg overflow-hidden relative">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-lg"
                        style={{
                          background: `linear-gradient(90deg, #4A7CCC, #6B9BE0)`,
                        }}
                        initial={prefersReducedMotion ? false : { width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.7 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      />
                      <span className="absolute inset-0 flex items-center px-3 text-sm font-semibold text-white">
                        {county.count}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
              <span className="text-gray-500">Serving 14 Upper Cumberland counties</span>
              <span className="text-[#1E3A5F] font-medium">Rural Tennessee</span>
            </div>
          </motion.div>

          {/* ROI Story */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            variants={itemVariants}
          >
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-[#D4A574]" />
              <div>
                <h2 className="text-base font-semibold text-gray-900">Return on Investment</h2>
                <p className="text-sm text-gray-500">Taxpayer value analysis</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#1E3A5F] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-white/70" />
                  <span className="text-xs text-white/70 uppercase tracking-wider">Cost / Family</span>
                </div>
                <p className="text-2xl font-bold font-data text-white">
                  <SpringCurrency value={costPerFamily} />
                </p>
                <p className="text-xs text-white/60 mt-1">vs Year Up ~$30K</p>
              </div>

              <div className="bg-[#8B9E8B] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-white/70" />
                  <span className="text-xs text-white/70 uppercase tracking-wider">Tax Revenue/yr</span>
                </div>
                <p className="text-2xl font-bold font-data text-white">
                  <SpringCurrency value={annualTaxRevenue} />
                </p>
                <p className="text-xs text-white/60 mt-1">Payroll + state taxes</p>
              </div>
            </div>

            {/* Break-even calculation */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Break-even</span>
                </div>
                <InfoTooltip {...ACTUARIAL_TOOLTIPS.breakeven} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="font-mono">${(programCost / 1000000).toFixed(1)}M</span>
                  <span className="text-gray-400">÷</span>
                  <span className="font-mono">${(annualTaxRevenue / 1000000).toFixed(1)}M/yr</span>
                  <span className="text-gray-400">=</span>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold font-data text-[#1E3A5F]">
                    ~{annualTaxRevenue > 0 ? Math.ceil(programCost / annualTaxRevenue) : "-"}
                  </p>
                  <p className="text-xs text-gray-500">years to repay</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Conservative estimate based on direct tax revenue only. Does not include reduced welfare costs, healthcare savings, or generational impact.
            </p>
          </motion.div>
        </div>

        {/* ============================================
            EVIDENCE FOOTER
            ============================================ */}
        <motion.div
          className="border-t border-gray-200 pt-6"
          variants={itemVariants}
        >
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Target className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800">Evidence Note</p>
              <p className="text-sm text-amber-700 mt-1">
                Current data shows before/after comparison without a control group. A randomized controlled trial is in progress to establish causality. Results are promising but not yet proven causal.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
