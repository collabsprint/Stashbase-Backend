import { format } from 'date-fns';
import { v4 as uuid } from 'uuid';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';

async function logEvents(message: string, logName: string): Promise<void> {
    const dateTime = `${format(new Date(), 'yyyy-MM-dd\tHH:mm:ss')}`;
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

    try {
        await fsPromises.mkdir(path.join(__dirname, '../..', 'logs'), { recursive: true });
        await fsPromises.appendFile(path.join(__dirname, '../..', 'logs', logName), logItem);
    } catch (error) {
        console.error(`Error logging events: ${error}`);
    }
}

function logger(req: any, res: any, next: any): void {
    logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'reqLog.txt');
    next();
}

export { logEvents, logger };
