"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Heart,
  Landmark,
  Newspaper,
  Users2,
  Download,
  ChevronDown,
  Presentation,
  CheckCircle,
  Clock,
  AlertTriangle,
  Check,
  Loader2,
} from "lucide-react";
import meetingData from "@/lib/data/meeting-prep-data.json";

const data = meetingData;

type AudienceId = "government" | "foundations" | "federal" | "media" | "replicators";

const audiences: {
  id: AudienceId;
  title: string;
  shortTitle: string;
  icon: typeof Building2;
  color: string;
  bgColor: string;
  headline: string;
  exportFormat: string;
}[] = [
  {
    id: "government",
    title: "State & Local Government",
    shortTitle: "Government",
    icon: Building2,
    color: "text-slate-600",
    bgColor: "bg-slate-100",
    headline: "Taxpayer ROI",
    exportFormat: "Formal Report",
  },
  {
    id: "foundations",
    title: "Private Foundations",
    shortTitle: "Foundations",
    icon: Heart,
    color: "text-rose-600",
    bgColor: "bg-rose-100",
    headline: "Family Outcomes",
    exportFormat: "One-Pager",
  },
  {
    id: "federal",
    title: "Federal & Policy",
    shortTitle: "Federal",
    icon: Landmark,
    color: "text-[#4A7CCC]",
    bgColor: "bg-[#4A7CCC]/20",
    headline: "Evidence Standards",
    exportFormat: "Policy Brief",
  },
  {
    id: "media",
    title: "Media & Public",
    shortTitle: "Media",
    icon: Newspaper,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    headline: "Human Stories",
    exportFormat: "Fact Sheet",
  },
  {
    id: "replicators",
    title: "Peer Organizations",
    shortTitle: "Replicators",
    icon: Users2,
    color: "text-[#8B9E8B]",
    bgColor: "bg-[#8B9E8B]/20",
    headline: "Implementation",
    exportFormat: "Guide",
  },
];

const confidenceConfig = {
  measured: {
    label: "Measured",
    color: "bg-[#8B9E8B]/20 text-[#8B9E8B]",
    icon: CheckCircle,
  },
  projected: {
    label: "Projected",
    color: "bg-amber-100 text-amber-700",
    icon: Clock,
  },
  estimated: {
    label: "Estimated",
    color: "bg-blue-100 text-blue-700",
    icon: AlertTriangle,
  },
};

