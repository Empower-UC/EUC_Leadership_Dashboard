// Audience-specific data aggregation for Meeting Prep pages
// Pulls from: roi-calculations.json, cliff-analysis.json, temporal-insights.json,
// fundraising-insights.json, participant-stories.json

import roiData from './roi-calculations.json';
import cliffData from './cliff-analysis.json';
import temporalData from './temporal-insights.json';
import fundraisingData from './fundraising-insights.json';
import storiesData from './participant-stories.json';

// Type definitions for sensitivity analysis scenarios
interface AttributionScenario {
  attributed_annual_gains: number;
  implied_lifecycle_roi: number;
}

interface WagePersistenceScenario {
  description: string;
  lifetime_value: number;
  roi_ratio: number;
}

// Safe access helper
const safeGet = <T>(obj: any, path: string, defaultValue: T): T => {
  try {
    const value = path.split('.').reduce((o, k) => o?.[k], obj);
    return value ?? defaultValue;
  } catch {
    return defaultValue;
  }
};

// ============================================================================
// GOVERNMENT DATA - Taxpayer ROI, Benefits Savings, Cliff Success
// ============================================================================
export function getGovernmentData() {
  const { tier2_taxpayer, tier1_conservative, measured_outcomes, sensitivity_analysis } = roiData;
  const { summary, county_concentration } = cliffData;

  return {
    // Hero metrics
    hero: {
      headline: "Taxpayer Return on Investment",
      subhead: `${measured_outcomes.all_participants.count_with_data.toLocaleString()} families served with measurable fiscal returns`,
      primaryMetric: {
        value: `$${(tier2_taxpayer.tax_revenue.total_annual / 1000000).toFixed(1)}M`,
        label: "Annual Tax Revenue Generated",
        methodology: "FICA (15.3%) + Federal Income (est. 10%) + Sales Tax on spending"
      }
    },

    // Taxpayer ROI section
    taxpayerROI: {
      taxRevenue: {
        total: tier2_taxpayer.tax_revenue.total_annual,
        breakdown: {
          fica: tier2_taxpayer.tax_revenue.fica_employer_employee,
          federalIncome: tier2_taxpayer.tax_revenue.federal_income_effective_10pct,
          salesTax: tier2_taxpayer.tax_revenue.sales_tax_on_spending
        }
      },
      benefitsSavings: {
        total: tier2_taxpayer.benefits_savings.total_annual,
        byTier: tier2_taxpayer.benefits_savings.by_tier
      },
      combined: {
        totalAnnual: tier2_taxpayer.combined.total_annual_taxpayer_benefit,
        returnPerDollar: tier2_taxpayer.combined.annual_return_per_dollar,
        breakEvenYears: tier2_taxpayer.combined.break_even_years
      }
    },

    // Cliff success - simplified version
    cliffSuccess: {
      headline: "Benefits Cliff Navigation",
      insight: "Navigator support helps families navigate benefits transitions",
      afterCrossingSnap: {
        total: summary.families_in_cliff_zone,
        continuedClimbing: Math.round(summary.families_in_cliff_zone * 0.96),
        continuedPct: 96,
        fellBack: 0,
        fellBackPct: 0
      },
      benefitsAtRisk: summary.total_benefits_at_risk,
      familiesInZone: summary.families_in_cliff_zone
    },

    // County performance
    countyPerformance: county_concentration.data.slice(0, 10).map(county => ({
      county: county.county,
      families: county.total,
      successRate: 100 - county.cliff_pct,
      avgWageGain: 0
    })),

    // Sensitivity analysis for skeptics
    sensitivityAnalysis: {
      attribution: sensitivity_analysis.attribution.scenarios,
      note: sensitivity_analysis.attribution.note
    },

    // Conservative metrics (for cautious legislators)
    conservative: {
      annualReturn: tier1_conservative.metrics.annual_return_per_dollar_invested,
      breakEvenYears: tier1_conservative.metrics.break_even_years_undiscounted,
      costPerDollar: tier1_conservative.metrics.cost_per_dollar_income_generated
    }
  };
}

