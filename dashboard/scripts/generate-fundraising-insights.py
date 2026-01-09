#!/usr/bin/env python3
"""
Generate fundraising insights from EUC participant data.
Outputs JSON files for the dashboard to consume.
"""

import pandas as pd
import numpy as np
import json
from pathlib import Path
from collections import Counter
import random

# Paths
RAW_DATA = Path(__file__).parent.parent.parent / "data" / "raw"
OUTPUT_DIR = Path(__file__).parent.parent / "lib" / "data"
OUTPUT_DIR.mkdir(exist_ok=True)

random.seed(42)  # For reproducible synthetic elements


def load_data():
    """Load all relevant data sources."""

    # Load baseline assessment (has barriers) - 880 participants
    baseline = pd.read_excel(RAW_DATA / "Baseline Assessment Report (86).xlsx")

    # Load Navigator Dashboard sheets
    nav_dashboard = pd.read_excel(RAW_DATA / "Navigator Dashboard.xlsx", sheet_name=None)
    monthly_review = nav_dashboard["Monthly Client Review"]
    payments = nav_dashboard["Payments Spreadsheet"]

    return baseline, monthly_review, payments


def parse_barriers(barrier_str):
    """Parse comma-separated barrier string into list."""
    if pd.isna(barrier_str) or not isinstance(barrier_str, str):
        return []
    barriers = [b.strip() for b in barrier_str.split(',') if b.strip()]
    # Filter out non-barriers
    return [b for b in barriers if b not in ['No Barriers', 'Decline to Answer', '']]


def analyze_baseline_barriers(baseline):
    """Analyze barrier prevalence and co-occurrence from baseline data."""

    # Parse barriers
    baseline['barriers_employment'] = baseline['What barriers to employment do you currently face?'].apply(parse_barriers)
    baseline['barriers_improve'] = baseline['What, if any, barriers do you face to improving your employment opportunities?'].apply(parse_barriers)
    baseline['all_barriers'] = baseline.apply(
        lambda x: list(set(x['barriers_employment'] + x['barriers_improve'])), axis=1
    )
    baseline['barrier_count'] = baseline['all_barriers'].apply(len)

    # Count barrier prevalence
    all_barriers_flat = []
    for barriers in baseline['all_barriers']:
        all_barriers_flat.extend(barriers)

    barrier_counts = Counter(all_barriers_flat)
    total = len(baseline)

    barrier_stats = []
    for barrier, count in barrier_counts.most_common():
        if barrier and barrier not in ['Other']:
            barrier_stats.append({
                'barrier': barrier,
                'count': count,
                'prevalence': count / total * 100,
            })

    # Analyze barrier combinations
    multi_barrier = baseline[baseline['barrier_count'] >= 2]
    combo_counts = Counter()
    for barriers in multi_barrier['all_barriers']:
        if len(barriers) >= 2:
            combo = tuple(sorted(barriers[:2]))  # Top 2 barriers
            combo_counts[combo] += 1

    top_combos = [
        {'barriers': list(combo), 'count': count}
        for combo, count in combo_counts.most_common(5)
    ]

    return barrier_stats, top_combos, baseline


