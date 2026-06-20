# Continue Commands

## Project Path

```bash
cd "/Users/tobiloba202/Documents/New project/business_os_mvp"
```

## Open In IDE

### VS Code

```bash
code .
```

### Cursor

```bash
cursor .
```

## Git Status

```bash
git status
git branch
git log --oneline -5
```

## Environment Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install --upgrade pip
```

## Install Dependencies

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
npm run install:all
```

## Run Project

```bash
npm run dev:backend
npm run dev:frontend
npm run dev --prefix backend
npm run dev --prefix frontend
```

## Test Project

```bash
npm test
npm test --prefix backend
npm run typecheck
npm run typecheck --prefix backend
npm run typecheck --prefix frontend
npm run build
```

## Validate Outputs

```bash
ls -la
find . -maxdepth 3 -type f | sort
rg -n "CBOS|cbos" -g '!node_modules' -g '!dist' -g '!.git' .
curl -s http://localhost:4000/api/health
rg -n "http://localhost:4000/api" frontend/dist frontend/src
LIVE_JS_PATH=$(curl -sL https://frontend-gold-alpha-31.vercel.app | rg -o '/assets/[^" ]+\.js' | head -1)
curl -sL "https://frontend-gold-alpha-31.vercel.app${LIVE_JS_PATH}" | rg -n "http://localhost:4000/api" || true
curl -i https://cbos-api.vercel.app/api/health
curl -i https://cbos-api.vercel.app/api/config
vercel env ls production --cwd backend
vercel env ls production --cwd frontend
```

## Deployment

```bash
# After rotating the Atlas password, enter the replacement URI when prompted.
cd "/Users/tobiloba202/Documents/New project/business_os_mvp/backend"
vercel env add MONGODB_URI production --sensitive
vercel deploy --prod --force
curl https://cbos-api.vercel.app/api/health
curl https://cbos-api.vercel.app/api/config

# Frontend deployment.
cd "/Users/tobiloba202/Documents/New project/business_os_mvp/frontend"
vercel deploy --prod --force
```

## Resume With Codex

Paste this into a new Codex session:

```text
Read AGENTS.md, PROJECT_STATUS.md, NEXT_STEPS.md, KNOWN_ISSUES.md, LESSONS_LEARNED.md, and CONTINUE_COMMANDS.md.
Determine the current project state.
Run the appropriate continuation commands.
Continue from the highest-priority unfinished task.
Do not repeat completed work.
Before ending, update all continuity files again.
```
