import { Request, Response } from 'express';
import { KPI_HELP, SERVICES, SOURCES, STATUSES } from '../config/constants.js';
import { env } from '../config/env.js';
import { HttpError } from '../middleware/errorHandler.js';
import { Inquiry } from '../models/Inquiry.js';
import { calculateKpis } from '../services/kpiService.js';
import { buildWeeklySummary } from '../services/reportService.js';
import { createInquiry, listInquiries, updateInquiry } from '../services/inquiryService.js';
import { createAutomatedInquiry, normalizeSource } from '../services/automationService.js';
import { importInquiryCsv, mapExternalRow } from '../services/importService.js';
import { resetSampleData, seedSampleDataIfEmpty } from '../services/seedService.js';
import { formatDate } from '../utils/date.js';
import { toCsv } from '../utils/csv.js';

const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const phonePattern = /^\+?[0-9][0-9\s().-]{6,19}$/;

function validateInquiryBody(body: Record<string, unknown>) {
  const errors: string[] = [];
  if (!String(body.name || '').trim()) errors.push('Patient name is required.');
  if (!phonePattern.test(String(body.phone || '').trim())) errors.push('Enter a valid phone number.');
  if (!emailPattern.test(String(body.email || '').trim())) errors.push('Enter a valid email address.');
  if (!String(body.service_needed || '').trim()) errors.push('Requested Service is required.');
  if (!(SOURCES as readonly string[]).includes(String(body.source))) errors.push('Choose a valid inquiry source.');
  if (!(STATUSES as readonly string[]).includes(String(body.status))) errors.push('Choose a valid status.');
  if (Number(body.estimated_value || 0) < 0) errors.push('Estimated Treatment Value cannot be negative.');
  if (errors.length) throw new HttpError(400, errors.join(' '));
}

function validatePublicInquiryBody(body: Record<string, unknown>) {
  const errors: string[] = [];
  if (!String(body.name || '').trim()) errors.push('Patient name is required.');
  if (!phonePattern.test(String(body.phone || '').trim())) errors.push('Enter a valid phone number.');
  if (!emailPattern.test(String(body.email || '').trim())) errors.push('Enter a valid email address.');
  if (!String(body.service_needed || '').trim()) errors.push('Requested Service is required.');
  if (body.source && !(SOURCES as readonly string[]).includes(String(body.source))) {
    errors.push('Choose a valid inquiry source.');
  }
  if (errors.length) throw new HttpError(400, errors.join(' '));
}

function serializeInquiry(inquiry: any) {
  return {
    ...inquiry,
    id: String(inquiry.id || inquiry._id),
    next_follow_up_date: formatDate(inquiry.next_follow_up_date),
    created_at: inquiry.created_at?.toISOString?.() || inquiry.created_at,
    updated_at: inquiry.updated_at?.toISOString?.() || inquiry.updated_at,
  };
}

export async function getConfig(_req: Request, res: Response) {
  res.json({
    statuses: STATUSES,
    sources: SOURCES,
    services: SERVICES,
    kpiHelp: KPI_HELP,
    demoMode: env.demoMode,
  });
}

export async function getInquiries(_req: Request, res: Response) {
  const inquiries = await listInquiries();
  res.json(inquiries.map(serializeInquiry));
}

export async function postInquiry(req: Request, res: Response) {
  validateInquiryBody(req.body);
  const inquiry = await createInquiry(req.body);
  res.status(201).json(serializeInquiry(inquiry.toJSON()));
}

export async function postPublicInquiry(req: Request, res: Response) {
  validatePublicInquiryBody(req.body);
  const inquiry = await createAutomatedInquiry({
    name: String(req.body.name || ''),
    phone: String(req.body.phone || ''),
    email: String(req.body.email || ''),
    service_needed: String(req.body.service_needed || ''),
    source: normalizeSource(req.body.source),
    notes: String(req.body.notes || ''),
  }, 'public intake form');
  res.status(201).json(serializeInquiry(inquiry.toJSON()));
}

export async function postWebhookInquiry(req: Request, res: Response) {
  const mapped = mapExternalRow(req.body as Record<string, string>);
  validatePublicInquiryBody(mapped as Record<string, unknown>);
  const inquiry = await createAutomatedInquiry(mapped, 'webhook intake');
  res.status(201).json(serializeInquiry(inquiry.toJSON()));
}

export async function postImportCsv(req: Request, res: Response) {
  const csvText = typeof req.body === 'string' ? req.body : String(req.body?.csv || '');
  if (!csvText.trim()) throw new HttpError(400, 'CSV content is required.');
  const result = await importInquiryCsv(csvText);
  res.status(result.failed ? 207 : 201).json(result);
}

export async function patchInquiry(req: Request, res: Response) {
  const { status, notes, next_follow_up_date } = req.body;
  if (typeof status !== 'string') throw new HttpError(400, 'Choose a valid status.');
  if (!(STATUSES as readonly string[]).includes(status)) throw new HttpError(400, 'Choose a valid status.');
  const inquiry = await updateInquiry(String(req.params.id || ''), { status, notes, next_follow_up_date });
  if (!inquiry) throw new HttpError(404, 'Patient inquiry was not found.');
  res.json(serializeInquiry(inquiry.toJSON()));
}

export async function getKpis(_req: Request, res: Response) {
  const inquiries = await Inquiry.find().lean();
  res.json(calculateKpis(inquiries));
}

export async function getWeeklySummary(_req: Request, res: Response) {
  const inquiries = await Inquiry.find().lean();
  res.json(buildWeeklySummary(inquiries));
}

export async function exportInquiriesCsv(_req: Request, res: Response) {
  const inquiries = await Inquiry.find().sort({ created_at: -1 }).lean();
  const rows = inquiries.map((inquiry) => ({
    ...inquiry,
    next_follow_up_date: formatDate(inquiry.next_follow_up_date),
  }));
  res.header('Content-Type', 'text/csv');
  res.attachment(`patient_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
  res.send(toCsv(rows));
}

export async function postDemoReset(_req: Request, res: Response) {
  if (!env.demoMode) throw new HttpError(403, 'Demo reset is disabled.');
  const inserted = await resetSampleData();
  res.json({ inserted });
}

export async function postSeed(_req: Request, res: Response) {
  const inserted = await seedSampleDataIfEmpty();
  res.json({ inserted });
}
