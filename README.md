# CBOS

A focused full-stack web app for chiropractic practices to capture patient inquiries, track follow-ups and patient reactivations, review practice KPIs, and export inquiry data.

## Current Stack

- Backend: Node.js, Express, TypeScript
- Database: MongoDB with Mongoose
- Frontend: React, Vite, TypeScript
- Demo hosting: separate Vercel projects for the Express API and React frontend
- Charts/UI: lightweight React UI with native CSS

## What It Does

- Captures patient inquiries from staff entry and public intake forms
- Tracks inquiry status and follow-up dates
- Builds a patient reactivation call list from last visit date and expected visit frequency
- Records appointment status, patient type, offer context, follow-up owner, and follow-up outcome
- Captures optional activity or movement context, such as athlete, desk worker, sport, mobility goal, or return-to-care note
- Shows a dashboard follow-up workflow with one-click actions for urgent inquiries
- Provides a simple patient pipeline board grouped by inquiry status
- Shows practice KPIs such as active patients, follow-ups needed, overdue follow-ups, estimated treatment value, and inquiry-to-patient rate
- Provides a printable and downloadable weekly owner review with an action plan
- Provides a month-to-date owner report
- Tracks activity history for inquiry creation and updates
- Exports patient inquiries as CSV
- Supports automated intake from website links, Google/referral source links, webhook payloads, and CSV imports
- Previews CSV imports and skips rows matching a patient already on file by name and contact detail, while letting a household share a phone number and email address
- Finds patients recorded more than once and merges them on request, keeping the fuller record and preserving both histories
- Optionally sends internal email notifications for new automated inquiries when SMTP is configured. Bulk CSV imports do not notify.
- Supports optional staff login when `ADMIN_PASSWORD` is configured, which also requires a real `AUTH_TOKEN_SECRET`; see `docs/SECURITY.md`

## Project Structure

```text
business_os_mvp/
  backend/
    vercel.json
    src/
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
  frontend/
    vercel.json
    src/
      components/
      hooks/
      pages/
      services/
      styles/
      utils/
  docs/
    API.md
    ANALYTICS_CONTRACT.md
    CSV_IMPORT_EXAMPLE.csv
    INTAKE_EMBED_SNIPPETS.md
    PRODUCTION_DEPLOYMENT.md
    RUNTIME_TROUBLESHOOTING.md
    UX_VALIDATION.md
    WORKFLOW_AUTOMATION.md
    METASOFT_REACTIVATION_DEMO.csv
  package.json
  README.md
```

## Local Setup

From this repository folder:

```bash
npm run install:all
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Start MongoDB:

```bash
mongod --dbpath .mongo-data --bind_ip 127.0.0.1 --port 27017
```

Start the backend:

```bash
npm run dev:backend
```

Start the frontend:

```bash
npm run dev:frontend
```

Open:

```text
http://localhost:5173
```

Public intake form:

```text
http://localhost:5173/intake
```

## Environment Variables

Backend variables live in `backend/.env.example`:

```bash
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/chiropractic_business_os
CORS_ORIGIN=http://localhost:5173
PRACTICE_NAME=Chiropractic Practice
PRACTICE_TIME_ZONE=America/New_York
ADMIN_PASSWORD=
AUTH_TOKEN_SECRET=change-this-long-random-secret
BUSINESS_OS_DEMO_MODE=true
WEBHOOK_SECRET=
INTERNAL_NOTIFICATION_EMAIL=owner@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=CBOS <no-reply@example.com>
```

Frontend variables live in `frontend/.env.example`:

```bash
VITE_API_BASE_URL=http://localhost:4000/api
```

SMTP variables are optional. If they are not configured, inquiry creation still works and notification is skipped.
`PRACTICE_TIME_ZONE` controls date-only logic such as due-today follow-ups, weekly boundaries, and monthly reporting. Use a real IANA timezone such as `America/New_York`.
Public intake includes a lightweight in-memory rate limit to reduce accidental spam. Webhook intake also has that limiter and requires `WEBHOOK_SECRET` in the `x-cbos-webhook-secret` header. For a production deployment with multiple backend instances, replace or supplement the in-memory limiter with platform-level or shared-store rate limiting.
`ADMIN_PASSWORD` is optional for local demos. Set it in production so staff dashboard APIs require login. The public intake form remains open.

## Demo Deployment

The demo uses two Vercel projects from the same GitHub repository:

- React frontend: `https://frontend-gold-alpha-31.vercel.app`
- Express API: `https://cbos-api.vercel.app`
- MongoDB: Atlas M0 free cluster

