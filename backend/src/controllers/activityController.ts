import { Request, Response } from 'express';
import { listActivities } from '../services/activityService.js';

export async function getActivities(_req: Request, res: Response) {
  res.json(await listActivities());
}
