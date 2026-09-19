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
