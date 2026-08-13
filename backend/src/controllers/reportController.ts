import { Request, Response } from 'express';
import {
  listInquiriesCreatedSince,
  listInquiriesForReports,
} from '../services/inquiryService.js';
import { calculateKpisFromDatabase } from '../services/kpiService.js';
import { buildMonthlySummary, buildWeeklySummary } from '../services/reportService.js';

/**
 * Computed inside MongoDB. Fetching every document to count them costs about
 * 3.4 MB across the wire at 20,000 records; the aggregation returns 216 bytes.
 */
export async function getKpis(_req: Request, res: Response) {
  res.json(await calculateKpisFromDatabase());
}

/** Reports on all inquiries, so it still reads the collection, projected. */
export async function getWeeklySummary(_req: Request, res: Response) {
  const inquiries = await listInquiriesForReports();
  res.json(buildWeeklySummary(inquiries as never));
}

export async function getMonthlySummary(_req: Request, res: Response) {
  const monthStart = new Date();
  monthStart.setHours(0, 0, 0, 0);
  monthStart.setDate(1);
  const inquiries = await listInquiriesCreatedSince(monthStart);
  res.json(buildMonthlySummary(inquiries as never));
}
