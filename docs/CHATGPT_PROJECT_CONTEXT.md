# CBOS ChatGPT Project Context

Last updated: September 19, 2026

Use this file as the starting context for managing CBOS in a new ChatGPT project.

## Short Summary

CBOS stands for Chiropractic Business OS. It is a focused practice operations app for small chiropractic offices. It helps a practice capture patient inquiries, track follow-ups, organize reactivation opportunities, review practice performance, and export patient inquiry data.

CBOS is not an EHR, billing system, insurance system, or appointment scheduling system. It is designed to sit beside existing clinic software such as MetaSoft, ChiroTouch, ChiroMatrix website forms, email, or spreadsheets.

The current app is a full-stack web app:

- Frontend: React, Vite, TypeScript
- Backend: Node.js, Express, TypeScript
- Database: MongoDB with Mongoose
- Hosting: Vercel frontend and Vercel API backend
- Database hosting: MongoDB Atlas for production demo

Current production demo:

- Frontend: https://frontend-gold-alpha-31.vercel.app
- API: https://cbos-api.vercel.app
- API health: https://cbos-api.vercel.app/api/health
- Public intake form path: `/intake`

As of the latest check, the production frontend and API health endpoint return HTTP 200. Staff password authentication is temporarily disabled for fake-data demonstrations; do not enter real patient data while access is open.

## September 19, 2026 Current State

The active delivery branch is `chatgpt/pilot-readiness`, with pull request #6 open against `main`. The latest completed work on this branch includes:

- Repaired Vercel preview API routing so frontend previews use same-origin `/api` requests.
- Verified the preview health, authentication status, configuration, KPI, inquiry, and reactivation routes.
- Temporarily removed the production `ADMIN_PASSWORD` environment variable at the user's request, which disables the staff login gate for demonstrations.
- Kept `AUTH_TOKEN_SECRET` and MongoDB configuration separate; no credentials belong in source control or this context file.
- Implemented an action-first Today dashboard, grouped navigation, a simple pipeline, inquiry details, improved public intake, CSV import preview, Owner Review, responsive styling, status chips, and empty states.
- Implemented a responsive Add Patient Inquiry drawer. The header action now opens the existing inquiry form over the current screen, preserves context, supports Escape and keyboard focus trapping, restores focus after closing, closes after successful submission, and refreshes dashboard/inquiry data immediately. The full Patient Inquiries page remains available and uses the same reusable form, validation, and API.
- Added focused frontend tests for inquiry form defaults and drawer focus wrapping.

Current product boundary remains unchanged: CBOS is an operational inquiry, follow-up, reactivation, and owner-visibility layer. It is not an EHR, clinical record, billing, insurance, or appointment scheduling system.

Current validation status for the Add Inquiry drawer:

- TypeScript typecheck: passed
- Backend and frontend tests: passed
- Vercel routing regression test: passed
- Production build: passed
- Browser verification: required on the new branch preview after push

Next intended sequence:

1. Complete browser verification of the Add Inquiry drawer on desktop, tablet, and mobile.
2. Push the verified branch update and allow pull request #6 checks to run.
3. Run the fake-data clinic validation protocol in `docs/CLINIC_VALIDATION_PLAYBOOK.md`.
4. Record the clinic's Go / Revise / Stop outcome and exact workflow feedback.
5. Offer the controlled 30-day paid pilot only if workflow fit is demonstrated.
6. Keep real patient data blocked until authentication, privacy, access, backup, retention, and hosting requirements in `docs/REAL_DATA_READINESS.md` are satisfied.

## Core Positioning

CBOS is a follow-up and visibility layer for chiropractic practices.

The clearest customer explanation:

> CBOS does not replace your EHR. Your EHR still handles clinical records, billing, insurance, patient history, and appointments. CBOS helps the owner and front desk see patient inquiries, follow-ups, reactivation opportunities, estimated treatment value, and weekly practice activity in one simple place.

The customer pain it targets:

- New patient inquiries arrive through email, website forms, phone calls, Google, referrals, Groupon, or other sources.
- Staff may call people back, but there is not always a clear owner, next follow-up date, or weekly review process.
- Existing patients may become inactive and need reactivation follow-up.
- Doctors or owners may keep parts of the follow-up process in their head.
- Front desk teams need a simple operational list of who to call, who is overdue, and what happened.
- Practices often already have an EHR, but the EHR may not make inquiry and reactivation follow-up simple enough for daily use.

