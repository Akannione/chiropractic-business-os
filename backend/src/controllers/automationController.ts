import crypto from 'node:crypto';
import { Request, Response } from 'express';
import { env } from '../config/env.js';
import { HttpError } from '../middleware/errorHandler.js';
import { createAutomatedInquiry, normalizeSource } from '../services/automationService.js';
import { importInquiryCsv, mapExternalRow, previewInquiryCsv } from '../services/importService.js';
import { serializeInquiry } from '../serializers/inquirySerializer.js';
import { validatePublicInquiryBody } from '../validators/inquiryValidators.js';

const webhookSecretHeader = 'x-cbos-webhook-secret';

function constantTimeEqual(left: string, right: string) {
  const leftDigest = crypto.createHash('sha256').update(left).digest();
  const rightDigest = crypto.createHash('sha256').update(right).digest();
  return crypto.timingSafeEqual(leftDigest, rightDigest);
}

export function assertWebhookAuthorized(headers: { get(name: string): string | undefined }) {
  if (!env.webhookSecret) {
    throw new HttpError(404, 'Webhook intake is not configured for this deployment.');
  }

  const supplied = headers.get(webhookSecretHeader) || '';
  if (!supplied || !constantTimeEqual(supplied, env.webhookSecret)) {
    throw new HttpError(401, 'Webhook secret is required.');
  }
}

export async function postPublicInquiry(req: Request, res: Response) {
  validatePublicInquiryBody(req.body);
  const inquiry = await createAutomatedInquiry(
    {
      name: String(req.body.name || ''),
      phone: String(req.body.phone || ''),
      email: String(req.body.email || ''),
      service_needed: String(req.body.service_needed || ''),
      activity_context: String(req.body.activity_context || ''),
      source: normalizeSource(req.body.source),
      notes: String(req.body.notes || ''),
    },
    'public intake form',
  );
  res.status(201).json(serializeInquiry(inquiry.toJSON()));
}

export async function postWebhookInquiry(req: Request, res: Response) {
  assertWebhookAuthorized({ get: (name) => req.header(name) || undefined });
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
