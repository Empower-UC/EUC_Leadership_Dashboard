"""
Core metric calculations for EUC dashboard.
FPL calculations, success rates, and derived metrics.
"""
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional
from pathlib import Path

# 2024 Federal Poverty Guidelines (lower 48 states)
FPL_BASE = 15060  # For 1 person
FPL_PER_ADDITIONAL = 5380  # For each additional person

# FPL Thresholds
FPL_THRESHOLDS = {
    "deep_poverty": 50,      # <50% FPL
    "poverty": 100,          # <100% FPL
    "snap_cliff": 130,       # SNAP eligibility cliff
    "liheap_cliff": 150,     # LIHEAP eligibility
    "school_meals_cliff": 185,  # Free/reduced meals
    "graduation": 225,       # EUC graduation threshold
}

# Program investment constant
PROGRAM_INVESTMENT = 25_000_000


def get_poverty_line(household_size: int) -> float:
    """Calculate poverty line for a given household size."""
    if household_size < 1:
        household_size = 1
    return FPL_BASE + FPL_PER_ADDITIONAL * (household_size - 1)


def calculate_fpl(annual_income: float, household_size: int) -> Optional[float]:
    """
    Calculate FPL percentage from annual income and household size.
    Returns None if inputs are invalid.
    """
    if pd.isna(annual_income) or pd.isna(household_size):
        return None
    if household_size < 1:
        return None
    if annual_income < 0:
        return None

    poverty_line = get_poverty_line(int(household_size))
    return (annual_income / poverty_line) * 100


def calculate_fpl_from_monthly(monthly_income: float, household_size: int) -> Optional[float]:
    """Calculate FPL from monthly income (annualizes it)."""
    if pd.isna(monthly_income):
        return None
    return calculate_fpl(monthly_income * 12, household_size)


def load_processed_data() -> Dict[str, pd.DataFrame]:
    """Load all processed data files."""
    data_dir = Path(__file__).parent.parent.parent / "data" / "processed"

    data = {
        "participants": pd.read_csv(data_dir / "participants.csv"),
        "assessments": pd.read_csv(data_dir / "assessments_longitudinal.csv"),
        "navigator_tracking": pd.read_csv(data_dir / "navigator_tracking.csv"),
    }

    # Load journey file if it exists (single source of truth)
    journey_path = data_dir / "participant_journeys.csv"
    if journey_path.exists():
        data["journeys"] = pd.read_csv(journey_path)

    return data


def calculate_wage_changes_from_assessments(assessments: pd.DataFrame) -> pd.DataFrame:
    """
    Calculate wage changes from longitudinal assessment data.
    Compares first and most recent income data for each participant.

    Returns DataFrame with participant_id and wage metrics.
    """
    df = assessments.copy()
    df['assessment_date'] = pd.to_datetime(df['assessment_date'], errors='coerce')

    income_col = 'Monthly Income from Employment'
    if income_col not in df.columns:
        return pd.DataFrame()

    # Get records with valid income data
    has_income = df[df[income_col].notna() & (df[income_col] >= 0)].copy()
    has_income = has_income.sort_values('assessment_date')

    if len(has_income) == 0:
        return pd.DataFrame()

    # First and last income per participant
    first_records = has_income.groupby('participant_id').first()
    last_records = has_income.groupby('participant_id').last()

    changes = pd.DataFrame({
        'participant_id': first_records.index,
        'first_monthly_income': first_records[income_col].values,
        'last_monthly_income': last_records[income_col].values,
        'first_date': first_records['assessment_date'].values,
        'last_date': last_records['assessment_date'].values,
    })

    changes['monthly_change'] = changes['last_monthly_income'] - changes['first_monthly_income']
    changes['annual_change'] = changes['monthly_change'] * 12

    # Calculate days between measurements
    changes['days_between'] = (
        pd.to_datetime(changes['last_date']) - pd.to_datetime(changes['first_date'])
    ).dt.days

    return changes


