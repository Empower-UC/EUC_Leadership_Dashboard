"""
Dashboard JSON generator.
Generates all JSON files needed by the dashboard from processed data.
"""
import json
import pandas as pd
from pathlib import Path
from datetime import datetime
from typing import Dict, Any

from .metrics import load_processed_data, calculate_success_metrics
from .roi import calculate_full_roi


def load_journey_data() -> pd.DataFrame:
    """Load the master participant journeys file."""
    journey_path = Path(__file__).parent.parent.parent / "data" / "processed" / "participant_journeys.csv"
    return pd.read_csv(journey_path)


def generate_roi_json(data: Dict[str, pd.DataFrame], output_dir: Path) -> Dict[str, Any]:
    """Generate ROI calculations JSON."""
    roi_data = calculate_full_roi(data)

    output_path = output_dir / "roi-calculations.json"
    with open(output_path, 'w') as f:
        json.dump(roi_data, f, indent=2, default=str)

    print(f"  Generated {output_path.name}")
    return roi_data


def generate_cliff_json(journeys: pd.DataFrame, output_dir: Path) -> Dict[str, Any]:
    """Generate cliff analysis JSON from journey data."""
    # Filter to those with FPL data
    with_fpl = journeys[journeys['current_fpl'].notna()].copy()

    # Cliff zone definitions
    cliff_zones = [
        {"id": "snap_tenncare", "name": "SNAP/TennCare Cliff", "range": "100-130%",
         "fpl_low": 100, "fpl_high": 130, "color": "rose", "risk_level": "high",
         "benefits_affected": ["SNAP (~$4,800/yr)", "TennCare adult (~$6,000/yr)"]},
        {"id": "liheap_childcare", "name": "LIHEAP/Childcare Cliff", "range": "130-150%",
         "fpl_low": 130, "fpl_high": 150, "color": "amber", "risk_level": "high",
         "benefits_affected": ["Childcare subsidy (~$6K/child)", "LIHEAP (~$600/yr)"]},
        {"id": "deep_cliff", "name": "Deep Cliff Zone", "range": "150-185%",
         "fpl_low": 150, "fpl_high": 185, "color": "orange", "risk_level": "medium",
         "benefits_affected": ["Childcare loss imminent", "School lunch reduction"]},
        {"id": "near_graduation", "name": "Near Graduation", "range": "185-225%",
         "fpl_low": 185, "fpl_high": 225, "color": "emerald", "risk_level": "low",
         "benefits_affected": ["Minimal immediate risk", "Focus on graduation"]},
    ]

    # Calculate tier statistics
    tiers = []
    total_benefits_at_risk = 0
    total_families_in_cliff = 0
    total_children_at_risk = 0

    for zone in cliff_zones:
        tier_families = with_fpl[
            (with_fpl['current_fpl'] >= zone['fpl_low']) &
            (with_fpl['current_fpl'] < zone['fpl_high'])
        ]
        family_count = len(tier_families)

        children_in_tier = int(tier_families['household_children'].fillna(2).sum()) if family_count > 0 else 0

        # Estimate benefits at risk
        if zone['id'] == 'snap_tenncare':
            per_family = 10800  # SNAP + TennCare
        elif zone['id'] == 'liheap_childcare':
            per_family = 6600 + children_in_tier / max(family_count, 1) * 6000
        elif zone['id'] == 'deep_cliff':
            per_family = 8000
        else:
            per_family = 0

        benefits_at_risk = int(family_count * per_family)

        tiers.append({
            "id": zone["id"],
            "name": zone["name"],
            "range": zone["range"],
            "fpl_low": zone["fpl_low"],
            "fpl_high": zone["fpl_high"],
            "families": family_count,
            "benefits_at_risk": benefits_at_risk,
            "avg_per_family": int(benefits_at_risk / family_count) if family_count > 0 else 0,
            "children": children_in_tier,
            "benefits_affected": zone["benefits_affected"],
            "color": zone["color"],
            "risk_level": zone["risk_level"],
        })

        if zone['risk_level'] in ['high', 'medium']:
            total_benefits_at_risk += benefits_at_risk
            total_families_in_cliff += family_count
            total_children_at_risk += children_in_tier

    # County concentration
    county_data = []
    if 'county' in with_fpl.columns:
        cliff_families = with_fpl[
            (with_fpl['current_fpl'] >= 100) & (with_fpl['current_fpl'] < 185)
        ]
        for county in with_fpl['county'].dropna().unique():
            county_total = len(with_fpl[with_fpl['county'] == county])
            county_cliff = len(cliff_families[cliff_families['county'] == county])
            if county_cliff > 0:
                county_data.append({
                    "county": county,
                    "in_cliff_zone": county_cliff,
                    "total": county_total,
                    "cliff_pct": int(county_cliff / county_total * 100) if county_total > 0 else 0,
                })
        county_data.sort(key=lambda x: x['cliff_pct'], reverse=True)

    # Household size impact
    hh_size_data = []
    for size in [2, 3, 4, 5]:
        size_families = with_fpl[with_fpl['household_size'] == size]
        if len(size_families) >= 10:
            graduates = size_families['is_graduate'].sum()
            grad_rate = int(graduates / len(size_families) * 100) if len(size_families) > 0 else 0
            hh_size_data.append({
                "size": int(size),
                "graduation_rate": grad_rate,
                "sample_size": len(size_families),
            })

    cliff_data = {
        "metadata": {
            "generated_at": datetime.now().strftime("%Y-%m-%d"),
            "data_as_of": datetime.now().strftime("%B %d, %Y"),
            "families_analyzed": len(with_fpl),
            "total_participants": len(journeys),
        },
        "summary": {
            "families_in_cliff_zone": total_families_in_cliff,
            "total_benefits_at_risk": total_benefits_at_risk,
            "avg_exposure_per_family": int(total_benefits_at_risk / total_families_in_cliff) if total_families_in_cliff > 0 else 0,
            "children_at_risk": total_children_at_risk,
        },
        "tiers": tiers,
        "county_concentration": {
            "headline": "Cliff Risk by County",
            "data": county_data[:10],
        },
        "household_size_impact": {
            "headline": "Larger Families Face Steeper Odds",
            "data": hh_size_data,
            "insight": "Larger households face compounded childcare costs",
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
        ],
    }

    output_path = output_dir / "cliff-analysis.json"
    with open(output_path, 'w') as f:
        json.dump(cliff_data, f, indent=2)

    print(f"  Generated {output_path.name}")
    return cliff_data


