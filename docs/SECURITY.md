# CBOS Security Posture

Last reviewed: 2026-08-14.

CBOS holds patient names, phone numbers, email addresses, and clinical service
interest. That is personal health-adjacent data even though the application
stores no diagnoses or notes from treatment.

## Current posture: open demo

The production deployment runs with `ADMIN_PASSWORD` unset, so `authEnabled` is
false and every endpoint is reachable by anyone who knows the URL. Combined
with an Atlas network rule permitting all addresses, there is no access control
at any layer.

That is acceptable only because the database contains nothing but fabricated
demo records. **It must be closed before a single real patient is entered.**
The three steps are in "Before real data" below.

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

## Before real data

These need access CBOS does not have and were not performed.

1. **Set the staff credentials in Vercel** on the API project, then redeploy:

   ```
   ADMIN_PASSWORD=<a strong password>
   AUTH_TOKEN_SECRET=<openssl rand -hex 32>
   ```

   If the secret is missing or weak the deployment will fail to boot, by
   design. Verify afterwards that `/api/auth/status` reports
   `{"authEnabled":true}` and that `/api/inquiries` returns 401 without a
   token.

2. **Set `BUSINESS_OS_DEMO_MODE=false`.** While it is true, `/api/demo/reset`
   will delete every record, and that route is reachable by anyone whenever
   login is off.

3. **Restrict Atlas network access.** It currently permits all addresses to
   accommodate Vercel's dynamic egress. The strong database credential is the
   only thing limiting access. Options, best first: a dedicated static egress
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