function ConfidenceBadge({ confidence }: { confidence: "measured" | "projected" | "estimated" }) {
  const config = confidenceConfig[confidence];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${config.color}`}>
      <Icon className="w-2.5 h-2.5" />
      {config.label}
    </span>
  );
}

function GovernmentMetrics() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="bg-slate-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500 font-medium">Taxpayer ROI</span>
          <ConfidenceBadge confidence="projected" />
        </div>
        <p className="text-3xl font-bold font-data text-slate-900">
          {data.roi_calculations.taxpayer.display}
        </p>
        <p className="text-xs text-slate-500 mt-1">for every $1 invested</p>
      </div>
      <div className="bg-slate-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500 font-medium">Annual Tax Revenue</span>
          <ConfidenceBadge confidence="measured" />
        </div>
        <p className="text-3xl font-bold font-data text-slate-900">
          ${(data.tax_revenue.total_annual.value / 1000000).toFixed(1)}M
        </p>
        <p className="text-xs text-slate-500 mt-1">FICA + Federal + Sales</p>
      </div>
      <div className="bg-slate-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500 font-medium">Benefits Savings</span>
          <ConfidenceBadge confidence="estimated" />
        </div>
        <p className="text-3xl font-bold font-data text-slate-900">
          ${(data.benefits_savings.total_annual.value / 1000).toFixed(0)}K
        </p>
        <p className="text-xs text-slate-500 mt-1">annual reduction</p>
      </div>
    </div>
  );
}

function FoundationsMetrics() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="bg-rose-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-rose-600 font-medium">Families Served</span>
          <ConfidenceBadge confidence="measured" />
        </div>
        <p className="text-3xl font-bold font-data text-rose-900">
          {data.core_metrics.families_served.value}
        </p>
        <p className="text-xs text-rose-600 mt-1">
          {data.core_metrics.children_impacted.value.toLocaleString()} children impacted
        </p>
      </div>
      <div className="bg-rose-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-rose-600 font-medium">Lifetime ROI</span>
          <ConfidenceBadge confidence="projected" />
        </div>
        <p className="text-3xl font-bold font-data text-rose-900">
          {data.roi_calculations.primary.display}
        </p>
        <p className="text-xs text-rose-600 mt-1">family income gains per $1</p>
      </div>
      <div className="bg-rose-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-rose-600 font-medium">Graduated</span>
          <ConfidenceBadge confidence="measured" />
        </div>
        <p className="text-3xl font-bold font-data text-rose-900">
          {data.core_metrics.graduation_count.value}
        </p>
        <p className="text-xs text-rose-600 mt-1">families at 225%+ FPL</p>
      </div>
    </div>
  );
}

function FederalMetrics() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="bg-[#4A7CCC]/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#4A7CCC] font-medium">Evidence Status</span>
          <ConfidenceBadge confidence="projected" />
        </div>
        <p className="text-xl font-bold text-[#1E3A5F]">Pre-RCT</p>
        <p className="text-xs text-[#4A7CCC] mt-1">MEF/Urban validation pending</p>
      </div>
      <div className="bg-[#4A7CCC]/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#4A7CCC] font-medium">Graduation Rate</span>
          <ConfidenceBadge confidence="measured" />
        </div>
        <p className="text-3xl font-bold font-data text-[#1E3A5F]">
          {data.core_metrics.graduation_rate.value}%
        </p>
        <p className="text-xs text-[#4A7CCC] mt-1">reached 225% FPL</p>
      </div>
      <div className="bg-[#4A7CCC]/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#4A7CCC] font-medium">vs. Nebraska RCT</span>
          <ConfidenceBadge confidence="measured" />
        </div>
        <p className="text-xl font-bold text-[#1E3A5F]">Promising</p>
        <p className="text-xs text-[#4A7CCC] mt-1">only other rural TANF RCT showed 0 impact</p>
      </div>
    </div>
  );
}

function MediaMetrics() {
  const avgMonthlyGain = Math.round(data.core_metrics.avg_wage_gain.value / 12);
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="bg-amber-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-amber-700 font-medium">Escaped Poverty</span>
          <ConfidenceBadge confidence="measured" />
        </div>
        <p className="text-3xl font-bold font-data text-amber-900">
          {data.core_metrics.graduation_count.value}
        </p>
        <p className="text-xs text-amber-700 mt-1">families graduated</p>
      </div>
      <div className="bg-amber-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-amber-700 font-medium">Children Impacted</span>
          <ConfidenceBadge confidence="measured" />
        </div>
        <p className="text-3xl font-bold font-data text-amber-900">
          {data.core_metrics.children_impacted.value.toLocaleString()}
        </p>
        <p className="text-xs text-amber-700 mt-1">watching parents build stability</p>
      </div>
      <div className="bg-amber-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-amber-700 font-medium">Monthly Gain</span>
          <ConfidenceBadge confidence="measured" />
        </div>
        <p className="text-3xl font-bold font-data text-amber-900">
          +${avgMonthlyGain.toLocaleString()}
        </p>
        <p className="text-xs text-amber-700 mt-1">per family on average</p>
      </div>
    </div>
  );
}

function ReplicatorsMetrics() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="bg-[#8B9E8B]/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#8B9E8B] font-medium">Program Cost</span>
          <ConfidenceBadge confidence="estimated" />
        </div>
        <p className="text-3xl font-bold font-data text-[#1E3A5F]">
          ${(data.investment.program_cost_to_date.value / 1000000).toFixed(1)}M
        </p>
        <p className="text-xs text-[#8B9E8B] mt-1">for {data.core_metrics.families_served.value} families</p>
      </div>
      <div className="bg-[#8B9E8B]/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#8B9E8B] font-medium">Cost per Family</span>
          <ConfidenceBadge confidence="estimated" />
        </div>
        <p className="text-3xl font-bold font-data text-[#1E3A5F]">
          ${data.investment.cost_per_family.value.toLocaleString()}
        </p>
        <p className="text-xs text-[#8B9E8B] mt-1">all-in estimate</p>
      </div>
      <div className="bg-[#8B9E8B]/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#8B9E8B] font-medium">Staffing</span>
          <ConfidenceBadge confidence="measured" />
        </div>
        <p className="text-3xl font-bold font-data text-[#1E3A5F]">17</p>
        <p className="text-xs text-[#8B9E8B] mt-1">navigators across 14 counties</p>
      </div>
    </div>
  );
}

const MetricsComponents: Record<AudienceId, () => React.ReactNode> = {
  government: GovernmentMetrics,
  foundations: FoundationsMetrics,
  federal: FederalMetrics,
  media: MediaMetrics,
  replicators: ReplicatorsMetrics,
};

export function MeetingPrepSection() {
  const [selectedAudience, setSelectedAudience] = useState<AudienceId>("foundations");
  const [isExpanded, setIsExpanded] = useState(true);
  const [exportState, setExportState] = useState<"idle" | "loading" | "success">("idle");

  const selected = audiences.find((a) => a.id === selectedAudience)!;
  const MetricsComponent = MetricsComponents[selectedAudience];

  const handleExport = useCallback(async () => {
    setExportState("loading");

    // Generate export content based on audience
    const framing = data.audience_framings[selectedAudience];
    const content = `
${selected.title.toUpperCase()} - MEETING PREP
${"=".repeat(50)}

HEADLINE: ${framing.headline}
SUBHEAD: ${framing.subhead}

KEY METRICS FOCUS:
${framing.key_metrics.map((key: string) => `• ${key}`).join("\n")}

TRUST SIGNALS:
${framing.trust_signals.map((s: string) => `• ${s}`).join("\n")}

COMPARISON FRAME: ${framing.comparison_frame}

---
Generated ${new Date().toLocaleDateString()} | Empower UC Dashboard
    `.trim();

    // Create and download file
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `euc-${selectedAudience}-prep.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportState("success");
    setTimeout(() => setExportState("idle"), 2000);
  }, [selectedAudience, selected.title]);

  return (
    <section>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 mb-4 group"
        >
          <Presentation className="h-5 w-5 text-[#6B9BE0]" />
          <h2 className="text-lg font-semibold text-gray-900">Meeting Prep</h2>
          <span className="text-xs text-[#4A7CCC] bg-[#4A7CCC]/10 px-2 py-0.5 rounded-full font-medium ml-2">
            Audience Framing
          </span>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform ml-2 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl shadow-[0_1px_3px_0_rgb(15_23_42/0.08)] p-6">
              {/* Audience Selector */}
              <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                {audiences.map((audience) => {
                  const Icon = audience.icon;
                  const isSelected = selectedAudience === audience.id;
                  return (
                    <button
                      key={audience.id}
                      onClick={() => setSelectedAudience(audience.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                        isSelected
                          ? `${audience.bgColor} ${audience.color}`
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {audience.shortTitle}
                    </button>
                  );
                })}
              </div>

              {/* Selected Audience Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{selected.title}</h3>
                  <p className="text-sm text-gray-500">
                    {data.audience_framings[selectedAudience].headline}
                  </p>
                </div>
                <button
                  onClick={handleExport}
                  disabled={exportState !== "idle"}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-60"
                >
                  {exportState === "loading" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : exportState === "success" ? (
                    <Check className="w-4 h-4 text-[#8B9E8B]" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {exportState === "success" ? "Downloaded" : selected.exportFormat}
                </button>
              </div>

              {/* Metrics Grid */}
              <MetricsComponent />

              {/* Trust Signals */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="font-medium text-gray-600">Trust signals:</span>
                  {data.audience_framings[selectedAudience].trust_signals.map((signal, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      {signal}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
