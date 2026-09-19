# Project Status

## Project Purpose

Full-stack CBOS for small chiropractic practices to capture patient inquiries, track follow-ups and patient reactivations, review practice KPIs, import/export CSV data, and support a simple owner-facing operations workflow.

## Current State

Production proven. The React frontend is live at `https://frontend-gold-alpha-31.vercel.app`, the API is live at `https://cbos-api.vercel.app`, and MongoDB Atlas-backed routes are working. The clinic-feedback reactivation workflow is deployed with overdue, due-today, and upcoming queues plus follow-up owner and outcome tracking. Patient inquiries now include optional activity or movement context for details such as athlete status, desk-work posture, sport, mobility goal, or return-to-care context.

Staff login is enabled in production as of 2026-08-22, so every staff route requires a token while health, config, and the public intake form stay open. The read paths are indexed and no longer load the whole collection, the inquiry list is paginated and filtered in the database, CSV import writes in bulk, and a Duplicates screen merges patients recorded twice.

Pull Request #1 was merged into `main` at commit `b46add8`, so the public source now matches the production deployment. Dr. McIntyre Canva collateral remains preserved separately from the deployment branch.

## Last Completed Task

2026-09-18: Completed the CBOS pilot-readiness system on `chatgpt/pilot-readiness`: action-first UX refinements plus controlled validation, differentiation, data-sync, reactivation, ICP, pricing, pilot offer, onboarding, success, real-data, sales, analytics, and feedback-loop documentation.

## Current Task

Pilot-readiness package verified. Commit and push the final documentation set, then run a Tobi-controlled fake-data clinic validation session; real patient data remains blocked.

## Validation Resume Gate

Outreach was paused on 2026-08-11. Tobi asked on 2026-09-07 what it looks like to resume CBOS consulting validation. Resume only the preparation and review lane automatically: verify the app, fake data, walkthrough, and existing follow-up draft. Do not create a new outreach draft, resend the old invite, or send the existing Gmail draft automatically. The client message and any real clinic data use remain Tobi-controlled manual gates.

## Next Actions

1. Run the clinic protocol in `docs/CLINIC_VALIDATION_PLAYBOOK.md` with fake data and record the result in `docs/VALIDATION_RUNS.md`.
2. Decide reactivation queue behavior after follow-up outcomes: https://github.com/Akannione/chiropractic-business-os/issues/3
3. Validate EHR/export sync with an approved de-identified clinic export before building sync: https://github.com/Akannione/chiropractic-business-os/issues/4
4. Validate Schedule Intelligence before building calendar features: https://github.com/Akannione/chiropractic-business-os/issues/5
5. Configure production `WEBHOOK_SECRET` before using machine webhook intake: https://github.com/Akannione/chiropractic-business-os/issues/2
6. Keep `PRACTICE_TIME_ZONE` explicit for each clinic deployment.
7. Tobi controls any real outreach send and decides whether to present the `$100`, 30-day pilot.

## Completed This Cycle

* 2026-08-11: Moved the workspace out of iCloud, which was the cause of the recurring duplicate `@types` folders and stale `.git/index` copies.
* 2026-08-11 to 08-14: Indexed both collections, narrowed every read path, moved the KPI calculation into an aggregation with a parity check, paginated and filtered the inquiry list in the database, and replaced the row-by-row CSV import with a bulk write.
* 2026-08-14: Hardened authentication, seeding, and rate limiting. See `docs/SECURITY.md`.
* 2026-08-14: Audited duplicates and decided against a unique index on email or phone, because households share contact details. The audit found detection was matching on contact alone and silently discarding family members during import; it now requires the name to match. See `docs/DUPLICATE_POLICY.md`.
* 2026-08-16: Built the Duplicates screen and merge.
* 2026-08-22: Added `npm run test:db`, which exercises the query layer against a real MongoDB rather than a stub, and corrected a false claim about how MongoDB compares null to dates.
* 2026-09-07: Added optional activity/movement context from clinic feedback without changing the core workflow: public intake, staff inquiry forms, CSV import/export, reactivation review, notifications, and demo records now carry that context where available.
* 2026-09-08: Re-verified the validation lane end to end without credentials or real patient data. The remaining gate is Tobi's manual send/edit/hold decision on the existing draft.
* 2026-09-08: Ran the internal 20-minute fake-data walkthrough rehearsal. Decision: `Go` to manual client follow-up and a real fake-data validation call; customer-level `Go / Revise / Stop` remains pending until the clinic participates.
* 2026-09-15: Audited the full backend and frontend codebase. Fixed the confirmed reliability/security/data-integrity issues documented in `docs/CBOS_AUDIT_2026-09-15.md`, added lightweight frontend tests, and kept CBOS positioned as an operational action layer rather than an EHR.
* 2026-09-15: Pushed commits `91bc657` and `57604db` to GitHub. Production smoke checks showed the audit code is live enough to expose `practiceTimeZone` and disable unconfigured machine webhook intake.
* 2026-09-15: Created GitHub issues #2-#5 for the next validation and production-readiness decisions: webhook secret setup, EHR/export sync validation, Schedule Intelligence validation, and reactivation queue outcome behavior.
* 2026-09-18: Reframed the first-screen experience around work needing attention and documented the Daniel UX review without expanding into clinical records, prescriptions, care plans, or scheduling.
* 2026-09-18: Created `docs/PILOT_READINESS.md` and the complete supporting pilot-validation package. The decision is Go for a controlled paid fake-data pilot; real patient data remains a RED gate.