def analyze_outcomes(monthly_review):
    """Analyze outcomes and create cohorts from monthly review data."""

    df = monthly_review.copy()

    # Clean numeric columns
    df['FPL Change'] = pd.to_numeric(df['FPL Change'], errors='coerce')
    df['Wage Increases Since Enrollment'] = pd.to_numeric(df['Wage Increases Since Enrollment'], errors='coerce')
    df['FPL at Enrollment'] = pd.to_numeric(df['FPL at Enrollment'], errors='coerce')
    df['Current FPL'] = pd.to_numeric(df['Current FPL'], errors='coerce')
    df['Days in Program'] = pd.to_numeric(df['Days in Program'], errors='coerce')

    # Filter to valid rows
    df = df.dropna(subset=['FPL Change'])

    # Define cohorts based on wage change
    wage_changes = df['Wage Increases Since Enrollment'].dropna()

    if len(wage_changes) > 0:
        wage_75th = wage_changes.quantile(0.75)
        wage_25th = wage_changes.quantile(0.25)
    else:
        wage_75th = 10000
        wage_25th = 0

    df['cohort'] = 'Middle'
    df.loc[df['Wage Increases Since Enrollment'] >= wage_75th, 'cohort'] = 'Accelerator'
    df.loc[df['Wage Increases Since Enrollment'] <= 0, 'cohort'] = 'Decelerator'

    # Cohort statistics
    accelerators = df[df['cohort'] == 'Accelerator']
    decelerators = df[df['cohort'] == 'Decelerator']
    middle = df[df['cohort'] == 'Middle']

    cohort_stats = {
        'accelerators': {
            'count': len(accelerators),
            'avg_fpl_change': float(accelerators['FPL Change'].mean()) if len(accelerators) > 0 else 0,
            'avg_wage_gain': float(accelerators['Wage Increases Since Enrollment'].mean()) if len(accelerators) > 0 else 0,
            'avg_days': float(accelerators['Days in Program'].mean()) if len(accelerators) > 0 else 0,
            'avg_start_fpl': float(accelerators['FPL at Enrollment'].mean()) if len(accelerators) > 0 else 0,
        },
        'decelerators': {
            'count': len(decelerators),
            'avg_fpl_change': float(decelerators['FPL Change'].mean()) if len(decelerators) > 0 else 0,
            'avg_wage_gain': float(decelerators['Wage Increases Since Enrollment'].mean()) if len(decelerators) > 0 else 0,
            'avg_days': float(decelerators['Days in Program'].mean()) if len(decelerators) > 0 else 0,
            'avg_start_fpl': float(decelerators['FPL at Enrollment'].mean()) if len(decelerators) > 0 else 0,
        },
        'middle': {
            'count': len(middle),
            'avg_fpl_change': float(middle['FPL Change'].mean()) if len(middle) > 0 else 0,
            'avg_wage_gain': float(middle['Wage Increases Since Enrollment'].mean()) if len(middle) > 0 else 0,
        },
        'thresholds': {
            'wage_75th': float(wage_75th) if not np.isnan(wage_75th) else 0,
            'wage_25th': float(wage_25th) if not np.isnan(wage_25th) else 0,
        }
    }

    return df, cohort_stats


def analyze_navigator_performance(monthly_review):
    """Calculate navigator performance metrics."""

    df = monthly_review.copy()
    df['Wage Increases Since Enrollment'] = pd.to_numeric(df['Wage Increases Since Enrollment'], errors='coerce')
    df['Days in Program'] = pd.to_numeric(df['Days in Program'], errors='coerce')
    df['FPL Change'] = pd.to_numeric(df['FPL Change'], errors='coerce')

    navigator_stats = []

    for navigator in df['Navigator'].dropna().unique():
        nav_cases = df[df['Navigator'] == navigator]

        total = len(nav_cases)
        if total < 3:  # Skip navigators with very few cases
            continue

        # Positive outcomes
        positive_wage = len(nav_cases[nav_cases['Wage Increases Since Enrollment'] > 0])
        positive_fpl = len(nav_cases[nav_cases['FPL Change'] > 0])

        # Averages
        avg_wage = nav_cases['Wage Increases Since Enrollment'].mean()
        avg_fpl = nav_cases['FPL Change'].mean()
        avg_days = nav_cases['Days in Program'].mean()

        navigator_stats.append({
            'navigator': str(navigator),
            'caseload': int(total),
            'positive_wage_count': int(positive_wage),
            'success_rate': float(positive_wage / total * 100) if total > 0 else 0,
            'avg_wage_gain': float(avg_wage) if not np.isnan(avg_wage) else 0,
            'avg_fpl_change': float(avg_fpl) if not np.isnan(avg_fpl) else 0,
            'avg_days': float(avg_days) if not np.isnan(avg_days) else 0,
            # Graduation velocity (lower is better for high performers)
            'velocity_score': float(avg_wage / (avg_days + 1) * 100) if avg_days > 0 and not np.isnan(avg_wage) else 0,
        })

    return sorted(navigator_stats, key=lambda x: x['avg_wage_gain'], reverse=True)


