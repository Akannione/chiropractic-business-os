# Project Status

## Project Purpose

Full-stack CBOS for small chiropractic practices to capture patient inquiries, track follow-ups and patient reactivations, review practice KPIs, import/export CSV data, and support a simple owner-facing operations workflow.

## Current State

Production proven. The React frontend is live at `https://frontend-gold-alpha-31.vercel.app`, the API is live at `https://cbos-api.vercel.app`, and MongoDB Atlas-backed routes are working. The clinic-feedback reactivation workflow is deployed with overdue, due-today, and upcoming queues plus follow-up owner and outcome tracking.

Staff login is enabled in production as of 2026-08-22, so every staff route requires a token while health, config, and the public intake form stay open. The read paths are indexed and no longer load the whole collection, the inquiry list is paginated and filtered in the database, CSV import writes in bulk, and a Duplicates screen merges patients recorded twice.

Pull Request #1 was merged into `main` at commit `b46add8`, so the public source now matches the production deployment. Dr. McIntyre Canva collateral remains preserved separately from the deployment branch.

## Last Completed Task

2026-09-05: Re-ran the requested deployment command set from the current repo path, confirmed `MONGODB_URI` exists in `cbos-api`, patched npm audit findings, redeployed the backend and frontend to Vercel production, and verified public health/auth/frontend routes.

## Current Task

Strengthen the application itself: security, database performance, and correctness. Client outreach is paused.

## Outreach Hold

Paused on 2026-08-11 by Tobi's decision. Do not send the existing Gmail follow-up draft, do not create new outreach drafts, and do not contact the clinic contact. The draft stays in Gmail, unsent. The walkthrough, run sheet, and objection notes are kept as prepared work for whenever outreach resumes; nothing in them should be treated as a pending action.

## Next Actions

1. Restrict Atlas network access. It still permits all addresses, so the database credential is the only control at that layer. This needs the Atlas console; options are in `docs/SECURITY.md`.
2. Clear the `Verification Probe` record from the production demo. It was submitted through the public intake form to prove the form still worked after login was enabled, and removing it now requires signing in and using `Reset demo data`.
3. Consider indexing search. `GET /api/inquiries?search=` is an unanchored case-insensitive regex, which cannot use an index and measured 46.6 ms against 20,000 records. A MongoDB text index would fix that but changes the semantics: `$text` matches whole words, so "smi" would stop finding "Smith". Substring matching was kept deliberately; revisit only if search becomes slow in practice.
4. Consider narrowing the weekly summary. It still reads every inquiry, projected to five fields, because it reports on the whole practice rather than a date range. An aggregation like the KPI one would remove that read.

## Completed This Cycle

* 2026-08-11: Moved the workspace out of iCloud, which was the cause of the recurring duplicate `@types` folders and stale `.git/index` copies.
* 2026-08-11 to 08-14: Indexed both collections, narrowed every read path, moved the KPI calculation into an aggregation with a parity check, paginated and filtered the inquiry list in the database, and replaced the row-by-row CSV import with a bulk write.
* 2026-08-14: Hardened authentication, seeding, and rate limiting. See `docs/SECURITY.md`.
* 2026-08-14: Audited duplicates and decided against a unique index on email or phone, because households share contact details. The audit found detection was matching on contact alone and silently discarding family members during import; it now requires the name to match. See `docs/DUPLICATE_POLICY.md`.
* 2026-08-16: Built the Duplicates screen and merge.
* 2026-08-22: Added `npm run test:db`, which exercises the query layer against a real MongoDB rather than a stub, and corrected a false claim about how MongoDB compares null to dates.

## Known Issues And Blockers

* Vercel Hobby and Atlas M0 are demo infrastructure, not the final paying-client hosting plan.
* Atlas permits public network access for Vercel's dynamic demo egress; the strong unique database credential limits access, but paid deployment should use stricter infrastructure.
* Resolved on August 11, 2026: the recurring duplicate `@types` folders were caused by iCloud Desktop and Documents sync, which was syncing the repository including `node_modules`, `.git`, and `.mongo-data`. Its file provider raced with the atomic file replacement that npm, git, and Vite all rely on, and materialised the losing copy as `react 2`, `react 3`, and so on. The same mechanism produced stale `.git/index` copies. The workspace now lives at `/Users/tobiloba202/Developer/New project`, outside any synced location, and `brctl status` no longer tracks it. `npm ci --prefix frontend` remains the repair if duplicates are ever seen again.
* Outreach is paused by Tobi's decision, so the clinic walkthrough is not currently blocked on anything; see the Outreach Hold above.
* Production now requires a staff password. Anyone demonstrating the app needs it, and it is stored only in Vercel and Tobi's password manager. There is no recovery path other than setting a new one.

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

`main`

## Verification Status

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
