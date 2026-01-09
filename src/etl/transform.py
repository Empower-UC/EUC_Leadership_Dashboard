"""
Data transformation for EUC data.
Cleans, standardizes, and links data from multiple sources.
"""
import pandas as pd
import numpy as np
from typing import Dict, Tuple, Optional
from datetime import datetime
from .config import FPL_THRESHOLDS, STATUS_CATEGORIES


def clean_participant_id(df: pd.DataFrame, id_col: str = "Participant ID") -> pd.DataFrame:
    """
    Clean and standardize participant IDs.
    - Remove duplicates marked with "_DUPLICATE"
    - Convert to consistent integer type
    - Remove rows with missing IDs
    """
    df = df.copy()

    # Check if column exists
    if id_col not in df.columns:
        print(f"  Warning: {id_col} column not found")
        return df

    # Remove duplicate markers from related text fields if present
    for col in df.columns:
        if df[col].dtype == object:
            # Check if any values contain "_DUPLICATE"
            mask = df[col].astype(str).str.contains("_DUPLICATE", case=False, na=False)
            if mask.any():
                print(f"  Removing {mask.sum()} duplicate-marked rows")
                df = df[~mask]
                break

    # Convert ID to numeric, coerce errors to NaN
    df[id_col] = pd.to_numeric(df[id_col], errors="coerce")

    # Remove rows with missing IDs
    before = len(df)
    df = df.dropna(subset=[id_col])
    after = len(df)
    if before > after:
        print(f"  Removed {before - after} rows with missing participant IDs")

    # Convert to integer
    df[id_col] = df[id_col].astype(int)

    return df


def build_participants_table(intake_family: pd.DataFrame) -> pd.DataFrame:
    """
    Build the master participants table from Intake Family data.
    One row per participant with demographics and enrollment info.
    """
    print("\nBuilding participants table...")

    df = intake_family.copy()

    # Clean participant IDs
    df = clean_participant_id(df)

    # Select and rename columns for participants table
    columns_map = {
        "Participant ID": "participant_id",
        "Family Unique ID": "family_id",
        "Enrollment Group": "enrollment_group",
        "Enrollment Status": "enrollment_status",
        "Submission Date": "enrollment_date",
        "County": "county",
        "Living Situation": "living_situation",
        "Household Structure": "household_structure",
        "How many adults live in your household?": "adults_in_household",
        "How many children live in your household?": "children_in_household",
    }

    # Only include columns that exist
    available_cols = {k: v for k, v in columns_map.items() if k in df.columns}
    participants = df[list(available_cols.keys())].rename(columns=available_cols)

    # Deduplicate by participant_id (keep first/earliest record)
    participants = participants.sort_values("enrollment_date")
    before = len(participants)
    participants = participants.drop_duplicates(subset=["participant_id"], keep="first")
    after = len(participants)
    if before > after:
        print(f"  Deduplicated: {before} -> {after} participants")

    # Calculate household size
    participants["household_size"] = (
        participants["adults_in_household"].fillna(1) +
        participants["children_in_household"].fillna(0)
    ).astype(int)

    # Standardize enrollment status
    participants["enrollment_status"] = participants["enrollment_status"].str.strip()

    # Derive is_graduated (will be updated later with FPL data)
    participants["is_graduated"] = False

    print(f"  Created participants table: {len(participants)} unique participants")

    return participants


