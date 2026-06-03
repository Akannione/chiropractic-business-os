# Manual Deployment Steps

Use this as the operator checklist when a new chiropractic client signs.

## 1. Client Intake

- Confirm client name and practice name.
- Confirm package purchased.
- Confirm deployment target.
- Confirm whether data is fake onboarding data or approved production data.
- Confirm no real patient data will be used until privacy and compliance expectations are settled.

## 2. Environment Setup

- Clone or open the repository.
- Install requirements.
- Set a client-specific `BUSINESS_OS_DB_PATH`.
- Keep `BUSINESS_OS_DEMO_MODE` unset for production setup.

## 3. New Database

- Initialize the SQLite database.
- Confirm `leads` table exists.
- Confirm schema has not changed.
- Confirm database row count is zero.

## 4. Data Import

- Prepare client CSV with required fields.
- Validate status and source values.
- Import rows through the existing insert workflow.
- Confirm row count.
- Spot-check imported records.

## 5. Dashboard Verification

- Start Streamlit with the client database.
- Confirm total inquiries.
- Confirm follow-ups needed.
- Confirm overdue follow-ups.
- Confirm active patients.
- Confirm estimated treatment value.
- Confirm top inquiry source.

## 6. Weekly Summary Verification

- Open Weekly Summary.
- Confirm metrics match the imported data.
- Confirm follow-up focus is useful.
- Confirm Practice Performance Snapshot renders.

## 7. Export Verification

- Download patient inquiry CSV.
- Download follow-up CSV.
- Confirm readable headers.
- Confirm row counts.
- Confirm no demo-only rows are present.

## 8. Client Handoff

- Walk through Dashboard.
- Walk through Patient Inquiries.
- Walk through Weekly Summary.
- Walk through Export.
- Explain EHR, scheduling, payment, and privacy boundaries.
- Confirm owner of daily follow-up workflow.
- Confirm next support check-in.
