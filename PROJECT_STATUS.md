
# Project Status

## Project Purpose

Full-stack CBOS for small chiropractic practices to capture patient inquiries, track follow-ups and patient reactivations, review practice KPIs, import/export CSV data, and support a simple owner-facing operations workflow.

## Current State

Production release candidate is live at `https://businessosmvp.vercel.app`, the API is live at `https://cbos-api.vercel.app`, and MongoDB Atlas-backed routes are working. The clinic-feedback reactivation workflow is deployed with overdue, due-today, and upcoming queues plus follow-up owner and outcome tracking. Patient inquiries now include optional activity or movement context for details such as athlete status, desk-work posture, sport, mobility goal, or return-to-care context.

Staff login was enabled earlier in production, but the current fake-data demo intentionally has `ADMIN_PASSWORD` unset (`/api/auth/status` returns `authEnabled:false`). Do not use real patient data while the demo is open. The read paths are indexed and no longer load the whole collection, the inquiry list is paginated and filtered in the database, CSV import writes in bulk, and a Duplicates screen merges patients recorded twice.

Pull Request #1 was merged into `main` at commit `b46add8`, so the public source now matches the production deployment. Dr. McIntyre Canva collateral remains preserved separately from the deployment branch.

The release-candidate chain is also complete: PR #7 merged into `chatgpt/pilot-readiness` at `76b168c`, and PR #8 merged the post-release hardening branch into `main` at `a32da16`. The active follow-up branch is `chatgpt/demo-data-safety-ux`; PR #9 is open against `main` with explicit fake-data safety UX plus release-hygiene hardening.

## Last Completed Task

2026-10-01: Hardened post-write refresh behavior so a successful inquiry/action is never reported as failed just because the background dashboard refresh later fails. Successful Add Inquiry now closes immediately, refreshes in the background, and surfaces a separate recovery message if fresh practice data cannot be loaded; it does not retry the write. Added browser regression coverage that aborts a post-save KPI refresh and verifies exactly one inquiry POST, success feedback, drawer closure, and the stale-data recovery warning. Chromium 33/33 and WebKit 33/33 passed locally on an isolated fake-data stack. Local macOS Firefox remains blocked before test execution by Playwright's known temporary-profile launcher issue; GitHub Linux CI is the authoritative Firefox signal. Full typecheck, unit/routing/telemetry tests, MongoDB integration, production build, bundle budget, tracked-secret scan, both dependency audits, and `git diff --check` passed. Updated active runbook paths to the repository's current `/Users/tobiloba202/Developer/New-project/business_os_mvp` location.

2026-10-01: Fixed local frontend initialization on alternate Vite ports. Browser evidence showed `GET http://localhost:4000/api/auth/status` returning 200 but being blocked because backend CORS allowed `http://localhost:5173`, while the browser origin was `http://localhost:5175`. StaffGate surfaced the API network error as "CBOS is temporarily unavailable." Local development now uses Vite's same-origin `/api` proxy, preserving existing loopback backend port configuration and production behavior without changing backend CORS. Dashboard rendering on the existing localhost:5175 instance was verified with zero failed requests. Typecheck, all unit/routing/telemetry tests, MongoDB integration tests, production build, bundle budget, whitespace checks, and 64 Chromium/WebKit browser tests passed. Regression tests verify startup auth/config requests stay same-origin. No temporary application logging was added; test servers used an isolated fake-data database.

2026-09-30: Enabled TypeScript unused-local and unused-parameter checks in both projects after removing two unused dashboard bindings. These checks run through the existing typecheck/build gates; no additional dependency or behavior change was introduced.

2026-09-30: Added a shared 30-second frontend request deadline covering JSON and CSV response bodies. Timed-out saves preserve the inquiry form and explain that staff should check whether the write succeeded before retrying; no automatic write retry was added. Unit regressions cover stalled bodies, single attempts, success, and original errors. Typecheck, backend/frontend/routing/telemetry tests, MongoDB integration, build, bundle budget, tracked-secret scan, both production dependency audits, 60 existing Chromium/WebKit E2E checks, and two new timeout browser checks passed. Browser validation used isolated fake data on ports 4015/5175; the first attempts used a stale frontend and then a mismatched CORS origin, corrected without weakening application CORS. This development change does not deploy production or merge PR #9.

