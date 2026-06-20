# Lessons Learned

## Problems Encountered

* Backend typecheck failed because `backend/node_modules/@types` contained malformed extraneous folders such as `node 2`, `express 2`, and similar duplicate type packages.
* A local production build without `VITE_API_BASE_URL` embedded `http://localhost:4000/api` into the frontend bundle.
* Render CLI authentication is not enough for deployment; the active workspace also needs payment info before Blueprint validation passes.
* Blueprint validation for a git-based Render service requires a `repo` field in `render.yaml`.
* Product renames should include the React UI, HTML title, backend health label, package metadata, docs, deployment examples, and runtime troubleshooting docs.
* Continuity files can lag behind Git history; verify `git log`, cloud environment variables, and live endpoints before repeating a listed next action.
* Vercel deploys an Express app directly when the project root is `backend/` and the Express application has a default export.
* Separate Vercel projects for `backend/` and `frontend/` are simpler than forcing both into one build configuration.
* A deployment can be ready while database-backed routes are unavailable; verify health and a database endpoint.
* Credentials pasted into terminal commands can enter shell history, and credentials pasted into chat must be rotated.

## Solutions Discovered

* `npm prune --prefix backend` removed the malformed extraneous type folders and restored clean TypeScript validation.
* `frontend/src/services/api.ts` now keeps localhost as a dev-only fallback and uses `/api` when production builds lack `VITE_API_BASE_URL`.
* Adding `repo: https://github.com/Akannione/chiropractic-business-os` removed the Render `repo is required for git-based services` validation error.

## Reusable Patterns

* For Vite deployments, inspect the built `frontend/dist` bundle for stale localhost API URLs before calling a deployment ready.
* For Vercel deployments, inspect the live deployed JS bundle as well as the local `dist` bundle.
* For Render deployments, run `render workspace current --output json`, `render blueprints validate ./render.yaml --output json`, and `render services --output json` before assuming backend infrastructure exists.
* Use package-manager cleanup before manual deletion when `node_modules` contains extraneous dependency artifacts.
* Separate frontend/backend deployments require explicit production API variables and matching CORS configuration.
* Keep the public brand (`CBOS`) separate from stable infrastructure identifiers such as the existing GitHub repository URL unless the deployment references are also being updated.

## Process Improvements

* Continuity files should record exact deployment env requirements, not just build commands.
* Production readiness checks should include bundle inspection in addition to `npm run build`.
* When a CLI blocker depends on account billing or dashboard state, record the exact error and the next human action instead of retrying the same command.
