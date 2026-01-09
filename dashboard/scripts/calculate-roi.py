#!/usr/bin/env python3
"""
EUC ROI Calculator - Defensible, Internally Consistent Metrics

This script produces ROI calculations that can withstand scrutiny from
foundations, legislators, and evaluators. It clearly distinguishes
measured outcomes from projections.

Output: JSON file with multiple ROI framings for different audiences.
"""

import pandas as pd
import numpy as np
import json
from pathlib import Path
from datetime import datetime

# Paths
RAW_DATA = Path(__file__).parent.parent.parent / "data" / "raw"
OUTPUT_DIR = Path(__file__).parent.parent / "lib" / "data"
OUTPUT_DIR.mkdir(exist_ok=True)

# =============================================================================
# CONSTANTS - All assumptions documented here
# =============================================================================

PROGRAM_CONSTANTS = {
    "total_investment": 25_000_000,  # Total TANF investment
    "milestone_fund": 5_000_000,     # Direct support fund
    "navigator_count": 17,
    "navigator_salary": 40_000,      # Annual
    "overhead_rate": 0.15,           # Operations overhead estimate
    "target_graduates": 300,         # Target: families to 225% FPL
    "target_served": 800,            # Target: total families
}

TAX_RATES = {
    "fica_total": 0.153,             # 7.65% employee + 7.65% employer
    "federal_income_effective": 0.10, # Low-income effective rate
    "state_income": 0.0,             # Tennessee has no state income tax
    "sales_tax_rate": 0.08,          # TN combined state/local
    "sales_tax_spending_share": 0.60, # Portion of income spent on taxable goods
}

# Benefits values (Tennessee-specific, 2023-2024)
BENEFITS_VALUES = {
    "tenncare_adult": 6_000,         # Annual per adult (KFF TN data)
    "tenncare_child": 3_000,         # Annual per child
    "snap_household": 5_500,         # Annual average TN household
    "tanf_cash": 2_400,              # Annual ($200/month average)
    "childcare_full": 4_000,         # Partial subsidy value
    "childcare_reduced": 2_000,
}

# FPL thresholds for benefit eligibility
FPL_THRESHOLDS = {
    "graduate": 225,                 # Program success definition
    "tenncare_adult_cutoff": 138,    # Adults lose at 138%
    "snap_cutoff": 130,              # SNAP at 130%
    "tanf_cutoff": 100,              # TANF roughly at poverty line
    "tier2": 150,                    # Significant progress
    "tier3": 100,                    # Crossed poverty line
}

# Projection assumptions
PROJECTION_ASSUMPTIONS = {
    "discount_rate": 0.03,           # 3% real discount rate (standard)
    "default_working_years": 25,     # If age unknown, assume 25 years remaining
    "wage_persistence_year5": 0.80,  # Assume 20% fade by year 5
    "wage_persistence_year10": 0.60, # Assume 40% fade by year 10
    "chetty_coefficient": 0.013,     # $1K income → 1.3% higher child earnings
    "avg_children_per_family": 2.0,  # Will calculate from data
}


def load_data():
    """Load all relevant data sources."""
    print("Loading data sources...")

    # Load Navigator Dashboard
    nav_dashboard = pd.read_excel(RAW_DATA / "Navigator Dashboard.xlsx", sheet_name=None)
    monthly_review = nav_dashboard["Monthly Client Review"]

    # Load Baseline Assessment (has demographics, barriers)
    baseline = pd.read_excel(RAW_DATA / "Baseline Assessment Report (86).xlsx")

    return monthly_review, baseline