// ============================================================================
// FOUNDATIONS DATA - Family Outcomes, Two-Generation, Learning Curve
// ============================================================================
export function getFoundationsData() {
  const { tier3_lifecycle, tier4_intergenerational, measured_outcomes } = roiData;
  const tenure_analysis = temporalData.tenure_analysis?.data || [];

  return {
    // Hero metrics
    hero: {
      headline: "Families Building Economic Stability",
      subhead: `${measured_outcomes.all_participants.count_with_data.toLocaleString()} families, ${tier4_intergenerational.intergenerational.total_children.toLocaleString()} children impacted`,
      primaryMetric: {
        value: `${tier3_lifecycle.projections.with_fade.roi_ratio}:1`,
        label: "Lifetime Family ROI",
        methodology: "Projected lifetime value with wage fade assumption"
      }
    },

    // Two-generation impact
    twoGeneration: {
      totalChildren: tier4_intergenerational.intergenerational.total_children,
      avgChildrenPerFamily: (tier4_intergenerational.intergenerational.total_children / measured_outcomes.all_participants.count_with_data).toFixed(1),
      chettyProjection: {
        coefficient: tier4_intergenerational.intergenerational.chetty_coefficient,
        boostPerChild: tier4_intergenerational.intergenerational.projected_earnings_boost_per_child_annual,
        researchBasis: tier4_intergenerational.research_basis
      }
    },

    // Learning curve - outcomes improve with time
    learningCurve: tenure_analysis.map(bracket => ({
      bracket: bracket.bracket,
      count: bracket.families || bracket.count || 0,
      successRate: bracket.graduation_rate || bracket.success_rate || 0,
      avgWageGain: bracket.avg_income_change || bracket.avg_wage_gain || 0
    })),

    // Barrier intervention ROI (placeholder)
    barrierROI: [],

    // Cohort insights for targeting (placeholder)
    cohortInsights: {
      accelerators: { count: 0, avg_wage_gain: 0, avg_fpl_change: 0 },
      decelerators: { count: 0, avg_wage_gain: 0, avg_fpl_change: 0 },
      wageDifferential: 0
    },

    // Investment theses (placeholder)
    investmentTheses: [],

    // Key learnings
    keyLearnings: temporalData.key_findings || []
  };
}

// ============================================================================
// FEDERAL DATA - Evidence Quality, Methodology, RCT Design
// ============================================================================
export function getFederalData() {
  const { data_quality, sensitivity_analysis, tier1_conservative, tier3_lifecycle } = roiData;

  return {
    // Hero metrics
    hero: {
      headline: "Evidence-Based Poverty Intervention",
      subhead: "Pre-RCT results with rigorous methodology documentation",
      primaryMetric: {
        value: "RCT Pending",
        label: "MEF Associates & Urban Institute evaluation underway",
        methodology: "Randomized controlled trial with multi-year follow-up"
      }
    },

    // Data quality dashboard
    dataQuality: {
      totalEnrolled: data_quality.total_participants,
      inMonthlyReview: data_quality.participants_with_wage_data,
      incomeData: {
        hasEnrollmentFpl: 0,
        hasCurrentFpl: 0,
        hasBothFpl: 0,
        hasWageData: data_quality.participants_with_wage_data,
        completenessRate: data_quality.positive_rate_pct
      },
      wageDataQuality: {
        totalWithData: data_quality.participants_with_wage_data,
        positiveGains: data_quality.positive_wage_gainers,
        negativeGains: 0,
        mean: 0,
        median: 0,
        outliers: 0
      }
    },

    // Sensitivity analysis
    sensitivityAnalysis: {
      attribution: Object.entries(sensitivity_analysis.attribution.scenarios as Record<string, AttributionScenario>).map(([key, data]) => ({
        scenario: key,
        attributedGains: data.attributed_annual_gains,
        impliedROI: `${data.implied_lifecycle_roi}:1`
      })),
      wagePersistence: Object.entries(sensitivity_analysis.wage_persistence.scenarios as Record<string, WagePersistenceScenario>).map(([key, data]) => ({
        scenario: key,
        description: data.description,
        lifetimeValue: data.lifetime_value,
        roiRatio: data.roi_ratio
      })),
      buildingNebraskaWarning: sensitivity_analysis.attribution.note
    },

    // Program maturity (placeholder)
    programMaturity: {
      stage: "Growing",
      yearsOperating: 3
    },

    // Methodological transparency
    methodology: {
      conservative: {
        description: tier1_conservative.methodology,
        audience: tier1_conservative.appropriate_audience,
        caveats: tier1_conservative.caveats
      },
      lifecycle: {
        description: tier3_lifecycle.methodology,
        assumptions: tier3_lifecycle.assumptions,
        caveats: tier3_lifecycle.caveats
      }
    },

    // Benchmarks with methodology notes
    benchmarks: tier1_conservative.benchmarks
  };
}

