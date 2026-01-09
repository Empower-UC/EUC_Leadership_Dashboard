"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Landmark,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  BookOpen,
  FileText,
  Download,
  Beaker,
  AlertTriangle
} from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { DataQualityCard } from "@/components/meeting-prep/data-quality-card";
import { SensitivityChart } from "@/components/meeting-prep/sensitivity-chart";
import { StoryCarousel } from "@/components/meeting-prep/story-carousel";
import { getFederalData, getStoriesForAudience } from "@/lib/data/audience-meeting-data";

export default function FederalMeetingPrepPage() {
  const prefersReducedMotion = useReducedMotion();
  const data = getFederalData();
  const stories = getStoriesForAudience('federal', 3);

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Topbar
        title="Federal & Policy View"
        description="Evidence quality and methodological transparency"
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
          className="bg-gradient-to-br from-[#4A7CCC] to-[#6B9BE0] rounded-3xl p-8 text-white shadow-lg mb-8"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Landmark className="w-5 h-5" />
                </div>
                <span className="text-white/70 text-sm font-medium">For Federal Funders & Policy Makers</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {data.hero.headline}
              </h1>
              <p className="text-white/70 max-w-xl">
                {data.hero.subhead}. This page presents our data with full methodological
                transparency—showing exactly what we know and don't know.
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#D4A574] text-[#1E3A5F] rounded-lg text-sm font-medium mb-3">
                <Clock className="w-4 h-4" />
                RCT Pending
              </div>
              <p className="text-white/70 text-sm">MEF Associates & Urban Institute</p>
              <p className="text-white/60 text-xs">Results expected 2027</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-6 mt-6 border-t border-white/30">
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Design</p>
              <p className="font-semibold">Intent-to-Treat RCT</p>
              <p className="text-white/70 text-sm">Year 1 randomization</p>
            </div>
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Evaluator</p>
              <p className="font-semibold">MEF Associates / Urban</p>
              <p className="text-white/70 text-sm">Independent third-party</p>
            </div>
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Timeline</p>
              <p className="font-semibold">5-Year Pilot</p>
              <p className="text-white/70 text-sm">2022-2027</p>
            </div>
          </div>
        </motion.div>

        {/* Data Quality + Sensitivity Analysis */}
        <motion.section
          className="grid grid-cols-2 gap-6 mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <DataQualityCard
            data={data.dataQuality}
            title="Data Quality Dashboard"
          />
          <SensitivityChart
            data={data.sensitivityAnalysis.attribution}
            title="Attribution Sensitivity"
            subtitle="What if only X% of gains are due to the program?"
            warningNote={data.sensitivityAnalysis.buildingNebraskaWarning}
          />
        </motion.section>

        {/* Wage Persistence Scenarios */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Wage Persistence Scenarios
          </h2>
          <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 bg-[#4A7CCC]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Beaker className="w-5 h-5 text-[#4A7CCC]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Lifetime Value Under Different Assumptions</h3>
                <p className="text-sm text-gray-500">How long do wage gains persist? Major source of uncertainty.</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {data.sensitivityAnalysis.wagePersistence.map((scenario, index) => (
                <motion.div
                  key={scenario.scenario}
                  className={`p-4 rounded-xl ${
                    scenario.scenario === 'with_fade'
                      ? 'bg-gradient-to-br from-[#4A7CCC]/10 to-[#6B9BE0]/10 border-2 border-[#4A7CCC]/30'
                      : 'bg-gray-50'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                >
                  {scenario.scenario === 'with_fade' && (
                    <span className="text-xs text-[#4A7CCC] font-medium mb-2 block">Recommended</span>
                  )}
                  <p className="text-xs text-gray-500 mb-1">{scenario.description}</p>
                  <p className="text-2xl font-bold font-data text-gray-900">
                    ${(scenario.lifetimeValue / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-sm font-semibold text-[#4A7CCC] mt-1">{scenario.roiRatio} ROI</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Program Maturity Timeline */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Program Maturity Assessment
          </h2>
          <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]">
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-[#8B9E8B]/10 rounded-xl text-center">
                <p className="text-3xl font-bold font-data text-[#8B9E8B]">
                  2.5
                </p>
                <p className="text-xs text-[#8B9E8B]">Years Operational</p>
              </div>
              <div className="p-4 bg-[#4A7CCC]/10 rounded-xl text-center">
                <p className="text-3xl font-bold font-data text-[#4A7CCC]">
                  880
                </p>
                <p className="text-xs text-[#4A7CCC]">Total Enrolled</p>
              </div>
              <div className="p-4 bg-[#1E3A5F]/5 rounded-xl text-center">
                <p className="text-3xl font-bold font-data text-[#1E3A5F]">
                  68
                </p>
                <p className="text-xs text-[#1E3A5F]">Graduates (225%+ FPL)</p>
              </div>
              <div className="p-4 bg-[#D4A574]/10 rounded-xl text-center">
                <p className="text-2xl font-bold font-data text-[#D4A574]">
                  Growth
                </p>
                <p className="text-xs text-[#D4A574]">Development Stage</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-700">Program demonstrates consistent outcomes across early and recent cohorts, with {data.programMaturity?.yearsOperating ?? 3} years of enrollment data analyzed.</p>
            </div>
          </div>
        </motion.section>

        {/* Methodology Comparison */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Methodological Approaches
          </h2>
          <div className="grid grid-cols-2 gap-6">
            {/* Conservative */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Conservative Approach</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">{data.methodology.conservative.description}</p>
              <div className="bg-slate-50 rounded-lg p-3 mb-4">
                <p className="text-xs font-medium text-slate-700">Best for: {data.methodology.conservative.audience}</p>
              </div>
              <div className="space-y-2">
                {data.methodology.conservative.caveats.map((caveat: string, i: number) => (
                  <p key={i} className="text-xs text-gray-500 flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    {caveat}
                  </p>
                ))}
              </div>
            </div>

            {/* Lifecycle */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#4A7CCC]/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-[#4A7CCC]" />
                </div>
                <h3 className="font-semibold text-gray-900">Lifecycle Approach</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">{data.methodology.lifecycle.description}</p>
              <div className="bg-[#4A7CCC]/10 rounded-lg p-3 mb-4">
                <p className="text-xs font-medium text-[#4A7CCC]">
                  Assumptions: {data.methodology.lifecycle.assumptions.working_years_remaining} years remaining,
                  {" "}discount rate {(data.methodology.lifecycle.assumptions.discount_rate * 100).toFixed(0)}%
                </p>
              </div>
              <div className="space-y-2">
                {data.methodology.lifecycle.caveats.map((caveat: string, i: number) => (
                  <p key={i} className="text-xs text-gray-500 flex items-start gap-2">
                    <span className="text-[#4A7CCC]">•</span>
                    {caveat}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Building Nebraska Comparison */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Critical Comparison: Rural TANF Evidence
          </h2>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-3 mb-6">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">Building Nebraska Families Showed Zero Impact</p>
                <p className="text-sm text-amber-800 mt-1">
                  The only prior RCT of a similar rural TANF navigator model (evaluated by Mathematica) found no
                  detectable impact on employment or earnings. EUC's observational results would represent a
                  significant departure—but remain unvalidated until our RCT concludes.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-gray-900">Building Nebraska Families</span>
                  <span className="text-xs px-2 py-1 bg-[#8B9E8B]/20 text-[#8B9E8B] rounded">RCT Validated</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Setting</span>
                    <span className="text-gray-900">Rural Nebraska</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cost/participant</span>
                    <span className="text-gray-900">~$15,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">RCT Impact</span>
                    <span className="text-red-600 font-medium">No effect detected</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#4A7CCC]/10 rounded-xl p-5 border-2 border-[#4A7CCC]/30">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-gray-900">EUC (Observational)</span>
                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">RCT Pending</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Setting</span>
                    <span className="text-gray-900">Rural Tennessee</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cost/participant</span>
                    <span className="text-gray-900">~$28,400</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Observational Impact</span>
                    <span className="text-[#8B9E8B] font-medium">$7K avg wage gain (unvalidated)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Model Differentiation */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Model Differentiation
          </h2>
          <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)]">
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8B9E8B]" />
                  <span className="font-medium text-gray-900">Navigator Model</span>
                </div>
                <p className="text-sm text-gray-600 pl-6">
                  17 local navigators providing intensive case management vs. traditional referral-only approach
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8B9E8B]" />
                  <span className="font-medium text-gray-900">Benefits Cliff Support</span>
                </div>
                <p className="text-sm text-gray-600 pl-6">
                  Active cliff mitigation through flexible resources, unlike programs that end at employment
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8B9E8B]" />
                  <span className="font-medium text-gray-900">Two-Generation</span>
                </div>
                <p className="text-sm text-gray-600 pl-6">
                  Family stability services for 1,905 children in participating households
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Stories with measurable outcomes */}
        <motion.section
          className="mb-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Participant Outcomes
          </h2>
          <StoryCarousel
            stories={stories}
            title="Documented Transformations"
            subtitle="Families with measurable wage and FPL changes"
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
              <p className="font-medium text-gray-900">Policy Brief with Methodology</p>
              <p className="text-sm text-gray-500">
                Complete evidence summary with data quality appendix
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#4A7CCC] text-white rounded-lg hover:bg-[#1E3A5F] transition-colors">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-xs text-gray-400 mt-8 text-center"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          Data current through monthly review • RCT in progress with MEF Associates & Urban Institute • Results expected 2027
        </motion.p>
      </div>
    </div>
  );
}
