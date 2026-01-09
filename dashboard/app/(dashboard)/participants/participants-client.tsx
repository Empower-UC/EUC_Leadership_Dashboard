"use client";

import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, DollarSign, Users, Target } from "lucide-react";
import { ParticipantsTable } from "./participants-table";
import { ExportButton } from "@/components/ui/export-button";
import { SpringCounter, SpringCurrency } from "@/components/ui/spring-counter";

type ParticipantRow = {
  id: string;
  participantId: string;
  county: string;
  enrollmentStatus: string | null;
  enrollmentDate: Date | null;
  navigatorName: string | null;
  householdSize: number | null;
  fplAtEnrollment: number | null;
  currentFpl: number | null;
  fplChange: number | null;
  wageChange: number | null;
  daysInProgram: number | null;
  outcomeCategory: string | null;
};

interface ParticipantsClientProps {
  data: ParticipantRow[];
  metrics: {
    totalFamilies: number;
    totalWageGains: number;
    avgFplChange: number;
    positiveOutcomes: number;
  };
}

function PortfolioMetric({
  icon: Icon,
  label,
  value,
  subtitle,
  color = "gray",
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  subtitle?: string;
  color?: "gray" | "green" | "blue";
}) {
  const colorClasses = {
    gray: "bg-gray-100 text-gray-600",
    green: "bg-[#8B9E8B]/20 text-[#8B9E8B]",
    blue: "bg-[#4A7CCC]/20 text-[#4A7CCC]",
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
          {label}
        </p>
        <p className="text-lg font-bold font-data text-gray-900">{value}</p>
        {subtitle && <p className="text-[10px] text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}

export function ParticipantsClient({ data, metrics }: ParticipantsClientProps) {
  const prefersReducedMotion = useReducedMotion();

  // Prepare export data
  const exportData = data.map((row) => ({
    id: row.participantId,
    county: row.county,
    status: row.outcomeCategory || "",
    fplAtEnrollment: row.fplAtEnrollment,
    currentFpl: row.currentFpl,
    fplChange: row.fplChange,
    wageChange: row.wageChange,
    daysInProgram: row.daysInProgram,
    navigator: row.navigatorName || "",
  }));

  const successRate = metrics.totalFamilies > 0
    ? (metrics.positiveOutcomes / metrics.totalFamilies) * 100
    : 0;

  return (
    <div className="min-h-screen bg-[#F4F7F9]">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-semibold text-gray-900">Participant Outcomes</h1>
            <p className="text-sm text-gray-500">Family economic progress tracking</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 font-mono">
              {metrics.totalFamilies.toLocaleString()} families
            </span>
            <ExportButton data={exportData} filename="euc-participant-outcomes" />
          </div>
        </div>
      </div>

      {/* Summary Bar */}
      <motion.div
        className="bg-white border-b border-gray-200 px-8 py-4"
        initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <PortfolioMetric
              icon={Users}
              label="Families"
              value={<SpringCounter value={metrics.totalFamilies} decimals={0} />}
              color="gray"
            />
            <div className="w-px h-10 bg-gray-200" />
            <PortfolioMetric
              icon={DollarSign}
              label="Total Gains"
              value={<SpringCurrency value={metrics.totalWageGains} />}
              color="green"
            />
            <div className="w-px h-10 bg-gray-200" />
            <PortfolioMetric
              icon={TrendingUp}
              label="Avg FPL Delta"
              value={
                <span className={metrics.avgFplChange >= 0 ? "text-[#8B9E8B]" : "text-[#E07B67]"}>
                  {metrics.avgFplChange >= 0 ? "+" : ""}<SpringCounter value={metrics.avgFplChange} decimals={1} />%
                </span>
              }
              color="blue"
            />
            <div className="w-px h-10 bg-gray-200" />
            <PortfolioMetric
              icon={Target}
              label="Success Rate"
              value={
                <span className="text-[#8B9E8B]">
                  <SpringCounter value={successRate} decimals={1} />%
                </span>
              }
              subtitle={`${metrics.positiveOutcomes} positive`}
              color="green"
            />
          </div>

          {/* Performance indicator */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#8B9E8B] animate-pulse" />
            <span className="text-xs text-gray-500 font-mono">Live Data</span>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <div className="px-8 py-6">
        <ParticipantsTable data={data} />
      </div>
    </div>
  );
}
