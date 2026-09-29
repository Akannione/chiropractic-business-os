# CBOS Intelligence Foundation v1

## Decision

CBOS now has a bounded operational-intelligence preview layer. It is an extension of the current chiropractic operations product, not an EHR replacement and not a production healthcare data platform.

The v1 goal is to test whether multiple practice exports can be recognized and turned into useful operational review signals before CBOS invests in source-specific integrations.

## Flow

```text
Synthetic or reviewed de-identified CSV exports
  -> multi-file preview
  -> report classification
  -> header inspection
  -> supported metric extraction
  -> operational review signals
  -> human review
```

Nothing in this flow writes back to an EHR or imports the analyzed rows into CBOS.

## Current report patterns

The classifier can recognize these report families when filenames and headers provide enough evidence:

- Appointments
- Patient List
- Provider Hours
- Referral Sources
- Sales
- Accounts Receivable
- Payments / Payouts
- Packages / Care Plans
- Bank Transactions

Unknown files remain unknown instead of being force-mapped.


## Current signals

v1 deliberately supports only a small set of signals whose required columns are explicit:

- cancelled / missed / no-show appointment rows that may warrant recovery review;
- positive accounts-receivable exposure from detected balance columns;
- provider schedule utilization when both booked and available/scheduled hours are present.

These are review signals, not clinical recommendations, collection instructions, or guaranteed revenue opportunities.

## UI

The staff application now includes **Review -> Intelligence**.

The workspace supports:

1. selecting multiple CSV files;
2. previewing recognized report types and confidence;
3. reviewing detected headers and row counts;
4. seeing supported operational signals;
5. running a fully synthetic demonstration without uploading any file.

The synthetic demo exists so product validation can happen without real patient data.

## Safety boundary

Real patient data / PHI remains blocked by `docs/REAL_DATA_READINESS.md`.

The intelligence preview:

- does not persist uploaded CSV contents;
- does not write to the clinic source system;
- does not create clinical records;
- does not perform diagnosis or treatment logic;
- does not claim HIPAA compliance;
- does not silently map an unknown report.


## Validation target

Use the workspace with a clinic owner on fake data first. The key validation questions are:

- Does the system correctly recognize the reports they already export?
- Which calculations do they currently perform manually each month?
- Which detected signal changes an actual owner or staff action?
- Which missing report or column prevents a useful conclusion?
- Would this reduce manual cross-examination of exports without duplicating EHR work?

Only after a manually reviewed de-identified sample proves a repeatable need should CBOS add a dedicated adapter, recurring ingestion, or broader canonical data model.

## Implemented files

Backend:
- `backend/src/services/intelligenceService.ts`
- `backend/src/controllers/intelligenceController.ts`
- `backend/src/routes/inquiryRoutes.ts`

Frontend:
- `frontend/src/pages/IntelligencePage.tsx`
- `frontend/src/services/api.ts`
- `frontend/src/types.ts`
- `frontend/src/components/AppShell.tsx`
- `frontend/src/App.tsx`
- `frontend/src/styles/pilot-readiness.css`

Tests:
- backend classifier/signal regression coverage;
- frontend authenticated request regression coverage.
