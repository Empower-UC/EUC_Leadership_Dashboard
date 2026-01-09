"""
Main ETL pipeline for EUC data processing.
Orchestrates loading, cleaning, and transformation of all data sources.

IMPORTANT: Preserves ALL data points, even with missing fields.
Missing data is valuable for pattern analysis.

Usage:
    python -m src.etl.pipeline
    OR
    uv run python -m src.etl.pipeline
"""
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime
import json
from typing import Dict, Any

from .config import (
    SOURCE_FILES, DATA_PROCESSED, DASHBOARD_DATA, OUTPUTS,
    FPL_THRESHOLDS, PROGRAM_CONSTANTS, MIN_CELL_SIZE
)
from .load import load_all


def clean_dataframe(df: pd.DataFrame, source_name: str) -> pd.DataFrame:
    """
    Light cleaning that preserves all rows.
    - Strips whitespace from string columns
    - Standardizes participant ID column name
    - Marks but does NOT remove duplicates
    """
    df = df.copy()

    # Strip whitespace from string columns
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].astype(str).str.strip()
        df[col] = df[col].replace(['nan', 'None', ''], np.nan)

    # Standardize participant ID column if present
    id_cols = [c for c in df.columns if 'participant' in c.lower() and 'id' in c.lower()]
    if id_cols:
        df['participant_id'] = pd.to_numeric(df[id_cols[0]], errors='coerce')

    # Mark duplicates but don't remove (flag in 'name' fields)
    for col in df.columns:
        if df[col].dtype == object:
            mask = df[col].astype(str).str.contains('_DUPLICATE', case=False, na=False)
            if mask.any():
                df['_is_duplicate'] = mask
                print(f"  [{source_name}] Flagged {mask.sum()} duplicate-marked rows")
                break
    else:
        df['_is_duplicate'] = False

    return df


def process_intake(intake_data: Dict[str, pd.DataFrame]) -> Dict[str, pd.DataFrame]:
    """Process Intake Report - preserves all sheets and all rows."""
    print("\n" + "="*60)
    print("PROCESSING INTAKE DATA")
    print("="*60)

    processed = {}

    for sheet_name, df in intake_data.items():
        cleaned = clean_dataframe(df, f"intake_{sheet_name}")
        cleaned['_source'] = 'intake'
        cleaned['_sheet'] = sheet_name
        processed[sheet_name] = cleaned
        print(f"  {sheet_name}: {len(cleaned)} rows preserved")

    return processed


def process_baseline(baseline_df: pd.DataFrame) -> pd.DataFrame:
    """Process Baseline Assessment - preserves all rows."""
    print("\n" + "="*60)
    print("PROCESSING BASELINE DATA")
    print("="*60)

    cleaned = clean_dataframe(baseline_df, "baseline")
    cleaned['_source'] = 'baseline'
    cleaned['assessment_type'] = 'baseline'

    print(f"  {len(cleaned)} rows preserved")

    return cleaned


def process_quarterly(quarterly_data: Dict[str, pd.DataFrame]) -> Dict[str, pd.DataFrame]:
    """Process Quarterly Assessment - preserves all sheets and all rows."""
    print("\n" + "="*60)
    print("PROCESSING QUARTERLY DATA")
    print("="*60)

    processed = {}

    for sheet_name, df in quarterly_data.items():
        cleaned = clean_dataframe(df, f"quarterly_{sheet_name}")
        cleaned['_source'] = 'quarterly'
        cleaned['_sheet'] = sheet_name
        cleaned['assessment_type'] = 'quarterly'
        processed[sheet_name] = cleaned
        print(f"  {sheet_name}: {len(cleaned)} rows preserved")

    return processed


