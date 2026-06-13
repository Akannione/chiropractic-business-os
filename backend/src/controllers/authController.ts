import { Request, Response } from 'express';
import { HttpError } from '../middleware/errorHandler.js';
import { createAuthToken, isAuthEnabled, validateAdminPassword } from '../services/authService.js';

export function getAuthStatus(_req: Request, res: Response) {
  res.json({ authEnabled: isAuthEnabled() });
}

export async function postLogin(req: Request, res: Response) {
  const password = String(req.body?.password || '');
  if (!validateAdminPassword(password)) {
    throw new HttpError(401, 'Incorrect password.');
  }
  res.json({ token: createAuthToken(), authEnabled: isAuthEnabled() });
}
