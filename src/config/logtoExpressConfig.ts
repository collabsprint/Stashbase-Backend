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

  navigate: (_url, _req, res) => {
    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontend}/dashboard`);
  },
};

export const sessionConfig: SessionOptions = {
  secret: process.env.SESSION_SECRET || 'sessionsecret',
  cookie: { 
    maxAge: 14 * 24 * 60 * 60 * 1000,
    secure:   process.env.NODE_ENV === 'development',
    httpOnly: true,
    sameSite: 'none'
  },
  resave: false,
  saveUninitialized: true
};
