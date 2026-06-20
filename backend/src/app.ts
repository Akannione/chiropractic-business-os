import cors from 'cors';
import express from 'express';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { inquiryRouter } from './routes/inquiryRoutes.js';

export const app = express();

app.disable('x-powered-by');
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
