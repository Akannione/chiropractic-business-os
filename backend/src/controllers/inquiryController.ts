import { Request, Response } from 'express';
import { HttpError } from '../middleware/errorHandler.js';
import {
  createInquiry,
  listInquiriesPage,
  updateInquiry,
  undoFollowUpChange,
  type FollowUpUndoRequest,
  type FollowUpFilter,
} from '../services/inquiryService.js';
import { serializeInquiry } from '../serializers/inquirySerializer.js';
import { validateInquiryBody, validateInquiryUpdate, validateFollowUpUndo } from '../validators/inquiryValidators.js';

/**
 * Returns one page of inquiries with the total number matching the filters.
 *
 * Filtering and searching happen here rather than in the browser. The list
 * previously returned every inquiry so the page could filter it client side,
 * which does not survive a real clinic's history.
 */
export async function getInquiries(req: Request, res: Response) {
  const { rows, total, page, pageSize } = await listInquiriesPage({
    page: Number(req.query.page),
    pageSize: Number(req.query.pageSize),
    search: typeof req.query.search === 'string' ? req.query.search : undefined,
    status: typeof req.query.status === 'string' ? req.query.status : undefined,
    source: typeof req.query.source === 'string' ? req.query.source : undefined,
    followUp: typeof req.query.followUp === 'string'
      ? req.query.followUp as FollowUpFilter
      : undefined,
  });

  res.json({ rows: rows.map(serializeInquiry), total, page, pageSize });
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


export async function postUndoFollowUp(req: Request, res: Response) {
  validateFollowUpUndo(req.body);
  const inquiry = await undoFollowUpChange(String(req.params.id || ''), req.body as FollowUpUndoRequest);
  if (!inquiry) {
    throw new HttpError(409, 'This inquiry was changed since your action. Undo was not applied; review the record before correcting it.');
  }
  res.json(serializeInquiry(inquiry.toJSON()));
}
