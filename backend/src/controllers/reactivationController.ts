import { Request, Response } from 'express';
import { listInquiries } from '../services/inquiryService.js';
import { buildReactivationQueue } from '../services/reactivationService.js';

export async function getReactivations(_req: Request, res: Response) {
  const inquiries = await listInquiries();
  res.json(buildReactivationQueue(inquiries));
}
