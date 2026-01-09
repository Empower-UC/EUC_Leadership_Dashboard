"""
Build master participant journey table from all raw data sources.
Combines Intake, Baseline, Quarterly, Change of Life, and Empower Participant Data.

Primary metrics (wage gains, FPL) come from Empower Participant Data when available,
which contains pre-calculated values that match the $6.2M wage gains figure.
"""
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime
from .load import (
    load_intake,
    load_baseline,
    load_quarterly,
    load_change_of_life,
    load_empower_data,
    load_graduates_225,
)

# FPL Constants
FPL_BASE = 15060
FPL_PER_ADDITIONAL = 5380


def calculate_fpl_pct(annual_income: float, household_size: int) -> float:
    """Calculate FPL percentage from annual income and household size."""
    if pd.isna(annual_income) or annual_income <= 0:
        return None
    hh = max(1, int(household_size)) if pd.notna(household_size) else 3
    poverty_line = FPL_BASE + FPL_PER_ADDITIONAL * (hh - 1)
    return (annual_income / poverty_line) * 100


def build_participant_journeys_from_raw() -> pd.DataFrame:
    """
    Build master participant journey table from all raw data sources.

    Uses Empower Participant Data as the PRIMARY source for wage gains and FPL
    (this data contains pre-calculated values matching the $6.2M figure).
    Uses 225% Families file as SOURCE OF TRUTH for graduate status.
    Supplements with Intake, Baseline, Quarterly, Change of Life for additional fields.
    """
    # Load all raw sources
    print("Loading raw data sources...")
    intake_dict = load_intake()
    baseline = load_baseline()  # Returns DataFrame directly
    quarterly_dict = load_quarterly()
    col_dict = load_change_of_life()
    empower = load_empower_data()  # Primary source for wage gains and FPL
    graduates_df = load_graduates_225()  # SOURCE OF TRUTH for graduates

    # Get graduate IDs from 225% Families file (authoritative)
    grad_id_col = [c for c in graduates_df.columns if 'uat' in c.lower() and 'id' in c.lower()]
    if grad_id_col:
        graduate_ids = set(pd.to_numeric(graduates_df[grad_id_col[0]], errors='coerce').dropna().astype(int).tolist())
    else:
        graduate_ids = set()
    print(f"  graduates: {len(graduate_ids)} unique IDs (source of truth)")

    # Get the main family-level data from each source
    # Intake and Quarterly have 'family' sheets with the main participant data
    intake = intake_dict.get('family', intake_dict.get(list(intake_dict.keys())[0]))
    quarterly = quarterly_dict.get('family', quarterly_dict.get(list(quarterly_dict.keys())[0]))
    change_of_life = col_dict.get('family', col_dict.get(list(col_dict.keys())[0]))

    # Standardize participant IDs
    def add_participant_id(df, name):
        id_cols = [c for c in df.columns if 'participant' in c.lower() and 'id' in c.lower()]
        if id_cols:
            df['participant_id'] = pd.to_numeric(df[id_cols[0]], errors='coerce')
        else:
            df['participant_id'] = np.nan
        print(f"  {name}: {len(df)} rows")
        return df

    intake = add_participant_id(intake.copy(), 'intake')
    baseline = add_participant_id(baseline.copy(), 'baseline')
    quarterly = add_participant_id(quarterly.copy(), 'quarterly')
    change_of_life = add_participant_id(change_of_life.copy(), 'change_of_life')

    # Process Empower data - this is our primary source for wage/FPL
    empower = process_empower_data(empower)
    print(f"  empower: {len(empower)} rows (primary source for wage/FPL)")

    # Get all unique participant IDs (from all sources including graduates)
    all_ids = set()
    for df in [intake, baseline, quarterly, change_of_life, empower]:
        valid_ids = df['participant_id'].dropna()
        if len(valid_ids) > 0:
            all_ids.update(valid_ids.astype(int).tolist())
    # Also include any graduate IDs not in other sources
    all_ids.update(graduate_ids)

    print(f"Found {len(all_ids)} unique participants across all sources")

    # Build journey for each participant
    journeys = []
    for pid in all_ids:
        journey = build_single_journey(pid, intake, baseline, quarterly, change_of_life, empower, graduate_ids)
        journeys.append(journey)

    journey_df = pd.DataFrame(journeys)

    # Verify graduate count
    grad_count = journey_df['is_graduate'].sum()
    print(f"Total graduates in output: {grad_count}")

    return journey_df