CBOS should stay simple, demo-friendly, and practice-owner friendly.

## Project Origin And Timeline

The project started on May 31, 2026.

Initial commit:

- `1847243 Build chiropractor Business OS MVP`
- Date: May 31, 2026

The original version was a Python Streamlit and SQLite Business OS MVP. It included lead intake, dashboard KPIs, follow-up tracker, weekly report, CSV export, sample data, and README instructions.

It was then narrowed from a generic small-business lead tracker into a chiropractor-specific operating system:

- Renamed the product and labels for chiropractic terminology.
- Switched from generic leads to patient inquiries.
- Added chiropractic services such as spinal adjustment, sports injury treatment, wellness consultation, massage therapy, neck pain evaluation, and back pain consultation.
- Updated statuses to:
  - New Inquiry
  - Consultation Scheduled
  - Active Patient
  - Lost
  - Follow-Up Needed
- Updated sources to:
  - Google
  - Referral
  - Insurance
  - Website
  - Phone Call

Major project stages:

1. Built the original Streamlit / SQLite Business OS MVP.
2. Converted it into a chiropractor-specific version.
3. Added sample data, deployment docs, README polish, and CSV exports.
4. Added demo readiness materials and sales / outreach planning docs.
5. Rebuilt the app as a full-stack Node.js / TypeScript / React / MongoDB product.
6. Modularized backend and frontend code structure.
7. Added public intake, website source links, webhook intake, CSV import, internal notifications, and reactivation workflow.
8. Cleaned the repository so the current public repo focuses on the modern full-stack CBOS app.
9. Deployed demo frontend and backend to Vercel with MongoDB Atlas.
10. Added staff authentication for production.
11. Added duplicate detection and merge workflow.
12. Added clinic-feedback-driven fields for activity and movement context.
13. Redesigned the main interface around a Today Follow-Up Command Center, Pipeline Board, Weekly Owner Review, and improved CSV import preview.

Current latest committed HEAD after the September 15 audit:

- `57604db Record CBOS validation rehearsal assets`

September 15 audit work is documented in `docs/CBOS_AUDIT_2026-09-15.md`. It fixed staff-auth CSV import header merging, practice timezone/date-only logic, webhook shared-secret gating, PATCH validation parity, CSV import validation, CSV formula-injection mitigation, pipeline-limit truthfulness, expired-token UX, duplicate merge safety, and frontend regression coverage. The audit changes passed local validation and were pushed to GitHub. Production smoke checks confirmed `/api/health` returns 200, `/api/config` exposes `practiceTimeZone:"America/New_York"`, `/api/reactivations` returns 401 without a staff token, and `/api/webhooks/inquiries` returns 404 until `WEBHOOK_SECRET` is configured.

Recent UX roadmap completed:

- Redesign dashboard into "Today's Follow-Up Command Center."
- Add side-panel patient detail workflow.
- Add simple pipeline / board view.
- Polish public intake form.
- Improve CSV import preview.
- Create dedicated weekly owner review screen.
- Add design system polish: spacing, status chips, typography, icons, empty states.
- Run and document a 15-second usability test.

## Current Repository State

Current live repository path:

```text
/Users/tobiloba202/Developer/New project/business_os_mvp
```

Remote:

```text
https://github.com/Akannione/chiropractic-business-os
```

Current branch:

```text
main
```

Important note:

Earlier stages created folders such as `PROJECT_OS`, `marketing`, `sales_assets`, `demo_website`, and deployment SOP assets. Those existed historically and are visible in Git history, but the current cleaned repository no longer contains those folders. The live repo is focused on the full-stack app, docs, and demo recordings.

Current top-level structure:

```text
business_os_mvp/
  backend/
  frontend/
  docs/
  demo_recordings/
  package.json
  README.md
  PROJECT_STATUS.md
  CONTINUE_COMMANDS.md
```

Current backend structure:

```text
backend/src/
  app.ts
  server.ts
  config/
  controllers/
  data/
  middleware/
  models/
  routes/
  serializers/
  services/
  utils/
  validators/
  tests/
```

Current frontend structure:

```text
frontend/src/
  App.tsx
  main.tsx
  components/
  hooks/
  pages/
  services/
  styles/
  utils/
```

Current important docs:

