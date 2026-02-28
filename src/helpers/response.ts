import { Response } from 'express';

export function ok(res: Response, data: unknown, message?: string, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data, ...(message && { message }) });
}

export function created(res: Response, data: unknown, message?: string) {
  return ok(res, data, message, 201);
}

export function noContent(res: Response) {
  return res.status(204).send();
}

export function errorResponse(
  res: Response,
  statusCode: number,
  message: string,
  code: string
) {
  return res.status(statusCode).json({ success: false, error: message, code });
}