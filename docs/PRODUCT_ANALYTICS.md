# Product Analytics Plan

## Principle

Measure whether the workflow is used and completed without sending patient identities, contact information, free text, clinical content, or other PHI to third-party analytics.

## Pilot questions

- Do staff open the Today queue on working days?
- Can they identify and complete the first action quickly?
- Are outcomes and owners recorded consistently?
- Is the weekly review used?
- Does CSV import reduce duplicate entry?
- Which screen or task causes abandonment?

## Minimal event design

If implemented, record first-party operational events with no patient payload:

| Event | Allowed properties |
| --- | --- |
| `today_viewed` | timestamp, pseudonymous workspace ID, role |
| `action_opened` | timestamp, action category, urgency bucket |
| `action_completed` | timestamp, outcome category, elapsed-time bucket |
| `reactivation_viewed` | timestamp, queue-size bucket |
| `weekly_review_viewed` | timestamp |
| `import_previewed` | timestamp, row-count bucket, error-count bucket |
| `import_applied` | timestamp, created/updated/rejected counts |

Never include names, phone numbers, emails, notes, services tied to a person, record IDs from the EHR, dates of care, or raw URLs/query strings.

## Current implementation decision

Do not add analytics storage during this phase. The pilot can use the existing activity records, facilitator timing, and success scorecard. Adding a new event store before the data-retention and real-data architecture are approved would create avoidable privacy and schema decisions.

## Implementation threshold

Implement first-party analytics only when:

- a paid pilot needs measurement beyond the scorecard;
- permitted events and retention are approved;
- workspace identity and staff roles are defined;
- deletion/export behavior is documented;
- tests verify prohibited fields are never accepted.

Status: **YELLOW**. Measurement is designed and can be performed manually; automated telemetry is intentionally deferred.
