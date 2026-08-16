# Duplicate Policy And Unique Index Audit

Audited: 2026-08-14. Run the audit yourself with `npm run audit:duplicates`.

## Decision

**Do not put a unique index on `email` or `phone`.** Both fields are indexed
for lookup speed and will stay non-unique.

The data would allow it. The domain would not.

## What the audit found

Neither deployment currently violates a unique constraint:

| Database | Records | Colliding emails | Colliding phones |
|---|---|---|---|
| Local demo | 13 | 0 | 0 |
| Production | 8 | 0 | 0 |

That is 21 fabricated records, which says nothing about whether the constraint
is *correct*. The domain question decides it, and the answer is no.

## Why a unique index is wrong here

Households share contact details. A parent books for two children on one phone
number and one email address. Spouses share an address. A caregiver's number
sits on several patients. This is ordinary for a chiropractic practice, not an
edge case.

A unique index would turn entering the second family member into a hard
failure. On the public intake form that means a real patient is refused with a
server error, and nothing records that they tried.

## The bug the audit uncovered

Duplicate detection matched on **email or phone alone**, which treated a
household as a single patient. Previewing three real Alvarez family members
sharing one phone and one address produced:

```
importable: 1   duplicates: 2
  Maria Alvarez -> duplicate = false
  Diego Alvarez -> duplicate = true
  Sofia Alvarez -> duplicate = true
```

Two real patients were silently discarded. A clinic importing its history would
have lost family members with no error and no record, and would only discover
it when those patients never appeared on a recall list.

Detection now requires the **patient name and a contact detail** to match.
After the fix the same file previews as three importable rows, while genuine
repeats are still caught: re-importing patients already on file, the same
person listed twice with differently formatted numbers, and a name match on
phone where the email differs.

The rule deliberately fails open. A patient recorded under two spellings will
import twice, which staff can see and merge. The previous rule failed closed
and lost patients invisibly, which is the worse error for a system whose
purpose is making sure nobody is forgotten.

## Known limits

* **Name spelling defeats it.** "Bob Smith" and "Robert Smith" at one address
  import as two records. Accepted, per the fail-open reasoning.
* **Only the CSV import checks at all.** `POST /api/inquiries` and the public
  intake form create records without any duplicate check, so a patient who
  submits the form twice produces two records. Intake should probably stay
  permissive rather than reject a patient mid-form, but staff currently have no
  merge tool, which is the real gap.
* ~~**No merge feature.**~~ Added 2026-08-16. See below.

## Merging

The Duplicates screen lists groups that share a name and a contact detail, the
same rule the import uses, so a household never appears there. Staff pick the
record to keep and the others are folded into it.

Field rules, chosen so a merge cannot quietly lose information:

| Field | Rule | Why |
|---|---|---|
| Any blank field on the kept record | Filled from the other record | A merge should only ever add detail |
| Status | Whichever got further | A record showing the patient converted must not be discarded by one that says "New Inquiry" |
| Estimated value | The higher figure | Summing two estimates for one patient would inflate pipeline revenue |
| Notes | Both kept, separated by a blank line | Staff notes are the least recoverable field |
| Created date | The earlier one | When the practice first heard from this patient |
| Last visit | The later one | The reactivation queue must reflect the most recent visit |
| Next follow-up | The earlier one | Keeps the most urgent callback |

The discarded record's activity history is repointed to the survivor rather
than deleted, and the merge itself is logged, so the trail stays intact.

Merging is deliberate and confirmed in the interface. Nothing merges
automatically, because an incorrect merge cannot be undone.

## If a unique constraint is ever wanted

The defensible shape is a compound index on normalised name plus a contact
detail, not a contact detail alone. It would still need this audit re-run
against live data first, and it would still convert a silent skip into a hard
write failure, so the intake path would need to handle that error before the
index is added.
