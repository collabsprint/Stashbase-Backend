import { SessionOptions } from 'express-session';

export interface LogtoConfig {
  endpoint: string;
  appId: string;
  appSecret: string;
  baseUrl: string;
}

export const logtoExpressConfig: LogtoConfig = {
  endpoint: process.env.LOGTO_ENDPOINT || 'endpoint',
  appId: process.env.LOGTO_APP_ID || 'id',
  appSecret: process.env.LOGTO_APP_SECRET || 'secret',
  baseUrl: process.env.LOGTO_BASE_URL || 'baseurl',
};

export const sessionConfig: SessionOptions = {
  secret: process.env.SESSION_SECRET || 'sessionsecret',
  cookie: { maxAge: 14 * 24 * 60 * 60 },
  resave: false,
  saveUninitialized: true
};