def process_empower_data(empower: pd.DataFrame) -> pd.DataFrame:
    """
    Process Empower Participant Data to extract key metrics.

    Empower data contains:
    - Participant ID / UAT ID
    - Wage Increases Since Enrollment (pre-calculated wage gains)
    - Current FPL (in decimal form: 2.25 = 225%)
    - FPL at Enrollment
    - Household Size
    - County
    - Navigator
    """
    df = empower.copy()

    # Find participant ID column
    id_cols = [c for c in df.columns if 'participant' in c.lower() or 'uat' in c.lower()]
    id_cols = [c for c in id_cols if 'id' in c.lower()]
    if id_cols:
        df['participant_id'] = pd.to_numeric(df[id_cols[0]], errors='coerce')
    else:
        df['participant_id'] = np.nan

    # Find wage increase column
    wage_cols = [c for c in df.columns if 'wage' in c.lower() and ('increase' in c.lower() or 'gain' in c.lower())]
    if wage_cols:
        df['empower_wage_gain'] = pd.to_numeric(df[wage_cols[0]], errors='coerce')
    else:
        df['empower_wage_gain'] = np.nan

    # Find current FPL column (decimal format: 2.25 = 225%)
    fpl_cols = [c for c in df.columns if 'fpl' in c.lower() and 'current' in c.lower()]
    if fpl_cols:
        df['empower_fpl_current'] = pd.to_numeric(df[fpl_cols[0]], errors='coerce')
        # Convert decimal to percentage (2.25 -> 225)
        # Use median to detect format (more robust than max due to outliers)
        median_fpl = df['empower_fpl_current'].median()
        if pd.notna(median_fpl) and median_fpl < 10:  # Median < 10 means decimal format
            df['empower_fpl_current'] = df['empower_fpl_current'] * 100
    else:
        df['empower_fpl_current'] = np.nan

    # Find enrollment FPL column
    enroll_fpl_cols = [c for c in df.columns if 'fpl' in c.lower() and ('enroll' in c.lower() or 'baseline' in c.lower())]
    if enroll_fpl_cols:
        df['empower_fpl_enrollment'] = pd.to_numeric(df[enroll_fpl_cols[0]], errors='coerce')
        # Convert decimal to percentage using median check
        median_fpl = df['empower_fpl_enrollment'].median()
        if pd.notna(median_fpl) and median_fpl < 10:
            df['empower_fpl_enrollment'] = df['empower_fpl_enrollment'] * 100
    else:
        df['empower_fpl_enrollment'] = np.nan

    # Find household size
    hh_cols = [c for c in df.columns if 'household' in c.lower() and 'size' in c.lower()]
    if hh_cols:
        df['empower_household_size'] = pd.to_numeric(df[hh_cols[0]], errors='coerce')
    else:
        df['empower_household_size'] = np.nan

    # Find county
    county_cols = [c for c in df.columns if c.lower() == 'county']
    if county_cols:
        df['empower_county'] = df[county_cols[0]]
    else:
        df['empower_county'] = np.nan

    # Find navigator
    nav_cols = [c for c in df.columns if 'navigator' in c.lower()]
    if nav_cols:
        df['empower_navigator'] = df[nav_cols[0]]
    else:
        df['empower_navigator'] = np.nan

    return df


