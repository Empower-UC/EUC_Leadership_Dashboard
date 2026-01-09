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
import { TrendingUp, ArrowUpRight, ArrowDownRight, Info } from "lucide-react";
import outcomesData from "@/lib/data/outcomes.json";

function formatNumber(value: number | string | null, decimals = 1): string {
  if (value === null) return "-";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return num.toFixed(decimals);
}

export default function OutcomesPage() {
  const { overallStats, outcomeBreakdown, thresholdCrossings, fplBrackets } = outcomesData;

  const improvementRate = overallStats.total > 0
    ? ((overallStats.positiveChanges / overallStats.total) * 100).toFixed(1)
    : "0";

  const reframedOutcomes = outcomeBreakdown.map((o) => ({
    ...o,
    displayName: o.category?.toLowerCase() === "dismissed" ? "Transitioned Out" : o.category,
  }));

  return (
    <div className="min-h-screen bg-[#F4F7F9]">
      <Topbar
        title="Outcomes"
        description="Program impact and participant progress"
      />

      <div className="px-10 py-10 space-y-10 max-w-7xl">
        {/* Summary KPIs */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Avg FPL Change"
            value={`+${formatNumber(overallStats.avgFplChange)}%`}
            subtitle="Average improvement"
            icon={TrendingUp}
          />
          <KPICard
            title="Improvement Rate"
            value={`${improvementRate}%`}
            subtitle="Families with positive FPL change"
          />
          <KPICard
            title="Avg Days in Program"
            value={formatNumber(overallStats.avgDays, 0)}
            subtitle="Average program duration"
          />
          <KPICard
            title="Total Wage Gains"
            value={`$${(overallStats.totalWageGains / 1000000).toFixed(1)}M`}
            subtitle="Cumulative wage increases"
          />
        </div>

        {/* Threshold Crossings */}
        <section>
          <div className="mb-4">
            <h2 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              Benefit Cliff Crossings
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Movement across key FPL thresholds (Tennessee)
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-[0_1px_3px_0_rgb(15_23_42/0.08)] overflow-hidden card-hover">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 border-b border-gray-200">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 py-4 px-6">Threshold</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right py-4 px-6">FPL %</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right py-4 px-6">Started Below</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right py-4 px-6">Crossed Up</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right py-4 px-6">Crossed Down</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right py-4 px-6">Net Movement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {thresholdCrossings.map((threshold) => (
                  <TableRow key={threshold.name} className="border-b border-gray-100 last:border-0 table-row-hover">
                    <TableCell className="py-4 px-6">
                      <div className="text-sm font-medium text-gray-900">{threshold.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{threshold.benefit}</div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 text-right tabular-nums py-4 px-6">{threshold.fpl}%</TableCell>
                    <TableCell className="text-sm text-gray-700 text-right tabular-nums py-4 px-6">{threshold.startedBelow}</TableCell>
                    <TableCell className="text-right py-4 px-6">
                      <span className="text-[#8B9E8B] text-sm font-medium tabular-nums flex items-center justify-end gap-1">
                        <ArrowUpRight className="h-3 w-3" />
                        {threshold.crossedUp}
                      </span>
                    </TableCell>
                    <TableCell className="text-right py-4 px-6">
                      <span className="text-red-600 text-sm font-medium tabular-nums flex items-center justify-end gap-1">
                        <ArrowDownRight className="h-3 w-3" />
                        {threshold.crossedDown}
                      </span>
                    </TableCell>
                    <TableCell className="text-right py-4 px-6">
                      <span className={`text-sm font-semibold tabular-nums ${threshold.netMovement > 0 ? "text-[#8B9E8B]" : threshold.netMovement < 0 ? "text-[#E07B67]" : "text-gray-600"}`}>
                        {threshold.netMovement > 0 ? "+" : ""}{threshold.netMovement}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4 bg-blue-50/50 border-t border-blue-100">
              <p className="text-sm text-blue-800 flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Cliff crossings matter because they represent real policy milestones. Crossing 100% FPL means exiting federal poverty; crossing 225% triggers EUC graduation.</span>
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Outcomes by Category */}
          <section>
            <div className="mb-6">
              <h2 className="text-[15px] font-semibold text-gray-900">By Outcome Status</h2>
              <p className="text-sm text-gray-500 mt-1">All participants show gains, even those who transitioned out</p>
            </div>
            <div className="bg-white rounded-2xl shadow-[0_1px_3px_0_rgb(15_23_42/0.08)] overflow-hidden card-hover p-2">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100">
                    <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-400 py-5 px-8">Status</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-400 text-center py-5 px-8">Count</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-400 text-right py-5 px-8">Avg FPL Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reframedOutcomes
                    .sort((a, b) => {
                      const order = ["graduated", "active", "exited", "Transitioned Out", "withdrawn"];
                      return order.indexOf(a.displayName?.toLowerCase() || "") - order.indexOf(b.displayName?.toLowerCase() || "");
                    })
                    .map((row) => (
                      <TableRow key={row.category || "unknown"} className="border-b border-gray-50 last:border-0 table-row-hover">
                        <TableCell className="text-[15px] font-medium text-gray-900 capitalize py-6 px-8">
                          {row.displayName || "Unknown"}
                        </TableCell>
                        <TableCell className="text-[15px] text-gray-900 text-center tabular-nums font-semibold py-6 px-8">{row.count}</TableCell>
                        <TableCell className={`text-[15px] text-right tabular-nums font-semibold py-6 px-8 ${row.avgFplChange > 0 ? "text-[#8B9E8B]" : row.avgFplChange < 0 ? "text-[#E07B67]" : "text-gray-600"}`}>
                          {row.avgFplChange > 0 ? "+" : ""}{formatNumber(row.avgFplChange)}%
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </section>

          {/* Current FPL Distribution */}
          <section>
            <div className="mb-6">
              <h2 className="text-[15px] font-semibold text-gray-900">Current FPL Distribution</h2>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)] card-hover">
              <div className="space-y-5">
                {fplBrackets
                  .sort((a, b) => {
                    const order = ["<100%", "100-150%", "150-200%", "200-250%", "250%+"];
                    return order.indexOf(a.bracket) - order.indexOf(b.bracket);
                  })
                  .map((bracket) => {
                    const total = fplBrackets.reduce((sum, b) => sum + b.count, 0);
                    const percentage = total > 0 ? (bracket.count / total) * 100 : 0;
                    return (
                      <div key={bracket.bracket} className="flex items-center gap-4 group">
                        <div className="w-24 text-sm text-gray-500 font-medium">
                          {bracket.bracket}
                        </div>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gray-900 rounded-full transition-all duration-500 group-hover:bg-[#4A7CCC]"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="w-32 text-sm text-right tabular-nums">
                          <span className="font-semibold text-gray-900">{bracket.count}</span>
                          <span className="text-gray-500 ml-1">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <p className="text-xs text-gray-400 mt-8">
                FPL = Federal Poverty Level. 100% = poverty line, 225% = EUC graduation threshold.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
