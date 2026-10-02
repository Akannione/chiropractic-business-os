import {
  assertSecureAuthConfig,
  assertValidPracticeTimeZone,
  env,
} from '../config/env.js';

function fail(message: string): never {
  throw new Error(message);
}

function isLocalHost(value: string) {
  return /localhost|127\.0\.0\.1|\[::1\]/i.test(value);
}

function main() {
  assertSecureAuthConfig(env);
  assertValidPracticeTimeZone(env);

  if (!Number.isFinite(env.port) || env.port <= 0) {
    fail(`PORT "${env.port}" is invalid.`);
  }

  if (!/^mongodb(\+srv)?:\/\//i.test(env.mongoUri)) {
    fail('MONGODB_URI must be a valid MongoDB URI.');
  }

  if (!/^https?:\/\//i.test(env.corsOrigin)) {
    fail('CORS_ORIGIN must be an HTTP(S) origin.');
  }

  const target = String(process.env.VERIFY_ENV_TARGET || 'local').toLowerCase();

  if (target === 'production') {
    if (isLocalHost(env.mongoUri)) {
      fail('Production MONGODB_URI must not point to localhost.');
    }

    if (isLocalHost(env.corsOrigin)) {
      fail('Production CORS_ORIGIN must not point to localhost.');
    }

    if (env.demoMode) {
      fail('BUSINESS_OS_DEMO_MODE must not be enabled for a real-data production deployment.');
    }

    if (!env.adminPassword) {
      fail('ADMIN_PASSWORD is required by the current production authentication model.');
    }
  }

  console.log({
    ok: true,
    target,
    port: env.port,
    mongoConfigured: Boolean(env.mongoUri),
    corsOrigin: env.corsOrigin,
    authEnabled: Boolean(env.adminPassword),
    demoMode: env.demoMode,
    practiceTimeZone: env.practiceTimeZone,
    webhookConfigured: Boolean(env.webhookSecret),
    notificationConfigured: Boolean(
      env.notificationEmail && env.smtp.host && env.smtp.user && env.smtp.pass
    ),
  });
}

try {
  main();
  console.log('Environment verification passed.');
} catch (error) {
  console.error(error);
  process.exit(1);
}
