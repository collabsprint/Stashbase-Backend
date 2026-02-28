const pdfParse = require('pdf-parse');
import { Stash } from '../models/index';
import { fetchUrlMetadata } from './microlinkService';
import { uploadFile, buildThumbnailUrl } from './cloudinaryService';
import { StashMetadata, ContentType, StashStatus } from '../types';
import { logger } from '../utils/logger';

async function processUrl(stash: Stash): Promise<void> {
  try {
    const { metadata, contentType } = await fetchUrlMetadata(stash.url);
    await stash.update({ metadata, contentType, status: StashStatus.READY });
  } catch (err) {
    logger.warn({ stashId: stash.id, err }, '[enrichment] Microlink failed — degraded save');
    await stash.update({
      metadata: {
        sourceDomain: (() => { try { return new URL(stash.url).hostname; } catch { return undefined; } })(),
      },
      status: StashStatus.READY,
    });
  }
}


async function processDocument(stash: Stash, buffer: Buffer, filename: string): Promise<void> {
  const upload = await uploadFile(buffer, filename, stash.userId, ContentType.DOCUMENT);

  let extractedText = '';
  let pageCount = 0;
  try {
    const parsed = await pdfParse(buffer, { max: 550 }); 
    extractedText = parsed.text.trim();
    pageCount = parsed.numpages;
  } catch (err) {
    logger.warn({ stashId: stash.id, err }, '[enrichment] pdf-parse failed — no text extracted');
  }

  const metadata: StashMetadata = {
    cloudinaryPublicId: upload.publicId,
    cloudinaryUrl: upload.secureUrl,
    cloudinaryResourceType: 'raw',
    thumbnailUrl: upload.thumbnailUrl,
    extractedText,
    pageCount,
  };

  await stash.update({ metadata, status: StashStatus.READY });
  logger.debug({ stashId: stash.id, pageCount }, '[enrichment] document processed');
}

async function processPhoto(stash: Stash, buffer: Buffer, filename: string): Promise<void> {
  const upload = await uploadFile(buffer, filename, stash.userId, ContentType.PHOTO);

  const metadata: StashMetadata = {
    cloudinaryPublicId: upload.publicId,
    cloudinaryUrl: upload.secureUrl,
    cloudinaryResourceType: 'image',
    thumbnailUrl: upload.thumbnailUrl,
  };

  await stash.update({ metadata, status: StashStatus.READY });
  logger.debug({ stashId: stash.id }, '[enrichment] photo processed');
}

async function processVideo(stash: Stash, buffer: Buffer, filename: string): Promise<void> {
  const upload = await uploadFile(buffer, filename, stash.userId, ContentType.VIDEO);

  const metadata: StashMetadata = {
    cloudinaryPublicId: upload.publicId,
    cloudinaryUrl: upload.secureUrl,
    cloudinaryResourceType: 'video',
    thumbnailUrl: upload.thumbnailUrl,
  };

  await stash.update({ metadata, status: StashStatus.READY });
  logger.debug({ stashId: stash.id }, '[enrichment] video processed');
}

export function enqueueUrlEnrichment(stash: Stash): void {
  processUrl(stash).catch(async (err) => {
    logger.error({ stashId: stash.id, err }, '[enrichment] URL pipeline error');
    await stash.update({ status: StashStatus.ERROR }).catch(() => {});
  });
}

export function enqueueFileEnrichment(
  stash: Stash,
  buffer: Buffer,
  filename: string,
  contentType: Extract<ContentType, 'photo' | 'video' | 'document'>
): void {
  const pipeline =
    contentType === ContentType.DOCUMENT ? processDocument :
    contentType === ContentType.VIDEO ? processVideo :
    processPhoto;

  pipeline(stash, buffer, filename).catch(async (err) => {
    logger.error({ stashId: stash.id, contentType, err }, '[enrichment] file pipeline error');
    await stash.update({ status: StashStatus.ERROR }).catch(() => {});
  });
}