# Continue Commands

## Project Path

```bash
cd "/Users/tobiloba202/Documents/New project/business_os_mvp"
```

## Inspect State

```bash
git status --short
git branch --show-current
git log --oneline -5
sed -n '1,260p' PROJECT_STATUS.md
```

## Install Dependencies

```bash
npm run install:all
```

## Start Local Demo

Terminal 1:

```bash
cd "/Users/tobiloba202/Documents/New project/business_os_mvp"
mkdir -p .mongo-data
mongod --dbpath .mongo-data --bind_ip 127.0.0.1 --port 27017
```

Terminal 2:

```bash
cd "/Users/tobiloba202/Documents/New project/business_os_mvp"
BUSINESS_OS_DEMO_MODE=true npm run dev:backend
```

Terminal 3:

```bash
cd "/Users/tobiloba202/Documents/New project/business_os_mvp"
npm --prefix frontend run dev -- --host 127.0.0.1
```

Open:

```text
http://localhost:5173/
```

## Validate

```bash
cd "/Users/tobiloba202/Documents/New project/business_os_mvp"
npm run typecheck
npm run test
npm run build
git diff --check
curl -sS http://localhost:4000/api/health
curl -sS http://localhost:4000/api/reactivations
curl -sS -X POST http://localhost:4000/api/imports/inquiries.csv/preview \
  -H "Content-Type: text/csv" \
  --data-binary @docs/METASOFT_REACTIVATION_DEMO.csv
```

## Git Handoff

```bash
cd "/Users/tobiloba202/Documents/New project/business_os_mvp"
git status --short
git diff --check
git add .
git commit -m "Add patient reactivation workflow"
git push -u origin codex/reactivation-prototype
```

## Production Deployment

After rotating the exposed Atlas password:

```bash
cd "/Users/tobiloba202/Documents/New project/business_os_mvp/backend"
vercel env add MONGODB_URI production --sensitive
vercel deploy --prod --force
curl -sS https://cbos-api.vercel.app/api/health
curl -sS https://cbos-api.vercel.app/api/reactivations
```

Deploy the frontend:

```bash
cd "/Users/tobiloba202/Documents/New project/business_os_mvp/frontend"
vercel deploy --prod --force
```

## Resume With Codex

```text
Read AGENTS.md, PROJECT_STATUS.md, and CONTINUE_COMMANDS.md in
/Users/tobiloba202/Documents/New project/business_os_mvp.
Continue from the current production deployment blocker.
Do not repeat the completed reactivation prototype.
Rotate/configure Atlas only through secure account flows, then deploy and run the documented production smoke tests.
Before ending, update the root continuity files, TOBI_OS state, portfolio pipeline, and resume system.
```
