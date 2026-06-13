import { Router } from 'express';
import { getActivities } from '../controllers/activityController.js';
import { getAuthStatus, postLogin } from '../controllers/authController.js';
import { getConfig } from '../controllers/configController.js';
import { postDemoReset, postSeed } from '../controllers/demoController.js';
import { exportInquiriesCsv } from '../controllers/exportController.js';
import { postDailySummary } from '../controllers/reminderController.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireStaffAuth } from '../middleware/authMiddleware.js';
import { rateLimit } from '../middleware/rateLimiter.js';
import { getKpis, getMonthlySummary, getWeeklySummary } from '../controllers/reportController.js';
import { postImportCsv, postImportCsvPreview, postPublicInquiry, postWebhookInquiry } from '../controllers/automationController.js';
import {
  getInquiries,
  patchInquiry,
  postInquiry,
} from '../controllers/inquiryController.js';

export const inquiryRouter = Router();
const intakeLimiter = rateLimit({ maxRequests: 30, windowMs: 15 * 60 * 1000 });

inquiryRouter.get('/config', getConfig);
inquiryRouter.get('/auth/status', getAuthStatus);
inquiryRouter.post('/auth/login', asyncHandler(postLogin));
inquiryRouter.post('/public/inquiries', intakeLimiter, asyncHandler(postPublicInquiry));
inquiryRouter.post('/webhooks/inquiries', intakeLimiter, asyncHandler(postWebhookInquiry));
inquiryRouter.use(requireStaffAuth);
inquiryRouter.post('/imports/inquiries.csv/preview', asyncHandler(postImportCsvPreview));
inquiryRouter.post('/imports/inquiries.csv', asyncHandler(postImportCsv));
inquiryRouter.get('/inquiries', asyncHandler(getInquiries));
inquiryRouter.post('/inquiries', asyncHandler(postInquiry));
inquiryRouter.patch('/inquiries/:id', asyncHandler(patchInquiry));
inquiryRouter.get('/activities', asyncHandler(getActivities));
inquiryRouter.get('/kpis', asyncHandler(getKpis));
inquiryRouter.get('/weekly-summary', asyncHandler(getWeeklySummary));
inquiryRouter.get('/monthly-summary', asyncHandler(getMonthlySummary));
inquiryRouter.post('/reminders/daily-summary', asyncHandler(postDailySummary));
inquiryRouter.get('/exports/inquiries.csv', asyncHandler(exportInquiriesCsv));
inquiryRouter.post('/demo/reset', asyncHandler(postDemoReset));
inquiryRouter.post('/seed', asyncHandler(postSeed));