## Known Issues And Blockers

* Vercel Hobby and Atlas M0 are demo infrastructure, not the final paying-client hosting plan.
* Atlas permits public network access for Vercel's dynamic demo egress; the strong unique database credential limits access, but paid deployment should use stricter infrastructure.
* Resolved on August 11, 2026: the recurring duplicate `@types` folders were caused by iCloud Desktop and Documents sync, which was syncing the repository including `node_modules`, `.git`, and `.mongo-data`. Its file provider raced with the atomic file replacement that npm, git, and Vite all rely on, and materialised the losing copy as `react 2`, `react 3`, and so on. The same mechanism produced stale `.git/index` copies. The workspace now lives at `/Users/tobiloba202/Developer/New project`, outside any synced location, and `brctl status` no longer tracks it. `npm ci --prefix frontend` remains the repair if duplicates are ever seen again.
* Client outreach and real-data use remain manual gates; see the Validation Resume Gate above.
* Production now requires a staff password. Anyone demonstrating the app needs it, and it is stored only in Vercel and Tobi's password manager. There is no recovery path other than setting a new one.
* Machine webhook intake now requires `WEBHOOK_SECRET`; production webhook intake should be treated as disabled until that secret is configured securely.

## Reusable Lessons

* Verify database-backed endpoints in addition to `/api/health`.
* Keep CBOS positioned as a follow-up and reactivation layer beside existing practice systems.
* A production screenshot, route-level smoke test, and concise case study are stronger portfolio proof than a designed mockup.
* Validate raw optional CSV values before mapping so malformed clinic data cannot silently become blank fields.
* Destructive smoke workflows should verify demo mode, require explicit remote opt-in, and restore a known baseline in cleanup.
* Governed metric definitions should record grain, denominators, exclusions, ownership, and tests without requiring a new analytics platform.

## Where The Work Lives

Rather than a file list that goes stale between cycles, the durable references:

* `docs/SECURITY.md` for the production posture and how login was enabled
* `docs/DUPLICATE_POLICY.md` for duplicate matching and merge rules
* `docs/ANALYTICS_CONTRACT.md` for KPI and reactivation definitions
* `docs/API.md` for the endpoint contracts
* `npm run bench`, `npm run test:db`, and `npm run audit:duplicates` for the
  measurements and checks behind the recent work


## Current Branch

`chatgpt/pilot-readiness`

## Verification Status

Pilot-readiness verification on September 18, 2026: `npm run typecheck`, `npm run test`, `npm run build`, `npm run test:db`, `npm audit --prefix frontend --audit-level=high`, `npm audit --prefix backend --audit-level=moderate`, and `git diff --check` all passed after the final documentation and continuity updates. Both audits reported zero vulnerabilities.

Passed again on July 1, 2026 after the governed analytics documentation update:

```bash
npm run typecheck
npm run test
npm run build
npm run smoke:reactivation -- --help
npm run smoke:reactivation
curl https://cbos-api.vercel.app/api/health
curl https://cbos-api.vercel.app/api/reactivations
curl https://cbos-api.vercel.app/api/kpis
```

The documented `npm ci --prefix frontend` repair removed corrupted duplicate type folders before the final successful run.

`npm run test` now covers the nine-case CSV-ingestion matrix, the complete smoke-workflow orchestration through an isolated fake API, and populated/empty `/api/reactivations` response contracts without MongoDB. The real command also passed against the local demo stack: 5 rows previewed and imported, 3 eligible reactivation rows verified, one follow-up updated and exported, and cleanup restored 8 sample records. The remote production demo was not reset.

Production evidence, from before staff login was enabled:

