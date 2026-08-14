import cors from 'cors';
import express from 'express';
import { connectDatabase } from './config/database.js';
import { assertSecureAuthConfig, env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { inquiryRouter } from './routes/inquiryRoutes.js';

// Checked before the app accepts traffic rather than at first login.
assertSecureAuthConfig();

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
  next();
});

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(express.text({ type: ['text/csv', 'text/plain'], limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'CBOS API' });
});

app.use('/api', (_req, _res, next) => {
  connectDatabase().then(() => next()).catch(next);
});
app.use('/api', inquiryRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