2026-09-30: Reconciled the release chain and continued PR #9 hardening. The current branch adds explicit fake/deidentified-data confirmation gates before demo CSV import or Intelligence uploads, disables PostHog GeoIP enrichment, and improves successful inquiry completion feedback. Local typecheck, unit/routing/telemetry tests, production build, bundle budget, tracked-secret scan, Chromium targeted E2E (29/29), and WebKit targeted E2E (29/29) pass. GitHub quality gate #55 previously passed Linux cross-browser E2E including Firefox; the newest current-head gate is running. Local macOS Firefox still fails before test execution with `Could not find profile folder`, so Linux CI remains the authoritative Firefox signal. Canonical production deployment smoke passes, and authenticated `vercel curl` now verifies protected current-head frontend/API preview responses without weakening Deployment Protection; a full browser preview smoke still needs an authorized browser-access path.

## Current Task

The release candidate is now merged to `main` and deployed as an open fake-data demo. The next unresolved product work is clinic-owner validation of the revised CBOS wedge and synthetic Review -> Intelligence workflow. Real patient data remains blocked behind identity/RBAC, source-system, data-minimization, operational-security, contractual, and legal/compliance gates.

## Validation Resume Gate

Outreach was paused on 2026-08-11. Tobi asked on 2026-09-07 what it looks like to resume CBOS consulting validation. Resume only the preparation and review lane automatically: verify the app, fake data, walkthrough, and existing follow-up draft. Do not create a new outreach draft, resend the old invite, or send the existing Gmail draft automatically. The client message and any real clinic data use remain Tobi-controlled manual gates.

## Next Actions

1. Validate the new Review -> Intelligence workspace with the synthetic demo and a clinic-owner walkthrough.
2. Capture the exact report names, columns, and calculations the clinic owner already uses manually.
3. Inspect only a manually approved de-identified export before adding any source-specific adapter.
4. Keep recurring sync, API/FHIR/HL7 work, EHR writeback, and real patient data out of scope until evidence supports them.
5. Run the existing fake-data clinic protocol and record Go / Revise / Stop.
6. Keep production merge/deploy separate from this development branch.

## Completed This Cycle

* 2026-09-29: Built the bounded Intelligence Foundation v1 on a separate branch: multi-file CSV report recognition, semantic evidence mapping, repeated-row detection, supported operational signals, a nine-report synthetic demo, Review -> Intelligence workspace, connector architecture, and regression tests. No source-system writeback or real-data path was added.
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
* Resolved on August 11, 2026: the recurring duplicate `@types` folders were caused by iCloud Desktop and Documents sync, which was syncing the repository including `node_modules`, `.git`, and `.mongo-data`. Its file provider raced with the atomic file replacement that npm, git, and Vite all rely on, and materialised the losing copy as `react 2`, `react 3`, and so on. The same mechanism produced stale `.git/index` copies. The workspace now lives at `/Users/tobiloba202/Developer/New-project`, outside any synced location, and `brctl status` no longer tracks it. `npm ci --prefix frontend` remains the repair if duplicates are ever seen again.
* Client outreach and real-data use remain manual gates; see the Validation Resume Gate above.
* Staff password authentication is temporarily disabled for fake-data demonstrations because `ADMIN_PASSWORD` was removed from the production API environment. Do not use real patient data until access controls are restored and real-data readiness is approved.
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

`chatgpt/demo-data-safety-ux`

## Verification Status

Release-candidate verification on September 30, 2026: `npm run typecheck`, `npm run test`, `npm run build`, `npm run check:bundle`, `npm run check:secrets`, `npm run test:db`, both production dependency audits, auth smoke, and full earlier Chromium/WebKit suites passed; GitHub quality gate #55 passed the full Linux cross-browser job, including Firefox. On the current PR #9 head, the most recently changed accessibility/core/workflow surfaces pass 29/29 in Chromium and 29/29 in WebKit, with the newest Linux quality gate running. The macOS-local Firefox binary still exits before page creation with `Could not find profile folder`, so CI is the authoritative Firefox signal. Canonical production deployment smoke passed against `https://businessosmvp.vercel.app`. Protected branch previews can now be inspected read-only through authenticated `vercel curl`; full browser preview smoke remains behind Vercel Deployment Protection unless an authorized browser bypass/share path is provided.

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
