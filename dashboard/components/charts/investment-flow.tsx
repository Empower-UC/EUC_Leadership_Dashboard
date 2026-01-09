"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, AlertTriangle, Users, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";

interface InvestmentFlowProps {
  totalFamilies: number;
  totalWageGains: number;
  navigatorCount?: number;
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

export function InvestmentFlow({ totalFamilies, totalWageGains, navigatorCount = 17 }: InvestmentFlowProps) {
  const prefersReducedMotion = useReducedMotion();

  // Estimated costs (clearly marked as estimates)
  const emergencySupportPerFamily = 5000;
  const navigatorSalary = 40000;
  const estimatedDirectSupport = totalFamilies * emergencySupportPerFamily;
  const estimatedNavigatorCosts = navigatorCount * navigatorSalary;
  const estimatedOperations = (estimatedDirectSupport + estimatedNavigatorCosts) * 0.15; // 15% overhead estimate
  const estimatedTotalInvestment = estimatedDirectSupport + estimatedNavigatorCosts + estimatedOperations;

  // ROI projections (based on actual wage gains)
  const annualTaxRate = 0.333; // FICA 15.3% + State 8% + Federal 10%
  const year1TaxRevenue = totalWageGains * annualTaxRate;
  const year5Cumulative = year1TaxRevenue * 5 * 1.1; // Assume slight wage growth
  const lifetimeValue = year1TaxRevenue * 20; // 20-year working assumption

  const animationDelay = prefersReducedMotion ? 0 : 0.15;

  return (
    <div className="space-y-6">
      {/* Data disclaimer */}
      <motion.div
        className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800"
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          <span className="font-semibold">Estimates shown.</span> Investment breakdown based on ~$5K emergency support/family
          and ~$40K navigator salary. Actual program costs may vary. Returns based on measured wage gains.
        </p>
      </motion.div>

      {/* Flow diagram */}
      <div className="relative">
        {/* Stage 1: Investment */}
        <motion.div
          className="bg-[#1E3A5F] rounded-2xl p-5 text-white"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">
                Estimated Program Investment
              </p>
              <p className="text-3xl font-bold font-data">{formatCurrency(estimatedTotalInvestment)}</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-white/70">Part of $25M TANF pilot</p>
            </div>
          </div>
        </motion.div>

        {/* Arrow */}
        <div className="flex justify-center py-2">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: animationDelay }}
          >
            <ArrowDown className="w-6 h-6 text-gray-400" />
          </motion.div>
        </div>

        {/* Stage 2: How It Was Spent */}
        <motion.div
          className="bg-white border border-gray-200 rounded-2xl p-5"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: animationDelay * 2 }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
            How It Was Allocated
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <Users className="w-5 h-5 text-[#4A7CCC] mx-auto mb-2" />
              <p className="text-lg font-bold font-data text-gray-900">{formatCurrency(estimatedNavigatorCosts)}</p>
              <p className="text-xs text-gray-500">{navigatorCount} Navigators</p>
              <p className="text-[10px] text-gray-400 mt-1">~$40K/yr each</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <DollarSign className="w-5 h-5 text-[#8B9E8B] mx-auto mb-2" />
              <p className="text-lg font-bold font-data text-gray-900">{formatCurrency(estimatedDirectSupport)}</p>
              <p className="text-xs text-gray-500">Direct Support</p>
              <p className="text-[10px] text-gray-400 mt-1">~$5K/family</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <Calendar className="w-5 h-5 text-gray-400 mx-auto mb-2" />
              <p className="text-lg font-bold font-data text-gray-900">{formatCurrency(estimatedOperations)}</p>
              <p className="text-xs text-gray-500">Operations</p>
              <p className="text-[10px] text-gray-400 mt-1">~15% overhead</p>
            </div>
          </div>

          {/* What direct support covers */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Direct support includes:</p>
            <div className="flex flex-wrap gap-2">
              {["Transportation", "Childcare", "Emergency funds", "Training", "Employment milestones"].map((item) => (
                <span key={item} className="px-2 py-1 bg-[#8B9E8B]/10 text-[#5A6C7D] text-xs rounded-full">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Arrow */}
        <div className="flex justify-center py-2">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: animationDelay * 3 }}
          >
            <ArrowDown className="w-6 h-6 text-gray-400" />
          </motion.div>
        </div>

        {/* Stage 3: Outcomes */}
        <motion.div
          className="bg-white border border-gray-200 rounded-2xl p-5"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: animationDelay * 4 }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
            Measured Outcomes
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold font-data text-gray-900">{totalFamilies.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Families Served</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-data text-[#8B9E8B]">{formatCurrency(totalWageGains)}</p>
              <p className="text-xs text-gray-500">Total Wage Gains</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-data text-[#4A7CCC]">69%</p>
              <p className="text-xs text-gray-500">Success Rate (18+ mo)</p>
            </div>
          </div>
        </motion.div>

        {/* Arrow */}
        <div className="flex justify-center py-2">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: animationDelay * 5 }}
          >
            <ArrowDown className="w-6 h-6 text-gray-400" />
          </motion.div>
        </div>

        {/* Stage 4: Returns Over Time */}
        <motion.div
          className="bg-[#8B9E8B] rounded-2xl p-5 text-white"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: animationDelay * 6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">
              Projected Returns Over Time
            </p>
            <InfoTooltip
              content="Tax revenue from increased wages: FICA (15.3%) + State (8%) + Federal (10%) = 33.3% effective rate."
              methodology="Assumes wage gains persist. Does not include reduced benefit costs or intergenerational effects."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-black/20 rounded-xl">
              <p className="text-white/80 text-xs mb-1">Year 1</p>
              <p className="text-xl font-bold font-data">{formatCurrency(year1TaxRevenue)}</p>
              <p className="text-white/70 text-[10px]">tax revenue</p>
            </div>
            <div className="text-center p-3 bg-black/20 rounded-xl">
              <p className="text-white/80 text-xs mb-1">Year 5</p>
              <p className="text-xl font-bold font-data">{formatCurrency(year5Cumulative)}</p>
              <p className="text-white/70 text-[10px]">cumulative</p>
            </div>
            <div className="text-center p-3 bg-white/20 rounded-xl border border-white/30">
              <p className="text-white/90 text-xs mb-1">20-Year Lifetime</p>
              <p className="text-2xl font-bold font-data">{formatCurrency(lifetimeValue)}</p>
              <p className="text-white/80 text-[10px]">projected value</p>
            </div>
          </div>

          {/* ROI calculation */}
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
            <div>
              <p className="text-white/80 text-xs">Lifetime ROI</p>
              <p className="text-lg font-bold font-data">
                {(lifetimeValue / estimatedTotalInvestment).toFixed(1)}:1
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-xs">Break-even</p>
              <p className="text-lg font-bold font-data">
                ~{Math.ceil(estimatedTotalInvestment / year1TaxRevenue)} years
              </p>
            </div>
            <div className="text-right">
              <TrendingUp className="w-8 h-8 text-white/70" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Methodology note */}
      <p className="text-xs text-gray-500 text-center font-mono">
        Returns exclude: reduced SNAP/Medicaid costs, intergenerational income effects, local economic multiplier
      </p>
    </div>
  );
}
