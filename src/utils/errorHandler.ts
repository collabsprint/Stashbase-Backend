import { Request, Response, NextFunction } from 'express';
import { logEvents } from './logEvents';

function notFound(req: Request, res: Response, next: NextFunction): void {
    const error = new Error(`route ${req.protocol}://${req.get('host')}${req.originalUrl} does not exist`);
    res.statusCode = 404;
    next(error);
}

function errorHandler(error: any, req: Request, res: Response, next: NextFunction): void {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    logEvents(`${error?.name}: ${error?.message}`, 'errorLog.txt');
    res.status(statusCode);
    res.json({
        message: error?.message || 'An unexpected error occurred',
        stack: process.env.NODE_ENV === 'production' ? 'Enable development mode for stack trace' : error?.stack
    });
}

export { notFound, errorHandler };
