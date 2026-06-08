# Chiropractic Business OS Full-Stack Implementation

This project now includes a full-stack implementation using the requested standard stack:

- Backend: Node.js with TypeScript
- Database: MongoDB
- Frontend: React with Vite and TypeScript

The existing Streamlit + SQLite MVP is now explicitly separated under `legacy/streamlit_sqlite/`. The current app lives in separated `backend/` and `frontend/` folders.

## What Was Built

### Backend

Location: `backend/`

The backend is an Express API written in TypeScript. It uses Mongoose to store patient inquiries in MongoDB and exposes endpoints for:

- Health check
- App configuration
- Patient inquiry list
- Patient inquiry creation
- Patient inquiry status/follow-up updates
- KPI calculations
- Weekly practice summary
- CSV export
- Demo data reset when demo mode is enabled

The backend is organized by responsibility:

```text
backend/
  src/
    config/
    controllers/
    data/
    middleware/
    models/
    routes/
    services/
    utils/
```

This keeps HTTP handling, business logic, Mongo models, error handling, and utility formatting separated.

### Frontend

Location: `frontend/`

The frontend is a React + Vite app written in TypeScript. It provides:

- Practice Performance Dashboard
- KPI cards with plain-language help text
- Patient inquiry table
- Patient inquiry intake form
- Public patient inquiry form for website/referral intake
- Quick status updates
- Follow-up focus panel
- Weekly Practice Summary
- CSV export download
- Demo reset button when the backend is in demo mode

The public intake page is available at `/intake`. It submits to `POST /api/public/inquiries`, which creates an inquiry automatically with `Follow-Up Needed`, source tracking, today's follow-up date, and a default estimated treatment value.

The frontend is organized by responsibility:

```text
frontend/
  src/
    components/
    hooks/
    pages/
    services/
    styles/
    utils/
    App.tsx
    main.tsx
    types.ts
```

The current UI is intentionally simple and practice-owner focused, matching the demo-readiness goal. `App.tsx` now only wires application state to pages. Reusable display pieces live in `components/`, screen-level views live in `pages/`, API access lives in `services/`, shared data loading lives in `hooks/`, and formatting helpers live in `utils/`.

## Why This Structure

The previous MVP was useful for fast validation, but Streamlit and SQLite are not the default stack requested for future app work. The new structure separates concerns:

- React owns the user interface.
- Node.js/Express owns API behavior.
- MongoDB owns persistence.
- TypeScript keeps contracts clear across the frontend and backend.
- The frontend is split into pages, components, hooks, services, and utilities so layout, data loading, and API access do not live in one large file.
- README documentation explains setup, environment variables, and verification.

This makes the project easier to extend, deploy, and reuse for future industry templates.

## Environment Variables

Create backend and frontend env files from the examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Backend:

```bash
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/chiropractic_business_os
CORS_ORIGIN=http://localhost:5173
BUSINESS_OS_DEMO_MODE=true
```

Frontend:

```bash
VITE_API_BASE_URL=http://localhost:4000/api
```

## Install

From `business_os_mvp/`:

```bash
npm run install:all
```

Or install each side separately:

```bash
npm install --prefix backend
npm install --prefix frontend
```

## Run Locally

Start MongoDB locally first. The default connection string expects:

```text
mongodb://127.0.0.1:27017/chiropractic_business_os
```

Then run the backend:

```bash
npm run dev:backend
```

In another terminal, run the frontend:

```bash
npm run dev:frontend
```

Open:

```text
http://localhost:5173
```

## Verification

After dependencies are installed:

```bash
npm run typecheck
npm run build
```

Backend health check:

```bash
curl http://localhost:4000/api/health
```

Expected response:

```json
{
  "ok": true,
  "service": "Chiropractic Business OS API"
}
```

## Intentional Exclusions

This migration does not add:

- Authentication
- Payments
- EHR features
- Insurance workflows
- Scheduling/calendar integration
- AI features

The goal was stack migration and architecture separation, not new product scope.

## Legacy App

The original Streamlit app remains available only as a labeled legacy reference:

```bash
cd legacy/streamlit_sqlite
python3 -m streamlit run app.py
```

It can be used as a reference while the React/Node/Mongo version becomes the main implementation.

## Runtime Troubleshooting

Known local runtime issues and fixes are documented in `docs/RUNTIME_TROUBLESHOOTING.md`, including Codex sandbox port-binding errors, duplicate server processes, MongoDB startup checks, and the correct Vite startup commands.
