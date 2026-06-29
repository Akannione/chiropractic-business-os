# Clinic Reactivation Prototype Design

## Goal

Extend CBOS with a focused patient-reactivation workflow based on the June 23 clinic discovery conversation. CBOS will complement ChiroMatrix and MetaSoft by making missed inquiries and inactive patients visible; it will not replace scheduling, billing, insurance, clinical records, or the practice-management system.

## User Workflow

1. Staff continue receiving website inquiries and managing appointments in their existing systems.
2. CBOS stores lightweight operational fields: appointment outcome, patient type, requested appointment details, offer type, last visit, expected visit frequency, assigned follow-up owner, and follow-up outcome.
3. A dedicated **Reactivations** view calculates each patient’s next expected visit from `last_visit_date + expected_visit_frequency_days`.
4. Staff can see overdue, due-today, and upcoming reactivations, then record call outcomes without changing MetaSoft.
5. The **Exports & Imports** view previews MetaSoft-style CSV rows before import, flags errors and duplicate contacts, and imports only approved valid rows.

## Data Model

The existing inquiry fields remain unchanged. These optional fields are added:

- `appointment_status`: `Not Scheduled`, `Appointment Scheduled`, `Cancelled`, or `No Show`
- `patient_type`: `New Patient`, `Existing Patient`, `Reactivation`, or `Dead Lead`
- `appointment_request`: free text for requested date/time
- `offer_type`: `None`, `Groupon`, or `Other`
- `last_visit_date`: date-only value
- `expected_visit_frequency_days`: positive whole number
- `assigned_follow_up_owner`: staff name or role
- `follow_up_outcome`: `Not Contacted`, `Left Voicemail`, `Spoke - Scheduled`, `Spoke - Not Scheduled`, or `No Response`

All fields are optional so existing records and APIs remain compatible.

## Reactivation Rules

- Include records that are not `Lost`, are not `Dead Lead`, and have both a last visit date and expected frequency.
- `next_reactivation_date = last_visit_date + expected_visit_frequency_days`.
- `Overdue`: next reactivation date is before today.
- `Due Today`: next reactivation date equals today.
- `Upcoming`: next reactivation date is after today.
- Sort overdue patients by most overdue first, then due today, then upcoming by nearest date.

## UI

- Add a **Reactivations** navigation item.
- Show compact count cards for overdue, due today, and upcoming patients.
- Provide filters for urgency, owner, and search.
- Show a stable table with patient, last visit, expected frequency, next due date, days overdue, owner, and follow-up outcome.
- Allow staff to update the selected patient’s owner, follow-up outcome, last visit, frequency, notes, and next follow-up date.
- Add the clinic fields to inquiry create/edit forms without changing the existing primary status KPI definitions.

## CSV Demo

Add `docs/METASOFT_REACTIVATION_DEMO.csv` with fake records and MetaSoft-like friendly headers. Import mapping accepts those headers, exposes mapped fields in preview, and continues to skip duplicate email or phone matches.

## Error Handling And Safety

- Invalid dates become empty optional values instead of crashing.
- Frequencies must be positive integers when supplied.
- Unknown enum values fall back to safe defaults during CSV mapping and are rejected by staff forms when invalid.
- Imports remain preview-first.
- No billing balances, diagnosis data, insurance identifiers, or clinical notes are added.

## Validation

- Unit tests cover reactivation state, sort order, missing fields, and MetaSoft CSV mapping.
- Existing KPI, report, and CSV tests continue to pass.
- TypeScript checks and production builds must pass.
- Browser verification covers desktop and mobile React layouts.

