"""
Central configuration for EUC data ETL pipeline.
"""
from pathlib import Path

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_RAW = PROJECT_ROOT / "data" / "raw"
DATA_PROCESSED = PROJECT_ROOT / "data" / "processed"
DASHBOARD_DATA = PROJECT_ROOT / "dashboard" / "lib" / "data"
OUTPUTS = PROJECT_ROOT / "outputs"

# Source files (current versions)
SOURCE_FILES = {
    "intake": DATA_RAW / "Intake Report (10).xlsx",
    "baseline": DATA_RAW / "Baseline Assessment Report (10).xlsx",
    "quarterly": DATA_RAW / "Quarterly Assessment Report 2026-01-08 12_49.xlsx",
    "change_of_life": DATA_RAW / "Change Of Life Assessment Report 2026-01-08 12_54.xlsx",
    "stories": DATA_RAW / "Copy of Participant Story (Responses).xlsx",
    "navigator_dashboard": DATA_RAW / "Navigator Dashboard.xlsx",
    "empower_data": DATA_RAW / "Empower Participant Data (1).xlsx",
    "graduates_225": DATA_RAW / "225_Families.xlsx",  # Source of truth for graduates
}

# FPL thresholds (2024 HHS guidelines)
FPL_THRESHOLDS = {
    "deep_poverty": 50,      # <50% FPL
    "poverty": 100,          # <100% FPL
    "snap_cliff": 130,       # SNAP eligibility cliff
    "near_poverty": 150,     # Working poor
    "graduation": 225,       # EUC graduation threshold
}

# Program constants
PROGRAM_CONSTANTS = {
    "total_investment": 25_000_000,
    "start_date": "2022-07-01",
    "navigator_count": 17,
    "counties": 14,
}

# Status mappings
# Note: "Graduated" is derived from FPL >= 225%, not from status field
STATUS_CATEGORIES = {
    "active": ["Accepted"],
    "completed": ["Exited"],  # Left after completing
    "dismissed": ["Dismissed"],  # Left after ~1 year without graduating
    "withdrawn": ["Withdrawn"],  # Left voluntarily
    "other": ["Transferred", "Re-Enrolled"],
}

# Column mappings: standardized names for each source
# These map source columns to our standard schema

INTAKE_FAMILY_COLUMNS = {
    "Participant ID": "participant_id",
    "Family Unique ID": "family_id",
    "Enrollment Group": "enrollment_group",  # A or B (ignored for analysis)
    "Enrollment Status": "enrollment_status",
    "Submission Date": "submission_date",
    "County": "county",
    "Living Situation": "living_situation",
    "Household Structure": "household_structure",
    "How many adults live in your household?": "adults_in_household",
    "How many children live in your household?": "children_in_household",
    "Monthly Income from Employment": "monthly_income_employment",
    "Total Monthly Income": "total_monthly_income",
    "Total Monthly Benefit Income": "total_monthly_benefits",
    "Total Monthly Expenses": "total_monthly_expenses",
}

BASELINE_COLUMNS = {
    "Participant ID": "participant_id",
    "Enrollment Status": "enrollment_status",
    "Enrollment Group": "enrollment_group",
    "County": "county",
    "Gender": "gender",
    "Race": "race",
    "Ethnicity": "ethnicity",
    "Marital Status": "marital_status",
    "Living Situation": "living_situation",
    "Household Structure": "household_structure",
    "How many adults live in your household?": "adults_in_household",
    "How many children live in your household?": "children_in_household",
    "Highest Grade Completed": "education_level",
    "Current Employment Status": "employment_status",
    "Hourly Wage (Current or Most Recent Job)": "hourly_wage",
    "Hours Per Week (Current or Most Recent Job)": "hours_per_week",
}

QUARTERLY_FAMILY_COLUMNS = {
    "Participant ID": "participant_id",
    "Family Unique ID": "family_id",
    "Submission Date": "assessment_date",
    "Enrollment Status": "enrollment_status",
    "County": "county",
    "Monthly Income from Employment": "monthly_income_employment",
    "Total Monthly Income": "total_monthly_income",
    "Total Monthly Benefit Income": "total_monthly_benefits",
    "Total Monthly Expenses": "total_monthly_expenses",
}

# Navigator Dashboard "Monthly Client Review" columns
NAVIGATOR_TRACKING_COLUMNS = {
    "UAT ID Number": "participant_id",
    "Navigator": "navigator",
    "Enrollment Date": "enrollment_date",
    "County": "county",
    "Days in Program": "days_in_program",
    "Months in Program": "months_in_program",
    "Household Size at Enrollment": "household_size_enrollment",
    "Household Size Currently (F)": "household_size_current",
    "Annual Income at Enrollment": "annual_income_enrollment",
    "Current Annual Income (H)": "annual_income_current",
    "FPL at Enrollment": "fpl_enrollment",
    "Current FPL": "fpl_current",
    "FPL Change": "fpl_change",
    "Wage Increases Since Enrollment": "wage_change",
    # Benefit cliff flags (% thresholds)
    "TN CARE (100%)": "cliff_tenncare_100",
    "SNAP (129%)": "cliff_snap_130",
    "LIHEAP, TANF, Smart Steps (159%)": "cliff_liheap_150",
    "Free & Reduced, Commodities (184%)": "cliff_school_meals_185",
}

# Minimum cell size for aggregations (privacy protection)
MIN_CELL_SIZE = 10
