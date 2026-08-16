import { Request, Response } from 'express';
import { HttpError } from '../middleware/errorHandler.js';
import { serializeInquiry } from '../serializers/inquirySerializer.js';
import { listDuplicateCandidates, mergeInquiries } from '../services/duplicateService.js';

export async function getDuplicates(_req: Request, res: Response) {
  const groups = await listDuplicateCandidates();
  res.json({
    groups: groups.map((group) => group.map(serializeInquiry)),
    total: groups.length,
  });
}

/**
 * Merging deletes the source record, so both ids are required explicitly in
 * the body rather than inferred from a candidate group. Staff choose which
 * record survives.
 */
export async function postMergeInquiries(req: Request, res: Response) {
  const targetId = String(req.params.id || '');
  const sourceId = String(req.body?.sourceId || '');

  if (!sourceId) {
    throw new HttpError(400, 'sourceId is required and names the duplicate to merge in.');
  }

  const { merged, movedActivities } = await mergeInquiries(targetId, sourceId);
  res.json({
    inquiry: serializeInquiry(merged.toJSON()),
    movedActivities,
  });
}