def process_change_of_life(col_data: Dict[str, pd.DataFrame]) -> Dict[str, pd.DataFrame]:
    """Process Change of Life Assessment - preserves all sheets and all rows."""
    print("\n" + "="*60)
    print("PROCESSING CHANGE OF LIFE DATA")
    print("="*60)

    processed = {}

    for sheet_name, df in col_data.items():
        cleaned = clean_dataframe(df, f"change_of_life_{sheet_name}")
        cleaned['_source'] = 'change_of_life'
        cleaned['_sheet'] = sheet_name
        cleaned['assessment_type'] = 'change_of_life'
        processed[sheet_name] = cleaned
        print(f"  {sheet_name}: {len(cleaned)} rows preserved")

    return processed


def process_navigator_tracking(navigator_df: pd.DataFrame) -> pd.DataFrame:
    """
    Process Navigator Dashboard Monthly Client Review.
    Extracts navigator assignments, FPL tracking, and benefit cliff flags.
    """
    print("\n" + "="*60)
    print("PROCESSING NAVIGATOR TRACKING DATA")
    print("="*60)

    df = navigator_df.copy()

    # Find and standardize participant ID column
    id_cols = [c for c in df.columns if 'UAT ID' in str(c)]
    if id_cols:
        df['participant_id'] = pd.to_numeric(df[id_cols[0]], errors='coerce')

    # Remove rows without valid participant IDs
    before = len(df)
    df = df.dropna(subset=['participant_id'])
    df['participant_id'] = df['participant_id'].astype(int)
    after = len(df)
    if before > after:
        print(f"  Removed {before - after} rows without valid participant IDs")

    # Extract key columns (flexible matching)
    col_map = {}
    for orig_col in df.columns:
        col_lower = str(orig_col).lower()
        if 'navigator' in col_lower and 'navigator' not in col_map:
            col_map['navigator'] = orig_col
        elif 'enrollment date' in col_lower:
            col_map['enrollment_date'] = orig_col
        elif 'county' in col_lower and 'county' not in col_map:
            col_map['county'] = orig_col
        elif 'days in program' in col_lower:
            col_map['days_in_program'] = orig_col
        elif 'fpl at enrollment' in col_lower:
            col_map['fpl_enrollment'] = orig_col
        elif 'current fpl' in col_lower:
            col_map['fpl_current'] = orig_col
        elif 'fpl change' in col_lower:
            col_map['fpl_change'] = orig_col
        elif 'wage increase' in col_lower:
            col_map['wage_change'] = orig_col
        elif 'annual income at enrollment' in col_lower:
            col_map['annual_income_enrollment'] = orig_col
        elif 'current annual income' in col_lower:
            col_map['annual_income_current'] = orig_col
        elif 'household size at enrollment' in col_lower:
            col_map['household_size_enrollment'] = orig_col
        elif 'household size currently' in col_lower:
            col_map['household_size_current'] = orig_col

    # Apply column mapping
    for new_name, old_name in col_map.items():
        df[new_name] = df[old_name]

    # Clean numeric columns
    numeric_cols = ['fpl_enrollment', 'fpl_current', 'fpl_change', 'wage_change',
                    'annual_income_enrollment', 'annual_income_current',
                    'days_in_program', 'household_size_enrollment', 'household_size_current']
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

    # Clean date column
    if 'enrollment_date' in df.columns:
        df['enrollment_date'] = pd.to_datetime(df['enrollment_date'], errors='coerce')

    df['_source'] = 'navigator_dashboard'

    print(f"  {len(df)} navigator tracking records processed")
    print(f"  Navigators found: {df['navigator'].nunique() if 'navigator' in df.columns else 'N/A'}")

    return df


