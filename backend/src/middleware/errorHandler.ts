import { NextFunction, Request, Response } from 'express';

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, 'The requested resource was not found.'));
}

export function asyncHandler(handler: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}

export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction) {
  // Express/body-parser errors are not our HttpError class. Preserve their
  // known client status without exposing parser messages or request contents.
  const parserError = error as Error & { type?: string; status?: number };
  if (parserError.type === 'entity.parse.failed' && parserError.status === 400) {
    res.status(400).json({ message: 'Request body must contain valid JSON.' });
    return;
  }
  if (parserError.type === 'entity.too.large' && parserError.status === 413) {
    res.status(413).json({ message: 'Request body exceeds the allowed size.' });
    return;
  }
  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  res.status(statusCode).json({
    message:
      statusCode === 500
        ? 'Something went wrong. Please try again or check the server logs.'
        : error.message,
  });
}