def assess_data_quality(monthly_review, baseline):
    """
    Assess data completeness and quality.
    This is critical for defensibility.
    """
    print("\n" + "="*60)
    print("DATA QUALITY ASSESSMENT")
    print("="*60)

    quality_report = {
        "assessment_date": datetime.now().isoformat(),
        "data_sources": ["Navigator Dashboard - Monthly Client Review", "Baseline Assessment Report"],
    }

    # 1. Total enrolled
    total_baseline = len(baseline)
    total_monthly = len(monthly_review)

    quality_report["total_enrolled_baseline"] = total_baseline
    quality_report["total_in_monthly_review"] = total_monthly

    print(f"\nTotal in Baseline Assessment: {total_baseline}")
    print(f"Total in Monthly Client Review: {total_monthly}")

    # 2. Income data completeness
    mr = monthly_review.copy()
    mr['FPL at Enrollment'] = pd.to_numeric(mr['FPL at Enrollment'], errors='coerce')
    mr['Current FPL'] = pd.to_numeric(mr['Current FPL'], errors='coerce')
    mr['Wage Increases Since Enrollment'] = pd.to_numeric(mr['Wage Increases Since Enrollment'], errors='coerce')

    has_enrollment_fpl = mr['FPL at Enrollment'].notna().sum()
    has_current_fpl = mr['Current FPL'].notna().sum()
    has_both_fpl = ((mr['FPL at Enrollment'].notna()) & (mr['Current FPL'].notna())).sum()
    has_wage_data = mr['Wage Increases Since Enrollment'].notna().sum()

    quality_report["income_data"] = {
        "has_enrollment_fpl": int(has_enrollment_fpl),
        "has_current_fpl": int(has_current_fpl),
        "has_both_fpl": int(has_both_fpl),
        "has_wage_change_data": int(has_wage_data),
        "completeness_rate": round(has_both_fpl / total_monthly * 100, 1) if total_monthly > 0 else 0,
    }

    print(f"\nIncome Data Completeness:")
    print(f"  Has enrollment FPL: {has_enrollment_fpl} ({has_enrollment_fpl/total_monthly*100:.1f}%)")
    print(f"  Has current FPL: {has_current_fpl} ({has_current_fpl/total_monthly*100:.1f}%)")
    print(f"  Has BOTH (complete): {has_both_fpl} ({has_both_fpl/total_monthly*100:.1f}%)")
    print(f"  Has wage change data: {has_wage_data} ({has_wage_data/total_monthly*100:.1f}%)")

    # Flag if below 70% completeness
    completeness_rate = has_both_fpl / total_monthly * 100 if total_monthly > 0 else 0
    if completeness_rate < 70:
        quality_report["income_data"]["warning"] = f"CAUTION: Only {completeness_rate:.0f}% have complete income data"
        print(f"\n  ⚠️  WARNING: Low data completeness ({completeness_rate:.0f}%)")

    # 3. Children data
    if 'Household Size at Enrollment' in mr.columns:
        mr['Household Size at Enrollment'] = pd.to_numeric(mr['Household Size at Enrollment'], errors='coerce')
        # Estimate children as household size - 1 (primary adult)
        mr['estimated_children'] = (mr['Household Size at Enrollment'] - 1).clip(lower=0)
        total_children = mr['estimated_children'].sum()
        avg_children = mr['estimated_children'].mean()
    else:
        # Use baseline data
        total_children = total_baseline * 2  # Rough estimate
        avg_children = 2.0

    quality_report["children_data"] = {
        "total_children_estimated": int(total_children),
        "avg_children_per_family": round(avg_children, 2),
        "methodology": "Calculated as household_size - 1 (primary adult)"
    }

    print(f"\nChildren Data:")
    print(f"  Total children (estimated): {int(total_children)}")
    print(f"  Average per family: {avg_children:.2f}")

    # 4. Outlier detection in wage gains
    wage_gains = mr['Wage Increases Since Enrollment'].dropna()
    if len(wage_gains) > 0:
        outlier_threshold = 50000
        outliers = wage_gains[wage_gains > outlier_threshold]
        negative_count = (wage_gains < 0).sum()
        zero_count = (wage_gains == 0).sum()

        quality_report["wage_data_quality"] = {
            "total_with_wage_data": int(len(wage_gains)),
            "positive_wage_gains": int((wage_gains > 0).sum()),
            "zero_wage_gains": int(zero_count),
            "negative_wage_gains": int(negative_count),
            "outliers_above_50k": int(len(outliers)),
            "outlier_values": outliers.tolist() if len(outliers) > 0 else [],
            "mean": round(wage_gains.mean(), 2),
            "median": round(wage_gains.median(), 2),
            "max": round(wage_gains.max(), 2),
            "min": round(wage_gains.min(), 2),
        }

        print(f"\nWage Gains Quality Check:")
        print(f"  Total with data: {len(wage_gains)}")
        print(f"  Positive gains: {(wage_gains > 0).sum()} ({(wage_gains > 0).sum()/len(wage_gains)*100:.1f}%)")
        print(f"  Zero/no change: {zero_count} ({zero_count/len(wage_gains)*100:.1f}%)")
        print(f"  Negative (declined): {negative_count} ({negative_count/len(wage_gains)*100:.1f}%)")
        print(f"  Outliers (>$50K): {len(outliers)}")
        if len(outliers) > 0:
            print(f"    Outlier values: {outliers.tolist()}")
        print(f"  Mean: ${wage_gains.mean():,.0f}")
        print(f"  Median: ${wage_gains.median():,.0f}")

    return quality_report, mr