def build_master_participants(
    intake: Dict[str, pd.DataFrame],
    baseline: pd.DataFrame,
) -> pd.DataFrame:
    """
    Build master participants table from Intake and Baseline.
    One row per participant, preserving all available data.
    """
    print("\n" + "="*60)
    print("BUILDING MASTER PARTICIPANTS TABLE")
    print("="*60)

    # Start with intake family data (most complete enrollment info)
    intake_family = intake.get('family', pd.DataFrame())

    if len(intake_family) == 0:
        print("  WARNING: No intake family data found")
        return pd.DataFrame()

    # Get unique participants from intake
    participants = intake_family.copy()

    # Ensure participant_id exists and is clean
    if 'participant_id' not in participants.columns:
        id_cols = [c for c in participants.columns if 'participant' in c.lower() and 'id' in c.lower()]
        if id_cols:
            participants['participant_id'] = pd.to_numeric(participants[id_cols[0]], errors='coerce')

    # Remove true duplicates (same participant_id, keep first by submission date)
    date_cols = [c for c in participants.columns if 'date' in c.lower() or 'submission' in c.lower()]
    if date_cols:
        participants = participants.sort_values(date_cols[0])

    participants = participants.drop_duplicates(subset=['participant_id'], keep='first')

    # Add baseline data where available
    if len(baseline) > 0 and 'participant_id' in baseline.columns:
        baseline_subset = baseline[['participant_id']].copy()
        # Add baseline-specific columns
        baseline_cols_to_add = [
            c for c in baseline.columns
            if c not in participants.columns and c != 'participant_id'
        ]
        for col in baseline_cols_to_add[:20]:  # Limit to avoid explosion
            baseline_subset[f'baseline_{col}'] = baseline[col].values

        # Merge on participant_id
        before = len(participants)
        participants = participants.merge(
            baseline_subset.drop_duplicates(subset=['participant_id'], keep='first'),
            on='participant_id',
            how='left'
        )
        print(f"  Merged baseline data: {before} -> {len(participants)} rows")

    print(f"  Final: {len(participants)} unique participants")
    print(f"  With valid participant_id: {participants['participant_id'].notna().sum()}")

    return participants


def build_longitudinal_assessments(
    baseline: pd.DataFrame,
    quarterly: Dict[str, pd.DataFrame],
    change_of_life: Dict[str, pd.DataFrame],
) -> pd.DataFrame:
    """
    Build longitudinal assessments table combining ALL assessment records.
    Multiple rows per participant - this is the journey over time.
    PRESERVES ALL ROWS even with missing data.
    """
    print("\n" + "="*60)
    print("BUILDING LONGITUDINAL ASSESSMENTS TABLE")
    print("="*60)

    all_assessments = []

    # Common columns we want in the unified table
    common_cols = [
        'participant_id', 'assessment_type', '_source',
        'Enrollment Status', 'County',
    ]

    # Find date columns
    def find_date_col(df):
        for c in df.columns:
            if 'submission' in c.lower() or 'date' in c.lower():
                return c
        return None

    # Find income columns
    def find_income_cols(df):
        income_cols = {}
        for c in df.columns:
            cl = c.lower()
            if 'monthly income' in cl and 'employment' in cl:
                income_cols['monthly_income_employment'] = c
            elif 'total monthly income' in cl:
                income_cols['total_monthly_income'] = c
            elif 'total monthly benefit' in cl:
                income_cols['total_monthly_benefits'] = c
            elif 'total monthly expense' in cl:
                income_cols['total_monthly_expenses'] = c
        return income_cols

    # Process baseline
    if len(baseline) > 0:
        base_df = baseline.copy()
        base_df['assessment_type'] = 'baseline'
        date_col = find_date_col(base_df)
        if date_col:
            base_df['assessment_date'] = base_df[date_col]
        all_assessments.append(base_df)
        print(f"  Baseline: {len(base_df)} records")

    # Process quarterly family sheet
    if 'family' in quarterly:
        q_df = quarterly['family'].copy()
        q_df['assessment_type'] = 'quarterly'
        date_col = find_date_col(q_df)
        if date_col:
            q_df['assessment_date'] = q_df[date_col]
        income_cols = find_income_cols(q_df)
        for new_name, old_name in income_cols.items():
            q_df[new_name] = q_df[old_name]
        all_assessments.append(q_df)
        print(f"  Quarterly: {len(q_df)} records")

    # Process change of life family sheet
    if 'family' in change_of_life:
        col_df = change_of_life['family'].copy()
        col_df['assessment_type'] = 'change_of_life'
        date_col = find_date_col(col_df)
        if date_col:
            col_df['assessment_date'] = col_df[date_col]
        income_cols = find_income_cols(col_df)
        for new_name, old_name in income_cols.items():
            col_df[new_name] = col_df[old_name]
        all_assessments.append(col_df)
        print(f"  Change of Life: {len(col_df)} records")

    # Combine all
    if not all_assessments:
        print("  WARNING: No assessments found")
        return pd.DataFrame()

    # Get union of all columns
    all_cols = set()
    for df in all_assessments:
        all_cols.update(df.columns)

    # Ensure all dataframes have all columns
    for i, df in enumerate(all_assessments):
        for col in all_cols:
            if col not in df.columns:
                df[col] = np.nan
        all_assessments[i] = df

    combined = pd.concat(all_assessments, ignore_index=True)

    # Sort by participant and date
    if 'assessment_date' in combined.columns:
        # Use format='mixed' to handle different date formats (24h vs AM/PM)
        combined['assessment_date'] = pd.to_datetime(combined['assessment_date'], format='mixed', errors='coerce')
        combined = combined.sort_values(['participant_id', 'assessment_date'])

    print(f"\n  TOTAL ASSESSMENTS: {len(combined)}")
    print(f"  Unique participants: {combined['participant_id'].nunique()}")
    print(f"  By type:")
    print(combined['assessment_type'].value_counts().to_string())

    return combined


