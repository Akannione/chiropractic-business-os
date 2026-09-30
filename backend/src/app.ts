import cors from 'cors';
import express from 'express';
import { connectDatabase } from './config/database.js';
import { assertSecureAuthConfig, assertValidPracticeTimeZone, env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { inquiryRouter } from './routes/inquiryRoutes.js';

// Checked before the app accepts traffic rather than at first login.
assertSecureAuthConfig();
assertValidPracticeTimeZone();

export const app = express();

app.disable('x-powered-by');

// Vercel terminates TLS and proxies, so without this every client shares the
// proxy's address and the intake rate limiter becomes one global bucket: a
// single abusive caller would lock out the whole practice.
app.set('trust proxy', 1);

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' http://localhost:4000 http://localhost:4010");
  next();
});

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(express.text({ type: ['text/csv', 'text/plain'], limit: '1mb' }));

app.use('/api', (_req, res, next) => {
  // API responses must never be stored in shared browser/CDN caches. Static
  // frontend assets keep their normal Vercel cache behavior.
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'CBOS API' });
});

app.use('/api', (req, _res, next) => {
  // These endpoints are deterministic from environment/request data and do
  // not need MongoDB. Keeping Intelligence preview database-free lets a
  // protected branch preview validate report parsing without requiring a
  // clinic database or touching any patient store.
  const databaseFreePaths = new Set(['/config', '/auth/status', '/auth/login', '/intelligence/preview']);
  if (databaseFreePaths.has(req.path)) {
    next();
    return;
  }
  connectDatabase().then(() => next()).catch(next);
});
app.use('/api', inquiryRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
