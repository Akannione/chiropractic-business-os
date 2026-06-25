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

The current package is website-aligned to the supplied Wix screenshots: bright blue backgrounds, white serif headings, charcoal image borders, off-white testimonial pages, and photo-first layouts.

Inspect the local Canva-ready deliverables:

```bash
cd "/Users/tobiloba202/Documents/New project/business_os_mvp"
ls -lh outputs/dr_mcintyre_canva/*.pptx
sed -n '1,220p' outputs/dr_mcintyre_canva/README.md
open outputs/dr_mcintyre_canva
```

Preview rendered QA images:

```bash
cd "/Users/tobiloba202/Documents/New project/business_os_mvp"
find outputs/dr_mcintyre_canva/previews -name 'slide-*.png' | wc -l
open outputs/dr_mcintyre_canva/previews/dr_mcintyre_square_social_template_library/slide-015.png
open outputs/dr_mcintyre_canva/previews/dr_mcintyre_story_template_library/slide-009.png
open outputs/dr_mcintyre_canva/previews/dr_mcintyre_carousel_education_library/slide-017.png
```

Canva import handoff:

```text
Open Canva, create or open the folder "Dr McIntyre Brand Kit", upload the four PPTX files from outputs/dr_mcintyre_canva, then confirm text, shapes, buttons, and photo placeholders remain editable. Replace placeholders with actual clinic website photos where available.
```

## GitHub Pull Request

```bash
cd "/Users/tobiloba202/Documents/New project/business_os_mvp"
gh pr view 1 --web
gh pr checks 1
```

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

## Production Deployment

Current production blocker:

```bash
cd "/Users/tobiloba202/Documents/New project/business_os_mvp/backend"
vercel env ls production
curl -sS -i https://cbos-api.vercel.app/api/health | sed -n '1,40p'
curl -sS -i https://cbos-api.vercel.app/api/reactivations | sed -n '1,80p'
```

Expected before fixing secrets:

```text
/api/health returns 200.
/api/reactivations returns 500 because MONGODB_URI is missing.
```

Manual account steps that cannot be safely automated without your private Atlas access:

1. Open MongoDB Atlas.
2. Go to Database Access.
3. Edit the exposed CBOS database user or create a new least-privilege user.
4. Generate a new strong password.
5. Copy the new Atlas connection string and set the database name to `chiropractic_business_os`.
6. Go to Network Access.
7. Add the access rule needed for Vercel. For a short demo, `0.0.0.0/0` is the simplest option, but use a strong unique password and replace this with stricter hosting/networking for a paying client.

After rotating the exposed Atlas password, add the new URI to Vercel:

```bash
cd "/Users/tobiloba202/Documents/New project/business_os_mvp/backend"
vercel env add MONGODB_URI production --sensitive
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

## Resume With Codex

```text
Read AGENTS.md, PROJECT_STATUS.md, and CONTINUE_COMMANDS.md in
/Users/tobiloba202/Documents/New project/business_os_mvp.
Continue from the current production deployment blocker.
Do not repeat the completed reactivation prototype.
Uncommitted Dr. McIntyre Canva collateral is preserved in a Git stash named preserve-dr-mcintyre-canva-assets-before-cbos-deploy.
Review Pull Request #1. Rotate/configure Atlas only through secure account flows, add production MONGODB_URI to cbos-api, redeploy, then merge/deploy and run the documented production smoke tests.
Before ending, update the root continuity files, TOBI_OS state, portfolio pipeline, and resume system.
```
