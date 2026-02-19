import path from 'path';
import fs from 'fs';
import express, { Express } from 'express';

interface UrlConfig {
  protocol?: string;
  port?: string;
  hostname?: string;
}

function serveStaticFile(app: Express): void {
    const directory = path.join(__dirname, '../uploads');
    app.use('/uploads', express.static(directory));
}

function url(filePath: string): string {
    if (process.env.NODE_ENV === 'development') {
        return `http://localhost:${process.env.PORT}/${filePath}`;
    }
    return `${process.env.APP_URL}/${filePath}`;
}

function deleteImage(imagePath: string): void {
    try {
        if (imagePath && fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    } catch (error) {
        console.error(`Error deleting image: ${error}`);
    }
}

export { serveStaticFile, url, deleteImage };