def generate_temporal_json(journeys: pd.DataFrame, output_dir: Path) -> Dict[str, Any]:
    """Generate temporal insights JSON."""
    # Tenure analysis
    journeys['tenure_months'] = journeys['days_in_program'].fillna(0) / 30

    tenure_brackets = [
        {"label": "0-3 months", "min": 0, "max": 3},
        {"label": "3-6 months", "min": 3, "max": 6},
        {"label": "6-12 months", "min": 6, "max": 12},
        {"label": "12-18 months", "min": 12, "max": 18},
        {"label": "18+ months", "min": 18, "max": 999},
    ]

    tenure_data = []
    for bracket in tenure_brackets:
        bracket_families = journeys[
            (journeys['tenure_months'] >= bracket['min']) &
            (journeys['tenure_months'] < bracket['max'])
        ]
        if len(bracket_families) > 0:
            graduates = bracket_families['is_graduate'].sum()
            positive_income = (bracket_families['income_change_annual'] > 0).sum()
            avg_income_change = bracket_families['income_change_annual'].mean()
            avg_fpl_change = bracket_families['fpl_change'].mean()
            avg_days = bracket_families['days_in_program'].mean()
            success_rate = (positive_income / len(bracket_families) * 100) if len(bracket_families) > 0 else 0

            tenure_data.append({
                "bracket": bracket['label'],
                "families": len(bracket_families),
                "graduates": int(graduates),
                "graduation_rate": round(graduates / len(bracket_families) * 100, 1) if len(bracket_families) > 0 else 0,
                "positive_income_change": int(positive_income),
                "avg_income_change": round(avg_income_change, 0) if pd.notna(avg_income_change) else 0,
                # Fields needed by fundraising page
                "count": len(bracket_families),
                "success_rate": round(success_rate, 1),
                "avg_wage_gain": round(avg_income_change, 0) if pd.notna(avg_income_change) else 0,
                "avg_fpl_change": round(float(avg_fpl_change), 1) if pd.notna(avg_fpl_change) else 0,
                "avg_days": round(float(avg_days), 0) if pd.notna(avg_days) else 0,
            })

    # Cohort analysis by enrollment year
    journeys['enrollment_year'] = pd.to_datetime(journeys['enrollment_date'], errors='coerce').dt.year

    cohort_data = []
    for year in journeys['enrollment_year'].dropna().unique():
        year_families = journeys[journeys['enrollment_year'] == year]
        if len(year_families) >= 10:
            graduates = year_families['is_graduate'].sum()
            avg_income_change = year_families['income_change_annual'].mean()

            cohort_data.append({
                "year": int(year),
                "families": len(year_families),
                "graduates": int(graduates),
                "graduation_rate": round(graduates / len(year_families) * 100, 1),
                "avg_income_change": round(avg_income_change, 0) if pd.notna(avg_income_change) else 0,
            })

    cohort_data.sort(key=lambda x: x['year'])

    # Cumulative impact by month (for fundraising page)
    journeys['enrollment_month'] = pd.to_datetime(journeys['enrollment_date'], errors='coerce').dt.to_period('M')
    cumulative_impact = []
    cumulative_families = 0
    cumulative_wage_gains = 0

    for month in sorted(journeys['enrollment_month'].dropna().unique()):
        month_data = journeys[journeys['enrollment_month'] == month]
        new_families = len(month_data)
        positive_wages = month_data[month_data['income_change_annual'] > 0]
        new_wage_gains = positive_wages['income_change_annual'].sum()

        cumulative_families += new_families
        cumulative_wage_gains += new_wage_gains

        cumulative_impact.append({
            "month": str(month),
            "month_label": month.strftime('%b %Y'),
            "new_families": new_families,
            "new_wage_gains": float(new_wage_gains),
            "cumulative_families": cumulative_families,
            "cumulative_wage_gains": float(cumulative_wage_gains),
            "avg_wage_per_family": round(cumulative_wage_gains / cumulative_families, 0) if cumulative_families > 0 else 0,
        })

    temporal_data = {
        "metadata": {
            "generated_at": datetime.now().isoformat(),
        },
        "tenure_analysis": {
            "headline": "Progress by Time in Program",
            "data": tenure_data,
            "insight": "Longer tenure correlates with higher graduation rates",
        },
        "cohort_analysis": {
            "headline": "Outcomes by Enrollment Year",
            "data": cohort_data,
        },
        "key_findings": [
            f"Average time to graduation: {journeys[journeys['is_graduate']]['days_in_program'].mean():.0f} days" if journeys['is_graduate'].sum() > 0 else "No graduates yet",
            f"Families with 12+ months: {len(journeys[journeys['tenure_months'] >= 12])}",
        ],
        # For fundraising page compatibility
        "cumulative_impact": cumulative_impact,
    }

    output_path = output_dir / "temporal-insights.json"
    with open(output_path, 'w') as f:
        json.dump(temporal_data, f, indent=2, default=str)

    print(f"  Generated {output_path.name}")
    return temporal_data


