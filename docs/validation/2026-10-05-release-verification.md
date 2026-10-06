# Local release verification - October 5, 2026

Executed through Remote Desktop Commander on the developer Mac. This is local verification, not production certification or authorization to use real patient data.

## Changes

- Backend lockfile: proxy-addr 2.0.7 to 2.0.8, resolving the critical advisory reported by npm audit.
- Frontend lockfile: source-map-js 1.2.1 to 1.2.2, resolving the high advisory reported by npm audit.
- No application behavior or schema changes. Existing uncommitted demo assets preserved.

## Verified

- Typecheck, service/frontend/routing tests, database tests, build, bundle budget, tracked-secret scan and diff whitespace check passed after dependency updates.
- Both complete dependency audits reported zero vulnerabilities after updates. This is a point-in-time registry result, not a security guarantee.
- Chromium and WebKit: all 70 workflow/accessibility tests passed again after updates (46.6 seconds).
- Firefox retry: 34 passed, one intentional telemetry-harness skip. The first run timed out in the accessibility scan and was interrupted; retry used a 90-second timeout.
- Auth smoke: unauthenticated 401, rejected password, valid login, refresh and logout passed on isolated ports 4020/5174.
- Recovery drill: 50,000 synthetic inquiries backed up and restored with zero failed documents. Counts, indexes and all nine KPI values matched. Restored-database benchmark passed.
- Local frontend and proxied API health passed on ports 5173/4010.

## Isolation and evidence

MongoDB storage: /tmp/cbos-checks-20261005/mongo-data. Test and benchmark databases only; no production connection used. Temporary test passwords are not production credentials.

Logs: /tmp/cbos-checks-20261005/. Recovery backup: /tmp/cbos-recovery-drill/. These temporary files may disappear after cleanup or restart.

## Remaining gates

Production deployment, production credentials and a clinic pilot are not verified by this local run. Do not represent automated accessibility checks as a full accessibility audit or this run as HIPAA certification.