def build_single_journey(pid: int, intake: pd.DataFrame, baseline: pd.DataFrame,
                         quarterly: pd.DataFrame, change_of_life: pd.DataFrame,
                         empower: pd.DataFrame = None, graduate_ids: set = None) -> dict:
    """
    Build journey record for a single participant.

    Priority for key metrics:
    1. Graduate status from 225% Families file - SOURCE OF TRUTH
    2. Empower Participant Data (wage gains, FPL) - PRIMARY SOURCE
    3. Quarterly assessments (timeline, supplemental data)
    4. Baseline (enrollment baseline data)
    5. Intake (enrollment info, demographics)
    """
    journey = {'participant_id': int(pid)}

    # Check if this participant is a graduate (from 225% Families file - authoritative)
    is_confirmed_graduate = graduate_ids is not None and pid in graduate_ids

    # Get records for this participant
    intake_rec = intake[intake['participant_id'] == pid]
    baseline_rec = baseline[baseline['participant_id'] == pid]
    quarterly_recs = quarterly[quarterly['participant_id'] == pid]
    col_recs = change_of_life[change_of_life['participant_id'] == pid]
    empower_rec = empower[empower['participant_id'] == pid] if empower is not None else pd.DataFrame()

    # ==== EMPOWER DATA (PRIMARY SOURCE for wage/FPL) ====
    if len(empower_rec) > 0:
        emp_row = empower_rec.iloc[0]
        # Wage gain from Empower (pre-calculated)
        if pd.notna(emp_row.get('empower_wage_gain')):
            journey['income_change_annual'] = emp_row['empower_wage_gain']
            journey['has_positive_income_change'] = emp_row['empower_wage_gain'] > 0

        # FPL from Empower
        if pd.notna(emp_row.get('empower_fpl_current')):
            journey['current_fpl'] = emp_row['empower_fpl_current']
        if pd.notna(emp_row.get('empower_fpl_enrollment')):
            journey['enrollment_fpl'] = emp_row['empower_fpl_enrollment']

        # FPL change
        if journey.get('current_fpl') and journey.get('enrollment_fpl'):
            journey['fpl_change'] = journey['current_fpl'] - journey['enrollment_fpl']

        # County from Empower (if available)
        if pd.notna(emp_row.get('empower_county')):
            journey['county'] = emp_row['empower_county']

        # Household size from Empower
        if pd.notna(emp_row.get('empower_household_size')):
            journey['household_size'] = emp_row['empower_household_size']

        # Navigator from Empower
        if pd.notna(emp_row.get('empower_navigator')):
            journey['navigator'] = emp_row['empower_navigator']

    # ==== ENROLLMENT INFO FROM INTAKE ====
    if len(intake_rec) > 0:
        row = intake_rec.iloc[0]
        # Only set county if not already set from Empower
        if not journey.get('county'):
            journey['county'] = get_field(row, ['County'])
        journey['enrollment_status'] = get_field(row, ['Enrollment Status'])
        journey['enrollment_date'] = parse_date(get_field(row, ['Submission Date']))
        journey['household_adults'] = get_numeric(row, ['how many adults', 'adults currently live'])
        journey['household_children'] = get_numeric(row, ['how many children', 'children currently live'])
        # Only set household_size if not already set from Empower
        if not journey.get('household_size'):
            journey['household_size'] = (journey.get('household_adults') or 1) + (journey.get('household_children') or 2)

    # ==== BASELINE ASSESSMENT ====
    if len(baseline_rec) > 0:
        row = baseline_rec.iloc[0]
        journey['baseline_date'] = parse_date(get_field(row, ['Submission Date']))
        journey['baseline_hourly_wage'] = get_numeric(row, ['Current Hourly Wage', 'hourly wage'])
        if journey.get('baseline_hourly_wage'):
            journey['baseline_monthly_income'] = journey['baseline_hourly_wage'] * 40 * 4.33

    # ==== QUARTERLY ASSESSMENTS ====
    if len(quarterly_recs) > 0:
        quarterly_recs = quarterly_recs.copy()
        quarterly_recs['_date'] = quarterly_recs.apply(
            lambda r: parse_date(get_field(r, ['Submission Date'])), axis=1
        )
        quarterly_recs = quarterly_recs.sort_values('_date')

        first_q = quarterly_recs.iloc[0]
        journey['first_quarterly_date'] = parse_date(get_field(first_q, ['Submission Date']))
        journey['first_quarterly_monthly_income'] = get_numeric(first_q, ['total_monthly_income', 'Monthly Income from Employment'])

        last_q = quarterly_recs.iloc[-1]
        journey['last_quarterly_date'] = parse_date(get_field(last_q, ['Submission Date']))
        journey['last_quarterly_monthly_income'] = get_numeric(last_q, ['total_monthly_income', 'Monthly Income from Employment'])

        journey['quarterly_count'] = len(quarterly_recs)

    # ==== FALLBACK CALCULATIONS (only if not set from Empower) ====
    if not journey.get('income_change_annual'):
        # Set final income values from quarterly/baseline
        journey['enrollment_monthly_income'] = journey.get('first_quarterly_monthly_income') or journey.get('baseline_monthly_income')
        journey['current_monthly_income'] = journey.get('last_quarterly_monthly_income') or journey.get('first_quarterly_monthly_income')

        # Calculate income change from quarterly data
        if journey.get('enrollment_monthly_income') and journey.get('current_monthly_income'):
            journey['income_change_monthly'] = journey['current_monthly_income'] - journey['enrollment_monthly_income']
            journey['income_change_annual'] = journey['income_change_monthly'] * 12
            journey['has_positive_income_change'] = (journey.get('income_change_annual') or 0) > 0

    if not journey.get('current_fpl'):
        # Calculate FPL from quarterly income data
        hh_size = journey.get('household_size') or 3
        if journey.get('enrollment_monthly_income'):
            journey['enrollment_fpl'] = calculate_fpl_pct(journey['enrollment_monthly_income'] * 12, hh_size)
        if journey.get('current_monthly_income'):
            journey['current_fpl'] = calculate_fpl_pct(journey['current_monthly_income'] * 12, hh_size)

        # FPL change
        if journey.get('enrollment_fpl') and journey.get('current_fpl'):
            journey['fpl_change'] = journey['current_fpl'] - journey['enrollment_fpl']

    # ==== DAYS IN PROGRAM ====
    enrollment_date = journey.get('enrollment_date') or journey.get('baseline_date') or journey.get('first_quarterly_date')
    last_date = journey.get('last_quarterly_date') or journey.get('first_quarterly_date') or journey.get('baseline_date')
    if enrollment_date and last_date:
        journey['days_in_program'] = (last_date - enrollment_date).days
    else:
        journey['days_in_program'] = None

    # ==== OUTCOME CLASSIFICATIONS ====
    # Graduate status: TRUE if in 225% Families file (authoritative) OR FPL >= 225%
    journey['is_graduate'] = is_confirmed_graduate or (journey.get('current_fpl') or 0) >= 225
    if 'has_positive_income_change' not in journey:
        journey['has_positive_income_change'] = (journey.get('income_change_annual') or 0) > 0
    journey['has_positive_fpl_change'] = (journey.get('fpl_change') or 0) > 0

    # Cliff tier classification
    # If confirmed graduate, always classify as graduated regardless of FPL data
    fpl = journey.get('current_fpl')
    if is_confirmed_graduate:
        journey['cliff_tier'] = "graduated"
    elif pd.isna(fpl) or fpl is None:
        journey['cliff_tier'] = "unknown"
    elif fpl >= 225:
        journey['cliff_tier'] = "graduated"
    elif fpl >= 185:
        journey['cliff_tier'] = "near_graduation"
    elif fpl >= 150:
        journey['cliff_tier'] = "deep_cliff"
    elif fpl >= 130:
        journey['cliff_tier'] = "liheap_childcare"
    elif fpl >= 100:
        journey['cliff_tier'] = "snap_tenncare"
    elif fpl >= 50:
        journey['cliff_tier'] = "deep_poverty"
    else:
        journey['cliff_tier'] = "extreme_poverty"

    # Assessment count
    journey['total_assessments'] = (
        (1 if len(baseline_rec) > 0 else 0) +
        len(quarterly_recs) +
        len(col_recs)
    )

    return journey


