import dotenv from 'dotenv';

dotenv.config();

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
