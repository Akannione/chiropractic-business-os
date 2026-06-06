import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chiropractic_business_os',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  demoMode: ['1', 'true', 'yes', 'on'].includes(
    String(process.env.BUSINESS_OS_DEMO_MODE || '').toLowerCase(),
  ),
};

