import { Op, WhereOptions, literal } from 'sequelize';
import { Stash, Tag, Collection } from '../models/index';
import { ContentType } from '../types';
import { buildPagination } from '../helpers/paginate';

export interface SearchQuery {
  q?: string;
  type?: ContentType;
  tagName?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export const searchService = {
  async search(userId: string, query: SearchQuery) {
    const { q, type, tagName, dateFrom, dateTo, page = 1, limit = 20 } = query;
    const { offset, safeLimit } = buildPagination(page, limit);

    const where: WhereOptions = { userId, isDeleted: false };

    if (type) where.contentType = type;

    if (dateFrom || dateTo) {
      const dateFilter: Record<symbol, Date> = {};
      if (dateFrom) dateFilter[Op.gte] = new Date(dateFrom);
      if (dateTo) dateFilter[Op.lte] = new Date(dateTo);
      where.createdAt = dateFilter;
    }

    if (q && q.trim()) {
      const safeQ = q.trim().replace(/'/g, "''");
      where[Op.or as any] = [
        literal(`"Stash"."search_vector" @@ plainto_tsquery('english', '${safeQ}')`),
        literal(`"Stash"."metadata"->>'description' ILIKE '%${safeQ}%'`),
        literal(`"Stash"."metadata"->>'extractedText' ILIKE '%${safeQ}%'`),
      ];
    }

    const tagInclude = tagName
      ? [{ model: Tag, as: 'Tags', through: { attributes: [] }, where: { name: tagName }, required: true }]
      : [{ model: Tag, as: 'Tags', through: { attributes: [] } }];

    const { count, rows } = await Stash.findAndCountAll({
      where,
      include: [
        ...tagInclude,
        { model: Collection, as: 'Collections', through: { attributes: [] }, attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: safeLimit,
      offset,
      distinct: true,
    });

    return {
      results: rows,
      pagination: {
        page,
        limit: safeLimit,
        total: count,
        totalPages: Math.ceil(count / safeLimit),
      },
    };
  },
};