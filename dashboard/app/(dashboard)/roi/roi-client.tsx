"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Calculator, TrendingUp, DollarSign, Users, AlertTriangle, Scale, Eye, BarChart3, ArrowRight } from "lucide-react";
import { InvestmentFlow } from "@/components/charts/investment-flow";
import { BenefitsCliff } from "@/components/charts/benefits-cliff";
import { InfoTooltip, ACTUARIAL_TOOLTIPS } from "@/components/ui/info-tooltip";
import { ExportButton } from "@/components/ui/export-button";
import { SpringCounter, SpringCurrency } from "@/components/ui/spring-counter";
import { MetricStoryTrigger } from "@/components/stories/MetricStoryTrigger";
import storiesData from "@/lib/data/participant-stories.json";
import { ParticipantStory } from "@/lib/types/stories";

const stories = storiesData.stories as ParticipantStory[];

// Type definitions for ROI data
interface ROIData {
  metadata: {
    generated_at: string;
    methodology_version: string;
    investment_denominator: number;
    discount_rate: number;
  };
  data_quality: {
    total_enrolled_baseline: number;
    total_in_monthly_review: number;
    income_data: {
      has_wage_change_data: number;
      completeness_rate: number;
    };
    children_data: {
      total_children_estimated: number;
      avg_children_per_family: number;
    };
    wage_data_quality: {
      positive_wage_gains: number;
      mean: number;
      median: number;
    };
  };
  measured_outcomes: {
    all_participants: {
      count_with_data: number;
      total_annual_wage_gains: number;
      positive_gainers_pct: number;
    };
    graduates_only: {
      count: number;
    };
    children: {
      total_estimated: number;
    };
  };
  fpl_tiers: {
    [key: string]: {
      label: string;
      count: number;
      percentage: number;
      avg_wage_gain: number;
    };
  };
  tier1_conservative: {
    methodology: string;
    appropriate_audience: string;
    metrics: {
      documented_annual_wage_gains: number;
      annual_return_per_dollar_invested: number;
      break_even_years_undiscounted: number;
      cost_per_dollar_income_generated: number;
    };
    benchmarks: {
      project_quest: { cost_per_dollar: number; note: string };
      year_up: { cost_per_dollar: number; note: string };
    };
  };
  tier2_taxpayer: {
    methodology: string;
    appropriate_audience: string;
    tax_revenue: {
      fica_employer_employee: number;
      federal_income_effective_10pct: number;
      sales_tax_on_spending: number;
      total_annual: number;
    };
    benefits_savings: {
      total_annual: number;
    };
    combined: {
      total_annual_taxpayer_benefit: number;
      break_even_years: number;
    };
  };
  tier3_lifecycle: {
    methodology: string;
    appropriate_audience: string;
    projections: {
      with_fade: {
        lifetime_pv: number;
        roi_ratio: number;
        assumption: string;
      };
    };
  };
  tier4_intergenerational: {
    methodology: string;
    appropriate_audience: string;
    intergenerational: {
      total_children: number;
      chetty_coefficient: number;
      projected_earnings_boost_per_child_annual: number;
      lifetime_pv_discounted: number;
    };
    combined_societal: {
      societal_roi_ratio: number;
      total_societal_pv: number;
    };
  };
  sensitivity_analysis: {
    attribution: {
      scenarios: {
        [key: string]: {
          attributed_annual_gains: number;
          implied_lifecycle_roi: number;
        };
      };
    };
    wage_persistence: {
      scenarios: {
        [key: string]: {
          description: string;
          roi_ratio: number;
        };
      };
    };
  };
  summary: {
    key_caveats: string[];
    roi_by_framing: {
      [key: string]: {
        metric: string;
        value: number | string;
        methodology: string;
        audience: string;
      };
    };
  };
  constants_used: {
    program: {
      total_investment: number;
      navigator_count: number;
    };
  };
}