def generate_overview_json(journeys: pd.DataFrame, output_dir: Path) -> Dict[str, Any]:
    """Generate overview page JSON."""
    total_participants = len(journeys)
    total_children = int(journeys['household_children'].fillna(2).sum())

    # Outcome breakdown
    def get_outcome_category(row):
        if row.get('is_graduate'):
            return 'graduated'
        status = str(row.get('enrollment_status', '')).lower()
        if status == 'accepted':
            return 'active'
        elif status == 'exited':
            return 'exited'
        elif status == 'dismissed':
            return 'dismissed'
        elif status == 'withdrawn':
            return 'withdrawn'
        return 'other'

    journeys['outcome_category'] = journeys.apply(get_outcome_category, axis=1)

    outcome_breakdown = []
    for cat in ['graduated', 'active', 'exited', 'dismissed', 'withdrawn']:
        cat_data = journeys[journeys['outcome_category'] == cat]
        if len(cat_data) > 0:
            outcome_breakdown.append({
                "category": cat,
                "count": len(cat_data),
                "avgFplChange": round(cat_data['fpl_change'].mean(), 1) if cat_data['fpl_change'].notna().any() else 0,
                "avgDays": round(cat_data['days_in_program'].mean(), 0) if cat_data['days_in_program'].notna().any() else 0,
            })

    # Wage gains (positive only)
    positive_wages = journeys[journeys['income_change_annual'] > 0]
    total_wage_gains = positive_wages['income_change_annual'].sum()

    # Average FPL change
    avg_fpl_change = journeys['fpl_change'].mean() if journeys['fpl_change'].notna().any() else 0

    # County breakdown
    county_breakdown = (
        journeys.groupby('county').size()
        .reset_index(name='count')
        .sort_values('count', ascending=False)
        .head(5)
        .to_dict('records')
    )

    # Improvement rate
    with_fpl = journeys[journeys['fpl_change'].notna()]
    improved = (with_fpl['fpl_change'] > 0).sum()
    improvement_rate = (improved / len(with_fpl) * 100) if len(with_fpl) > 0 else 0

    overview_data = {
        "generated_at": datetime.now().isoformat(),
        "totalParticipants": total_participants,
        "totalChildren": total_children,
        "outcomeBreakdown": outcome_breakdown,
        "totalWageGains": float(total_wage_gains),
        "avgFplChange": round(float(avg_fpl_change), 1),
        "countyBreakdown": county_breakdown,
        "improvementRate": round(improvement_rate, 1),
    }

    output_path = output_dir / "overview.json"
    with open(output_path, 'w') as f:
        json.dump(overview_data, f, indent=2)

    print(f"  Generated {output_path.name}")
    return overview_data


