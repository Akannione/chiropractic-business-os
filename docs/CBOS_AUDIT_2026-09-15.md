# CBOS Audit - September 15, 2026

## Executive Summary

CBOS remains correctly positioned as a system of action and operational intelligence for chiropractic practices, not as an EHR. This audit found and fixed several reliability, security, data-integrity, and UX defects without changing the database schema, deploying production, resetting data, sending email, or modifying Vercel/Atlas credentials.

The most important engineering fixes were:

- Staff-auth CSV imports no longer drop the bearer token when callers set `Content-Type: text/csv`.
- Practice date logic now uses an explicit practice timezone instead of mixing server-local, UTC, and browser-local assumptions.
- Webhook intake is disabled unless `WEBHOOK_SECRET` is configured, and authorized calls must use the `x-cbos-webhook-secret` header.
- PATCH validation now rejects the same invalid values that CREATE rejects.
- CSV import preview now surfaces invalid source/workflow/value data instead of silently converting it.
- CSV exports mitigate spreadsheet formula injection.
- Pipeline copy now truthfully explains the 100-row board limit.
- Expired or invalid staff tokens now clear centrally and return the user to login.
- Duplicate merge now validates duplicate identity rules and uses transaction semantics where supported.
- Lightweight frontend regression tests now cover critical API/date/auth/board behavior.

The most important product finding is that CBOS should continue avoiding EHR-like clinical scope. Its strongest differentiation is not "patient records" or "calendar management"; it is the operating layer that answers: what needs attention, why, who owns it, and what happens next.

## Baseline Verification

Starting point:

- Branch: `main`
- Head before audit work: `9c69a10 Add ChatGPT project context for CBOS`
- Existing dirty files before this task included `CONTINUE_COMMANDS.md`, `PROJECT_STATUS.md`, `docs/NEW_PATIENT_IMPORT_DEMO.csv`, and untracked `docs/VALIDATION_RUNS.md`.
- No real patient data was used.
- No production deployment, production reset, email send, Vercel credential update, or Atlas credential update was performed.

Baseline results before fixes:

| Check | Baseline result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run test` | Passed |
| `npm run build` | Passed |
| `npm run test:db` | Initially skipped because MongoDB was unavailable, then passed after starting local MongoDB |
| `npm audit --prefix frontend --audit-level=high` | Passed |
| `npm audit --prefix backend --audit-level=moderate` | Failed because `nodemailer <=9.1.0` was high severity |
| `git diff --check` | Passed |

Final verification after fixes:

| Check | Final result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run test` | Passed, including backend service tests and new frontend tests |
| `npm run build` | Passed |
| `npm run test:db` | Passed against local MongoDB |
| `npm audit --prefix frontend --audit-level=high` | Passed, 0 vulnerabilities |
| `npm audit --prefix backend --audit-level=moderate` | Passed, 0 vulnerabilities after dependency update |
| `git diff --check` | Passed |

## Confirmed Bugs Found

| Issue | Severity | Confirmed behavior |
| --- | --- | --- |
| CSV import auth header loss | High | The API client could replace constructed headers with caller headers, dropping `Authorization` for protected CSV import routes. |
| Practice timezone/date-only drift | High | Frontend and backend mixed local dates, UTC conversion, and server-local date setters. Production server timezone could disagree with practice timezone. |
| Unprotected machine webhook | High | Webhook intake was reachable before staff auth and had no configured shared-secret gate. |
| PATCH validation drift | Medium | Updates could accept invalid values that create rejected. |
| CSV import silent semantic conversion | High | Unknown sources, unknown workflow enum values, non-finite values, and some estimated value cases could be silently defaulted instead of surfaced in preview. |
| CSV formula injection | High | Exported patient-controlled text could begin with spreadsheet formula characters. |
| Pipeline board copy overstated completeness | Medium | UI implied every inquiry was visible even though the board is bounded to 100 rows. |
| Expired token UX | Medium | A stale local token could leave the user inside the app while protected API calls returned 401. |
| Duplicate merge safety | High | Merge needed server-side duplicate-rule validation and safer destructive write behavior. |
| Frontend automated test gap | Medium | Frontend had no test script protecting API headers, auth expiry, date-only logic, or board-limit copy. |
| Copy/data-rule mismatch | Low | Import copy could imply duplicate detection by email or phone alone, but the real rule is normalized patient name plus email or phone. |

