import { Request, Response } from 'express';
import { env } from '../config/env.js';
import { HttpError } from '../middleware/errorHandler.js';
import { resetSampleData, seedSampleDataIfEmpty } from '../services/seedService.js';

export async function postDemoReset(_req: Request, res: Response) {
  if (!env.demoMode) throw new HttpError(403, 'Demo reset is disabled.');
  const inserted = await resetSampleData();
  res.json({ inserted });
}

export async function postSeed(_req: Request, res: Response) {
  const inserted = await seedSampleDataIfEmpty();
  res.json({ inserted });
}
