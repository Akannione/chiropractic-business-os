import { Router } from 'express';
import { getConfig } from '../controllers/configController.js';
import { postDemoReset, postSeed } from '../controllers/demoController.js';
import { exportInquiriesCsv } from '../controllers/exportController.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { rateLimit } from '../middleware/rateLimiter.js';
import { getKpis, getWeeklySummary } from '../controllers/reportController.js';
import { postImportCsv, postImportCsvPreview, postPublicInquiry, postWebhookInquiry } from '../controllers/automationController.js';
import {
  getInquiries,
  patchInquiry,
  postInquiry,
} from '../controllers/inquiryController.js';

export const inquiryRouter = Router();
const intakeLimiter = rateLimit({ maxRequests: 30, windowMs: 15 * 60 * 1000 });

inquiryRouter.get('/config', getConfig);
inquiryRouter.post('/public/inquiries', intakeLimiter, asyncHandler(postPublicInquiry));
inquiryRouter.post('/webhooks/inquiries', intakeLimiter, asyncHandler(postWebhookInquiry));
inquiryRouter.post('/imports/inquiries.csv/preview', asyncHandler(postImportCsvPreview));
inquiryRouter.post('/imports/inquiries.csv', asyncHandler(postImportCsv));
inquiryRouter.get('/inquiries', asyncHandler(getInquiries));
inquiryRouter.post('/inquiries', asyncHandler(postInquiry));
inquiryRouter.patch('/inquiries/:id', asyncHandler(patchInquiry));
inquiryRouter.get('/kpis', asyncHandler(getKpis));
inquiryRouter.get('/weekly-summary', asyncHandler(getWeeklySummary));
inquiryRouter.get('/exports/inquiries.csv', asyncHandler(exportInquiriesCsv));
inquiryRouter.post('/demo/reset', asyncHandler(postDemoReset));
inquiryRouter.post('/seed', asyncHandler(postSeed));
