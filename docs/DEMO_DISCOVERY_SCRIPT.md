# Demo and Discovery Script

## Opening

> CBOS is not an EHR or scheduling replacement. It is a small action layer that helps a practice see which inquiries and reactivation opportunities need attention, who owns the next step, and what happened. I would like to understand your current process first, then let you try it with fake data.

## Discovery questions

1. How do new patient inquiries arrive today?
2. Where are they recorded?
3. Who decides which person gets called first?
4. How do you know when a follow-up is overdue?
5. How do you identify existing patients who may need reactivation?
6. Which reports or exports can your current system produce?
7. Which information would staff refuse to enter twice?
8. What numbers does the owner review each week?

## Hand-the-wheel demo

1. Open `Today` and ask, “What do you think this page is for?”
2. Ask the participant to select the first item they would handle.
3. Ask them to open the detail, record an outcome, and choose the next action.
4. Open Reactivations and ask what should happen to rows after each outcome.
5. Show CSV preview and ask which columns their current export includes.
6. Open Weekly Review and ask which metric would change a decision.

## Close

Ask:

- Would this improve visibility compared with your current process?
- Who would own it each day?
- What would block a 30-day controlled pilot?
- Would you pay `$100` to test it using fake or approved de-identified data?

Then stop talking. Record the exact answer.

## Honest responses

**“Our EHR already does this.”** Ask them to show or describe the daily workflow. If it is trusted and consistently used, CBOS may not be a fit.

**“We cannot enter things twice.”** Agree. The pilot should prove an import or intake path that avoids duplicate daily maintenance; otherwise stop.

**“Is it HIPAA compliant?”** Do not claim that it is. The current controlled pilot uses fake or approved de-identified data, and real-data use is blocked pending formal review.

**“Will this make us more money?”** It may help the team act consistently on existing opportunities, but results are not guaranteed. The pilot measures actual workflow use and outcomes.

## Founder-only pre-owner walkthrough (October 2026)

Use the localhost synthetic demo; do not enter real patient data. This is a rehearsal, **not validation by a chiropractor or clinic owner**.

1. **Today, without explanation (30 seconds):** Which person needs follow-up first? Can you distinguish overdue versus due today? Confirm the queue shows oldest overdue dates first. The Opportunity amount is an estimate for eligible inquiries, not revenue recovered from the queue.
2. **Inquiry workflow (60 seconds):** Find a fictional inquiry and identify where its status and next follow-up are edited. Do not use a real name or phone number.
3. **Reactivations (45 seconds):** Identify the overdue callback list and where to record an outcome. Marking a status does not book an appointment.
4. **Owner Review (30 seconds):** Identify one overdue task and one weekly metric that would influence a decision. Expand the optional review checklist only if needed.
5. **Product boundary (15 seconds):** Verify a viewer would not mistake CBOS for an EHR, billing/claims platform, scheduler, clinical charting system, or PHI-ready service.

Score each step **clear**, **hesitation**, or **blocked**. Record the specific screen, visible wording, and reason for hesitation. Do not mark VAL-003–VAL-007 resolved using this rehearsal. When a first owner is available, repeat without coaching and capture actual feedback rather than assuming the founder's result generalizes.