## Bugs Fixed

### CSV import authentication

Fixed in `frontend/src/services/api.ts`.

- Added central header merging.
- Preserved `Authorization` when callers pass custom content types.
- Stripped auth only for known public paths.
- Added regression coverage in `frontend/src/tests/frontend.test.ts`.

### Practice timezone/date-only semantics

Fixed across backend and frontend date helpers.

- Added `PRACTICE_TIME_ZONE`, defaulting to `America/New_York`.
- Added timezone validation at app startup.
- Replaced date-only comparison helpers with practice-timezone-aware logic.
- Updated KPI, report, reactivation, reminder, sample-data, export filename, and frontend date helpers.
- Added timezone boundary and DST frontend/backend tests.

### Webhook security

Fixed in `backend/src/controllers/automationController.ts` and `backend/src/config/env.ts`.

- Added `WEBHOOK_SECRET`.
- Webhook intake now returns 404 unless configured.
- Authorized webhook calls must provide `x-cbos-webhook-secret`.
- Shared-secret comparison avoids query strings and uses timing-safe comparison of hashed values.
- Added regression tests.

### PATCH validation parity

Fixed in `backend/src/validators/inquiryValidators.ts`.

- Update validation now covers name, phone, email, service, source, status, estimated value, workflow enum fields, visit frequency, and date-only fields.
- Added regression tests to prevent create/update validation drift.

### CSV import data integrity

Fixed in `backend/src/services/importService.ts`.

- Estimated value `0` stays `0`.
- Negative, non-finite, and non-number values now appear as preview errors.
- Unknown sources and workflow enum values now appear as preview errors instead of being silently defaulted.
- Valid values still normalize to canonical labels where appropriate.

### CSV formula injection

Fixed in `backend/src/utils/csv.ts`.

- Exported CSV values beginning with `=`, `+`, `-`, `@`, or leading whitespace followed by those characters are prefixed with an apostrophe.
- Regression tests cover the mitigation.

### Pipeline board truthfulness

Fixed in `frontend/src/pages/PipelinePage.tsx`.

- The board remains bounded for performance.
- UI no longer claims every inquiry is visible.
- When total exceeds visible rows, the board tells the user it is showing the newest 100 and points them to Patient Inquiries filters for the full list.

### Expired/invalid token UX

Fixed in `frontend/src/services/api.ts`, `frontend/src/App.tsx`, and `frontend/src/pages/LoginPage.tsx`.

- Protected 401 responses clear stale auth state centrally.
- StaffGate verifies an existing local token before entering the staff app.
- Public endpoint failures do not trigger logout.
- Login can display a session-expired notice.

### Duplicate merge safety

Fixed in `backend/src/services/duplicateService.ts` and `backend/src/services/activityService.ts`.

- Merge now rejects unrelated records server-side.
- Duplicate groups use connected-component logic, so transitive matches become one group.
- Merge uses a Mongo session/transaction where supported.
- A standalone Mongo fallback preserves ordered writes after validation.
- Activity logging can participate in the merge session.

### Frontend tests

Added `frontend/src/tests/frontend.test.ts`.

Covered:

- CSV import header merging.
- Protected 401 token clearing.
- Public endpoint 401 not triggering logout.
- Practice timezone date helpers.
- Pipeline 100-row limit message.

## Exact Files Changed

Backend:

- `backend/.env.example`
- `backend/.env.production.example`
- `backend/package.json`
- `backend/package-lock.json`
- `backend/src/app.ts`
- `backend/src/config/env.ts`
- `backend/src/controllers/automationController.ts`
- `backend/src/controllers/configController.ts`
- `backend/src/controllers/exportController.ts`
- `backend/src/controllers/reminderController.ts`
- `backend/src/controllers/reportController.ts`
- `backend/src/data/sampleData.ts`
- `backend/src/scripts/generateDemoImportCsv.ts`
- `backend/src/services/activityService.ts`
- `backend/src/services/duplicateService.ts`
- `backend/src/services/importService.ts`
- `backend/src/services/kpiService.ts`
- `backend/src/services/reactivationService.ts`
- `backend/src/services/reportService.ts`
- `backend/src/tests/database.test.ts`
- `backend/src/tests/service.test.ts`
- `backend/src/utils/csv.ts`
- `backend/src/utils/date.ts`
- `backend/src/validators/inquiryValidators.ts`

