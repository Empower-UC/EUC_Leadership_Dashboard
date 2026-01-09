"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Lightbulb, TrendingUp, Users, Target, AlertCircle, Clock, Building2, Heart, Landmark, Newspaper, Users2, ChevronRight } from "lucide-react";
import { InvestmentThesisCards } from "@/components/charts/investment-thesis-cards";
import { BarrierROIChart } from "@/components/charts/barrier-roi-chart";
import { NavigatorQuadrant } from "@/components/charts/navigator-quadrant";
import { RiskReturnScatter } from "@/components/charts/risk-return-scatter";
import { CohortComparison } from "@/components/charts/cohort-comparison";
import { LearningCurve } from "@/components/charts/learning-curve";
import { ExportButton } from "@/components/ui/export-button";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { MeetingPrepSection } from "@/components/fundraising/meeting-prep-section";

interface FundraisingInsights {
  generated_at: string;
  total_participants: number;
  participants_with_outcomes: number;
  cohort_comparison: {
    accelerators: {
      count: number;
      avg_fpl_change: number;
      avg_wage_gain: number;
      avg_days: number;
      avg_start_fpl: number;
    };
    decelerators: {
      count: number;
      avg_fpl_change: number;
      avg_wage_gain: number;
      avg_days: number;
      avg_start_fpl: number;
    };
    middle: {
      count: number;
      avg_fpl_change: number;
      avg_wage_gain: number;
    };
    thresholds: {
      wage_75th: number;
      wage_25th: number;
    };
  };
  barrier_analysis: Array<{
    barrier: string;
    count: number;
    prevalence: number;
    drag_coefficient: number;
    resolution_cost: number;
    roi_ratio: number;
    leverage_score: number;
  }>;
  navigator_performance: Array<{
    navigator: string;
    caseload: number;
    positive_wage_count: number;
    success_rate: number;
    avg_wage_gain: number;
    avg_fpl_change: number;
    avg_days: number;
    velocity_score: number;
  }>;
  investment_theses: Array<{
    id: number;
    title: string;
    insight: string;
    metric: string;
    metric_label: string;
    detail: string;
    color: "sage" | "blue" | "amber" | "navy";
  }>;
  scatter_data: Array<{
    id: string;
    risk_score: number;
    wage_gain: number;
    fpl_change: number;
    start_fpl: number;
    county: string;
    navigator: string;
  }>;
}

interface TemporalInsights {
  tenure_analysis: Array<{
    bracket: string;
    count: number;
    success_rate: number;
    avg_wage_gain: number;
    avg_fpl_change: number;
    avg_days: number;
  }>;
  cumulative_impact: Array<{
    month: string;
    month_label: string;
    new_families: number;
    new_wage_gains: number;
    cumulative_families: number;
    cumulative_wage_gains: number;
    avg_wage_per_family: number;
  }>;
}

interface FundraisingClientProps {
  data: FundraisingInsights;
  temporalData?: TemporalInsights;
}

