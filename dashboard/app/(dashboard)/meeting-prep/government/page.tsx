"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  DollarSign,
  TrendingUp,
  PiggyBank,
  MapPin,
  Download,
  ShieldCheck,
  AlertTriangle,
  Landmark
} from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { MethodologyCard, MethodologyBadge } from "@/components/meeting-prep/methodology-card";
import { CliffSuccessCard } from "@/components/meeting-prep/cliff-success-card";
import { StoryCarousel } from "@/components/meeting-prep/story-carousel";
import { getGovernmentData, getStoriesForAudience } from "@/lib/data/audience-meeting-data";

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export default function GovernmentView() {
  const prefersReducedMotion = useReducedMotion();
  const data = getGovernmentData();
  const stories = getStoriesForAudience('government', 5);

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Topbar
        title="Government View"
        description="Taxpayer ROI and fiscal impact framing"
      />

      <div className="px-10 py-10 max-w-6xl">
        {/* Back link */}
        <Link
          href="/meeting-prep"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to audience selection
        </Link>

        {/* Header Card */}
        <motion.div
          className="bg-gradient-to-br from-[#1E3A5F] to-[#2D4A6F] rounded-3xl p-8 text-white shadow-lg mb-8"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-white/70 text-sm font-medium">For State & Local Government</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {data.hero.headline}
              </h1>
              <p className="text-white/70 max-w-xl">
                {data.hero.subhead}. Conservative methodology with documented fiscal returns.
              </p>
            </div>
            <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </motion.div>

        {/* Primary Metrics Grid */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Fiscal Impact
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {/* Tax Revenue */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]">
              <MethodologyCard
                title="Annual Tax Revenue"
                value={formatCurrency(data.taxpayerROI.taxRevenue.total)}
                methodology="FICA employer+employee (15.3%) + Federal income (est. 10%) + TN Sales Tax (8% on 60% of income)"
                dataSource="Wage gains × tax rates"
                confidence="projected"
              >
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-[#8B9E8B]" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Tax Revenue
                  </span>
                </div>
                <p className="text-3xl font-bold font-data text-[#8B9E8B]">
                  {formatCurrency(data.taxpayerROI.taxRevenue.total)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Annual from wage gains
                </p>
              </MethodologyCard>
            </div>

            {/* Benefits Savings */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]">
              <MethodologyCard
                title="Benefits Savings"
                value={formatCurrency(data.taxpayerROI.benefitsSavings.total)}
                methodology="Estimated savings as families cross benefit thresholds (TennCare, SNAP, TANF cash, childcare subsidies)"
                dataSource="FPL tier × benefit exit estimates"
                confidence="estimated"
              >
                <div className="flex items-center gap-2 mb-3">
                  <PiggyBank className="w-4 h-4 text-[#4A7CCC]" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Benefits Savings
                  </span>
                </div>
                <p className="text-3xl font-bold font-data text-[#4A7CCC]">
                  {formatCurrency(data.taxpayerROI.benefitsSavings.total)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Estimated annual
                </p>
              </MethodologyCard>
            </div>

            {/* Break-Even */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]">
              <MethodologyCard
                title="Break-Even Timeline"
                value={`${data.taxpayerROI.combined.breakEvenYears.toFixed(1)} years`}
                methodology="Total investment ÷ annual taxpayer benefit"
                dataSource="Calculated"
                confidence="projected"
              >
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-[#D4A574]" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Break-Even
                  </span>
                </div>
                <p className="text-3xl font-bold font-data text-[#D4A574]">
                  {data.taxpayerROI.combined.breakEvenYears.toFixed(1)} yrs
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  To recover $25M investment
                </p>
              </MethodologyCard>
            </div>

            {/* Return per Dollar */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]">
              <MethodologyCard
                title="Annual Taxpayer Return"
                value={`$${data.taxpayerROI.combined.returnPerDollar.toFixed(2)}`}
                methodology="Annual taxpayer benefit ÷ $25M investment"
                dataSource="Calculated"
                confidence="projected"
              >
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-[#1E3A5F]" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Per $1 Invested
                  </span>
                </div>
                <p className="text-3xl font-bold font-data text-[#1E3A5F]">
                  ${data.taxpayerROI.combined.returnPerDollar.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Annual taxpayer return
                </p>
              </MethodologyCard>
            </div>
          </div>
        </motion.section>

        {/* Tax Revenue Breakdown */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Tax Revenue Breakdown
          </h2>
          <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]">
            <div className="grid grid-cols-3 gap-6">
              <div className="p-4 bg-[#8B9E8B]/10 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Landmark className="w-4 h-4 text-[#8B9E8B]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    FICA (Employer + Employee)
                  </span>
                </div>
                <p className="text-2xl font-bold font-data text-[#8B9E8B]">
                  {formatCurrency(data.taxpayerROI.taxRevenue.breakdown.fica)}
                </p>
                <p className="text-xs text-gray-500 mt-1">15.3% of wage gains</p>
              </div>
              <div className="p-4 bg-[#4A7CCC]/10 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-[#4A7CCC]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Federal Income Tax
                  </span>
                </div>
                <p className="text-2xl font-bold font-data text-[#4A7CCC]">
                  {formatCurrency(data.taxpayerROI.taxRevenue.breakdown.federalIncome)}
                </p>
                <p className="text-xs text-gray-500 mt-1">~10% effective rate</p>
              </div>
              <div className="p-4 bg-[#D4A574]/10 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-[#D4A574]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Sales Tax
                  </span>
                </div>
                <p className="text-2xl font-bold font-data text-[#D4A574]">
                  {formatCurrency(data.taxpayerROI.taxRevenue.breakdown.salesTax)}
                </p>
                <p className="text-xs text-gray-500 mt-1">TN 8% on spending</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Cliff Success - Key for Government */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Benefits Cliff Navigation
          </h2>
          <CliffSuccessCard data={data.cliffSuccess} />
        </motion.section>

        {/* County Performance */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Performance by County
          </h2>
          <div className="bg-white rounded-2xl shadow-[0_1px_3px_0_rgb(15_23_42/0.08)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 py-4 px-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      County
                    </div>
                  </th>
                  <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400 py-4 px-6">
                    Families
                  </th>
                  <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400 py-4 px-6">
                    Success Rate
                  </th>
                  <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400 py-4 px-6">
                    Avg Wage Gain
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.countyPerformance.map((county, index) => (
                  <tr key={county.county} className={`border-b border-gray-50 ${index === 0 ? 'bg-[#4A7CCC]/5' : ''}`}>
                    <td className="py-4 px-6 font-medium text-gray-900">{county.county}</td>
                    <td className="py-4 px-6 text-right font-data text-gray-700">{county.families}</td>
                    <td className="py-4 px-6 text-right">
                      <span className={`font-data font-semibold ${county.successRate > 30 ? 'text-[#4A7CCC]' : 'text-gray-600'}`}>
                        {county.successRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className={`font-data font-semibold ${county.avgWageGain > 0 ? 'text-[#4A7CCC]' : 'text-[#E07B67]'}`}>
                        {county.avgWageGain > 0 ? '+' : ''}{formatCurrency(county.avgWageGain)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Sensitivity Analysis */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            What If We're Wrong? (Sensitivity Analysis)
          </h2>
          <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]">
            <div className="flex items-start gap-3 mb-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>Important caveat:</strong> {data.sensitivityAnalysis.note}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {Object.entries(data.sensitivityAnalysis.attribution).map(([key, scenario]: [string, any]) => (
                <div key={key} className="p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    {key.replace('pct', '%')} Attribution
                  </p>
                  <p className="text-xl font-bold font-data text-gray-700">
                    {formatCurrency(scenario.attributed_annual_gains)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {scenario.implied_lifecycle_roi.toFixed(1)}:1 lifetime ROI
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Success Stories */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Constituent Success Stories
          </h2>
          <StoryCarousel
            stories={stories}
            title="Real Results in Your Districts"
            subtitle="Families achieving economic mobility"
            showFilmBadge={false}
          />
        </motion.section>

        {/* Conservative Methodology Note */}
        <motion.div
          className="p-4 bg-[#1E3A5F]/5 rounded-xl border border-[#1E3A5F]/20"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <p className="text-sm text-[#1E3A5F]">
            <strong>Conservative methodology:</strong> These figures use the most conservative
            calculation tier—measured annual wage gains only, no lifetime projections.
            Break-even of {data.conservative.breakEvenYears.toFixed(1)} years with
            ${data.conservative.costPerDollar.toFixed(2)} cost per $1 income generated.
            RCT validation pending with MEF Associates / Urban Institute.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
