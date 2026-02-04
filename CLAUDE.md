# EUC Leadership Dashboard

**Repo:** https://github.com/Empower-UC/EUC_Data_Dashboards
**Deployed:** https://euc-leadership-dashboard.vercel.app/

Next.js dashboard for EUC leadership, board members, and funders — showing program metrics, outcomes, and ROI.

## Related Repos

| Repo | Purpose |
|------|---------|
| [euc-data-pipeline](https://github.com/lpoulsen17/euc-data-pipeline) | Data transforms (Python) |
| [euc-navigator](https://github.com/lpoulsen17/euc-navigator) | Navigator Dashboard (React) |
| [EUC_Data_Dashboards](https://github.com/Empower-UC/EUC_Data_Dashboards) | This repo - Leadership UI |

## Quick Start

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Production build
vercel --prod    # Deploy to Vercel
```

## Tech Stack

- **Next.js 16** + React 19
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Drizzle ORM** - Database (Supabase PostgreSQL)
- **Vercel** - Hosting

## Project Structure

```
app/
├── (dashboard)/      # Main dashboard pages
│   ├── page.tsx      # Overview/Executive Summary
│   ├── roi/          # ROI analysis
│   ├── outcomes/     # Participant outcomes
│   ├── navigators/   # Navigator performance
│   └── geography/    # County breakdown
├── landing/          # Public landing page
└── api/              # API routes (if needed)

lib/
├── data/             # Static JSON data files (current)
├── db/               # Drizzle schema & connection
└── utils.ts          # Helpers

components/           # React components (shadcn/ui based)
```

## Data Sources

**Current:** Static JSON files in `lib/data/`
- `overview.json`, `roi-calculations.json`, `outcomes.json`, etc.
- Manually updated or generated from pipeline

**Target:** Read from pipeline outputs or database
- Pipeline: `~/euc/outputs/leadership/*.csv`
- Or: Supabase database (schema in `lib/db/schema.ts`)

## Key Metrics Displayed

- **940 families** served across 14 counties
- **$6.4M** total wage gains
- **82 graduates** (225% FPL threshold)
- **+22% FPL improvement** average
- **~17 year** ROI payback estimate

## Design System

- **Colors:** Navy (#1E3A5F), Blue (#2563EB), Amber (#B45309)
- **Typography:** Inter for UI, JetBrains Mono for data
- **Cards:** White bg + gray border; gold border for highlighted KPIs