def calculate_fpl_tiers(mr):
    """
    Categorize families into FPL movement tiers.
    This is the foundation for benefits savings calculations.
    """
    print("\n" + "="*60)
    print("FPL MOVEMENT ANALYSIS")
    print("="*60)

    # Work with complete cases only
    complete = mr[
        (mr['FPL at Enrollment'].notna()) &
        (mr['Current FPL'].notna())
    ].copy()

    complete['fpl_change'] = complete['Current FPL'] - complete['FPL at Enrollment']
    complete['fpl_change_pct'] = complete['fpl_change'] * 100  # Convert to percentage points

    # Tier classification
    def classify_tier(row):
        current = row['Current FPL'] * 100  # Convert to percentage
        start = row['FPL at Enrollment'] * 100
        change = row['fpl_change'] * 100

        if current >= 225:
            return "graduate"
        elif current >= 150:
            return "tier2_150plus"
        elif current >= 100:
            return "tier3_100plus"
        elif change >= 50:
            return "tier4_improved_50plus"
        elif change > 0:
            return "tier5_minimal_improvement"
        else:
            return "tier6_declined"

    complete['tier'] = complete.apply(classify_tier, axis=1)

    tier_counts = complete['tier'].value_counts()
    tier_stats = {}

    tier_order = ["graduate", "tier2_150plus", "tier3_100plus",
                  "tier4_improved_50plus", "tier5_minimal_improvement", "tier6_declined"]

    tier_labels = {
        "graduate": "Graduates (225%+ FPL)",
        "tier2_150plus": "Tier 2: Crossed 150% FPL",
        "tier3_100plus": "Tier 3: Crossed 100% FPL",
        "tier4_improved_50plus": "Tier 4: Improved 50+ pts (below 100%)",
        "tier5_minimal_improvement": "Tier 5: Minimal improvement (<50 pts)",
        "tier6_declined": "Tier 6: Declined",
    }

    print("\nFPL Movement Tiers:")
    print("-" * 50)

    total_complete = len(complete)
    for tier in tier_order:
        count = tier_counts.get(tier, 0)
        tier_data = complete[complete['tier'] == tier]

        avg_wage = tier_data['Wage Increases Since Enrollment'].mean() if len(tier_data) > 0 else 0
        avg_fpl_change = tier_data['fpl_change'].mean() * 100 if len(tier_data) > 0 else 0

        tier_stats[tier] = {
            "label": tier_labels[tier],
            "count": int(count),
            "percentage": round(count / total_complete * 100, 1) if total_complete > 0 else 0,
            "avg_wage_gain": round(avg_wage, 2) if not np.isnan(avg_wage) else 0,
            "avg_fpl_change_pts": round(avg_fpl_change, 1) if not np.isnan(avg_fpl_change) else 0,
        }

        print(f"  {tier_labels[tier]}: {count} ({count/total_complete*100:.1f}%)")
        if count > 0:
            print(f"      Avg wage gain: ${avg_wage:,.0f}, Avg FPL change: {avg_fpl_change:+.0f} pts")

    return tier_stats, complete


def calculate_measured_outcomes(mr, tier_stats):
    """
    Calculate outcomes we can actually measure.
    NO projections - just observed data.
    """
    print("\n" + "="*60)
    print("MEASURED OUTCOMES (No Projections)")
    print("="*60)

    # Work with wage data
    wage_data = mr['Wage Increases Since Enrollment'].dropna()
    positive_wage = wage_data[wage_data > 0]

    measured = {
        "timestamp": datetime.now().isoformat(),
        "methodology": "Observed data only, no projections",
    }

    # All participants with wage data
    measured["all_participants"] = {
        "count_with_data": int(len(wage_data)),
        "total_annual_wage_gains": round(wage_data.sum(), 2),
        "mean_wage_gain": round(wage_data.mean(), 2),
        "median_wage_gain": round(wage_data.median(), 2),
        "positive_gainers_count": int(len(positive_wage)),
        "positive_gainers_pct": round(len(positive_wage) / len(wage_data) * 100, 1) if len(wage_data) > 0 else 0,
    }

    print(f"\nAll Participants with Wage Data:")
    print(f"  Count: {len(wage_data)}")
    print(f"  Total annual wage gains: ${wage_data.sum():,.0f}")
    print(f"  Mean: ${wage_data.mean():,.0f}")
    print(f"  Median: ${wage_data.median():,.0f}")
    print(f"  % with positive gains: {len(positive_wage)/len(wage_data)*100:.1f}%")

    # Graduates only
    grad_count = tier_stats.get("graduate", {}).get("count", 0)
    grad_avg_wage = tier_stats.get("graduate", {}).get("avg_wage_gain", 0)

    measured["graduates_only"] = {
        "count": grad_count,
        "avg_wage_gain": grad_avg_wage,
        "total_wage_gains": round(grad_count * grad_avg_wage, 2),
    }

    print(f"\nGraduates Only (225%+ FPL):")
    print(f"  Count: {grad_count}")
    print(f"  Avg wage gain: ${grad_avg_wage:,.0f}")

    # All positive movers (Tiers 1-4)
    positive_tiers = ["graduate", "tier2_150plus", "tier3_100plus", "tier4_improved_50plus"]
    positive_count = sum(tier_stats.get(t, {}).get("count", 0) for t in positive_tiers)

    measured["positive_movers"] = {
        "count": positive_count,
        "tiers_included": positive_tiers,
    }

    print(f"\nPositive Movers (Tiers 1-4):")
    print(f"  Count: {positive_count}")

    # Children impact
    total_families = len(mr)
    avg_children = PROJECTION_ASSUMPTIONS["avg_children_per_family"]
    total_children = int(total_families * avg_children)

    measured["children"] = {
        "total_estimated": total_children,
        "avg_per_family": avg_children,
        "note": "Estimated based on household size data",
    }

    print(f"\nChildren in Program Households:")
    print(f"  Total (estimated): {total_children}")

    return measured