def generate_participants_json(journeys: pd.DataFrame, output_dir: Path) -> Dict[str, Any]:
    """Generate participants page JSON."""
    def safe_str(val):
        """Convert value to string, returning None for NaN/None."""
        if pd.isna(val):
            return None
        return str(val)

    def get_outcome_category(row):
        if row.get('is_graduate'):
            return 'graduated'
        status = safe_str(row.get('enrollment_status'))
        if status:
            status = status.lower()
            if status == 'accepted':
                return 'active'
            elif status == 'exited':
                return 'exited'
            elif status == 'dismissed':
                return 'dismissed'
            elif status == 'withdrawn':
                return 'withdrawn'
        return 'other'

    participants_list = []
    for _, row in journeys.iterrows():
        participants_list.append({
            "participantId": str(int(row['participant_id'])) if pd.notna(row['participant_id']) else None,
            "county": safe_str(row.get('county')),
            "enrollmentStatus": safe_str(row.get('enrollment_status')),
            "enrollmentDate": str(row.get('enrollment_date'))[:10] if pd.notna(row.get('enrollment_date')) else None,
            "navigatorName": safe_str(row.get('navigator')),
            "householdSize": int(row['household_size']) if pd.notna(row.get('household_size')) else None,
            "fplAtEnrollment": round(float(row['enrollment_fpl']), 1) if pd.notna(row.get('enrollment_fpl')) else None,
            "currentFpl": round(float(row['current_fpl']), 1) if pd.notna(row.get('current_fpl')) else None,
            "fplChange": round(float(row['fpl_change']), 1) if pd.notna(row.get('fpl_change')) else None,
            "wageChange": round(float(row['income_change_annual']), 0) if pd.notna(row.get('income_change_annual')) else None,
            "daysInProgram": int(row['days_in_program']) if pd.notna(row.get('days_in_program')) else None,
            "outcomeCategory": get_outcome_category(row),
        })

    # Metrics
    positive_wages = journeys[journeys['income_change_annual'] > 0]
    total_wage_gains = positive_wages['income_change_annual'].sum()
    avg_fpl_change = journeys['fpl_change'].mean() if journeys['fpl_change'].notna().any() else 0
    positive_outcomes = (journeys['fpl_change'] > 0).sum()

    participants_data = {
        "generated_at": datetime.now().isoformat(),
        "participants": participants_list,
        "metrics": {
            "totalFamilies": len(journeys),
            "totalWageGains": float(total_wage_gains),
            "avgFplChange": round(float(avg_fpl_change), 1),
            "positiveOutcomes": int(positive_outcomes),
        }
    }

    output_path = output_dir / "participants.json"
    with open(output_path, 'w') as f:
        json.dump(participants_data, f, indent=2)

    print(f"  Generated {output_path.name}")
    return participants_data


def generate_geography_json(journeys: pd.DataFrame, output_dir: Path) -> Dict[str, Any]:
    """Generate geography page JSON."""
    def get_outcome_category(row):
        if row.get('is_graduate'):
            return 'graduated'
        status = str(row.get('enrollment_status', '')).lower()
        if status == 'accepted':
            return 'active'
        return 'other'

    journeys['outcome_cat'] = journeys.apply(get_outcome_category, axis=1)

    counties = []
    for county in journeys['county'].dropna().unique():
        county_data = journeys[journeys['county'] == county]
        graduated = (county_data['outcome_cat'] == 'graduated').sum()
        active = (county_data['outcome_cat'] == 'active').sum()
        positive_wages = county_data[county_data['income_change_annual'] > 0]
        total_wage_gains = positive_wages['income_change_annual'].sum()
        avg_fpl = county_data['fpl_change'].mean() if county_data['fpl_change'].notna().any() else 0

        counties.append({
            "county": county,
            "total": len(county_data),
            "graduated": int(graduated),
            "active": int(active),
            "avgFplChange": round(float(avg_fpl), 1),
            "totalWageGains": float(total_wage_gains),
        })

    # Sort by total count descending
    counties.sort(key=lambda x: x['total'], reverse=True)

    geography_data = {
        "generated_at": datetime.now().isoformat(),
        "counties": counties,
    }

    output_path = output_dir / "geography.json"
    with open(output_path, 'w') as f:
        json.dump(geography_data, f, indent=2)

    print(f"  Generated {output_path.name}")
    return geography_data


