# CBOS Pilot FAQ

## Is CBOS an EHR?

No. CBOS does not store clinical charts, SOAP notes, diagnoses, treatment plans, prescriptions, billing, insurance claims, or complete appointment records. It is an operational follow-up and practice-intelligence layer beside the systems the clinic already uses.

## Will staff enter everything twice?

That is not the intended workflow. The pilot tests intake, CSV import, and available export fields to determine the smallest reliable data path. If CBOS would require ongoing duplicate entry of the same information, the pilot should stop or be redesigned.

## Does CBOS schedule appointments?

No. Staff may record that a consultation was scheduled, but the existing scheduling system remains the source of truth. Read-only schedule intelligence is only a hypothesis and has not been built.

## Can we use real patient data?

Not during the current initial pilot readiness state. Use fake data, or approved de-identified data only after the checklist in `REAL_DATA_READINESS.md` is completed. No HIPAA compliance claim is being made.

## What does the $100 include?

Thirty days, one workspace, one onboarding session, pilot configuration, fake or approved de-identified import, a midpoint check-in, and an end-of-pilot review.

## What happens after 30 days?

The practice chooses Continue, Revise, or Stop. The current pricing hypothesis for continuing is `$99/month`; it remains subject to real customer validation.

## What if our current system already does this?

Use it. CBOS is valuable only if it makes important follow-up and reactivation work easier to see and complete. The pilot is designed to test that honestly.

## Does CBOS guarantee more revenue or saved time?

No. Any ROI or time-saving example is an estimate. Results depend on inquiry volume, staff use, current workflow, and patient decisions.

## Who owns the data?

The practice controls its approved pilot data and can export it. Data handling, retention, support access, and deletion expectations must be agreed before any non-fake dataset is used.