def calculate_tier1_roi(measured, investment):
    """
    TIER 1: CONSERVATIVE / PROVABLE ROI
    No projections, no assumptions beyond measured data.
    Purpose: Floor estimate for skeptical audiences.
    """
    print("\n" + "="*60)
    print("TIER 1 ROI: CONSERVATIVE / PROVABLE")
    print("="*60)

    annual_gains = measured["all_participants"]["total_annual_wage_gains"]

    tier1 = {
        "methodology": "Measured annual wage gains only. No projections.",
        "appropriate_audience": "Skeptical funders, evaluators, legislators wanting floor estimates",
        "investment_denominator": investment,
    }

    # Simple annual return
    annual_return_per_dollar = annual_gains / investment if investment > 0 else 0

    # Break-even (undiscounted)
    break_even_years = investment / annual_gains if annual_gains > 0 else float('inf')

    # Cost per $1 income generated
    cost_per_dollar_income = investment / annual_gains if annual_gains > 0 else float('inf')

    tier1["metrics"] = {
        "documented_annual_wage_gains": round(annual_gains, 0),
        "annual_return_per_dollar_invested": round(annual_return_per_dollar, 4),
        "break_even_years_undiscounted": round(break_even_years, 1) if break_even_years != float('inf') else "N/A",
        "cost_per_dollar_income_generated": round(cost_per_dollar_income, 2) if cost_per_dollar_income != float('inf') else "N/A",
    }

    tier1["benchmarks"] = {
        "project_quest": {"cost_per_dollar": 0.30, "note": "14-year RCT follow-up"},
        "year_up": {"cost_per_dollar": 1.30, "note": "~$30K/participant"},
        "euc_comparison": f"EUC: ${cost_per_dollar_income:.2f}" if cost_per_dollar_income != float('inf') else "N/A",
    }

    tier1["caveats"] = [
        "Assumes all measured wage gains persist for at least 1 year",
        "Does not account for what would have happened without program (no RCT yet)",
        "Uses full $25M investment as denominator, not spent-to-date",
    ]

    print(f"\nTier 1 Metrics:")
    print(f"  Annual wage gains (measured): ${annual_gains:,.0f}")
    print(f"  Return per $1 invested (annual): ${annual_return_per_dollar:.4f}")
    print(f"  Break-even period: {break_even_years:.1f} years" if break_even_years != float('inf') else "  Break-even: N/A (no gains)")
    print(f"  Cost per $1 income: ${cost_per_dollar_income:.2f}" if cost_per_dollar_income != float('inf') else "  Cost per $1: N/A")

    print(f"\nBenchmark Comparison:")
    print(f"  Project QUEST: $0.30 per $1 income (14-yr RCT)")
    print(f"  Year Up: $1.30 per $1 income")

    return tier1


