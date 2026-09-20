# Data Sync Architecture

## Objective

Prevent double entry while keeping CBOS beside the EHR or practice-management system. CBOS should ingest the minimum operational fields required for inquiry, follow-up, reactivation, and owner review. It must not become the clinical system of record.

## Target flow

```text
External source
  -> source adapter
  -> validation and normalization
  -> canonical operational record
  -> identity matching
  -> proposed diff
  -> conflict policy
  -> create / update / ignore
  -> import run and result log
```

## Component responsibilities

| Component | Responsibility |
| --- | --- |
| External source | EHR export, website form, CSV, webhook, or approved API |
| Source adapter | Map source headers and values without leaking source-specific logic into the core |
| Validation | Reject malformed dates and impossible values; report row-level errors |
| Canonical record | Use the existing CBOS fields and normalized values |
| Identity matching | Prefer stable external ID when available; otherwise use the documented duplicate policy |
| Proposed diff | Show what would be created, changed, unchanged, or rejected before applying |
| Conflict policy | Define source authority per field; never silently overwrite staff edits |
| Apply step | Create, update, or ignore deterministically |
| Import history | Record source, time, counts, errors, and operator; avoid clinical content |

## Future-compatible metadata

The current schema remains unchanged for this phase. Before implementing recurring sync, evaluate backward-compatible metadata such as:

- `source_system`
- `external_record_id`
- `source_updated_at`
- `last_synced_at`
- `sync_fingerprint`
- `import_run_id`

These fields are not added until a real de-identified export proves which ones are necessary.

## Field-authority hypothesis

- Source system owns appointment history and last-visit data.
- CBOS owns operational owner, follow-up outcome, next follow-up action, and CBOS notes.
- Shared contact fields require explicit conflict review when both changed.
- Clinical notes, balances, insurance, diagnosis, treatment, and billing data are out of scope.

## De-identified export request template

> Please provide a small export containing 10-25 fully de-identified rows. Replace names, phone numbers, emails, record IDs, and free-text notes with fake values. Include column headers and representative date/status values. We want to understand field availability and update behavior, not receive patient or clinical information.

Ask whether the export contains:

- a stable record identifier;
- patient type;
- inquiry source and created date;
- appointment status and appointment date;
- last visit date;
- next appointment date;
- updated timestamp;
- service or visit category.

## Go / Revise / Stop thresholds

- **Go:** stable identity plus required dates/statuses exist; import removes repeated entry; conflicts can be explained.
- **Revise:** export is usable but needs one small mapping or periodic manual upload.
- **Stop:** no reliable identity, essential dates are unavailable, or staff would still maintain the same fields twice.

Status: **YELLOW**. Architecture is defined; a de-identified real-system export has not been inspected.