def get_field(row: pd.Series, possible_names: list) -> any:
    """Get field value by trying multiple possible column names."""
    for name in possible_names:
        for col in row.index:
            if name.lower() in col.lower():
                return row[col]
    return None


def get_numeric(row: pd.Series, possible_names: list) -> float:
    """Get numeric field value."""
    val = get_field(row, possible_names)
    if val is None:
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


def parse_date(val) -> pd.Timestamp:
    """Parse date from various formats."""
    if val is None or pd.isna(val):
        return None
    try:
        return pd.to_datetime(val)
    except:
        return None


def build_participant_journeys(assessments: pd.DataFrame) -> pd.DataFrame:
    """
    Build a master table tracking each participant's journey.

    Returns DataFrame with one row per participant containing:
    - Basic info: participant_id, county, enrollment_status
    - First assessment: first_date, first_monthly_income, first_fpl
    - Last assessment: last_date, last_monthly_income, last_fpl
    - Changes: income_change, fpl_change, days_in_program
    - Demographics: household_size, children_count
    - Outcomes: is_graduate, cliff_tier
    """
    df = assessments.copy()
    df['assessment_date'] = pd.to_datetime(df['assessment_date'], errors='coerce')
    df = df.sort_values('assessment_date')

    # Find key columns
    income_col = 'Monthly Income from Employment'
    total_income_col = 'total_monthly_income'

    # Use total_monthly_income if available, otherwise Monthly Income from Employment
    if total_income_col in df.columns:
        df['income'] = df[total_income_col]
    elif income_col in df.columns:
        df['income'] = df[income_col]
    else:
        df['income'] = np.nan

    # Find household and children columns
    hh_cols = [c for c in df.columns if 'how many' in c.lower() and 'adults' in c.lower()]
    children_cols = [c for c in df.columns if 'how many' in c.lower() and 'children' in c.lower()]

    hh_col = hh_cols[0] if hh_cols else None
    children_col = children_cols[0] if children_cols else None

    # Get first and last assessment per participant
    first = df.groupby('participant_id').first().reset_index()
    last = df.groupby('participant_id').last().reset_index()

    # Build journey DataFrame
    journey = pd.DataFrame()
    journey['participant_id'] = first['participant_id']

    # Basic info from first assessment (usually intake/baseline)
    journey['county'] = first.get('County', np.nan)
    journey['enrollment_status'] = first.get('Enrollment Status', np.nan)

    # First assessment data
    journey['first_date'] = first['assessment_date']
    journey['first_assessment_type'] = first.get('assessment_type', np.nan)
    journey['first_monthly_income'] = first['income']

    # Last assessment data
    journey['last_date'] = last['assessment_date']
    journey['last_assessment_type'] = last.get('assessment_type', np.nan)
    journey['last_monthly_income'] = last['income']

    # Demographics (use latest available)
    if hh_col:
        journey['household_size'] = pd.to_numeric(last[hh_col], errors='coerce').fillna(3)
    else:
        journey['household_size'] = 3

    if children_col:
        journey['children_count'] = pd.to_numeric(last[children_col], errors='coerce').fillna(1)
    else:
        journey['children_count'] = journey['household_size'] - 1

    # Calculate FPL at enrollment and current
    journey['first_fpl'] = journey.apply(
        lambda r: calculate_fpl_pct(r['first_monthly_income'] * 12 if pd.notna(r['first_monthly_income']) else None, r['household_size']),
        axis=1
    )
    journey['last_fpl'] = journey.apply(
        lambda r: calculate_fpl_pct(r['last_monthly_income'] * 12 if pd.notna(r['last_monthly_income']) else None, r['household_size']),
        axis=1
    )

    # Calculate changes
    journey['income_change_monthly'] = journey['last_monthly_income'] - journey['first_monthly_income']
    journey['income_change_annual'] = journey['income_change_monthly'] * 12
    journey['fpl_change'] = journey['last_fpl'] - journey['first_fpl']
    journey['days_in_program'] = (journey['last_date'] - journey['first_date']).dt.days

    # Outcome classifications
    journey['is_graduate'] = journey['last_fpl'] >= 225
    journey['has_positive_income_change'] = journey['income_change_annual'] > 0
    journey['has_positive_fpl_change'] = journey['fpl_change'] > 0

    # Cliff tier classification
    def classify_cliff_tier(fpl):
        if pd.isna(fpl):
            return "unknown"
        if fpl >= 225:
            return "graduated"
        if fpl >= 185:
            return "near_graduation"
        if fpl >= 150:
            return "deep_cliff"
        if fpl >= 130:
            return "liheap_childcare"
        if fpl >= 100:
            return "snap_tenncare"
        if fpl >= 50:
            return "deep_poverty"
        return "extreme_poverty"

    journey['cliff_tier'] = journey['last_fpl'].apply(classify_cliff_tier)

    # Assessment count per participant
    assessment_counts = df.groupby('participant_id').size().reset_index(name='assessment_count')
    journey = journey.merge(assessment_counts, on='participant_id', how='left')

    return journey


