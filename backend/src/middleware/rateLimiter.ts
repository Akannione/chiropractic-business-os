import { NextFunction, Request, Response } from 'express';
import { HttpError } from './errorHandler.js';

type ClientWindow = {
  count: number;
  resetAt: number;
};

const windows = new Map<string, ClientWindow>();

/**
 * Entries are only ever added on request, so a long-running process
 * accumulates one per address seen and never releases them. Addresses are
 * attacker-influenced, which makes unbounded growth a denial-of-service in
 * itself. Sweep expired windows periodically rather than on every request.
 */
const SWEEP_INTERVAL_MS = 60 * 1000;
let lastSweepAt = 0;

function sweepExpired(now: number) {
  if (now - lastSweepAt < SWEEP_INTERVAL_MS) return;
  lastSweepAt = now;
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

export function rateLimit({ maxRequests, windowMs }: { maxRequests: number; windowMs: number }) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    sweepExpired(now);
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