- `README.md`
- `PROJECT_STATUS.md`
- `CONTINUE_COMMANDS.md`
- `docs/API.md`
- `docs/ANALYTICS_CONTRACT.md`
- `docs/CASE_STUDY.md`
- `docs/CSV_IMPORT_EXAMPLE.csv`
- `docs/DEMO_WALKTHROUGH.md`
- `docs/DUPLICATE_POLICY.md`
- `docs/INTAKE_EMBED_SNIPPETS.md`
- `docs/METASOFT_REACTIVATION_DEMO.csv`
- `docs/NEW_PATIENT_IMPORT_DEMO.csv`
- `docs/OBJECTION_ALREADY_CALLED.md`
- `docs/PRODUCTION_DEPLOYMENT.md`
- `docs/RUNTIME_TROUBLESHOOTING.md`
- `docs/SECURITY.md`
- `docs/UX_VALIDATION.md`
- `docs/WORKFLOW_AUTOMATION.md`
- `demo_recordings/cbos_walkthrough_demo_narrated.mp4`
- `demo_recordings/cbos_walkthrough_presenter_script.md`

## Current Features

### Staff Dashboard

The staff dashboard is protected in production when `ADMIN_PASSWORD` is configured.

The login password is only for CBOS staff dashboard access. It is not the MongoDB password, Vercel password, or clinic EHR password.

Current staff views include:

- Today dashboard
- Patient Inquiries
- Patient Pipeline
- Reactivations
- Weekly Owner Review
- Monthly Summary
- Activity
- Duplicates
- Export / Import
- Settings
- Public Intake preview

### Today Follow-Up Command Center

The dashboard now leads with the daily operational work:

- Overdue follow-ups
- Follow-ups due today
- Estimated treatment value
- Inquiries needing action
- Quick actions for urgent work

The dashboard should be understandable within 15 seconds by a practice owner.

### Patient Inquiry Tracking

CBOS tracks patient inquiries with fields such as:

- name
- phone
- email
- requested service
- activity / movement context
- source
- status
- estimated treatment value
- notes
- next follow-up date
- appointment status
- patient type
- appointment request
- offer type
- last visit date
- expected visit frequency
- assigned follow-up owner
- follow-up outcome
- created date
- updated date

### Public Intake

CBOS has a public intake path:

```text
/intake
```

Useful source links:

```text
/intake?source=Website
/intake?source=Google
/intake?source=Referral
/intake?source=Insurance
/intake?source=Phone%20Call
```

Use cases:

- Embed on a chiropractor website.
- Use `/intake?source=Google` as the Google Business Profile contact link.
- Give referral partners `/intake?source=Referral`.
- Use it as a simple form for front desk intake when needed.

Public intake intentionally avoids:

- payments
- scheduling confirmation
- insurance processing
- clinical advice
- EHR replacement behavior

### CSV Import

CBOS supports CSV preview and import.

Current CSV preview improvements:

- Shows row count.
- Shows rows ready to import.
- Flags possible duplicates.
- Flags rows needing cleanup.
- Shows readable preview labels instead of raw technical failure.
- Does not silently import malformed rows.

The import supports optional workflow columns including:

- patient type
- appointment status
- last visit date
- visit frequency
- follow-up owner
- follow-up outcome
- activity / movement context

CSV import is important because real clinics may export data from systems such as MetaSoft or other practice systems.

### Reactivation Workflow

CBOS includes a patient reactivation call list.

A patient appears in reactivation views when:

- last visit date exists
- expected visit frequency exists
- patient is not Lost
- patient is not a Dead Lead

Reactactivation groups:

- Overdue
- Due Today
- Upcoming

This came directly from clinic feedback: they wanted a way to see people who should be called if they have not been in recently.

### Duplicate Detection

CBOS supports duplicate detection and merge.

Important design decision:

- Email and phone are indexed but not unique.
- Households may share an email or phone.
- Duplicate matching requires name plus shared email or phone.
- This avoids wrongly collapsing family members.

### Activity History

CBOS tracks activity history for creation and updates.

This helps explain what changed and when, without turning the app into a full audit-heavy EHR.

### Weekly Owner Review

CBOS includes a weekly owner review page that summarizes:

- total patient inquiries
- new this week
- active patients
- follow-ups needed
- overdue follow-ups
- estimated treatment value
- inquiry-to-patient rate
- top inquiry source
- owner action plan
- weekly review checklist

### Monthly Summary

CBOS also has a month-to-date owner summary for higher-level review.

### Exports

CBOS exports inquiry data to CSV using practice-friendly labels.

Export should remain patient-focused and not expose unnecessary internal fields unless needed for operations.

