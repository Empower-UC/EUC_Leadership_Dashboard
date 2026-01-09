import { TrendingUp, Users, DollarSign, Target } from "lucide-react";
import { OverviewClient } from "./overview-client";
import overviewData from "@/lib/data/overview.json";

// Program constants
const PROGRAM_COST = 25_000_000;
const FICA_RATE = 0.153;
const STATE_TAX_RATE = 0.08;

// Benchmarks - FPL improvement comparison (rural/TANF programs)
// EUC: 21.9% avg FPL change from DB (686 families with FPL data)
// Project QUEST: ~20% earnings increase (14-year RCT, San Antonio)
// Building NE Families: Only other rural TANF RCT - showed 0% impact
// Typical TANF: minimal/none per research
const BENCHMARKS = [
  { name: "EUC", value: 22, isEuc: true },
  { name: "Project QUEST (RCT)", value: 20, isEuc: false },
  { name: "Typical TANF", value: 5, isEuc: false },
  { name: "Building NE (RCT)", value: 0, isEuc: false },
];

export default function OverviewPage() {
  const data = {
    totalParticipants: overviewData.totalParticipants,
    totalChildren: overviewData.totalChildren,
    outcomeBreakdown: overviewData.outcomeBreakdown,
    totalWageGains: overviewData.totalWageGains,
    avgFplChange: overviewData.avgFplChange,
    countyBreakdown: overviewData.countyBreakdown,
    improvementRate: overviewData.improvementRate,
  };

  const graduated = data.outcomeBreakdown.find((o) => o.category?.toLowerCase() === "graduated");
  const active = data.outcomeBreakdown.find((o) => o.category?.toLowerCase() === "active");

  const graduationRate = data.totalParticipants > 0
    ? ((graduated?.count || 0) / data.totalParticipants) * 100
    : 0;

  const costPerFamily = PROGRAM_COST / data.totalParticipants;
  const annualTaxRevenue = data.totalWageGains * (FICA_RATE + STATE_TAX_RATE);

  return (
    <OverviewClient
      data={data}
      graduated={graduated?.count || 0}
      active={active?.count || 0}
      graduationRate={graduationRate}
      costPerFamily={costPerFamily}
      annualTaxRevenue={annualTaxRevenue}
      programCost={PROGRAM_COST}
      benchmarks={BENCHMARKS}
    />
  );
}
