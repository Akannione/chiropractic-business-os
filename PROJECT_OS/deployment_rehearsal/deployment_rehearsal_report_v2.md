# Deployment Rehearsal Report V2

Goal: reduce the time and friction from `client signs` to `deploy` to `train` to `done`.

This second rehearsal used the existing deployment SOPs and a temporary SQLite database. No app code, database schema, pricing, or product functionality changed.

## Scenario

A new chiropractic client signs and needs a clean deployment with approved fake production-style data:

1. Client signs.
2. Operator prepares environment.
3. New client database is created.
4. Demo data is avoided.
5. Approved starter data is imported.
6. Dashboard is verified.
7. Weekly Summary is verified.
8. Exports are verified.
9. Client training is completed.
10. Handoff is completed.

## Rehearsal Result

Status: Passed

The rehearsal completed with a temporary client database and six fake production-style patient inquiries. A training update was simulated by moving one inquiry from `New Inquiry` to `Consultation Scheduled`.

## Every Manual Step

### 1. Client Signs

- Confirm practice name, buyer, primary contact, and package.
- Confirm this is a paid setup, demo-only setup, or pilot.
- Confirm the deployment target: local, Streamlit Community Cloud, Render, or another host.
- Confirm whether the data is fake onboarding data or approved client data.
- Confirm real patient information will not be used until privacy, hosting, access, retention, and compliance expectations are resolved.

### 2. Scope And Boundary Review

- Explain that the system is not an EHR.
- Explain that the system is not billing software.
- Explain that the system is not insurance software.
- Explain that the system is not appointment scheduling software.
- Confirm the intended workflow: patient inquiry tracking, follow-up tracking, weekly review, and CSV exports.

### 3. Environment Preparation

- Confirm latest `main` branch is pushed.
- Confirm dependencies are listed in `requirements.txt`.
- Confirm deployment instructions exist in `README.md`.
- Confirm `.env.example` documents `BUSINESS_OS_DB_PATH`.
- Confirm whether `BUSINESS_OS_DEMO_MODE` should be unset for client setup.
- Confirm whether a persistent disk is needed for the target host.

### 4. New Database Creation

- Choose a client-specific database path.
- Set `BUSINESS_OS_DB_PATH` to that path.
- Initialize the SQLite database.
- Confirm the `leads` table exists.
- Confirm the schema is unchanged.
- Confirm the new database has zero rows before import.

### 5. Demo Data Removal Or Avoidance

- Keep `BUSINESS_OS_DEMO_MODE` unset for production-style setup.
- Do not press `Reset demo data`.
- Confirm the new database starts empty.
- If demo data appears, stop and recreate the client database before proceeding.

### 6. Data Import

- Prepare an approved CSV or row list using the existing schema fields.
- Confirm patient names, emails, and phone numbers are fake unless production compliance is ready.
- Validate statuses:
  - `New Inquiry`
  - `Consultation Scheduled`
  - `Active Patient`
  - `Lost`
  - `Follow-Up Needed`
- Validate sources:
  - `Google`
  - `Referral`
  - `Insurance`
  - `Website`
  - `Phone Call`
- Import rows through the existing insert workflow.
- Confirm row count after import.
- Spot-check at least three imported records.

### 7. Dashboard Verification

- Start the app with the client database path.
- Open the Dashboard.
- Confirm Total Patient Inquiries matches imported rows.
- Confirm New This Week is accurate.
- Confirm Active Patients count is accurate.
- Confirm Follow-Ups Needed includes due-today and overdue follow-ups.
- Confirm Overdue Follow-Ups excludes `Lost`.
- Confirm Estimated Treatment Value excludes `Lost`.
- Confirm Top Inquiry Source is populated.

### 8. Training Simulation

- Add or update one inquiry during training.
- Change status to `Consultation Scheduled` or `Active Patient`.
- Update next follow-up date.
- Return to the Dashboard and explain that the owner view should be reviewed weekly.
- Explain who owns daily follow-up updates.

