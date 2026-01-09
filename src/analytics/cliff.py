"""
Benefit cliff analysis for EUC dashboard.
Analyzes families in cliff zones and their risk exposure.
"""
import pandas as pd
import numpy as np
from typing import Dict, Any, List
from datetime import datetime

from .metrics import (
    load_processed_data,
    FPL_BASE,
    FPL_PER_ADDITIONAL,
)

# Benefit values for cliff calculations
BENEFIT_VALUES = {
    "snap_annual": 4800,           # Average SNAP per family
    "tenncare_adult": 6000,        # TennCare adult coverage
    "childcare_per_child": 6000,   # Childcare subsidy per child
    "liheap_annual": 600,          # LIHEAP utility assistance
    "school_lunch_per_child": 1800, # School lunch benefit per child
}

# Cliff zone definitions
CLIFF_ZONES = [
    {
        "id": "snap_tenncare",
        "name": "SNAP/TennCare Cliff",
        "range": "100-130%",
        "fpl_low": 100,
        "fpl_high": 130,
        "benefits_affected": ["SNAP (~$4,800/yr)", "TennCare adult (~$6,000/yr)"],
        "color": "rose",
        "risk_level": "high",
        "calc_benefits": lambda children: BENEFIT_VALUES["snap_annual"] + BENEFIT_VALUES["tenncare_adult"],
    },
    {
        "id": "liheap_childcare",
        "name": "LIHEAP/Childcare Cliff",
        "range": "130-150%",
        "fpl_low": 130,
        "fpl_high": 150,
        "benefits_affected": ["Childcare subsidy (~$6K/child)", "LIHEAP (~$600/yr)"],
        "color": "amber",
        "risk_level": "high",
        "calc_benefits": lambda children: BENEFIT_VALUES["childcare_per_child"] * max(children, 1) + BENEFIT_VALUES["liheap_annual"],
    },
    {
        "id": "deep_cliff",
        "name": "Deep Cliff Zone",
        "range": "150-185%",
        "fpl_low": 150,
        "fpl_high": 185,
        "benefits_affected": ["Childcare loss imminent", "School lunch reduction"],
        "color": "orange",
        "risk_level": "medium",
        "calc_benefits": lambda children: BENEFIT_VALUES["childcare_per_child"] * max(children, 1) + BENEFIT_VALUES["school_lunch_per_child"] * max(children, 1),
    },
    {
        "id": "near_graduation",
        "name": "Near Graduation",
        "range": "185-225%",
        "fpl_low": 185,
        "fpl_high": 225,
        "benefits_affected": ["Minimal immediate risk", "Focus on graduation"],
        "color": "emerald",
        "risk_level": "low",
        "calc_benefits": lambda children: 0,
    },
]


def calculate_fpl_for_row(row: pd.Series, income_col: str, hh_col: str = None) -> float:
    """Calculate FPL percentage for a row."""
    if income_col not in row.index or pd.isna(row[income_col]) or row[income_col] <= 0:
        return None
    annual_income = row[income_col] * 12
    hh_size = 3  # Default
    if hh_col and hh_col in row.index:
        hh_val = row[hh_col]
        if pd.notna(hh_val):
            hh_size = max(1, int(hh_val))
    poverty_line = FPL_BASE + FPL_PER_ADDITIONAL * (hh_size - 1)
    return (annual_income / poverty_line) * 100


