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
app.set('trust proxy', 1);
app.use(helmet());

const allowedOrigins = [
  process.env.LOGTO_BASE_URL,
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

app.get('/api/me', withLogto(logtoExpressConfig), (req: Request, res: Response) => {
  const user = (req as any).user;
  
  if (!user?.isAuthenticated) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }

  res.json({
    success: true,
    data: {
      id: user.claims.sub,
      email: user.claims.email,
      displayName: user.claims.name,
    }
  });
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

    // const [info] = await sequelize.query(`
    // SELECT current_database(), current_user, inet_server_addr()
  // `);

  // console.log("Connected to database:", info);

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