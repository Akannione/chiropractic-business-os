# Project Status

## Project Purpose

Full-stack CBOS for small chiropractic practices to capture patient inquiries, track follow-ups and patient reactivations, review practice KPIs, import/export CSV data, and support a simple owner-facing operations workflow.

## Current State

The clinic-feedback prototype is complete locally and published to GitHub in Pull Request #1: `https://github.com/Akannione/chiropractic-business-os/pull/1`. CBOS now keeps its existing inquiry workflow and adds optional appointment context, patient type, last visit date, expected visit frequency, follow-up ownership, and follow-up outcome. The React app includes a Patient Reactivations call list ordered by overdue, due today, and upcoming return dates.

The demo frontend remains live at `https://frontend-gold-alpha-31.vercel.app`, and the API health endpoint remains live at `https://cbos-api.vercel.app`. The new reactivation work has not been deployed to production yet. Production database workflows remain blocked until the exposed Atlas database-user password is rotated and the replacement `MONGODB_URI` is added to the Vercel API project.

## Last Completed Task

2026-06-24: Implemented, validated, committed, pushed, and opened Pull Request #1 for the clinic-feedback reactivation prototype.

## Current Task

Rotate the Atlas credential, configure production database access, merge Pull Request #1, and deploy the updated frontend and API.

## Next Actions

1. Rotate the exposed Atlas database-user password.
2. Permit the required Vercel network access in Atlas.
3. Add the replacement Atlas URI to the `cbos-api` Vercel project as sensitive `MONGODB_URI`.
4. Review and merge Pull Request #1.
5. Deploy the updated backend and frontend.
6. Run the production reactivation, import, update, KPI, summary, and CSV export smoke tests.
7. Capture updated screenshots for the portfolio and clinic follow-up.

## Known Issues And Blockers

* The exposed Atlas database-user password must be rotated and never reused.
* `cbos-api` still lacks a working production `MONGODB_URI`, so database-backed production routes remain unavailable.
* Atlas Network Access must permit Vercel before production data workflows can run.
* The reactivation prototype is verified locally but not yet deployed.
* Pull Request #1 is open and not yet merged into `main`.
* Vercel Hobby and Atlas M0 are demo infrastructure, not the final paying-client hosting plan.

## Reusable Lessons

* Position CBOS as a workflow layer beside ChiroMatrix and MetaSoft, not as an EHR, billing, insurance, or scheduling replacement.
* A reactivation queue can be derived from `last_visit_date + expected_visit_frequency_days` without duplicating the appointment calendar.
* Previewing field mappings and duplicates with fake CSV data directly addresses a clinic's migration anxiety.
* Validate responsive grid containment with rendered browser measurements; TypeScript and build checks do not detect horizontal overflow.
* Verify database-backed endpoints in addition to `/api/health`.

## Modified Files

* Backend inquiry model, validation, services, controllers, routes, serializers, sample data, tests, and CSV export logic
* Frontend types, data hook, API service, navigation, inquiry forms, export preview, reactivation page, and responsive styles
* `README.md`
* `docs/API.md`
* `docs/DEMO_WALKTHROUGH.md`
* `docs/METASOFT_REACTIVATION_DEMO.csv`
* `docs/superpowers/specs/2026-06-24-clinic-reactivation-prototype-design.md`
* `docs/superpowers/plans/2026-06-24-clinic-reactivation-prototype.md`

## Current Branch

`codex/reactivation-prototype`

## Verification Status

Passed:

```bash
npm run typecheck
npm run test
npm run build
git diff --check
```

Live local checks passed:

* MongoDB started at `mongodb://127.0.0.1:27017/chiropractic_business_os`.
* API health and configuration returned successfully.
* Demo reset seeded eight fake chiropractic records.
* Reactivation API returned `2 overdue`, `1 due today`, and `1 upcoming`.
* Five fake MetaSoft-style CSV rows previewed and imported.
* A repeated preview marked all five rows as duplicates.
* Follow-up owner/outcome updates persisted.
* CSV export included practice-friendly reactivation headers.
* Re-seeding an occupied database inserted zero duplicate sample rows.
* Browser checks found no relevant console errors.
* Desktop and mobile dashboard/reactivation views rendered.
* Mobile horizontal overflow was found, fixed, and revalidated.