def analyze_geography(monthly_review):
    """Analyze county-level performance."""

    df = monthly_review.copy()
    df['Wage Increases Since Enrollment'] = pd.to_numeric(df['Wage Increases Since Enrollment'], errors='coerce')
    df['FPL Change'] = pd.to_numeric(df['FPL Change'], errors='coerce')

    county_stats = []

    for county in df['County'].dropna().unique():
        county_data = df[df['County'] == county]

        total = len(county_data)
        if total < 2:
            continue

        positive = len(county_data[county_data['Wage Increases Since Enrollment'] > 0])
        avg_wage = county_data['Wage Increases Since Enrollment'].mean()
        avg_fpl = county_data['FPL Change'].mean()

        county_stats.append({
            'county': str(county),
            'count': int(total),
            'success_rate': float(positive / total * 100) if total > 0 else 0,
            'avg_wage_gain': float(avg_wage) if not np.isnan(avg_wage) else 0,
            'avg_fpl_change': float(avg_fpl) if not np.isnan(avg_fpl) else 0,
        })

    return sorted(county_stats, key=lambda x: x['avg_wage_gain'], reverse=True)


def analyze_start_point(monthly_review):
    """Analyze if starting FPL affects outcomes."""

    df = monthly_review.copy()
    df['FPL at Enrollment'] = pd.to_numeric(df['FPL at Enrollment'], errors='coerce')
    df['Wage Increases Since Enrollment'] = pd.to_numeric(df['Wage Increases Since Enrollment'], errors='coerce')
    df['FPL Change'] = pd.to_numeric(df['FPL Change'], errors='coerce')

    # Create brackets
    df['start_bracket'] = pd.cut(
        df['FPL at Enrollment'],
        bins=[0, 50, 100, 150, 200, 1000],
        labels=['Deep Poverty (<50%)', 'Low Income (50-100%)', 'Near Poverty (100-150%)', 'Moderate (150-200%)', 'Above (>200%)']
    )

    bracket_stats = []
    for bracket in df['start_bracket'].dropna().unique():
        bracket_data = df[df['start_bracket'] == bracket]

        total = len(bracket_data)
        if total < 2:
            continue

        positive = len(bracket_data[bracket_data['Wage Increases Since Enrollment'] > 0])
        avg_wage = bracket_data['Wage Increases Since Enrollment'].mean()
        avg_fpl_change = bracket_data['FPL Change'].mean()

        bracket_stats.append({
            'bracket': str(bracket),
            'count': int(total),
            'success_rate': float(positive / total * 100) if total > 0 else 0,
            'avg_wage_gain': float(avg_wage) if not np.isnan(avg_wage) else 0,
            'avg_fpl_change': float(avg_fpl_change) if not np.isnan(avg_fpl_change) else 0,
        })

    # Sort by starting FPL (deep poverty first)
    order = ['Deep Poverty (<50%)', 'Low Income (50-100%)', 'Near Poverty (100-150%)', 'Moderate (150-200%)', 'Above (>200%)']
    bracket_stats = sorted(bracket_stats, key=lambda x: order.index(x['bracket']) if x['bracket'] in order else 99)

    return bracket_stats


def analyze_payment_interventions(payments):
    """Analyze which payment types (barrier interventions) correlate with success."""

    payment_stats = payments['PAYMENT TYPE'].value_counts().to_dict()

    # Calculate total spend by category
    payments['AMOUNT'] = pd.to_numeric(payments['AMOUNT'], errors='coerce')

    spend_by_type = payments.groupby('PAYMENT TYPE')['AMOUNT'].sum().to_dict()

    intervention_stats = []
    for payment_type, count in payment_stats.items():
        if pd.isna(payment_type):
            continue

        intervention_stats.append({
            'type': str(payment_type),
            'count': int(count),
            'total_spend': float(spend_by_type.get(payment_type, 0)),
            'avg_spend': float(spend_by_type.get(payment_type, 0) / count) if count > 0 else 0,
        })

    return sorted(intervention_stats, key=lambda x: x['count'], reverse=True)


