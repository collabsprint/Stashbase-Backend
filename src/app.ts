import 'express-async-errors';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { handleAuthRoutes, withLogto } from '@logto/express';

import { sequelize } from './models/index';

import { logtoExpressConfig, sessionConfig } from './config/logtoExpressConfig';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/errorHandler';
import { NotFoundError } from './utils/errors';
import apiRoutes from './router/index';

const app: Express = express();

app.use(helmet());
app.use(cors({
  origin: process.env.LOGTO_BASE_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session(sessionConfig));
app.use(handleAuthRoutes(logtoExpressConfig));

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

app.get('/', withLogto(logtoExpressConfig), (req: Request, res: Response) => {
  res.setHeader('content-type', 'text/html');
  if ((req as any).user?.isAuthenticated) {
    res.end(`<div>Hello ${(req as any).user?.claims?.sub}, <a href="/logto/sign-out">Sign Out</a></div>`);
  } else {
    res.end('<div><a href="/logto/sign-in">Sign In</a></div>');
  }
});

app.use('/api', apiRoutes);

app.use((_req: Request, _res: Response) => {
  throw new NotFoundError('Route not found');
});
app.use(errorHandler);

async function bootstrap(): Promise<void> {
  try {
    await sequelize.authenticate();
    logger.info('[db] Connection established');

    // if (process.env.NODE_ENV === 'development') {
    //   await sequelize.sync({ alter: false });
    //   logger.info('[db] Models synced');
    // }

    app.listen(process.env.PORT || 3000, () => {
      logger.info(`[server] Listening on http://localhost:${process.env.PORT || 3000}`);
    });
  } catch (err) {
    logger.fatal(`[startup] Failed to start: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

bootstrap();

export default app;