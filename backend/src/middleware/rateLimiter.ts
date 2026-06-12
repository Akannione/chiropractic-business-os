import { NextFunction, Request, Response } from 'express';
import { HttpError } from './errorHandler.js';

type ClientWindow = {
  count: number;
  resetAt: number;
};

const windows = new Map<string, ClientWindow>();

export function rateLimit({ maxRequests, windowMs }: { maxRequests: number; windowMs: number }) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const current = windows.get(key);

    if (!current || current.resetAt <= now) {
      windows.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (current.count >= maxRequests) {
      throw new HttpError(429, 'Too many requests. Please wait a few minutes and try again.');
    }

    current.count += 1;
    next();
  };
}
