# Objection: "How do I know who my staff already called?"

Prepared 2026-08-11 for the measured clinic validation call.

This is the question most likely to expose a real gap, because the honest answer is partly "it doesn't do that." Read the mechanics below before the call so the answer is accurate rather than improvised.

## What the software actually does

Verified against the running app, not assumed.

**The Reactivations call list does not shrink as you work it.** Queue membership is derived only from `last_visit_date + expected_visit_frequency_days`, with `Lost` and `Dead Lead` excluded. Recording an outcome does not change it. A patient marked `Spoke - Scheduled` stays in the Overdue queue at the same day count, and the Overdue tile does not tick down.

**The Follow-Up Outcome is recorded and visible per patient.** Every row in the call list carries an Outcome column: `Not Contacted`, `Left Voicemail`, `Spoke - Scheduled`, `Spoke - Not Scheduled`, `No Response`. So the information is there, on screen, next to the name.

**There is no filter or sort by outcome.** The call list filters by timing and by follow-up owner only. Staff cannot hide the patients they have already worked.

**The dashboard's Today's Follow-Up Workflow does shrink.** That list is driven by `next_follow_up_date`, and it clears as staff work it. The "Tomorrow" button pushes a patient to tomorrow's list and they leave today's.

So there are two lists doing two different jobs:

| | Reactivations call list | Today's Follow-Up Workflow |
|---|---|---|
| Answers | Who is overdue to come back | Who do I need to touch today |
| Driven by | Last visit date + expected frequency | Next follow-up date |
| Shrinks as you work it | No | Yes |
| Clears when | The patient is actually seen | You set the next follow-up date |

## The answer to give

> The outcome is recorded against each patient, so the call list shows who was contacted and what happened — voicemail, spoke and scheduled, spoke and didn't schedule, no response.
>
> What it deliberately does not do is remove them from the reactivation list. That list answers "who is overdue to come back," not "who have we phoned." A patient who is six weeks overdue is still six weeks overdue after a voicemail. They leave that list when they're actually seen and the visit date updates.
>
> The list that does clear as your staff work it is the daily follow-up view on the dashboard. When the front desk records the outcome and sets the next follow-up date, that patient moves off today's list and onto that date.

Then hand the question back, because this is a validation call:

> That is the design decision I am least sure about. Would your front desk want the reactivation list itself to hide people they have already tried this week?

## If they say it is a problem

Do not promise a build on the call. Capture which of these they describe, because they are different features:

* **"I just don't want to re-read the same names."** Wants a filter or a visual dim on already-contacted rows. Smallest change; the data already exists.
* **"I want to try them again in a few days, not today."** Wants a snooze. `next_follow_up_date` already exists on the record and is editable from the reactivation form; it just doesn't affect this queue yet.
* **"I want to know we tried three times and stop."** Wants an attempt counter and a give-up rule. Biggest change, and it needs a policy decision from the practice about when a patient becomes a dead lead.

Record which one, verbatim, in the walkthrough measures table.

## What not to say

* Do not claim the list updates when staff work it. It does not, and he may click into it.
* Do not promise a specific fix, timeline, or that it is "easy."
* Do not describe this as a bug. It is a deliberate choice with a real trade-off: the moment "we called them" removes a patient from a recall list, the list stops reflecting who actually needs care and starts reflecting who the front desk has had time to phone. Those drift apart quickly.

## If he pushes on why it works that way

> Because the alternative quietly hides people. If a voicemail moves someone off the list, then a patient nobody ever reached looks handled. I would rather the list stay honest about who is still not back, and let the daily follow-up view track the phone work.

That is a defensible position, but it is a position, not a fact. If the clinic disagrees, that is a Revise signal and is exactly what the walkthrough is for.
