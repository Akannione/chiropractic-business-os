# Known Issues

## Open Issues

* The MongoDB Atlas database-user password was exposed and must be rotated.
* `cbos-api` does not yet have `MONGODB_URI`, so database-backed routes return an error.
* Atlas Network Access must allow Vercel before the API can reach the cluster.
* Local `.env` files are not present; `.env.example` files exist for backend and frontend.
* `npm audit` reports one low-severity backend dependency issue after `npm prune --prefix backend`.

## Risks

* The exposed Atlas password must never be reused.
* Allowing `0.0.0.0/0` is convenient for a demo but requires a strong unique database password.
* Vercel Hobby and Atlas M0 are demo infrastructure, not the final paying-client hosting plan.
* The GitHub repository URL still uses the original `chiropractic-business-os` slug for deployment continuity, while the product name and public-facing docs now use `CBOS`.

## Blockers

* Production data workflows depend on rotating the Atlas password and entering the replacement URI directly in Vercel.

## Workarounds

* Local development can use `frontend/.env` with `VITE_API_BASE_URL=http://localhost:4000/api`.
* Production frontend is already configured for `https://cbos-api.vercel.app/api`.
* Use `docs/PRODUCTION_DEPLOYMENT.md` as the deployment checklist.
