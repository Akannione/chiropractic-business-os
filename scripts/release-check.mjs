import { spawn, spawnSync } from 'node:child_process';

function run(command, args, env = {}) {
  console.log(`\n==================================================`);
  console.log(`$ ${command} ${args.join(' ')}`);
  console.log(`==================================================\n`);

  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });

  if (result.status !== 0) {
    console.error(`\nRelease check failed: ${command} ${args.join(' ')}`);
    process.exit(result.status || 1);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(url, label) {
  for (let i = 0; i < 30; i += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log(`${label} ready: ${url}`);
        return;
      }
    } catch {}

    await sleep(1000);
  }

  throw new Error(`${label} did not become ready: ${url}`);
}

async function assertPortFree(port) {
  try {
    const response = await fetch(
      `http://localhost:${port}`,
      { signal: AbortSignal.timeout(1000) },
    );

    throw new Error(
      `Port ${port} is already in use. Stop the existing process before running E2E.`
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('already in use')
    ) {
      throw error;
    }
  }
}

async function runE2E() {
  console.log('\n=== Checking E2E ports ===');

  await assertPortFree(4010);
  await assertPortFree(5173);

  console.log('\n=== Starting isolated E2E stack ===');

  const api = spawn(
    'npm',
    ['run', 'dev:backend'],
    {
      stdio: 'inherit',
      env: {
        ...process.env,

        BUSINESS_OS_DEMO_MODE: 'true',
        MONGODB_URI: 'mongodb://127.0.0.1:27017/cbos_e2e',
        PORT: '4010',

        // E2E must never inherit a developer's local SMTP configuration.
        INTERNAL_NOTIFICATION_EMAIL: '',
        SMTP_HOST: '',
        SMTP_USER: '',
        SMTP_PASS: '',
        SMTP_FROM: '',
        SMTP_SECURE: '',
      },
    },
  );

  const frontend = spawn(
    './node_modules/.bin/vite',
    [
      '--host',
      'localhost',
      '--port',
      '5173',
      '--strictPort',
    ],
    {
      cwd: 'frontend',
      stdio: 'inherit',
      env: {
        ...process.env,
        VITE_API_BASE_URL: 'http://localhost:4010/api',
      },
    },
  );

  let exitCode = 0;

  try {
    await waitFor(
      'http://localhost:4010/api/health',
      'CBOS API',
    );

    await waitFor(
      'http://localhost:5173',
      'CBOS frontend',
    );

    // Verify that the frontend is actually proxying the current backend.
    await waitFor(
      'http://localhost:5173/api/config',
      'CBOS frontend API proxy',
    );

    const e2eCommand = process.platform === 'darwin'
      ? [
          './node_modules/.bin/playwright',
          'test',
          '--project=chromium',
          '--project=webkit',
        ]
      : ['npm', 'run', 'test:e2e:cross-browser'];

    if (process.platform === 'darwin') {
      console.log(
        '\nmacOS local E2E: Chromium + WebKit. Firefox remains required in CI.',
      );
    }

    const result = process.platform === 'darwin'
      ? spawnSync(
          e2eCommand[0],
          e2eCommand.slice(1),
          {
            cwd: 'frontend',
            stdio: 'inherit',
            env: {
              ...process.env,
              E2E_API_URL: 'http://localhost:4010/api',
              E2E_FRONTEND_URL: 'http://localhost:5173',
            },
          },
        )
      : spawnSync(
          e2eCommand[0],
          e2eCommand.slice(1),
          {
            stdio: 'inherit',
            env: {
              ...process.env,
              E2E_API_URL: 'http://localhost:4010/api',
              E2E_FRONTEND_URL: 'http://localhost:5173',
            },
          },
        );

    exitCode = result.status || 0;
  } finally {
    api.kill('SIGTERM');
    frontend.kill('SIGTERM');

    await sleep(1000);
  }

  if (exitCode !== 0) {
    throw new Error(
      `Cross-browser E2E failed with exit code ${exitCode}.`
    );
  }
}

async function main() {
  const checks = [
    ['npm', ['run', 'verify:env']],
    ['npm', ['run', 'verify:indexes']],
    ['npm', ['run', 'typecheck']],
    ['npm', ['run', 'test']],
    ['npm', ['run', 'test:db']],
    ['npm', ['run', 'build']],
    ['npm', ['run', 'check:bundle']],
    ['npm', ['run', 'check:secrets']],
    ['npm', ['audit', '--prefix', 'frontend', '--omit=dev']],
    ['npm', ['audit', '--prefix', 'backend', '--omit=dev']],
    ['git', ['diff', '--check']],
  ];

  for (const [command, args] of checks) {
    run(command, args);
  }

  if (process.env.RELEASE_E2E === '1') {
    await runE2E();
  }

  console.log('\n✅ CBOS release check passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
