# Clinic Walkthrough Rehearsal

Rehearsed: 2026-08-10
Against: local demo stack (`localhost:5173` / `localhost:4000`, `BUSINESS_OS_DEMO_MODE=true`) and the live production demo.
Purpose: dry-run `docs/DEMO_WALKTHROUGH.md` before the measured 20-minute clinic validation call.

No real or clinic-supplied data was used. All records are the seeded fake demo set.

## Verdict

The product holds up. Every screen the script visits renders, every endpoint returns 200, and there are no console errors. Three issues would cost credibility on the call, and one of them is a blocker.

## Resolved on 2026-08-10

The blocker and the CSV gap below were both fixed after the rehearsal. They are kept here as the record of what was found and why the fixes exist.

* Production demo data was reset. The queue now reads Overdue 2 / Due Today 1 / Upcoming 1, with 15- and 10-day overdue values instead of 30-55. A pre-reset backup of the 8 production rows was exported first.
* `docs/NEW_PATIENT_IMPORT_DEMO.csv` was added and now generates from `npm run demo:csv`, so its dates never rot. It previews as 3 importable, 1 duplicate, 1 error, and a real import was verified end to end against the local stack.

* The summary pluralization and the clipped dashboard panel were both fixed. Weekly and monthly summaries now read "1 active patient" and "1 inquiry needs follow-up", covered by tests. The dashboard's Recent Patient Inquiries panel carries three columns at fixed widths and no longer renders wider than its container; the follow-up workflow rows now wrap their buttons instead of overflowing.

Still open: the outcome-does-not-clear-the-queue conversation and the untimed spoken pass.

## Blocker

### Production demo data is stale — two of three queue tiles are empty

`https://cbos-api.vercel.app/api/reactivations` currently returns:

| Queue | Production | Local | Fresh seed |
|---|---|---|---|
| Overdue | 4 | 5 | 2 |
| Due Today | **0** | 1 | 1 |
| Upcoming | **0** | 1 | 1 |

Minutes 3-10 of the script says "Show only: overdue, due-today, and upcoming counts." On production, two of those three tiles read zero and every remaining record is 30-55 days overdue. The core narrative — *we tell you who is due back today and who is coming up* — cannot be shown on the URL that is in the invite.

Cause: the production database was seeded roughly two months ago. `backend/src/data/sampleData.ts` builds dates as **relative offsets** from `Date.now()`, so the seed itself is correct; the stored rows simply aged. Records drifted out of Due Today and Upcoming and piled into Overdue.

Fix: run "Reset demo data" against production before the call. That restores Overdue 2 / Due Today 1 / Upcoming 1. This resets the production demo database and was **not** performed during this rehearsal — it needs an explicit go-ahead.

Re-check the three counts immediately before the call. This will drift again.

## Credibility risks

### Recording an outcome does not clear the patient from the call list

Selected Casey Howard, set owner to `Doc` and outcome to `Spoke - Scheduled`, saved. The write persisted correctly, but the row stayed in the Overdue queue at 31 days overdue and the Overdue count stayed at 5.

This is by design and is documented in `docs/ANALYTICS_CONTRACT.md`: queue membership derives only from `last_visit_date + expected_visit_frequency_days`, with `Lost` and `Dead Lead` excluded. `follow_up_outcome` is carried but never consulted (`backend/src/services/reactivationService.ts:76`).

The problem is the script's step 5 promise: "The front desk can work the list and record whether they left a voicemail, spoke with the patient, or scheduled the next visit." A front desk that works the list all morning sees the overdue count unchanged. Expect: *"So how does my staff know who they already called?"*

Have an answer ready. The honest one is that outcome is a record of contact, not a state change, and the patient leaves the queue when their next visit is logged — which is a deliberate choice to avoid CBOS drifting into being a scheduler. If the clinic says that is wrong, that is exactly the kind of Revise signal the call exists to surface.

### The demo CSV imports zero rows

`POST /api/imports/inquiries.csv/preview` with `docs/METASOFT_REACTIVATION_DEMO.csv` returns:

```json
{"totalRows": 5, "importableRows": 0, "duplicateRows": 5, "errorRows": 0}
```

All five rows already exist in the seeded demo data, so every one is flagged as a duplicate. Minutes 10-15 works fine as an *explanation* of preview, mapping, and duplicate checks — the duplicate-blocking story is genuinely strong — but if the clinic says "go ahead and import it," nothing happens.

Prepare a second small CSV of 2-3 net-new fake patients so both halves can be shown: duplicates blocked, and a clean import succeeding.

Separately, the demo CSV's `Last Visit Date` values are hardcoded (2026-04-15 through 2026-06-10). Against today they produce 52-87 day overdue rows, which reads as neglect rather than a realistic recall list. Regenerating them relative to the call date would help.

## Polish

| Item | Detail | Status |
|---|---|---|
| Copy bug | Weekly Summary reads "1 active patients" | Fixed |
| Table clipping | At 1280px the dashboard's Recent Patient Inquiries table renders 595px of content in a 286px box. No page-level horizontal overflow, but the panel is visibly chopped on a screen share | Fixed |
| Owner field | Follow-Up Owner is free text while the filter above it is a dropdown built from existing values; a typo silently fragments filtering | Open |
| Row affordance | Call List rows are clickable (`cursor: pointer`) but nothing signals it; the script should say "click the patient's row" | Open |

## Confirmed working

- Timing filter: All / Overdue / Due Today / Upcoming, correct counts
- Owner filter, and both filters combined (Overdue + Front Desk returned the correct 3 rows)
- Sort order: overdue first, most overdue first, then due today, then upcoming
- Row selection binds the follow-up editor to the chosen patient
- Save persists to the database and updates the table immediately
- Exclusion rules: Jordan Lee (`Lost` / `Dead Lead`) correctly absent from the queue
- Source tracking: `/intake?source=Google` renders "Source: Google"
- Public intake, Weekly Summary, Exports, and the CSV column-mapping reference all render
- `/api/inquiries`, `/activities`, `/weekly-summary`, `/monthly-summary`, `/exports/inquiries.csv`: all 200
- No browser console errors across the walked screens
- `authEnabled: false` on both local and production, so there is no login gate mid-demo

## Timing

Analysed on 2026-08-11. The 20-minute budget does not hold as written: delivered top to bottom the walkthrough runs about 30 minutes, because it contains two overlapping scripts — the 20-Minute Validation Plan and a separate eight-section product tour. Cutting five tour sections brings it to 15.5 minutes with 4.5 minutes of slack. `docs/CALL_RUN_SHEET.md` carries the clock, the cut list, and the overrun order.

Production latency is not a risk: 1.3 s on a cold first request, then about 0.15 s across every endpoint.

Still not done: an actual out-loud read. The clock marks are modelled from word counts and per-screen floors, not stopwatched. Read the Opening and the Reactivations segment aloud once against a timer.

## Pre-call checklist

1. ~~Reset demo data on production~~ — done 2026-08-10. **Re-check on the day of the call**; the queue drifts as records age.
2. ~~Build a net-new CSV so a successful import can be shown~~ — done, `docs/NEW_PATIENT_IMPORT_DEMO.csv`.
3. Run `npm run demo:csv` on the morning of the call to refresh the CSV dates.
4. ~~Prepare the answer for "how do I know who was already called?"~~ — done, `docs/OBJECTION_ALREADY_CALLED.md`.
5. ~~Fix the "1 active patients" string~~ — done, with test coverage.
6. Read the Opening and Reactivations segments aloud once against a timer. Everything else about the clock is in `docs/CALL_RUN_SHEET.md`.
