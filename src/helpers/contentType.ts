import { ContentType } from '../types';

const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'bmp', 'tiff']);
const VIDEO_EXTS = new Set(['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', 'm4v']);
const DOC_EXTS = new Set(['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx']);

export function detectContentTypeFromUrl(url: URL): ContentType {
  const ext = url.pathname.split('.').pop()?.toLowerCase() ?? '';
  if (IMAGE_EXTS.has(ext)) return ContentType.PHOTO;
  if (VIDEO_EXTS.has(ext)) return ContentType.VIDEO;
  if (DOC_EXTS.has(ext)) return ContentType.DOCUMENT;
  return ContentType.LINK;
}

export function detectContentTypeFromMime(mimetype: string): ContentType {
  if (mimetype.startsWith('image/')) return ContentType.PHOTO;
  if (mimetype.startsWith('video/')) return ContentType.VIDEO;
  if (mimetype === 'application/pdf' || mimetype.includes('document') || mimetype.includes('spreadsheet') || mimetype.includes('presentation'))
    return ContentType.DOCUMENT;
  return ContentType.LINK;
}

export function toCloudinaryResourceType(type: ContentType): 'image' | 'video' | 'raw' {
  if (type === ContentType.VIDEO) return 'video';
  if (type === ContentType.DOCUMENT) return 'raw';
  return 'image';
}