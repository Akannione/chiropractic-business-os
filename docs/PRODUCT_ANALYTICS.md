# CBOS Product Analytics Contract

## Objective

CBOS uses product analytics to answer whether the product helps clinic staff complete operational work. Analytics must not become a second patient-data store.

## Privacy boundary

Never send these values to product analytics:

- patient or staff names
- phone numbers or email addresses
- inquiry IDs, patient IDs, record IDs, or free-text identifiers
- notes, activity context, requested-service free text, or clinical details
- CSV filenames, CSV contents, source rows, or imported field values
- authentication tokens, passwords, IP addresses intentionally retained by CBOS, or raw error messages

The browser client disables autocapture, automatic page views, automatic exception capture, session recording, persistent analytics storage, and person profiles. Localhost and automated browser sessions are excluded. Only allowlisted custom events are accepted by the client.

## Event taxonomy

| Event | Purpose | Allowed properties |
| --- | --- | --- |
| workspace_viewed | Understand which operational workspaces are actually used | workspace |
| inquiry_created | Measure staff-side inquiry capture | entry_point |
| follow_up_action_completed | Measure completion of Today-queue work | resulting_status |
| intelligence_preview_completed | Validate Intelligence workflow adoption | source, files_received, recognized_reports, signals_found |
| csv_import_previewed | Measure import preparation/friction | importable_rows, error_count |
| csv_import_completed | Measure successful ingestion | imported_rows, skipped_duplicates |
| duplicate_merge_completed | Measure data-quality workflow use | records_merged |
| public_intake_submitted | Measure public intake completion | none |
| demo_data_reset | Separate demo/reset behavior from normal use | none |

## Product questions

The initial instrumentation should answer:

1. Does a staff session reach Today and then take an operational action?
2. Which workspaces are used repeatedly versus ignored?
3. Do staff complete follow-up actions from Today?
4. Do clinics reach Intelligence and successfully recognize reports/signals?
5. Does CSV ingestion progress from preview to successful import?
6. Are data-quality tools used before pilots introduce more integrations?

## Deliberate exclusions

No session replay, heatmaps, broad autocapture, person identification, user profiles, or clinical/patient segmentation should be enabled for the MVP. Any future expansion requires a separate privacy/security review before implementation.
