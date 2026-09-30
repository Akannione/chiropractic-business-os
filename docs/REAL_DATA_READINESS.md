# Real-Data Readiness Gate

## Current decision

**RED: do not place real patient data or protected health information in CBOS.**

The current product is ready for fake-data validation and can evaluate approved de-identified exports. It is not represented as HIPAA compliant. This document is an engineering and operational gate, not legal advice or a compliance certification.

## Required approvals before real patient data

- legal/compliance review appropriate to the practice and hosting arrangement;
- written data-processing responsibilities and permitted-use scope;
- hosting and vendor review, including whether required agreements are available;
- production access-control design with individual accounts or an approved alternative;
- audit-log and access-review requirements;
- encryption, backup, retention, deletion, and incident-response requirements;
- minimum-necessary field review;
- support-access and credential-management process;
- tested restore and offboarding process;
- explicit owner acceptance of residual risk.

## Engineering controls already present (not a compliance determination)

- protected staff routes can fail closed behind authentication;
- authentication secrets are rejected at startup when configured with known placeholders or insufficient length;
- login and public-intake abuse controls exist, with deterministic auth-enabled browser smoke coverage;
- the temporary staff bearer token is scoped to browser session storage rather than persistent local storage;
- API responses carrying operational data are marked `Cache-Control: no-store`;
- frontend and API responses set anti-framing, MIME-sniffing, referrer, permissions, and Content Security Policy headers;
- public webhook intake requires a configured shared secret before it can be used;
- inquiry changes create an operational activity trail;
- production dependency audits currently report no known vulnerabilities;
- automated accessibility and release-candidate browser tests run in CI.

These controls improve the engineering baseline. They do **not** satisfy the real-data gate by themselves.

## Technical gaps already known

- shared staff password rather than individual identity;
- limited token revocation;
- no complete read-access audit trail;
- no field-level encryption;
- process-local rate limiting;
- current demo hosting/network configuration is not a final client architecture;
- data retention, backup, restore, and deletion procedures require client-specific approval.

## De-identification check

Before accepting a sample, remove or replace names, phone numbers, email addresses, record identifiers, addresses, dates that identify a person, free-text clinical notes, insurance details, balances, diagnoses, and treatment information. If uncertain, use synthetic data.

## Gate result

- Fake data: allowed.
- Approved de-identified data: allowed only after manual review of the sample.
- Real patient data / PHI: blocked.

The gate may move from RED only after the approvals and controls above are independently reviewed and documented. Product code alone cannot make that determination.

## Current regulatory/security baseline used for this gate

The engineering gate is intentionally aligned to the currently effective HHS HIPAA Security Rule summary and OCR risk-analysis guidance, which emphasize risk analysis/risk management plus access control, audit controls, authentication, integrity, and transmission security for systems handling ePHI. HHS's January 2026 cybersecurity guidance also emphasizes system hardening, vulnerability management, and security baselines.

The December 2024 HIPAA Security Rule cybersecurity proposal is treated as a proposal, not as the currently effective rule. Its stronger direction (for example stronger encryption, testing, and technical-control expectations) is useful for architecture planning but is not represented here as current law.

Before any real-data pilot, obtain qualified legal/compliance review for the actual clinic, data flows, vendors, hosting, agreements, and operational procedures. The product team must not infer compliance from code controls alone.