### Internal Notifications

CBOS can optionally send internal email notifications for new automated inquiries when SMTP variables are configured.

Bulk CSV imports do not send notifications.

### Demo Mode

`BUSINESS_OS_DEMO_MODE=true` enables demo behavior such as reset demo data.

The reset demo data action should only be exposed when demo mode is enabled.

## Current KPI Definitions

Key metrics:

- Total Patient Inquiries: all inquiries.
- New This Week: inquiries created since Monday of the current calendar week.
- Active Patients: inquiries with status `Active Patient`.
- Follow-Ups Needed: inquiries marked `Follow-Up Needed` or due for follow-up today or earlier, excluding Lost.
- Overdue Follow-Ups: inquiries with next follow-up date before today, excluding Lost.
- Estimated Treatment Value: sum of estimated value for inquiries not marked Lost.
- Inquiry-to-Patient Rate: Active Patient count divided by total inquiries.
- Top Inquiry Source: source with the highest inquiry count.

Important tooltip wording:

- Estimated Treatment Value: "The total potential treatment revenue from patient inquiries that have not been marked Lost."
- Inquiry-to-Patient Rate: "The share of all patient inquiries that became Active Patients."
- Follow-Ups Needed: "Inquiries marked Follow-Up Needed or due for follow-up today or earlier."

## Current Status Values

```text
New Inquiry
Consultation Scheduled
Active Patient
Lost
Follow-Up Needed
```

## Current Source Values

```text
Google
Referral
Insurance
Website
Phone Call
```

## Current Service Examples

```text
Spinal Adjustment
Sports Injury Treatment
Wellness Consultation
Neck Pain Evaluation
Back Pain Consultation
Prenatal Chiropractic Consultation
Massage Therapy
```

## Activity And Movement Context

A recent clinic suggestion was to capture movement pattern or lifestyle context, such as:

- athlete
- runner
- desk worker
- sport
- movement limitation
- return-to-care note
- mobility goal

CBOS now has optional activity / movement context in intake, staff forms, CSV import/export, notifications, and demo records.

This should stay non-clinical and operational. It should not become diagnosis, SOAP notes, treatment records, or EHR behavior.

Good positioning:

> CBOS can capture practical context that helps the front desk and owner understand why the person reached out, but it is not intended to store clinical records.

## What We Learned From A Real Clinic Conversation

The clinic currently gets inquiries through website emails and other channels. ChiroMatrix appears to manage the website side, while MetaSoft is used for billing, patient info, and appointment history.

Key clinic workflow notes:

- Website inquiries come in by email.
- Staff or doctor follows up by phone.
- There are dropdowns for appointment scheduled, new patient / existing patient / dead lead, and notes.
- The doctor often tracks follow-up or reactivation needs personally.
- They admitted follow-up for inactive patients is an area they do not do well consistently.
- They liked the idea of a call list for patients who have not been seen in a while.
- They have appointment history digitized in MetaSoft.
- Billing and insurance workflows are time-consuming but should not be CBOS's first scope.
- The biggest fear around switching software is transition pain, bad data migration, wrong balances, missing phone numbers, and manually re-entering thousands of patients.
- They mentioned ChiroTouch as a major chiropractic software competitor.
- CSV export/import matters because it is the safest low-friction bridge from existing systems.

Strategic conclusion:

CBOS should not pitch itself as replacing MetaSoft, ChiroTouch, billing software, or scheduling. The best wedge is:

> Give the clinic a simple follow-up and reactivation layer without forcing a painful software transition.

This keeps the project aligned with the original objective instead of drifting into EHR complexity.

## Competition And Positioning

This comparison is positioning guidance, not a live feature-by-feature audit. Verify current competitor capabilities and pricing before making public claims.

### Excel / Google Sheets

Advantages:

- Cheap or free.
- Familiar.
- Easy to start.
- Flexible.

Weaknesses:

- Easy to forget updates.
- No built-in workflow.
- No consistent follow-up queue.
- Easy to duplicate records.
- Hard to enforce clean statuses.
- Owner review depends on manual formulas.

CBOS positioning:

> CBOS is for practices that have outgrown scattered spreadsheets but do not need a full CRM or EHR replacement.

### Email Inbox

Advantages:

- Already used daily.
- Captures many website inquiries automatically.

Weaknesses:

- Inquiries get buried.
- No status workflow.
- No clear next follow-up date.
- No weekly owner view.
- Difficult to see missed opportunities.

