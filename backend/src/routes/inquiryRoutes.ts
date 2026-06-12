import { Router } from 'express';
import { getConfig } from '../controllers/configController.js';
import { postDemoReset, postSeed } from '../controllers/demoController.js';
import { exportInquiriesCsv } from '../controllers/exportController.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getKpis, getWeeklySummary } from '../controllers/reportController.js';
import { postImportCsv, postPublicInquiry, postWebhookInquiry } from '../controllers/automationController.js';
import {
  getInquiries,
  patchInquiry,
  postInquiry,
} from '../controllers/inquiryController.js';

export const inquiryRouter = Router();

inquiryRouter.get('/config', getConfig);
inquiryRouter.post('/public/inquiries', asyncHandler(postPublicInquiry));
inquiryRouter.post('/webhooks/inquiries', asyncHandler(postWebhookInquiry));
inquiryRouter.post('/imports/inquiries.csv', asyncHandler(postImportCsv));
inquiryRouter.get('/inquiries', asyncHandler(getInquiries));
inquiryRouter.post('/inquiries', asyncHandler(postInquiry));
inquiryRouter.patch('/inquiries/:id', asyncHandler(patchInquiry));
inquiryRouter.get('/kpis', asyncHandler(getKpis));
inquiryRouter.get('/weekly-summary', asyncHandler(getWeeklySummary));
inquiryRouter.get('/exports/inquiries.csv', asyncHandler(exportInquiriesCsv));
inquiryRouter.post('/demo/reset', asyncHandler(postDemoReset));
inquiryRouter.post('/seed', asyncHandler(postSeed));