def calculate_tier2_roi(measured, tier_stats, investment):
    """
    TIER 2: TAXPAYER ROI
    Tax revenue generated + tiered benefits savings.
    Purpose: Government/legislative audiences.
    """
    print("\n" + "="*60)
    print("TIER 2 ROI: TAXPAYER PERSPECTIVE")
    print("="*60)

    annual_gains = measured["all_participants"]["total_annual_wage_gains"]

    tier2 = {
        "methodology": "Tax revenue from wage gains + estimated benefits cost avoidance by FPL tier",
        "appropriate_audience": "State legislators, TANF administrators, taxpayer advocates",
        "investment_denominator": investment,
    }

    # A. TAX REVENUE
    fica = annual_gains * TAX_RATES["fica_total"]
    federal = annual_gains * TAX_RATES["federal_income_effective"]
    state = annual_gains * TAX_RATES["state_income"]
    sales = annual_gains * TAX_RATES["sales_tax_rate"] * TAX_RATES["sales_tax_spending_share"]

    total_tax_revenue = fica + federal + state + sales

    tier2["tax_revenue"] = {
        "fica_employer_employee": round(fica, 0),
        "federal_income_effective_10pct": round(federal, 0),
        "state_income_tn_none": round(state, 0),
        "sales_tax_on_spending": round(sales, 0),
        "total_annual": round(total_tax_revenue, 0),
    }

    print(f"\nA. Tax Revenue Generated (Annual):")
    print(f"  FICA (15.3%): ${fica:,.0f}")
    print(f"  Federal Income (10% eff): ${federal:,.0f}")
    print(f"  State Income: $0 (TN has none)")
    print(f"  Sales Tax (8% × 60%): ${sales:,.0f}")
    print(f"  TOTAL: ${total_tax_revenue:,.0f}")

    # B. BENEFITS COST AVOIDANCE (tiered)
    benefits_savings = {}

    # Graduates (225%+) - exit most benefits
    grad_count = tier_stats.get("graduate", {}).get("count", 0)
    grad_savings = grad_count * (
        BENEFITS_VALUES["tenncare_adult"] +
        BENEFITS_VALUES["snap_household"] +
        BENEFITS_VALUES["tanf_cash"] +
        BENEFITS_VALUES["childcare_full"]
    )
    benefits_savings["graduates_225plus"] = {
        "count": grad_count,
        "per_family_savings": round(BENEFITS_VALUES["tenncare_adult"] + BENEFITS_VALUES["snap_household"] + BENEFITS_VALUES["tanf_cash"] + BENEFITS_VALUES["childcare_full"], 0),
        "total": round(grad_savings, 0),
        "benefits_exited": ["TennCare adult", "SNAP", "TANF cash", "Childcare subsidy"],
    }

    # Tier 2 (150%+) - exit SNAP, TANF, keep TennCare
    tier2_count = tier_stats.get("tier2_150plus", {}).get("count", 0)
    tier2_savings = tier2_count * (
        BENEFITS_VALUES["snap_household"] +
        BENEFITS_VALUES["tanf_cash"] +
        BENEFITS_VALUES["childcare_reduced"]
    )
    benefits_savings["tier2_150plus"] = {
        "count": tier2_count,
        "per_family_savings": round(BENEFITS_VALUES["snap_household"] + BENEFITS_VALUES["tanf_cash"] + BENEFITS_VALUES["childcare_reduced"], 0),
        "total": round(tier2_savings, 0),
        "benefits_exited": ["SNAP", "TANF cash", "Childcare (reduced)"],
    }

    # Tier 3 (100%+) - exit TANF, reduced SNAP
    tier3_count = tier_stats.get("tier3_100plus", {}).get("count", 0)
    tier3_savings = tier3_count * (
        BENEFITS_VALUES["tanf_cash"] +
        BENEFITS_VALUES["snap_household"] * 0.5  # Reduced SNAP
    )
    benefits_savings["tier3_100plus"] = {
        "count": tier3_count,
        "per_family_savings": round(BENEFITS_VALUES["tanf_cash"] + BENEFITS_VALUES["snap_household"] * 0.5, 0),
        "total": round(tier3_savings, 0),
        "benefits_exited": ["TANF cash", "SNAP (reduced)"],
    }

    # Tier 4 - marginal SNAP reduction only
    tier4_count = tier_stats.get("tier4_improved_50plus", {}).get("count", 0)
    tier4_savings = tier4_count * 1000  # Marginal
    benefits_savings["tier4_improved"] = {
        "count": tier4_count,
        "per_family_savings": 1000,
        "total": round(tier4_savings, 0),
        "benefits_exited": ["SNAP (marginal reduction)"],
    }

    total_benefits_savings = grad_savings + tier2_savings + tier3_savings + tier4_savings

    tier2["benefits_savings"] = {
        "by_tier": benefits_savings,
        "total_annual": round(total_benefits_savings, 0),
        "caveat": "Estimates based on FPL thresholds, not tracked benefit terminations",
    }

    print(f"\nB. Benefits Cost Avoidance (Annual Estimate):")
    print(f"  Graduates (225%+): {grad_count} families × ~$17,900 = ${grad_savings:,.0f}")
    print(f"  Tier 2 (150%+): {tier2_count} families × ~$9,900 = ${tier2_savings:,.0f}")
    print(f"  Tier 3 (100%+): {tier3_count} families × ~$5,150 = ${tier3_savings:,.0f}")
    print(f"  Tier 4 (improved): {tier4_count} families × ~$1,000 = ${tier4_savings:,.0f}")
    print(f"  TOTAL: ${total_benefits_savings:,.0f}")

    # C. COMBINED
    total_taxpayer_benefit = total_tax_revenue + total_benefits_savings

    tier2["combined"] = {
        "total_annual_taxpayer_benefit": round(total_taxpayer_benefit, 0),
        "annual_return_per_dollar": round(total_taxpayer_benefit / investment, 4) if investment > 0 else 0,
        "break_even_years": round(investment / total_taxpayer_benefit, 1) if total_taxpayer_benefit > 0 else "N/A",
        "ten_year_return_undiscounted": round(total_taxpayer_benefit * 10, 0),
    }

    print(f"\nC. Combined Taxpayer Benefit:")
    print(f"  Tax revenue: ${total_tax_revenue:,.0f}")
    print(f"  Benefits savings: ${total_benefits_savings:,.0f}")
    print(f"  TOTAL ANNUAL: ${total_taxpayer_benefit:,.0f}")
    print(f"  Return per $1 (annual): ${total_taxpayer_benefit/investment:.4f}")
    print(f"  Break-even: {investment/total_taxpayer_benefit:.1f} years" if total_taxpayer_benefit > 0 else "  Break-even: N/A")

    tier2["caveats"] = [
        "Benefits savings are ESTIMATES based on FPL thresholds",
        "Actual savings depend on individual benefit receipt and recertification timing",
        "Does not account for what would have happened without program",
        "TN-specific benefit levels used (lower than national average)",
    ]

    return tier2


