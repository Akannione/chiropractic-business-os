import { Request, Response } from 'express';
import { HttpError } from '../middleware/errorHandler.js';
import { createInquiry, listInquiries, updateInquiry } from '../services/inquiryService.js';
import { serializeInquiry } from '../serializers/inquirySerializer.js';
import { validateInquiryBody, validateInquiryUpdate } from '../validators/inquiryValidators.js';

export async function getInquiries(_req: Request, res: Response) {
  const inquiries = await listInquiries();
  res.json(inquiries.map(serializeInquiry));
}

export async function postInquiry(req: Request, res: Response) {
  validateInquiryBody(req.body);
  const inquiry = await createInquiry(req.body);
  res.status(201).json(serializeInquiry(inquiry.toJSON()));
}

export async function patchInquiry(req: Request, res: Response) {
  validateInquiryUpdate(req.body);
  const inquiry = await updateInquiry(String(req.params.id || ''), req.body);
  if (!inquiry) throw new HttpError(404, 'Patient inquiry was not found.');
  res.json(serializeInquiry(inquiry.toJSON()));
}