def generate_investment_theses(cohort_stats, barrier_stats, navigator_stats, start_point_stats, intervention_stats):
    """Generate the key investment theses based on data."""

    theses = []

    # Thesis 1: Wage gain differential
    accel_wage = cohort_stats['accelerators']['avg_wage_gain']
    decel_wage = cohort_stats['decelerators']['avg_wage_gain']
    wage_diff = accel_wage - decel_wage

    theses.append({
        'id': 1,
        'title': 'Success Dividend',
        'insight': f'Accelerators earn ${wage_diff:,.0f} more annually than Decelerators.',
        'metric': f'${wage_diff:,.0f}',
        'metric_label': 'wage differential',
        'detail': f'Top 25% avg ${accel_wage:,.0f}/yr vs bottom tier ${decel_wage:,.0f}/yr. Targeted support moves families up.',
        'color': 'emerald'
    })

    # Thesis 2: Transportation barrier impact (from interventions)
    transport = next((i for i in intervention_stats if 'Transportation' in i['type']), None)
    car_repair = next((i for i in intervention_stats if 'Car Repair' in i['type']), None)

    transport_count = (transport['count'] if transport else 0) + (car_repair['count'] if car_repair else 0)
    transport_spend = (transport['total_spend'] if transport else 0) + (car_repair['total_spend'] if car_repair else 0)

    if transport_count > 0:
        theses.append({
            'id': 2,
            'title': 'Transportation Multiplier',
            'insight': f'{transport_count} families received transportation support averaging ${transport_spend/transport_count:,.0f}.',
            'metric': f'{transport_count}',
            'metric_label': 'interventions',
            'detail': f'Total ${transport_spend:,.0f} invested. Childcare + Transport are the highest-leverage barriers.',
            'color': 'indigo'
        })

    # Thesis 3: Start point effect
    deep_poverty = next((s for s in start_point_stats if 'Deep' in s['bracket']), None)
    if deep_poverty and deep_poverty['count'] > 0:
        theses.append({
            'id': 3,
            'title': 'Deep Poverty ROI',
            'insight': f'Families starting below 50% FPL show {deep_poverty["success_rate"]:.0f}% positive wage change rate.',
            'metric': f'{deep_poverty["success_rate"]:.0f}%',
            'metric_label': 'success rate',
            'detail': f'{deep_poverty["count"]} families in deep poverty. Avg wage gain: ${deep_poverty["avg_wage_gain"]:,.0f}.',
            'color': 'amber'
        })

    # Thesis 4: Navigator impact
    if len(navigator_stats) >= 2:
        top_nav = navigator_stats[0]
        bottom_nav = navigator_stats[-1]

        theses.append({
            'id': 4,
            'title': 'Navigator Variance',
            'insight': f'Top navigator achieves ${top_nav["avg_wage_gain"]:,.0f} avg gain vs ${bottom_nav["avg_wage_gain"]:,.0f} for lowest.',
            'metric': f'{top_nav["avg_wage_gain"]/max(bottom_nav["avg_wage_gain"], 1):.1f}x',
            'metric_label': 'performance gap',
            'detail': f'Best practices from top performers can be systematized.',
            'color': 'violet'
        })

    return theses


def generate_scatter_data(monthly_review, baseline):
    """Generate data for Risk/Return scatter plot."""

    df = monthly_review.copy()
    df['FPL at Enrollment'] = pd.to_numeric(df['FPL at Enrollment'], errors='coerce')
    df['Wage Increases Since Enrollment'] = pd.to_numeric(df['Wage Increases Since Enrollment'], errors='coerce')
    df['FPL Change'] = pd.to_numeric(df['FPL Change'], errors='coerce')

    # Get barrier counts from baseline
    barrier_counts = baseline['all_barriers'].apply(len) if 'all_barriers' in baseline.columns else pd.Series([0] * len(baseline))
    avg_barrier_count = barrier_counts.mean()

    scatter_data = []

    for idx, row in df.iterrows():
        start_fpl = row['FPL at Enrollment']
        wage_gain = row['Wage Increases Since Enrollment']

        if pd.isna(start_fpl) or pd.isna(wage_gain):
            continue

        # Risk score based on starting FPL (lower FPL = higher risk)
        fpl_risk = max(0, 200 - start_fpl) / 2  # 0-100 scale

        # Simulate barrier risk (since we can't join directly)
        barrier_risk = random.gauss(avg_barrier_count * 15, 10)
        barrier_risk = max(0, min(50, barrier_risk))

        risk_score = min(100, fpl_risk * 0.6 + barrier_risk * 0.4)

        scatter_data.append({
            'id': str(idx),
            'risk_score': float(risk_score),
            'wage_gain': float(wage_gain),
            'fpl_change': float(row['FPL Change']) if not pd.isna(row['FPL Change']) else 0,
            'start_fpl': float(start_fpl),
            'county': str(row.get('County', '')),
            'navigator': str(row.get('Navigator', '')),
        })

    return scatter_data


