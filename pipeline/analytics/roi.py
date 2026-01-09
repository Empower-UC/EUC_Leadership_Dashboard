"""
ROI calculations for EUC dashboard.
4-tier ROI methodology with increasing levels of projection.
"""
import pandas as pd
import numpy as np
from typing import Dict, Any
from datetime import datetime

from .metrics import (
    load_processed_data,
    calculate_wage_changes_from_assessments,
    calculate_fpl,
    get_poverty_line,
    PROGRAM_INVESTMENT,
    FPL_THRESHOLDS,
    FPL_BASE,
    FPL_PER_ADDITIONAL,
)

def calculate_fpl_tiers_from_assessments(assessments: pd.DataFrame) -> Dict[str, int]:
    """
    Calculate FPL tier distribution from longitudinal assessment data.
    Uses total_monthly_income and household size to calculate FPL.
    """
    df = assessments.copy()
    df['assessment_date'] = pd.to_datetime(df['assessment_date'], errors='coerce')

    # Get most recent assessment for each participant
    df = df.sort_values('assessment_date')
    latest = df.groupby('participant_id').last().reset_index()

    # Calculate FPL from total_monthly_income
    income_col = 'total_monthly_income'
    # Household size columns vary - check what's available
    hh_cols = [c for c in latest.columns if 'household' in c.lower() or 'adults' in c.lower()]

    if income_col in latest.columns:
        latest['annual_income'] = latest[income_col] * 12

        # Try to find household size
        hh_col = None
        for col in hh_cols:
            if 'how many' in col.lower() and 'adults' in col.lower():
                hh_col = col
                break

        # Default household size of 3 if not available
        if hh_col and hh_col in latest.columns:
            latest['household_size'] = pd.to_numeric(latest[hh_col], errors='coerce').fillna(3)
        else:
            latest['household_size'] = 3

        # Calculate FPL percentage
        def calc_fpl_pct(row):
            if pd.isna(row['annual_income']) or row['annual_income'] <= 0:
                return None
            hh = max(1, int(row['household_size']))
            poverty_line = FPL_BASE + FPL_PER_ADDITIONAL * (hh - 1)
            return (row['annual_income'] / poverty_line) * 100

        latest['fpl_pct'] = latest.apply(calc_fpl_pct, axis=1)

        # Categorize into tiers
        def categorize_fpl(fpl_pct):
            if pd.isna(fpl_pct):
                return "unknown"
            if fpl_pct >= 225:
                return "graduated"
            if fpl_pct >= 185:
                return "near_graduation"
            if fpl_pct >= 150:
                return "working_progress"
            if fpl_pct >= 130:
                return "snap_cliff"
            if fpl_pct >= 100:
                return "poverty_line"
            if fpl_pct >= 50:
                return "deep_poverty"
            return "extreme_poverty"

        latest['fpl_tier'] = latest['fpl_pct'].apply(categorize_fpl)
        return latest['fpl_tier'].value_counts().to_dict()

    return {"unknown": len(latest)}


# Tax rates for taxpayer ROI
TAX_RATES = {
    "fica_total": 0.153,             # 7.65% employee + 7.65% employer
    "federal_income_effective": 0.10, # Low-income effective rate
    "state_income": 0.0,             # Tennessee has no state income tax
    "sales_tax_rate": 0.08,          # TN combined state/local
    "sales_tax_spending_share": 0.60, # Portion of income spent on taxable goods
}

# Benefits values (Tennessee-specific)
BENEFITS_VALUES = {
    "tenncare_adult": 6_000,
    "tenncare_child": 3_000,
    "snap_household": 5_500,
    "tanf_cash": 2_400,
    "childcare_full": 4_000,
    "childcare_reduced": 2_000,
}

# Projection assumptions
PROJECTION_ASSUMPTIONS = {
    "discount_rate": 0.03,
    "default_working_years": 25,
    "wage_persistence_year5": 0.80,
    "wage_persistence_year10": 0.60,
    "chetty_coefficient": 0.013,
    "avg_children_per_family": 2.0,
}


