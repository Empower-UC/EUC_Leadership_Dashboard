import { FundraisingClient } from "./fundraising-client";
import fundraisingData from "@/lib/data/fundraising-insights.json";
import temporalData from "@/lib/data/temporal-insights.json";

export const metadata = {
  title: "Fundraising Intelligence | EUC Dashboard",
  description: "Predictive analytics and cohort variance analysis for funder engagement",
};

export default function FundraisingPage() {
  // Type assertion for the imported JSON
  const data = fundraisingData as Parameters<typeof FundraisingClient>[0]["data"];

  // Transform temporal data to match expected format
  const temporal = {
    tenure_analysis: temporalData.tenure_analysis.data.map((item) => ({
      bracket: item.bracket,
      count: item.count,
      success_rate: item.success_rate,
      avg_wage_gain: item.avg_wage_gain,
      avg_fpl_change: item.avg_fpl_change,
      avg_days: item.avg_days,
    })),
    cumulative_impact: temporalData.cumulative_impact,
  } as NonNullable<Parameters<typeof FundraisingClient>[0]["temporalData"]>;

  return <FundraisingClient data={data} temporalData={temporal} />;
}
