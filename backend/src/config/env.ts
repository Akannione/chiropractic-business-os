import dotenv from 'dotenv';

dotenv.config();

/**
 * Placeholders shipped in the example env files. Signing session tokens with
 * any of these is the same as having no secret at all, because the value is
 * public in the repository.
 */
const PLACEHOLDER_SECRETS = new Set([
  'local-dev-secret-change-me',
  'change-this-long-random-secret',
  'change-me',
  'secret',
]);

const MINIMUM_SECRET_LENGTH = 32;

export const env = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chiropractic_business_os',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  authTokenSecret: process.env.AUTH_TOKEN_SECRET || 'local-dev-secret-change-me',
  practiceName: process.env.PRACTICE_NAME || 'Chiropractic Practice',
  demoMode: ['1', 'true', 'yes', 'on'].includes(
    String(process.env.BUSINESS_OS_DEMO_MODE || '').toLowerCase(),
  ),
  notificationEmail: process.env.INTERNAL_NOTIFICATION_EMAIL || '',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    secure: ['1', 'true', 'yes', 'on'].includes(String(process.env.SMTP_SECURE || '').toLowerCase()),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || process.env.SMTP_USER || '',
  },
};

/**
 * Refuses to start when staff login is switched on but the token secret is
 * still a placeholder or too short.
 *
 * Session tokens are HMACs keyed on this secret. With a known secret anyone
 * can mint a valid admin token, so the login screen would look like
 * protection while providing none. Failing closed is deliberate: for an
 * application holding patient contact details, an outage is a better failure
 * than silent open access.
 *
 * Auth off is left alone. That is the demo posture, and it is honest about
 * being unprotected rather than pretending otherwise.
 */
export function assertSecureAuthConfig(config = env) {
  if (!config.adminPassword) return;

  const secret = config.authTokenSecret;
  if (PLACEHOLDER_SECRETS.has(secret)) {
    throw new Error(
      'ADMIN_PASSWORD is set but AUTH_TOKEN_SECRET is still a placeholder from the example env file. '
        + 'Session tokens signed with a public value can be forged. '
        + 'Generate one with: openssl rand -hex 32',
    );
  }

  if (secret.length < MINIMUM_SECRET_LENGTH) {
    throw new Error(
      `ADMIN_PASSWORD is set but AUTH_TOKEN_SECRET is only ${secret.length} characters; `
        + `at least ${MINIMUM_SECRET_LENGTH} are required. Generate one with: openssl rand -hex 32`,
    );
  }
}
