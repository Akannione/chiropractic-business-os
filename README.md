# Chiropractic Business OS

A focused full-stack web app for chiropractic practices to capture patient inquiries, track follow-ups, review practice KPIs, and export inquiry data.

## Current Stack

- Backend: Node.js, Express, TypeScript
- Database: MongoDB with Mongoose
- Frontend: React, Vite, TypeScript
- Charts/UI: lightweight React UI with native CSS

## What It Does

- Captures patient inquiries from staff entry and public intake forms
- Tracks inquiry status and follow-up dates
- Shows practice KPIs such as active patients, follow-ups needed, overdue follow-ups, estimated treatment value, and inquiry-to-patient rate
- Provides a weekly practice summary
- Exports patient inquiries as CSV
- Supports automated intake from website links, Google/referral source links, webhook payloads, and CSV imports
- Optionally sends internal email notifications for new automated inquiries when SMTP is configured

## Project Structure

```text
business_os_mvp/
  backend/
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
    RUNTIME_TROUBLESHOOTING.md
    WORKFLOW_AUTOMATION.md
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
BUSINESS_OS_DEMO_MODE=true
INTERNAL_NOTIFICATION_EMAIL=owner@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=Chiropractic Business OS <no-reply@example.com>
```

Frontend variables live in `frontend/.env.example`:

```bash
VITE_API_BASE_URL=http://localhost:4000/api
```

SMTP variables are optional. If they are not configured, inquiry creation still works and notification is skipped.

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
POST /api/imports/inquiries.csv
```

Useful source links:

```text
/intake?source=Website
/intake?source=Google
/intake?source=Referral
/intake?source=Insurance
/intake?source=Phone%20Call
```

More details:

- `docs/API.md`
- `docs/WORKFLOW_AUTOMATION.md`
- `docs/INTAKE_EMBED_SNIPPETS.md`
- `docs/CSV_IMPORT_EXAMPLE.csv`

## Verification

Run:

```bash
npm run typecheck
npm run build
```

Health check:

```bash
curl http://localhost:4000/api/health
```

Expected response:

```json
{"ok":true,"service":"Chiropractic Business OS API"}
```

## Scope

This app intentionally does not include authentication, payments, EHR features, insurance workflows, appointment scheduling, or AI patient replies. It is kept focused on inquiry capture, follow-up visibility, lightweight reporting, and demo-ready automation.
