# CBOS Validation Runs

Use this file to record real or simulated validation runs. Keep client names,
private contact details, credentials, and real patient data out of this file.

## 2026-09-08 - Internal Fake-Data Walkthrough

Run type: internal rehearsal using only fake data.

Decision recorded: `Go` to a real fake-data clinic validation call.

Customer decision: `Pending`. No clinic customer was present, so this is not a
customer `Go`, paid pilot approval, or deployment commitment.

External actions: none. No email was sent, no draft was edited, no account was
changed, no production demo data was reset, and no real patient data was used.

### Inputs Used

| Input | Status |
|---|---|
| `docs/CALL_RUN_SHEET.md` | Used as the clock |
| `docs/DEMO_WALKTHROUGH.md` | Used as the talk track |
| `docs/OBJECTION_ALREADY_CALLED.md` | Used for the main expected objection |
| `docs/NEW_PATIENT_IMPORT_DEMO.csv` | Regenerated on 2026-09-08 |
| CBOS production health | `/api/health` returned 200 |
| CBOS production auth | `/api/auth/status` returned auth enabled |
| Protected staff route | `/api/reactivations` returned 401 without a token, as intended |
| Frontend | `https://frontend-gold-alpha-31.vercel.app` returned 200 |
| Local tests | `npm run test` passed |

### What The 20 Minutes Look Like

| Clock | Segment | What Happens | What The Clinic Sees |
|---|---|---|---|
| 0:00-0:45 | Opening | Position CBOS as a lightweight follow-up and reactivation layer, not an EHR replacement. | Clear scope: it sits beside ChiroTouch, MetaSoft, scheduling, billing, and the EHR. |
| 0:45-4:00 | Current workflow | Ask where inquiries live, how staff knows who needs a call today, and how inactive patients are selected. Then stop talking. | They describe the real workflow and expose whether there is a real follow-up gap. |
| 4:00-6:00 | Reactivation queue | Open Reactivations and show overdue, due-today, and upcoming patients. | One prioritized call list organized by timing, owner, and outcome. |
| 6:00-8:00 | Hand them the wheel | Ask which fake patient they would call first and why. | The clinic tests whether the queue matches how they actually prioritize callbacks. |
| 8:00-10:00 | Record outcome | Select a patient, set owner and outcome, and save. | Staff can record voicemail, spoke/scheduled, spoke/not scheduled, or no response. |
| 10:00-12:30 | CSV fit | Show the refreshed fake CSV preview. | 5 rows total: 3 importable, 1 duplicate, 1 date-format error. |
| 12:30-15:00 | Their data | Ask which columns their current export has and which fields staff actually maintains. | The call tests whether the workflow fits their current data, not an imagined clean dataset. |
| 15:00-19:00 | Decision questions | Ask whether the queue helps, who owns it, what is missing, what blocks a sanitized-data test, and whether a fake-data pilot is worth scheduling. | The result becomes `Go`, `Revise`, or `Stop`. |
| 19:00-20:00 | Close | Ask how they currently prevent follow-ups from falling through the cracks. | The next step is anchored to their actual answer. |

### Fake Queue Shown In The Walkthrough

The app's sample-data and reactivation logic produced this reset-demo queue for
the walkthrough:

| Queue | Count | Example Rows |
|---|---:|---|
| Overdue | 2 | Priya Patel, 15 days overdue, owner Doc, outcome Left Voicemail; Chris Miller, 10 days overdue, owner Front Desk, outcome Not Contacted |
| Due Today | 1 | Aisha Coleman, next reactivation date 2026-09-08, owner Doc, outcome Not Contacted |
| Upcoming | 1 | Ben Carter, next reactivation date 2026-09-18, owner Front Desk, outcome Spoke - Scheduled |

### Fake CSV Segment

`npm run demo:csv` regenerated `docs/NEW_PATIENT_IMPORT_DEMO.csv` with dates
relative to 2026-09-08.

Expected preview:

| Result | Count | Rows |
|---|---:|---|
| Importable | 3 | Dana Whitfield, Marcus Ellery, Sofia Nkemdirim |
| Duplicate | 1 | Aisha Coleman |
| Error | 1 | Tobias Renner, because `Last Visit Date` uses `MM/DD/YYYY` instead of `YYYY-MM-DD` |

The importable rows cover the three useful queue states:

| Patient | Expected Queue | Evidence |
|---|---|---|
| Dana Whitfield | Overdue | Monthly wellness patient, next reactivation date 2026-08-25, 14 days overdue |
| Marcus Ellery | Due Today | Monthly reactivation patient, next reactivation date 2026-09-08 |
| Sofia Nkemdirim | Upcoming | Massage therapy patient, next reactivation date 2026-09-15 |

### Validation Measures

| Measure | Internal Walkthrough Evidence | Result |
|---|---|---|
| Time to identify first overdue follow-up | The reset-demo queue immediately surfaces Priya Patel and Chris Miller as overdue. | `Go` |
| Staff can explain queue ownership | Owner fields are visible as Doc or Front Desk. Ownership is clear enough for validation. | `Go` |
| Required CSV fields are available | The fake import shows the required shape: patient, contact, service, source, patient type, last visit, frequency, owner, outcome, and notes. | `Go` with real-export confirmation needed |
| Missing workflow field or objection | The known objection remains: recording an outcome does not remove the patient from the reactivation list. The prepared response turns this into a validation question about filters, snooze, or attempt counters. | `Revise candidate` |
| Fake-data pilot decision | Product, demo data, and script are ready for a real validation call using only fake data. | `Go` |

### Board Decision

Recommendation: `Go` to manual client follow-up and fake-data validation.

Reasoning:

- The demo can show a real follow-up gap without using real patient data.
- The queue has all three important states: overdue, due today, and upcoming.
- The refreshed CSV demonstrates importable rows, duplicate protection, and
  validation errors.
- The strongest uncertainty is not technical. It is whether clinic staff want
  the reactivation list to hide, dim, filter, snooze, or retain already-called
  patients.

Next action:

Tobi manually reviews the existing threaded Gmail draft and decides whether to
send, edit, or hold it. If the clinic accepts, run the same 20-minute flow with
the clinic and record a customer-level `Go`, `Revise`, or `Stop`.
