# EUC Data Analysis Project

## Purpose
Data analysis for Empower Upper Cumberland—a $25M TANF-funded poverty alleviation pilot in rural Tennessee. Outputs support the leadership dashboard, funder pitches, and fundraising materials.

## Quick Commands
```bash
# Run the full ETL pipeline (generates dashboard JSON)
uv run python -m pipeline.etl.pipeline

# Run dashboard locally
cd dashboard && npm run dev

# Deploy to production
vercel --prod
```

---

## Critical Rules

### Data Security
- NEVER commit raw data files (Excel, CSV with PII)
- Data files in `data/` are gitignored
- Only aggregated JSON in `dashboard/lib/data/` is committed

### Analysis Constraints
- IGNORE A/B group designation—treat all as one cohort
- Navigator Dashboard "Active Cases" sheet is source of truth for active count

---

## Project Structure
```
dashboard/           Next.js web app
  └── lib/data/     Generated JSON files

pipeline/           Python ETL & analytics
  ├── etl/         Load Excel, build journeys
  └── analytics/   ROI, cliff, metrics, JSON generation

data/               Not in git
  ├── raw/         Excel exports from UAT
  └── processed/   Generated CSVs

docs/               Context and data dictionary
```

## Key Context Files

| File | Purpose |
|------|---------|
| `docs/euc-context.md` | Program model, terminology |
| `docs/data-dictionary.md` | Field definitions |
