import type { LogtoContext } from '@logto/node';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export {};