def generate_insights_json(journeys: pd.DataFrame, output_dir: Path) -> Dict[str, Any]:
    """Generate insights page JSON."""
    # FPL terciles
    with_fpl = journeys[journeys['enrollment_fpl'].notna()].copy()
    fpl_terciles = []
    tercile_defs = [
        ("Deep Poverty (<50%)", 0, 50),
        ("Poverty (50-100%)", 50, 100),
        ("Near Poverty (>100%)", 100, 9999),
    ]
    for name, low, high in tercile_defs:
        tercile_data = with_fpl[(with_fpl['enrollment_fpl'] >= low) & (with_fpl['enrollment_fpl'] < high)]
        if len(tercile_data) > 0:
            fpl_terciles.append({
                "tercile": name,
                "count": len(tercile_data),
                "avgStartFpl": round(float(tercile_data['enrollment_fpl'].mean()), 0),
                "avgFplChange": round(float(tercile_data['fpl_change'].mean()), 1) if tercile_data['fpl_change'].notna().any() else 0,
            })

    # Duration bins
    journeys['tenure_days'] = journeys['days_in_program'].fillna(0)
    duration_bins = []
    bin_defs = [
        ("0-3 mo", 0, 90),
        ("3-6 mo", 90, 180),
        ("6-9 mo", 180, 270),
        ("9-12 mo", 270, 365),
        ("12-18 mo", 365, 540),
        ("18+ mo", 540, 99999),
    ]
    for name, low, high in bin_defs:
        bin_data = journeys[(journeys['tenure_days'] >= low) & (journeys['tenure_days'] < high)]
        if len(bin_data) > 0:
            duration_bins.append({
                "durationBin": name,
                "count": len(bin_data),
                "avgFplChange": round(float(bin_data['fpl_change'].mean()), 1) if bin_data['fpl_change'].notna().any() else 0,
                "avgDays": round(float(bin_data['days_in_program'].mean()), 0) if bin_data['days_in_program'].notna().any() else 0,
            })

    # County performance (min 10 participants)
    county_performance = []
    for county in journeys['county'].dropna().unique():
        county_data = journeys[journeys['county'] == county]
        if len(county_data) >= 10:
            positive_wages = county_data[county_data['income_change_annual'] > 0]
            county_performance.append({
                "county": county,
                "count": len(county_data),
                "avgFplChange": round(float(county_data['fpl_change'].mean()), 1) if county_data['fpl_change'].notna().any() else 0,
                "totalWageGains": float(positive_wages['income_change_annual'].sum()),
            })
    county_performance.sort(key=lambda x: x['avgFplChange'], reverse=True)

    # Employment subgroup (if available)
    employment_subgroup = []
    if 'employed_at_enrollment' in journeys.columns:
        for employed in [True, False]:
            emp_data = journeys[journeys['employed_at_enrollment'] == employed]
            if len(emp_data) > 0:
                employment_subgroup.append({
                    "employed": employed,
                    "count": len(emp_data),
                    "avgFplChange": round(float(emp_data['fpl_change'].mean()), 1) if emp_data['fpl_change'].notna().any() else 0,
                    "avgWageChange": round(float(emp_data['income_change_annual'].mean()), 0) if emp_data['income_change_annual'].notna().any() else 0,
                })

    # Overall stats
    with_data = journeys[(journeys['days_in_program'].notna()) & (journeys['fpl_change'].notna())]
    avg_days = with_data['days_in_program'].mean() if len(with_data) > 0 else 0
    avg_fpl_change = with_data['fpl_change'].mean() if len(with_data) > 0 else 0

    # === SUCCESS PREDICTORS ===
    # Graduation rates by entry FPL bracket
    success_by_fpl = []
    fpl_brackets = [
        ("Deep Poverty (<50%)", 0, 50),
        ("Poverty (50-100%)", 50, 100),
        ("Near Poverty (100-150%)", 100, 150),
        ("Above 150%", 150, 9999),
    ]
    total_graduates = journeys['is_graduate'].sum()

    for name, low, high in fpl_brackets:
        bracket_data = with_fpl[(with_fpl['enrollment_fpl'] >= low) & (with_fpl['enrollment_fpl'] < high)]
        if len(bracket_data) >= 5:
            graduates = bracket_data['is_graduate'].sum()
            grad_rate = (graduates / len(bracket_data) * 100) if len(bracket_data) > 0 else 0
            success_by_fpl.append({
                "bracket": name,
                "fplRange": f"{low}-{high if high < 9999 else ''}%",
                "families": len(bracket_data),
                "graduates": int(graduates),
                "graduationRate": round(grad_rate, 1),
                "avgFplChange": round(float(bracket_data['fpl_change'].mean()), 1) if bracket_data['fpl_change'].notna().any() else 0,
            })

    # Graduation rates by household size
    success_by_household = []
    for size in range(2, 8):
        size_data = journeys[journeys['household_size'] == size]
        if len(size_data) >= 10:
            graduates = size_data['is_graduate'].sum()
            grad_rate = (graduates / len(size_data) * 100) if len(size_data) > 0 else 0
            success_by_household.append({
                "householdSize": int(size),
                "families": len(size_data),
                "graduates": int(graduates),
                "graduationRate": round(grad_rate, 1),
                "avgFplChange": round(float(size_data['fpl_change'].mean()), 1) if size_data['fpl_change'].notna().any() else 0,
            })

    # Graduation rates by program duration
    success_by_duration = []
    duration_defs = [
        ("0-6 months", 0, 180),
        ("6-12 months", 180, 365),
        ("12-18 months", 365, 540),
        ("18+ months", 540, 99999),
    ]
    for name, low, high in duration_defs:
        duration_data = journeys[(journeys['tenure_days'] >= low) & (journeys['tenure_days'] < high)]
        if len(duration_data) >= 10:
            graduates = duration_data['is_graduate'].sum()
            grad_rate = (graduates / len(duration_data) * 100) if len(duration_data) > 0 else 0
            success_by_duration.append({
                "duration": name,
                "families": len(duration_data),
                "graduates": int(graduates),
                "graduationRate": round(grad_rate, 1),
                "avgFplChange": round(float(duration_data['fpl_change'].mean()), 1) if duration_data['fpl_change'].notna().any() else 0,
            })

    # Graduation rates by county (top performers)
    success_by_county = []
    for county in journeys['county'].dropna().unique():
        county_data = journeys[journeys['county'] == county]
        if len(county_data) >= 15:
            graduates = county_data['is_graduate'].sum()
            grad_rate = (graduates / len(county_data) * 100) if len(county_data) > 0 else 0
            success_by_county.append({
                "county": county,
                "families": len(county_data),
                "graduates": int(graduates),
                "graduationRate": round(grad_rate, 1),
            })
    success_by_county.sort(key=lambda x: x['graduationRate'], reverse=True)

    # Key insights for funders
    best_fpl_bracket = max(success_by_fpl, key=lambda x: x['graduationRate']) if success_by_fpl else None
    best_duration = max(success_by_duration, key=lambda x: x['graduationRate']) if success_by_duration else None

    success_factors = {
        "headline": "Success Predictors: Who Graduates?",
        "totalGraduates": int(total_graduates),
        "overallGraduationRate": round(total_graduates / len(journeys) * 100, 1) if len(journeys) > 0 else 0,
        "byEntryFpl": success_by_fpl,
        "byHouseholdSize": success_by_household,
        "byDuration": success_by_duration,
        "byCounty": success_by_county[:10],
        "keyInsights": [
            f"Families entering at {best_fpl_bracket['bracket']} have {best_fpl_bracket['graduationRate']}% graduation rate" if best_fpl_bracket else "",
            f"Families staying {best_duration['duration']} have {best_duration['graduationRate']}% graduation rate" if best_duration else "",
            f"Top county: {success_by_county[0]['county']} ({success_by_county[0]['graduationRate']}% graduation)" if success_by_county else "",
        ],
    }

    insights_data = {
        "generated_at": datetime.now().isoformat(),
        "fplTerciles": fpl_terciles,
        "durationBins": duration_bins,
        "countyPerformance": county_performance,
        "employmentSubgroup": employment_subgroup,
        "avgDays": round(float(avg_days), 0),
        "avgFplChange": round(float(avg_fpl_change), 1),
        "successFactors": success_factors,
    }

    output_path = output_dir / "insights.json"
    with open(output_path, 'w') as f:
        json.dump(insights_data, f, indent=2)

    print(f"  Generated {output_path.name}")
    return insights_data