Frontend:

- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/src/App.tsx`
- `frontend/src/hooks/useBusinessOsData.ts`
- `frontend/src/pages/ExportsPage.tsx`
- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/pages/PipelinePage.tsx`
- `frontend/src/services/api.ts`
- `frontend/src/tests/frontend.test.ts`
- `frontend/src/types.ts`
- `frontend/src/utils/format.ts`

Documentation and root:

- `README.md`
- `package.json`
- `docs/ANALYTICS_CONTRACT.md`
- `docs/API.md`
- `docs/CBOS_AUDIT_2026-09-15.md`
- `docs/DUPLICATE_POLICY.md`
- `docs/SECURITY.md`
- `docs/WORKFLOW_AUTOMATION.md`

## Regression Tests Added

- Header merging keeps auth for text/csv import preview.
- Protected 401 clears the token and calls the unauthorized handler.
- Public 401 does not clear the staff token.
- Date-only helpers respect America/New_York and DST boundaries.
- Pipeline board reports when it is showing a bounded subset.
- Webhook rejects unconfigured, missing, and wrong secrets, and accepts the correct header secret.
- PATCH rejects invalid create-equivalent fields.
- CSV import preview rejects invalid semantic values.
- CSV export formula injection is mitigated.
- Duplicate grouping handles transitive groups.
- Duplicate merge rejects unrelated records.
- Merge behavior is verified against a real MongoDB test database.

## Security Findings

Fixed:

- Protected route requests now preserve authorization headers even with caller-provided headers.
- Webhook intake is no longer effectively public by default.
- CSV export formula injection is mitigated.
- Backend dependency audit is clean after upgrading `nodemailer`.
- Expired-token UX now avoids keeping staff inside the app after protected 401 responses.

Documented residuals:

- The in-memory rate limiter is useful for a single server process but is not a distributed serverless abuse control on Vercel.
- `WEBHOOK_SECRET` is a pilot-grade shared-secret control, not a full signed-webhook platform.
- Atlas/Vercel demo infrastructure remains appropriate for validation but should be revisited before paid-client production.
- CBOS should not store clinical notes, SOAP notes, billing details, insurance workflows, or full patient history unless the product scope changes and proper compliance work is completed.

## Remaining Technical Debt

- Import and sync still lack source provenance, external IDs, sync history, and conflict review.
- The pipeline board is honest but still bounded; a future optimized grouped endpoint or per-column pagination may be needed for large clinics.
- Webhook security should eventually support provider-specific signatures once real integration partners are known.
- Rate limiting should move to a hosted/distributed control if public traffic grows.
- Merge uses a safe standalone Mongo fallback, but production should prefer replica-set transactions.
- Current CSV import is append-focused, not a true upsert/sync engine.

## Product Differentiation Findings

Competitor context from official product pages:

- ChiroTouch positions itself as chiropractic EHR and practice management, including SOAP notes, intake, appointment reminders, and cloud EHR features: https://www.chirotouch.com/
- Jane positions itself as a practice management and EMR system with scheduling, charting, billing, payments, patient communication, and integrations: https://jane.app/
- ClinicSense positions itself as all-in-one clinic management with scheduling, intake, treatment notes, financial, and communication features: https://clinicsense.com/
- ChiroCat positions itself as an all-in-one EHR, scheduling, messaging, billing, payment, and reporting platform: https://www.chirocat.com/

CBOS should not compete head-on as another all-in-one EHR. Its differentiation is the daily action layer on top of inquiry, follow-up, recall, owner review, and operational visibility.

### Today

- Job: show the practice what needs attention today.
- EHR/CRM risk: low, because it is action-oriented rather than record-oriented.
- Distinct CBOS value: overdue/due-today follow-ups, active operational cards, and quick action context.
- Improve later: keep this as the first screen; make "why this matters" visible for each action.
- Leave untouched: do not add clinical charts.

### Patient Inquiries

- Job: manage patient inquiry records and follow-up details.
- EHR/CRM risk: medium, because it resembles a patient list.
- Distinct CBOS value: inquiry source, follow-up ownership, status, movement/activity context, and operational next step.
- Improve later: emphasize "inquiry workflow" over "patient database".
- Leave untouched: current capture fields are operational enough and should not become clinical charting.

