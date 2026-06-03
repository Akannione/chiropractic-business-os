# Chiropractic Prospect Tracker Guide

Use `chiropractic_prospect_tracker.xlsx` to manage up to 100 chiropractic prospects before outreach begins. This is an operating document for sales execution only. It does not change the app, database schema, pricing, deployment logic, or product features.

## How To Use The Tracker

1. Add one chiropractic practice per row in the `Prospects` sheet.
2. Keep `Prospect ID` unique, using the default `CHIRO-001` style IDs.
3. Fill in contact details before outreach where available.
4. Update `Outreach Status` after every message, call, or follow-up.
5. Update `Pipeline Stage` only when the prospect actually moves forward.
6. Log objections and the response used immediately after calls or replies.
7. Use `Next Follow-Up Date` to keep outreach from going stale.
8. Review the `Metrics` sheet weekly.

## Status Definitions

### Outreach Status

- `Not Contacted`: prospect has not received outreach yet.
- `Email Sent`: initial or follow-up email sent.
- `Called`: phone call attempted or completed.
- `LinkedIn Sent`: LinkedIn message sent.
- `Facebook Sent`: Facebook message sent.
- `Follow-Up Sent`: follow-up sent after initial outreach.
- `Replied`: prospect responded.
- `No Response`: no reply after appropriate follow-up.
- `Do Not Contact`: prospect should not be contacted again.

### Follow-Up Status

- `None`: no follow-up currently scheduled.
- `Due Today`: follow-up should happen today.
- `Scheduled`: follow-up is scheduled for a future date.
- `Overdue`: follow-up date has passed.
- `Completed`: follow-up was completed.
- `Waiting on Prospect`: prospect needs to respond before the next action.

### Demo Status

- `Not Scheduled`: no demo is booked.
- `Scheduled`: demo is booked.
- `Completed`: demo happened.
- `No-Show`: prospect did not attend.
- `Reschedule Needed`: demo needs a new time.

### Proposal Status

- `Not Sent`: no proposal has been sent.
- `Sent`: proposal has been sent.
- `Viewed/Opened`: prospect viewed or acknowledged it.
- `Questions Asked`: prospect asked follow-up questions.
- `Negotiating`: prospect is discussing terms, timing, or scope.
- `Accepted`: proposal accepted.
- `Declined`: proposal declined.

## Pipeline Stage Definitions

- `Lead`: practice has been identified.
- `Contacted`: initial outreach happened.
- `Engaged`: prospect replied or showed interest.
- `Demo Scheduled`: demo is booked.
- `Demo Completed`: demo happened.
- `Proposal Sent`: proposal or paid pilot scope was sent.
- `Negotiating`: prospect is considering terms or scope.
- `Closed Won`: prospect agreed to move forward.
- `Closed Lost`: prospect declined or is no longer a fit.

## Weekly Review Process

Review the tracker once per week:

1. Count new prospects added.
2. Review prospects contacted.
3. Review replies and demos booked.
4. Review follow-ups due this week.
5. Review proposals sent and decisions pending.
6. Log common objections.
7. Note which responses worked.
8. Update priorities for the next week.

Use `PROJECT_OS/outreach/weekly_outreach_review.md` for the written weekly review.

## Qualification Scorecard

Use `PROJECT_OS/prospect_management/qualification_scorecard.md` to prioritize the 100 chiropractic practices in the tracker.

Recommended workflow:

1. Score each prospect before outreach using public information where available.
2. Enter the score in the tracker notes if there is no dedicated score column.
3. Prioritize `Ideal Prospect` and `Strong Prospect` practices for calls, demos, and follow-ups.
4. Re-score the prospect after a discovery call using what you learned about inquiry volume, tracking method, follow-up process, reporting maturity, and openness to technology.
5. Log red flags in `Notes` and objections in `Objection`.

Qualification thresholds:

- 80-100: Ideal Prospect
- 65-79: Strong Prospect
- 50-64: Possible Fit
- Below 50: Low Priority

## Tier Assignment Process

Use `PROJECT_OS/prospect_management/targeting_framework.md` to convert qualification scores into outreach tiers:

- Tier 1: Score 80-100.
- Tier 2: Score 65-79.
- Tier 3: Score 50-64.

Record the tier in `Notes` if the workbook does not have a dedicated tier column. Tier 1 prospects should receive the most direct outreach and fastest follow-up.

## Re-Scoring Process

Re-score a prospect after every useful discovery call or reply.

Update the score when you learn more about:

- monthly inquiry volume
- current tracking method
- follow-up process
- reporting process
- decision-maker clarity
- technology openness

If a prospect moves up or down a tier, update `Priority`, `Pipeline Stage`, and `Next Follow-Up Date`.

## Priority Ordering Process

Use this order for June 15 outreach:

1. Tier 1 prospects with clear owner or office-manager contact info.
2. Tier 1 prospects with strong website or Google activity but weaker contact info.
3. Tier 2 prospects with obvious follow-up or spreadsheet pain.
4. Tier 2 prospects with good inquiry signals but unknown decision-maker.
5. Tier 3 prospects only if they have an unusually strong signal or respond positively.

Do not over-prioritize low-scoring prospects just because they are easy to contact.

## Pipeline Metric Formulas

The `Metrics` sheet includes formulas/placeholders for:

- `Total Prospects`: practices entered in the tracker.
- `Prospects Contacted`: prospects with outreach activity beyond `Not Contacted`.
- `Replies Received`: prospects marked `Replied`.
- `Demos Booked`: demos scheduled, completed, no-showed, or needing reschedule.
- `Demos Completed`: demos marked `Completed`.
- `Proposals Sent`: proposals with a status beyond `Not Sent`.
- `Closed Won`: prospects marked `Won`.
- `Closed Lost`: prospects marked `Lost`.
- `Outreach Volume`: same as prospects contacted.
- `Reply Rate`: replies divided by prospects contacted.
- `Demo Booking Rate`: demos booked divided by prospects contacted.
- `Demo Completion Rate`: demos completed divided by demos booked.
- `Proposal Rate`: proposals sent divided by demos completed.
- `Close Rate`: closed won divided by proposals sent.
- `Average Deal Value`: average estimated deal value for won prospects.
- `Pipeline Value`: estimated deal value for open prospects.
- `Lost Deal Rate`: closed lost divided by all closed outcomes.
- `Follow-Up Completion Rate`: completed follow-ups divided by all logged follow-up statuses except `None`.

## Rules For Logging Objections

- Log the prospect's exact objection in `Objection`.
- Record the response used in `Response Used`.
- Do not soften serious concerns like privacy, HIPAA, timing, or tool overlap.
- If the same objection appears repeatedly, update `sales_assets/objection_handling.md`.
- If a request sounds like a feature, log it in `FEATURE_REQUESTS.md` before promising anything.

## Rules For Follow-Ups

- Every contacted prospect should have either a `Next Follow-Up Date` or a clear reason for no follow-up.
- Do not leave interested prospects in `Waiting on Prospect` indefinitely.
- Move overdue items to the next weekly review.
- Use `Priority` to decide who gets contacted first.
