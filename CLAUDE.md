# EUC Data Analysis Project

## Purpose
Data analysis for Empower Upper Cumberland—a $25M TANF-funded poverty alleviation pilot in rural Tennessee. Outputs support the new landing page, funder pitches, fundraising materials, and social media. Primary reviewers: Mark Farley and Megan Spurgeon.

## Quick Commands
- `uv run pytest` - Run data quality tests
- `uv run jupyter lab` - Launch notebooks
- `uv sync` - Install/update dependencies

---

## Critical Rules

### Data Security
- NEVER display raw PII (names, SSNs, addresses, DOB)
- Use `src/data/anonymize.py` before showing data samples
- Minimum cell size of 10 for aggregated statistics
- Data files in `data/` are NEVER committed to git

### Analysis Constraints
- IGNORE A/B group designation—treat all participants as one cohort (Year 1 RCT integrity was compromised; MEF/Urban handle formal evaluation)
- Published metrics (e.g., "75 families at 225% FPL") may not match available data—flag discrepancies, don't assume errors

### Visualization
- Use plotly (not matplotlib)
- Export as HTML + PNG
- Style for funder/policy audiences: clean, minimal, professional

---

## Key Context Files

Read these when you need domain understanding:

| File | When to Read |
|------|--------------|
| `docs/euc-context.md` | Before any analysis—explains program model, terminology, nuances |
| `docs/data-dictionary.md` | When loading or interpreting data fields |
| `docs/analysis-tasks.md` | When starting a new analysis task—contains current priorities |

---

## Data Locations

- `data/raw/` — Original files (read-only, never modify)
- `data/processed/` — Cleaned, de-identified working data
- `outputs/` — All results (figures, tables, reports)

---

## Project Structure
```
src/data/          Data loading, cleaning, anonymization
src/analysis/      Analysis modules
notebooks/         Exploratory analysis
outputs/figures/   Charts
outputs/tables/    Data tables
outputs/reports/   Final deliverables
docs/              Context and reference files
```
