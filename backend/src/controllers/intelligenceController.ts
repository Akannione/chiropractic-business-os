import { Request, Response } from 'express';
import { HttpError } from '../middleware/errorHandler.js';
import {
  analyzeIntelligenceFiles,
  type IntelligenceFileInput,
} from '../services/intelligenceService.js';

function validateFiles(value: unknown): IntelligenceFileInput[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new HttpError(400, 'At least one CSV file is required.');
  }
  if (value.length > 12) {
    throw new HttpError(400, 'Analyze no more than 12 files at once.');
  }

  return value.map((entry, index) => {
    if (!entry || typeof entry !== 'object') {
      throw new HttpError(400, `File ${index + 1} is invalid.`);
    }
    const file = entry as Record<string, unknown>;
    const name = String(file.name || '').trim();
    const csvText = String(file.csvText || '');
    if (!name || !csvText.trim()) {
      throw new HttpError(400, `File ${index + 1} needs a name and CSV content.`);
    }
    if (csvText.length > 500_000) {
      throw new HttpError(413, `File ${index + 1} exceeds the preview size limit.`);
    }
    return { name, csvText };
  });
}

export async function postIntelligencePreview(req: Request, res: Response) {
  const files = validateFiles(req.body?.files);
  res.json(analyzeIntelligenceFiles(files));
}
