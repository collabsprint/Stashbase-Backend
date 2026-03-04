import { Op, WhereOptions, literal } from 'sequelize';
import { Stash, Tag, Collection } from '../models';
import { ContentType } from '../types';
import { buildPagination } from '../helpers/paginate';
import { generateEmbedding } from '../utils/embeddings';
import { understandSearchQuery } from './queryUnderstandingService';
import { logger } from '../utils/logger';

export interface SearchQuery {
  q?:        string;
  type?:     ContentType;
  tagName?:  string;
  dateFrom?: string;
  dateTo?:   string;
  page?:     number;
  limit?:    number;
}

export const searchService = {

  async search(userId: string, query: SearchQuery) {

    const { q, type, tagName, dateFrom, dateTo, page = 1, limit = 20 } = query;
    const { offset, safeLimit } = buildPagination(page, limit);

    const where: WhereOptions = { userId, isDeleted: false };

    if (type) where['contentType'] = type;

    if (dateFrom || dateTo) {
      const dateFilter: Record<symbol, Date> = {};
      if (dateFrom) dateFilter[Op.gte] = new Date(dateFrom);
      if (dateTo)   dateFilter[Op.lte] = new Date(dateTo);
      where['createdAt'] = dateFilter;
    }

    let keywords = q;

    if (q) {
      try {
        const parsed = await understandSearchQuery(q);
        if (parsed.keywords)    keywords = parsed.keywords;
        if (parsed.contentType) where['contentType'] = parsed.contentType as ContentType;
        if (parsed.dateFrom) {
          where['createdAt'] = { [Op.gte]: literal(`NOW() - INTERVAL '7 days'`) };
        }
      } catch (err) {
        logger.warn(`[search] Query understanding failed, falling back to raw query: ${err}`);
      }
    }

    let embedding: number[] | null = null;

    if (keywords) {
      try {
        embedding = await generateEmbedding(keywords);
      } catch (err) {
        logger.warn(`[search] Embedding generation failed, using text search only: ${err}`);
      }
    }

    if (keywords) {
      (where as any)[Op.or] = [
        literal(`"Stash"."search_vector" @@ plainto_tsquery('english', :query)`),
        { title: { [Op.iLike]: `%${keywords}%` } },
        literal(`similarity("Stash"."title", :query) > 0.3`),
      ];
    }

    const rankLiteral = keywords && embedding
      ? literal(`
          ts_rank("Stash"."search_vector", plainto_tsquery('english', :query))
          + similarity("Stash"."title", :query)
          + (1 - ("Stash"."embedding" <=> :embedding))
        `)
      : keywords
      ? literal(`
          ts_rank("Stash"."search_vector", plainto_tsquery('english', :query))
          + similarity("Stash"."title", :query)
        `)
      : literal(`0`);

    const tagInclude = tagName
      ? [{
          model: Tag, as: 'Tags',
          through: { attributes: [] },
          where: { name: tagName },
          required: true,
          attributes: ['id', 'name'],
        }]
      : [{ model: Tag, as: 'Tags', through: { attributes: [] }, attributes: ['id', 'name'] }];

    const { count, rows } = await Stash.findAndCountAll({
      where,
      include: [
        ...tagInclude,
        {
          model: Collection, as: 'Collections',
          through: { attributes: [] },
          attributes: ['id', 'name'],
        },
      ],
      attributes: {
        include: [[rankLiteral, 'relevanceScore']],
      },
      order:        [[literal('relevanceScore'), 'DESC']],
      replacements: {
        query:    keywords ?? '',
        likeQuery: `%${keywords ?? ''}%`,
        ...(embedding ? { embedding: JSON.stringify(embedding) } : {}),
      },
      limit:    safeLimit,
      offset,
      distinct: true,
    });

    return {
      results: rows,
      pagination: {
        page,
        limit:      safeLimit,
        total:      count,
        totalPages: Math.ceil(count / safeLimit),
      },
    };
  },

};