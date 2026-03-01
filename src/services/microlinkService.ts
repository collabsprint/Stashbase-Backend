import axios from 'axios';
import { StashMetadata, ContentType } from '../types';
import { logger } from '../utils/logger';

interface MicrolinkData {
  title?: string;
  description?: string;
  image?: { url: string };
  author?: string;
  date?: string;
  url?: string;
  publisher?: string;
  lang?: string;
  video?: { url: string };
}

export function inferContentType(url: string, data: MicrolinkData): ContentType {
  try {
    const ext = new URL(url).pathname.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf') return ContentType.DOCUMENT;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext)) return ContentType.PHOTO;
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return ContentType.VIDEO;
    if (data.video?.url) return ContentType.VIDEO;
    if (data.publisher || (data.author && data.description)) return ContentType.NOTE;
  } catch {
  }
  return ContentType.LINK;
}

export async function fetchUrlMetadata(
  url: string
): Promise<{ metadata: StashMetadata; contentType: ContentType }> {
  const params: Record<string, string | boolean> = {
    url,
    screenshot: true,
    meta: true,
  };

  const headers: Record<string, string> = {};
  if (process.env.MICROLINK_API_KEY) {
    headers['x-api-key'] = process.env.MICROLINK_API_KEY;
  }

  const response = await axios.get<{ status: string; data: MicrolinkData }>(
    process.env.MICROLINK_API_URL || 'https://api.microlink.io',
    { params, headers, timeout: 8_000 }
  );

  const data = response.data.data;
  const contentType = inferContentType(url, data);

  const metadata: StashMetadata = {
    title: data.title ?? undefined,
    description: data.description ?? undefined,
    thumbnail: data.image?.url ?? undefined,
    author: data.author ?? undefined,
    publishedDate: data.date ?? undefined,
    sourceDomain: (() => { try { return new URL(data.url ?? url).hostname; } catch { return undefined; } })(),
    microlinkRaw: data as Record<string, unknown>,
  };

  logger.debug({ url, contentType }, '[microlink] metadata fetched');
  return { metadata, contentType };
}