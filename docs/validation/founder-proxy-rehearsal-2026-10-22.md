# CBOS — Synthetic founder-proxy walkthrough

Date: October 22, 2026
Execution: local automated browser scenario (Chromium), **not an observed human founder or real clinic owner test**.
Source: isolated worktree `business_os_mvp_owner_focus_20261022`, based on `main` commit `1128670`.
Local preview: `http://127.0.0.1:5197/`; local synthetic API: `http://127.0.0.1:4030/api`; local-only database: `cbos_owner_focus_20261022`.

## Checks and evidence

| Scenario | Verified result | Local evidence |
| --- | --- | --- |
| Identify first follow-up | PASS — Priya Patel is the oldest overdue item, followed by Maya, Aisha and Nia | `output/founder-journey-2026-10-22/01-today-first-overdue.png` |
| Inspect a specific inquiry | PASS — selected Priya's editor and confirmed her actual follow-up date (2026-10-17) | `02-inquiry-inspected.png` |
| Review and record reactivation | PASS — changed fictional Chris Miller's owner/outcome and verified persistence through the isolated API | `03-reactivation-before-save.png`, `04-reactivation-saved.png` |
| Explain weekly owner report | PASS — 4 inquiries require follow-up, 3 are overdue, $1,680 is estimated *opportunity*, not recovered revenue; optional 4-step checklist works | `05-owner-review-brief.png`, `06-owner-review-checklist.png` |
| Check phone interface | PASS — 390px viewport, correct first overdue action, no horizontal overflow | `07-mobile-today.png`, `08-mobile-action-first-revised.png` |

All person/contact information was supplied by the application’s fictional demo reset. No real clinic records, credentials, PHI, or live submissions were used. The automated test restored the original eight fabricated records after its temporary synthetic update; the Chris Miller test update was not retained. The script includes a local-only origin, demo-mode/auth checks, and restoration logic.

## Confirmed implementation repairs

1. **Inquiry selection consistency.** Initial automation caught a transition where the selected inquiry's heading switched to Priya but the editable date still belonged to the prior record. The inquiry editor now synchronizes selection and form state, tracks the form's record ID, and blocks submission unless both IDs match.
2. **Reactivation selection consistency.** Reactivation editing used a similar asynchronous selection pattern. The selected record and its form now update together, with an ID-based save guard.
3. **Mobile Today action visibility.** Before adjustment the first actionable card started at **1,284px** from the top of a 390px phone viewport. After compacting the hero's metrics into three columns and moving secondary KPI cards below the task queue, the first actionable card starts around **677px**. Across tested widths 320, 375, 390, 430 and 720px, no horizontal page overflow was observed.

These are presentation and data-binding correctness changes, not decisions about inquiry status transitions, reactivation completion, monthly cohort meaning, or record drill-through.

## What this does NOT validate

- Whether a real clinic owner can understand the product without prompting
- Whether the workflow matches one clinic's current systems, staffing, or terminology
- Whether anyone will pay for CBOS or supply a deidentified export
- HIPAA compliance, PHI readiness, EHR interoperability, recovered revenue, automated booking

VAL-003–VAL-007 remain evidence-gated. The product is still a lightweight operational follow-up layer, not an EHR, claims, full scheduling, charting, or patient portal product.

## Founder’s self-review in the local preview

Perform the same five tasks without consulting the accompanying scripts. For each task, record one of `CLEAR`, `HESITATION`, `BLOCKED`. Note the exact text or interaction causing confusion; do not infer clinic demand from a founder review. The real external milestone is a first interested owner reviewing synthetic data.

## Reproduce without production access

From the isolated local worktree, while its synthetic MongoDB/backend/frontend are running:

```sh
cd frontend
node e2e/founder-owner-journey.mjs
```

The script resets the isolated demo before and after its exercise, asserts `demoMode: true`, and writes `../output/founder-journey-2026-10-22/founder-proxy-results.json` and screenshots. Do not point it at live or real patient data.

**Release status:** All changes local and uncommitted. Do not push, merge, or deploy until separately authorized and the release dependency and security gates are verified.
