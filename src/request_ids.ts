import { NextFunction, Request, Response } from 'express';

export interface RequestWithIds extends Request {
  clientId: string;
  requestId: string;
}

export function ensureAndIncludeIds(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const clientId = req.header('x-client-id');
  const requestId = req.header('x-request-id');
  if (!clientId || !requestId) {
    res.status(400).json({
      error: 'Missing clientId / requestId headers',
    });
    return;
  }
  const reqWithIds = req as RequestWithIds;
  reqWithIds.clientId = clientId;
  reqWithIds.requestId = requestId;
  next();
}