def generate_outcomes_json(journeys: pd.DataFrame, output_dir: Path) -> Dict[str, Any]:
    """Generate outcomes page JSON."""
    def get_outcome_category(row):
        if row.get('is_graduate'):
            return 'graduated'
        status = str(row.get('enrollment_status', '')).lower()
        if status == 'accepted':
            return 'active'
        elif status == 'exited':
            return 'exited'
        elif status == 'dismissed':
            return 'dismissed'
        elif status == 'withdrawn':
            return 'withdrawn'
        return 'other'

    journeys['outcome_category'] = journeys.apply(get_outcome_category, axis=1)

    # Outcome breakdown
    outcome_breakdown = []
    for cat in ['graduated', 'active', 'exited', 'dismissed', 'withdrawn']:
        cat_data = journeys[journeys['outcome_category'] == cat]
        if len(cat_data) > 0:
            positive_wages = cat_data[cat_data['income_change_annual'] > 0]
            outcome_breakdown.append({
                "category": cat,
                "count": len(cat_data),
                "avgFplChange": round(float(cat_data['fpl_change'].mean()), 1) if cat_data['fpl_change'].notna().any() else 0,
                "avgWageChange": round(float(cat_data['income_change_annual'].mean()), 0) if cat_data['income_change_annual'].notna().any() else 0,
                "avgDays": round(float(cat_data['days_in_program'].mean()), 0) if cat_data['days_in_program'].notna().any() else 0,
            })

    # Threshold crossings
    thresholds = [
        {"name": "Poverty Line", "fpl": 100, "benefit": "TennCare eligibility"},
        {"name": "SNAP Cliff", "fpl": 129, "benefit": "SNAP benefits end"},
        {"name": "TANF Cliff", "fpl": 159, "benefit": "TANF eligibility ends"},
        {"name": "School Lunch", "fpl": 184, "benefit": "Free lunch ends"},
        {"name": "Self-Sufficiency", "fpl": 225, "benefit": "EUC graduation"},
    ]

    with_fpl = journeys[(journeys['enrollment_fpl'].notna()) & (journeys['current_fpl'].notna())]
    threshold_crossings = []
    for t in thresholds:
        started_below = (with_fpl['enrollment_fpl'] < t['fpl']).sum()
        crossed_up = ((with_fpl['enrollment_fpl'] < t['fpl']) & (with_fpl['current_fpl'] >= t['fpl'])).sum()
        crossed_down = ((with_fpl['enrollment_fpl'] >= t['fpl']) & (with_fpl['current_fpl'] < t['fpl'])).sum()
        threshold_crossings.append({
            "name": t['name'],
            "fpl": t['fpl'],
            "benefit": t['benefit'],
            "startedBelow": int(started_below),
            "crossedUp": int(crossed_up),
            "crossedDown": int(crossed_down),
            "netMovement": int(crossed_up - crossed_down),
        })

    # FPL brackets (current)
    with_current = journeys[journeys['current_fpl'].notna()]
    bracket_defs = [
        ("<100%", 0, 100),
        ("100-150%", 100, 150),
        ("150-200%", 150, 200),
        ("200-250%", 200, 250),
        ("250%+", 250, 9999),
    ]
    fpl_brackets = []
    for name, low, high in bracket_defs:
        count = ((with_current['current_fpl'] >= low) & (with_current['current_fpl'] < high)).sum()
        fpl_brackets.append({"bracket": name, "count": int(count)})

    # Overall stats
    positive_wages = journeys[journeys['income_change_annual'] > 0]
    total_wage_gains = positive_wages['income_change_annual'].sum()
    positive_fpl = (journeys['fpl_change'] > 0).sum()

    overall_stats = {
        "avgFplChange": round(float(journeys['fpl_change'].mean()), 1) if journeys['fpl_change'].notna().any() else 0,
        "avgDays": round(float(journeys['days_in_program'].mean()), 0) if journeys['days_in_program'].notna().any() else 0,
        "totalWageGains": float(total_wage_gains),
        "positiveChanges": int(positive_fpl),
        "total": len(journeys),
    }

    outcomes_data = {
        "generated_at": datetime.now().isoformat(),
        "outcomeBreakdown": outcome_breakdown,
        "thresholdCrossings": threshold_crossings,
        "fplBrackets": fpl_brackets,
        "overallStats": overall_stats,
    }

    output_path = output_dir / "outcomes.json"
    with open(output_path, 'w') as f:
        json.dump(outcomes_data, f, indent=2)

    print(f"  Generated {output_path.name}")
    return outcomes_data