def build_assessments_table(
    baseline: pd.DataFrame,
    quarterly: Dict[str, pd.DataFrame],
    change_of_life: Dict[str, pd.DataFrame],
) -> pd.DataFrame:
    """
    Build longitudinal assessments table combining all assessment types.
    Multiple rows per participant showing their journey over time.
    """
    print("\nBuilding longitudinal assessments table...")

    assessments = []

    # Process Baseline (single sheet)
    print("  Processing baseline assessments...")
    baseline_df = baseline.copy()
    baseline_df = clean_participant_id(baseline_df)

    # Find FPL/income related columns in baseline
    # Baseline may not have FPL directly - might need to calculate from income
    baseline_records = []
    for _, row in baseline_df.iterrows():
        record = {
            "participant_id": row.get("Participant ID"),
            "assessment_type": "baseline",
            "assessment_date": row.get("Submission Date") or row.get("Assessment Date"),
            "enrollment_status": row.get("Enrollment Status"),
            "employment_status": row.get("Current Employment Status"),
            "hourly_wage": row.get("Hourly Wage (Current or Most Recent Job)"),
            "hours_per_week": row.get("Hours Per Week (Current or Most Recent Job)"),
            "education_level": row.get("Highest Grade Completed"),
            "general_health": row.get("In general, would you say your health is:"),
        }
        baseline_records.append(record)

    baseline_assess = pd.DataFrame(baseline_records)
    baseline_assess = baseline_assess.dropna(subset=["participant_id"])
    print(f"    Baseline: {len(baseline_assess)} assessments")
    assessments.append(baseline_assess)

    # Process Quarterly (Family sheet has income data)
    print("  Processing quarterly assessments...")
    if "family" in quarterly:
        quarterly_df = quarterly["family"].copy()
        quarterly_df = clean_participant_id(quarterly_df)

        quarterly_records = []
        for _, row in quarterly_df.iterrows():
            record = {
                "participant_id": row.get("Participant ID"),
                "assessment_type": "quarterly",
                "assessment_date": row.get("Submission Date"),
                "enrollment_status": row.get("Enrollment Status"),
                "monthly_income_employment": row.get("Monthly Income from Employment"),
                "total_monthly_income": row.get("Total Monthly Income"),
                "total_monthly_benefits": row.get("Total Monthly Benefit Income"),
                "total_monthly_expenses": row.get("Total Monthly Expenses"),
            }
            quarterly_records.append(record)

        quarterly_assess = pd.DataFrame(quarterly_records)
        quarterly_assess = quarterly_assess.dropna(subset=["participant_id"])
        print(f"    Quarterly: {len(quarterly_assess)} assessments")
        assessments.append(quarterly_assess)

    # Process Change of Life (Family sheet)
    print("  Processing change of life assessments...")
    if "family" in change_of_life:
        col_df = change_of_life["family"].copy()
        col_df = clean_participant_id(col_df)

        col_records = []
        for _, row in col_df.iterrows():
            record = {
                "participant_id": row.get("Participant ID"),
                "assessment_type": "change_of_life",
                "assessment_date": row.get("Submission Date"),
                "enrollment_status": row.get("Enrollment Status"),
                "monthly_income_employment": row.get("Monthly Income from Employment"),
                "total_monthly_income": row.get("Total Monthly Income"),
                "total_monthly_benefits": row.get("Total Monthly Benefit Income"),
                "total_monthly_expenses": row.get("Total Monthly Expenses"),
            }
            col_records.append(record)

        col_assess = pd.DataFrame(col_records)
        col_assess = col_assess.dropna(subset=["participant_id"])
        print(f"    Change of Life: {len(col_assess)} assessments")
        assessments.append(col_assess)

    # Combine all assessments
    all_assessments = pd.concat(assessments, ignore_index=True)

    # Convert participant_id to int
    all_assessments["participant_id"] = all_assessments["participant_id"].astype(int)

    # Sort by participant and date
    all_assessments = all_assessments.sort_values(
        ["participant_id", "assessment_date"]
    ).reset_index(drop=True)

    print(f"\n  Total assessments: {len(all_assessments)}")
    print(f"  Unique participants with assessments: {all_assessments['participant_id'].nunique()}")
    print(f"  Assessment type breakdown:")
    print(all_assessments["assessment_type"].value_counts().to_string())

    return all_assessments


def calculate_fpl_from_income(
    annual_income: float,
    household_size: int,
    year: int = 2024
) -> float:
    """
    Calculate FPL percentage from annual income and household size.
    Using 2024 HHS poverty guidelines.
    """
    # 2024 Federal Poverty Guidelines (lower 48 states)
    fpl_base = 15060  # For 1 person
    fpl_per_additional = 5380  # For each additional person

    if household_size < 1:
        household_size = 1

    poverty_line = fpl_base + (fpl_per_additional * (household_size - 1))

    if poverty_line == 0:
        return None

    return (annual_income / poverty_line) * 100


def link_and_enrich(
    participants: pd.DataFrame,
    assessments: pd.DataFrame,
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Link participants to their assessments and calculate derived metrics.
    """
    print("\nLinking and enriching data...")

    # Get latest assessment per participant
    latest = assessments.sort_values("assessment_date").groupby("participant_id").last()

    # Get baseline assessment per participant
    baseline_only = assessments[assessments["assessment_type"] == "baseline"]
    baseline_by_id = baseline_only.set_index("participant_id")

    # Add latest assessment data to participants
    participants = participants.set_index("participant_id")

    # Add baseline metrics
    if len(baseline_by_id) > 0:
        participants["baseline_date"] = baseline_by_id["assessment_date"]
        participants["baseline_employment"] = baseline_by_id["employment_status"]
        participants["baseline_wage"] = baseline_by_id["hourly_wage"]

    # Add latest metrics
    participants["latest_assessment_date"] = latest["assessment_date"]
    participants["latest_monthly_income"] = latest["total_monthly_income"]

    # Calculate days in program
    participants["days_in_program"] = (
        pd.to_datetime(participants["latest_assessment_date"]) -
        pd.to_datetime(participants["enrollment_date"])
    ).dt.days

    participants = participants.reset_index()

    # Count assessments per participant
    assessment_counts = assessments.groupby("participant_id").size()
    participants["assessment_count"] = participants["participant_id"].map(assessment_counts).fillna(0).astype(int)

    print(f"  Participants with assessments: {(participants['assessment_count'] > 0).sum()}")
    print(f"  Average assessments per participant: {participants['assessment_count'].mean():.1f}")

    return participants, assessments


def generate_summary_stats(
    participants: pd.DataFrame,
    assessments: pd.DataFrame,
) -> Dict:
    """
    Generate summary statistics for data quality report.
    """
    stats = {
        "total_participants": len(participants),
        "unique_families": participants["family_id"].nunique() if "family_id" in participants.columns else None,
        "total_assessments": len(assessments),
        "assessments_by_type": assessments["assessment_type"].value_counts().to_dict(),
        "status_breakdown": participants["enrollment_status"].value_counts().to_dict(),
        "county_breakdown": participants["county"].value_counts().to_dict(),
        "enrollment_group_breakdown": participants["enrollment_group"].value_counts().to_dict() if "enrollment_group" in participants.columns else None,
        "avg_days_in_program": participants["days_in_program"].mean() if "days_in_program" in participants.columns else None,
        "avg_assessments_per_participant": participants["assessment_count"].mean() if "assessment_count" in participants.columns else None,
    }

    return stats
