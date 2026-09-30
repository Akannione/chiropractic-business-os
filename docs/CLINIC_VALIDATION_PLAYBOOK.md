# Clinic Validation Playbook

## Purpose

Test whether CBOS solves a real operational problem before expanding the product. Use fake data first. A de-identified export may be used only after the real-data gate in `REAL_DATA_READINESS.md` is satisfied.

## 20-30 minute protocol

| Time | Task | Measure |
| --- | --- | --- |
| 0-3 min | Ask how inquiries arrive, where they are recorded, and who owns follow-up. | Current workflow and real pain, in their words |
| 3-5 min | Open `Today` without explanation and run the 30-second comprehension test. | First sentence, pass/fail, confusion |
| 5-10 min | Ask the participant to find the first person they would contact and explain why. | Time to first action and prioritization fit |
| 10-14 min | Ask them to record an outcome and set the next action. | Completion, hesitation, missing fields |
| 14-18 min | Show Reactivations and ask what should happen after each outcome. | Hide, retain, snooze, resolve, or resurface rule |
| 18-22 min | Show CSV preview with valid, duplicate, and invalid rows. | Available export fields and correction burden |
| 22-25 min | Show Weekly Review. Ask which numbers they would actually discuss. | Useful, missing, or misleading metrics |
| 25-30 min | Ask decision questions. | Go / Revise / Stop |

Do not lead with features or persuade during the task. Ask the participant to think aloud.

## Required decision questions

1. Would this make follow-up easier to see than your current process?
2. Who would own this queue each day?
3. Which information would have to come from your current system automatically?
4. What should happen after a call, text, email, scheduled appointment, decline, or no answer?
5. Would you pay for a 30-day controlled pilot using fake or approved de-identified data? Why or why not?

## Pass thresholds

- Comprehension: participant identifies the action/follow-up purpose within 30 seconds.
- First action: participant identifies the highest-priority row within 60 seconds.
- Workflow: participant records an outcome without assistance in 2 minutes.
- Ownership: practice names one role responsible for daily review.
- Data fit: an existing export contains enough fields to avoid duplicate daily entry, or a feasible adapter is identified.
- Commercial signal: the decision maker agrees to a paid pilot or gives a specific, testable reason for declining.

## Validation record

Copy this block into `docs/VALIDATION_RUNS.md` after each session. Use a clinic alias; never include patient data.

```markdown
## YYYY-MM-DD - Clinic Alias

- Participant role:
- Current tools:
- Data used: fake / approved de-identified
- 30-second description (exact words):
- Comprehension: Pass / Fail
- Time to first priority:
- Outcome task completed without help: Yes / No
- Daily queue owner:
- Reactivation behavior requested:
- Required source fields:
- Most useful screen:
- Most confusing screen:
- Willingness to pay and price reaction:
- Decision: Go / Revise / Stop
- Evidence still missing:
- Next action and owner:
```

## Evidence rule

Internal rehearsals prove usability of the demo, not customer demand. One person who reviews multiple artifacts is one signal, not multiple customers.