def calculate_tier1_conservative(annual_wage_gains: float, investment: float) -> Dict[str, Any]:
    """
    TIER 1: CONSERVATIVE / PROVABLE ROI
    No projections, just measured wage gains.
    """
    annual_return = annual_wage_gains / investment if investment > 0 else 0
    break_even = investment / annual_wage_gains if annual_wage_gains > 0 else float('inf')
    cost_per_dollar = investment / annual_wage_gains if annual_wage_gains > 0 else float('inf')

    return {
        "methodology": "Measured annual wage gains only. No projections.",
        "appropriate_audience": "Skeptical funders, evaluators, legislators wanting floor estimates",
        "investment_denominator": investment,
        "metrics": {
            "documented_annual_wage_gains": round(annual_wage_gains, 0),
            "annual_return_per_dollar_invested": round(annual_return, 4),
            "break_even_years_undiscounted": round(break_even, 2) if break_even != float('inf') else "N/A",
            "cost_per_dollar_income_generated": round(cost_per_dollar, 2) if cost_per_dollar != float('inf') else "N/A",
        },
        "benchmarks": {
            "project_quest": {"cost_per_dollar": 0.30, "note": "14-year RCT follow-up"},
            "year_up": {"cost_per_dollar": 1.30, "note": "~$30K/participant"},
            "euc_comparison": f"EUC: ${cost_per_dollar:.2f}" if cost_per_dollar != float('inf') else "N/A",
        },
        "caveats": [
            "Assumes all measured wage gains persist for at least 1 year",
            "Does not account for what would have happened without program (no RCT yet)",
            "Uses full $25M investment as denominator, not spent-to-date",
        ],
    }


def calculate_tier2_taxpayer(
    annual_wage_gains: float,
    fpl_tier_counts: Dict[str, int],
    investment: float
) -> Dict[str, Any]:
    """
    TIER 2: TAXPAYER ROI
    Tax revenue generated + benefits savings by FPL tier.
    """
    # Tax revenue from wage gains
    fica = annual_wage_gains * TAX_RATES["fica_total"]
    federal = annual_wage_gains * TAX_RATES["federal_income_effective"]
    state = annual_wage_gains * TAX_RATES["state_income"]
    sales = annual_wage_gains * TAX_RATES["sales_tax_rate"] * TAX_RATES["sales_tax_spending_share"]
    total_tax = fica + federal + state + sales

    # Benefits savings by tier
    benefits_savings = {}

    # Graduates (225%+) - exit most benefits
    grad_count = fpl_tier_counts.get("graduated", 0)
    grad_savings = grad_count * (
        BENEFITS_VALUES["tenncare_adult"] +
        BENEFITS_VALUES["snap_household"] +
        BENEFITS_VALUES["tanf_cash"] +
        BENEFITS_VALUES["childcare_full"]
    )
    benefits_savings["graduates_225plus"] = {
        "count": grad_count,
        "per_family_savings": 17900,
        "total": round(grad_savings, 0),
        "benefits_exited": ["TennCare adult", "SNAP", "TANF cash", "Childcare subsidy"],
    }

    # Near graduation (185-225%) - exit SNAP, TANF
    tier2_count = fpl_tier_counts.get("near_graduation", 0)
    tier2_savings = tier2_count * (
        BENEFITS_VALUES["snap_household"] +
        BENEFITS_VALUES["tanf_cash"] +
        BENEFITS_VALUES["childcare_reduced"]
    )
    benefits_savings["tier2_150plus"] = {
        "count": tier2_count,
        "per_family_savings": 9900,
        "total": round(tier2_savings, 0),
        "benefits_exited": ["SNAP", "TANF cash", "Childcare (reduced)"],
    }

    # Working progress (150-185%) - exit TANF, reduced SNAP
    tier3_count = fpl_tier_counts.get("working_progress", 0)
    tier3_savings = tier3_count * (
        BENEFITS_VALUES["tanf_cash"] +
        BENEFITS_VALUES["snap_household"] * 0.5
    )
    benefits_savings["tier3_100plus"] = {
        "count": tier3_count,
        "per_family_savings": 5150,
        "total": round(tier3_savings, 0),
        "benefits_exited": ["TANF cash", "SNAP (reduced)"],
    }

    # SNAP cliff zone (130-150%) - marginal savings
    tier4_count = fpl_tier_counts.get("snap_cliff", 0)
    tier4_savings = tier4_count * 1000
    benefits_savings["tier4_improved"] = {
        "count": tier4_count,
        "per_family_savings": 1000,
        "total": round(tier4_savings, 0),
        "benefits_exited": ["SNAP (marginal reduction)"],
    }

    total_benefits = grad_savings + tier2_savings + tier3_savings + tier4_savings
    total_taxpayer = total_tax + total_benefits

    return {
        "methodology": "Tax revenue from wage gains + estimated benefits cost avoidance by FPL tier",
        "appropriate_audience": "State legislators, TANF administrators, taxpayer advocates",
        "investment_denominator": investment,
        "tax_revenue": {
            "fica_employer_employee": round(fica, 0),
            "federal_income_effective_10pct": round(federal, 0),
            "state_income_tn_none": round(state, 0),
            "sales_tax_on_spending": round(sales, 0),
            "total_annual": round(total_tax, 0),
        },
        "benefits_savings": {
            "by_tier": benefits_savings,
            "total_annual": round(total_benefits, 0),
            "caveat": "Estimates based on FPL thresholds, not tracked benefit terminations",
        },
        "combined": {
            "total_annual_taxpayer_benefit": round(total_taxpayer, 0),
            "annual_return_per_dollar": round(total_taxpayer / investment, 4) if investment > 0 else 0,
            "break_even_years": round(investment / total_taxpayer, 1) if total_taxpayer > 0 else "N/A",
            "ten_year_return_undiscounted": round(total_taxpayer * 10, 0),
        },
        "caveats": [
            "Benefits savings are ESTIMATES based on FPL thresholds",
            "Actual savings depend on individual benefit receipt and recertification timing",
            "Does not account for what would have happened without program",
            "TN-specific benefit levels used (lower than national average)",
        ],
    }


