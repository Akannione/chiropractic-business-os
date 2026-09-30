# Reactivation Policy

## Purpose

Define reactivation as an operational state machine while preserving the current deterministic eligibility calculation.

## Eligibility

A record is eligible when:

- it has a valid last visit date;
- it has a positive expected visit frequency;
- the calculated next reactivation date is due or approaching;
- status is not `Lost`;
- patient type is not `Dead Lead`.

## Proposed state machine

```text
Candidate
  -> Contact Attempt
  -> Waiting / Follow-Up
  -> Scheduled / Resolved
  -> Declined / Suppressed
```

| State | Meaning | Candidate deterministic signal |
| --- | --- | --- |
| Candidate | Due and no documented attempt | `Not Contacted` |
| Contact Attempt | Staff attempted contact | `Left Voicemail` or `No Response` |
| Waiting / Follow-Up | Conversation occurred but another action is required | `Spoke - Not Scheduled` plus a next follow-up date |
| Scheduled / Resolved | Appointment was scheduled | `Spoke - Scheduled` and/or scheduled appointment status |
| Declined / Suppressed | Person declined or should not be contacted | No approved existing value yet |

## Decision for the current pilot

Do not silently remove rows based only on a recorded outcome. The current schema does not distinguish a completed call from a durable suppression, and the two known clinic signals do not establish whether staff expect contacted rows to hide, dim, snooze, or remain visible.

The current queue logic therefore stays unchanged. This is a deliberate, safe decision rather than an implementation omission.

## Validation questions

For each available outcome, ask:

1. Should the row leave today's action queue immediately?
2. Should it remain visible but look completed?
3. When should it return?
4. Does a scheduled appointment resolve it, or should it remain until the visit occurs?
5. Which action must never happen automatically?

## Decision threshold

Implement a transition only when two independent practices agree on the behavior or a paid pilot owner explicitly selects it for that pilot. Add tests for every implemented transition before release.

GitHub tracking: issue `#3` is the live reactivation behavior issue.

Status: **YELLOW**. Eligibility is deterministic and tested; post-contact transitions require external validation.
