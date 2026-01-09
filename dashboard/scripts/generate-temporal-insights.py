#!/usr/bin/env python3
"""
Generate temporal/learning curve insights from EUC participant data.
Shows whether program outcomes are improving over time.
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


def load_data():
    """Load all relevant data sources."""
    nav_dashboard = pd.read_excel(RAW_DATA / "Navigator Dashboard.xlsx", sheet_name=None)
    monthly_review = nav_dashboard["Monthly Client Review"]
    payments = nav_dashboard["Payments Spreadsheet"]

    return monthly_review, payments


def parse_enrollment_date(df):
    """Extract and parse enrollment dates."""
    # Look for enrollment date columns
    date_cols = [col for col in df.columns if 'date' in col.lower() or 'enroll' in col.lower()]
    print(f"Found date columns: {date_cols}")

    # Try to parse enrollment date
    if 'Enrollment Date' in df.columns:
        df['enrollment_date'] = pd.to_datetime(df['Enrollment Date'], errors='coerce')
    elif 'emp_enrollment_date' in df.columns:
        df['enrollment_date'] = pd.to_datetime(df['emp_enrollment_date'], errors='coerce')
    else:
        # Estimate from Days in Program (work backwards from today)
        df['Days in Program'] = pd.to_numeric(df['Days in Program'], errors='coerce')
        today = pd.Timestamp.now()
        df['enrollment_date'] = today - pd.to_timedelta(df['Days in Program'], unit='days')

    return df


def analyze_time_in_program(df):
    """Analyze outcomes by time-in-program brackets."""

    df['Days in Program'] = pd.to_numeric(df['Days in Program'], errors='coerce')
    df['Wage Increases Since Enrollment'] = pd.to_numeric(df['Wage Increases Since Enrollment'], errors='coerce')
    df['FPL Change'] = pd.to_numeric(df['FPL Change'], errors='coerce')

    # Create time brackets
    df['tenure_bracket'] = pd.cut(
        df['Days in Program'],
        bins=[0, 90, 180, 365, 540, 730, 2000],
        labels=['0-3 months', '3-6 months', '6-12 months', '12-18 months', '18-24 months', '24+ months']
    )

    tenure_stats = []

    for bracket in df['tenure_bracket'].dropna().unique():
        bracket_data = df[df['tenure_bracket'] == bracket]
        total = len(bracket_data)

        if total < 3:
            continue

        positive_wage = len(bracket_data[bracket_data['Wage Increases Since Enrollment'] > 0])
        avg_wage = bracket_data['Wage Increases Since Enrollment'].mean()
        avg_fpl = bracket_data['FPL Change'].mean()

        tenure_stats.append({
            'bracket': str(bracket),
            'count': int(total),
            'success_rate': float(positive_wage / total * 100) if total > 0 else 0,
            'avg_wage_gain': float(avg_wage) if not pd.isna(avg_wage) else 0,
            'avg_fpl_change': float(avg_fpl) if not pd.isna(avg_fpl) else 0,
            'avg_days': float(bracket_data['Days in Program'].mean()),
        })

    # Sort by tenure
    order = ['0-3 months', '3-6 months', '6-12 months', '12-18 months', '18-24 months', '24+ months']
    tenure_stats = sorted(tenure_stats, key=lambda x: order.index(x['bracket']) if x['bracket'] in order else 99)

    return tenure_stats


def analyze_enrollment_cohorts(df):
    """Analyze outcomes by enrollment quarter/period."""

    df = parse_enrollment_date(df)

    if 'enrollment_date' not in df.columns or df['enrollment_date'].isna().all():
        print("Warning: No enrollment dates available, using estimated cohorts")
        return []

    df['Wage Increases Since Enrollment'] = pd.to_numeric(df['Wage Increases Since Enrollment'], errors='coerce')
    df['FPL Change'] = pd.to_numeric(df['FPL Change'], errors='coerce')

    # Create cohorts by quarter
    df['enrollment_quarter'] = df['enrollment_date'].dt.to_period('Q')

    cohort_stats = []

    for quarter in df['enrollment_quarter'].dropna().unique():
        quarter_data = df[df['enrollment_quarter'] == quarter]
        total = len(quarter_data)

        if total < 3:
            continue

        positive_wage = len(quarter_data[quarter_data['Wage Increases Since Enrollment'] > 0])
        avg_wage = quarter_data['Wage Increases Since Enrollment'].mean()
        avg_fpl = quarter_data['FPL Change'].mean()
        avg_days = quarter_data['Days in Program'].mean()

        cohort_stats.append({
            'quarter': str(quarter),
            'quarter_label': f"Q{quarter.quarter} {quarter.year}",
            'count': int(total),
            'success_rate': float(positive_wage / total * 100) if total > 0 else 0,
            'avg_wage_gain': float(avg_wage) if not pd.isna(avg_wage) else 0,
            'avg_fpl_change': float(avg_fpl) if not pd.isna(avg_fpl) else 0,
            'avg_days': float(avg_days) if not pd.isna(avg_days) else 0,
        })

    # Sort chronologically
    cohort_stats = sorted(cohort_stats, key=lambda x: x['quarter'])

    return cohort_stats


def analyze_navigator_improvement(df):
    """Analyze if navigators are improving their outcomes over time."""

    df = parse_enrollment_date(df)
    df['Wage Increases Since Enrollment'] = pd.to_numeric(df['Wage Increases Since Enrollment'], errors='coerce')

    navigator_trend = []

    for navigator in df['Navigator'].dropna().unique():
        nav_data = df[df['Navigator'] == navigator].copy()

        if len(nav_data) < 5:
            continue

        # Sort by enrollment date
        nav_data = nav_data.sort_values('enrollment_date')

        # Split into early vs recent half
        midpoint = len(nav_data) // 2
        early = nav_data.iloc[:midpoint]
        recent = nav_data.iloc[midpoint:]

        early_success = (early['Wage Increases Since Enrollment'] > 0).mean() * 100 if len(early) > 0 else 0
        recent_success = (recent['Wage Increases Since Enrollment'] > 0).mean() * 100 if len(recent) > 0 else 0

        early_avg = early['Wage Increases Since Enrollment'].mean() if len(early) > 0 else 0
        recent_avg = recent['Wage Increases Since Enrollment'].mean() if len(recent) > 0 else 0

        navigator_trend.append({
            'navigator': str(navigator),
            'total_cases': len(nav_data),
            'early_success_rate': float(early_success) if not np.isnan(early_success) else 0,
            'recent_success_rate': float(recent_success) if not np.isnan(recent_success) else 0,
            'success_improvement': float(recent_success - early_success),
            'early_avg_wage': float(early_avg) if not np.isnan(early_avg) else 0,
            'recent_avg_wage': float(recent_avg) if not np.isnan(recent_avg) else 0,
            'wage_improvement': float(recent_avg - early_avg) if not np.isnan(recent_avg - early_avg) else 0,
        })

    return sorted(navigator_trend, key=lambda x: x['wage_improvement'], reverse=True)


def analyze_program_maturity(df):
    """Overall program improvement over time."""

    df = parse_enrollment_date(df)
    df['Wage Increases Since Enrollment'] = pd.to_numeric(df['Wage Increases Since Enrollment'], errors='coerce')
    df['FPL Change'] = pd.to_numeric(df['FPL Change'], errors='coerce')

    # Sort by enrollment date and create rolling window analysis
    df = df.sort_values('enrollment_date')

    # Split into thirds (early, middle, recent)
    n = len(df)
    third = n // 3

    periods = {
        'early': df.iloc[:third],
        'middle': df.iloc[third:2*third],
        'recent': df.iloc[2*third:],
    }

    program_trend = []

    for period_name, period_data in periods.items():
        if len(period_data) < 3:
            continue

        positive = (period_data['Wage Increases Since Enrollment'] > 0).sum()
        total = len(period_data)
        avg_wage = period_data['Wage Increases Since Enrollment'].mean()
        avg_fpl = period_data['FPL Change'].mean()

        # Get approximate date range
        if not period_data['enrollment_date'].isna().all():
            start_date = period_data['enrollment_date'].min()
            end_date = period_data['enrollment_date'].max()
            date_range = f"{start_date.strftime('%b %Y') if pd.notna(start_date) else '?'} - {end_date.strftime('%b %Y') if pd.notna(end_date) else '?'}"
        else:
            date_range = "Unknown"

        program_trend.append({
            'period': period_name,
            'date_range': date_range,
            'count': int(total),
            'success_rate': float(positive / total * 100) if total > 0 else 0,
            'avg_wage_gain': float(avg_wage) if not pd.isna(avg_wage) else 0,
            'avg_fpl_change': float(avg_fpl) if not pd.isna(avg_fpl) else 0,
        })

    return program_trend


def calculate_cumulative_impact(df):
    """Calculate cumulative wage gains over time."""

    df = parse_enrollment_date(df)
    df['Wage Increases Since Enrollment'] = pd.to_numeric(df['Wage Increases Since Enrollment'], errors='coerce')

    # Sort by enrollment date
    df = df.sort_values('enrollment_date').dropna(subset=['enrollment_date', 'Wage Increases Since Enrollment'])

    cumulative_data = []
    cumulative_wage = 0
    cumulative_families = 0

    # Group by month
    df['month'] = df['enrollment_date'].dt.to_period('M')

    for month in sorted(df['month'].dropna().unique()):
        month_data = df[df['month'] == month]

        new_wage_gains = month_data['Wage Increases Since Enrollment'].sum()
        new_families = len(month_data)

        cumulative_wage += new_wage_gains
        cumulative_families += new_families

        cumulative_data.append({
            'month': str(month),
            'month_label': month.strftime('%b %Y'),
            'new_families': int(new_families),
            'new_wage_gains': float(new_wage_gains),
            'cumulative_families': int(cumulative_families),
            'cumulative_wage_gains': float(cumulative_wage),
            'avg_wage_per_family': float(cumulative_wage / cumulative_families) if cumulative_families > 0 else 0,
        })

    return cumulative_data


def generate_learning_thesis(tenure_stats, program_trend, navigator_trend):
    """Generate key finding about program learning."""

    findings = []

    # Finding 1: Optimal program duration
    if tenure_stats:
        best_tenure = max(tenure_stats, key=lambda x: x['avg_wage_gain'])
        findings.append({
            'id': 1,
            'title': 'Optimal Program Duration',
            'insight': f'Families in the {best_tenure["bracket"]} bracket show highest avg wage gain of ${best_tenure["avg_wage_gain"]:,.0f}.',
            'metric': best_tenure['bracket'],
            'metric_label': 'sweet spot',
            'detail': f'{best_tenure["count"]} families achieved {best_tenure["success_rate"]:.0f}% success rate at this tenure.',
            'color': 'emerald'
        })

    # Finding 2: Program maturity
    if len(program_trend) >= 2:
        early = next((p for p in program_trend if p['period'] == 'early'), None)
        recent = next((p for p in program_trend if p['period'] == 'recent'), None)

        if early and recent:
            success_change = recent['success_rate'] - early['success_rate']
            direction = 'improving' if success_change > 0 else 'declining'

            findings.append({
                'id': 2,
                'title': 'Program Maturity',
                'insight': f'Success rate {direction} from {early["success_rate"]:.0f}% to {recent["success_rate"]:.0f}% over time.',
                'metric': f'{success_change:+.0f}%',
                'metric_label': 'change',
                'detail': f'Early period ({early["date_range"]}): ${early["avg_wage_gain"]:,.0f} avg. Recent: ${recent["avg_wage_gain"]:,.0f} avg.',
                'color': 'indigo' if success_change > 0 else 'amber'
            })

    # Finding 3: Navigator improvement
    if navigator_trend:
        improving = [n for n in navigator_trend if n['wage_improvement'] > 5000]
        declining = [n for n in navigator_trend if n['wage_improvement'] < -5000]

        if len(improving) > 0:
            findings.append({
                'id': 3,
                'title': 'Navigator Learning',
                'insight': f'{len(improving)} navigators showing improved outcomes over time.',
                'metric': str(len(improving)),
                'metric_label': 'improving',
                'detail': f'Top improver: {improving[0]["navigator"]} (+${improving[0]["wage_improvement"]:,.0f} avg wage gain).',
                'color': 'violet'
            })

    return findings


def main():
    print("Loading data...")
    monthly_review, payments = load_data()

    print(f"Columns available: {monthly_review.columns.tolist()}")

    print("\nAnalyzing time-in-program effects...")
    tenure_stats = analyze_time_in_program(monthly_review)

    print("\nAnalyzing enrollment cohorts...")
    cohort_stats = analyze_enrollment_cohorts(monthly_review)

    print("\nAnalyzing navigator improvement...")
    navigator_trend = analyze_navigator_improvement(monthly_review)

    print("\nAnalyzing program maturity...")
    program_trend = analyze_program_maturity(monthly_review)

    print("\nCalculating cumulative impact...")
    cumulative_data = calculate_cumulative_impact(monthly_review)

    print("\nGenerating learning thesis...")
    learning_findings = generate_learning_thesis(tenure_stats, program_trend, navigator_trend)

    # Compile temporal insights
    temporal_insights = {
        'generated_at': pd.Timestamp.now().isoformat(),
        'tenure_analysis': tenure_stats,
        'enrollment_cohorts': cohort_stats,
        'navigator_improvement': navigator_trend,
        'program_maturity': program_trend,
        'cumulative_impact': cumulative_data,
        'learning_findings': learning_findings,
    }

    # Save to JSON
    output_path = OUTPUT_DIR / "temporal-insights.json"
    with open(output_path, 'w') as f:
        json.dump(temporal_insights, f, indent=2, default=str)

    print(f"\nTemporal insights saved to {output_path}")

    # Print summary
    print("\n" + "="*60)
    print("PROGRAM LEARNING CURVE SUMMARY")
    print("="*60)

    print("\nTime-in-Program Analysis:")
    for stat in tenure_stats:
        print(f"  {stat['bracket']}: {stat['count']} families, {stat['success_rate']:.0f}% success, ${stat['avg_wage_gain']:,.0f} avg gain")

    print("\nProgram Maturity:")
    for trend in program_trend:
        print(f"  {trend['period'].capitalize()} ({trend['date_range']}): {trend['success_rate']:.0f}% success, ${trend['avg_wage_gain']:,.0f} avg")

    print("\nKey Findings:")
    for finding in learning_findings:
        print(f"  {finding['title']}: {finding['insight']}")


if __name__ == "__main__":
    main()