def calculate_success_metrics_from_journeys(journeys: pd.DataFrame, nav: pd.DataFrame) -> Dict[str, Any]:
    """
    Calculate success metrics using the master participant journeys table.
    This is the preferred method - single source of truth.
    """
    total_participants = len(journeys)
    nav_tracked = len(nav)

    # Wage metrics from journey data
    with_wage_data = journeys['income_change_annual'].notna().sum()
    positive_wage = journeys[journeys['income_change_annual'] > 0]
    positive_wage_count = len(positive_wage)
    total_wage_gains = positive_wage['income_change_annual'].sum()
    avg_wage_change = journeys['income_change_annual'].mean() if with_wage_data > 0 else 0
    positive_wage_rate = positive_wage_count / with_wage_data if with_wage_data > 0 else 0

    # FPL metrics from journey data
    with_fpl_data = journeys['current_fpl'].notna().sum()
    graduate_count = journeys['is_graduate'].sum()
    graduation_rate = graduate_count / with_fpl_data if with_fpl_data > 0 else 0

    # FPL change metrics
    with_fpl_change = journeys['fpl_change'].notna().sum()
    positive_fpl = journeys[journeys['fpl_change'] > 0]
    positive_fpl_count = len(positive_fpl)
    avg_fpl_change = journeys['fpl_change'].mean() if with_fpl_change > 0 else 0

    # FPL tier distribution from journey data
    fpl_distribution = journeys['cliff_tier'].value_counts().to_dict()

    # County breakdown
    county_col = 'county'
    if county_col in journeys.columns:
        county_metrics = journeys.groupby(county_col).agg({
            'participant_id': 'count',
            'income_change_annual': 'mean',
        }).rename(columns={'participant_id': 'count', 'income_change_annual': 'avg_wage_change'}).to_dict('index')
    else:
        county_metrics = {}

    # Navigator performance (from navigator tracking)
    nav_metrics = nav.groupby('navigator').agg({
        'participant_id': 'count',
        'fpl_change': 'mean',
        'wage_change': ['mean', 'sum'],
    })
    nav_metrics.columns = ['caseload', 'avg_fpl_change', 'avg_wage_change', 'total_wage_gains']
    navigator_performance = nav_metrics.to_dict('index')

    return {
        "summary": {
            "total_participants": total_participants,
            "navigator_tracked": nav_tracked,
            "with_wage_data": int(with_wage_data),
            "with_fpl_data": int(with_fpl_data),
        },
        "outcomes": {
            "graduates_225_fpl": int(graduate_count),
            "graduation_rate": round(graduation_rate * 100, 1),
            "positive_fpl_change_count": positive_fpl_count,
            "positive_fpl_rate": round(positive_fpl_count / with_fpl_change * 100, 1) if with_fpl_change > 0 else 0,
            "avg_fpl_change": round(avg_fpl_change, 1),
            "positive_wage_count": positive_wage_count,
            "positive_wage_rate": round(positive_wage_rate * 100, 1),
            "avg_wage_change": round(avg_wage_change, 2),
            "total_wage_gains": round(total_wage_gains, 2),
        },
        "fpl_distribution": fpl_distribution,
        "county_metrics": county_metrics,
        "navigator_performance": navigator_performance,
    }