def generate_data_quality_report(
    participants: pd.DataFrame,
    assessments: pd.DataFrame,
) -> str:
    """Generate markdown data quality report."""

    report = []
    report.append("# EUC Data Quality Report")
    report.append(f"\nGenerated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    report.append("## Summary\n")
    report.append(f"- **Total Unique Participants**: {len(participants)}")
    report.append(f"- **Total Assessment Records**: {len(assessments)}")
    report.append(f"- **Assessment Types**: {assessments['assessment_type'].nunique()}")

    if 'participant_id' in participants.columns:
        valid_ids = participants['participant_id'].notna().sum()
        report.append(f"- **Participants with valid ID**: {valid_ids} ({valid_ids/len(participants)*100:.1f}%)")

    report.append("\n## Enrollment Status Breakdown\n")
    if 'Enrollment Status' in participants.columns:
        status_counts = participants['Enrollment Status'].value_counts()
        for status, count in status_counts.items():
            pct = count / len(participants) * 100
            report.append(f"- {status}: {count} ({pct:.1f}%)")

    report.append("\n## Assessment Type Breakdown\n")
    type_counts = assessments['assessment_type'].value_counts()
    for atype, count in type_counts.items():
        report.append(f"- {atype}: {count} records")

    report.append("\n## Assessments Per Participant\n")
    assess_per_participant = assessments.groupby('participant_id').size()
    report.append(f"- Mean: {assess_per_participant.mean():.1f}")
    report.append(f"- Median: {assess_per_participant.median():.0f}")
    report.append(f"- Max: {assess_per_participant.max()}")
    report.append(f"- Participants with 1 assessment: {(assess_per_participant == 1).sum()}")
    report.append(f"- Participants with 2+ assessments: {(assess_per_participant >= 2).sum()}")
    report.append(f"- Participants with 5+ assessments: {(assess_per_participant >= 5).sum()}")

    report.append("\n## County Distribution\n")
    if 'County' in participants.columns:
        county_counts = participants['County'].value_counts().head(10)
        for county, count in county_counts.items():
            report.append(f"- {county}: {count}")

    report.append("\n## Data Completeness\n")
    key_cols = ['participant_id', 'Enrollment Status', 'County', 'assessment_date']
    for col in key_cols:
        if col in assessments.columns:
            filled = assessments[col].notna().sum()
            pct = filled / len(assessments) * 100
            report.append(f"- {col}: {filled}/{len(assessments)} ({pct:.1f}% filled)")

    # Data quality issues - participants with assessments but no intake record
    report.append("\n## Data Quality Issues\n")
    intake_ids = set(participants['participant_id'].dropna().unique())
    assess_ids = set(assessments['participant_id'].dropna().unique())
    missing_intake = assess_ids - intake_ids

    if missing_intake:
        report.append(f"### Participants with Assessments but No Intake Record\n")
        report.append(f"- **Count**: {len(missing_intake)} participants")
        report.append(f"- These participants have assessment data but no intake form on record")
        missing_ids = sorted([int(x) for x in missing_intake])[:20]
        report.append(f"- IDs: {missing_ids}{'...' if len(missing_intake) > 20 else ''}")
    else:
        report.append("- No data quality issues detected")

    return "\n".join(report)


def run_pipeline():
    """Main pipeline execution."""
    print("\n" + "="*60)
    print("EUC DATA ETL PIPELINE")
    print("="*60)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Ensure output directories exist
    DATA_PROCESSED.mkdir(parents=True, exist_ok=True)
    OUTPUTS.mkdir(parents=True, exist_ok=True)

    # Load all raw data
    raw_data = load_all()

    # Process each source
    intake = process_intake(raw_data['intake'])
    baseline = process_baseline(raw_data['baseline'])
    quarterly = process_quarterly(raw_data['quarterly'])
    change_of_life = process_change_of_life(raw_data['change_of_life'])
    navigator_tracking = process_navigator_tracking(raw_data['navigator_dashboard'])

    # Build master tables
    participants = build_master_participants(intake, baseline)
    assessments = build_longitudinal_assessments(baseline, quarterly, change_of_life)

    # Save processed data
    print("\n" + "="*60)
    print("SAVING PROCESSED DATA")
    print("="*60)

    # Save participants
    participants_path = DATA_PROCESSED / "participants.csv"
    participants.to_csv(participants_path, index=False)
    print(f"  Saved: {participants_path}")

    # Save assessments
    assessments_path = DATA_PROCESSED / "assessments_longitudinal.csv"
    assessments.to_csv(assessments_path, index=False)
    print(f"  Saved: {assessments_path}")

    # Save each intake sheet
    for sheet_name, df in intake.items():
        path = DATA_PROCESSED / f"intake_{sheet_name}.csv"
        df.to_csv(path, index=False)
        print(f"  Saved: {path}")

    # Save each quarterly sheet
    for sheet_name, df in quarterly.items():
        path = DATA_PROCESSED / f"quarterly_{sheet_name}.csv"
        df.to_csv(path, index=False)
        print(f"  Saved: {path}")

    # Save each change of life sheet
    for sheet_name, df in change_of_life.items():
        path = DATA_PROCESSED / f"change_of_life_{sheet_name}.csv"
        df.to_csv(path, index=False)
        print(f"  Saved: {path}")

    # Save navigator tracking
    navigator_path = DATA_PROCESSED / "navigator_tracking.csv"
    navigator_tracking.to_csv(navigator_path, index=False)
    print(f"  Saved: {navigator_path}")

    # Generate and save data quality report
    report = generate_data_quality_report(participants, assessments)
    report_path = OUTPUTS / "data_quality_report.md"
    report_path.write_text(report)
    print(f"  Saved: {report_path}")

    # Build participant journeys (master table)
    print("\n" + "="*60)
    print("BUILDING PARTICIPANT JOURNEYS")
    print("="*60)
    from .journey import save_participant_journeys
    journeys = save_participant_journeys(DATA_PROCESSED)

    # Generate dashboard JSON files
    print("\n" + "="*60)
    print("GENERATING DASHBOARD JSON")
    print("="*60)
    from pipeline.analytics.generate import generate_all_dashboard_json
    generate_all_dashboard_json(DASHBOARD_DATA)

    print("\n" + "="*60)
    print("PIPELINE COMPLETE")
    print("="*60)
    print(f"Finished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    return {
        "participants": participants,
        "assessments": assessments,
        "intake": intake,
        "quarterly": quarterly,
        "change_of_life": change_of_life,
        "navigator_tracking": navigator_tracking,
    }


def main():
    """Entry point for command-line execution."""
    run_pipeline()


if __name__ == "__main__":
    main()