export function FundraisingClient({ data, temporalData }: FundraisingClientProps) {
  const prefersReducedMotion = useReducedMotion();

  // Prepare export data
  const exportData = [
    { section: "Overview", metric: "Total Participants", value: data.total_participants },
    { section: "Overview", metric: "With Outcomes", value: data.participants_with_outcomes },
    { section: "Accelerators", metric: "Count", value: data.cohort_comparison.accelerators.count },
    { section: "Accelerators", metric: "Avg Wage Gain", value: data.cohort_comparison.accelerators.avg_wage_gain },
    { section: "Decelerators", metric: "Count", value: data.cohort_comparison.decelerators.count },
    { section: "Decelerators", metric: "Avg Wage Gain", value: data.cohort_comparison.decelerators.avg_wage_gain },
    ...data.barrier_analysis.map((b) => ({
      section: "Barriers",
      metric: b.barrier,
      value: `${b.prevalence.toFixed(1)}% prevalence, ${b.roi_ratio.toFixed(2)}x ROI`,
    })),
  ];

  return (
    <div className="min-h-screen bg-[#F4F7F9]">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-semibold text-gray-900">Fundraising Intelligence</h1>
            <p className="text-sm text-gray-500">Predictive analytics for funder engagement</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 font-mono">
              {data.participants_with_outcomes} families with outcome data
            </span>
            <ExportButton data={exportData} filename="euc-fundraising-insights" />
          </div>
        </div>
      </div>

      <div className="px-8 py-8 space-y-10 max-w-7xl">
        {/* Meeting Prep - Audience-specific framing */}
        <MeetingPrepSection />

        {/* Investment Theses - Hero Section */}
        <section>
          <motion.div
            className="flex items-center gap-2 mb-6"
            initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">Investment Theses</h2>
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium ml-2">
              Key Insights
            </span>
            <InfoTooltip
              content="Data-driven insights for funder conversations. Each thesis is backed by program data."
              methodology="Derived from cohort analysis, barrier intervention data, and navigator performance metrics."
            />
          </motion.div>
          <InvestmentThesisCards theses={data.investment_theses} />
        </section>

        {/* Cohort Variance Analysis */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-[#8B9E8B]" />
            <h2 className="text-lg font-semibold text-gray-900">Cohort Variance Analysis</h2>
            <InfoTooltip
              content="Comparing families with highest wage gains (Accelerators) vs those with negative/zero change (Decelerators)."
              methodology="Accelerators = top 25% by wage gain. Decelerators = families with wage change <= $0."
            />
          </div>
          <motion.div
            className="bg-white rounded-3xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <CohortComparison data={data.cohort_comparison} />
          </motion.div>
        </section>

        {/* Two-column layout for charts */}
        <div className="grid grid-cols-2 gap-6">
          {/* Barrier ROI */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4 text-[#4A7CCC]" />
              <h2 className="text-[15px] font-semibold text-gray-900">Barrier ROI Analysis</h2>
              <InfoTooltip
                content="Which barriers have highest impact on income when resolved?"
                methodology="Drag coefficient = estimated annual income loss from barrier. ROI = drag / resolution cost."
              />
            </div>
            <motion.div
              className="bg-white rounded-3xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <BarrierROIChart data={data.barrier_analysis} />
            </motion.div>
          </section>

          {/* Navigator Quadrant */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-[#6B9BE0]" />
              <h2 className="text-[15px] font-semibold text-gray-900">Navigator Performance</h2>
              <InfoTooltip
                content="Comparing navigators by success rate and efficiency (velocity score)."
                methodology="Velocity = wage gain per day in program. Success = % families with positive wage change."
              />
            </div>
            <motion.div
              className="bg-white rounded-3xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <NavigatorQuadrant data={data.navigator_performance} />
            </motion.div>
          </section>
        </div>

        {/* Program Learning Curve - Full Width */}
        {temporalData && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Clock className="h-5 w-5 text-[#8B9E8B]" />
              <h2 className="text-lg font-semibold text-gray-900">Program Learning Curve</h2>
              <span className="text-xs text-[#8B9E8B] bg-[#8B9E8B]/10 px-2 py-0.5 rounded-full font-medium ml-2">
                Time Analysis
              </span>
              <InfoTooltip
                content="How outcomes improve with time in program. Key finding: sustainable economic mobility requires long-term support."
                methodology="Families segmented by program tenure. Success = positive wage change rate."
              />
            </div>
            <motion.div
              className="bg-white rounded-3xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <LearningCurve
                tenureData={temporalData.tenure_analysis}
                cumulativeData={temporalData.cumulative_impact}
              />
            </motion.div>
          </section>
        )}

        {/* Risk/Return Scatter - Full Width */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-rose-500" />
            <h2 className="text-[15px] font-semibold text-gray-900">Risk/Return Profile</h2>
            <InfoTooltip
              content="Individual family outcomes plotted by risk score and wage gain."
              methodology="Risk score combines starting FPL, barrier complexity, and household factors."
            />
          </div>
          <motion.div
            className="bg-white rounded-3xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <RiskReturnScatter data={data.scatter_data} />
          </motion.div>
        </section>

        {/* Leadership Team */}
        <motion.section
          className="border-t border-gray-200 pt-8"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-6">
            Leadership
          </h3>
          <div className="grid grid-cols-2 gap-8 max-w-2xl">
            <div className="flex items-center gap-4">
              <Image
                src="/mark-farley.jpg"
                alt="Mark Farley"
                width={80}
                height={80}
                className="w-20 h-20 rounded-2xl object-cover object-top"
              />
              <div>
                <p className="font-semibold text-gray-900">Mark Farley</p>
                <p className="text-sm text-gray-500">Executive Director</p>
                <p className="text-xs text-gray-400 mt-1">UCHRA</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Image
                src="/megan-spurgeon.jpg"
                alt="Megan Spurgeon"
                width={80}
                height={80}
                className="w-20 h-20 rounded-2xl object-cover object-top"
              />
              <div>
                <p className="font-semibold text-gray-900">Megan Spurgeon</p>
                <p className="text-sm text-gray-500">Project Director</p>
                <p className="text-xs text-gray-400 mt-1">Empower UC</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Methodology Footer */}
        <motion.section
          className="border-t border-gray-200 pt-6"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
            Data Sources & Methodology
          </h3>
          <div className="grid grid-cols-4 gap-8 text-xs text-gray-600 font-mono">
            <div>
              <p className="font-semibold text-gray-700 mb-2">Data Sources</p>
              <ul className="space-y-1">
                <li>Baseline Assessment (n=880)</li>
                <li>Navigator Dashboard</li>
                <li>Monthly Client Reviews</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-2">Cohort Definitions</p>
              <ul className="space-y-1">
                <li>Accelerators: Top 25% wage gain</li>
                <li>Decelerators: Wage gain &le; $0</li>
                <li>Middle: 25th-75th percentile</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-2">Key Metrics</p>
              <ul className="space-y-1">
                <li>Velocity = gain / days * 100</li>
                <li>ROI = drag / resolution cost</li>
                <li>Risk = composite score</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-2">Limitations</p>
              <ul className="space-y-1">
                <li>Outcome data: {data.participants_with_outcomes}/{data.total_participants}</li>
                <li>Barrier costs estimated</li>
                <li>Selection bias possible</li>
              </ul>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