def calculate_tier3_lifecycle(annual_wage_gains: float, investment: float) -> Dict[str, Any]:
    """
    TIER 3: LIFECYCLE / FAMILY ROI
    Projects wage gains over working lifetime.
    """
    working_years = PROJECTION_ASSUMPTIONS["default_working_years"]
    discount_rate = PROJECTION_ASSUMPTIONS["discount_rate"]

    # Present value with full persistence
    pv_factor = (1 - (1 + discount_rate) ** -working_years) / discount_rate
    lifetime_pv_full = annual_wage_gains * pv_factor

    # Present value with wage fade
    pv_with_fade = (
        annual_wage_gains * ((1 - (1 + discount_rate) ** -5) / discount_rate) +
        annual_wage_gains * 0.8 * ((1 - (1 + discount_rate) ** -5) / discount_rate) / (1 + discount_rate) ** 5 +
        annual_wage_gains * 0.6 * ((1 - (1 + discount_rate) ** -15) / discount_rate) / (1 + discount_rate) ** 10
    )

    return {
        "methodology": "Annual wage gains projected over working lifetime with discount rate",
        "appropriate_audience": "Workforce development funders, program comparison",
        "investment_denominator": investment,
        "assumptions": {
            "working_years_remaining": working_years,
            "discount_rate": discount_rate,
            "note": "Age data not available; using 25 years as conservative estimate",
        },
        "projections": {
            "full_persistence": {
                "lifetime_pv": round(lifetime_pv_full, 0),
                "roi_ratio": round(lifetime_pv_full / investment, 1) if investment > 0 else 0,
                "assumption": "Wage gains persist unchanged for 25 years",
            },
            "with_fade": {
                "lifetime_pv": round(pv_with_fade, 0),
                "roi_ratio": round(pv_with_fade / investment, 1) if investment > 0 else 0,
                "assumption": "Wage gains fade: 100% years 1-5, 80% years 6-10, 60% years 11-25",
            },
        },
        "benchmarks": {
            "project_quest": {"lifetime_roi": "2.34:1", "note": "14-year RCT, $4,434/yr gains"},
            "year_up": {"lifetime_roi": "2.46:1", "note": "Social return on investment"},
            "jeremiah_program": {"lifetime_roi": "4:1", "note": "Wilder SROI methodology"},
        },
        "caveats": [
            "PROJECTION: Assumes wage gains persist; research shows effects often fade",
            "Working years assumed at 25; actual varies by participant age",
            "Without RCT, cannot claim causation—association only",
            "Sensitivity analysis recommended for key assumptions",
        ],
    }


