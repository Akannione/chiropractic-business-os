import { NextFunction, Request, Response } from 'express';
import { HttpError } from './errorHandler.js';
import { isAuthEnabled, verifyAuthToken } from '../services/authService.js';

export function requireStaffAuth(req: Request, _res: Response, next: NextFunction) {
  if (!isAuthEnabled()) {
    next();
    return;
  }

  const header = req.header('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';
  if (!token || !verifyAuthToken(token)) {
    throw new HttpError(401, 'Staff login is required.');
  }

  next();
}
