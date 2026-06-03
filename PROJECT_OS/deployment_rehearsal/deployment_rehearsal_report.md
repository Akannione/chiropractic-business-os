# Deployment Rehearsal Report

This rehearsal simulates a new chiropractic client deployment without changing the app, schema, pricing, product features, or the local demo database.

## Scenario

A new chiropractic client signs and needs a clean production-style setup:

1. New database created.
2. Demo data removed.
3. Production data imported.
4. Dashboard verified.
5. Weekly summary verified.
6. Exports verified.
7. Handoff checklist completed.

## Rehearsal Result

Status: Passed

The rehearsal used a temporary SQLite database and fake production-style data. No real patient data was used.

## Manual Deployment Steps

### 1. Confirm Signed Client Scope

- Confirm the buyer name, practice name, and package purchased.
- Confirm whether the client is using fake onboarding data or approved production data.
- Confirm that real patient data will not be used until hosting, privacy, access, retention, and compliance expectations are clear.
- Confirm the deployment target: local, Streamlit Community Cloud, Render, or another approved host.

### 2. Create A New Database

- Choose a database path for the client.
- Set `BUSINESS_OS_DB_PATH` to that client-specific path.
- Start the app or call database initialization.
- Confirm the `leads` table exists.
- Confirm the table columns match the current schema:
  - `id`
  - `name`
  - `phone`
  - `email`
  - `service_needed`
  - `source`
  - `status`
  - `estimated_value`
  - `notes`
  - `next_follow_up_date`
  - `created_at`
  - `updated_at`

### 3. Remove Demo Data

- Do not run with `BUSINESS_OS_DEMO_MODE=true` for production setup.
- Confirm the new database has zero rows before import.
- If demo data was accidentally seeded, reset the client database and restart without demo mode.
- Do not delete or modify a real production database unless the client explicitly approves it.

### 4. Prepare Production Import

- Use a CSV with fields that map to the current database schema.
- Required import fields:
  - `name`
  - `phone`
  - `email`
  - `service_needed`
  - `source`
  - `status`
  - `estimated_value`
  - `notes`
  - `next_follow_up_date`
- Validate statuses against the chiropractic configuration:
  - `New Inquiry`
  - `Consultation Scheduled`
  - `Active Patient`
  - `Lost`
  - `Follow-Up Needed`
- Validate sources against the chiropractic configuration:
  - `Google`
  - `Referral`
  - `Insurance`
  - `Website`
  - `Phone Call`

### 5. Import Production Data

- Import rows into the new client database using the existing insert workflow.
- Confirm row count after import.
- Spot-check at least three records.
- Confirm estimated values are numeric.
- Confirm date fields are valid ISO dates or blank.

### 6. Verify Dashboard

- Start the app with the client database path.
- Open the Dashboard tab.
- Confirm KPIs are populated.
- Confirm Estimated Treatment Value excludes `Lost` records.
- Confirm Follow-Ups Needed includes due-today and overdue records.
- Confirm Overdue Follow-Ups excludes `Lost` records.
- Confirm Active Patients match `Active Patient` status.
- Confirm Top Inquiry Source appears.

### 7. Verify Weekly Summary

- Open the Weekly Summary tab.
- Confirm the week range renders.
- Confirm Total Patient Inquiries matches imported row count.
- Confirm New This Week reflects imported created dates.
- Confirm Follow-Up Focus shows overdue follow-ups when present.
- Confirm the Practice Performance Snapshot renders.
- Download snapshot text or CSV if requested.

### 8. Verify Exports

- Open the Export tab.
- Download patient inquiry CSV.
- Download follow-up CSV.
- Confirm CSV headers are practice-facing, not raw database field names.
- Confirm exported rows match the expected counts.
- Confirm follow-up export excludes closed/lost records where appropriate.

### 9. Complete Handoff

- Walk the client through the Dashboard, Patient Inquiries, Weekly Summary, and Export tabs.
- Explain that this tool is not an EHR, scheduler, payment system, or patient portal.
- Explain the SQLite persistence limitations for the chosen host.
- Confirm who owns weekly review and follow-up updates.
- Confirm support expectations and next check-in date.
- Save handoff notes in `deploy_sop/handoff_checklist.md` or the client project notes.

## Rehearsal Evidence

The rehearsal was executed against a temporary database.

```text
rows_imported=5
schema_columns=[
  id,
  name,
  phone,
  email,
  service_needed,
  source,
  status,
  estimated_value,
  notes,
  next_follow_up_date,
  created_at,
  updated_at
]
total_patient_inquiries=5
new_this_week=5
active_patients=1
followups_needed=2
overdue_followups=1
estimated_treatment_value=1165.0
conversion_rate=20.0
top_source=Google
weekly_summary_total=5
all_export_bytes=949
followup_export_bytes=668
```

## Friction Found

- Production import is currently a manual/operator workflow, not an in-app feature.
- The app intentionally seeds sample data when a database is empty unless the operator controls the setup path carefully.
- Client-specific persistence must be planned before deployment, especially on Streamlit Community Cloud or Render.

## Friction Reduction Notes

- Always use a client-specific `BUSINESS_OS_DB_PATH`.
- Do not enable demo mode for client production setup.
- Validate production CSV columns before import.
- Keep a copy of the final imported CSV in the client handoff packet if approved.
- Run the Dashboard, Weekly Summary, and Export checks before handoff.

## Handoff Checklist Status

- Database initialized: Complete
- Demo data removed/avoided: Complete
- Production-style data imported: Complete
- Dashboard verified: Complete
- Weekly summary verified: Complete
- CSV exports verified: Complete
- Handoff process documented: Complete
