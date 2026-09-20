# CBOS Pilot Readiness

Assessment date: 2026-09-18

Status meanings:

- **GREEN:** controlled-pilot process or artifact is ready and internally verified.
- **YELLOW:** controlled test can proceed, but external evidence is still required.
- **RED:** blocked for the stated use until a hard gate is completed.

| Area | Before | After | Status | Evidence required | Next action |
| --- | --- | --- | --- | --- | --- |
| 1. EHR differentiation | Positioning existed across several documents; first-screen interpretation still needed testing | One-sentence boundary, comparison, and 30-second test documented; Today UX is action-first | YELLOW | 4 of 5 independent target users pass | Run comprehension test without coaching |
| 2. Clinic validation | Internal fake-data rehearsal only | 20-30 minute task protocol, thresholds, and record template ready | YELLOW | At least 3 independent clinic sessions | Schedule first fake-data session |
| 3. Double-entry / data sync | CSV preview/import exists; recurring sync architecture undefined | Adapter, identity, diff, conflict, and import-history design documented | YELLOW | Approved de-identified export and field map | Complete GitHub issue #4 experiment |
| 4. Schedule intelligence | One chiropractor suggested calendar visibility | Read-only hypothesis, boundaries, success and stop conditions documented | YELLOW | Two independent clinics identify same actionable signal | Complete GitHub issue #5 interviews |
| 5. Reactivation intelligence | Eligibility deterministic; post-contact queue behavior ambiguous | State model and explicit no-silent-removal pilot policy documented | YELLOW | Two clinics agree or paid pilot owner selects behavior | Validate issue #3 outcome rules |
| 6. ICP | General small-practice target | Observable fit, poor-fit, and 10-practice test defined | YELLOW | Scored outreach plus one paid pilot | Score next 10 practices |
| 7. Pricing | One `$50-$100/month` willingness signal; historical packages not validated | Three-model limit and `$100` paid-pilot hypothesis documented | YELLOW | A clinic pays and reaches day-30 decision | Present exact pilot price |
| 8. Paid pilot package | No single controlled offer | Scope, exclusions, commitments, price, FAQ, and stop rules ready | GREEN | Buyer acceptance is external, not readiness evidence | Use offer only after discovery/demo fit |
| 9. Onboarding | Deployment and demo docs existed | Four-day controlled onboarding and handoff acceptance defined | GREEN | First pilot completion time and friction | Rehearse once with fake workspace |
| 10. Success metrics | KPIs existed; pilot success thresholds dispersed | Baseline/midpoint/day-30 scorecard ready | GREEN | Completed scorecard from real pilot | Capture baseline before pilot starts |
| 11. Real-data / HIPAA readiness | Security gaps documented; boundary needed a single hard gate | Real patient data explicitly blocked; approval/control checklist defined | RED | Legal/compliance and technical approval | Use fake data only; review de-identified samples manually |
| 12. Sales process | Demo talk tracks and assets existed | Qualification-to-day-30 process and consultative script ready | GREEN | Real conversion evidence | Run discovery without feature-first pitch |
| 13. Product analytics | KPI logic exists; no privacy-safe usage plan | First-party minimal event plan and prohibited fields documented | YELLOW | Paid-pilot measurement need and retention approval | Use manual scorecard first |
| 14. Feedback loop | `VALIDATION_RUNS.md` existed with one internal rehearsal | Evidence hierarchy, experiment template, signal-counting, and weekly review defined | GREEN | Consistent use during clinic sessions | Log each session within 24 hours |

## Decision

CBOS is ready to be **offered as a controlled paid pilot using fake data**. It is not ready to receive real patient data, claim HIPAA compliance, promise EHR integration, or be sold as a proven repeatable product.

An approved de-identified CSV can be evaluated only after manual inspection under `REAL_DATA_READINESS.md`. The current recommendation is a `$100`, 30-day Founding Clinic Pilot with a continuation hypothesis of `$99/month`.

## Blocking distinction

The RED real-data gate does not block a fake-data paid validation engagement. It does block any pilot plan that requires real patient data or PHI.
