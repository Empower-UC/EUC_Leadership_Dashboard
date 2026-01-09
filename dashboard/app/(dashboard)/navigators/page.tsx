import { Topbar } from "@/components/dashboard/topbar";
import { KPICard } from "@/components/dashboard/kpi-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Info, Users, Award, UserCheck } from "lucide-react";
import navigatorsData from "@/lib/data/navigators.json";

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function getPerformanceBadge(value: number, avg: number): { label: string; className: string } {
  const diff = ((value - avg) / avg) * 100;
  if (diff > 20) return { label: "High", className: "bg-[#8B9E8B]/10 text-[#8B9E8B]" };
  if (diff > -10) return { label: "Average", className: "bg-gray-100 text-gray-700" };
  return { label: "Below", className: "bg-[#D4A574]/10 text-[#D4A574]" };
}

export default function NavigatorsPage() {
  const data = navigatorsData;

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar
        title="Navigator Performance"
        description={`${data.totalNavigators} navigators serving families`}
      />

      <div className="px-8 py-8 space-y-8">
        {/* Summary Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <KPICard
            title="Total Navigators"
            value={data.totalNavigators}
            icon={UserCheck}
          />
          <KPICard
            title="Avg Caseload"
            value={data.overallStats.avgFamiliesPerNav.toFixed(1)}
            subtitle="families per navigator"
            icon={Users}
          />
          <KPICard
            title="Avg FPL Change"
            value={`+${data.overallStats.avgFplChange.toFixed(1)}%`}
            subtitle="program average"
          />
          <KPICard
            title="Avg Graduation Rate"
            value={`${data.overallStats.avgGraduationRate.toFixed(1)}%`}
            subtitle="program average"
          />
        </div>

        {/* Navigator Table */}
        <section>
          <div className="mb-4">
            <h2 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              Navigator Performance Details
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Navigators with 5+ families assigned (for statistical reliability)</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 border-b border-gray-200">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500">Navigator</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right">Families</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right">Graduated</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right">Avg FPL Change</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right">Performance</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right">Wage Gains</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right">Avg Days</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.navigatorStats.map((nav) => {
                  const gradRate = nav.familyCount > 0
                    ? (nav.graduatedCount / nav.familyCount) * 100
                    : 0;
                  const fplChange = nav.avgFplChange || 0;
                  const performance = getPerformanceBadge(fplChange, data.overallStats.avgFplChange);

                  return (
                    <TableRow key={nav.navigatorName} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <TableCell className="text-sm font-medium text-gray-900 py-3">{nav.navigatorName}</TableCell>
                      <TableCell className="text-sm text-gray-900 text-right tabular-nums font-medium py-3">{nav.familyCount}</TableCell>
                      <TableCell className="text-sm text-gray-700 text-right tabular-nums py-3">
                        {nav.graduatedCount} ({gradRate.toFixed(0)}%)
                      </TableCell>
                      <TableCell className={`text-sm text-right tabular-nums font-semibold py-3 ${fplChange > 0 ? "text-[#8B9E8B]" : "text-gray-600"}`}>
                        {fplChange > 0 ? "+" : ""}{fplChange.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${performance.className}`}>
                          {performance.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-900 text-right tabular-nums font-medium py-3">
                        {formatCurrency(nav.totalWageGains)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700 text-right tabular-nums py-3">
                        {nav.avgDays.toFixed(0)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Top Performers */}
        <div className="grid gap-6 md:grid-cols-2">
          <section>
            <div className="mb-4">
              <h2 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
                <Award className="h-4 w-4 text-[#8B9E8B]" />
                Top Performers (by FPL Change)
              </h2>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="space-y-4">
                {data.navigatorStats.slice(0, 5).map((nav, index) => (
                  <div key={nav.navigatorName} className="flex items-center gap-4">
                    <span className="text-lg font-bold text-gray-400 w-6 tabular-nums">
                      {index + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{nav.navigatorName}</p>
                      <p className="text-xs text-gray-500">{nav.familyCount} families</p>
                    </div>
                    <span className="text-[#8B9E8B] font-semibold tabular-nums">
                      +{nav.avgFplChange.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="mb-4">
              <h2 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-600" />
                Largest Caseloads
              </h2>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="space-y-4">
                {[...data.navigatorStats]
                  .sort((a, b) => b.familyCount - a.familyCount)
                  .slice(0, 5)
                  .map((nav, index) => (
                    <div key={nav.navigatorName} className="flex items-center gap-4">
                      <span className="text-lg font-bold text-gray-400 w-6 tabular-nums">
                        {index + 1}.
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{nav.navigatorName}</p>
                        <p className="text-xs text-gray-500">+{nav.avgFplChange.toFixed(1)}% avg FPL</p>
                      </div>
                      <span className="font-semibold text-gray-900 tabular-nums">
                        {nav.familyCount} families
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-5">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">Interpretation Caution</p>
              <p className="text-sm text-amber-800 mt-1">
                Caseload composition varies significantly. Some navigators may serve harder-to-help
                populations (deeper poverty, more barriers, rural isolation). Lower aggregate outcomes
                may reflect population challenges, not navigator effectiveness.
              </p>
              <p className="text-sm text-amber-800 mt-2">
                Use these metrics to identify potential best practices and support needs—not for
                performance evaluation without qualitative context.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
