import { Request, Response, NextFunction } from 'express';
import { withLogto } from '@logto/express';
import { logtoExpressConfig } from '../config/logtoExpressConfig';
import { syncUserFromClaims } from '../services/userService';
import { UnauthorizedError } from '../utils/errors';

export const requireAuth = [
  withLogto(logtoExpressConfig),

  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!(req as any).user?.isAuthenticated) {
        throw new UnauthorizedError('You must be signed in to access this resource');
      }

      const claims = (req as any).user.claims;
      if (!claims?.sub) {
        throw new UnauthorizedError('Invalid session — missing user ID');
      }

      await syncUserFromClaims(claims);

      req.userId = claims.sub;

      next();
    } catch (err) {
      next(err);
    }
  },
];