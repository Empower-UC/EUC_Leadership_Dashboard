# Data Issues Log

Generated: 2026-01-06
Status: Pending Review

---

## Issue Severity Definitions

| Severity | Definition |
|----------|------------|
| **CRITICAL** | Blocks analysis or causes incorrect results; must resolve before use |
| **WARNING** | May affect analysis accuracy; should resolve or document assumptions |
| **INVESTIGATE** | Anomaly that needs human review to determine if it's an error or valid data |

---

## Issues by File

### 1. Baseline Assessment Report (86).xlsx

| ID | Field | Issue | Count | Example Values | Severity | Resolution |
|----|-------|-------|-------|----------------|----------|------------|
| BA-01 | Enrollment Status | High dismissed rate | 469/880 (53.3%) | "Dismissed" | INVESTIGATE | |
| BA-02 | Suffix | Almost entirely empty | 878/880 (99.8%) missing | - | WARNING | |
| BA-03 | Disability | Mostly empty | 841/880 (95.5%) missing | - | WARNING | |
| BA-04 | Multiple columns | High missing rates | 8+ columns >90% empty | - | WARNING | |

---

### 2. Intake Report (11).xlsx

| ID | Field | Issue | Count | Example Values | Severity | Resolution |
|----|-------|-------|-------|----------------|----------|------------|
| IR-01 | Monthly Income | Extreme high values | 4 records | >$10,000/month | INVESTIGATE | |
| IR-02 | Monthly Income | Maximum value outlier | 1 record | $58,000/month | CRITICAL | |
| IR-03 | Multiple columns | High missing rates | 8 columns >90% empty | - | WARNING | |

---

### 3. Navigator Dashboard.xlsx

| ID | Field | Issue | Count | Example Values | Severity | Resolution |
|----|-------|-------|-------|----------------|----------|------------|
| ND-01 | Unnamed columns | Completely empty columns | 19 columns | Unnamed: 0, Unnamed: 1, etc. | WARNING | |
| ND-02 | THO ID | Duplicate identifiers | 18 duplicates | - | CRITICAL | |
| ND-03 | UAT ID | Duplicate identifiers | 15 duplicates | - | CRITICAL | |
| ND-04 | Navigator | Name spelling inconsistencies | 3+ variants | "Josh Yoder", "Joshua Yoder", "Joahua Yoder" | WARNING | |
| ND-05 | FPL columns | Incorrect scaling (decimals not percentages) | All FPL fields | Range: 0-2.2 instead of 0-220% | CRITICAL | |
| ND-06 | Multiple columns | Empty data columns | 19 columns | Benefits cliff columns appear empty | INVESTIGATE | |

---

### 4. Empower Participant Data (1).xlsx

| ID | Field | Issue | Count | Example Values | Severity | Resolution |
|----|-------|-------|-------|----------------|----------|------------|
| EP-01 | UAT ID | **DIFFERENT PEOPLE sharing same ID** | 4 IDs (8 rows) | See details below | **CRITICAL** | |
| EP-02 | Current FPL | Extreme outlier values | 1+ records | Max: 24168% | CRITICAL | |
| EP-03 | Wage Increase | Negative values | 135 records | Negative dollar amounts | INVESTIGATE | |
| EP-04 | Months in Program | Negative values | Unknown count | Negative months | CRITICAL | |
| EP-05 | FPL Change | Potential scaling inconsistency | Unknown | Mix of decimal and percentage formats | INVESTIGATE | |

#### EP-01 Detail: Duplicate UAT IDs Are Different People

| UAT ID | County 1 | County 2 | Navigator 1 | Navigator 2 | Conclusion |
|--------|----------|----------|-------------|-------------|------------|
| 10808 | Cannon | Putnam | Cortlind McCutcheon | Kelli Norris | **DIFFERENT PEOPLE** |
| 12761 | - | - | Audri Bowman | Cammie West | **DIFFERENT PEOPLE** |
| 20443 | - | - | Josh Yoder | Joshua Yoder | Possibly same person, different time points |
| 16411 | - | - | - | - | Needs investigation |

**Impact**: Joining any dataset on UAT ID will produce incorrect results. Cannot reliably link records across files until resolved.

---

### 5. Copy of Participant Story (Responses).xlsx

