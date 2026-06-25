# Project Status

## Project Purpose

Full-stack CBOS for small chiropractic practices to capture patient inquiries, track follow-ups and patient reactivations, review practice KPIs, import/export CSV data, and support a simple owner-facing operations workflow.

## Current State

The clinic-feedback prototype is complete locally and published to GitHub in Pull Request #1: `https://github.com/Akannione/chiropractic-business-os/pull/1`. CBOS now keeps its existing inquiry workflow and adds optional appointment context, patient type, last visit date, expected visit frequency, follow-up ownership, and follow-up outcome. The React app includes a Patient Reactivations call list ordered by overdue, due today, and upcoming return dates.

The demo frontend remains live at `https://frontend-gold-alpha-31.vercel.app`, and the API health endpoint remains live at `https://cbos-api.vercel.app`. Pull Request #1 has passing Vercel checks; the preview URL is protected by Vercel Authentication. The new reactivation work has not been deployed to production yet. Production database workflows remain blocked until the exposed Atlas database-user password is rotated and the replacement `MONGODB_URI` is added to the `cbos-api` Vercel project.

2026-06-25 deployment prep confirmed that `cbos-api` production currently has `AUTH_TOKEN_SECRET`, `BUSINESS_OS_DEMO_MODE`, `PRACTICE_NAME`, and `CORS_ORIGIN`, but it does not have `MONGODB_URI`. The production health endpoint returns 200, while database-backed routes such as `/api/reactivations` return 500.

Uncommitted Dr. McIntyre Canva collateral was preserved in a local stash named `preserve-dr-mcintyre-canva-assets-before-cbos-deploy` so the CBOS deployment branch can stay clean.

## Last Completed Task

2026-06-25: Automated deployment-prep checks, cleaned corrupted frontend dependency folders with `npm ci --prefix frontend`, re-ran validation, confirmed PR #1 checks pass, confirmed production health works, and confirmed database-backed production routes fail because `MONGODB_URI` is missing in Vercel.

## Current Task

Rotate the Atlas credential, configure production database access, merge Pull Request #1, and deploy the updated frontend and API.

## Next Actions

1. Rotate the exposed Atlas database-user password.
2. Permit the required Vercel network access in Atlas.
3. Add the replacement Atlas URI to the `cbos-api` Vercel project as sensitive production `MONGODB_URI`.
4. Redeploy `cbos-api` and confirm `/api/reactivations` no longer returns 500.
5. Review and merge Pull Request #1.
6. Deploy the updated backend and frontend.
7. Run the production reactivation, import, update, KPI, summary, and CSV export smoke tests.
8. Capture updated screenshots for the portfolio and clinic follow-up.

## Known Issues And Blockers

* The exposed Atlas database-user password must be rotated and never reused.
* `cbos-api` production lacks `MONGODB_URI`, so database-backed production routes currently return 500.
* Atlas Network Access must permit Vercel before production data workflows can run.
* The reactivation prototype is verified locally but not yet deployed.
* Pull Request #1 is open and not yet merged into `main`.
* The Vercel PR preview requires Vercel login, so public clinic demos should continue using the production URL until the PR is merged and deployed.
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
* `package.json`
* `package-lock.json`

## Current Branch

`codex/reactivation-prototype`

## Verification Status

Passed:

```bash
npm ci --prefix frontend
npm run typecheck
npm run test
npm run build
git diff --check
gh pr checks 1
curl -sS -i https://cbos-api.vercel.app/api/health
curl -sS -i https://cbos-api.vercel.app/api/reactivations
```

Production verification on 2026-06-25:

* `https://cbos-api.vercel.app/api/health` returned `HTTP/2 200`.
* `https://cbos-api.vercel.app/api/reactivations` returned `HTTP/2 500`, matching the missing `MONGODB_URI` blocker.
* `vercel env ls production` in `backend/` showed no `MONGODB_URI`.
* `gh pr checks 1` showed Vercel and Vercel Preview Comments passing.

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
* The GitHub Vercel check initially exposed a missing root lockfile and missing `build:vercel` script; both were fixed and the preview check now passes.