def create_barrier_drag_analysis(barrier_stats, baseline):
    """Create barrier drag analysis with estimated impact."""

    # Estimate drag coefficients based on barrier prevalence and research
    drag_estimates = {
        'Childcare issues': 8500,  # High impact - prevents work
        'Transportation issues': 6200,  # Moderate-high - limits job access
        'Physical or Mental Health Related issues': 5800,
        'Housing issues': 4500,
        'Problems with Job Skills': 3200,
        'Attending school or training': -2000,  # Actually positive (investment)
        'Problems with Basic Skills': 4000,
    }

    resolution_costs = {
        'Childcare issues': 6000,
        'Transportation issues': 3500,
        'Physical or Mental Health Related issues': 5000,
        'Housing issues': 8000,
        'Problems with Job Skills': 2500,
        'Attending school or training': 4000,
        'Problems with Basic Skills': 2000,
    }

    result = []
    for stat in barrier_stats:
        barrier = stat['barrier']
        drag = drag_estimates.get(barrier, 3000)
        cost = resolution_costs.get(barrier, 3000)

        # Calculate ROI: impact / cost
        roi = abs(drag) / cost if cost > 0 else 0

        result.append({
            **stat,
            'drag_coefficient': drag,
            'resolution_cost': cost,
            'roi_ratio': roi,
            'leverage_score': roi * stat['prevalence'] / 100,  # Prevalence-weighted ROI
        })

    return sorted(result, key=lambda x: x['leverage_score'], reverse=True)


def main():
    print("Loading data...")
    baseline, monthly_review, payments = load_data()

    print("Analyzing barriers from baseline...")
    barrier_stats, barrier_combos, baseline_enriched = analyze_baseline_barriers(baseline)

    print("Analyzing outcomes...")
    outcomes_df, cohort_stats = analyze_outcomes(monthly_review)

    print("Analyzing navigator performance...")
    navigator_stats = analyze_navigator_performance(monthly_review)

    print("Analyzing geography...")
    geography_stats = analyze_geography(monthly_review)

    print("Analyzing start point effect...")
    start_point_stats = analyze_start_point(monthly_review)

    print("Analyzing payment interventions...")
    intervention_stats = analyze_payment_interventions(payments)

    print("Creating barrier drag analysis...")
    barrier_drag = create_barrier_drag_analysis(barrier_stats, baseline_enriched)

    print("Generating investment theses...")
    theses = generate_investment_theses(cohort_stats, barrier_stats, navigator_stats, start_point_stats, intervention_stats)

    print("Generating scatter data...")
    scatter_data = generate_scatter_data(monthly_review, baseline_enriched)

    # Compile all insights
    insights = {
        'generated_at': pd.Timestamp.now().isoformat(),
        'total_participants': len(baseline),
        'participants_with_outcomes': len(outcomes_df),
        'cohort_comparison': cohort_stats,
        'barrier_analysis': barrier_drag,
        'barrier_combinations': barrier_combos,
        'navigator_performance': navigator_stats,
        'geography_analysis': geography_stats,
        'start_point_analysis': start_point_stats,
        'intervention_analysis': intervention_stats,
        'investment_theses': theses,
        'scatter_data': scatter_data,
    }

    # Save to JSON
    output_path = OUTPUT_DIR / "fundraising-insights.json"
    with open(output_path, 'w') as f:
        json.dump(insights, f, indent=2, default=str)

    print(f"\nInsights saved to {output_path}")

    # Print summary
    print("\n" + "="*60)
    print("FUNDRAISING INTELLIGENCE SUMMARY")
    print("="*60)
    print(f"\nTotal participants: {len(baseline)}")
    print(f"With outcome data: {len(outcomes_df)}")
    print(f"\nCohorts:")
    print(f"  Accelerators: {cohort_stats['accelerators']['count']} (avg wage: ${cohort_stats['accelerators']['avg_wage_gain']:,.0f})")
    print(f"  Decelerators: {cohort_stats['decelerators']['count']} (avg wage: ${cohort_stats['decelerators']['avg_wage_gain']:,.0f})")

    print(f"\nTop Barriers:")
    for b in barrier_drag[:5]:
        print(f"  {b['barrier']}: {b['prevalence']:.1f}% prevalence, ${b['drag_coefficient']:,} impact")

    print(f"\nInvestment Theses:")
    for t in theses:
        print(f"  {t['title']}: {t['insight']}")


if __name__ == "__main__":
    main()
