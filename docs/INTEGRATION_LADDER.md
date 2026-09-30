# CBOS Integration Ladder

Last updated: September 29, 2026

## Product decision

CBOS must not depend on every EHR exposing an open API.

The integration layer is therefore designed as a ladder. Each clinic uses the highest-trust transport its source system supports while CBOS keeps one canonical ingestion contract downstream.

```text
Source system
  -> API / FHIR / webhook when supported
  -> scheduled secure export / SFTP when supported
  -> watched export folder when the clinic must download CSV files
  -> guided multi-file upload as universal fallback
  -> classification + schema mapping
  -> validation + normalization
  -> provenance + freshness
  -> intelligence
  -> action queue
```

The source transport can change without rewriting the intelligence layer.

## Level 1 — Direct API / FHIR

Preferred when the vendor supports an approved integration path.

CBOS should:
- use vendor-supported authentication;
- request the minimum scopes required;
- record source, sync time, and connector version;
- use incremental synchronization when available;
- never scrape a private API or bypass vendor controls.

For U.S. certified health IT, investigate the product's certified API capabilities and published terms before assuming an API is available for the operational data CBOS needs.

## Level 2 — Vendor-supported automated export

Use scheduled exports, SFTP, secure cloud delivery, webhooks, or other documented vendor mechanisms when available.

This is often sufficient for operational intelligence even when a broad application API is unavailable.

## Level 3 — CBOS Desktop Import Agent / Watched Folder

For systems that require a human to download reports, the clinic downloads exports normally and saves them to a designated local folder such as:

```text
CBOS Imports/
  Appointments/
  Accounts Receivable/
  Provider Hours/
  Referral Sources/
```

A future lightweight CBOS desktop agent can:
1. watch the clinic-selected folder;
2. detect new files;
3. fingerprint files to prevent duplicate ingestion;
4. classify the report;
5. validate the schema locally;
6. upload only through the clinic's approved secure CBOS connection;
7. show success / needs mapping / rejected status;
8. archive or mark the local file as processed according to clinic policy.

This removes repeated CBOS data entry while respecting the EHR's supported export workflow.

The agent must not automate EHR login, scrape screens, defeat access controls, or store credentials unless a separately reviewed vendor-supported workflow explicitly permits it.

## Level 4 — Guided multi-file upload

This is the universal fallback and is already the foundation of Intelligence v1.

UX target:
- drag in the exports;
- CBOS recognizes known reports;
- user confirms uncertain mappings;
- CBOS shows freshness and coverage;
- analysis runs;
- user sees what needs attention.

The user should never manually recreate EHR records inside CBOS just because an API is unavailable.

## Level 5 — Manual structured entry

Reserve manual entry for CBOS-native operational information that does not exist in the EHR, such as:
- inquiry ownership;
- follow-up outcome;
- operational notes;
- action disposition.

Do not use manual entry as a substitute for copying clinical records.

## Canonical ingestion envelope

Every connector should eventually emit the same envelope before normalization:

```json
{
  "clinic_id": "...",
  "source_system": "jane",
  "transport": "manual_csv",
  "report_type": "appointments",
  "source_file": "...",
  "observed_at": "...",
  "schema_version": "...",
  "fingerprint": "...",
  "rows": []
}
```

This isolates vendor-specific ingestion from CBOS intelligence.

## Trust and freshness UX

Every intelligence signal should be able to expose:
- source system;
- source report;
- data last updated;
- mapping confidence;
- evidence coverage;
- whether the data is complete enough for the signal;
- whether the user needs to refresh an export.

CBOS should say **Refresh data** rather than silently presenting stale data as current.

## What we will not do

- No credential harvesting.
- No browser automation against an EHR unless explicitly supported and reviewed.
- No reverse engineering private APIs as the product strategy.
- No silent guessing of unknown schemas.
- No writeback when only read/export access is authorized.
- No real PHI pilot until the real-data readiness gates are satisfied.

## Current implementation

Intelligence Foundation v1 already proves the first universal fallback:
- multi-file CSV preview;
- report classification;
- unknown-report refusal;
- evidence coverage;
- duplicate-row warnings;
- supported operational signals;
- no persistence of uploaded report contents.

Next validated implementation target: import receipts + freshness/provenance UX, then a local watched-folder proof of concept using synthetic files only.
