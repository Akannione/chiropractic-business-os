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
Open the imported Canva project at https://www.canva.com/folder/FAHN7Tn3DQc. Do not upload the PPTX files again. After the Canva usage limit resets, upload original-resolution clinic, doctor, and staff photos, replace the `Replace photo` elements, and verify representative pages in the Instagram, Facebook, LinkedIn, Stories, Reels, and Templates folders.
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

Do not send the invite or enter real patient data without Tobi's approval. During the first walkthrough, use only the production demo's fake records or `docs/METASOFT_REACTIVATION_DEMO.csv`.

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
Pull Request #1 is merged and production proof is complete. Review the ready-to-send invite and measured 20-minute plan in docs/DEMO_WALKTHROUGH.md. Send only after Tobi approves the external message, then record the clinic's workflow evidence and Go / Revise / Stop decision.
Before ending, update the root continuity files, TOBI_OS state, portfolio pipeline, and resume system.
```
