# Backup and Restore Runbook

## Scope

This runbook proves CBOS restore mechanics against a **synthetic benchmark database only**. It is not a production backup policy and does not authorize use of real patient data.

Production recovery still requires an approved backup schedule, retention period, storage location, encryption/access model, recovery owner, RPO/RTO, restore drill cadence, offboarding process, and clinic/vendor review.

## Safety rules

- Never run destructive restore commands against demo, production, or a clinic database while following this development runbook.
- Benchmark database names must contain `benchmark`.
- Restore into a separate database first.
- Do not paste production MongoDB credentials into shell history, documentation, Git, or chat.

## 1. Create a synthetic benchmark database

From the repository root:

```bash
BENCH_SIZE=50000 npm run bench
```

The benchmark refuses databases whose name does not contain `benchmark`.

## 2. Create a dump

```bash
rm -rf /tmp/cbos-backup-test

mongodump \
  --uri="mongodb://127.0.0.1:27017/cbos_benchmark" \
  --out=/tmp/cbos-backup-test
```

Confirm the dump contains BSON plus metadata for the expected collections.

## 3. Restore into a separate database

Use the dump **root** as the final path. Passing only the individual database directory causes `mongorestore` to skip the BSON files when namespace remapping is used.

```bash
mongorestore \
  --uri="mongodb://127.0.0.1:27017" \
  --nsFrom="cbos_benchmark.*" \
  --nsTo="cbos_benchmark_restore.*" \
  --drop \
  /tmp/cbos-backup-test
```

Expected evidence includes:

```text
50000 document(s) restored successfully. 0 document(s) failed to restore.
```

and index-restoration lines for the inquiry and activity collections.

## 4. Verify the restore

```bash
RESTORE_SOURCE_URI="mongodb://127.0.0.1:27017/cbos_benchmark" \
RESTORE_TARGET_URI="mongodb://127.0.0.1:27017/cbos_benchmark_restore" \
npm run verify:restore
```

The read-only verifier compares:

- inquiry count;
- activity count;
- inquiry indexes;
- activity indexes;
- KPI results.

It refuses databases not named for benchmarking.

## 5. Exercise application read paths against the restored data

```bash
BENCH_SIZE=50000 \
BENCH_MONGODB_URI="mongodb://127.0.0.1:27017/cbos_benchmark_restore" \
npm run bench
```

The command must **not** print a seeding message. A seeding message means the target did not already contain the expected restored record count, so the benchmark would mask a failed restore.

## Recorded development evidence

On 2026-10-01, the local synthetic drill restored 50,000 of 50,000 inquiry records with zero failures and restored the expected indexes. The restored database then ran the CBOS benchmark without reseeding and passed KPI parity.

This evidence validates the development recovery mechanics only. It does not satisfy the real-data gate in `docs/REAL_DATA_READINESS.md`.