The Vercel projects are rooted separately for Git deployments:

- API project root: `backend`
- Frontend project root: `frontend`

The frontend production variable is:

```bash
VITE_API_BASE_URL=https://cbos-api.vercel.app/api
```

The API stores `MONGODB_URI` as a sensitive production variable in the `cbos-api` Vercel project. The Atlas credential was rotated and the database-backed production workflow was verified on June 29, 2026. Never commit or paste database credentials into documentation, Git, or chat.

Current production also has `ADMIN_PASSWORD` enabled. That password is only for the CBOS staff dashboard; it is not the MongoDB password, Vercel account password, or a clinic EHR password. Public intake remains open without login.

This free deployment is for demos and validation. A paying-client deployment should use an appropriate commercial hosting plan and client-specific credentials.

## Automation Paths

Public intake:

```text
POST /api/public/inquiries
```

Webhook intake for form tools:

```text
POST /api/webhooks/inquiries
```

Webhook intake is disabled unless `WEBHOOK_SECRET` is configured. Send the secret in the `x-cbos-webhook-secret` header; do not put it in a query string.

CSV import:

```text
POST /api/imports/inquiries.csv/preview
```

Then:

```text
POST /api/imports/inquiries.csv
```

The preview route flags rows that match an existing patient by normalized name plus email or phone, and rows with missing or invalid fields before the import runs.
It also accepts optional clinic workflow columns such as patient type, appointment status, last visit date, visit frequency, follow-up owner, and follow-up outcome. Use `docs/METASOFT_REACTIVATION_DEMO.csv` as a fake-data import example before working with a real practice export.
It also accepts optional activity context columns, such as `activity_context`, `movement_context`, `movement_pattern`, or `Activity / Movement Context`. Use this for simple operational context like "runner returning to training" or "desk worker with neck stiffness"; it is not an EHR field or clinical diagnosis.
Quoted CSV fields can contain commas, escaped double quotes, and line breaks. Nonblank last-visit dates must be real `YYYY-MM-DD` dates, and visit-frequency values must be positive whole numbers; invalid values are reported during preview instead of being imported silently.

Useful source links:

```text
/intake?source=Website
/intake?source=Google
/intake?source=Referral
/intake?source=Insurance
/intake?source=Phone%20Call
```

More details:

- `demo_recordings/README.md`
- `demo_recordings/cbos_walkthrough_demo_narrated.mp4`
- `demo_recordings/cbos_walkthrough_presenter_script.md`
- `docs/DEMO_WALKTHROUGH.md`
- `docs/CALL_RUN_SHEET.md`
- `docs/OBJECTION_ALREADY_CALLED.md`
- `docs/CASE_STUDY.md`
- `docs/ANALYTICS_CONTRACT.md`
- `docs/SECURITY.md`
- `docs/DUPLICATE_POLICY.md`
- `docs/API.md`
- `docs/PRODUCTION_DEPLOYMENT.md`
- `docs/WORKFLOW_AUTOMATION.md`
- `docs/INTAKE_EMBED_SNIPPETS.md`
- `docs/PILOT_READINESS.md`
- `docs/PRODUCT_DIFFERENTIATION.md`
- `docs/CLINIC_VALIDATION_PLAYBOOK.md`
- `docs/DATA_SYNC_ARCHITECTURE.md`
- `docs/SCHEDULE_INTELLIGENCE_HYPOTHESIS.md`
- `docs/REACTIVATION_POLICY.md`
- `docs/ICP_HYPOTHESIS.md`
- `docs/PRICING_HYPOTHESIS.md`
- `docs/PAID_PILOT_OFFER.md`
- `docs/PILOT_FAQ.md`
- `docs/CLINIC_ONBOARDING.md`
- `docs/PILOT_SUCCESS_SCORECARD.md`
- `docs/REAL_DATA_READINESS.md`
- `docs/SALES_PROCESS.md`
- `docs/DEMO_DISCOVERY_SCRIPT.md`
- `docs/PRODUCT_ANALYTICS.md`
- `docs/VALIDATION_SYSTEM.md`
- `docs/CSV_IMPORT_EXAMPLE.csv`
- `docs/METASOFT_REACTIVATION_DEMO.csv`
- `docs/NEW_PATIENT_IMPORT_DEMO.csv`

