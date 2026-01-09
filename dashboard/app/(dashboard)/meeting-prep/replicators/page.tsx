"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Users2,
  Users,
  DollarSign,
  Clock,
  Download,
  FileText,
  Building,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Calendar,
  Wrench,
  HelpCircle
} from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { LearningCurveChart } from "@/components/meeting-prep/learning-curve-chart";
import { BarrierROIChart } from "@/components/meeting-prep/barrier-roi-chart";
import { StoryCarousel } from "@/components/meeting-prep/story-carousel";
import { getReplicatorsData, getStoriesForAudience } from "@/lib/data/audience-meeting-data";

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export default function ReplicatorsMeetingPrepPage() {
  const prefersReducedMotion = useReducedMotion();
  const data = getReplicatorsData();
  const stories = getStoriesForAudience('replicators', 3);

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Topbar
        title="Replicators View"
        description="Implementation blueprint and honest assessment"
      />

      <div className="px-10 py-10 max-w-6xl">
        {/* Back navigation */}
        <Link
          href="/meeting-prep"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to audience selection
        </Link>

        {/* Header */}
        <motion.div
          className="bg-gradient-to-br from-[#8B9E8B] to-[#6B9BE0] rounded-3xl p-8 mb-8 text-white shadow-lg"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users2 className="w-5 h-5" />
                </div>
                <span className="text-white/70 text-sm font-medium">For Peer Organizations & Replicators</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {data.hero.headline}
              </h1>
              <p className="text-white/80 max-w-xl">
                {data.hero.subhead}. Full transparency on costs, timelines, and
                what we've learned—including what hasn't worked.
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold font-data">{data.hero.primaryMetric.value}</p>
              <p className="text-white/70 text-sm mt-1">{data.hero.primaryMetric.label}</p>
              <p className="text-white/60 text-xs mt-1">{data.hero.primaryMetric.context}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6 pt-6 mt-6 border-t border-white/30">
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Navigators</p>
              <p className="text-3xl font-bold font-data">{data.costBreakdown.navigatorCount}</p>
              <p className="text-white/70 text-sm">~${(data.costBreakdown.navigatorSalary / 1000).toFixed(0)}K avg salary</p>
            </div>
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Cost Per Family</p>
              <p className="text-3xl font-bold font-data">{formatCurrency(data.costBreakdown.costPerFamily)}</p>
              <p className="text-white/70 text-sm">full program cost</p>
            </div>
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Milestone Fund</p>
              <p className="text-3xl font-bold font-data">{formatCurrency(data.costBreakdown.milestoneFund)}</p>
              <p className="text-white/70 text-sm">flexible family support</p>
            </div>
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Overhead</p>
              <p className="text-3xl font-bold font-data">{(data.costBreakdown.overheadRate * 100).toFixed(0)}%</p>
              <p className="text-white/70 text-sm">operations rate</p>
            </div>
          </div>
        </motion.div>

        {/* Timeline to Results + Barrier ROI */}
        <motion.section
          className="grid grid-cols-2 gap-6 mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <LearningCurveChart
            data={data.timelineToResults}
            title="Timeline to Results"
            subtitle="When to expect meaningful outcomes"
          />
          <BarrierROIChart
            data={data.barrierCosts}
            title="Barrier Resolution Costs"
            subtitle="What you'll spend removing barriers"
          />
        </motion.section>

        {/* Top Intervention Spend */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Where the Money Goes
          </h2>
          <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 bg-[#8B9E8B]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Wrench className="w-5 h-5 text-[#8B9E8B]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Top Intervention Categories</h3>
                <p className="text-sm text-gray-500">Where flexible funds are actually spent</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {data.interventionCosts.slice(0, 8).map((intervention: any, index: number) => (
                <div
                  key={intervention.type}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{intervention.type}</p>
                    <p className="text-xs text-gray-500">{intervention.count} uses</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold font-data text-gray-900">{formatCurrency(intervention.totalSpend)}</p>
                    <p className="text-xs text-gray-500">~{formatCurrency(intervention.avgSpend)} avg</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Navigator Performance Variance */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Navigator Performance Variance
          </h2>
          <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 bg-[#4A7CCC]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-[#4A7CCC]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Performance Gap: {formatCurrency(data.navigatorPerformance.performanceGap)}</h3>
                <p className="text-sm text-gray-500">Difference between top and bottom navigator outcomes</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Top performers */}
              <div className="bg-[#8B9E8B]/10 rounded-xl p-4">
                <p className="text-xs font-semibold text-[#8B9E8B] uppercase tracking-wider mb-3">Top Performers</p>
                <div className="space-y-2">
                  {data.navigatorPerformance.topPerformers.map((nav: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{nav.navigator}</span>
                      <span className="font-bold font-data text-[#8B9E8B]">{formatCurrency(nav.avg_wage_gain)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom performers */}
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-3">Need Support</p>
                <div className="space-y-2">
                  {data.navigatorPerformance.bottomPerformers.map((nav: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{nav.navigator}</span>
                      <span className="font-bold font-data text-amber-700">{formatCurrency(nav.avg_wage_gain)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-[#4A7CCC]/5 rounded-lg">
              <p className="text-sm text-[#4A7CCC]">
                <strong>Key insight:</strong> Navigator selection and training is critical. Performance
                varies significantly—invest in hiring and continuous coaching.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Honest Assessment - Three Columns */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Honest Assessment
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {/* What Works */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-[#8B9E8B]" />
                <h3 className="font-semibold text-gray-900">What Works</h3>
              </div>
              <ul className="space-y-3">
                {data.honestAssessment.whatWorks.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-[#8B9E8B]/100 rounded-full mt-1.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What's Challenging */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-gray-900">What's Challenging</h3>
              </div>
              <ul className="space-y-3">
                {data.honestAssessment.whatsChallenging.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Unknown */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-gray-500" />
                <h3 className="font-semibold text-gray-900">What We Don't Know</h3>
              </div>
              <ul className="space-y-3">
                {data.honestAssessment.unknowns.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Key Implementation Learnings */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Key Implementation Learnings
          </h2>
          <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]">
            <div className="grid grid-cols-2 gap-6">
              {data.implementationLearnings.map((learning: any, index: number) => (
                <div key={index} className="flex gap-3">
                  <div className="w-8 h-8 bg-[#8B9E8B]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-[#8B9E8B] font-bold text-sm">{index + 1}</span>
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

        {/* Household Size Warning */}
        {data.householdSizeImpact && (
          <motion.section
            className="mb-10"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">Household Size Matters</h3>
                  <p className="text-sm text-amber-800 mb-4">
                    Larger families face steeper challenges. Your target population composition will affect outcomes.
                  </p>
                  <div className="grid grid-cols-4 gap-4">
                    {data.householdSizeImpact.data.slice(0, 4).map((size: any) => (
                      <div key={size.size} className="bg-white rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">{size.size} people</p>
                        <p className="text-lg font-bold font-data text-amber-700">{(size.graduation_rate * 100).toFixed(0)}%</p>
                        <p className="text-xs text-gray-500">grad rate</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Stories from Navigator Relationships */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Implementation Stories
          </h2>
          <StoryCarousel
            stories={stories}
            title="What Navigator Support Looks Like"
            subtitle="Real examples of barrier resolution and family progress"
            showFilmBadge={false}
          />
        </motion.section>

        {/* Export */}
        <motion.div
          className="flex items-center justify-between p-6 bg-white rounded-2xl shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Implementation Guide</p>
              <p className="text-sm text-gray-500">
                Detailed replication blueprint with costs, timelines, and lessons learned
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#8B9E8B] text-white rounded-lg hover:bg-[#1E3A5F] transition-colors">
            <Download className="w-4 h-4" />
            Download Guide
          </button>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-xs text-gray-400 mt-8 text-center"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          Implementation data from 2.5 years of operation • Contact us for detailed consultation
        </motion.p>
      </div>
    </div>
  );
}
