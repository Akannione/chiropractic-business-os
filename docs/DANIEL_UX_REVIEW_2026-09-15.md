# Daniel UX Review — 2026-09-15

## Purpose

Translate Daniel Ogundiran's live demo feedback into product decisions without allowing CBOS to drift into EHR functionality. Daniel is recorded as one independent UX reviewer; this document does not assume he is a chiropractor.

## Current-state comparison

| Feedback | Current-head assessment | Decision |
| --- | --- | --- |
| Use a left sidebar | Already resolved before this review was incorporated | Keep current sidebar |
| Navigation feels too flat/crowded | Still present | Group navigation by Act / Review / Tools and visually demote utility destinations |
| Export should be secondary | Still present | Rename to Import & Export and place under Tools |
| Muted gray text is hard to read | Still present in several shared styles | Increase secondary-text contrast while preserving hierarchy |
| Add Inquiry should not disrupt list context | Partially present / needs focused interaction design | Do not rush a modal refactor in this pass; validate current inquiry workspace after hierarchy changes |
| Search/filter should stay in context | Already resolved in current Patient Inquiries workspace | Keep |
| Landing page should immediately show what matters today | Already substantially resolved by Today command center | Strengthen action-first copy and make Today the clearest product identity |
| Add All Patients with treatment history | Scope drift | Reject |
| Add prescriptions / care plans | EHR / clinical scope drift | Reject |

## Product interpretation

The request for treatment history, prescriptions, and care plans is more useful as a differentiation signal than as a feature request. It indicates that the reviewed experience could be interpreted as a patient-management/EHR product. CBOS must instead make the first-screen mental model: **what needs attention, what is being missed, who should act, and what happens next.**

## Changes made in this branch

- Reframed the brand subtitle as `Practice action & intelligence`.
- Grouped navigation into `Act`, `Review`, and `Tools`.
- Kept `Today` first and primary.
- Moved administrative destinations into a visually secondary Tools group.
- Renamed `Exports` to `Import & Export` to reflect the actual workspace.
- Reframed the global product copy around attention, missed work, and next actions.
- Reframed Today as an `Action Command Center` and `What needs attention today`.
- Changed dashboard wording from generic treatment-value/dashboard language toward opportunity/action language without changing underlying deterministic calculations.
- Added an isolated pilot-readiness stylesheet to increase secondary-text contrast, clarify active navigation, and improve keyboard focus visibility.

## Explicitly not built

- Treatment history
- Prescriptions
- Care plans
- SOAP notes
- Clinical charting
- Full patient-record system
- Full scheduling/calendar replacement

Those belong to an EHR/practice-management system and conflict with CBOS's current product boundary.

## Validation after this change

During the next demo, do not explain CBOS first. Open Today and ask: **“What do you think this system does?”**

Pass if the reviewer independently describes CBOS as helping the practice identify work/opportunities needing attention, follow up, reactivate patients, or decide what to do next.

Fail if the reviewer primarily describes it as an EHR, patient-record system, reminder app, calendar, or generic CRM.
