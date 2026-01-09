# Data Cleaning Log

Generated: 2026-01-06

## Cleaning Rules Applied

| Rule | Action | Rationale |
|------|--------|-----------|
| FPL decimals (max < 10) | Multiply by 100 | Values stored as decimals, not percentages |
| FPL outliers (>1000%) | Set to NaN | Data entry errors |
| Income >$20K/month | Set to NaN | Obvious entry errors |
| Negative months in program | Set to NaN | Invalid values |
| Navigator name typos | Standardize to "Joshua Yoder" | Consolidate Josh/Joshua/Joahua variants |
| Duplicate stories | Keep most recent by timestamp | Treat as updates |
| Wage decreases | Keep as-is | Real data (job losses occur) |
| Empty columns (>95% null) | Drop | No analytical value |
| Duplicate UAT IDs | Flag, don't exclude | Add `duplicate_id_flag` column |

---

## File: Empower Participant Data (1).xlsx

**Output:** `data/processed/empower_participant_clean.csv`

| Change | Count | Details |
|--------|-------|---------|
| FPL scaling | 3 columns | Multiplied 'FPL at Enrollment', 'FPL Change', and 'Current FPL' by 100 |
| FPL outliers removed | 1 value | Set 1 value >1000% to NaN in 'Current FPL' (was 24168%) |
| Negative months removed | 5 values | Set 5 negative values to NaN in 'Months in Program' |
| Navigator names standardized | 29 rows | Changed Josh/Joahua → Joshua Yoder |
| Duplicate ID flag added | 8 rows | Added `duplicate_id_flag=True` for 4 duplicate UAT IDs |

**Final:** 792 rows, 18 columns (added 1 flag column)

---

## File: Navigator Dashboard.xlsx

**Output:** `data/processed/navigator_dashboard_clean.csv`

| Change | Count | Details |
|--------|-------|---------|
| Unnamed columns dropped | 19 columns | Removed empty unnamed columns |
| FPL scaling | 2 columns | Multiplied 'FPL at Enrollment' and 'FPL Change' by 100 |
| Navigator names standardized | 6 rows | Changed Josh/Joahua → Joshua Yoder |
| Empty columns dropped | 3 columns | >95% missing values |

**Final:** 200 rows, 30 columns (was 52)

---

## File: Intake Report (11).xlsx

**Output:** `data/processed/intake_report_clean.csv`

| Change | Count | Details |
|--------|-------|---------|
| Income outliers removed | 3 values | Set 3 values >$20K/month to NaN in 'Monthly Income from Employment' |
| Income outliers removed | 3 values | Set 3 values >$20K/month to NaN in 'Total Monthly Income' |
| Empty columns dropped | 2 columns | >95% missing values |

**Final:** 840 rows, 160 columns (was 162)

---

## File: Baseline Assessment Report (86).xlsx

**Output:** `data/processed/baseline_assessment_clean.csv`

| Change | Count | Details |
|--------|-------|---------|
| Empty columns dropped | 2 columns | >95% missing values |

**Final:** 880 rows, 83 columns (was 85)

---

## File: Copy of Participant Story (Responses).xlsx

**Output:** `data/processed/participant_stories_clean.csv`

| Change | Count | Details |
|--------|-------|---------|
| Duplicate stories removed | 54 rows | Kept most recent submission per email address |

**Final:** 19 rows (was 73)

---

## Flags (Not Errors)

| Item | Count | Note |
|------|-------|------|
| Duplicate UAT IDs | 4 IDs (8 rows) | Flagged with `duplicate_id_flag=True` in Empower data |
| Dismissed status | 469 (53.3%) | Expected program pattern, not data error |

---

## Reconciliation Needed

### Graduation Count Discrepancy

| Source | Count at 225%+ FPL | Notes |
|--------|-------------------|-------|
| Master file (baseline-linked) | 60 | Joined on Participant ID, excludes duplicate UAT IDs |
| Empower Participant Data (standalone) | 63 | Includes 8 duplicate ID rows |
| 225% Families PDF | ~72 | Page 1 graduated families list |
| Published claim | 75+ | Marketing materials |

**Likely explanation:** Different data snapshots. The PDF may include recent graduates not yet reflected in the UAT database export.

**Action:** Reconcile with Megan Spurgeon to confirm:
1. Are all sources pulling from the same date range?
2. Does the PDF include graduates from after the Excel exports?
3. Is there a "graduation date" field we can use to align counts?

**Status:** Not a data error—documentation/timing issue.

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| Files cleaned | 5/5 |
| Total rows in cleaned files | 2,731 |
| Rows excluded (stories deduped) | 54 |
| Values set to NaN | 12 |
| Columns dropped | 26 |
| Navigator names standardized | 35 |