CBOS positioning:

> Email can receive the inquiry, but CBOS makes the follow-up visible and trackable.

### Website Form Tools

Examples: native website forms, Wix forms, Tally, Typeform, Jotform.

Advantages:

- Easy patient-facing intake.
- Flexible form builders.
- Often already connected to website.

Weaknesses:

- Usually not enough for follow-up management.
- May not show practice-level KPIs.
- Often sends emails but does not run the daily follow-up workflow.

CBOS positioning:

> CBOS can receive website inquiries and turn them into a follow-up workflow.

### Generic CRMs

Examples: HubSpot, Salesforce, Zoho, Pipedrive.

Advantages:

- Powerful.
- Automations and pipelines.
- Sales reporting.
- Integrations.

Weaknesses:

- Too broad for a small chiropractic practice.
- Can feel sales-heavy.
- Requires setup and process discipline.
- May not use chiropractic terminology.
- Can become expensive or complex.

CBOS positioning:

> CBOS is intentionally simpler than a CRM and uses chiropractic practice language from the start.

### Chiropractic EHR / Practice Management Systems

Examples mentioned or relevant: MetaSoft, ChiroTouch, ChiroMatrix website stack.

Advantages:

- Clinical records.
- Billing.
- Insurance.
- Appointment and patient history.
- Practice-specific infrastructure.

Weaknesses:

- Can be complex.
- Switching systems can be painful.
- Follow-up and reactivation workflows may still depend on staff discipline.
- Owners may not get a simple weekly operating view.

CBOS positioning:

> CBOS does not compete with the EHR. It gives the practice a simple follow-up and reactivation command center beside the EHR.

### Scheduling Tools

Examples: Calendly-like scheduling tools or EHR appointment systems.

Advantages:

- Appointment booking.
- Calendar management.
- Patient scheduling flow.

Weaknesses:

- Scheduling is not the same as inquiry follow-up.
- They may not capture missed calls, referral context, inactive patients, or owner review metrics.

CBOS positioning:

> Scheduling tells you what is booked. CBOS helps you see who still needs action before or after booking.

## Current Technical Architecture

### Backend

Backend stack:

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose

Backend pattern:

- Controllers handle route-level requests.
- Services contain business logic.
- Models define MongoDB schema.
- Validators validate incoming input.
- Serializers shape outgoing responses.
- Middleware handles auth, rate limiting, and errors.

Important backend modules:

- `backend/src/app.ts`
- `backend/src/server.ts`
- `backend/src/models/Inquiry.ts`
- `backend/src/models/Activity.ts`
- `backend/src/services/inquiryService.ts`
- `backend/src/services/kpiService.ts`
- `backend/src/services/reactivationService.ts`
- `backend/src/services/importService.ts`
- `backend/src/services/duplicateService.ts`
- `backend/src/services/notificationService.ts`
- `backend/src/middleware/authMiddleware.ts`
- `backend/src/middleware/rateLimiter.ts`
- `backend/src/middleware/errorHandler.ts`

### Frontend

Frontend stack:

- React
- Vite
- TypeScript
- Native CSS

Frontend pattern:

- `App.tsx` handles route/view selection and auth gate.
- `AppShell.tsx` handles navigation and layout shell.
- Pages live under `frontend/src/pages`.
- Reusable UI components live under `frontend/src/components`.
- API calls live under `frontend/src/services/api.ts`.
- Formatting utilities live under `frontend/src/utils/format.ts`.

Important frontend pages:

- `DashboardPage.tsx`
- `InquiriesPage.tsx`
- `PipelinePage.tsx`
- `PublicInquiryPage.tsx`
- `ReactivationsPage.tsx`
- `WeeklySummaryPage.tsx`
- `MonthlySummaryPage.tsx`
- `ExportsPage.tsx`
- `DuplicatesPage.tsx`
- `ActivityPage.tsx`
- `SettingsPage.tsx`
- `LoginPage.tsx`

## Environment Variables

Backend `.env` example:

```bash
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/chiropractic_business_os
CORS_ORIGIN=http://localhost:5173
PRACTICE_NAME=Chiropractic Practice
ADMIN_PASSWORD=
AUTH_TOKEN_SECRET=change-this-long-random-secret
BUSINESS_OS_DEMO_MODE=true
INTERNAL_NOTIFICATION_EMAIL=owner@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=CBOS <no-reply@example.com>
```