def calculate_tier3_roi(measured, investment):
    """
    TIER 3: LIFECYCLE / FAMILY ROI
    Projects wage gains over working lifetime.
    Standard workforce development methodology.
    """
    print("\n" + "="*60)
    print("TIER 3 ROI: LIFECYCLE / FAMILY PERSPECTIVE")
    print("="*60)

    annual_gains = measured["all_participants"]["total_annual_wage_gains"]
    working_years = PROJECTION_ASSUMPTIONS["default_working_years"]
    discount_rate = PROJECTION_ASSUMPTIONS["discount_rate"]

    tier3 = {
        "methodology": "Annual wage gains projected over working lifetime with discount rate",
        "appropriate_audience": "Workforce development funders, program comparison",
        "investment_denominator": investment,
        "assumptions": {
            "working_years_remaining": working_years,
            "discount_rate": discount_rate,
            "note": "Age data not available; using 25 years as conservative estimate",
        },
    }

    # Present value calculation
    # PV = Annual × [(1 - (1+r)^-n) / r]
    pv_factor = (1 - (1 + discount_rate) ** -working_years) / discount_rate
    lifetime_pv_full_persistence = annual_gains * pv_factor

    # With wage fade (more realistic)
    # Year 1-5: full, Year 5-10: 80%, Year 10-25: 60%
    pv_with_fade = (
        annual_gains * ((1 - (1 + discount_rate) ** -5) / discount_rate) +  # Years 1-5
        annual_gains * 0.8 * ((1 - (1 + discount_rate) ** -5) / discount_rate) / (1 + discount_rate) ** 5 +  # Years 6-10
        annual_gains * 0.6 * ((1 - (1 + discount_rate) ** -15) / discount_rate) / (1 + discount_rate) ** 10  # Years 11-25
    )

    tier3["projections"] = {
        "full_persistence": {
            "lifetime_pv": round(lifetime_pv_full_persistence, 0),
            "roi_ratio": round(lifetime_pv_full_persistence / investment, 1) if investment > 0 else 0,
            "assumption": "Wage gains persist unchanged for 25 years",
        },
        "with_fade": {
            "lifetime_pv": round(pv_with_fade, 0),
            "roi_ratio": round(pv_with_fade / investment, 1) if investment > 0 else 0,
            "assumption": "Wage gains fade: 100% years 1-5, 80% years 6-10, 60% years 11-25",
        },
    }

    print(f"\nLifecycle Projections:")
    print(f"  Annual wage gains: ${annual_gains:,.0f}")
    print(f"  Discount rate: {discount_rate*100:.0f}%")
    print(f"  Working years assumed: {working_years}")
    print(f"\n  Full Persistence Scenario:")
    print(f"    Lifetime PV: ${lifetime_pv_full_persistence:,.0f}")
    print(f"    ROI: {lifetime_pv_full_persistence/investment:.1f}:1")
    print(f"\n  With Wage Fade Scenario (more realistic):")
    print(f"    Lifetime PV: ${pv_with_fade:,.0f}")
    print(f"    ROI: {pv_with_fade/investment:.1f}:1")

    # Benchmark comparison
    tier3["benchmarks"] = {
        "project_quest": {"lifetime_roi": "2.34:1", "note": "14-year RCT, $4,434/yr gains"},
        "year_up": {"lifetime_roi": "2.46:1", "note": "Social return on investment"},
        "jeremiah_program": {"lifetime_roi": "4:1", "note": "Wilder SROI methodology"},
    }

    tier3["caveats"] = [
        "PROJECTION: Assumes wage gains persist; research shows effects often fade",
        "Working years assumed at 25; actual varies by participant age",
        "Without RCT, cannot claim causation—association only",
        "Sensitivity analysis recommended for key assumptions",
    ]

    return tier3


