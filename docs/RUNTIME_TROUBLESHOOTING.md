# Runtime And Sandbox Troubleshooting

This guide documents the local issues we have already hit while building the Chiropractic Business OS and how to avoid repeating them.

## Primary App

The main app is the full-stack version:

- Backend: `backend/`
- Frontend: `frontend/`
- Database: MongoDB

The legacy Streamlit + SQLite version lives in `legacy/streamlit_sqlite/`.

## Recommended Local Startup

Run each process in its own terminal from the repository root.

1. Start MongoDB:

```bash
mongod --dbpath .mongo-data --bind_ip 127.0.0.1 --port 27017
```

2. Start the backend:

```bash
npm run dev:backend
```

3. Start the frontend:

```bash
npm run dev:frontend
```

4. Open:

```text
http://localhost:5173
```

## Sandbox Issue: Operation Not Permitted When Binding Ports

In Codex, local servers may fail with errors like:

```text
listen EPERM: operation not permitted 127.0.0.1:5173
listen EPERM: operation not permitted /var/.../tsx-501/...pipe
setup bind :: caused by :: Operation not permitted
```

Root cause: the sandbox can block processes that bind local ports or local IPC sockets.

Practical fix:

- Run server startup commands with approved escalation when Codex is starting them.
- If working manually in your own terminal, run the commands directly outside Codex.
- Do not keep retrying the same command in the sandbox after an `EPERM` bind error.

## Port Already In Use

We also saw:

```text
EADDRINUSE: address already in use :::4000
Port 5173 is in use, trying another one...
```

Root cause: MongoDB, backend, or Vite was already running from a previous attempt.

Check before starting duplicates:

```bash
curl http://localhost:4000/api/health
curl -I http://localhost:5173
```

If those respond, the app is already running.

## Wrong Frontend Start Command

The frontend should be started from the root with:

```bash
npm run dev:frontend
```

Or from `frontend/` with:

```bash
npm run dev
```

If you need a fixed host and port from inside `frontend/`, use:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

Avoid passing host and port incorrectly through the root script. That caused Vite to interpret arguments incorrectly and show a page that looked broken.

## MongoDB Not Running

If the website loads but data does not appear, check the backend first:

```bash
curl http://localhost:4000/api/health
```

Then check MongoDB:

```bash
mongosh mongodb://127.0.0.1:27017/chiropractic_business_os
```

If MongoDB is not running, start it:

```bash
mongod --dbpath .mongo-data --bind_ip 127.0.0.1 --port 27017
```

## Fast Verification Checklist

Use this sequence after changes:

```bash
npm run typecheck
npm run build
curl http://localhost:4000/api/health
curl http://localhost:4000/api/kpis
curl -I http://localhost:5173
```

Expected backend health response:

```json
{"ok":true,"service":"Chiropractic Business OS API"}
```

## GitHub And Deployment Clarity

The repository should make it obvious which version is current:

- Main app: `backend/` and `frontend/`
- Legacy app: `legacy/streamlit_sqlite/`
- Sales/operations docs: `PROJECT_OS/`, `DEMO_KIT/`, `sales_assets/`, `marketing/`

Before pushing:

```bash
git status --short
npm run typecheck
npm run build
git push origin main
```