### Pipeline

- Job: show inquiry stages by status.
- EHR/CRM risk: medium, because boards can look like generic CRM.
- Distinct CBOS value: practice-specific stages and bounded operational triage.
- Improve later: add owner-focused stage explanations, not more columns.
- Leave untouched: bounded board performance behavior.

### Reactivations

- Job: identify existing or inactive patients who may need a follow-up call based on last visit and expected frequency.
- EHR/CRM risk: low to medium; it is close to recall/reminder features but framed as operational intelligence.
- Distinct CBOS value: overdue, due-today, upcoming queues with owner and outcome.
- Improve later: validate recall policies with more clinics before adding automation.
- Leave untouched: do not turn this into treatment plan management.

### Owner Review

- Job: weekly practice performance summary for owner review.
- EHR/CRM risk: low.
- Distinct CBOS value: owner-friendly operational KPIs and narrative summary.
- Improve later: make it the handoff artifact after demos.
- Leave untouched: avoid complex analytics platform sprawl.

### Monthly Report

- Job: summarize longer-range inquiry and follow-up performance.
- EHR/CRM risk: low.
- Distinct CBOS value: practice performance, not clinical reporting.
- Improve later: strengthen trend explanation after more real clinic data.
- Leave untouched: current simple report format.

### Activity

- Job: show operational history.
- EHR/CRM risk: medium, because activity logs are common.
- Distinct CBOS value: follow-up and workflow activity, not clinical notes.
- Improve later: label as "Operational Activity" if clinics confuse it with chart notes.
- Leave untouched: no SOAP note activity.

### Duplicates

- Job: safely detect and merge duplicate inquiry records.
- EHR/CRM risk: low.
- Distinct CBOS value: prevents double-counted follow-up work and duplicate operational records.
- Improve later: add clearer merge preview if real clinics ask.
- Leave untouched: do not merge clinical records.

### Import/Export

- Job: move fake/demo or approved clinic operational inquiry lists in and out.
- EHR/CRM risk: medium, because imports imply data migration.
- Distinct CBOS value: preview, duplicate detection, and operational import rather than EHR replacement.
- Improve later: create EHR export-specific adapters only after real de-identified exports are obtained.
- Leave untouched: no automatic EHR replacement claims.

### Settings

- Job: show operational configuration and demo controls.
- EHR/CRM risk: low.
- Distinct CBOS value: practice labels, demo mode, timezone, and simple system state.
- Improve later: surface timezone and webhook status clearly.
- Leave untouched: no billing/EHR settings.

### Public Intake

- Job: collect an inquiry from a website or source-specific link.
- EHR/CRM risk: low.
- Distinct CBOS value: intake is tied to follow-up visibility, not full registration.
- Improve later: keep it lightweight and avoid medical intake fields.
- Leave untouched: no clinical history or insurance collection.

## Integration And Double-Entry Findings

CBOS should not require staff to continuously maintain the same operational data in both CBOS and an EHR. The current product is acceptable for demos and pilots because it supports public intake, staff entry, webhook intake, CSV preview/import, duplicate detection, and exports. It is not yet a true EHR sync layer.

### What data should originate in CBOS

- Public website inquiry submissions.
- Manual staff inquiry entries for calls, referrals, Google, or front-desk interactions.
- Follow-up ownership, outcome, notes, and next action when CBOS is the operating queue.
- Owner-review operational comments.

### What data should originate in the EHR

- Appointment records.
- Completed visit history.
- Patient identifiers used by the practice system.
- Clinical charting and SOAP notes.
- Billing, balance, claim, and insurance records.
- Full patient demographics when the EHR is authoritative.

### Fields that need source provenance

- `name`
- `phone`
- `email`
- `status`
- `source`
- `next_follow_up_date`
- `appointment_status`
- `last_visit_date`
- `expected_visit_frequency_days`
- `assigned_follow_up_owner`
- `follow_up_outcome`

### Stable identifier strategy

Future sync should not rely only on name, email, or phone. It should support:

- `external_source`
- `external_patient_id`
- `external_appointment_id`
- `external_last_seen_at`
- `import_batch_id`
- `source_record_hash`

