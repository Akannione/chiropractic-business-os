import { Request, Response } from 'express';
import { HttpError } from '../middleware/errorHandler.js';
import { createAutomatedInquiry, normalizeSource } from '../services/automationService.js';
import { importInquiryCsv, mapExternalRow, previewInquiryCsv } from '../services/importService.js';
import { serializeInquiry } from '../serializers/inquirySerializer.js';
import { validatePublicInquiryBody } from '../validators/inquiryValidators.js';

export async function postPublicInquiry(req: Request, res: Response) {
  validatePublicInquiryBody(req.body);
  const inquiry = await createAutomatedInquiry(
    {
      name: String(req.body.name || ''),
      phone: String(req.body.phone || ''),
      email: String(req.body.email || ''),
      service_needed: String(req.body.service_needed || ''),
      source: normalizeSource(req.body.source),
      notes: String(req.body.notes || ''),
    },
    'public intake form',
  );
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

export async function postImportCsvPreview(req: Request, res: Response) {
  const csvText = typeof req.body === 'string' ? req.body : String(req.body?.csv || '');
  if (!csvText.trim()) throw new HttpError(400, 'CSV content is required.');
  res.json(await previewInquiryCsv(csvText));
}
