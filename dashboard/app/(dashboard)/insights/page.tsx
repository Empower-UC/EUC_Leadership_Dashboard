import { Topbar } from "@/components/dashboard/topbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, Clock, MapPin, Award, Users, Home } from "lucide-react";
import insightsData from "@/lib/data/insights.json";

export default function InsightsPage() {
  const data = insightsData;
  const successFactors = data.successFactors;

  const topCounties = data.countyPerformance.slice(0, 5);
  const bottomCounties = [...data.countyPerformance].slice(-3).reverse();

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar
        title="Insights"
        description="Who succeeds and what predicts outcomes"
      />

      <div className="px-8 py-8 space-y-8">
        {/* Hero Stats */}
        {successFactors && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#1E3A5F]/5 flex items-center justify-center">
                  <Award className="h-4 w-4 text-[#1E3A5F]" />
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Graduates</span>
              </div>
              <div className="text-2xl font-semibold text-gray-900 tabular-nums">{successFactors.totalGraduates}</div>
              <p className="text-sm text-gray-500 mt-1">{successFactors.overallGraduationRate}% graduation rate</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#8B9E8B]/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-[#8B9E8B]" />
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg FPL Change</span>
              </div>
              <div className="text-2xl font-semibold text-[#8B9E8B] tabular-nums">+{data.avgFplChange}%</div>
              <p className="text-sm text-gray-500 mt-1">across all participants</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#1E3A5F]/5 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-[#1E3A5F]" />
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg Duration</span>
              </div>
              <div className="text-2xl font-semibold text-gray-900 tabular-nums">{Math.round(data.avgDays / 30)} mo</div>
              <p className="text-sm text-gray-500 mt-1">{data.avgDays} days in program</p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Graduation by Entry FPL */}
          {successFactors && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-900">By Entry Income</h2>
              </div>
              <p className="text-xs text-gray-500 mb-5">Graduation rate by starting FPL bracket</p>

              <div className="space-y-3">
                {successFactors.byEntryFpl.map((row: { bracket: string; families: number; graduates: number; graduationRate: number }) => {
                  const maxRate = Math.max(...successFactors.byEntryFpl.map((r: { graduationRate: number }) => r.graduationRate));
                  const barWidth = maxRate > 0 ? (row.graduationRate / maxRate) * 100 : 0;
                  return (
                    <div key={row.bracket} className="flex items-center gap-3">
                      <div className="w-36 text-sm text-gray-600 truncate">{row.bracket}</div>
                      <div className="flex-1 h-7 bg-gray-100 rounded-md overflow-hidden relative">
                        <div
                          className="h-full bg-[#1E3A5F] rounded-md transition-all duration-500"
                          style={{ width: `${Math.max(barWidth, 4)}%` }}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-500">
                          n={row.families}
                        </span>
                      </div>
                      <div className="w-14 text-sm text-right tabular-nums font-medium text-gray-900">
                        {row.graduationRate.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">Key finding:</span> Families entering above 150% FPL show 31% graduation rate — 10x higher than deep poverty.
                </p>
              </div>
            </div>
          )}

          {/* Graduation by Duration */}
          {successFactors && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-900">By Time in Program</h2>
              </div>
              <p className="text-xs text-gray-500 mb-5">Graduation rate by program duration</p>

              <div className="space-y-3">
                {successFactors.byDuration.map((row: { duration: string; families: number; graduates: number; graduationRate: number }) => {
                  const maxRate = Math.max(...successFactors.byDuration.map((r: { graduationRate: number }) => r.graduationRate));
                  const barWidth = maxRate > 0 ? (row.graduationRate / maxRate) * 100 : 0;
                  return (
                    <div key={row.duration} className="flex items-center gap-3">
                      <div className="w-36 text-sm text-gray-600">{row.duration}</div>
                      <div className="flex-1 h-7 bg-gray-100 rounded-md overflow-hidden relative">
                        <div
                          className="h-full bg-[#8B9E8B] rounded-md transition-all duration-500"
                          style={{ width: `${Math.max(barWidth, 4)}%` }}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-500">
                          n={row.families}
                        </span>
                      </div>
                      <div className="w-14 text-sm text-right tabular-nums font-medium text-gray-900">
                        {row.graduationRate.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">Optimal window:</span> 12-18 months yields highest graduation rate (16%). Early exits miss the maturation effect.
                </p>
              </div>
            </div>
          )}

          {/* Graduation by Household Size */}
          {successFactors && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-1">
                <Home className="h-4 w-4 text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-900">By Household Size</h2>
              </div>
              <p className="text-xs text-gray-500 mb-5">Graduation rate by family composition</p>

              <div className="space-y-3">
                {successFactors.byHouseholdSize.slice(0, 5).map((row: { householdSize: number; families: number; graduates: number; graduationRate: number }) => {
                  const maxRate = Math.max(...successFactors.byHouseholdSize.map((r: { graduationRate: number }) => r.graduationRate));
                  const barWidth = maxRate > 0 ? (row.graduationRate / maxRate) * 100 : 0;
                  return (
                    <div key={row.householdSize} className="flex items-center gap-3">
                      <div className="w-36 text-sm text-gray-600">{row.householdSize} people</div>
                      <div className="flex-1 h-7 bg-gray-100 rounded-md overflow-hidden relative">
                        <div
                          className="h-full bg-[#D4A574] rounded-md transition-all duration-500"
                          style={{ width: `${Math.max(barWidth, 4)}%` }}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-500">
                          n={row.families}
                        </span>
                      </div>
                      <div className="w-14 text-sm text-right tabular-nums font-medium text-gray-900">
                        {row.graduationRate.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">Challenge:</span> Larger households face compounded childcare costs and benefit cliff exposure.
                </p>
              </div>
            </div>
          )}

          {/* FPL Change by Starting Level */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">FPL Change by Starting Level</h2>
            </div>
            <p className="text-xs text-gray-500 mb-5">Average improvement by entry income bracket</p>

            <div className="space-y-3">
              {data.fplTerciles
                .sort((a, b) => {
                  const order = ["Deep Poverty (<50%)", "Poverty (50-100%)", "Near Poverty (>100%)"];
                  return order.indexOf(a.tercile) - order.indexOf(b.tercile);
                })
                .map((row) => {
                  const maxChange = Math.max(...data.fplTerciles.map(r => r.avgFplChange));
                  const barWidth = maxChange > 0 ? (row.avgFplChange / maxChange) * 100 : 0;
                  return (
                    <div key={row.tercile} className="flex items-center gap-3">
                      <div className="w-36 text-sm text-gray-600 truncate">{row.tercile}</div>
                      <div className="flex-1 h-7 bg-gray-100 rounded-md overflow-hidden relative">
                        <div
                          className="h-full bg-[#8B9E8B] rounded-md transition-all duration-500"
                          style={{ width: `${Math.max(barWidth, 4)}%` }}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-500">
                          n={row.count}
                        </span>
                      </div>
                      <div className="w-14 text-sm text-right tabular-nums font-medium text-[#8B9E8B]">
                        +{row.avgFplChange.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">Paradox:</span> Deep poverty shows highest FPL gains but lowest graduation rates — more room to grow, but harder to reach 225%.
              </p>
            </div>
          </div>
        </div>

        {/* County Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">County Performance</h2>
          </div>
          <p className="text-xs text-gray-500 mb-5">Geographic variation in outcomes (counties with 10+ participants)</p>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Performers */}
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Top Performing</h3>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80">
                      <TableHead className="text-[11px] font-medium text-gray-500">County</TableHead>
                      <TableHead className="text-[11px] font-medium text-gray-500 text-right">Families</TableHead>
                      <TableHead className="text-[11px] font-medium text-gray-500 text-right">Avg FPL Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topCounties.map((county, idx) => (
                      <TableRow key={county.county} className={idx < topCounties.length - 1 ? "border-b border-gray-100" : ""}>
                        <TableCell className="text-sm text-gray-900 py-2.5">{county.county}</TableCell>
                        <TableCell className="text-sm text-gray-600 text-right tabular-nums py-2.5">{county.count}</TableCell>
                        <TableCell className="text-sm text-[#8B9E8B] text-right tabular-nums font-medium py-2.5">
                          +{county.avgFplChange.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Needs Attention */}
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Needs Attention</h3>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80">
                      <TableHead className="text-[11px] font-medium text-gray-500">County</TableHead>
                      <TableHead className="text-[11px] font-medium text-gray-500 text-right">Families</TableHead>
                      <TableHead className="text-[11px] font-medium text-gray-500 text-right">Avg FPL Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bottomCounties.map((county, idx) => (
                      <TableRow key={county.county} className={idx < bottomCounties.length - 1 ? "border-b border-gray-100" : ""}>
                        <TableCell className="text-sm text-gray-900 py-2.5">{county.county}</TableCell>
                        <TableCell className="text-sm text-gray-600 text-right tabular-nums py-2.5">{county.count}</TableCell>
                        <TableCell className="text-sm text-gray-600 text-right tabular-nums py-2.5">
                          {county.avgFplChange > 0 ? "+" : ""}{county.avgFplChange.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">Action:</span> Investigate what {topCounties[0]?.county} is doing differently — their +{topCounties[0]?.avgFplChange.toFixed(1)}% average could inform best practices across the region.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