Frontend `.env` example:

```bash
VITE_API_BASE_URL=http://localhost:4000/api
```

Production important variables:

- `MONGODB_URI`
- `CORS_ORIGIN`
- `ADMIN_PASSWORD`
- `AUTH_TOKEN_SECRET`
- `BUSINESS_OS_DEMO_MODE`
- `VITE_API_BASE_URL`

Never paste secrets into ChatGPT or Git.

If a MongoDB password is exposed, rotate it before continuing.

## Local Development Commands

Install dependencies:

```bash
npm run install:all
```

Start MongoDB:

```bash
mkdir -p .mongo-data
mongod --dbpath .mongo-data --bind_ip 127.0.0.1 --port 27017
```

Start backend:

```bash
BUSINESS_OS_DEMO_MODE=true npm run dev:backend
```

Start frontend:

```bash
npm run dev:frontend
```

Open:

```text
http://localhost:5173/
```

Public intake:

```text
http://localhost:5173/intake
```

## Validation Commands

Run before handoff or deploy:

```bash
npm run typecheck
npm run test
npm run build
git diff --check
```

Optional database-backed test:

```bash
npm run test:db
```

Health checks:

```bash
curl http://localhost:4000/api/health
curl https://cbos-api.vercel.app/api/health
curl https://cbos-api.vercel.app/api/auth/status
```

Expected production behavior:

- `/api/health` returns HTTP 200.
- `/api/auth/status` returns `{"authEnabled":true}`.
- Staff routes should return 401 without a bearer token.
- Public intake should remain accessible without staff login.

## Current Verified State

Most recent local verification:

- `npm run typecheck` passed.
- `npm run test` passed.
- `npm run build` passed.
- `git diff --check` passed.
- Local backend health returned OK.
- Local frontend returned HTTP 200.

Most recent production spot check:

- `https://cbos-api.vercel.app/api/health` returned 200.
- `https://cbos-api.vercel.app/api/auth/status` returned `{"authEnabled":true}`.
- `https://frontend-gold-alpha-31.vercel.app/` returned 200.

## Known Issues And Boundaries

### Boundaries

Do not turn CBOS into:

- EHR
- billing software
- insurance software
- scheduling software
- payment processor
- clinical documentation system
- SOAP note system
- automated patient messaging platform without explicit scope

### Current Demo Hosting Caveat

The current production demo uses Vercel and MongoDB Atlas. This is acceptable for demos and validation, but a paying client should have client-specific credentials, clear hosting decisions, backups, and security review.

### Staff Password

Production has staff login enabled. The staff password is controlled through the Vercel `ADMIN_PASSWORD` environment variable.

If forgotten, reset it in Vercel by changing `ADMIN_PASSWORD` and redeploying.

### Real Patient Data

Do not import real patient data without explicit approval and a clear privacy / security plan.

For demos, use fake records only.

### Sales Claims

Do not claim guaranteed revenue recovery. Use conservative language:

- improve visibility
- reduce missed opportunities
- help follow-up consistency
- estimate value at risk
- support owner review

## What This Means For Users

### Practice Owner

The owner gets a simple view of:

- how many people contacted the practice
- who needs follow-up
- who is overdue
- which opportunities may be getting missed
- what follow-up work should happen this week
- whether inquiries are becoming active patients

### Front Desk Staff

The staff gets:

- one place to enter inquiries
- a daily follow-up queue
- status updates
- notes
- next follow-up date
- CSV import when needed
- public intake form submissions coming into the same workflow

### Doctor

The doctor gets:

- less dependence on memory
- a reactivation list
- a weekly view of follow-up activity
- optional movement/activity context for patient conversations

## User Workflow

Ideal clinic workflow:

1. Patient submits inquiry from website, Google, referral link, phone call, or staff entry.
2. CBOS creates the patient inquiry.
3. CBOS assigns source, requested service, status, and next follow-up date.
4. Staff sees the inquiry in Today's Follow-Up Command Center.
5. Staff calls, emails, or texts using the clinic's normal process.
6. Staff updates status, notes, appointment status, patient type, follow-up date, and outcome.
7. Owner reviews the weekly summary.
8. Reactivation list surfaces patients who have not returned within expected timing.
9. Practice exports data when needed.

## Automation Workflow

Current automation options:

- Public intake form.
- Source-specific intake links.
- Webhook intake for form tools or website builders.
- CSV import preview and bulk import.
- Optional email notifications for new automated inquiries.
- Source / service based follow-up date defaults.
- Demo reset.

