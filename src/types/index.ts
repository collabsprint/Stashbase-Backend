export enum ContentType {
  LINK = 'link',
  ARTICLE = 'article',
  PHOTO = 'photo',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

export enum TagName {
  ARTICLE = 'Article',
  WEBSITE = 'Website',
  VIDEO = 'Video',
  PHOTO = 'Photo',
}

export enum StashStatus {
  PROCESSING = 'processing',
  READY = 'ready',
  ERROR = 'error',
}

export interface StashMetadata {
  title?: string;
  description?: string;
  thumbnail?: string;
  author?: string;
  publishedDate?: string;
  sourceDomain?: string;
  favicon?: string;

  cloudinaryPublicId?: string;
  cloudinaryUrl?: string;
  cloudinaryResourceType?: 'image' | 'video' | 'raw';
  thumbnailUrl?: string;

  extractedText?: string;
  pageCount?: number;

  microlinkRaw?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export type StashesGroupedByType = Partial<Record<ContentType, unknown[]>>;