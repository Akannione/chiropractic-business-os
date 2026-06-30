# CBOS Production Case Study

## Business Problem

Small chiropractic practices can lose revenue when inquiries and returning patients are tracked across phone notes, spreadsheets, and practice software without one focused follow-up queue. Clinic discovery also showed that replacing an EHR or scheduling system would create unnecessary migration risk.

## Solution

CBOS is a lightweight workflow layer that sits beside the practice's existing systems. It provides:

- inquiry capture and status tracking
- overdue, due-today, and upcoming patient reactivation queues
- follow-up owner and outcome tracking
- searchable call lists and practice KPI summaries
- duplicate-aware CSV import and export workflows
- public intake and webhook endpoints for lightweight automation

CBOS intentionally does not replace EHR, billing, insurance, scheduling, or clinical documentation systems.

## Production Proof

On June 29, 2026:

- the exposed MongoDB Atlas database-user password was rotated
- the replacement connection string was stored as a sensitive Vercel production variable
- the Express API and React frontend were deployed to production
- health, configuration, reactivation, KPI, weekly-summary, and monthly-summary routes returned HTTP 200
- the live React app loaded Atlas-backed data with no browser console errors
- desktop and mobile WebKit checks passed without page-level horizontal overflow

Live demo: [frontend-gold-alpha-31.vercel.app](https://frontend-gold-alpha-31.vercel.app)

## Business Value

The workflow gives staff one prioritized call list instead of requiring them to search several tools for follow-up work. Owners gain visibility into inquiry status, estimated treatment value, reactivation timing, and staff ownership while keeping the rollout small and reversible.

## Technical Delivery

- Frontend: React, Vite, TypeScript
- Backend: Node.js, Express, TypeScript
- Database: MongoDB Atlas with Mongoose
- Hosting: Vercel frontend and API projects
- Validation: TypeScript, service tests, production builds, API smoke tests, and WebKit browser checks

## Next Validation Step

Run the measured 20-minute walkthrough in `docs/DEMO_WALKTHROUGH.md` with fake or sanitized CSV data. Record time-to-first-overdue-follow-up, queue ownership, available export fields, objections, and the pilot decision.
