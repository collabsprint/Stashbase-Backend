import { Request, Response, NextFunction } from 'express';
import { verifyToken }    from '../helpers/jwtHelper';
import { isBlacklisted }  from '../utils/tokenBlacklist';
import { UnauthorizedError } from '../utils/errors';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  const token = authHeader.split(' ')[1];

  if (isBlacklisted(token)) {
    throw new UnauthorizedError('Token has been invalidated. Please log in again.');
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    // Attach token to request so logout can blacklist it
    (req as any).token    = token;
    (req as any).tokenExp = payload.exp;
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}