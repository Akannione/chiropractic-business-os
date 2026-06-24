import { Request, Response } from 'express';
import {
  APPOINTMENT_STATUSES,
  FOLLOW_UP_OUTCOMES,
  KPI_HELP,
  OFFER_TYPES,
  PATIENT_TYPES,
  SERVICES,
  SOURCES,
  STATUSES,
} from '../config/constants.js';
import { env } from '../config/env.js';

export async function getConfig(_req: Request, res: Response) {
  res.json({
    practiceName: env.practiceName,
    statuses: STATUSES,
    sources: SOURCES,
    services: SERVICES,
    appointmentStatuses: APPOINTMENT_STATUSES,
    patientTypes: PATIENT_TYPES,
    offerTypes: OFFER_TYPES,
    followUpOutcomes: FOLLOW_UP_OUTCOMES,
    kpiHelp: KPI_HELP,
    demoMode: env.demoMode,
  });
}