def calculate_tier4_intergenerational(
    annual_wage_gains: float,
    avg_wage_gain: float,
    total_families: int,
    investment: float
) -> Dict[str, Any]:
    """
    TIER 4: INTERGENERATIONAL / SOCIETAL ROI
    Includes projected effects on children.
    """
    discount_rate = PROJECTION_ASSUMPTIONS["discount_rate"]
    chetty_coefficient = PROJECTION_ASSUMPTIONS["chetty_coefficient"]
    avg_children = PROJECTION_ASSUMPTIONS["avg_children_per_family"]

    total_children = int(total_families * avg_children)

    # Chetty calculation: $1K income increase -> 1.3% higher adult earnings
    income_increase_thousands = avg_wage_gain / 1000
    assumed_child_baseline_earnings = 40000
    earnings_boost_per_child = assumed_child_baseline_earnings * chetty_coefficient * income_increase_thousands
    total_child_earnings_boost = earnings_boost_per_child * total_children

    # Project over 30 years of child's working life, delayed 15 years
    child_working_years = 30
    years_until_work = 15
    pv_factor = (1 - (1 + discount_rate) ** -child_working_years) / discount_rate
    pv_factor_delayed = pv_factor / (1 + discount_rate) ** years_until_work
    intergenerational_pv = total_child_earnings_boost * pv_factor_delayed

    # Combined with lifecycle
    pv_with_fade = (
        annual_wage_gains * ((1 - (1 + discount_rate) ** -5) / discount_rate) +
        annual_wage_gains * 0.8 * ((1 - (1 + discount_rate) ** -5) / discount_rate) / (1 + discount_rate) ** 5 +
        annual_wage_gains * 0.6 * ((1 - (1 + discount_rate) ** -15) / discount_rate) / (1 + discount_rate) ** 10
    )
    total_societal = pv_with_fade + intergenerational_pv

    result = {
        "methodology": "Includes research-based projections of child outcome improvements",
        "appropriate_audience": "Visionary funders, long-term impact investors",
        "investment_denominator": investment,
        "research_basis": "Chetty et al.: $1,000 childhood income increase -> 1.3% higher adult earnings",
        "intergenerational": {
            "total_children": total_children,
            "avg_family_income_increase": round(avg_wage_gain, 0),
            "chetty_coefficient": chetty_coefficient,
            "projected_earnings_boost_per_child_annual": round(earnings_boost_per_child, 0),
            "total_children_earnings_boost_annual": round(total_child_earnings_boost, 0),
            "lifetime_pv_discounted": round(intergenerational_pv, 0),
        },
        "combined_societal": {
            "adult_lifecycle_pv": round(pv_with_fade, 0),
            "intergenerational_pv": round(intergenerational_pv, 0),
            "total_societal_pv": round(total_societal, 0),
            "societal_roi_ratio": round(total_societal / investment, 1) if investment > 0 else 0,
        },
        "caveats": [
            "HIGHLY SPECULATIVE: Intergenerational effects are research-based projections, not measured",
            "Chetty research based on different populations; applicability to rural TN uncertain",
            "Effects won't be observable for 15-20 years",
            "Represents potential, not proven impact",
            "Should not be primary ROI cited; use for 'comprehensive potential' framing",
        ],
    }

    # Add warning if ROI seems too high
    if total_societal / investment > 10:
        result["red_flag"] = "WARNING: ROI >10:1 may indicate overclaiming. Verify assumptions."

    return result