| ID | Field | Issue | Count | Example Values | Severity | Resolution |
|----|-------|-------|-------|----------------|----------|------------|
| PS-01 | Participant Name | Duplicate names | 6 duplicates | - | INVESTIGATE | |
| PS-02 | Email Address | Duplicate emails | 54 duplicates | - | INVESTIGATE | |
| PS-03 | Release Form | Missing consent | 3 records | 70/73 signed | WARNING | |

---

### 6. 225% Families.pdf

| ID | Field | Issue | Count | Example Values | Severity | Resolution |
|----|-------|-------|-------|----------------|----------|------------|
| FF-01 | Navigator | Name spelling inconsistencies | Multiple | Matches ND-04 issues | WARNING | |
| FF-02 | Various | Formula errors in source | Multiple | "#REF!", "#VALUE!" | CRITICAL | |
| FF-03 | Dates | Inconsistent date formats | Unknown | Mix of formats | WARNING | |
| FF-04 | FPL values | Scaling inconsistency | Unknown | Some decimals, some percentages | INVESTIGATE | |
| FF-05 | Pages 6-22 | Empty template rows | ~16 pages | All values 0.00 | WARNING | |
| FF-06 | Participant entries | Duplicate entries across pages | Unknown | Same participants on multiple pages | INVESTIGATE | |

---

## Cross-File Issues

| ID | Files Affected | Issue | Severity | Resolution |
|----|----------------|-------|----------|------------|
| XF-01 | Navigator Dashboard, 225% Families PDF, Baseline Assessment | Navigator name inconsistencies across datasets | WARNING | |
| XF-02 | Navigator Dashboard, Empower Participant Data | FPL scaling inconsistencies (decimal vs percentage) | CRITICAL | |
| XF-03 | All files with IDs | No single consistent unique identifier across all datasets | WARNING | |
| XF-04 | Empower Participant Data | **UAT ID assigned to multiple different people** | **CRITICAL - BLOCKER** | |
| XF-05 | Navigator Dashboard | 16 rows missing UAT ID entirely (8% of records) | WARNING | |
| XF-06 | Navigator Dashboard | THO ID has 3 duplicate IDs (6 rows affected) | WARNING | |

### XF-04 Blocking Issue Detail

**Problem**: The UAT ID field in Empower Participant Data contains at least 2 confirmed cases where the same ID was assigned to completely different participants (different counties, different navigators, different enrollment dates).

**Impact**:
- Cannot join Empower Participant Data to other files using UAT ID
- Cannot deduplicate records reliably
- Any analysis using UAT ID as primary key will produce incorrect results

**Required Resolution**:
1. Manual review by program staff to identify correct UAT IDs
2. Cross-reference with Baseline Assessment using name/DOB (requires PII access)
3. Until resolved, analyze Empower Participant Data in isolation only

---

## Summary Statistics

| Severity | Count |
|----------|-------|
| CRITICAL - BLOCKER | 1 |
| CRITICAL | 9 |
| WARNING | 15 |
| INVESTIGATE | 8 |
| **Total** | **33** |

---

## Priority Resolution Order

### P0 - BLOCKER (Must resolve before cross-file analysis)

1. **XF-04 / EP-01** — UAT IDs assigned to different people. **Cannot join files until resolved.** Requires manual review by program staff.

### P1 - Critical (Must resolve before affected analysis)

2. **ND-05, EP-02, XF-02** — FPL scaling issues (blocks all FPL-based analysis)
3. **ND-02, ND-03** — THO ID duplicates in Navigator Dashboard
4. **IR-02** — $58K/month income outlier (affects income statistics)
5. **EP-04** — Negative months in program (affects timeline analysis)
6. **FF-02** — Formula errors in PDF source (affects graduated families count)

### P2 - Warning (Document assumptions or clean)

7. **XF-01** — Navigator name inconsistencies
8. **BA-01** — 53% dismissed rate (requires program context to interpret)
9. **XF-05** — Missing UAT IDs in Navigator Dashboard

---

## Notes

- Do NOT modify raw data files in `data/raw/`
- All cleaning operations should create new files in `data/processed/`
- Document all transformations in code with clear comments
- Consult with Mark Farley / Megan Spurgeon on INVESTIGATE items before resolving

---

## Resolution Log

| Date | Issue ID | Resolution Applied | Resolved By |
|------|----------|-------------------|-------------|
| | | | |

