# Clinic Pilot Onboarding

## Before Day 1

- Confirm signed pilot scope and payment.
- Name the clinic decision maker and daily workflow owner.
- Confirm fake data is the default.
- If de-identified data is proposed, complete `REAL_DATA_READINESS.md` first.
- Confirm CBOS will not replace the EHR, scheduler, billing, insurance, or clinical workflow.

## Day 1 - Workflow mapping

- Map inquiry sources and current handoffs.
- Define who checks `Today` and when.
- Define what each current status means.
- Review reactivation outcomes without changing ambiguous queue behavior.
- Record baseline measures from `PILOT_SUCCESS_SCORECARD.md`.

## Day 2 - Configuration and data

- Configure approved sources, services, practice timezone, and staff access.
- Load fake data or preview the approved de-identified CSV.
- Review duplicates, rejected rows, and field mappings before import.
- Confirm no clinical notes, balances, insurance, diagnosis, or treatment details are present.

## Day 3 - 30-minute staff training

1. Sign in and explain access boundaries.
2. Find the highest-priority item on `Today`.
3. Open the inquiry detail panel.
4. Record status, owner, outcome, and next action.
5. Review Reactivations.
6. Complete the Weekly Review.
7. Export approved operational data.
8. Explain how to report a problem.

Each participant completes one task without coaching.

## Day 4 - Go live for the controlled pilot

- Verify health, login, configuration, demo mode, and approved dataset.
- Confirm the daily owner can complete the workflow.
- Record starting counts and known limitations.
- Schedule midpoint and day-30 reviews.

## Support and escalation

- Workflow question: document it for the midpoint review.
- Incorrect or duplicate data: stop the import/update and preserve evidence.
- Login/security concern: rotate credentials and pause access.
- Possible real patient-data exposure: stop processing and escalate; do not copy the data into tickets, chat, or screenshots.

## Handoff acceptance

Onboarding is complete only when the owner can identify today's first action, staff can record an outcome, the approved data path is understood, and all parties understand what CBOS does not do.
