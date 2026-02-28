import { format } from 'date-fns';
import { v4 as uuid } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

const LOGS_DIR = path.join(__dirname, '../../logs');

async function writeToFile(level: string, message: string): Promise<void> {
  const dateTime = format(new Date(), 'yyyy-MM-dd\tHH:mm:ss');
  const line = `${dateTime}\t${uuid()}\t${level.toUpperCase()}\t${message}\n`;
  try {
    await fs.mkdir(LOGS_DIR, { recursive: true });
    await fs.appendFile(path.join(LOGS_DIR, `${level}.log`), line);
  } catch (err) {
    console.error('[logger] Failed to write log file:', err);
  }
}

const COLOURS: Record<string, string> = {
  debug: '\x1b[36m',
  info:  '\x1b[32m',
  warn:  '\x1b[33m',
  error: '\x1b[31m',
  fatal: '\x1b[35m',
};
const RESET = '\x1b[0m';

function toConsole(level: string, parts: string[]): void {
  const ts = format(new Date(), 'HH:mm:ss');
  const c = COLOURS[level] ?? '';
  console.log(`${c}[${level.toUpperCase()}]${RESET} ${ts} ${parts.join(' ')}`);
}

function resolve(data: unknown, message?: string): string[] {
  const parts: string[] = [];

  if (message) parts.push(message);

  if (data === null || data === undefined) return parts;

  if (typeof data === 'string') {
    parts.push(data);
    return parts;
  }

  if (typeof data === 'object') {
    const { err, path: reqPath, ...rest } = data as Record<string, any>;
    if (reqPath)          parts.push(`path=${reqPath}`);
    if (Object.keys(rest).length) parts.push(JSON.stringify(rest));
    if (err?.message)     parts.push(`| ${err.message}`);
    if (err?.stack && process.env.NODE_ENV !== 'production') {
      parts.push(`\n${err.stack}`);
    }
    return parts;
  }

  parts.push(String(data));
  return parts;
}

export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  const msg = `${req.method} ${req.originalUrl} origin=${req.headers.origin ?? '-'}`;
  toConsole('info', [msg]);
  writeToFile('info', msg);
  next();
}

class Logger {
  private emit(level: string, data: unknown, message?: string): void {
    const parts = resolve(data, message);
    toConsole(level, parts);
    writeToFile(level, parts.join(' '));
  }

  debug(data: unknown, message?: string): void { this.emit('debug', data, message); }
  info (data: unknown, message?: string): void { this.emit('info',  data, message); }
  warn (data: unknown, message?: string): void { this.emit('warn',  data, message); }
  error(data: unknown, message?: string): void { this.emit('error', data, message); }
  fatal(data: unknown, message?: string): void { this.emit('fatal', data, message); }
}

export const logger = new Logger();