def generate_navigators_json(journeys: pd.DataFrame, output_dir: Path) -> Dict[str, Any]:
    """Generate navigators page JSON."""
    def get_outcome_category(row):
        if row.get('is_graduate'):
            return 'graduated'
        return 'other'

    journeys['is_grad'] = journeys.apply(get_outcome_category, axis=1) == 'graduated'

    # Navigator stats (min 5 families)
    navigator_stats = []
    navigators = journeys['navigator'].dropna().unique()

    for nav in navigators:
        nav_data = journeys[journeys['navigator'] == nav]
        if len(nav_data) >= 5:
            graduated_count = nav_data['is_grad'].sum()
            positive_wages = nav_data[nav_data['income_change_annual'] > 0]
            navigator_stats.append({
                "navigatorName": nav,
                "familyCount": len(nav_data),
                "graduatedCount": int(graduated_count),
                "avgFplChange": round(float(nav_data['fpl_change'].mean()), 1) if nav_data['fpl_change'].notna().any() else 0,
                "totalWageGains": float(positive_wages['income_change_annual'].sum()),
                "avgDays": round(float(nav_data['days_in_program'].mean()), 0) if nav_data['days_in_program'].notna().any() else 0,
            })

    # Sort by avgFplChange descending
    navigator_stats.sort(key=lambda x: x['avgFplChange'], reverse=True)

    # Overall stats
    with_nav = journeys[journeys['navigator'].notna()]
    total_navigators = len(navigators)
    avg_families_per_nav = len(with_nav) / total_navigators if total_navigators > 0 else 0
    avg_fpl_change = with_nav['fpl_change'].mean() if with_nav['fpl_change'].notna().any() else 0
    total_graduated = with_nav['is_grad'].sum()
    avg_graduation_rate = (total_graduated / len(with_nav) * 100) if len(with_nav) > 0 else 0

    navigators_data = {
        "generated_at": datetime.now().isoformat(),
        "navigatorStats": navigator_stats,
        "overallStats": {
            "avgFamiliesPerNav": round(float(avg_families_per_nav), 1),
            "avgFplChange": round(float(avg_fpl_change), 1),
            "avgGraduationRate": round(float(avg_graduation_rate), 1),
        },
        "totalNavigators": total_navigators,
    }

    output_path = output_dir / "navigators.json"
    with open(output_path, 'w') as f:
        json.dump(navigators_data, f, indent=2)

    print(f"  Generated {output_path.name}")
    return navigators_data


