# CBOS Validation System

## Evidence hierarchy

1. Paid use with measured behavior.
2. Task completion by an independent target user.
3. Direct statement from an independent target buyer.
4. De-identified source-system artifact or export.
5. Internal rehearsal or product-team opinion.

Higher levels may support stronger claims. Interest, politeness, and internal testing do not equal purchase validation.

## Experiment record

Every open assumption should have:

- hypothesis;
- riskiest unknown;
- participant and independence check;
- test task;
- measurement;
- pass/fail threshold defined before the test;
- observed evidence;
- decision: Go / Revise / Stop;
- next action, owner, and due date.

## Signal-counting rule

The private-clinic survey and dual-entry/integration text discussion are one Client 1 signal. The separate chiropractor who liked the interface and suggested calendar visibility is Client 2. Do not split one person's comments into multiple customers. Do not attribute MetaSoft usage to Client 1 unless identity is independently established.

## Core experiments

| Assumption | Test | Pass threshold | Current evidence |
| --- | --- | --- | --- |
| CBOS is understood as an action layer | 30-second comprehension test | 4 of 5 target users pass | Internal/UX review only |
| Daily queue solves a meaningful problem | Task-based clinic session | 3 practices identify real gap; 1 pays | Two qualitative signals |
| Data path avoids double entry | Inspect de-identified export | Stable identity and required fields | Import architecture only |
| Reactivation transitions match workflow | Outcome-by-outcome interview | 2 practices agree or pilot owner selects | Ambiguous |
| Schedule intelligence is valuable | Static concept test | 2 practices name same actionable signal | One suggestion |
| Price is acceptable | Ask for payment | 1 completed `$100` pilot | One `$50-$100/month` response |

## Weekly validation review

Review only new evidence. Update the relevant hypothesis document, `VALIDATION_RUNS.md`, and `PILOT_READINESS.md`. Do not change product behavior from a single ambiguous comment. Create an issue only when the evidence defines a bounded problem and acceptance criteria.
