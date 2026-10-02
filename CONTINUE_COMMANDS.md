# Continue Commands

## Project Path

```bash
cd "/Users/tobiloba202/Developer/New-project/business_os_mvp"
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
cd "/Users/tobiloba202/Developer/New-project/business_os_mvp"
mkdir -p .mongo-data
mongod --dbpath .mongo-data --bind_ip 127.0.0.1 --port 27017
```

Terminal 2:

```bash
cd "/Users/tobiloba202/Developer/New-project/business_os_mvp"
BUSINESS_OS_DEMO_MODE=true npm run dev:backend
```

Terminal 3:

```bash
cd "/Users/tobiloba202/Developer/New-project/business_os_mvp"
npm --prefix frontend run dev -- --host 127.0.0.1
```

Open:

```text
http://localhost:5173/
```

## Validate

```bash
cd "/Users/tobiloba202/Developer/New-project/business_os_mvp"
npm ci --prefix frontend
npm run typecheck
npm run test
npm run build
sed -n '1,240p' docs/ANALYTICS_CONTRACT.md
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
cd "/Users/tobiloba202/Developer/New-project/business_os_mvp"
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
cd "/Users/tobiloba202/Developer/New-project/business_os_mvp"
ls -lh ../outputs/dr_mcintyre_canva/*.pptx
sed -n '1,220p' ../outputs/dr_mcintyre_canva/README.md
open ../outputs/dr_mcintyre_canva
```

Preview rendered QA images:

```bash
cd "/Users/tobiloba202/Developer/New-project/business_os_mvp"
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
cd "/Users/tobiloba202/Developer/New-project/business_os_mvp"
gh pr view 1 --web
gh pr checks 1
```

## Clinic Validation

Start with the controlled validation and pilot-readiness decisions:

```bash
cd "/Users/tobiloba202/Developer/New-project/business_os_mvp"
sed -n '1,260p' docs/PILOT_READINESS.md
sed -n '1,260p' docs/CLINIC_VALIDATION_PLAYBOOK.md
sed -n '1,220p' docs/PAID_PILOT_OFFER.md
sed -n '1,220p' docs/REAL_DATA_READINESS.md
```

CBOS may be offered as a `$100`, 30-day controlled paid pilot using fake data. Do not use real patient data or claim HIPAA compliance. External outreach, payment, and clinic participation remain Tobi-controlled actions.

Review the production walkthrough, decision measures, and ready-to-send invite:

```bash
cd "/Users/tobiloba202/Developer/New-project/business_os_mvp"
sed -n '1,320p' docs/DEMO_WALKTHROUGH.md
open -a Safari https://businessosmvp.vercel.app
```

The approved invite was sent June 29, 2026 to the clinic contact. The thread was reconciled on July 13 and still contained only that sent invite. A concise threaded follow-up draft now exists in Gmail and has not been sent. Tobi reactivated the CBOS validation lane on 2026-09-07, but the external send is still manual: review the existing draft without recreating it, and let Tobi decide whether to send or edit it. When accepted, use only the production demo's fake records and `docs/NEW_PATIENT_IMPORT_DEMO.csv` during the walkthrough. `docs/METASOFT_REACTIVATION_DEMO.csv` is retained for duplicate-protection discussion only. Keep private contact identifiers out of this public repository.

## Preserved Local Collateral

Dr. McIntyre Canva collateral was preserved before deployment work so it does not clutter the CBOS deployment branch.

Inspect the stash:

```bash
cd "/Users/tobiloba202/Developer/New-project/business_os_mvp"
git stash list -n 3
```

Restore later only when you are ready to work on collateral again:

```bash
cd "/Users/tobiloba202/Developer/New-project/business_os_mvp"
git stash apply stash@{0}
```

## Intelligence Foundation v1

Work on the separate branch:

```bash
cd "/Users/tobiloba202/Developer/New-project/business_os_mvp"
git branch --show-current
# Active review branch: chatgpt/demo-data-safety-ux (PR #9). Preserve local work.
npm run typecheck
npm run test
npm run build
git diff --check
```

Open the local app and select **Review -> Intelligence**. Use **Run Synthetic Demo** first. Do not upload real patient data. The preview is non-persistent and does not write to an EHR.

Architecture and validation notes:

```bash
sed -n '1,260p' docs/INTELLIGENCE_FOUNDATION_V1.md
sed -n '1,220p' docs/DATA_SYNC_ARCHITECTURE.md
sed -n '1,220p' docs/REAL_DATA_READINESS.md
```

## Production And Preview Verification

Production is the open **fake-data demo** at `https://businessosmvp.vercel.app`.
Check the live auth/config posture instead of assuming the historical staff-login state:

```bash
cd "/Users/tobiloba202/Developer/New-project/business_os_mvp"
curl -fsS https://cbos-api.vercel.app/api/health
curl -fsS https://cbos-api.vercel.app/api/auth/status
curl -fsS https://cbos-api.vercel.app/api/config
gh pr checks 9
```

At the last verified production check, `authEnabled:false` and `demoMode:true`.
When authentication is enabled, staff routes require a bearer token and reject
unauthenticated requests with 401. An open demo is not ready for real patient data.
Do not reset or seed a remote database as part of a read-only health check.

For a protected branch preview, use the existing authenticated Vercel CLI:

```bash
vercel curl /api/health --deployment <verified-api-preview-id> -- --silent --show-error
vercel curl / --deployment <verified-frontend-preview-id> -- --silent --show-error --output /tmp/cbos-preview.html --write-out '%{http_code}\n'
```

A successful HTTP preview check does not establish browser-workflow coverage.
Full preview browser smoke requires an authorized share URL or the supported
protection-bypass environment variables documented in `frontend/e2e/deployment-smoke.mjs`.
Do not disable Deployment Protection to make tests pass.

**Merging and production deployment require explicit approval.** Passing checks
alone is not approval. The API project root is already `backend`; avoid a nested
`backend/backend` CLI deployment. Keep database credentials and bypass secrets out
of tracked files, command output, and project notes.

## Resume With Codex

```text
Read AGENTS.md, PROJECT_STATUS.md, and CONTINUE_COMMANDS.md in
/Users/tobiloba202/Developer/New-project/business_os_mvp.
Continue from chatgpt/demo-data-safety-ux (PR #9), inspect live branch/PR state, and read docs/PILOT_READINESS.md first. Do not merge or deploy production without explicit approval.
Do not repeat the completed reactivation prototype.
Uncommitted Dr. McIntyre Canva collateral is preserved in a Git stash named preserve-dr-mcintyre-canva-assets-before-cbos-deploy.
Pull Request #1 is merged and production proof is complete. The measured clinic-validation invite was sent June 29. The thread was reconciled July 13 and a concise threaded follow-up draft exists in Gmail but is unsent. The validation lane is active again for preparation and review, but external send remains manual. Review the existing draft; do not recreate it or resend the invite automatically. When accepted, run the measured 20-minute fake-data walkthrough in docs/DEMO_WALKTHROUGH.md and record the clinic's workflow evidence and Go / Revise / Stop decision. Use private tracking for contact identifiers.
The internal 2026-09-08 fake-data rehearsal is recorded in docs/VALIDATION_RUNS.md as Go to manual client follow-up and a real fake-data validation call. Do not treat that as a customer paid-pilot approval; the customer-level Go / Revise / Stop remains pending.
The controlled offer is documented as a $100, 30-day founding clinic pilot using fake data. Real patient data remains blocked by docs/REAL_DATA_READINESS.md, and no HIPAA compliance claim is authorized.
Before ending, update the root continuity files, TOBI_OS state, portfolio pipeline, and resume system.
```