Possible future automation, if it does not overbuild:

- Better embeddable website form.
- Simple reminder email to staff, not patients.
- More CSV templates for common practice management exports.
- Read-only import adapters for common tools.
- Manual review before any patient-facing messaging.

Avoid immediately building:

- SMS automation
- appointment scheduling
- EHR sync
- billing
- insurance claims
- patient portal

## Recommendations From Here

Highest priority:

1. Run one real fake-data clinic validation call.
2. Watch where staff gets confused.
3. Confirm the top pain: new inquiry follow-up, reactivation, or owner reporting.
4. Avoid pitching EHR replacement.
5. Use MetaSoft / CSV export as the low-risk bridge.
6. Prepare a small paid pilot offer.

Recommended pilot scope:

- Setup CBOS for one clinic.
- Use fake data first.
- Import a small approved CSV sample only if clinic agrees.
- Train one owner and one staff member.
- Track inquiry and follow-up workflow for 2 to 4 weeks.
- Review weekly owner summary.
- Decide Go / Revise / Stop.

Recommended success measures:

- Staff can enter or review an inquiry without help.
- Owner can understand dashboard in under 15 seconds.
- Follow-up list is useful enough to review daily.
- Reactivation list produces real call candidates.
- Weekly owner review produces at least one practical action.
- Clinic does not feel like it is replacing its existing EHR.

## Demo Talk Track

Use this structure:

1. "This is CBOS, a follow-up and inquiry tracking layer for chiropractic practices."
2. "It is not replacing your EHR, billing, scheduling, or insurance tools."
3. "The first screen shows what needs attention today."
4. "These are overdue follow-ups, due-today items, and estimated treatment value still in play."
5. "Here is how a new inquiry gets added from staff or public intake."
6. "Here is the patient pipeline."
7. "Here is the reactivation list for patients who have not been in recently."
8. "Here is the weekly owner review."
9. "Here is CSV import/export so we do not force a painful system migration."
10. "The question is not whether this replaces your current software. The question is whether this makes follow-up easier to see and act on."

## How To Answer Key Customer Questions

### Is this an EHR?

No. CBOS is not an electronic health records system. It does not replace clinical notes, billing, insurance, patient charts, or scheduling. It is a standalone operations tool for patient inquiries, follow-ups, reactivation opportunities, and owner visibility.

### Who enters the information?

Three ways:

1. A patient can submit the public intake form from the website or source link.
2. Staff can enter an inquiry from a phone call, email, or walk-in.
3. The practice can import a CSV export from an existing system when appropriate.

### What if we already have ChiroTouch, MetaSoft, or another system?

That is expected. CBOS is meant to sit beside the existing system. The first version should not require replacing or migrating from the EHR. It focuses on the work that often gets missed: follow-up visibility, reactivation lists, and weekly owner review.

### How does this save time?

CBOS reduces time spent hunting through email, asking who followed up, building manual call lists, or reconstructing what happened during the week. It gives staff one daily queue and gives the owner one weekly review.

### How does this create value?

If a practice misses even one or two patient opportunities because follow-up is inconsistent, the cost of that missed opportunity may be meaningful. CBOS does not guarantee revenue, but it helps the practice see and work opportunities that might otherwise be buried.

### What if staff will not use it?

Then the product has to stay simple. That is why CBOS focuses on daily follow-up work, simple statuses, and weekly owner review instead of a complex CRM.

## Open Questions For Tobi

The September 18 pilot-readiness phase converted the main unresolved assumptions into controlled experiments:

1. Pricing hypothesis: `$100` for a 30-day paid pilot, with `$99/month` as the continuation hypothesis.
2. Pilot data mode: fake data by default. Approved de-identified data only after manual review. Real patient data remains blocked.
3. ICP hypothesis: solo or small practices with 1-3 providers, a named workflow owner, inconsistent follow-up/reactivation, and an exportable data path.
4. Reactivation behavior: keep current queue membership unchanged until two clinics agree or a paid pilot owner selects the post-outcome rule.
5. Schedule Intelligence: validate a read-only operational signal with two clinics before building; do not build a scheduler.
6. Data sync: inspect a de-identified export and prove stable identity, field authority, diff, and conflict behavior before implementing recurring sync.
7. Analytics: use the manual pilot scorecard first; do not add patient-level third-party telemetry.

