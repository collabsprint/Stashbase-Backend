import { Op, WhereOptions } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { Stash, Tag, Collection, StashCollection, StashTag } from '../models/index';
import { NotFoundError, ValidationError } from '../utils/errors';
import { ContentType, StashStatus, StashMetadata } from '../types';
import { detectContentTypeFromUrl, detectContentTypeFromMime } from '../helpers/contentType';
import { enqueueUrlEnrichment, enqueueFileEnrichment } from './enrichmentService';
import { deleteFile } from './cloudinaryService';
import { groupStashesByType } from '../helpers/stashGrouper';
import { buildPagination } from '../helpers/paginate';

export interface CreateStashDto {
  url: string;
  title: string;
  collectionId?: string;
  tagName?: string;
}

export interface UpdateStashDto {
  title?: string;
  collectionId?: string | null; 
  tagName?: string | null; 
}

export interface ListStashesQuery {
  page?: number;
  limit?: number;
  type?: ContentType;
  tagName?: string;
  dateFrom?: string;
  dateTo?: string;
}

async function resolveTagIds(tagNames: string | string[]): Promise<string[]> {
  const names = Array.isArray(tagNames) ? tagNames : [tagNames];
  const tags = await Tag.findAll({ where: { name: { [Op.in]: names } } });
  if (tags.length !== names.length) {
    const found = tags.map((t) => t.name);
    const invalid = names.filter((n) => !found.includes(n as any));
    throw new ValidationError(`Invalid tag(s): ${invalid.join(', ')}. Valid tags: Article, Website, Video, Photo`);
  }
  return tags.map((t) => t.id);
}

// clears the association.
async function syncCollections(
  stash: Stash,
  collectionIds: string | string[] | null,
  userId: string
): Promise<void> {
  const ids = collectionIds == null ? [] : Array.isArray(collectionIds) ? collectionIds : [collectionIds];
  if (ids.length === 0) {
    await (stash as any).setCollections([]);
    return;
  }
  const collections = await Collection.findAll({
    where: { id: { [Op.in]: ids }, userId },
  });
  if (collections.length !== ids.length) {
    throw new ValidationError('One or more collection IDs are invalid or do not belong to you');
  }
  await (stash as any).setCollections(collections);
}

async function syncTags(stash: Stash, tagNames: string | string[] | null): Promise<void> {
  if (tagNames == null) {
    await (stash as any).setTags([]);
    return;
  }
  const tagIds = await resolveTagIds(tagNames);
  const tags = await Tag.findAll({ where: { id: { [Op.in]: tagIds } } });
  await (stash as any).setTags(tags);
}


const STASH_INCLUDE = [
  { model: Tag, as: 'Tags', through: { attributes: [] } },
  { model: Collection, as: 'Collections', through: { attributes: [] }, attributes: ['id', 'name'] },
];


export const stashService = {
  async listForUser(userId: string, query: ListStashesQuery) {
    const { page = 1, limit = 20, type, tagName, dateFrom, dateTo } = query;
    const { offset, safeLimit } = buildPagination(page, limit);

    const where: WhereOptions = { userId, isDeleted: false };
    if (type) where.contentType = type;
    if (dateFrom || dateTo) {
      const dateFilter: Record<symbol, Date> = {};
      if (dateFrom) dateFilter[Op.gte] = new Date(dateFrom);
      if (dateTo) dateFilter[Op.lte] = new Date(dateTo);
      where.createdAt = dateFilter;
    }

    const tagInclude = tagName
      ? [{
          model: Tag,
          as: 'Tags',
          through: { attributes: [] },
          where: { name: tagName },
          required: true,
        }]
      : STASH_INCLUDE;

    const { count, rows } = await Stash.findAndCountAll({
      where,
      include: tagName ? tagInclude : STASH_INCLUDE,
      order: [['createdAt', 'DESC']],
      limit: safeLimit,
      offset,
      distinct: true, 
    });

    return {
      stashesByType: groupStashesByType(rows),
      allStashes: rows,
      pagination: { page, limit: safeLimit, total: count, totalPages: Math.ceil(count / safeLimit) },
    };
  },

  async findByIdForUser(stashId: string, userId: string) {
    const stash = await Stash.findOne({
      where: { id: stashId, userId, isDeleted: false },
      include: STASH_INCLUDE,
    });
    if (!stash) throw new NotFoundError('Stash', stashId);
    return stash;
  },

  async createFromUrl(userId: string, dto: CreateStashDto, file?: { buffer: Buffer; originalname: string; mimetype: string }) {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(dto.url);
    } catch {
      throw new ValidationError('Invalid URL format');
    }

    const initialType = file
      ? detectContentTypeFromMime(file.mimetype)
      : detectContentTypeFromUrl(parsedUrl);

    const stash = await Stash.create({
      userId,
      url: parsedUrl.toString(),
      title: dto.title,
      contentType: initialType,
      status: file ? StashStatus.PROCESSING : StashStatus.PROCESSING,
      metadata: {},
    });

    if (dto.collectionId !== undefined) await syncCollections(stash, dto.collectionId, userId);
    if (dto.tagName !== undefined) await syncTags(stash, dto.tagName);

    if (file && (initialType === ContentType.DOCUMENT || initialType === ContentType.PHOTO || initialType === ContentType.VIDEO)) {
      enqueueFileEnrichment(stash, file.buffer, file.originalname, initialType as any);
    } else {
      enqueueUrlEnrichment(stash);
    }

    return stash;
  },

  async update(stashId: string, userId: string, dto: UpdateStashDto) {
    const stash = await stashService.findByIdForUser(stashId, userId);
    if (dto.title) await stash.update({ title: dto.title });
    if (dto.collectionId !== undefined) await syncCollections(stash, dto.collectionId, userId);
    if (dto.tagName !== undefined) await syncTags(stash, dto.tagName);
    return stashService.findByIdForUser(stashId, userId);
  },

  async delete(stashId: string, userId: string) {
    const stash = await stashService.findByIdForUser(stashId, userId);
    await stash.update({ isDeleted: true });
  },
};