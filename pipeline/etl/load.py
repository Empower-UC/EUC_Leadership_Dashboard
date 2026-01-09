"""
Data loaders for EUC raw Excel files.
Each loader reads a specific file and returns standardized DataFrames.
"""
import pandas as pd
from pathlib import Path
from typing import Dict, Tuple
from .config import SOURCE_FILES


def load_intake() -> Dict[str, pd.DataFrame]:
    """
    Load Intake Report Excel file.
    Returns dict with 'family', 'adult', 'minor' DataFrames.
    """
    path = SOURCE_FILES["intake"]
    print(f"Loading Intake from {path.name}...")

    sheets = {}
    xl = pd.ExcelFile(path)

    for sheet_name in xl.sheet_names:
        df = pd.read_excel(xl, sheet_name=sheet_name)
        # Normalize sheet names
        key = sheet_name.lower().replace(" ", "_").replace("children", "")
        if "minor" in key:
            key = "minor"
        sheets[key] = df
        print(f"  - {sheet_name}: {len(df)} rows, {len(df.columns)} columns")

    return sheets


def load_baseline() -> pd.DataFrame:
    """
    Load Baseline Assessment Report Excel file.
    Returns single DataFrame (one sheet).
    """
    path = SOURCE_FILES["baseline"]
    print(f"Loading Baseline from {path.name}...")

    df = pd.read_excel(path)
    print(f"  - {len(df)} rows, {len(df.columns)} columns")

    return df


def load_quarterly() -> Dict[str, pd.DataFrame]:
    """
    Load Quarterly Assessment Report Excel file.
    Returns dict with 'family', 'adult', 'minor' DataFrames.
    """
    path = SOURCE_FILES["quarterly"]
    print(f"Loading Quarterly from {path.name}...")

    sheets = {}
    xl = pd.ExcelFile(path)

    for sheet_name in xl.sheet_names:
        df = pd.read_excel(xl, sheet_name=sheet_name)
        key = sheet_name.lower().replace(" ", "_")
        if "minor" in key:
            key = "minor"
        sheets[key] = df
        print(f"  - {sheet_name}: {len(df)} rows, {len(df.columns)} columns")

    return sheets


def load_change_of_life() -> Dict[str, pd.DataFrame]:
    """
    Load Change of Life Assessment Report Excel file.
    Returns dict with 'family', 'adult', 'minor' DataFrames.
    """
    path = SOURCE_FILES["change_of_life"]
    print(f"Loading Change of Life from {path.name}...")

    sheets = {}
    xl = pd.ExcelFile(path)

    for sheet_name in xl.sheet_names:
        df = pd.read_excel(xl, sheet_name=sheet_name)
        key = sheet_name.lower().replace(" ", "_")
        if "minor" in key:
            key = "minor"
        sheets[key] = df
        print(f"  - {sheet_name}: {len(df)} rows, {len(df.columns)} columns")

    return sheets


def load_stories() -> pd.DataFrame:
    """
    Load Participant Stories Excel file.
    """
    path = SOURCE_FILES["stories"]
    print(f"Loading Stories from {path.name}...")

    df = pd.read_excel(path)
    print(f"  - {len(df)} rows, {len(df.columns)} columns")

    return df


def load_navigator_dashboard() -> pd.DataFrame:
    """
    Load Navigator Dashboard "Monthly Client Review" sheet.
    Contains navigator assignments, FPL tracking, and benefit cliff flags.
    """
    path = SOURCE_FILES["navigator_dashboard"]
    print(f"Loading Navigator Dashboard from {path.name}...")

    # Specifically load the Monthly Client Review sheet
    df = pd.read_excel(path, sheet_name="Monthly Client Review")

    # Remove header rows (first few rows are often formatting)
    # Find the row that contains "UAT ID Number" to identify actual data start
    header_row = None
    for i, row in df.iterrows():
        if "UAT ID Number" in str(row.values):
            header_row = i
            break

    if header_row is not None and header_row > 0:
        # Re-read with correct header
        df = pd.read_excel(path, sheet_name="Monthly Client Review", header=header_row)

    # Remove any completely empty rows
    df = df.dropna(how='all')

    # Remove rows where UAT ID is missing (these are often formatting/summary rows)
    id_col = [c for c in df.columns if 'UAT ID' in str(c)]
    if id_col:
        df = df.dropna(subset=id_col)

    print(f"  - Monthly Client Review: {len(df)} rows, {len(df.columns)} columns")

    return df


def load_empower_data() -> pd.DataFrame:
    """
    Load Empower Participant Data Excel file.
    Contains FPL progression tracking.
    """
    path = SOURCE_FILES["empower_data"]
    print(f"Loading Empower Data from {path.name}...")

    df = pd.read_excel(path)
    print(f"  - {len(df)} rows, {len(df.columns)} columns")

    return df


def load_graduates_225() -> pd.DataFrame:
    """
    Load 225% Families file - SOURCE OF TRUTH for graduates.
    This is the authoritative list of families who have reached 225% FPL.
    """
    path = SOURCE_FILES["graduates_225"]
    print(f"Loading 225% Graduates from {path.name}...")

    df = pd.read_excel(path)
    print(f"  - {len(df)} rows (graduates)")

    return df


def load_all() -> Dict[str, any]:
    """
    Load all data sources.
    Returns dict with all loaded DataFrames.
    """
    print("=" * 60)
    print("LOADING ALL DATA SOURCES")
    print("=" * 60)

    data = {
        "intake": load_intake(),
        "baseline": load_baseline(),
        "quarterly": load_quarterly(),
        "change_of_life": load_change_of_life(),
        "stories": load_stories(),
        "navigator_dashboard": load_navigator_dashboard(),
        "empower_data": load_empower_data(),
    }

    print("=" * 60)
    print("ALL DATA LOADED")
    print("=" * 60)

    return data
