import { Request, Response } from 'express';
import { KPI_HELP, SERVICES, SOURCES, STATUSES } from '../config/constants.js';
import { env } from '../config/env.js';

export async function getConfig(_req: Request, res: Response) {
  res.json({
    practiceName: env.practiceName,
    statuses: STATUSES,
    sources: SOURCES,
    services: SERVICES,
    kpiHelp: KPI_HELP,
    demoMode: env.demoMode,
  });
}