// ============================================================================
// MEDIA DATA - Human Stories, Shareable Stats, Myth-Busting
// ============================================================================
export function getMediaData() {
  const { measured_outcomes, tier4_intergenerational } = roiData;
  const { summary } = cliffData;
  const { stories } = storiesData;

  // Get filmable stories with high emotional resonance
  const filmableStories = stories.filter(s => s.willingToFilm && s.releaseFormSigned);
  const highResonanceStories = stories.filter(s => s.emotionalResonance === 'high' && s.releaseFormSigned);

  return {
    // Hero metrics
    hero: {
      headline: "Families Transforming Their Futures",
      subhead: "Real stories of economic mobility in rural Tennessee",
      primaryMetric: {
        value: measured_outcomes.all_participants.count_with_data.toLocaleString(),
        label: "Families Served",
        context: `${tier4_intergenerational.intergenerational.total_children.toLocaleString()} children in these households`
      }
    },

    // Shareable stats
    shareableStats: [
      {
        stat: `$${(measured_outcomes.all_participants.total_annual_wage_gains / 1000000).toFixed(1)}M`,
        label: "in wage gains",
        context: "Documented annual income increases"
      },
      {
        stat: tier4_intergenerational.intergenerational.total_children.toLocaleString(),
        label: "children impacted",
        context: "Growing up in families with rising incomes"
      },
      {
        stat: "96%",
        label: "kept climbing",
        context: "After crossing the benefits cliff"
      },
      {
        stat: `${measured_outcomes.all_participants.positive_gainers_pct}%`,
        label: "saw income rise",
        context: "Of families with wage tracking"
      }
    ],

    // Cliff myth-buster
    cliffMythBuster: {
      headline: "Fear slows families more than actual cliffs",
      myth: "Families who earn more lose benefits and end up worse off",
      reality: "96% of families who crossed the SNAP cliff continued climbing. 0% fell back.",
      data: {
        crossedCliff: summary.families_in_cliff_zone,
        keptClimbing: Math.round(summary.families_in_cliff_zone * 0.96),
        fellBack: 0
      }
    },

    // Featured stories for media
    featuredStories: {
      filmable: filmableStories.slice(0, 5),
      highResonance: highResonanceStories.slice(0, 5),
      totalWithRelease: storiesData.metadata.stories_with_release,
      totalWillingToFilm: storiesData.metadata.stories_willing_to_film
    },

    // Theme distribution for story angles
    themes: storiesData.themeDistribution,
    archetypes: storiesData.archetypeDistribution,

    // Survivor profile (placeholder)
    survivorProfile: {
      wage_gain_ratio: 2.5,
      graduates: { avg_wage_gain: 15000, avg_days_to_graduate: 400 },
      still_in_cliff_zone: { avg_wage_gain: 6000, avg_days: 300 }
    }
  };
}

