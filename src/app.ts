import 'express-async-errors';
import 'dotenv/config';

import express, { Express, Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session, { SessionOptions } from 'express-session';
import { handleAuthRoutes, withLogto } from '@logto/express';

import LogtoExpressConfig from './config/logotoExpressConfig';

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const sessionConfig: SessionOptions = {
  secret: process.env.SESSION_SECRET || 'dkjA957BE2CoWHSItzfyUjCuVABlRxrk',
  cookie: { maxAge: 14 * 24 * 60 * 60 },
  resave: false,
  saveUninitialized: true
};

app.use(session(sessionConfig));
app.use(handleAuthRoutes(LogtoExpressConfig));

app.get('/', withLogto(LogtoExpressConfig), (req: Request, res: Response) => {
  res.setHeader('content-type', 'text/html');
  if ((req as any).user?.isAuthenticated) {
    res.end(`<div>Hello ${(req as any).user?.claims?.sub}, <a href="/logto/sign-out">Sign Out</a></div>`);
  } else {
    res.end('<div><a href="/logto/sign-in">Sign In</a></div>');
  }
});

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Server is running' });
});

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status((err as any)?.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: (err as any)?.status || 500
    }
  });
};

app.use(errorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;
