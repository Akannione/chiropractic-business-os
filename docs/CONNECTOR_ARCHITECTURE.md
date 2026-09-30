# CBOS Connector Architecture

## Purpose

Define one integration boundary so CBOS can start with CSV exports and later support additional transport methods without rewriting the intelligence engine.

This is an architecture contract, not a promise that any vendor connector exists today.

## Connector pipeline

```text
Source system
  -> transport adapter
  -> report/file classifier
  -> schema/evidence mapper
  -> source validator
  -> normalized operational facts
  -> identity/conflict layer
  -> intelligence rules
  -> action/review outputs
```

The source adapter owns source-specific names and formats. Core CBOS logic should not contain vendor-specific assumptions.


## Transport ladder

Build only as evidence requires:

1. Manual CSV upload — current validation transport.
2. Watched/export folder — useful when the source cannot expose an API.
3. Scheduled file delivery or SFTP — only where a clinic/vendor supports it.
4. Vendor API / webhook — preferred when officially available and contractually permitted.
5. Healthcare interoperability transport such as FHIR or HL7 — future enterprise path, not an MVP requirement.

A higher rung does not automatically replace a lower rung. The correct connector depends on the source system and the clinic's workflow.

## Adapter contract

Every future adapter should produce:

- source system and report type;
- source record identifier when one exists;
- source updated timestamp when one exists;
- normalized field names and types;
- validation errors and warnings;
- evidence provenance for derived metrics;
- an explicit list of fields the adapter does not understand.

Adapters must never silently invent missing source fields.


## Authority and writeback

The current model is read-mostly.

Source systems remain authoritative for clinical, billing, appointment-history, and other source-owned facts. CBOS owns its operational follow-up state.

Before any two-way sync, CBOS must define:

- field authority;
- stable identity;
- conflict detection;
- idempotency;
- deletion behavior;
- retry behavior;
- auditability;
- operator review for destructive changes.

No two-way EHR writeback is approved in the current product.

## Intelligence contract

Intelligence rules consume normalized facts, not raw vendor rows.

Every surfaced signal should include enough evidence to answer:

- Which source/report produced it?
- Which columns were required?
- What calculation was applied?
- Is the result a count, currency amount, percentage, or status?
- What assumption, if any, remains unresolved?

Unknown or insufficient evidence should produce no signal rather than a guessed result.


## Current implementation

`docs/INTELLIGENCE_FOUNDATION_V1.md` implements the first non-persistent slice:

- multiple CSV inputs;
- report classification;
- semantic evidence mapping;
- repeated-row detection;
- a small set of supported operational signals;
- synthetic demo data.

The implementation intentionally stops before recurring ingestion, persistent import history, source-specific adapters, cross-report patient identity, or writeback.

## Validation gate

Promote a connector only when a clinic workflow proves all of the following:

1. The export/API removes meaningful repeated manual work.
2. Required fields are stable enough to map.
3. Identity is reliable enough for the intended operation.
4. Conflicts can be explained before applying changes.
5. The clinic can use the resulting signal or action.
6. Privacy/security requirements for the data mode are satisfied.

Until then, keep the connector as a preview experiment.
