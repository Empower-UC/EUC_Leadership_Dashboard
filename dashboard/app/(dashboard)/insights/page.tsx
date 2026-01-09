import { Topbar } from "@/components/dashboard/topbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Info, TrendingUp, Users, Clock, MapPin, AlertTriangle, Target, Home, Award } from "lucide-react";
import insightsData from "@/lib/data/insights.json";

export default function InsightsPage() {
  const data = insightsData;
  const successFactors = data.successFactors;

  const durationOrder = ["0-3 mo", "3-6 mo", "6-9 mo", "9-12 mo", "12-18 mo", "18+ mo"];
  const sortedDurationBins = [...data.durationBins].sort(
    (a, b) => durationOrder.indexOf(a.durationBin) - durationOrder.indexOf(b.durationBin)
  );

  const bestFplTercile = data.fplTerciles.length > 0
    ? data.fplTerciles.reduce((best, current) =>
        (current.avgFplChange > best.avgFplChange) ? current : best
      , data.fplTerciles[0])
    : null;

  const topCounties = data.countyPerformance.slice(0, 3);
  const bottomCounties = [...data.countyPerformance].slice(-3).reverse();

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar
        title="Insights"
        description="Who benefits most and what predicts success"
      />

      <div className="px-8 py-8 space-y-8">
        {/* Success Predictors - Top section for funders */}
        {successFactors && (
          <section>
            <div className="mb-4">
              <h2 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
                <Award className="h-4 w-4 text-[#8B9E8B]" />
                Success Predictors: Who Graduates?
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {successFactors.totalGraduates} families have reached 225%+ FPL ({successFactors.overallGraduationRate}% graduation rate)
              </p>
            </div>

            {/* Key Insights Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              {successFactors.keyInsights.filter((i: string) => i).map((insight: string, idx: number) => (
                <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-8">
              {/* By Entry FPL */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="h-4 w-4 text-gray-400" />
                  Graduation Rate by Entry Income Level
                </h3>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 border-b border-gray-200">
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500">Entry FPL</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right">Families</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right">Graduates</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right">Graduation Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {successFactors.byEntryFpl.map((row: { bracket: string; families: number; graduates: number; graduationRate: number }) => (
                        <TableRow key={row.bracket} className="border-b border-gray-100 last:border-0">
                          <TableCell className="text-sm font-medium text-gray-900 py-3">{row.bracket}</TableCell>
                          <TableCell className="text-sm text-gray-700 text-right tabular-nums py-3">{row.families}</TableCell>
                          <TableCell className="text-sm text-gray-700 text-right tabular-nums py-3">{row.graduates}</TableCell>
                          <TableCell className={`text-sm text-right tabular-nums font-semibold py-3 ${row.graduationRate >= 10 ? "text-[#8B9E8B]" : "text-gray-600"}`}>
                            {row.graduationRate.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* By Household Size */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Home className="h-4 w-4 text-gray-400" />
                  Graduation Rate by Household Size
                </h3>
                <div className="space-y-2">
                  {successFactors.byHouseholdSize.map((row: { householdSize: number; families: number; graduates: number; graduationRate: number }) => {
                    const maxRate = Math.max(...successFactors.byHouseholdSize.map((r: { graduationRate: number }) => r.graduationRate));
                    const barWidth = maxRate > 0 ? (row.graduationRate / maxRate) * 100 : 0;
                    return (
                      <div key={row.householdSize} className="flex items-center gap-4">
                        <div className="w-24 text-sm text-gray-500">{row.householdSize} people</div>
                        <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden relative">
                          <div
                            className="h-full bg-[#8B9E8B] rounded transition-all duration-500"
                            style={{ width: `${Math.max(barWidth, 5)}%` }}
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600">
                            n={row.families}
                          </span>
                        </div>
                        <div className="w-20 text-sm text-right tabular-nums font-semibold">
                          {row.graduationRate.toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* By Duration */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  Graduation Rate by Time in Program
                </h3>
                <div className="space-y-2">
                  {successFactors.byDuration.map((row: { duration: string; families: number; graduates: number; graduationRate: number }) => {
                    const maxRate = Math.max(...successFactors.byDuration.map((r: { graduationRate: number }) => r.graduationRate));
                    const barWidth = maxRate > 0 ? (row.graduationRate / maxRate) * 100 : 0;
                    return (
                      <div key={row.duration} className="flex items-center gap-4">
                        <div className="w-24 text-sm text-gray-500">{row.duration}</div>
                        <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden relative">
                          <div
                            className="h-full bg-gray-900 rounded transition-all duration-500"
                            style={{ width: `${Math.max(barWidth, 5)}%` }}
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600">
                            n={row.families}
                          </span>
                        </div>
                        <div className="w-20 text-sm text-right tabular-nums font-semibold">
                          {row.graduationRate.toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 p-4 bg-[#8B9E8B]/10 border border-[#8B9E8B]/30 rounded-lg flex items-start gap-3">
                  <TrendingUp className="h-4 w-4 text-[#8B9E8B] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-[#1E3A5F]">
                    <strong>Optimal window:</strong> 12-18 months yields highest graduation rate (16%).
                    Families under 6 months are still building momentum.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Who Benefits Most */}
        <section>
          <div className="mb-4">
            <h2 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              Who Benefits Most?
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Subgroup analysis to identify which participants show greatest gains</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-8">
            {/* By Starting FPL */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">By Starting Income Level</h3>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 border-b border-gray-200">
                      <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500">Income Bracket</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right">Count</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right">Avg Starting FPL</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right">Avg FPL Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.fplTerciles
                      .sort((a, b) => {
                        const order = ["Deep Poverty (<50%)", "Poverty (50-100%)", "Near Poverty (>100%)"];
                        return order.indexOf(a.tercile) - order.indexOf(b.tercile);
                      })
                      .map((row) => (
                        <TableRow key={row.tercile} className="border-b border-gray-100 last:border-0">
                          <TableCell className="text-sm font-medium text-gray-900 py-3">{row.tercile}</TableCell>
                          <TableCell className="text-sm text-gray-700 text-right tabular-nums py-3">{row.count}</TableCell>
                          <TableCell className="text-sm text-gray-700 text-right tabular-nums py-3">{row.avgStartFpl}%</TableCell>
                          <TableCell className={`text-sm text-right tabular-nums font-semibold py-3 ${row.avgFplChange > 0 ? "text-[#8B9E8B]" : "text-gray-600"}`}>
                            {row.avgFplChange > 0 ? "+" : ""}{row.avgFplChange.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
              {bestFplTercile && (
                <div className="mt-4 p-4 bg-[#8B9E8B]/10 border border-[#8B9E8B]/30 rounded-lg flex items-start gap-3">
                  <TrendingUp className="h-4 w-4 text-[#8B9E8B] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-[#1E3A5F]">
                    <strong>Insight:</strong> Participants in "{bestFplTercile.tercile}" show the highest
                    average FPL gains (+{bestFplTercile.avgFplChange.toFixed(1)}%).
                  </p>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Duration-Outcome Analysis */}
        <section>
          <div className="mb-4">
            <h2 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              Does Duration Matter?
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Relationship between time in program and outcomes</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="space-y-3">
              {sortedDurationBins.map((bin) => {
                const fplChange = bin.avgFplChange || 0;
                const maxChange = Math.max(...sortedDurationBins.map(b => b.avgFplChange || 0));
                const barWidth = maxChange > 0 ? (fplChange / maxChange) * 100 : 0;

                return (
                  <div key={bin.durationBin} className="flex items-center gap-4">
                    <div className="w-20 text-sm text-gray-500">
                      {bin.durationBin}
                    </div>
                    <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden relative">
                      <div
                        className="h-full bg-gray-900 rounded transition-all duration-500"
                        style={{ width: `${Math.max(barWidth, 5)}%` }}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600">
                        n={bin.count}
                      </span>
                    </div>
                    <div className="w-20 text-sm text-right tabular-nums font-semibold">
                      <span className={fplChange > 0 ? "text-[#8B9E8B]" : "text-gray-600"}>
                        {fplChange > 0 ? "+" : ""}{fplChange.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-blue-50/50 border border-blue-200 rounded-lg flex items-start gap-3">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                <strong>Research context:</strong> EMPath research suggests 3-5 year relationships produce
                best outcomes. Short-term case management (3-6 months) can cause harm by creating
                dependency without sustainable change.
              </p>
            </div>
          </div>
        </section>

        {/* County Performance Variation */}
        <section>
          <div className="mb-4">
            <h2 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              County Performance Variation
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Geographic variation in outcomes (counties with 10+ participants)</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Top Performers */}
              <div>
                <h3 className="text-sm font-medium text-[#8B9E8B] mb-4">Top Performing</h3>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 border-b border-gray-200">
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500">County</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right">n</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right">Avg FPL Change</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topCounties.map((county) => (
                        <TableRow key={county.county} className="border-b border-gray-100 last:border-0">
                          <TableCell className="text-sm font-medium text-gray-900 py-3">{county.county}</TableCell>
                          <TableCell className="text-sm text-gray-700 text-right tabular-nums py-3">{county.count}</TableCell>
                          <TableCell className="text-sm text-[#8B9E8B] text-right tabular-nums font-semibold py-3">
                            +{county.avgFplChange.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Bottom Performers */}
              <div>
                <h3 className="text-sm font-medium text-amber-700 mb-4">Needs Attention</h3>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 border-b border-gray-200">
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500">County</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right">n</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right">Avg FPL Change</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bottomCounties.map((county) => (
                        <TableRow key={county.county} className="border-b border-gray-100 last:border-0">
                          <TableCell className="text-sm font-medium text-gray-900 py-3">{county.county}</TableCell>
                          <TableCell className="text-sm text-gray-700 text-right tabular-nums py-3">{county.count}</TableCell>
                          <TableCell className="text-sm text-gray-700 text-right tabular-nums font-medium py-3">
                            {county.avgFplChange > 0 ? "+" : ""}{county.avgFplChange.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {topCounties.length > 0 && (
              <div className="mt-6 p-4 bg-amber-50/50 border border-amber-200 rounded-lg flex items-start gap-3">
                <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  <strong>Action:</strong> Investigate what {topCounties[0]?.county} is doing differently.
                  Their +{topCounties[0]?.avgFplChange.toFixed(1)}% average could inform best practices.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Data Gaps */}
        <section>
          <div className="mb-4">
            <h2 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Data Gaps Affecting Analysis
            </h2>
          </div>
          <div className="bg-white rounded-xl border border-amber-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-amber-50/30 border-b border-amber-200">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-amber-700">Missing Data</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-amber-700">Impact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-b border-amber-100">
                  <TableCell className="text-sm font-medium text-gray-900 py-3">Benefits exit dates</TableCell>
                  <TableCell className="text-sm text-gray-600 py-3">Can't calculate government ROI from benefits savings</TableCell>
                </TableRow>
                <TableRow className="border-b border-amber-100">
                  <TableCell className="text-sm font-medium text-gray-900 py-3">Circles participation</TableCell>
                  <TableCell className="text-sm text-gray-600 py-3">Can't validate social capital pillar</TableCell>
                </TableRow>
                <TableRow className="border-b border-amber-100">
                  <TableCell className="text-sm font-medium text-gray-900 py-3">Current employment status</TableCell>
                  <TableCell className="text-sm text-gray-600 py-3">Employment change unknown</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-sm font-medium text-gray-900 py-3">Cliff navigation events</TableCell>
                  <TableCell className="text-sm text-gray-600 py-3">Can't prove cliff tool value</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </div>
  );
}