Those fields should wait until the first real de-identified export is reviewed, because premature schema changes may encode the wrong assumptions.

### Creates vs updates

Future sync should work as:

1. Parse external export.
2. Map to canonical CBOS operational fields.
3. Match by external ID if available.
4. Fall back to identity rules only when no external ID exists.
5. Show preview counts: create, update, unchanged, conflict, skipped.
6. Apply only approved changes.

### Deletes

Do not hard-delete operational records because an external export omits a row. Missing rows should become "not present in latest source export" until clinic policy is known.

### Conflicts

Conflicts should be surfaced when the EHR says one thing and CBOS says another for operational fields such as follow-up owner, status, or next follow-up date. The preview should show old value, incoming value, source, last updated, and recommended action.

### Import history/sync history

Future sync needs:

- source name
- uploaded file name
- import time
- row counts
- create/update/skip/conflict counts
- user who approved import
- checksum/hash
- rollback or correction note where possible

### Generalized adapter architecture

Recommended future shape:

```text
External source
  -> source adapter / mapper
  -> canonical CBOS operational record
  -> identity / diff / conflict engine
  -> preview and approval
  -> approved create/update
  -> CBOS action and intelligence layer
```

Do not hard-code the architecture around MetaSoft, ChiroTouch, Jane, ChiroCat, or any one system until real export samples prove the field formats.

## Schedule Intelligence Findings

A chiropractor asked for calendar-style visibility. This should be treated as research, not a full scheduler build.

Minimum appointment data needed:

- appointment ID from the source system
- patient external ID or matchable patient identity
- appointment date
- start time
- end time or duration
- provider or room if available
- appointment status
- cancellation/no-show/rescheduled state
- service or appointment type
- source system updated timestamp

Likely origin:

- Appointment data should originate in the EHR, practice management system, or calendar system.
- CBOS should read or import it, not become the primary scheduler during the pilot.

Potential differentiation:

- EHR calendar says: "Here is the schedule."
- CBOS Schedule Intelligence should say: "Here are the schedule events that need operational attention."

Examples:

- Cancelled appointment with no reschedule: contact patient.
- Open slot near a reactivation opportunity: suggested call list.
- New patient consult scheduled from Google inquiry: follow-up complete.
- Due-today recall patient not scheduled: call owner assigned.

Validate before building:

- Whether clinics can export appointment data.
- Whether staff would trust read-only schedule insight beside their EHR.
- Whether this reduces double entry or increases it.
- Whether open-slot/reactivation suggestions are useful enough to pay for.
- Whether calendar UI makes CBOS look too much like an EHR.

## Recommendations

### MUST FIX NOW

- No remaining code defects from this audit are open after the final passing verification suite.
- Before any production webhook demo, set `WEBHOOK_SECRET` securely.
- Keep `PRACTICE_TIME_ZONE` explicit for each clinic.

### MUST BUILD

- Build only after a paid pilot or strong clinic validation:
  - import/source provenance fields
  - sync history
  - import diff/approval screen
  - conflict handling

### VALIDATE FIRST

- EHR/export sync assumptions with a real de-identified export.
- Schedule Intelligence as read-only operational overlay.
- Whether reactivation queues should shrink when an outcome is marked "Spoke - Scheduled".
- Whether activity/movement context improves actual follow-up quality.

### LATER

- Provider-specific webhook signatures.
- Distributed rate limiting.
- Optimized grouped pipeline endpoint for large clinics.
- Per-column pipeline pagination or load-more.
- Stronger merge preview UI.

### DO NOT BUILD

- SOAP notes.
- Billing.
- Insurance.
- Payments.
- Full scheduler.
- Clinical charting.
- Prescription workflows.
- EHR replacement features.
- Any feature requiring real patient data before approval.

## Assumptions Requiring More Chiropractor Evidence

- The current reactivation rule, `last_visit_date + expected_visit_frequency_days`, may not match every practice's recall policy.
- Practices may differ on whether "called but not scheduled" should stay overdue, move to pending, or be temporarily snoozed.
- Schedule Intelligence may be valuable, but only if it avoids duplicating schedule maintenance.
- EHR export quality and available identifiers vary significantly by system.
- Clinic owners may value "visibility" language less than "call list" or "missed follow-up prevention"; this should be tested during demos.