def calculate_tier4_roi(measured, investment):
    """
    TIER 4: INTERGENERATIONAL / SOCIETAL ROI
    Includes potential effects on children.
    Highest potential but most speculative.
    """
    print("\n" + "="*60)
    print("TIER 4 ROI: INTERGENERATIONAL / SOCIETAL")
    print("="*60)

    annual_gains = measured["all_participants"]["total_annual_wage_gains"]
    total_children = measured["children"]["total_estimated"]
    avg_gain_per_family = measured["all_participants"]["mean_wage_gain"]

    tier4 = {
        "methodology": "Includes research-based projections of child outcome improvements",
        "appropriate_audience": "Visionary funders, long-term impact investors",
        "investment_denominator": investment,
        "research_basis": "Chetty et al.: $1,000 childhood income increase → 1.3% higher adult earnings",
    }

    # Chetty calculation
    # Each $1,000 in family income → 1.3% higher adult earnings for children
    chetty_coefficient = PROJECTION_ASSUMPTIONS["chetty_coefficient"]
    income_increase_thousands = avg_gain_per_family / 1000

    # Assume $40K average adult earnings for children
    assumed_child_baseline_earnings = 40000
    earnings_boost_per_child = assumed_child_baseline_earnings * chetty_coefficient * income_increase_thousands
    total_child_earnings_boost = earnings_boost_per_child * total_children

    # Project over 30 years of child's working life (discounted)
    child_working_years = 30
    discount_rate = PROJECTION_ASSUMPTIONS["discount_rate"]

    # Discount factor for earnings that start ~20 years from now
    years_until_children_work = 15  # Average
    pv_factor = (1 - (1 + discount_rate) ** -child_working_years) / discount_rate
    pv_factor_delayed = pv_factor / (1 + discount_rate) ** years_until_children_work

    intergenerational_pv = total_child_earnings_boost * pv_factor_delayed

    tier4["intergenerational"] = {
        "total_children": total_children,
        "avg_family_income_increase": round(avg_gain_per_family, 0),
        "chetty_coefficient": chetty_coefficient,
        "projected_earnings_boost_per_child_annual": round(earnings_boost_per_child, 0),
        "total_children_earnings_boost_annual": round(total_child_earnings_boost, 0),
        "lifetime_pv_discounted": round(intergenerational_pv, 0),
    }

    print(f"\nIntergenerational Projections (Chetty-based):")
    print(f"  Children in program: {total_children}")
    print(f"  Avg family income increase: ${avg_gain_per_family:,.0f}")
    print(f"  Chetty coefficient: {chetty_coefficient} (1.3% per $1K)")
    print(f"  Projected boost per child (annual): ${earnings_boost_per_child:,.0f}")
    print(f"  Total annual (all children): ${total_child_earnings_boost:,.0f}")
    print(f"  Lifetime PV (discounted, delayed): ${intergenerational_pv:,.0f}")

    # Combined societal ROI
    # Use Tier 3 with-fade estimate + intergenerational
    annual_gains = measured["all_participants"]["total_annual_wage_gains"]
    working_years = 25
    pv_with_fade = (
        annual_gains * ((1 - (1 + discount_rate) ** -5) / discount_rate) +
        annual_gains * 0.8 * ((1 - (1 + discount_rate) ** -5) / discount_rate) / (1 + discount_rate) ** 5 +
        annual_gains * 0.6 * ((1 - (1 + discount_rate) ** -15) / discount_rate) / (1 + discount_rate) ** 10
    )

    total_societal_pv = pv_with_fade + intergenerational_pv

    tier4["combined_societal"] = {
        "adult_lifecycle_pv": round(pv_with_fade, 0),
        "intergenerational_pv": round(intergenerational_pv, 0),
        "total_societal_pv": round(total_societal_pv, 0),
        "societal_roi_ratio": round(total_societal_pv / investment, 1) if investment > 0 else 0,
    }

    print(f"\nCombined Societal ROI:")
    print(f"  Adult lifecycle PV: ${pv_with_fade:,.0f}")
    print(f"  Intergenerational PV: ${intergenerational_pv:,.0f}")
    print(f"  TOTAL: ${total_societal_pv:,.0f}")
    print(f"  Societal ROI: {total_societal_pv/investment:.1f}:1")

    tier4["caveats"] = [
        "HIGHLY SPECULATIVE: Intergenerational effects are research-based projections, not measured",
        "Chetty research based on different populations; applicability to rural TN uncertain",
        "Effects won't be observable for 15-20 years",
        "Represents potential, not proven impact",
        "Should not be primary ROI cited; use for 'comprehensive potential' framing",
    ]

    # Red flag check
    if total_societal_pv / investment > 10:
        tier4["red_flag"] = "WARNING: ROI >10:1 may indicate overclaiming. Verify assumptions."

    return tier4


def calculate_sensitivity_analysis(measured, investment):
    """
    Sensitivity analysis on key assumptions.
    Shows how ROI changes with different inputs.
    """
    print("\n" + "="*60)
    print("SENSITIVITY ANALYSIS")
    print("="*60)

    annual_gains = measured["all_participants"]["total_annual_wage_gains"]
    discount_rate = PROJECTION_ASSUMPTIONS["discount_rate"]

    sensitivity = {
        "methodology": "Varies key assumptions to show range of outcomes",
    }

    # 1. Attribution sensitivity
    # Without RCT, we don't know how much is truly attributable to program
    print("\n1. ATTRIBUTION (What portion of gains due to program?):")
    attribution_scenarios = {}
    for attribution_pct in [100, 70, 50, 30]:
        attributed_gains = annual_gains * (attribution_pct / 100)
        simple_roi = attributed_gains / investment * 25  # 25 year lifecycle
        attribution_scenarios[f"{attribution_pct}pct"] = {
            "attributed_annual_gains": round(attributed_gains, 0),
            "implied_lifecycle_roi": round(simple_roi, 1),
        }
        print(f"  {attribution_pct}% attribution: ${attributed_gains:,.0f}/yr → {simple_roi:.1f}:1 ROI")

    sensitivity["attribution"] = {
        "scenarios": attribution_scenarios,
        "note": "RCT will reveal actual attribution; Building Nebraska Families showed 0% attribution",
    }

    # 2. Wage persistence sensitivity
    print("\n2. WAGE PERSISTENCE (Do gains last?):")
    persistence_scenarios = {}
    for persistence in ["full", "moderate_fade", "rapid_fade"]:
        if persistence == "full":
            multiplier = 25
            desc = "100% persistence, 25 years"
        elif persistence == "moderate_fade":
            multiplier = 15  # Equivalent to ~60% persistence
            desc = "Fade to 60% by year 10"
        else:
            multiplier = 8  # Equivalent to rapid fade
            desc = "Fade to 30% by year 5"

        pv = annual_gains * multiplier
        persistence_scenarios[persistence] = {
            "description": desc,
            "lifetime_value": round(pv, 0),
            "roi_ratio": round(pv / investment, 1),
        }
        print(f"  {persistence}: ${pv:,.0f} → {pv/investment:.1f}:1 ROI")

    sensitivity["wage_persistence"] = {
        "scenarios": persistence_scenarios,
        "note": "Research shows workforce gains often fade; long-term follow-up rare",
    }

    # 3. Investment denominator sensitivity
    print("\n3. INVESTMENT DENOMINATOR:")
    denominator_scenarios = {}
    for denom, value in [("full_25m", 25_000_000), ("annual_program_cost", 6_000_000), ("marginal_per_family", 7_000)]:
        if denom == "marginal_per_family":
            # Per-family ROI
            avg_gain = measured["all_participants"]["mean_wage_gain"]
            roi = avg_gain * 25 / value if value > 0 else 0
            denominator_scenarios[denom] = {
                "value": value,
                "roi_ratio": round(roi, 1),
                "note": "Useful for marginal cost analysis",
            }
            print(f"  Per-family marginal (${value:,}): {roi:.1f}:1 ROI")
        else:
            roi = annual_gains * 25 / value if value > 0 else 0
            denominator_scenarios[denom] = {
                "value": value,
                "roi_ratio": round(roi, 1),
            }
            print(f"  {denom} (${value:,}): {roi:.1f}:1 ROI")

    sensitivity["denominator"] = {
        "scenarios": denominator_scenarios,
        "recommendation": "Use $25M for consistency; note if different denominator used",
    }

    return sensitivity