def calculate_success_metrics(data: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
    """
    Calculate core success metrics from processed data.

    Uses participant_journeys as single source of truth when available.
    Falls back to longitudinal assessments calculation if not.
    """
    nav = data["navigator_tracking"].copy()
    participants = data["participants"]
    assessments = data["assessments"]

    # Use journey data if available (single source of truth)
    if "journeys" in data:
        return calculate_success_metrics_from_journeys(data["journeys"], nav)

    # Basic counts
    total_participants = len(participants)
    nav_tracked = len(nav)

    # Calculate wage changes from longitudinal assessments (covers all participants)
    wage_changes = calculate_wage_changes_from_assessments(assessments)

    # Include all participants with wage data (no time filter)
    wage_changes_valid = wage_changes
    with_wage_data = len(wage_changes_valid)
    positive_wage = wage_changes_valid[wage_changes_valid['annual_change'] > 0]
    positive_wage_count = len(positive_wage)
    total_wage_gains = positive_wage['annual_change'].sum()
    avg_wage_change = wage_changes_valid['annual_change'].mean() if with_wage_data > 0 else 0
    positive_wage_rate = positive_wage_count / with_wage_data if with_wage_data > 0 else 0

    # Calculate FPL from longitudinal assessments (not navigator dashboard)
    # Get most recent assessment with income data for each participant
    assessments_sorted = assessments.sort_values('assessment_date')
    latest_assessments = assessments_sorted.groupby('participant_id').last().reset_index()

    # Calculate FPL from total_monthly_income and household size
    income_col = 'total_monthly_income'
    hh_cols = [c for c in latest_assessments.columns if 'how many' in c.lower() and 'adults' in c.lower()]
    hh_col = hh_cols[0] if hh_cols else None

    if income_col in latest_assessments.columns:
        latest_assessments['annual_income'] = latest_assessments[income_col] * 12
        if hh_col:
            latest_assessments['household_size'] = pd.to_numeric(latest_assessments[hh_col], errors='coerce').fillna(3)
        else:
            latest_assessments['household_size'] = 3

        def calc_fpl_pct(row):
            if pd.isna(row['annual_income']) or row['annual_income'] <= 0:
                return None
            hh = max(1, int(row['household_size']))
            poverty_line = FPL_BASE + FPL_PER_ADDITIONAL * (hh - 1)
            return (row['annual_income'] / poverty_line) * 100

        latest_assessments['fpl_current_pct'] = latest_assessments.apply(calc_fpl_pct, axis=1)
    else:
        latest_assessments['fpl_current_pct'] = np.nan

    # FPL-based metrics (from assessments)
    with_fpl_data = latest_assessments['fpl_current_pct'].notna().sum()

    # Graduation: FPL >= 225%
    graduates = latest_assessments[latest_assessments['fpl_current_pct'] >= 225]
    graduate_count = len(graduates)

    # Calculate FPL change by comparing first and last assessments
    first_assessments = assessments_sorted.groupby('participant_id').first().reset_index()
    if income_col in first_assessments.columns:
        first_assessments['annual_income'] = first_assessments[income_col] * 12
        if hh_col:
            first_assessments['household_size'] = pd.to_numeric(first_assessments[hh_col], errors='coerce').fillna(3)
        else:
            first_assessments['household_size'] = 3

        first_assessments['fpl_enrollment_pct'] = first_assessments.apply(calc_fpl_pct, axis=1)

        # Merge to calculate change
        fpl_change_df = latest_assessments[['participant_id', 'fpl_current_pct']].merge(
            first_assessments[['participant_id', 'fpl_enrollment_pct']],
            on='participant_id',
            how='inner'
        )
        fpl_change_df['fpl_change_pct'] = fpl_change_df['fpl_current_pct'] - fpl_change_df['fpl_enrollment_pct']
        positive_fpl = fpl_change_df[fpl_change_df['fpl_change_pct'] > 0]
        positive_fpl_count = len(positive_fpl)
        with_fpl_change = fpl_change_df['fpl_change_pct'].notna().sum()
        avg_fpl_change = fpl_change_df['fpl_change_pct'].mean() if with_fpl_change > 0 else 0
    else:
        positive_fpl_count = 0
        with_fpl_change = 0
        avg_fpl_change = 0

    # Success rates
    graduation_rate = graduate_count / with_fpl_data if with_fpl_data > 0 else 0

    # FPL tier distribution
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

    latest_assessments['fpl_tier'] = latest_assessments['fpl_current_pct'].apply(categorize_fpl)
    fpl_distribution = latest_assessments['fpl_tier'].value_counts().to_dict()

    # County breakdown from assessments (more complete coverage)
    assessments_with_changes = assessments.merge(
        wage_changes_valid[['participant_id', 'annual_change']],
        on='participant_id',
        how='left'
    )
    county_metrics = assessments_with_changes.groupby('County').agg({
        'participant_id': 'nunique',
        'annual_change': 'mean',
    }).rename(columns={'participant_id': 'count', 'annual_change': 'avg_wage_change'}).to_dict('index')

    # Navigator performance (from navigator tracking where available)
    nav_metrics = nav.groupby('navigator').agg({
        'participant_id': 'count',
        'fpl_change': 'mean',
        'wage_change': ['mean', 'sum'],
    })
    nav_metrics.columns = ['caseload', 'avg_fpl_change', 'avg_wage_change', 'total_wage_gains']
    navigator_performance = nav_metrics.to_dict('index')

    return {
        "summary": {
            "total_participants": total_participants,
            "navigator_tracked": nav_tracked,
            "with_wage_data": with_wage_data,
            "with_fpl_data": with_fpl_data,
        },
        "outcomes": {
            "graduates_225_fpl": graduate_count,
            "graduation_rate": round(graduation_rate * 100, 1),
            "positive_fpl_change_count": positive_fpl_count,
            "positive_fpl_rate": round(positive_fpl_count / with_fpl_change * 100, 1) if with_fpl_change > 0 else 0,
            "avg_fpl_change": round(avg_fpl_change, 1),
            "positive_wage_count": positive_wage_count,
            "positive_wage_rate": round(positive_wage_rate * 100, 1),
            "avg_wage_change": round(avg_wage_change, 2),
            "total_wage_gains": round(total_wage_gains, 2),
        },
        "fpl_distribution": fpl_distribution,
        "county_metrics": county_metrics,
        "navigator_performance": navigator_performance,
    }


def calculate_roi_metrics(data: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
    """
    Calculate ROI metrics at different tiers.
    Uses longitudinal assessments for wage changes to cover all participants.
    """
    assessments = data["assessments"]
    participants = data["participants"]

    # Calculate wage changes from longitudinal assessments
    wage_changes = calculate_wage_changes_from_assessments(assessments)

    # Include all participants with wage data (no time filter)
    wage_changes_valid = wage_changes

    # Total measured wage gains (positive only)
    positive_gains = wage_changes_valid[wage_changes_valid['annual_change'] > 0]
    total_gains_annualized = positive_gains['annual_change'].sum()

    # Count participants with positive gains
    positive_gainers = len(positive_gains)
    total_with_data = len(wage_changes_valid)

    # Conservative ROI: just measured wage gains
    conservative_roi = total_gains_annualized / PROGRAM_INVESTMENT if PROGRAM_INVESTMENT > 0 else 0

    # Data quality metrics
    data_completeness = {
        "wage_data_pct": round(total_with_data / len(participants) * 100, 1) if len(participants) > 0 else 0,
        "positive_gainers_pct": round(positive_gainers / total_with_data * 100, 1) if total_with_data > 0 else 0,
    }

    return {
        "measured_outcomes": {
            "total_annual_wage_gains": round(total_gains_annualized, 2),
            "positive_gainers_count": positive_gainers,
            "total_with_wage_data": total_with_data,
            "avg_gain_per_gainer": round(total_gains_annualized / positive_gainers, 2) if positive_gainers > 0 else 0,
        },
        "roi_tiers": {
            "conservative": {
                "description": "Measured wage gains only (first to last assessment)",
                "roi": round(conservative_roi, 4),
                "roi_formatted": f"{conservative_roi:.2f}:1",
            },
        },
        "data_quality": data_completeness,
        "investment": PROGRAM_INVESTMENT,
    }


if __name__ == "__main__":
    # Test metrics calculation
    data = load_processed_data()
    metrics = calculate_success_metrics(data)
    print("Success Metrics:")
    print(f"  Total participants: {metrics['summary']['total_participants']}")
    print(f"  Navigator tracked: {metrics['summary']['navigator_tracked']}")
    print(f"  Graduates (225%+ FPL): {metrics['outcomes']['graduates_225_fpl']}")
    print(f"  Positive wage changes: {metrics['outcomes']['positive_wage_count']}")
    print(f"  Total wage gains: ${metrics['outcomes']['total_wage_gains']:,.0f}")