def calculate_cliff_analysis(data: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
    """
    Calculate benefit cliff analysis from processed data.
    """
    assessments = data["assessments"]
    participants = data["participants"]

    # Get most recent assessment per participant
    assessments['assessment_date'] = pd.to_datetime(assessments['assessment_date'], errors='coerce')
    assessments_sorted = assessments.sort_values('assessment_date')
    latest = assessments_sorted.groupby('participant_id').last().reset_index()

    # Find income and household columns
    income_col = 'total_monthly_income'
    hh_cols = [c for c in latest.columns if 'how many' in c.lower() and 'adults' in c.lower()]
    hh_col = hh_cols[0] if hh_cols else None

    # Find children column
    children_cols = [c for c in latest.columns if 'how many' in c.lower() and 'children' in c.lower()]
    children_col = children_cols[0] if children_cols else None

    # Calculate FPL for each participant
    def calc_fpl(row):
        return calculate_fpl_for_row(row, income_col, hh_col)

    latest['fpl_pct'] = latest.apply(calc_fpl, axis=1)

    # Get household size and children count
    if hh_col:
        latest['household_size'] = pd.to_numeric(latest[hh_col], errors='coerce').fillna(3)
    else:
        latest['household_size'] = 3

    if children_col:
        latest['children'] = pd.to_numeric(latest[children_col], errors='coerce').fillna(1)
    else:
        latest['children'] = latest['household_size'] - 1  # Estimate

    # Filter to those with FPL data
    with_fpl = latest[latest['fpl_pct'].notna()].copy()
    total_with_fpl = len(with_fpl)

    # Classify into cliff tiers
    def classify_tier(fpl):
        if pd.isna(fpl):
            return None
        for zone in CLIFF_ZONES:
            if zone["fpl_low"] <= fpl < zone["fpl_high"]:
                return zone["id"]
        return None

    with_fpl['cliff_tier'] = with_fpl['fpl_pct'].apply(classify_tier)

    # Calculate tier statistics
    tiers = []
    total_benefits_at_risk = 0
    total_families_in_cliff = 0
    total_children_at_risk = 0

    for zone in CLIFF_ZONES:
        tier_families = with_fpl[with_fpl['cliff_tier'] == zone["id"]]
        family_count = len(tier_families)

        if family_count > 0:
            children_in_tier = int(tier_families['children'].sum())
            benefits_at_risk = sum(
                zone["calc_benefits"](row['children'])
                for _, row in tier_families.iterrows()
            )
            avg_per_family = int(benefits_at_risk / family_count)
        else:
            children_in_tier = 0
            benefits_at_risk = 0
            avg_per_family = 0

        tiers.append({
            "id": zone["id"],
            "name": zone["name"],
            "range": zone["range"],
            "fpl_low": zone["fpl_low"],
            "fpl_high": zone["fpl_high"],
            "families": family_count,
            "benefits_at_risk": int(benefits_at_risk),
            "avg_per_family": avg_per_family,
            "children": children_in_tier,
            "benefits_affected": zone["benefits_affected"],
            "color": zone["color"],
            "risk_level": zone["risk_level"],
        })

        if zone["risk_level"] in ["high", "medium"]:
            total_benefits_at_risk += benefits_at_risk
            total_families_in_cliff += family_count
            total_children_at_risk += children_in_tier

    # County breakdown
    county_col = 'County'
    if county_col in with_fpl.columns:
        cliff_zone_families = with_fpl[with_fpl['cliff_tier'].notna()]
        county_data = []
        for county in cliff_zone_families[county_col].dropna().unique():
            county_total = len(with_fpl[with_fpl[county_col] == county])
            county_cliff = len(cliff_zone_families[cliff_zone_families[county_col] == county])
            cliff_pct = int(county_cliff / county_total * 100) if county_total > 0 else 0
            if county_cliff > 0:
                county_data.append({
                    "county": county,
                    "in_cliff_zone": county_cliff,
                    "total": county_total,
                    "cliff_pct": cliff_pct,
                })
        county_data.sort(key=lambda x: x["cliff_pct"], reverse=True)
    else:
        county_data = []

    # Household size impact
    hh_size_data = []
    for size in [2, 3, 4, 5]:
        size_families = with_fpl[with_fpl['household_size'] == size]
        if len(size_families) > 10:
            graduates = len(size_families[size_families['fpl_pct'] >= 225])
            grad_rate = int(graduates / len(size_families) * 100)
            hh_size_data.append({
                "size": size,
                "graduation_rate": grad_rate,
                "sample_size": len(size_families),
            })

    return {
        "metadata": {
            "generated_at": datetime.now().strftime("%Y-%m-%d"),
            "data_as_of": datetime.now().strftime("%B %d, %Y"),
            "families_analyzed": total_with_fpl,
            "total_participants": len(participants),
        },
        "summary": {
            "families_in_cliff_zone": total_families_in_cliff,
            "total_benefits_at_risk": int(total_benefits_at_risk),
            "avg_exposure_per_family": int(total_benefits_at_risk / total_families_in_cliff) if total_families_in_cliff > 0 else 0,
            "children_at_risk": total_children_at_risk,
        },
        "tiers": tiers,
        "county_concentration": {
            "headline": "Cliff Risk by County",
            "data": county_data[:10],  # Top 10 counties
        },
        "household_size_impact": {
            "headline": "Larger Families Face Steeper Odds",
            "data": hh_size_data,
            "insight": "Larger households face compounded childcare costs and slower progress",
        },
        "navigator_actions": [
            {
                "priority": 1,
                "action": "Address cliff fear with data",
                "rationale": "Most families who cross cliffs continue upward",
                "target": f"All {total_families_in_cliff} cliff-zone families",
            },
            {
                "priority": 2,
                "action": "Extra support for large families",
                "rationale": "Higher childcare costs compound cliff exposure",
                "target": "Families with 4+ members",
            },
            {
                "priority": 3,
                "action": "County-focused outreach",
                "rationale": f"Top counties have highest cliff concentration",
                "target": f"{county_data[0]['county'] if county_data else 'N/A'} and {county_data[1]['county'] if len(county_data) > 1 else 'N/A'} county navigators",
            },
        ],
    }


if __name__ == "__main__":
    data = load_processed_data()
    cliff = calculate_cliff_analysis(data)
    print(f"Families in cliff zone: {cliff['summary']['families_in_cliff_zone']}")
    print(f"Benefits at risk: ${cliff['summary']['total_benefits_at_risk']:,}")
    print("\nTiers:")
    for tier in cliff['tiers']:
        print(f"  {tier['name']}: {tier['families']} families, ${tier['benefits_at_risk']:,}")