## Verification

Run:

```bash
npm run typecheck
npm run build
npm run test
```

`npm run test` is fast and needs no database; it stubs Mongoose. That leaves the
query layer itself untested, so filters, pagination, the KPI aggregation, and
merging are covered separately against a real MongoDB:

```bash
npm run test:db
```

It uses a dedicated database, drops it afterwards, and skips with a message
when no MongoDB is reachable, so it is safe to run anywhere.

Health check:

```bash
curl http://localhost:4000/api/health
curl https://cbos-api.vercel.app/api/health
```

Expected response:

```json
{"ok":true,"service":"CBOS API"}
```

### Automated Reactivation Smoke Workflow

With the local backend running in demo mode, execute the complete fake-data workflow:

```bash
npm run smoke:reactivation
```

The command uses `docs/METASOFT_REACTIVATION_DEMO.csv`, verifies preview and import counts, confirms eligible rows enter the reactivation queue, updates one follow-up, verifies the CSV export, and restores sample data in cleanup. It refuses APIs without demo mode and refuses non-local resets unless explicitly allowed.

When staff authentication is enabled, provide a bearer token through `CBOS_AUTH_TOKEN`. A remote demo run must also set `CBOS_SMOKE_ALLOW_REMOTE_RESET=true`:

```bash
CBOS_API_BASE_URL=https://cbos-api.vercel.app/api \
CBOS_AUTH_TOKEN='replace-with-temporary-token' \
CBOS_SMOKE_ALLOW_REMOTE_RESET=true \
npm run smoke:reactivation
```

Do not run the reset workflow against client or non-demo data.

### Read-Path Benchmark

The demo database holds around a dozen records, which hides the cost of any
query that reads the whole collection. This seeds a synthetic clinic into a
dedicated benchmark database, times each read path, reports how many documents
each one fetched, and asserts that the KPI aggregation still agrees with the
documented JavaScript definition on every metric:

```bash
npm run bench
```

It refuses to run against any database not named for benchmarking, so it cannot
touch demo or production data. Override the size with `BENCH_SIZE`.

### Duplicate Audit

Reports contact collisions and distinguishes a repeated name from distinct
names sharing a contact detail. Read-only. Run it before considering any unique
constraint:

```bash
npm run audit:duplicates
```

It also accepts a CSV export on stdin, which is how to audit a deployment
without database credentials:

```bash
curl -s https://cbos-api.vercel.app/api/exports/inquiries.csv \
  | npm run audit:duplicates -- --csv
```

See `docs/DUPLICATE_POLICY.md` for why email and phone are deliberately not
unique.

### Demo Import File

Regenerates `docs/NEW_PATIENT_IMPORT_DEMO.csv` with dates relative to today, so
a walkthrough never shows patients who are implausibly overdue:

```bash
npm run demo:csv
```

It is built to preview as three importable rows, one duplicate, and one
validation error.

## Scope

This app intentionally does not include payments, EHR features, insurance workflows, appointment scheduling, or AI patient replies. Optional staff access protection is available, but the product remains focused on inquiry capture, follow-up and reactivation visibility, lightweight reporting, and demo-ready automation.

## Controlled Paid Pilot

CBOS is ready to be offered as a controlled 30-day paid pilot using fake data. The current pricing hypothesis is `$100` for the pilot and `$99/month` if the practice chooses to continue. These prices are validation hypotheses, not proven market pricing.

Real patient data remains blocked. CBOS does not claim HIPAA compliance, and no real patient data or PHI should be used until the legal/compliance and technical gate in `docs/REAL_DATA_READINESS.md` is independently completed. Start with `docs/PILOT_READINESS.md` for the full readiness decision and evidence still required.

## Clinic Workflow Boundary

CBOS complements systems such as ChiroMatrix and MetaSoft. It does not replace the practice website, EHR, billing, insurance, or appointment calendar. Existing CSV exports can be previewed and imported, while the reactivation queue gives staff a focused list of patients whose expected return date is overdue, due today, or upcoming.
