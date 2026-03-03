import { SessionOptions } from 'express-session';
import { Request, Response } from 'express';

export interface LogtoConfig {
  endpoint: string;
  appId: string;
  appSecret: string;
  baseUrl: string;
  navigate?: (url: string, req: Request, res: Response) => void;
}

export const logtoExpressConfig: LogtoConfig = {
  endpoint: process.env.LOGTO_ENDPOINT || 'endpoint',
  appId: process.env.LOGTO_APP_ID || 'id',
  appSecret: process.env.LOGTO_APP_SECRET || 'secret',
  baseUrl: process.env.LOGTO_BASE_URL || 'baseurl',

  navigate: (url, req, res) => {
    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';

    const redirectTo = (req.session as any)?.returnTo || '/dashboard';

    if (req.path.includes('callback')) {
      return res.redirect(`${frontend}${redirectTo}`);
    }

    return res.redirect(url);
  },
};

export const sessionConfig: SessionOptions = {
  secret: process.env.SESSION_SECRET || 'sessionsecret',
  cookie: { 
    maxAge: 14 * 24 * 60 * 60 * 1000,
    secure: true,
    httpOnly: true,
    sameSite: 'none'
  },
  resave: false,
  saveUninitialized: true
};