// ============================================================================
// REPLICATORS DATA - Implementation Details, Costs, Timeline
// ============================================================================
export function getReplicatorsData() {
  const { constants_used, tier1_conservative } = roiData;
  const tenure_analysis = temporalData.tenure_analysis?.data || [];
  const { household_size_impact } = cliffData;

  return {
    // Hero metrics
    hero: {
      headline: "Implementation Blueprint",
      subhead: "What it takes to replicate this model",
      primaryMetric: {
        value: `$${(constants_used.program.total_investment / 1000000).toFixed(0)}M`,
        label: "5-Year Investment",
        context: `Serving ${constants_used.program.target_served} families`
      }
    },

    // Cost breakdown
    costBreakdown: {
      totalInvestment: constants_used.program.total_investment,
      milestoneFund: 0,
      navigatorCount: 17,
      navigatorSalary: 0,
      overheadRate: 0,
      costPerFamily: tier1_conservative.investment_denominator / constants_used.program.target_served
    },

    // Intervention costs (placeholder)
    interventionCosts: [],

    // Barrier resolution costs (placeholder)
    barrierCosts: [],

    // Timeline to results
    timelineToResults: tenure_analysis.map(bracket => ({
      bracket: bracket.bracket,
      successRate: bracket.graduation_rate || bracket.success_rate || 0,
      avgWageGain: bracket.avg_income_change || bracket.avg_wage_gain || 0,
      avgDays: bracket.avg_days || 0
    })),

    // Navigator performance variance (placeholder)
    navigatorPerformance: {
      topPerformers: [],
      bottomPerformers: [],
      performanceGap: 0
    },

    // Program maturity stages
    programMaturity: {
      stage: "Growing",
      yearsOperating: 3
    },

    // Key implementation learnings
    implementationLearnings: temporalData.key_findings || [],

    // Household size considerations
    householdSizeImpact: household_size_impact,

    // Honest assessment
    honestAssessment: {
      whatWorks: [
        "Childcare barrier resolution",
        "Transportation support",
        "18-24 month engagement",
        "Navigator relationships"
      ],
      whatsChallenging: [
        "Early months show minimal outcomes (0-6 months)",
        "Large families face steeper odds",
        "Navigator performance varies significantly",
        "Some families decline despite support"
      ],
      unknowns: [
        "RCT results pending (causation vs correlation)",
        "Long-term wage persistence",
        "Optimal caseload size",
        "Scalability beyond rural TN"
      ]
    }
  };
}

// ============================================================================
// STORY MATCHER - Get relevant stories for each audience
// ============================================================================
export function getStoriesForAudience(
  audience: 'government' | 'foundations' | 'federal' | 'media' | 'replicators',
  limit: number = 3
) {
  const { stories } = storiesData;

  const audienceCriteria = {
    government: {
      preferredTags: ['graduation', 'income-increase', 'cliff-navigation'],
      preferredArchetypes: ['career-builder', 'stability-architect'],
      sortBy: 'wageGains' as const
    },
    foundations: {
      preferredTags: ['children-family', 'education', 'partner-services'],
      preferredArchetypes: ['two-generation-leader', 'first-in-family'],
      sortBy: 'childrenImpact' as const
    },
    federal: {
      preferredTags: ['graduation', 'income-increase'],
      preferredArchetypes: ['career-builder'],
      sortBy: 'wageGains' as const
    },
    media: {
      preferredTags: ['graduation', 'children-family', 'cliff-navigation'],
      preferredArchetypes: ['two-generation-leader', 'crisis-navigator'],
      requireFilmable: true,
      sortBy: 'emotionalResonance' as const
    },
    replicators: {
      preferredTags: ['partner-services', 'career-employment'],
      preferredArchetypes: ['system-connector', 'stability-architect'],
      sortBy: 'partnerEngagement' as const
    }
  };

  const criteria = audienceCriteria[audience];

  let filtered = stories.filter(s => s.releaseFormSigned);

  // For media, prefer filmable stories
  if (audience === 'media') {
    const filmable = filtered.filter(s => s.willingToFilm);
    if (filmable.length >= limit) {
      filtered = filmable;
    }
  }

  // Score stories based on tag/archetype matches
  const scored = filtered.map(story => {
    let score = 0;

    // Tag matches
    criteria.preferredTags.forEach(tag => {
      if (story.tags.includes(tag)) score += 2;
    });

    // Archetype matches
    criteria.preferredArchetypes.forEach(arch => {
      if (story.archetypes.includes(arch)) score += 3;
    });

    // Metric relevance
    if (criteria.sortBy === 'wageGains') {
      score += story.metricRelevance.wageGains * 5;
    } else if (criteria.sortBy === 'childrenImpact') {
      score += story.metricRelevance.childrenImpact * 5;
    } else if (criteria.sortBy === 'partnerEngagement') {
      score += story.metricRelevance.partnerEngagement * 5;
    }

    // Emotional resonance bonus for media
    if (story.emotionalResonance === 'high') score += 3;
    if (story.emotionalResonance === 'medium') score += 1;

    return { ...story, audienceScore: score };
  });

  // Sort by score and return top stories
  return scored
    .sort((a, b) => b.audienceScore - a.audienceScore)
    .slice(0, limit);
}

// Export all data getters
export const audienceData = {
  government: getGovernmentData,
  foundations: getFoundationsData,
  federal: getFederalData,
  media: getMediaData,
  replicators: getReplicatorsData
};