def generate_all_dashboard_json(output_dir: Path = None):
    """Generate all dashboard JSON files."""
    if output_dir is None:
        output_dir = Path(__file__).parent.parent.parent / "dashboard" / "lib" / "data"

    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"\nGenerating dashboard JSON files to {output_dir}...")

    # Load data
    data = load_processed_data()
    journeys = data.get('journeys')
    if journeys is None:
        journeys = load_journey_data()

    # Generate existing JSON files
    roi_data = generate_roi_json(data, output_dir)
    cliff_data = generate_cliff_json(journeys, output_dir)
    temporal_data = generate_temporal_json(journeys, output_dir)

    # Generate NEW JSON files (replacing database)
    overview_data = generate_overview_json(journeys, output_dir)
    participants_data = generate_participants_json(journeys, output_dir)
    geography_data = generate_geography_json(journeys, output_dir)
    insights_data = generate_insights_json(journeys, output_dir)
    outcomes_data = generate_outcomes_json(journeys, output_dir)
    navigators_data = generate_navigators_json(journeys, output_dir)

    print("\nDashboard JSON generation complete!")

    # Summary
    print(f"\n=== GENERATED METRICS SUMMARY ===")
    print(f"Total participants: {len(journeys)}")
    print(f"Graduates: {journeys['is_graduate'].sum()}")
    print(f"Total wage gains: ${roi_data['measured_outcomes']['all_participants']['total_annual_wage_gains']:,.0f}")
    print(f"Families in cliff zone: {cliff_data['summary']['families_in_cliff_zone']}")
    print(f"Counties: {len(geography_data['counties'])}")
    print(f"Navigators: {navigators_data['totalNavigators']}")


if __name__ == "__main__":
    generate_all_dashboard_json()
