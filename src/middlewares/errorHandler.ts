import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import 'dotenv/config';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn({ err, path: req.path }, `[error] ${err.code}`);
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
    return;
  }

  if ((err as any)?.name === 'SequelizeValidationError' || (err as any)?.name === 'SequelizeUniqueConstraintError') {
    const errors = (err as any).errors?.map((e: any) => e.message) ?? ['Validation failed'];
    res.status(400).json({
      success: false,
      error: errors[0],
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  logger.error({ err, path: req.path }, '[error] unhandled error');
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? (err as any)?.message ?? 'Internal server error' : 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
}