def calculate_sensitivity_analysis(annual_wage_gains: float, investment: float) -> Dict[str, Any]:
    """Calculate sensitivity analysis on key assumptions."""
    # Attribution scenarios
    attribution = {}
    for pct in [100, 70, 50, 30]:
        attributed = annual_wage_gains * (pct / 100)
        roi = attributed / investment * 25 if investment > 0 else 0
        attribution[f"{pct}pct"] = {
            "attributed_annual_gains": round(attributed, 0),
            "implied_lifecycle_roi": round(roi, 1),
        }

    # Persistence scenarios
    persistence = {
        "full": {
            "description": "100% persistence, 25 years",
            "lifetime_value": round(annual_wage_gains * 25, 0),
            "roi_ratio": round(annual_wage_gains * 25 / investment, 1) if investment > 0 else 0,
        },
        "moderate_fade": {
            "description": "Fade to 60% by year 10",
            "lifetime_value": round(annual_wage_gains * 15, 0),
            "roi_ratio": round(annual_wage_gains * 15 / investment, 1) if investment > 0 else 0,
        },
        "rapid_fade": {
            "description": "Fade to 30% by year 5",
            "lifetime_value": round(annual_wage_gains * 8, 0),
            "roi_ratio": round(annual_wage_gains * 8 / investment, 1) if investment > 0 else 0,
        },
    }

    # Denominator scenarios
    denominator = {
        "full_25m": {
            "value": 25_000_000,
            "roi_ratio": round(annual_wage_gains * 25 / 25_000_000, 1),
        },
        "annual_program_cost": {
            "value": 6_000_000,
            "roi_ratio": round(annual_wage_gains * 25 / 6_000_000, 1),
        },
        "marginal_per_family": {
            "value": 7_000,
            "roi_ratio": round((annual_wage_gains / 862) * 25 / 7_000, 1),
            "note": "Useful for marginal cost analysis",
        },
    }

    return {
        "methodology": "Varies key assumptions to show range of outcomes",
        "attribution": {
            "scenarios": attribution,
            "note": "RCT will reveal actual attribution; Building Nebraska Families showed 0% attribution",
        },
        "wage_persistence": {
            "scenarios": persistence,
            "note": "Research shows workforce gains often fade; long-term follow-up rare",
        },
        "denominator": {
            "scenarios": denominator,
            "recommendation": "Use $25M for consistency; note if different denominator used",
        },
    }


