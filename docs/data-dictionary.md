# Data Dictionary

## Available Data Sources (as of Jan 2026)

| File | Rows | Cols | Description |
|------|------|------|-------------|
| Baseline Assessment Report (86).xlsx | 880 | 85 | Initial assessment at enrollment - demographics, employment, housing, health |
| Intake Report (11).xlsx | 840 | 162 | Comprehensive financial baseline - income, benefits, expenses |
| Navigator Dashboard.xlsx | 200 | 52 | Current active cases with FPL tracking |
| Empower Participant Data (1).xlsx | 792 | 17 | FPL progression tracking over time |
| Copy of Participant Story (Responses).xlsx | 73 | 18 | Qualitative success narratives |
| 225% Families.pdf | ~72 | - | Graduated families report with income changes |

## Baseline Assessment Key Fields
- **Identifiers**: Name, DOB, SSN (last 4), Address, Phone, Email (PII - requires anonymization)
- **Demographics**: Gender, Race/Ethnicity, Marital Status, Household Size, County
- **Program Status**: Enrollment Date, Navigator, Status (Active/Dismissed/Graduated)
- **Employment**: Employment Status, Employer, Occupation, Hours/Week, Wage
- **Housing**: Housing Type, Monthly Cost, Stability indicators
- **Health**: Insurance Status, Disability, Mental Health indicators
- **Education**: Highest Level Completed, Currently Enrolled

## Intake Report Key Fields
- **Income Sources**: Employment wages, Self-employment, SSI, SSDI, Child Support, Alimony
- **Benefits**: SNAP, TANF, TennCare, Housing Assistance, WIC, LIHEAP
- **Expenses**: Rent/Mortgage, Utilities, Food, Transportation, Childcare, Medical
- **Monthly Budget**: Total Income, Total Expenses, Net Balance
- **FPL Calculation**: Household size, Total income, FPL percentage at intake

## Navigator Dashboard Key Fields
- **FPL Tracking**: FPL at Enrollment, Current FPL, FPL Change
- **Benefits Cliff Columns**: TennCare cliff, SNAP cliff, Housing cliff, Childcare cliff
- **Progress**: Stage of Prosperity (1-5), Last Contact Date
- **Navigator**: Assigned navigator name

## Empower Participant Data Key Fields
- **FPL Progression**: FPL at enrollment, Current FPL, Change percentage
- **Wage Change**: Starting wage, Current wage, Increase amount
- **Timeline**: Enrollment date, Last update date, Months in program

## 225% Families PDF Structure
- **Page 1**: ~72 graduated families with:
  - Enrollment/Exit dates
  - Income at enrollment vs exit
  - FPL at enrollment vs exit
  - Industry sector
  - Total dollars provided
  - IDA match amounts
- **Pages 2+**: Current participant tracking data
- **Total dollars provided to graduates**: $167,158.43

## Participant Stories Fields
- Timestamp
- Email Address
- Participant Name
- Release form signed (photos/video)
- Success description
- Financial situation & emotional/social impact
- Inspiration to take action
- How discovered opportunity
- Challenges and how overcome
- Personal development & skills acquired
- Partner organizations that helped
- Partner success details
- Life changes/improvements
- Community ripple effects
- Additional notes

## Known Data Gaps
- Exit data for non-graduated participants incomplete
- "Dismissed" status lacks clear exit reasons
- Child well-being UAT fields largely unfilled
- Published metrics may come from sources we don't have access to
- Many Navigator Dashboard columns appear empty

## PII Fields (Require Anonymization)
The following fields contain personally identifiable information:
- Full Name, SSN (even partial), Date of Birth
- Street Address, Phone Number, Email
- Employer Name (when combined with other fields)

Use `src/data/anonymize.py` before displaying any data samples.