def create_summary_table(tier1, tier2, tier3, tier4, measured):
    """
    Create a summary table that's internally consistent.
    """
    summary = {
        "generated_at": datetime.now().isoformat(),
        "data_basis": {
            "total_families_served": measured["all_participants"]["count_with_data"],
            "total_measured_wage_gains": measured["all_participants"]["total_annual_wage_gains"],
            "children_impacted": measured["children"]["total_estimated"],
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
    }

    return summary


def main():
    print("="*60)
    print("EUC ROI CALCULATION - DEFENSIBLE METRICS")
    print("="*60)
    print(f"Timestamp: {datetime.now().isoformat()}")

    # Load data
    monthly_review, baseline = load_data()

    # Assess quality
    quality_report, clean_mr = assess_data_quality(monthly_review, baseline)

    # Calculate tiers
    tier_stats, complete_data = calculate_fpl_tiers(clean_mr)

    # Calculate measured outcomes
    measured = calculate_measured_outcomes(clean_mr, tier_stats)

    # Investment denominator
    investment = PROGRAM_CONSTANTS["total_investment"]

    # Calculate all ROI tiers
    tier1 = calculate_tier1_roi(measured, investment)
    tier2 = calculate_tier2_roi(measured, tier_stats, investment)
    tier3 = calculate_tier3_roi(measured, investment)
    tier4 = calculate_tier4_roi(measured, investment)

    # Sensitivity analysis
    sensitivity = calculate_sensitivity_analysis(measured, investment)

    # Summary table
    summary = create_summary_table(tier1, tier2, tier3, tier4, measured)

    # Compile full output
    roi_data = {
        "metadata": {
            "generated_at": datetime.now().isoformat(),
            "methodology_version": "1.0",
            "investment_denominator": investment,
            "discount_rate": PROJECTION_ASSUMPTIONS["discount_rate"],
        },
        "data_quality": quality_report,
        "fpl_tiers": tier_stats,
        "measured_outcomes": measured,
        "tier1_conservative": tier1,
        "tier2_taxpayer": tier2,
        "tier3_lifecycle": tier3,
        "tier4_intergenerational": tier4,
        "sensitivity_analysis": sensitivity,
        "summary": summary,
        "constants_used": {
            "program": PROGRAM_CONSTANTS,
            "tax_rates": TAX_RATES,
            "benefits_values": BENEFITS_VALUES,
            "projection_assumptions": PROJECTION_ASSUMPTIONS,
        },
    }

    # Save to JSON
    output_path = OUTPUT_DIR / "roi-calculations.json"
    with open(output_path, 'w') as f:
        json.dump(roi_data, f, indent=2, default=str)

    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"\nOutput saved to: {output_path}")

    print("\nROI Summary (all using $25M denominator):")
    print("-" * 50)
    print(f"  Tier 1 (Conservative): ${tier1['metrics']['annual_return_per_dollar_invested']:.4f} per $1 (annual)")
    print(f"  Tier 2 (Taxpayer): ${tier2['combined']['annual_return_per_dollar']:.4f} per $1 (annual)")
    print(f"  Tier 3 (Lifecycle w/ fade): {tier3['projections']['with_fade']['roi_ratio']}:1")
    print(f"  Tier 4 (Societal): {tier4['combined_societal']['societal_roi_ratio']}:1")

    print("\n⚠️  KEY CAVEAT: RCT pending. Without it, these are associations, not proven causation.")
    print("    Building Nebraska Families (only other rural TANF RCT) showed zero impact.")


if __name__ == "__main__":
    main()
