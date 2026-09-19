# Schedule Intelligence Hypothesis

## Product boundary

CBOS will not become an appointment scheduler. The EHR or existing calendar remains the source of truth for appointments.

## Hypothesis

If CBOS can read a minimal appointment export, it can improve the daily action queue by identifying operational gaps without creating or editing appointments.

Candidate signals:

- cancelled appointment with no reschedule;
- overdue reactivation candidate who has no future appointment;
- follow-up due today with no scheduled appointment;
- open schedule capacity that could be paired with an existing reactivation list.

## Validation experiment

Interview at least two independent chiropractic practices. Show a static fake-data mock or table, not a built scheduler.

Ask each participant to rank the candidate signals, identify false positives, name the role that acts, and state what appointment fields are available from the current system.

## Success threshold

- Two independent practices identify the same signal as a weekly or daily problem.
- Each can name an owner and action.
- The required appointment information can be exported without clinical records.
- At least one practice says the signal would materially improve a paid pilot.

## Stop conditions

- The value requires two-way scheduling or appointment creation.
- Existing EHR reporting already solves the problem clearly.
- The export is unavailable or would create repeated manual entry.
- Staff cannot identify an owner or action.

Status: **YELLOW**. One chiropractor suggested schedule visibility; that is a hypothesis, not sufficient evidence to build.