def calculate_full_roi(data: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
    """
    Calculate complete 4-tier ROI analysis from processed data.

    Uses journey data (which includes Empower wage gains) as primary source when available.
    Falls back to assessment-based calculations if not.
    """
    participants = data["participants"]

    # Use journey data if available (contains Empower wage gains)
    if "journeys" in data:
        journeys = data["journeys"]

        # Wage metrics from journey data
        valid_wages = journeys[journeys['income_change_annual'].notna()]
        positive_changes = valid_wages[valid_wages['income_change_annual'] > 0]

        total_wage_gains = positive_changes['income_change_annual'].sum()
        positive_count = len(positive_changes)
        avg_wage_gain = positive_changes['income_change_annual'].mean() if positive_count > 0 else 0
        mean_wage_all = valid_wages['income_change_annual'].mean() if len(valid_wages) > 0 else 0
        median_wage_all = valid_wages['income_change_annual'].median() if len(valid_wages) > 0 else 0
        total_families = len(journeys)
        total_with_data = len(valid_wages)

        # FPL tier counts from journey data
        fpl_tier_counts = journeys['cliff_tier'].value_counts().to_dict()

    else:
        # Fallback: calculate from assessments
        assessments = data["assessments"]
        wage_changes = calculate_wage_changes_from_assessments(assessments)
        positive_changes = wage_changes[wage_changes['annual_change'] > 0]

        total_wage_gains = positive_changes['annual_change'].sum()
        positive_count = len(positive_changes)
        avg_wage_gain = positive_changes['annual_change'].mean() if positive_count > 0 else 0
        mean_wage_all = wage_changes['annual_change'].mean() if len(wage_changes) > 0 else 0
        median_wage_all = wage_changes['annual_change'].median() if len(wage_changes) > 0 else 0
        total_families = len(participants)
        total_with_data = len(wage_changes)

        # Calculate FPL from longitudinal assessments
        fpl_tier_counts = calculate_fpl_tiers_from_assessments(assessments)

    # Calculate all tiers
    tier1 = calculate_tier1_conservative(total_wage_gains, PROGRAM_INVESTMENT)
    tier2 = calculate_tier2_taxpayer(total_wage_gains, fpl_tier_counts, PROGRAM_INVESTMENT)
    tier3 = calculate_tier3_lifecycle(total_wage_gains, PROGRAM_INVESTMENT)
    tier4 = calculate_tier4_intergenerational(
        total_wage_gains, avg_wage_gain, total_families, PROGRAM_INVESTMENT
    )
    sensitivity = calculate_sensitivity_analysis(total_wage_gains, PROGRAM_INVESTMENT)

    return {
        "metadata": {
            "generated_at": datetime.now().isoformat(),
            "methodology_version": "1.0",
            "investment_denominator": PROGRAM_INVESTMENT,
            "discount_rate": PROJECTION_ASSUMPTIONS["discount_rate"],
            "data_source": "Longitudinal assessment data (first to last assessment comparison)",
        },
        "data_quality": {
            "assessment_date": datetime.now().isoformat(),
            "data_sources": [
                "Processed longitudinal assessments",
                "Navigator Dashboard (FPL data)",
            ],
            "total_participants": total_families,
            "participants_with_wage_data": total_with_data,
            "positive_wage_gainers": positive_count,
            "positive_rate_pct": round(positive_count / total_with_data * 100, 1) if total_with_data > 0 else 0,
        },
        "measured_outcomes": {
            "timestamp": datetime.now().isoformat(),
            "methodology": "Observed data only, no projections",
            "all_participants": {
                "count_with_data": total_with_data,
                "total_annual_wage_gains": round(total_wage_gains, 0),
                "mean_wage_gain": round(mean_wage_all, 2) if total_with_data > 0 else 0,
                "median_wage_gain": round(median_wage_all, 2) if total_with_data > 0 else 0,
                "positive_gainers_count": positive_count,
                "positive_gainers_pct": round(positive_count / total_with_data * 100, 1) if total_with_data > 0 else 0,
            },
            "children": {
                "total_estimated": int(total_families * PROJECTION_ASSUMPTIONS["avg_children_per_family"]),
                "avg_per_family": PROJECTION_ASSUMPTIONS["avg_children_per_family"],
                "note": "Estimated based on average household size",
            },
        },
        "fpl_distribution": fpl_tier_counts,
        "tier1_conservative": tier1,
        "tier2_taxpayer": tier2,
        "tier3_lifecycle": tier3,
        "tier4_intergenerational": tier4,
        "sensitivity_analysis": sensitivity,
        "summary": {
            "generated_at": datetime.now().isoformat(),
            "data_basis": {
                "total_families_served": total_families,
                "total_measured_wage_gains": round(total_wage_gains, 0),
                "children_impacted": int(total_families * PROJECTION_ASSUMPTIONS["avg_children_per_family"]),
            },
            "roi_by_framing": {
                "conservative_annual": {
                    "metric": "Annual return per $1 invested",
                    "value": tier1["metrics"]["annual_return_per_dollar_invested"],
                    "methodology": tier1["methodology"],
                    "audience": tier1["appropriate_audience"],
                },
                "taxpayer_annual": {
                    "metric": "Annual taxpayer benefit per $1 invested",
                    "value": tier2["combined"]["annual_return_per_dollar"],
                    "methodology": tier2["methodology"],
                    "audience": tier2["appropriate_audience"],
                },
                "lifecycle_with_fade": {
                    "metric": "Lifetime ROI (with wage fade)",
                    "value": f"{tier3['projections']['with_fade']['roi_ratio']}:1",
                    "methodology": tier3["methodology"],
                    "audience": tier3["appropriate_audience"],
                },
                "societal_comprehensive": {
                    "metric": "Comprehensive societal ROI",
                    "value": f"{tier4['combined_societal']['societal_roi_ratio']}:1",
                    "methodology": tier4["methodology"],
                    "audience": tier4["appropriate_audience"],
                },
            },
            "key_caveats": [
                "RCT validation pending with MEF Associates / Urban Institute",
                "Without RCT, shows association not causation",
                "Building Nebraska Families (only rural TANF RCT) showed zero impact",
                "Benefits savings are estimates, not tracked terminations",
                "Intergenerational effects are projections, not measurements",
            ],
        },
        "constants_used": {
            "program": {
                "total_investment": PROGRAM_INVESTMENT,
                "target_graduates": 300,
                "target_served": 800,
            },
            "tax_rates": TAX_RATES,
            "benefits_values": BENEFITS_VALUES,
            "projection_assumptions": PROJECTION_ASSUMPTIONS,
        },
    }


if __name__ == "__main__":
    data = load_processed_data()
    roi = calculate_full_roi(data)
    print(f"Total wage gains: ${roi['measured_outcomes']['all_participants']['total_annual_wage_gains']:,.0f}")
    print(f"Conservative ROI: {roi['tier1_conservative']['metrics']['annual_return_per_dollar_invested']:.4f}")
    print(f"Lifecycle ROI: {roi['tier3_lifecycle']['projections']['with_fade']['roi_ratio']}:1")
