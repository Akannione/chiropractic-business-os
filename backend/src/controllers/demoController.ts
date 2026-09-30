import { Request, Response } from 'express';
import { env } from '../config/env.js';
import { HttpError } from '../middleware/errorHandler.js';
import { resetSampleData, seedSampleDataIfEmpty } from '../services/seedService.js';
import { isAuthEnabled } from '../services/authService.js';

function isLocalDemoHost(hostname: string) {
  const normalized = hostname.toLowerCase();
  return normalized === 'localhost' || normalized === '127.0.0.1' || normalized === '::1';
}

export function assertDemoMutationAllowed(hostname: string) {
  if (!env.demoMode) throw new HttpError(403, 'Demo reset is disabled.');
  if (!isAuthEnabled() && !isLocalDemoHost(hostname)) {
    throw new HttpError(403, 'Remote demo reset requires staff authentication.');
  }
}

export async function postDemoReset(req: Request, res: Response) {
  assertDemoMutationAllowed(req.hostname);
  const inserted = await resetSampleData();
  res.json({ inserted });
}

export async function postSeed(req: Request, res: Response) {
  assertDemoMutationAllowed(req.hostname);
  const inserted = await seedSampleDataIfEmpty();
  res.json({ inserted });
}
