# Performance Baseline

## Scope

Synthetic local benchmark evidence for CBOS release-candidate read paths. This is not a production SLA.

The benchmark uses a dedicated database named `cbos_benchmark`, deterministic fake inquiry data, and the real service functions. It refuses non-benchmark database names and asserts KPI aggregation parity.

Run:

```bash
BENCH_SIZE=50000 npm run bench
```

## Results captured 2026-10-01

| Records | KPI JS | KPI aggregation | Weekly summary | Reactivations | Inquiry page 1 | Search | Whole collection | Duplicate scan | Email lookup |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1,000 | 15.6 ms | 19.5 ms | 6.6 ms | 26.6 ms | 10.4 ms | 21.1 ms | 24.2 ms | 3.2 ms | 0.6 ms |
| 10,000 | 33.5 ms | 50.8 ms | 32.2 ms | 43.4 ms | 6.4 ms | 52.3 ms | 58.2 ms | 19.9 ms | 0.8 ms |
| 25,000 | 77.5 ms | 134.4 ms | 79.2 ms | 106.8 ms | 22.6 ms | 159.7 ms | 149.3 ms | 51.3 ms | 0.7 ms |
| 50,000 | 136.6 ms | 367.4 ms | 163.4 ms | 228.4 ms | 44.0 ms | 414.3 ms | 332.6 ms | 103.7 ms | 0.8 ms |

All four runs passed KPI parity.

The 50,000-record restored-database verification also passed KPI parity without reseeding; timings remained in the same range.

## Index evidence

The benchmark database includes:

- `email_1`
- `phone_1`
- `created_at_-1__id_-1`
- `status_1_next_follow_up_date_1`
- `status_1_patient_type_1_last_visit_date_1`

The 50,000-record email lookup examined exactly one document to return one result.

## Known search limitation

Free-text inquiry search currently uses an escaped, case-insensitive substring regular expression across:

- name;
- phone;
- email;
- requested service;
- activity context;
- notes.

At 50,000 synthetic records, `explain("executionStats")` reported:

```text
nReturned: 11
docsExamined: 50000
keysExamined: 50000
executionMs: 381
```

This is a known full-collection scan. It is acceptable for the current controlled pilot scale but is the first read path to revisit if actual clinic usage or dataset size makes search latency material.

Do not add speculative indexes for the current substring regex. If evidence requires search optimization, evaluate a normalized search strategy or a dedicated search capability with measured before/after plans.

## Decision

Performance is not a current launch blocker for a small-practice pilot. Further optimization should be driven by observed clinic scale and latency rather than synthetic maximums.
