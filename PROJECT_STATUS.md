# Project Status

## Project Purpose

Full-stack CBOS for small chiropractic practices to capture patient inquiries, track follow-ups and patient reactivations, review practice KPIs, import/export CSV data, and support a simple owner-facing operations workflow.

## Current State

Production proven. The React frontend is live at `https://frontend-gold-alpha-31.vercel.app`, the API is live at `https://cbos-api.vercel.app`, and MongoDB Atlas-backed routes are working. The clinic-feedback reactivation workflow is deployed with overdue, due-today, and upcoming queues plus follow-up owner and outcome tracking.

Pull Request #1 was merged into `main` at commit `b46add8`, so the public source now matches the production deployment. Dr. McIntyre Canva collateral remains preserved separately from the deployment branch.

## Last Completed Task

2026-06-29: Rotated the Atlas database-user password, added the replacement URI to Vercel as sensitive `MONGODB_URI`, added the required demo network rule, redeployed the API and frontend, and passed production API and WebKit browser smoke tests.

## Current Task

Use the production-proven workflow as bounded consulting and portfolio proof without expanding CBOS into a full practice-management platform.

## Next Actions

1. Use the live demo and case study in one controlled clinic validation conversation.
2. Use only fake or sanitized clinic data during demos.
3. Replace demo infrastructure with client-specific security, hosting, backup, and monitoring before paid production use.

## Known Issues And Blockers

* Vercel Hobby and Atlas M0 are demo infrastructure, not the final paying-client hosting plan.
* Atlas permits public network access for Vercel's dynamic demo egress; the strong unique database credential limits access, but paid deployment should use stricter infrastructure.
* The local frontend dependency tree can become corrupted by generated duplicate `@types` folders; `npm ci --prefix frontend` is the verified repair.

## Reusable Lessons

* Verify database-backed endpoints in addition to `/api/health`.
* Keep CBOS positioned as a follow-up and reactivation layer beside existing practice systems.
* A production screenshot, route-level smoke test, and concise case study are stronger portfolio proof than a designed mockup.

## Modified Files

* Production environment configuration in Atlas and Vercel
* `docs/CASE_STUDY.md`
* `README.md`
* `docs/PRODUCTION_DEPLOYMENT.md`
* Continuity documents

## Current Branch

`main`

## Verification Status

Passed on June 29, 2026:

```bash
npm run typecheck
npm run test
npm run build
curl https://cbos-api.vercel.app/api/health
curl https://cbos-api.vercel.app/api/reactivations
curl https://cbos-api.vercel.app/api/kpis
```

Production evidence:

* API deployment status: Ready
* Health, config, reactivations, KPIs, weekly summary, and monthly summary: HTTP 200
* Desktop WebKit: content loaded, API requests returned 200, no console errors
* Mobile WebKit at 390x844: no console errors or page-level horizontal overflow
