import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  exportInquiriesCsv,
  getConfig,
  getInquiries,
  getKpis,
  getWeeklySummary,
  patchInquiry,
  postDemoReset,
  postInquiry,
  postPublicInquiry,
  postSeed,
} from '../controllers/inquiryController.js';

export const inquiryRouter = Router();

inquiryRouter.get('/config', getConfig);
inquiryRouter.post('/public/inquiries', asyncHandler(postPublicInquiry));
inquiryRouter.get('/inquiries', asyncHandler(getInquiries));
inquiryRouter.post('/inquiries', asyncHandler(postInquiry));
inquiryRouter.patch('/inquiries/:id', asyncHandler(patchInquiry));
inquiryRouter.get('/kpis', asyncHandler(getKpis));
inquiryRouter.get('/weekly-summary', asyncHandler(getWeeklySummary));
inquiryRouter.get('/exports/inquiries.csv', asyncHandler(exportInquiriesCsv));
inquiryRouter.post('/demo/reset', asyncHandler(postDemoReset));
inquiryRouter.post('/seed', asyncHandler(postSeed));
