import { Request, Response } from 'express';
import { Inquiry } from '../models/Inquiry.js';
import { calculateKpis } from '../services/kpiService.js';
import { buildWeeklySummary } from '../services/reportService.js';

export async function getKpis(_req: Request, res: Response) {
  const inquiries = await Inquiry.find().lean();
  res.json(calculateKpis(inquiries));
}

export async function getWeeklySummary(_req: Request, res: Response) {
  const inquiries = await Inquiry.find().lean();
  res.json(buildWeeklySummary(inquiries));
}
