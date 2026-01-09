import { ROIClient } from "./roi-client";
import roiData from "@/lib/data/roi-calculations.json";

export const metadata = {
  title: "ROI Analysis | EUC Dashboard",
  description: "Multi-tier return on investment analysis with sensitivity analysis",
};

// Map FPL distribution keys to labels
const tierLabels: Record<string, string> = {
  extreme_poverty: "Extreme Poverty (<50%)",
  deep_poverty: "Deep Poverty (50-100%)",
  snap_tenncare: "SNAP/TennCare Zone (100-130%)",
  liheap_childcare: "LIHEAP/Childcare Zone (130-150%)",
  deep_cliff: "Deep Cliff Zone (150-185%)",
  near_graduation: "Near Graduation (185-225%)",
  graduated: "Graduated (225%+)",
  unknown: "Unknown FPL",
};

export default function ROIPage() {
  // Transform fpl_distribution into fpl_tiers format expected by client
  const totalCount = Object.values(roiData.fpl_distribution).reduce((a, b) => a + b, 0);
  const fplTiers: Record<string, { label: string; count: number; percentage: number; avg_wage_gain: number }> = {};

  for (const [key, count] of Object.entries(roiData.fpl_distribution)) {
    fplTiers[key] = {
      label: tierLabels[key] || key,
      count,
      percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
      avg_wage_gain: 0, // Not available per-tier in current data
    };
  }

  // Transform data_quality to expected structure
  const dataQuality = {
    total_enrolled_baseline: roiData.data_quality.total_participants,
    total_in_monthly_review: roiData.data_quality.participants_with_wage_data,
    income_data: {
      has_wage_change_data: roiData.data_quality.participants_with_wage_data,
      completeness_rate: roiData.data_quality.positive_rate_pct,
    },
    children_data: {
      total_children_estimated: roiData.measured_outcomes.children.total_estimated,
      avg_children_per_family: roiData.measured_outcomes.children.avg_per_family,
    },
    wage_data_quality: {
      positive_wage_gains: roiData.data_quality.positive_wage_gainers,
      mean: roiData.measured_outcomes.all_participants.mean_wage_gain ?? 0,
      median: roiData.measured_outcomes.all_participants.median_wage_gain ?? 0,
    },
  };

  // Transform measured_outcomes to add graduates_only
  const measuredOutcomes = {
    ...roiData.measured_outcomes,
    graduates_only: {
      count: roiData.fpl_distribution.graduated ?? 0,
    },
  };

  // Merge with original data, adding the fpl_tiers field and transformed data
  const data = {
    ...roiData,
    fpl_tiers: fplTiers,
    data_quality: dataQuality,
    measured_outcomes: measuredOutcomes,
  } as unknown as Parameters<typeof ROIClient>[0]["data"];

  return <ROIClient data={data} />;
}
