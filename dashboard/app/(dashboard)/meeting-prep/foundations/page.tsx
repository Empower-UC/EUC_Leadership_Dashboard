"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Users,
  TrendingUp,
  Baby,
  Target,
  Download,
  Sparkles,
  GraduationCap,
  Lightbulb
} from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { LearningCurveChart } from "@/components/meeting-prep/learning-curve-chart";
import { BarrierROIChart } from "@/components/meeting-prep/barrier-roi-chart";
import { StoryCarousel } from "@/components/meeting-prep/story-carousel";
import { getFoundationsData, getStoriesForAudience } from "@/lib/data/audience-meeting-data";

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export default function FoundationsView() {
  const prefersReducedMotion = useReducedMotion();
  const data = getFoundationsData();
  const stories = getStoriesForAudience('foundations', 5);

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Topbar
        title="Foundations View"
        description="Family outcomes and two-generation impact"
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
          className="bg-gradient-to-br from-[#D4A574] to-[#E8C9A8] rounded-3xl p-8 text-[#1E3A5F] shadow-lg mb-8"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <span className="text-[#1E3A5F]/70 text-sm font-medium">For Foundations & Philanthropic Funders</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {data.hero.headline}
              </h1>
              <p className="text-[#1E3A5F]/80 max-w-xl">
                {data.hero.subhead}. A two-generation approach where parents' economic gains
                directly benefit children's long-term outcomes.
              </p>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold font-data">{data.hero.primaryMetric.value}</p>
              <p className="text-[#1E3A5F]/70 text-sm mt-1">{data.hero.primaryMetric.label}</p>
              <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors mt-4 ml-auto">
                <Download className="w-4 h-4" />
                Export One-Pager
              </button>
            </div>
          </div>
        </motion.div>

        {/* Two-Generation Impact - The Foundation Story */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Two-Generation Impact
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {/* Children Card */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-[#4A7CCC]/20 rounded-xl flex items-center justify-center">
                  <Baby className="w-5 h-5 text-[#4A7CCC]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Children in Program Households</p>
                </div>
              </div>
              <p className="text-4xl font-bold font-data text-gray-900 mb-2">
                {data.twoGeneration.totalChildren.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                ~{data.twoGeneration.avgChildrenPerFamily} children per family average
              </p>
            </div>

            {/* Chetty Research Card */}
            <div className="bg-gradient-to-br from-[#4A7CCC]/10 to-[#6B9BE0]/10 rounded-2xl p-6 col-span-2">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-[#4A7CCC]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Research-Based Child Impact Projection</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Based on Chetty et al. research: each $1,000 increase in parental income during childhood
                    leads to <span className="font-semibold text-[#1E3A5F]">{data.twoGeneration.chettyProjection.coefficient}%</span> higher
                    adult earnings for children.
                  </p>
                  <div className="flex items-center gap-6">
                    <div className="bg-white rounded-lg px-4 py-2">
                      <p className="text-xs text-gray-500">Projected Annual Boost Per Child</p>
                      <p className="text-xl font-bold font-data text-[#1E3A5F]">
                        ${data.twoGeneration.chettyProjection.boostPerChild.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 max-w-xs">
                      {data.twoGeneration.chettyProjection.researchBasis}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Learning Curve + Barrier ROI Grid */}
        <motion.section
          className="mb-10 grid grid-cols-2 gap-6"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <LearningCurveChart
            data={data.learningCurve}
            title="Outcomes Improve With Time"
            subtitle="Success rates and wage gains by program tenure"
          />
          <BarrierROIChart
            data={data.barrierROI}
            title="Barrier Intervention ROI"
            subtitle="Where targeted investment pays off most"
          />
        </motion.section>

        {/* Cohort Insights */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Who Succeeds Fastest?
          </h2>
          <div className="grid grid-cols-2 gap-6">
            {/* Accelerators */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#8B9E8B]/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-[#8B9E8B]" />
                </div>
                <h3 className="font-semibold text-gray-900">Accelerators</h3>
                <span className="text-xs text-[#8B9E8B] bg-[#8B9E8B]/10 px-2 py-0.5 rounded-full">
                  {data.cohortInsights.accelerators.count} families
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">Families showing rapid FPL progress with strong wage gains</p>
              <div className="flex items-center gap-4">
                <div className="bg-[#8B9E8B]/10 rounded-lg px-3 py-2">
                  <p className="text-xs text-[#8B9E8B]">Avg. Wage Gain</p>
                  <p className="text-xl font-bold font-data text-[#8B9E8B]">
                    {formatCurrency(data.cohortInsights.accelerators.avg_wage_gain)}
                  </p>
                </div>
                <div className="bg-[#8B9E8B]/10 rounded-lg px-3 py-2">
                  <p className="text-xs text-[#8B9E8B]">Avg. FPL Change</p>
                  <p className="text-xl font-bold font-data text-[#8B9E8B]">
                    +{(data.cohortInsights.accelerators.avg_fpl_change * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Decelerators */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Need More Support</h3>
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  {data.cohortInsights.decelerators.count} families
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">Families facing barriers requiring additional intervention</p>
              <div className="flex items-center gap-4">
                <div className="bg-amber-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-amber-700">Avg. Wage Gain</p>
                  <p className="text-xl font-bold font-data text-amber-700">
                    {formatCurrency(data.cohortInsights.decelerators.avg_wage_gain)}
                  </p>
                </div>
                <div className="bg-amber-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-amber-700">Avg. FPL Change</p>
                  <p className="text-xl font-bold font-data text-amber-700">
                    +{(data.cohortInsights.decelerators.avg_fpl_change * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Differential callout */}
          <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-amber-800">
                  ${(data.cohortInsights.wageDifferential / 1000).toFixed(0)}K wage differential
                </span>{" "}
                — Accelerators achieve significantly higher gains, suggesting pre-existing employment
                or education provides a foundation for faster progress.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Family Stories */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Family Stories
          </h2>
          <StoryCarousel
            stories={stories}
            title="Families Building Futures"
            subtitle="Two-generation success stories from the program"
          />
        </motion.section>

        {/* Investment Theses */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Investment Opportunities
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {data.investmentTheses.map((thesis: any, index: number) => (
              <motion.div
                key={thesis.thesis}
                className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)] hover:shadow-md transition-shadow"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.35 + index * 0.1 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="font-semibold text-gray-900 text-sm">{thesis.thesis}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">{thesis.rationale}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{thesis.evidence}</span>
                  <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded">
                    {thesis.potential_roi}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Key Learnings */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            What We've Learned
          </h2>
          <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]">
            <div className="grid grid-cols-2 gap-6">
              {data.keyLearnings.map((learning: any, index: number) => (
                <div key={index} className="flex gap-3">
                  <div className="w-8 h-8 bg-[#6B9BE0]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-[#4A7CCC] font-bold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{learning.finding}</h4>
                    <p className="text-sm text-gray-600">{learning.implication}</p>
                    <p className="text-xs text-gray-400 mt-1">{learning.data_point}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Data Footer */}
        <motion.div
          className="text-xs text-gray-400 text-center pt-6 border-t border-gray-200"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          Data current through monthly review • RCT in progress with MEF Associates & Urban Institute
        </motion.div>
      </div>
    </div>
  );
}