def save_participant_journeys(output_dir: Path = None, from_raw: bool = True):
    """Build and save participant journeys to CSV."""
    if output_dir is None:
        output_dir = Path(__file__).parent.parent.parent / "data" / "processed"

    if from_raw:
        # Build from raw data sources (recommended)
        journey = build_participant_journeys_from_raw()
    else:
        # Build from processed assessments file
        assessments_path = output_dir / "assessments_longitudinal.csv"
        if not assessments_path.exists():
            raise FileNotFoundError(f"Assessments file not found: {assessments_path}")
        assessments = pd.read_csv(assessments_path)
        journey = build_participant_journeys(assessments)

    # Remove columns that are blank for every participant
    non_empty_cols = []
    for col in journey.columns:
        if journey[col].notna().any():
            non_empty_cols.append(col)
        else:
            print(f"  Dropping empty column: {col}")

    journey = journey[non_empty_cols]

    output_path = output_dir / "participant_journeys.csv"
    journey.to_csv(output_path, index=False)

    print(f"Saved {len(journey)} participant journeys ({len(non_empty_cols)} columns) to {output_path}")
    return journey


if __name__ == "__main__":
    journey = save_participant_journeys()

    print("\n=== JOURNEY SUMMARY ===")
    print(f"Total participants: {len(journey)}")
    print(f"Columns: {list(journey.columns)}")
    if 'current_monthly_income' in journey.columns:
        print(f"With income data: {journey['current_monthly_income'].notna().sum()}")
    if 'current_fpl' in journey.columns:
        print(f"With FPL data: {journey['current_fpl'].notna().sum()}")
    if 'is_graduate' in journey.columns:
        print(f"Graduates (225%+): {journey['is_graduate'].sum()}")
    if 'has_positive_income_change' in journey.columns:
        print(f"Positive income change: {journey['has_positive_income_change'].sum()}")

    if 'cliff_tier' in journey.columns:
        print("\n=== CLIFF TIER DISTRIBUTION ===")
        print(journey['cliff_tier'].value_counts())

    if 'income_change_annual' in journey.columns:
        print("\n=== KEY METRICS ===")
        positive = journey[journey['income_change_annual'] > 0]
        print(f"Total annual wage gains: ${positive['income_change_annual'].sum():,.0f}")
        valid = journey['income_change_annual'].dropna()
        if len(valid) > 0:
            print(f"Avg income change (all): ${valid.mean():,.0f}")
    if 'fpl_change' in journey.columns:
        valid_fpl = journey['fpl_change'].dropna()
        if len(valid_fpl) > 0:
            print(f"Avg FPL change: {valid_fpl.mean():.1f} pts")
