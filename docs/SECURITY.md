# CBOS Security Posture

Last reviewed: 2026-08-22.

CBOS holds patient names, phone numbers, email addresses, and clinical service
interest. That is personal health-adjacent data even though the application
stores no diagnoses or notes from treatment.

## Current posture: closed

Staff login was switched on in production on 2026-08-22. `ADMIN_PASSWORD` is
set as a Vercel sensitive secret and `AUTH_TOKEN_SECRET` is a freshly generated
64-character value. Verified against the live deployment immediately after:

| Check | Result |
|---|---|
| `/api/auth/status` | `{"authEnabled":true}` |
| Eight staff read routes without a token | 401 |
| `POST /api/demo/reset` and `/api/seed` without a token | 401 |
| Wrong password | 401 `Incorrect password.` |
| Forged bearer token | 401 |
| Response headers | nosniff, DENY, no-referrer present |

The routes that must stay open still are: `/api/health`, `/api/config`, and
`/api/auth/status` return 200, and `POST /api/public/inquiries` returns 201, so
the website intake form still accepts patients. CORS returns the frontend
origin, and the frontend loads and now presents the login screen.

One layer remains open: Atlas still permits all network addresses. See below.

### Note on the demo data

The check above submitted one record through the public intake form, named
"Verification Probe", to confirm the form still worked after the change. It is
still in the production demo database and will appear in the inquiry list.
Clearing it needs `Reset demo data`, which now requires logging in.

## Fixed in the application

| Area | What was wrong | What it does now |
|---|---|---|
| Token secret | `AUTH_TOKEN_SECRET` fell back to a placeholder committed in the repo. Enabling login with it would have produced forgeable admin tokens: a login screen offering no protection. | Startup fails when `ADMIN_PASSWORD` is set and the secret is a known placeholder or shorter than 32 characters. |
| Login brute force | `/api/auth/login` had no rate limit, so the staff password could be guessed without limit. | Limited to 10 attempts per address per 15 minutes. |
| Login with auth off | Any password returned a token, which reads as a working login and is not one. | Returns 400 explaining login is not configured. |
| Password comparison | A length check ran before the constant-time compare, revealing the configured password's length. | Both sides are hashed to fixed width, so one constant-time comparison covers length and content. |
| Demo seeding | The seed ran on every connection whenever the collection was empty. A real clinic whose data was lost would silently refill with invented patients, indistinguishable from real ones to staff. | Runs only in demo mode. `resetSampleData` also refuses outside demo mode, guarded at the service as well as the controller. |
| Rate limiter | Its map of windows was never pruned, growing by one entry per address seen. Addresses are attacker-influenced, so the limiter was itself a denial-of-service vector. | Expired windows are swept at most once a minute. |
| Client addresses | Behind Vercel's proxy every request carried the proxy's address, collapsing the intake limiter into one global bucket where a single abusive caller locks out the whole practice. | `trust proxy` is set, so limits apply per client. |
| Response headers | None set. | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, and `x-powered-by` disabled. |
| Dependencies | Two high-severity advisories in the frontend, plus a body-parser denial of service and a moderate Mongoose advisory in the backend. | Both trees report zero vulnerabilities. |

Route protection itself was already correct: `requireStaffAuth` is mounted
ahead of every staff route, with only config, auth, public intake, and the
webhook above it.

## How staff login was turned on

Kept for the next deployment, and for rotating the password.

The API project is `cbos-api`. `AUTH_TOKEN_SECRET` was rotated first, to a
freshly generated 64-character value, so the startup guard could not be tripped
by a leftover placeholder. Its previous value could not be read back: Vercel
stores these encrypted and `vercel env pull` returns them empty, so rotation was
the only way to know what was there. Rotating cost nothing at that point because
login was still off and no sessions existed.

The password itself is set directly and never passed through anything that would
record it.

**Run these from `backend/`, which is the API's deploy root and is linked to
`cbos-api`.** The repository root links to a different project, and running
them from a home directory will either fail or, worse, offer to deploy that
directory:

```bash
cd "/Users/tobiloba202/Developer/New project/business_os_mvp/backend"
vercel env add ADMIN_PASSWORD production
vercel --prod
```

Then confirm:

```bash
curl -s https://cbos-api.vercel.app/api/auth/status     # {"authEnabled":true}
curl -so /dev/null -w '%{http_code}\n' \
  https://cbos-api.vercel.app/api/inquiries             # 401
```

If the deployment refuses to boot citing `AUTH_TOKEN_SECRET`, that is the guard
working: generate one with `openssl rand -hex 32` and set it the same way.

## Demo mode

An earlier version of this document said to set `BUSINESS_OS_DEMO_MODE=false`
as a general hardening step. That was too blunt.

The production deployment is a genuine demo holding fabricated records, and
demo mode is what makes `Reset demo data` work. The real hazard is that
`/api/demo/reset` deletes every record and is reachable by anyone **while login
is off**. Once staff login is on, that route requires a token and the exposure
is gone.

So: demo mode may stay true for a demo with fake data, provided login is on. It
must be false before the deployment holds a single real patient, at which point
resetting the collection is never something anyone should be able to do.

## Atlas network access

Still open, and outside anything CBOS can reach. Atlas currently permits all
addresses to accommodate Vercel's dynamic egress, leaving the database
credential as the only control. Options, best first: a dedicated static egress
address, Atlas private endpoints, or at minimum a documented review.

## Known gaps

* **Single shared staff password.** There are no individual accounts, so
  activity cannot be attributed to a person and access cannot be revoked for
  one member of staff. Acceptable for a pilot; not for sustained real use.
* **Sessions cannot be revoked.** Tokens are self-contained HMACs valid for 12
  hours. Changing `AUTH_TOKEN_SECRET` invalidates all of them at once, which is
  the only revocation available.
* **No audit trail for reads.** The activity log records creation and updates,
  not who viewed which patient.
* **No encryption beyond transport and Atlas at-rest defaults.** Fields are not
  separately encrypted.
* **CORS depends on `CORS_ORIGIN` being set correctly** in production; it is not
  verifiable from the repository.

None of these block a fake-data pilot. All of them matter before the
application becomes a practice's system of record.
