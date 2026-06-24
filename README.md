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
- Shows a dashboard follow-up workflow with one-click actions for urgent inquiries
- Shows practice KPIs such as active patients, follow-ups needed, overdue follow-ups, estimated treatment value, and inquiry-to-patient rate
- Provides a printable and downloadable weekly practice summary
- Provides a month-to-date owner report
- Tracks activity history for inquiry creation and updates
- Exports patient inquiries as CSV
- Supports automated intake from website links, Google/referral source links, webhook payloads, and CSV imports
- Previews CSV imports and skips duplicate email or phone matches
- Optionally sends internal email notifications for new automated inquiries when SMTP is configured
- Supports optional staff login when `ADMIN_PASSWORD` is configured

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
    CSV_IMPORT_EXAMPLE.csv
    INTAKE_EMBED_SNIPPETS.md
    PRODUCTION_DEPLOYMENT.md
    RUNTIME_TROUBLESHOOTING.md
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

Frontend variables live in `frontend/.env.example`:

```bash
VITE_API_BASE_URL=http://localhost:4000/api
```

SMTP variables are optional. If they are not configured, inquiry creation still works and notification is skipped.
Public and webhook intake routes include a lightweight in-memory rate limit to reduce accidental spam. For a production deployment with multiple backend instances, replace this with platform-level or shared-store rate limiting.
`ADMIN_PASSWORD` is optional for local demos. Set it in production so staff dashboard APIs require login. The public intake form remains open.

## Demo Deployment

The demo uses two Vercel projects from the same GitHub repository:

- React frontend: `https://frontend-gold-alpha-31.vercel.app`
- Express API: `https://cbos-api.vercel.app`
- MongoDB: Atlas M0 free cluster

The frontend production variable is:

```bash
VITE_API_BASE_URL=https://cbos-api.vercel.app/api
```

The API requires `MONGODB_URI` in the `cbos-api` Vercel project before database-backed routes work. Rotate exposed database credentials immediately and add the replacement URI directly in Vercel. Never commit or paste database credentials into documentation, Git, or chat.

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

CSV import:

```text
POST /api/imports/inquiries.csv/preview
```

Then:

```text
POST /api/imports/inquiries.csv
```

The preview route flags duplicate email or phone matches and rows with missing required fields before the import runs.
It also accepts optional clinic workflow columns such as patient type, appointment status, last visit date, visit frequency, follow-up owner, and follow-up outcome. Use `docs/METASOFT_REACTIVATION_DEMO.csv` as a fake-data import example before working with a real practice export.

Useful source links:

```text
/intake?source=Website
/intake?source=Google
/intake?source=Referral
/intake?source=Insurance
/intake?source=Phone%20Call
```

More details:

- `docs/DEMO_WALKTHROUGH.md`
- `docs/API.md`
- `docs/PRODUCTION_DEPLOYMENT.md`
- `docs/WORKFLOW_AUTOMATION.md`
- `docs/INTAKE_EMBED_SNIPPETS.md`
- `docs/CSV_IMPORT_EXAMPLE.csv`
- `docs/METASOFT_REACTIVATION_DEMO.csv`

## Verification

Run:

```bash
npm run typecheck
npm run build
npm run test
```

Health check:

```bash
curl http://localhost:4000/api/health
curl https://cbos-api.vercel.app/api/health
```

Expected response:

```json
{"ok":true,"service":"CBOS API"}
```

## Scope

This app intentionally does not include payments, EHR features, insurance workflows, appointment scheduling, or AI patient replies. Optional staff access protection is available, but the product remains focused on inquiry capture, follow-up and reactivation visibility, lightweight reporting, and demo-ready automation.

## Clinic Workflow Boundary

CBOS complements systems such as ChiroMatrix and MetaSoft. It does not replace the practice website, EHR, billing, insurance, or appointment calendar. Existing CSV exports can be previewed and imported, while the reactivation queue gives staff a focused list of patients whose expected return date is overdue, due today, or upcoming.
