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
npm ci --prefix frontend
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

`npm run test` includes the nine-case defensive CSV-ingestion matrix and the database-independent HTTP contract check for populated and empty `/api/reactivations` responses.

## Automated Reactivation Smoke Workflow

After the local backend is running with `BUSINESS_OS_DEMO_MODE=true`:

```bash
cd "/Users/tobiloba202/Documents/New project/business_os_mvp"
npm run smoke:reactivation
```

Inspect CLI options without changing data:

```bash
npm run smoke:reactivation -- --help
```

The workflow resets demo data before and after execution. It uses only `docs/METASOFT_REACTIVATION_DEMO.csv`. Do not point it at client or non-demo data. Remote demo execution requires `CBOS_SMOKE_ALLOW_REMOTE_RESET=true` and `CBOS_AUTH_TOKEN` when staff authentication is enabled.

## Dr. McIntyre Canva Template Package

The current package is website-aligned to the supplied Wix screenshots and resized for Instagram, Facebook, and LinkedIn: bright blue backgrounds, white serif headings, charcoal image borders, off-white testimonial pages, and photo-first layouts.

Inspect the local Canva-ready deliverables:

```bash
cd "/Users/tobiloba202/Documents/New project/business_os_mvp"
ls -lh ../outputs/dr_mcintyre_canva/*.pptx
sed -n '1,220p' ../outputs/dr_mcintyre_canva/README.md
open ../outputs/dr_mcintyre_canva
```

Preview rendered QA images:

```bash
cd "/Users/tobiloba202/Documents/New project/business_os_mvp"
find ../outputs/dr_mcintyre_canva/previews -name 'slide-*.png' | wc -l
open ../outputs/dr_mcintyre_canva/previews/dr_mcintyre_instagram_feed_square_1080x1080/slide-010.png
open ../outputs/dr_mcintyre_canva/previews/dr_mcintyre_instagram_feed_portrait_1080x1350/slide-020.png
open ../outputs/dr_mcintyre_canva/previews/dr_mcintyre_instagram_feed_tall_1080x1440/slide-020.png
open ../outputs/dr_mcintyre_canva/previews/dr_mcintyre_linkedin_feed_landscape_1200x627/slide-036.png
open ../outputs/dr_mcintyre_canva/previews/dr_mcintyre_instagram_facebook_story_reel_1080x1920/slide-003.png
```

Canva import handoff:

```text
Open the completed Canva project at https://www.canva.com/folder/FAHN7Tn3DQc. Do not upload the PPTX files again or repeat the photo extraction. Four reusable clinic-photo source designs and 45 authentic placements are complete; the next action is to offer a monthly social refresh or front-desk training package.
```

## GitHub Pull Request

```bash
cd "/Users/tobiloba202/Documents/New project/business_os_mvp"
gh pr view 1 --web
gh pr checks 1
```

## Clinic Validation

Review the production walkthrough, decision measures, and ready-to-send invite:

```bash
cd "/Users/tobiloba202/Documents/New project/business_os_mvp"
sed -n '1,320p' docs/DEMO_WALKTHROUGH.md
open -a Safari https://frontend-gold-alpha-31.vercel.app
```

The approved invite was sent June 29, 2026 to the clinic contact. Do not resend it. Wait for a reply; if there is no response by July 2, send one concise follow-up in the existing Gmail thread. When accepted, use only the production demo's fake records or `docs/METASOFT_REACTIVATION_DEMO.csv` during the walkthrough. The private thread identifier is stored in TOBI_OS, not this public repository.

## Preserved Local Collateral

Dr. McIntyre Canva collateral was preserved before deployment work so it does not clutter the CBOS deployment branch.

Inspect the stash:

```bash
cd "/Users/tobiloba202/Documents/New project/business_os_mvp"
git stash list -n 3
```

Restore later only when you are ready to work on collateral again:

```bash
cd "/Users/tobiloba202/Documents/New project/business_os_mvp"
git stash apply stash@{0}
```

## Production Verification

Current production endpoints:

```bash
cd "/Users/tobiloba202/Documents/New project/business_os_mvp/backend"
vercel env ls production
curl -sS -i https://cbos-api.vercel.app/api/health | sed -n '1,40p'
curl -sS -i https://cbos-api.vercel.app/api/reactivations | sed -n '1,80p'
```

Expected:

```text
/api/health returns 200.
/api/reactivations returns 200 with overdue, dueToday, upcoming, and rows fields.
```

Redeploy the API only after validation passes:

```bash
cd "/Users/tobiloba202/Documents/New project/business_os_mvp/backend"
vercel env ls production
vercel deploy --prod --force
curl -sS https://cbos-api.vercel.app/api/health
curl -sS https://cbos-api.vercel.app/api/reactivations
```

Deploy the frontend:

```bash
cd "/Users/tobiloba202/Documents/New project/business_os_mvp/frontend"
vercel deploy --prod --force
```

After production deploy, run:

```bash
cd "/Users/tobiloba202/Documents/New project/business_os_mvp"
curl -sS https://cbos-api.vercel.app/api/health
curl -sS https://cbos-api.vercel.app/api/reactivations
gh pr checks 1
```

Do not pull `MONGODB_URI` into a tracked file. If the Atlas credential is exposed again, rotate it before any redeploy and overwrite the Vercel variable as sensitive.

## Resume With Codex

```text
Read AGENTS.md, PROJECT_STATUS.md, and CONTINUE_COMMANDS.md in
/Users/tobiloba202/Documents/New project/business_os_mvp.
Continue from the production-proven CBOS state.
Do not repeat the completed reactivation prototype.
Uncommitted Dr. McIntyre Canva collateral is preserved in a Git stash named preserve-dr-mcintyre-canva-assets-before-cbos-deploy.
Pull Request #1 is merged and production proof is complete. The measured clinic-validation invite was sent June 29. Do not resend it. Wait for a reply; if there is no response by July 2, send one concise follow-up in the existing Gmail thread. When accepted, run the measured 20-minute fake-data walkthrough in docs/DEMO_WALKTHROUGH.md and record the clinic's workflow evidence and Go / Revise / Stop decision. Use private TOBI_OS tracking for contact identifiers.
Before ending, update the root continuity files, TOBI_OS state, portfolio pipeline, and resume system.
```
