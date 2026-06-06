import { Router } from 'express';
import {
  exportInquiriesCsv,
  getConfig,
  getInquiries,
  getKpis,
  getWeeklySummary,
  patchInquiry,
  postDemoReset,
  postInquiry,
  postSeed,
} from '../controllers/inquiryController.js';

export const inquiryRouter = Router();

inquiryRouter.get('/config', getConfig);
inquiryRouter.get('/inquiries', getInquiries);
inquiryRouter.post('/inquiries', postInquiry);
inquiryRouter.patch('/inquiries/:id', patchInquiry);
inquiryRouter.get('/kpis', getKpis);
inquiryRouter.get('/weekly-summary', getWeeklySummary);
inquiryRouter.get('/exports/inquiries.csv', exportInquiriesCsv);
inquiryRouter.post('/demo/reset', postDemoReset);
inquiryRouter.post('/seed', postSeed);

