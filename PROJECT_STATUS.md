# Project Status

## Project Purpose

Full-stack CBOS for small chiropractic practices to capture patient inquiries, track follow-ups and patient reactivations, review practice KPIs, import/export CSV data, and support a simple owner-facing operations workflow.

## Current State

Production proven. The React frontend is live at `https://frontend-gold-alpha-31.vercel.app`, the API is live at `https://cbos-api.vercel.app`, and MongoDB Atlas-backed routes are working. The clinic-feedback reactivation workflow is deployed with overdue, due-today, and upcoming queues plus follow-up owner and outcome tracking.

Pull Request #1 was merged into `main` at commit `b46add8`, so the public source now matches the production deployment. Dr. McIntyre Canva collateral remains preserved separately from the deployment branch.

## Last Completed Task

2026-06-29: Sent the approved 20-minute clinic-validation invite to the clinic contact.

## Current Task

Await Dr. McIntyre's reply without resending the original invite. If there is no response by July 2, send one concise follow-up; when accepted, run the measured 20-minute clinic-validation walkthrough with fake data and record the Go / Revise / Stop decision.

## Next Actions

1. Wait for Dr. McIntyre's reply in the existing Gmail thread; do not resend the invite.
2. If there is no response by July 2, send one concise follow-up in the existing thread.
3. When he provides availability, schedule and run the 20-minute fake-data walkthrough in `docs/DEMO_WALKTHROUGH.md`.
4. Record the decision measures and Go / Revise / Stop outcome before changing product scope.

## Known Issues And Blockers

* Vercel Hobby and Atlas M0 are demo infrastructure, not the final paying-client hosting plan.
* Atlas permits public network access for Vercel's dynamic demo egress; the strong unique database credential limits access, but paid deployment should use stricter infrastructure.
* The local frontend dependency tree can become corrupted by generated duplicate `@types` folders; `npm ci --prefix frontend` is the verified repair.
* The live clinic walkthrough now depends on Dr. McIntyre replying with availability; the approved invite was sent June 29, 2026, and the single follow-up checkpoint is July 2.

## Reusable Lessons

* Verify database-backed endpoints in addition to `/api/health`.
* Keep CBOS positioned as a follow-up and reactivation layer beside existing practice systems.
* A production screenshot, route-level smoke test, and concise case study are stronger portfolio proof than a designed mockup.
* Validate raw optional CSV values before mapping so malformed clinic data cannot silently become blank fields.
* Destructive smoke workflows should verify demo mode, require explicit remote opt-in, and restore a known baseline in cleanup.

## Modified Files

* `backend/src/services/reactivationService.ts`
* `backend/src/services/importService.ts`
* `backend/src/tests/service.test.ts`
* `backend/src/scripts/reactivationSmoke.ts`
* `backend/package.json`
* `package.json`
* `README.md`
* `docs/API.md`
* `PROJECT_STATUS.md`
* `CONTINUE_COMMANDS.md`

## Current Branch

`main`

## Verification Status

Passed on June 29, 2026 after the reactivation contract, defensive CSV, and automated smoke-workflow updates:

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

`npm run test` now covers the nine-case CSV-ingestion matrix, the complete smoke-workflow orchestration through an isolated fake API, and populated/empty `/api/reactivations` response contracts without MongoDB. The real command also passed against the local demo stack: 5 rows previewed and imported, 3 eligible reactivation rows verified, one follow-up updated and exported, and cleanup restored 8 sample records. The remote production demo was not reset.

Production evidence:

* API deployment status: Ready
* Health, config, reactivations, KPIs, weekly summary, and monthly summary: HTTP 200
* Desktop WebKit: content loaded, API requests returned 200, no console errors
* Mobile WebKit at 390x844: no console errors or page-level horizontal overflow
