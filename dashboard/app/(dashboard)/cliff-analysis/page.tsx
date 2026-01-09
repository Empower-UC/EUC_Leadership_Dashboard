"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  TrendingUp,
  Users,
  MapPin,
  Home,
  ArrowRight,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import cliffData from "@/lib/data/cliff-analysis.json";
import { MetricStoryTrigger } from "@/components/stories/MetricStoryTrigger";
import storiesData from "@/lib/data/participant-stories.json";
import { ParticipantStory } from "@/lib/types/stories";

const data = cliffData;
const stories = storiesData.stories as ParticipantStory[];

export default function CliffAnalysisPage() {
  const prefersReducedMotion = useReducedMotion();

  const fadeIn = (delay: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3, delay },
        };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Topbar title="Benefit Cliffs" />

      <div className="px-10 pb-10 space-y-8 max-w-6xl">
        {/* Hero Insight - Single dominant focal point */}
        <motion.div
          className="bg-white rounded-xl border border-gray-200 p-8"
          {...fadeIn(0)}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Key finding</p>
              <h2 className="text-2xl font-semibold text-gray-900">
                {data.summary.families_in_cliff_zone} families approaching benefit cliffs
              </h2>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold font-data text-gray-900">
                ${(data.summary.total_benefits_at_risk / 1000000).toFixed(1)}M
              </p>
              <p className="text-sm text-gray-500">annual benefits at risk</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Avg exposure</p>
              <p className="text-2xl font-bold font-data text-[#4A7CCC]">
                ${data.summary.avg_exposure_per_family.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">per family</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Children affected</p>
              <p className="text-2xl font-bold font-data text-gray-900">{data.summary.children_at_risk}</p>
              <p className="text-xs text-gray-500">in these households</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">High risk</p>
              <p className="text-2xl font-bold font-data text-gray-900">
                {data.tiers.filter(t => t.risk_level === 'high').reduce((sum, t) => sum + t.families, 0)}
              </p>
              <p className="text-xs text-gray-500">families at SNAP/TennCare cliff</p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100 mt-4">
            <MetricStoryTrigger
              metric="cliff_crossings"
              stories={stories}
              variant="button"
              label="Hear from families who crossed"
            />
          </div>
        </motion.div>

        {/* Summary Stats - Secondary prominence */}
        <motion.div
          className="grid grid-cols-4 gap-4"
          {...fadeIn(0.05)}
        >
          {data.tiers.map((tier) => (
            <div key={tier.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">{tier.range}</p>
              <p className="text-3xl font-bold font-data text-gray-900">{tier.families}</p>
              <p className="text-sm text-gray-500">{tier.name}</p>
            </div>
          ))}
        </motion.div>

        {/* Two columns: Tiers + Risk Analysis */}
        <div className="grid grid-cols-2 gap-6">
          {/* Cliff Tiers */}
          <motion.div
            className="bg-white rounded-xl border border-gray-200 p-6"
            {...fadeIn(0.15)}
          >
            <h3 className="text-sm font-medium text-gray-900 mb-4">Breakdown by tier</h3>
            <div className="space-y-3">
              {data.tiers.map((tier) => (
                <div key={tier.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm text-gray-900">{tier.range}</p>
                    <p className="text-xs text-gray-500">{tier.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{tier.families} families</p>
                    <p className="text-xs text-gray-500">
                      ${(tier.benefits_at_risk / 1000).toFixed(0)}K at risk
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Benefits at Risk */}
          <motion.div
            className="bg-white rounded-xl border border-gray-200 p-6"
            {...fadeIn(0.2)}
          >
            <h3 className="text-sm font-medium text-gray-900 mb-4">Benefits at risk by tier</h3>
            <div className="space-y-4">
              {data.tiers.filter(t => t.benefits_at_risk > 0).map((tier) => (
                <div key={tier.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{tier.name}</span>
                    <span className="font-medium text-gray-900">
                      ${(tier.benefits_at_risk / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        tier.risk_level === 'high' ? 'bg-[#E07B67]' :
                        tier.risk_level === 'medium' ? 'bg-[#D4A574]' :
                        'bg-[#8B9E8B]'
                      }`}
                      style={{ width: `${(tier.benefits_at_risk / data.summary.total_benefits_at_risk) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {tier.benefits_affected.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Household Size + County */}
        <div className="grid grid-cols-2 gap-6">
          {/* Household Size */}
          <motion.div
            className="bg-white rounded-xl border border-gray-200 p-6"
            {...fadeIn(0.25)}
          >
            <h3 className="text-sm font-medium text-gray-900 mb-4">Graduation rate by household size</h3>
            <div className="space-y-3">
              {data.household_size_impact.data.map((row) => (
                <div key={row.size} className="flex items-center gap-3">
                  <div className="w-20 text-sm text-gray-600">{row.size}-person</div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-800 rounded-full"
                      style={{ width: `${row.graduation_rate * 5}%` }}
                    />
                  </div>
                  <div className="w-16 text-right">
                    <span className="text-sm font-medium">{row.graduation_rate}%</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4">
              {data.household_size_impact.insight}
            </p>
          </motion.div>

          {/* County */}
          <motion.div
            className="bg-white rounded-xl border border-gray-200 p-6"
            {...fadeIn(0.3)}
          >
            <h3 className="text-sm font-medium text-gray-900 mb-4">Cliff zone by county</h3>
            <div className="space-y-2">
              {data.county_concentration.data.slice(0, 6).map((county) => (
                <div key={county.county} className="flex items-center gap-3">
                  <div className="w-20 text-sm text-gray-600">{county.county}</div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${county.cliff_pct >= 40 ? 'bg-[#E07B67]' : county.cliff_pct >= 30 ? 'bg-[#D4A574]' : 'bg-gray-400'}`}
                      style={{ width: `${county.cliff_pct}%` }}
                    />
                  </div>
                  <div className="w-16 text-right text-sm">
                    <span className={`font-medium ${county.cliff_pct >= 40 ? 'text-[#E07B67]' : county.cliff_pct >= 30 ? 'text-[#D4A574]' : 'text-gray-600'}`}>
                      {county.cliff_pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Navigator Actions */}
        <motion.div
          className="bg-white rounded-xl border border-gray-200 p-6"
          {...fadeIn(0.35)}
        >
          <h3 className="text-sm font-medium text-gray-900 mb-4">Recommended actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {data.navigator_actions.map((action) => (
              <div key={action.priority} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-gray-600">{action.priority}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{action.action}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{action.rationale}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-xs text-gray-400 text-center"
          {...fadeIn(0.4)}
        >
          Data as of {data.metadata.data_as_of} · {data.metadata.families_analyzed} families analyzed
        </motion.p>
      </div>
    </div>
  );
}