These are hypotheses, not customer validation. See `docs/PILOT_READINESS.md` and `docs/VALIDATION_SYSTEM.md`.

## Suggested ChatGPT Project Instructions

Paste this into ChatGPT as project context:

```text
You are helping me manage CBOS, the Chiropractic Business OS.

CBOS is a focused operations tool for small chiropractic practices. It helps capture patient inquiries, track follow-ups, organize reactivation opportunities, review practice KPIs, and export/import CSV data.

It is not an EHR, billing system, insurance system, scheduling system, payment processor, or clinical documentation platform. It should sit beside existing tools like MetaSoft, ChiroTouch, ChiroMatrix, email, and spreadsheets.

The current product is a full-stack app:
- React + Vite + TypeScript frontend
- Node.js + Express + TypeScript backend
- MongoDB + Mongoose database
- Vercel frontend/backend demo hosting
- MongoDB Atlas production demo database

Current production demo:
- Frontend: https://frontend-gold-alpha-31.vercel.app
- API: https://cbos-api.vercel.app
- Public intake path: /intake

Current repository:
- /Users/tobiloba202/Developer/New project/business_os_mvp
- GitHub: https://github.com/Akannione/chiropractic-business-os
- main branch

The project started on May 31, 2026 as a Streamlit/SQLite Business OS MVP and became a chiropractor-specific full-stack app. The current cleaned repository focuses on the modern React/Node/Mongo app plus docs and demo recordings.

Current product features:
- Staff login in production
- Today Follow-Up Command Center
- Patient inquiry tracking
- Public intake form
- Source-specific intake links
- Webhook intake
- CSV import preview and import
- CSV export
- Patient reactivation call list
- Weekly Owner Review
- Monthly Summary
- Activity history
- Duplicate detection and merge
- Optional activity/movement context
- Optional internal notification email
- Demo mode and reset demo data
- Practice timezone configuration with `PRACTICE_TIME_ZONE`
- Machine webhook intake gated by `WEBHOOK_SECRET`
- CSV import/export data-integrity hardening
- Lightweight frontend and backend regression coverage

Current statuses:
- New Inquiry
- Consultation Scheduled
- Active Patient
- Lost
- Follow-Up Needed

Current sources:
- Google
- Referral
- Insurance
- Website
- Phone Call

Strategic goal:
Validate CBOS with chiropractic clinics using fake data first, then sell a small paid pilot focused on follow-up visibility, reactivation, and weekly owner review.

Primary customer pain:
Practices may already have an EHR, but follow-up and reactivation still depend on email, memory, staff discipline, or manual reports. CBOS gives them one operational place to see who contacted the practice, who needs follow-up, who is overdue, and what opportunities may be getting missed.

Important clinic feedback:
One clinic uses ChiroMatrix for website leads and MetaSoft for patient/billing/appointment information. They receive inquiry emails and manually call people. They admitted reactivation follow-up is not done consistently and liked the idea of a call list for patients who have not been seen recently. They warned that replacing practice software is painful because data migrations can break balances, phone numbers, and patient records. Therefore CBOS should not position itself as an EHR replacement.

Current competition positioning:
- Compared with spreadsheets: CBOS is more structured and action-oriented.
- Compared with email: CBOS prevents inquiries from being buried.
- Compared with generic CRMs: CBOS is simpler and chiropractic-specific.
- Compared with EHRs: CBOS does not replace clinical systems; it adds follow-up and owner visibility.
- Compared with scheduling tools: CBOS tracks opportunities before and after booking, not just calendar events.

Current next steps:
1. Run the task-based fake-data clinic protocol in `docs/CLINIC_VALIDATION_PLAYBOOK.md`.
2. Record the exact 30-second product description and Go / Revise / Stop result.
3. If fit is demonstrated, offer the `$100`, 30-day controlled paid pilot in `docs/PAID_PILOT_OFFER.md`.
4. Keep real patient data blocked under `docs/REAL_DATA_READINESS.md`.
5. Validate post-contact reactivation rules, a de-identified export, and Schedule Intelligence before changing those behaviors.
6. Configure `WEBHOOK_SECRET` before using machine webhook intake in production.

Operating rules:
- Do not overbuild.
- Do not drift into EHR, billing, insurance, scheduling, or payments.
- Keep language practice-owner friendly.
- Make every recommendation demo-ready and revenue-aware.
- Protect real patient data.
- Do not paste secrets.
- Use conservative claims; do not guarantee revenue.
```
