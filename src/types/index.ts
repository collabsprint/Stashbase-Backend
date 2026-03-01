export enum ContentType {
  LINK = 'link',
  NOTE = 'note',
  PHOTO = 'photo',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

export enum TagName {
  NOTE = 'Note',
  WEBSITE = 'Website',
  VIDEO = 'Video',
  PHOTO = 'Photo',
  DOCUMENT = 'Document',
}

export enum StashStatus {
  PROCESSING = 'processing',
  READY = 'ready',
  ERROR = 'error',
}

export interface StashMetadata {
  title?: string;
  description?: string;
  content?: string;
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

export interface ListStashesQuery {
  page?:     number;
  limit?:    number;
  type?:     ContentType;
  tagName?:  string;
  dateFrom?: string;
  dateTo?:   string;
}

export type StashGroup = {
  count:   number;
  stashes: unknown[];
};

export type StashesGroupedByType = Partial<Record<ContentType, StashGroup>>;