* API deployment status: Ready
* Health, config, reactivations, KPIs, weekly summary, and monthly summary: HTTP 200
* Desktop WebKit: content loaded, API requests returned 200, no console errors
* Mobile WebKit at 390x844: no console errors or page-level horizontal overflow

Those endpoint results no longer describe production. Since 2026-08-22 the staff
routes require a bearer token and return 401 without one, which is the intended
state rather than a fault. Only `/api/health`, `/api/config`, `/api/auth/status`,
and the public intake form answer unauthenticated.

Outreach evidence on July 13, 2026: Gmail returned one sent message in the clinic thread, no reply, and no prior follow-up. The newly created reply remained labeled `DRAFT`; no email was sent during the autonomous cycle.

Local verification passed again on July 13, 2026. The documented `npm ci --prefix frontend` repair removed duplicate generated type folders, then `npm run typecheck`, `npm run test`, and `npm run build` all completed successfully.

Re-verified on August 10, 2026 before committing the governed analytics documentation. The duplicate `@types/react 2` and `@types/react-dom 2` folders had reappeared and were again cleared by `npm ci --prefix frontend`; afterwards `npm run typecheck`, `npm run test`, and `npm run build` all passed, and `git diff --check` reported no whitespace errors. Production remained live: `/api/health`, `/api/reactivations`, `/api/kpis`, and the frontend each returned HTTP 200.

Re-verified and redeployed on September 5, 2026 from `/Users/tobiloba202/Developer/New project/business_os_mvp`: `npm ci --prefix frontend`, `npm run typecheck`, `npm run test`, `npm run build`, and `git diff --check` passed. `npm audit --prefix frontend --audit-level=high` and `npm audit --prefix backend --audit-level=moderate` both reported zero vulnerabilities after patching transitive dependency locks and adding a narrow backend `qs` override. `vercel env ls production` confirmed `MONGODB_URI` exists for `cbos-api`. Backend production deployment `dpl_9rcPtNa2aWA1XvhPXeubmyauWATi` aliased to `https://cbos-api.vercel.app`; frontend production deployment `dpl_FXQr7vLD3jcapuB75dQ5tD1b4suj` aliased to `https://frontend-gold-alpha-31.vercel.app`. `/api/health` returned 200, `/api/auth/status` returned `{"authEnabled":true}`, `/api/reactivations` returned 401 without a token as intended, and the frontend returned 200.

Re-verified on September 7, 2026 after the activity-context update: `npm run typecheck`, `npm run test`, `npm run build`, `git diff --check`, and `npm run test:db` passed locally. Local API health returned 200, local frontend returned 200, activity context was created, updated, searched, exported, and reset in demo data. Production `cbos-api` root directory is `backend`, production frontend root directory is `frontend`, `/api/health` returned 200, `/api/auth/status` returned `{"authEnabled":true}`, and `/api/reactivations` returned 401 without a staff token as intended.

Re-verified on September 8, 2026 for resumed consulting validation: `npm run typecheck`, `npm run test`, and `npm run build` passed. Production `/api/health` returned 200, `/api/auth/status` returned `{"authEnabled":true}`, `/api/config` returned public demo config with `demoMode:true`, `/api/reactivations` returned 401 without a staff token as intended, and the frontend returned 200. The existing threaded Gmail follow-up draft was confirmed present and unsent; no Gmail write or send action occurred.

Internal fake-data walkthrough on September 8, 2026: `npm run demo:csv` regenerated `docs/NEW_PATIENT_IMPORT_DEMO.csv`, sample-data reactivation logic produced 2 overdue, 1 due-today, and 1 upcoming patient, and the CSV segment showed the intended 3 importable, 1 duplicate, and 1 invalid-date row. The Board decision is `Go` to manual client follow-up and a real fake-data validation call, with the customer decision still pending.

Reliability audit verification on September 15, 2026: `npm run typecheck`, `npm run test`, `npm run build`, `npm run test:db`, `npm audit --prefix frontend --audit-level=high`, `npm audit --prefix backend --audit-level=moderate`, and `git diff --check` all passed locally. `npm run test` now includes backend service tests and lightweight frontend regression tests. `npm run test:db` passed against a local MongoDB process.

Production smoke verification on September 15, 2026 after pushing the audit work: `https://cbos-api.vercel.app/api/health` returned 200, `https://cbos-api.vercel.app/api/config` returned `practiceTimeZone:"America/New_York"`, `https://cbos-api.vercel.app/api/reactivations` returned 401 without a staff token, `https://cbos-api.vercel.app/api/webhooks/inquiries` returned 404 because `WEBHOOK_SECRET` is not configured, and the frontend returned 200.
