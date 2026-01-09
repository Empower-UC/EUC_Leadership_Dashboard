"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Building2,
  Heart,
  Landmark,
  Newspaper,
  Users2,
  ArrowRight,
  Clock,
  FileText
} from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";

const audiences = [
  {
    id: "government",
    title: "State & Local Government",
    subtitle: "Legislators, TANF administrators, state agencies",
    icon: Building2,
    color: "bg-[#1E3A5F]",
    hoverColor: "hover:bg-[#2D4A6F]",
    examples: ["Legislative briefing", "DHS update", "Budget hearing"],
    headline: "Taxpayer ROI focus",
    exportFormat: "Formal Report",
  },
  {
    id: "foundations",
    title: "Private Foundations",
    subtitle: "Kellogg, Ballmer, philanthropic funders",
    icon: Heart,
    color: "bg-[#D4A574]",
    hoverColor: "hover:bg-[#E8C9A8]",
    examples: ["Funder call", "Grant report", "Site visit"],
    headline: "Family outcomes focus",
    exportFormat: "One-Pager",
  },
  {
    id: "federal",
    title: "Federal & Policy",
    subtitle: "HHS, TOPI, policy researchers",
    icon: Landmark,
    color: "bg-[#4A7CCC]",
    hoverColor: "hover:bg-[#6B9BE0]",
    examples: ["Policy brief", "Conference presentation", "Federal review"],
    headline: "Evidence standards focus",
    exportFormat: "Policy Brief",
  },
  {
    id: "media",
    title: "Media & Public",
    subtitle: "Reporters, general public, social media",
    icon: Newspaper,
    color: "bg-[#E07B67]",
    hoverColor: "hover:bg-[#E07B67]/80",
    examples: ["Press inquiry", "Op-ed", "Social post"],
    headline: "Human stories focus",
    exportFormat: "Fact Sheet",
  },
  {
    id: "replicators",
    title: "Peer Organizations",
    subtitle: "Other communities, replicators, field builders",
    icon: Users2,
    color: "bg-[#8B9E8B]",
    hoverColor: "hover:bg-[#8B9E8B]/80",
    examples: ["Learning call", "Replication inquiry", "Field convening"],
    headline: "Implementation focus",
    exportFormat: "Implementation Guide",
  },
];

export default function MeetingPrepPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Topbar
        title="Meeting Prep"
        description="Get the right numbers framed for your audience"
      />

      <div className="px-10 py-10 max-w-5xl">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Who are you meeting with?
          </h1>
          <p className="text-gray-500 max-w-2xl">
            Same data, different framing. Select your audience to see metrics presented
            in the way that matters to them, with methodology ready to go.
          </p>
        </motion.div>

        {/* Audience Cards */}
        <div className="grid gap-4">
          {audiences.map((audience, index) => {
            const Icon = audience.icon;
            return (
              <motion.button
                key={audience.id}
                onClick={() => router.push(`/meeting-prep/${audience.id}`)}
                className={`w-full text-left bg-white rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)] card-hover group`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <div className="flex items-start gap-5">
                  {/* Icon */}
                  <div className={`${audience.color} w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                          {audience.title}
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {audience.subtitle}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                    </div>

                    {/* Details row */}
                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{audience.headline}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Export: {audience.exportFormat}</span>
                      </div>
                    </div>

                    {/* Example uses */}
                    <div className="flex items-center gap-2 mt-3">
                      {audience.examples.map((example) => (
                        <span
                          key={example}
                          className="text-[11px] px-2 py-1 bg-gray-100 text-gray-500 rounded-md"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Footer note */}
        <motion.div
          className="mt-10 p-4 bg-[#4A7CCC]/10 rounded-xl border border-[#4A7CCC]/20"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <p className="text-sm text-[#1E3A5F]">
            <strong>Consistency guarantee:</strong> All views use the same underlying calculations.
            The numbers shown to foundations will match the numbers shown to legislators—only
            the framing and emphasis differs.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