### 9. Weekly Summary Verification

- Open Weekly Summary.
- Confirm total inquiries match Dashboard.
- Confirm follow-up pressure is shown.
- Confirm overdue follow-ups are visible.
- Confirm Practice Performance Snapshot renders.
- Explain how the owner should use this weekly.

### 10. Export Verification

- Open Export.
- Download patient inquiry CSV.
- Download follow-up CSV.
- Confirm headers are practice-facing.
- Confirm row counts are reasonable.
- Confirm exports can be used for handoff or backup.

### 11. Client Handoff

- Share app URL or local run instructions.
- Review environment variables.
- Review database persistence limitation.
- Review demo mode behavior.
- Review who updates inquiries.
- Review who checks Weekly Summary.
- Confirm support expectations.
- Confirm next check-in date.

## Rehearsal Evidence

```text
client_db=/var/folders/zm/2xmfzv5x3gqdfyxyws3qlk6r0000gn/T/chiro_deployment_rehearsal_v2.sqlite
schema_columns=id,name,phone,email,service_needed,source,status,estimated_value,notes,next_follow_up_date,created_at,updated_at
initial_rows=0
rows_imported=6
row_count_after_import=6
updated_training_record_id=1
total_leads=6
new_leads_this_week=6
active_patients=1
followups_needed=2
followups_needed_percent=33.33333333333333
overdue_followups=1
estimated_treatment_value=3850.0
conversion_rate=16.666666666666664
top_source=Google
weekly_total=6
weekly_followups_needed=2
weekly_overdue=1
all_export_bytes=1279
followup_export_bytes=941
handoff_status=simulated_complete
```

## Every Unclear Instruction

- The SOP says to import production data, but there is no standard import file template for a signed client.
- The SOP says to confirm persistent storage, but the exact Streamlit Community Cloud persistence expectation needs a short client-facing explanation.
- The SOP says to complete handoff notes, but it does not specify where client-specific handoff notes should live.
- The SOP says to share relevant sales or training PDFs, but it does not define which documents are required versus optional.
- The SOP says to confirm support expectations, but it does not include a simple handoff script for support tiers.
- The SOP says to verify exports, but it does not define the exact expected export row counts for each deployment type.

## Every Repeated Action

- Confirming the app is not an EHR, scheduler, billing system, or insurance system appears in setup, training, handoff, sales, and FAQ materials.
- Validating status and source values appears in data import, dashboard verification, and training.
- Checking SQLite persistence appears in README, deployment checklist, handoff checklist, and troubleshooting.
- Confirming fake data appears in setup, data import, training, and handoff.
- Verifying Dashboard, Weekly Summary, and Export appears in multiple checklists.
- Explaining `BUSINESS_OS_DB_PATH` appears in environment setup, deployment, and handoff.

## Improvement Opportunities

- Create a `client_deployment_packet_template.md` that combines scope, data rules, deployment target, training owner, support expectations, and next check-in.
- Create a standard `client_import_template.csv` with practice-facing column notes.
- Add a one-page `go_live_checklist.md` that compresses the final handoff into one page.
- Add a short client-facing SQLite persistence explainer for Streamlit Community Cloud and Render.
- Add a required-versus-optional handoff materials list.
- Add expected export validation rules by deployment type:
  - demo
  - pilot
  - production-style setup
- Add a short training script focused on three habits:
  - add inquiry
  - set follow-up date
  - review weekly summary

## Friction Reduction Summary

The core deployment path works, but it still depends on operator discipline. The most useful next reduction is not new app functionality. It is a tighter deployment packet:

```text
client intake
database path
data import template
verification checklist
training script
handoff notes
support schedule
```

## Final Status

- Client signs: simulated
- New database created: passed
- Demo data avoided: passed
- Production-style data imported: passed
- Training update simulated: passed
- Dashboard verified: passed
- Weekly Summary verified: passed
- Exports verified: passed
- Handoff completed: simulated