interface ROIClientProps {
  data: ROIData;
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function TierCard({
  tier,
  title,
  roi,
  roiLabel,
  audience,
  color,
  delay = 0,
  children,
}: {
  tier: string;
  title: string;
  roi: string | number;
  roiLabel: string;
  audience: string;
  color: "navy" | "blue" | "amber" | "sage";
  delay?: number;
  children?: React.ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();

  const bgColor = {
    navy: "bg-[#1E3A5F]",
    blue: "bg-[#4A7CCC]",
    amber: "bg-[#D4A574]",
    sage: "bg-[#8B9E8B]",
  }[color];

  const lightBg = {
    navy: "bg-white/20",
    blue: "bg-white/20",
    amber: "bg-white/20",
    sage: "bg-white/20",
  }[color];

  return (
    <motion.div
      className={`${bgColor} rounded-2xl p-6 text-white kpi-card-colored cursor-default`}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded ${lightBg}`}>
            {tier}
          </span>
          <h3 className="text-lg font-semibold mt-3">{title}</h3>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold font-data">{roi}</p>
          <p className="text-xs opacity-70 mt-1">{roiLabel}</p>
        </div>
      </div>
      <p className="text-xs opacity-80 mb-4">
        <Eye className="w-3 h-3 inline mr-1" />
        {audience}
      </p>
      {children}
    </motion.div>
  );
}

function DataQualityBadge({ rate }: { rate: number }) {
  const color =
    rate >= 70 ? "bg-[#8B9E8B]/20 text-[#8B9E8B]" :
    rate >= 50 ? "bg-[#D4A574]/20 text-[#D4A574]" :
    "bg-[#E07B67]/20 text-[#E07B67]";
  const label =
    rate >= 70 ? "Good" :
    rate >= 50 ? "Moderate" :
    "Limited";

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {label} ({rate.toFixed(0)}%)
    </span>
  );
}

export function ROIClient({ data }: ROIClientProps) {
  const prefersReducedMotion = useReducedMotion();

  // Prepare export data
  const exportData = [
    { tier: "Tier 1 - Conservative", metric: "Annual Return per $1", value: data.tier1_conservative.metrics.annual_return_per_dollar_invested },
    { tier: "Tier 1 - Conservative", metric: "Break-even Years", value: data.tier1_conservative.metrics.break_even_years_undiscounted },
    { tier: "Tier 2 - Taxpayer", metric: "Annual Tax Revenue", value: data.tier2_taxpayer.tax_revenue.total_annual },
    { tier: "Tier 2 - Taxpayer", metric: "Benefits Savings", value: data.tier2_taxpayer.benefits_savings.total_annual },
    { tier: "Tier 3 - Lifecycle", metric: "Lifetime ROI", value: data.tier3_lifecycle.projections.with_fade.roi_ratio },
    { tier: "Tier 4 - Societal", metric: "Societal ROI", value: data.tier4_intergenerational.combined_societal.societal_roi_ratio },
  ];

  // FPL tiers for visualization
  const fplTiers = Object.entries(data.fpl_tiers).map(([key, tier]) => ({
    key,
    ...tier,
  }));

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Header */}
      <div className="border-b border-[#E8C9A8]/50 bg-white sticky top-0 z-10">
        <div className="px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-semibold text-[#1E3A5F]">ROI & Impact Analysis</h1>
            <p className="text-sm text-[#5A6C7D]">Multi-tier return on investment with sensitivity analysis</p>
          </div>
          <div className="flex items-center gap-4">
            <DataQualityBadge rate={data.data_quality.income_data.completeness_rate} />
            <span className="text-xs text-gray-400 font-mono">
              {data.measured_outcomes.all_participants.count_with_data} families with outcome data
            </span>
            <ExportButton data={exportData} filename="euc-roi-analysis" />
          </div>
        </div>
      </div>

      <div className="px-10 py-10 space-y-12 max-w-7xl">
        {/* Hero - Simple Investment → Outcome Story */}
        <motion.div
          className="bg-gradient-to-br from-[#1E3A5F] to-[#2D4A6F] rounded-3xl p-8 text-white shadow-lg"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-8">
              <div>
                <p className="text-[#6B9BE0] text-xs font-semibold uppercase tracking-[0.08em] mb-1">
                  TANF Investment
                </p>
                <p className="text-4xl font-bold font-data">$25M</p>
              </div>
              <ArrowRight className="w-6 h-6 text-[#6B9BE0]/50" />
              <div>
                <p className="text-[#6B9BE0] text-xs font-semibold uppercase tracking-[0.08em] mb-1">
                  Measured Wage Gains
                </p>
                <p className="text-4xl font-bold font-data text-[#8B9E8B]">
                  <SpringCurrency value={data.measured_outcomes.all_participants.total_annual_wage_gains} />
                  <span className="text-lg text-[#6B9BE0] font-normal">/year</span>
                </p>
              </div>
            </div>
            <div className="text-right border-l border-[#4A7CCC]/30 pl-8">
              <p className="text-[#6B9BE0] text-xs mb-1">Based on {data.measured_outcomes.all_participants.count_with_data} families with outcome data</p>
              <p className="text-[#6B9BE0]/70 text-xs">{data.measured_outcomes.all_participants.positive_gainers_pct.toFixed(0)}% showed positive wage gains</p>
              <div className="mt-2">
                <MetricStoryTrigger
                  metric="wage_gains"
                  stories={stories}
                  variant="badge"
                  label="See success stories"
                  className="bg-white/10 text-white hover:bg-white/20"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* FPL Movement - Simple Bar */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-gray-500" />
            <h2 className="text-[15px] font-semibold text-gray-900">Outcome Distribution</h2>
            <InfoTooltip
              content="How families moved relative to the Federal Poverty Level."
              methodology={`Based on ${data.measured_outcomes.all_participants.count_with_data} families with FPL data.`}
            />
          </div>
          <motion.div
            className="bg-white rounded-3xl p-8 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)] card-hover"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* Stacked bar visualization */}
            <div className="flex items-center gap-1 h-14 rounded-xl overflow-hidden">
              {fplTiers.map((tier) => {
                const isPositive = !tier.key.includes("declined") && !tier.key.includes("minimal");
                const isDeclined = tier.key.includes("declined");
                const bgColor = isDeclined ? "bg-gray-300" : isPositive ? "bg-[#4A7CCC]" : "bg-gray-200";
                const width = `${tier.percentage}%`;
                return (
                  <div
                    key={tier.key}
                    className={`${bgColor} h-full flex items-center justify-center bar-segment`}
                    style={{ width }}
                    title={`${tier.label}: ${tier.count} families (${tier.percentage.toFixed(0)}%)`}
                  >
                    {tier.percentage > 8 && (
                      <span className={`text-sm font-semibold ${isPositive ? "text-white" : "text-gray-600"}`}>
                        {tier.count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-4 text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-[#4A7CCC]" />
                  <span className="text-gray-600">Improved ({fplTiers.filter(t => !t.key.includes("declined") && !t.key.includes("minimal")).reduce((sum, t) => sum + t.count, 0)})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-gray-200" />
                  <span className="text-gray-600">Minimal ({fplTiers.find(t => t.key.includes("minimal"))?.count || 0})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-gray-300" />
                  <span className="text-gray-600">Declined ({fplTiers.find(t => t.key.includes("declined"))?.count || 0})</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 font-mono">
                  {data.measured_outcomes.graduates_only.count} graduated to 225%+ FPL
                </span>
                <MetricStoryTrigger
                  metric="fpl_graduation"
                  stories={stories}
                  variant="inline"
                  label="Read their stories"
                />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Four Tiers of ROI */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Scale className="h-4 w-4 text-gray-500" />
            <h2 className="text-[15px] font-semibold text-gray-900">ROI by Framing</h2>
            <InfoTooltip
              content="Same data, different audiences. Choose the tier appropriate for your audience."
              methodology="All use $25M investment as denominator. Tier 3-4 include projections."
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            {/* Tier 1: Conservative */}
            <TierCard
              tier="Tier 1"
              title="Conservative / Provable"
              roi={`$${data.tier1_conservative.metrics.annual_return_per_dollar_invested.toFixed(2)}`}
              roiLabel="per $1 invested (annual)"
              audience={data.tier1_conservative.appropriate_audience}
              color="navy"
              delay={0.1}
            >
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-xs opacity-70">Break-even</p>
                  <p className="text-lg font-bold font-data">
                    {data.tier1_conservative.metrics.break_even_years_undiscounted.toFixed(0)} yrs
                  </p>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-xs opacity-70">Cost per $1 income</p>
                  <p className="text-lg font-bold font-data">
                    ${data.tier1_conservative.metrics.cost_per_dollar_income_generated.toFixed(2)}
                  </p>
                </div>
              </div>
            </TierCard>

            {/* Tier 2: Taxpayer */}
            <TierCard
              tier="Tier 2"
              title="Taxpayer Perspective"
              roi={`${data.tier2_taxpayer.combined.break_even_years.toFixed(0)} yrs`}
              roiLabel="to break-even"
              audience={data.tier2_taxpayer.appropriate_audience}
              color="blue"
              delay={0.15}
            >
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-xs opacity-70">Tax Revenue/yr</p>
                  <p className="text-lg font-bold font-data">
                    {formatCurrency(data.tier2_taxpayer.tax_revenue.total_annual)}
                  </p>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-xs opacity-70">Benefits Savings/yr</p>
                  <p className="text-lg font-bold font-data">
                    {formatCurrency(data.tier2_taxpayer.benefits_savings.total_annual)}
                  </p>
                </div>
              </div>
            </TierCard>

            {/* Tier 3: Lifecycle */}
            <TierCard
              tier="Tier 3"
              title="Lifecycle (with wage fade)"
              roi={`${data.tier3_lifecycle.projections.with_fade.roi_ratio}:1`}
              roiLabel="lifetime ROI"
              audience={data.tier3_lifecycle.appropriate_audience}
              color="amber"
              delay={0.2}
            >
              <div className="bg-white/20 rounded-lg p-3 mt-4">
                <p className="text-xs opacity-70">Lifetime PV of wage gains</p>
                <p className="text-lg font-bold font-data">
                  {formatCurrency(data.tier3_lifecycle.projections.with_fade.lifetime_pv)}
                </p>
                <p className="text-[10px] opacity-60 mt-1">
                  {data.tier3_lifecycle.projections.with_fade.assumption}
                </p>
              </div>
            </TierCard>

            {/* Tier 4: Societal */}
            <TierCard
              tier="Tier 4"
              title="Societal / Intergenerational"
              roi={`${data.tier4_intergenerational.combined_societal.societal_roi_ratio}:1`}
              roiLabel="comprehensive ROI"
              audience={data.tier4_intergenerational.appropriate_audience}
              color="sage"
              delay={0.25}
            >
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-xs opacity-70">Children impacted</p>
                  <p className="text-lg font-bold font-data">
                    {data.tier4_intergenerational.intergenerational.total_children}
                  </p>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-xs opacity-70">Intergenerational PV</p>
                  <p className="text-lg font-bold font-data">
                    {formatCurrency(data.tier4_intergenerational.intergenerational.lifetime_pv_discounted)}
                  </p>
                </div>
              </div>
              <p className="text-[10px] opacity-60 mt-3">
                Based on Chetty et al.: ${(data.tier4_intergenerational.intergenerational.chetty_coefficient * 1000).toFixed(1)}% higher adult earnings per $1K childhood income
              </p>
            </TierCard>
          </div>
        </section>

        {/* Sensitivity Analysis */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-[#E07B67]" />
            <h2 className="text-[15px] font-semibold text-[#1E3A5F]">Sensitivity Analysis</h2>
            <span className="text-xs text-[#E07B67] bg-[#E07B67]/10 px-2 py-0.5 rounded-full font-medium">
              Key Assumptions
            </span>
          </div>
          <motion.div
            className="bg-white rounded-3xl p-8 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)] card-hover"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="grid grid-cols-2 gap-10">
              {/* Attribution Sensitivity */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Attribution Rate
                  <span className="text-xs text-gray-400 font-normal ml-2">
                    (What % of gains due to program?)
                  </span>
                </h4>
                <div className="space-y-2">
                  {Object.entries(data.sensitivity_analysis.attribution.scenarios).map(([key, scenario]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg table-row-hover cursor-default">
                      <span className="text-sm text-gray-600">{key.replace("pct", "%")}</span>
                      <div className="text-right">
                        <span className="text-sm font-mono text-gray-900">
                          {formatCurrency(scenario.attributed_annual_gains)}/yr
                        </span>
                        <span className="text-xs text-gray-500 ml-3">
                          → {scenario.implied_lifecycle_roi}:1 ROI
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  RCT will reveal actual attribution. Building Nebraska Families (only rural TANF RCT) showed 0%.
                </p>
              </div>

              {/* Wage Persistence Sensitivity */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Wage Persistence
                  <span className="text-xs text-gray-400 font-normal ml-2">
                    (Do gains last?)
                  </span>
                </h4>
                <div className="space-y-2">
                  {Object.entries(data.sensitivity_analysis.wage_persistence.scenarios).map(([key, scenario]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg table-row-hover cursor-default">
                      <div>
                        <span className="text-sm text-gray-600 capitalize">{key.replace("_", " ")}</span>
                        <p className="text-[10px] text-gray-400 mt-0.5">{scenario.description}</p>
                      </div>
                      <span className="text-sm font-mono text-gray-900">
                        {scenario.roi_ratio}:1 ROI
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Research shows workforce gains often fade without continued support.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Investment Flow */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <h2 className="text-[15px] font-semibold text-gray-900">Investment Flow & Returns</h2>
            <InfoTooltip
              content="How TANF investment flows through the program to generate family outcomes and community returns."
              methodology="Investment estimates based on ~$5K/family direct support and ~$40K navigator salaries. Returns based on measured wage gains."
            />
          </div>
          <motion.div
            className="bg-white rounded-3xl p-8 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)] card-hover"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <InvestmentFlow
              totalFamilies={data.data_quality.total_enrolled_baseline}
              totalWageGains={data.measured_outcomes.all_participants.total_annual_wage_gains}
              navigatorCount={data.constants_used.program.navigator_count}
            />
          </motion.div>
        </section>

        {/* Benefits Cliff Risk */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-[#E07B67]" />
            <h2 className="text-[15px] font-semibold text-[#1E3A5F]">Benefits Cliff Risk Model</h2>
            <span className="text-xs text-[#E07B67] bg-[#E07B67]/10 px-2 py-0.5 rounded-full font-medium">
              Key Risk Factor
            </span>
          </div>
          <motion.div
            className="bg-white rounded-3xl p-8 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)] card-hover"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <BenefitsCliff />
          </motion.div>
        </section>

        {/* Intergenerational Impact */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-gray-500" />
            <h2 className="text-[15px] font-semibold text-gray-900">Intergenerational Impact</h2>
          </div>
          <motion.div
            className="bg-white rounded-3xl p-8 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)] card-hover"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
          >
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500 mb-2">
                  Children in Program Households
                </p>
                <p className="text-4xl font-bold font-data text-gray-900">
                  {data.measured_outcomes.children.total_estimated.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Children exposed to improved family economic stability
                </p>
              </div>
              <div className="border-l border-gray-200 pl-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500 mb-2">
                  Research-Backed Projection
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Chetty et al. research indicates each <span className="font-data font-semibold">$1,000</span> increase
                  in family income during childhood correlates with <span className="font-data font-semibold text-[#4A7CCC]">+{(data.tier4_intergenerational.intergenerational.chetty_coefficient * 100).toFixed(1)}%</span> higher
                  adult earnings.
                </p>
                <p className="text-xs text-gray-500 mt-3 font-mono">
                  Est. annual boost per child: {formatCurrency(data.tier4_intergenerational.intergenerational.projected_earnings_boost_per_child_annual)}
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Benchmarks */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="h-4 w-4 text-gray-500" />
            <h2 className="text-[15px] font-semibold text-gray-900">Program Benchmarks</h2>
          </div>
          <motion.div
            className="bg-white rounded-3xl p-8 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)] card-hover"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <div className="grid grid-cols-3 gap-8">
              <div className="p-5 bg-gray-50 rounded-xl interactive-scale cursor-default">
                <p className="text-xs font-semibold text-gray-700 mb-3">Project QUEST</p>
                <p className="text-3xl font-bold font-data text-gray-900">
                  ${data.tier1_conservative.benchmarks.project_quest.cost_per_dollar.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">per $1 income</p>
                <p className="text-[10px] text-gray-400 mt-3">{data.tier1_conservative.benchmarks.project_quest.note}</p>
              </div>
              <div className="p-5 bg-gray-50 rounded-xl interactive-scale cursor-default">
                <p className="text-xs font-semibold text-gray-700 mb-3">Year Up</p>
                <p className="text-3xl font-bold font-data text-gray-900">
                  ${data.tier1_conservative.benchmarks.year_up.cost_per_dollar.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">per $1 income</p>
                <p className="text-[10px] text-gray-400 mt-3">{data.tier1_conservative.benchmarks.year_up.note}</p>
              </div>
              <div className="p-5 bg-[#1E3A5F]/5 rounded-xl border border-[#1E3A5F]/20 interactive-scale cursor-default">
                <p className="text-xs font-semibold text-[#1E3A5F] mb-3">EUC (This Program)</p>
                <p className="text-3xl font-bold font-data text-[#1E3A5F]">
                  ${data.tier1_conservative.metrics.cost_per_dollar_income_generated.toFixed(2)}
                </p>
                <p className="text-xs text-[#4A7CCC] mt-1">per $1 income</p>
                <p className="text-[10px] text-[#5A6C7D] mt-3">Measured wage gains, no RCT</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Methodology & Caveats Footer */}
        <motion.section
          className="border-t border-gray-200 pt-6"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.55 }}
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
            Methodology & Key Caveats
          </h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <p className="font-semibold text-sm text-gray-700">Assumptions</p>
              <ul className="text-xs text-gray-600 font-mono space-y-1">
                <li>Discount rate: {(data.metadata.discount_rate * 100).toFixed(0)}%</li>
                <li>Working years: 25 (estimate)</li>
                <li>Wage fade: 100% → 80% → 60%</li>
                <li>Chetty coefficient: 1.3%/$1K</li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="font-semibold text-sm text-gray-700">Critical Caveats</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {data.summary.key_caveats.slice(0, 4).map((caveat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                    {caveat}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
