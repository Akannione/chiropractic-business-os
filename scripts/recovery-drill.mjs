import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';

const size = process.env.RECOVERY_DRILL_SIZE || '50000';
const source =
  process.env.RECOVERY_SOURCE_URI ||
  'mongodb://127.0.0.1:27017/cbos_benchmark';

const target =
  process.env.RECOVERY_TARGET_URI ||
  'mongodb://127.0.0.1:27017/cbos_benchmark_restore';

const dumpPath = '/tmp/cbos-recovery-drill';

function run(command, args, env = {}) {
  console.log(`\n$ ${command} ${args.join(' ')}`);

  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function parse(uri) {
  const match = uri.match(
    /^mongodb:\/\/([^/]+)\/([^?]+)/
  );

  if (!match) {
    throw new Error(
      'Recovery drill currently supports local mongodb:// URIs only.'
    );
  }

  return {
    host: match[1],
    database: match[2],
  };
}

const src = parse(source);
const dst = parse(target);

for (const item of [src, dst]) {
  if (!['127.0.0.1:27017', 'localhost:27017'].includes(item.host)) {
    throw new Error(
      `Refusing recovery drill against non-local MongoDB host: ${item.host}`
    );
  }

  if (!item.database.includes('benchmark')) {
    throw new Error(
      `Refusing recovery drill against database "${item.database}".`
    );
  }
}

rmSync(dumpPath, { recursive: true, force: true });

console.log('\n=== 1. BUILD BENCHMARK DATABASE ===');

run(
  'npm',
  ['--prefix', 'backend', 'run', 'bench'],
  {
    BENCH_SIZE: size,
    BENCH_MONGODB_URI: source,
  }
);

console.log('\n=== 2. CREATE BACKUP ===');

run('mongodump', [
  `--uri=${source}`,
  `--out=${dumpPath}`,
]);

console.log('\n=== 3. RESTORE INTO ISOLATED DATABASE ===');

run('mongorestore', [
  '--uri=mongodb://127.0.0.1:27017',
  `--nsFrom=${src.database}.*`,
  `--nsTo=${dst.database}.*`,
  '--drop',
  dumpPath,
]);

console.log('\n=== 4. VERIFY RESTORE ===');

run(
  'npm',
  ['run', 'verify:restore'],
  {
    RESTORE_SOURCE_URI: source,
    RESTORE_TARGET_URI: target,
  }
);

console.log('\n=== 5. EXERCISE RESTORED DATABASE ===');

run(
  'npm',
  ['--prefix', 'backend', 'run', 'bench'],
  {
    BENCH_SIZE: size,
    BENCH_MONGODB_URI: target,
  }
);

console.log('\nRecovery drill passed.');
