# 20-Minute Call Run Sheet

Prepared 2026-08-11. Keep this open on a second screen during the call.

## The problem this fixes

`docs/DEMO_WALKTHROUGH.md` contains two scripts that overlap: the 20-Minute Validation Plan, and a separate eight-section Demo Flow that tours every screen. Delivered top to bottom, the document runs about **30 minutes against a 20-minute promise** — roughly 50% over.

| | Minutes |
|---|---|
| Demo delivery, all eight sections | 20.8 |
| Clinic dialogue (minutes 0-3 and 15-20) | 8.0 |
| Two objections answered | 1.0 |
| **Total top to bottom** | **29.8** |
| **Focused plan below** | **15.5** |

The fix is not to talk faster. It is to cut five of the eight tour sections, which the 20-Minute Validation Plan already implies but never says.

## Cut before the call

Do not open these screens. Each is a complete section of the Demo Flow that the validation plan does not need:

* Section 1, Dashboard
* Section 2, Patient Inquiries
* Section 4, Follow-Up Workflow
* Section 6, Public Intake
* Section 7, Weekly Summary

That removes about 8 minutes. Section 3, "Who inputs the information", is 128 words and the longest single block in the document — hold it in reserve and deliver it only if he asks who does the data entry.

Keep only **Section 5, Reactivations** and **Section 8, Exports**. Those are the two the plan is built on.

## Clock

Times are elapsed from the start of the call.

| Clock | Segment | Do |
|---|---|---|
| 0:00 | Opening | The two Opening Script paragraphs. Do not add the "Why This Is Useful" block yet. |
| 0:45 | Current workflow | The three questions from minutes 0-3. **Stop talking.** This is his segment; the longer he talks here, the better the call is going. |
| 4:00 | Reactivations | Overdue / Due Today / Upcoming counts, timing and owner filters, the prioritised call list, owner and outcome. |
| 6:00 | Hand him the wheel | "Which of these would you call first, and why?" Let him answer before moving on. |
| 8:00 | Record an outcome | Select a patient, set owner and outcome, save. Expect the "who did we already call" question here — see `docs/OBJECTION_ALREADY_CALLED.md`. |
| 10:00 | CSV fit | `docs/NEW_PATIENT_IMPORT_DEMO.csv`. Preview first: 3 importable, 1 duplicate, 1 error. Then import. |
| 12:30 | Their data | Which columns does their export have, which fields does staff actually maintain. |
| 15:00 | Decision questions | The five questions from minutes 15-20. |
| 19:00 | Close | The Best Closing Question, then stop. |

That leaves roughly 4.5 minutes of slack against the 20. Slack is not spare time to fill — it absorbs his questions, which are the point of the call.

## If you are behind

Cut in this order, and do not improvise a replacement:

1. Drop the import execution at 10:00. Show the preview only and say the import completes from there.
2. Drop the "their data" segment at 12:30. Ask it in the follow-up email instead.
3. Cut the decision questions from five to three: would this make follow-up easier to see, who would own the queue, is a fake-data pilot worth scheduling.

Never cut the decision questions entirely. They are the only part that produces the Go / Revise / Stop outcome, which is the reason the call exists.

## If you are ahead

Do not add screens. Ask better questions instead:

> Walk me through what happens today when someone doesn't show up for six weeks.

## Two minutes before the call

```bash
cd "/Users/tobiloba202/Developer/New project/business_os_mvp" && npm run demo:csv
```

Then, in order:

1. Open `https://frontend-gold-alpha-31.vercel.app` and confirm Overdue, Due Today, and Upcoming are all non-zero. If Due Today is zero, reset the demo data and re-check. The queue drifts as records age.
2. Load the page once to warm the API. First request measured at 1.3 s cold, then about 0.15 s. Warm it so the first click of the call is not the slow one.
3. Have `docs/NEW_PATIENT_IMPORT_DEMO.csv` already open in a Finder window.
4. Have `docs/OBJECTION_ALREADY_CALLED.md` open on the second screen.

## Honest limits of this sheet

The clock marks are modelled, not stopwatched: scripted speech counted at 140 words per minute, each screen given a 1.5 minute floor for navigation and for the clinician actually looking at it, plus measured interaction time. Only the production latency figures are measured directly.

Delivery, pauses, and how much he talks are not predictable from a document. Read the Opening and the Reactivations segment out loud once against a timer before the call. If the opening runs past 45 seconds, cut the second paragraph.
