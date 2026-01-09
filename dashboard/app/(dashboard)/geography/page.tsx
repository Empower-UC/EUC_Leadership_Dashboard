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
import { MapPin, Users, Target } from "lucide-react";
import geographyData from "@/lib/data/geography.json";

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export default function GeographyPage() {
  const data = geographyData.counties;
  const totalParticipants = data.reduce((sum, c) => sum + c.total, 0);
  const totalGraduated = data.reduce((sum, c) => sum + c.graduated, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar
        title="Geography"
        description={`${data.length} counties in Upper Cumberland region`}
      />

      <div className="px-8 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <KPICard
            title="Total Counties"
            value={data.length}
            subtitle="Upper Cumberland region"
            icon={MapPin}
          />
          <KPICard
            title="Largest County"
            value={data[0]?.county || "-"}
            subtitle={`${data[0]?.total || 0} participants`}
            icon={Users}
          />
          <KPICard
            title="Total Participants"
            value={totalParticipants.toLocaleString()}
            subtitle={`${totalGraduated} graduated`}
            icon={Target}
          />
        </div>

        {/* County Table */}
        <section>
          <div className="mb-4">
            <h2 className="text-[15px] font-semibold text-gray-900">County Breakdown</h2>
            <p className="text-sm text-gray-500 mt-0.5">Performance by county</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 border-b border-gray-200">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500">County</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right">Participants</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right">% of Total</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right">Graduated</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right">Active</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right">Avg FPL Change</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.05em] text-gray-500 text-right">Wage Gains</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((county) => {
                  const percentage = totalParticipants > 0
                    ? ((county.total / totalParticipants) * 100).toFixed(1)
                    : "0";
                  const gradRate = county.total > 0
                    ? ((county.graduated / county.total) * 100).toFixed(0)
                    : "0";
                  const fplChange = county.avgFplChange || 0;
                  return (
                    <TableRow key={county.county} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <TableCell className="text-sm font-medium text-gray-900 py-3">
                        {county.county}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900 text-right tabular-nums font-medium py-3">
                        {county.total}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 text-right tabular-nums py-3">
                        {percentage}%
                      </TableCell>
                      <TableCell className="text-right py-3">
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">
                          {county.graduated} ({gradRate}%)
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700 text-right tabular-nums py-3">
                        {county.active}
                      </TableCell>
                      <TableCell className={`text-sm text-right tabular-nums font-semibold py-3 ${fplChange > 0 ? "text-[#8B9E8B]" : "text-gray-600"}`}>
                        {fplChange > 0 ? "+" : ""}{fplChange.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-sm text-gray-900 text-right tabular-nums font-medium py-3">
                        {formatCurrency(county.totalWageGains)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </div>
  );
}
