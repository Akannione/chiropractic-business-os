# CBOS Analytics Contract

Added: 2026-07-01

This contract makes dashboard metrics reviewable by clinic operators, analysts, and future automation. It documents the grain, inclusion rules, calculations, and ownership already implemented in `backend/src/services/kpiService.ts` and `backend/src/services/reactivationService.ts`.

## Data Products

| Data product | Grain | Consumer | Source |
|---|---|---|---|
| Inquiry KPI summary | One current practice snapshot | Owner dashboard and reports | Inquiry records |
| Reactivation queue | One eligible patient inquiry | Front desk follow-up workflow | Inquiry records with last visit and visit frequency |

## KPI Definitions

| Metric | Definition | Denominator / exclusions | Validation |
|---|---|---|---|
| Total Patient Inquiries | Count of all inquiry records | No exclusions | Non-negative integer |
| New This Week | Inquiries created since Monday of the current week | All inquiry records | Cannot exceed total inquiries |
| Active Patients | Inquiries whose status is `Active Patient` | All inquiry records | Cannot exceed total inquiries |
| Follow-Ups Needed | Non-lost inquiries marked `Follow-Up Needed` or with a next follow-up date on or before today | Excludes `Lost` | Percentage uses all inquiries as denominator |
| Overdue Follow-Ups | Non-lost inquiries with a next follow-up date before today | Excludes `Lost`; today is not overdue | Cannot exceed follow-ups needed |
| Estimated Treatment Value | Sum of `estimated_value` for inquiries not marked `Lost` | Excludes `Lost`; missing values contribute zero | Non-negative currency value |
| Inquiry-to-Patient Rate | Active patients divided by total inquiries, multiplied by 100 | Returns zero with no inquiries | Range: 0–100% |
| Top Inquiry Source | Source with the largest inquiry count | Ties sort alphabetically; `None` for empty data | Observed source or `None` |

## Reactivation Definitions

An inquiry is eligible when it is not `Lost`, is not a `Dead Lead`, has a valid last-visit date, and has a positive whole-number expected visit frequency.

- `next_reactivation_date = last_visit_date + expected_visit_frequency_days`
- `Overdue`: next reactivation date is before today.
- `Due Today`: next reactivation date equals today.
- `Upcoming`: next reactivation date is after today.
- `days_overdue`: whole calendar days between today and the missed reactivation date; otherwise zero.

The queue sorts overdue records first, with the most overdue first, then due-today records, then upcoming records by next reactivation date.

## Quality And Ownership

- Backend owners: `backend/src/services/kpiService.ts` and `backend/src/services/reactivationService.ts`.
- Human-readable definitions: this file and `KPI_HELP` in `backend/src/config/constants.ts`.
- Automated checks: `backend/src/tests/service.test.ts` validates KPI calculations, queue classification, sorting, CSV validation, and API contracts.
- Change rule: formula or inclusion-rule changes must update code, tests, `KPI_HELP`, and this contract together.
- Privacy rule: portfolio demonstrations and validation sessions use fake or sanitized data only.

## Why This Matters

The contract turns dashboard numbers into governed definitions instead of undocumented calculations. It provides portfolio evidence for KPI definition, semantic modeling, data quality, documentation, and stakeholder-facing analytics without changing production behavior.
