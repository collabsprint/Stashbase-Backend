import { Op, WhereOptions, literal } from 'sequelize';
import { Stash, Tag, Collection, sequelize } from '../models';
import { ContentType } from '../types';
import { buildPagination } from '../helpers/paginate';
import { generateEmbedding } from '../utils/embeddings';
import { understandSearchQuery } from './queryUnderstandingService';

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

    const where: WhereOptions = {
      userId,
      isDeleted: false,
    };

    if (type) where['contentType'] = type;

    if (dateFrom || dateTo) {

      const dateFilter: Record<symbol, Date> = {};

      if (dateFrom) dateFilter[Op.gte] = new Date(dateFrom);
      if (dateTo) dateFilter[Op.lte] = new Date(dateTo);

      where['createdAt'] = dateFilter;
    }

    let parsed: any = {};

    if (q) {
      parsed = await understandSearchQuery(q);
    }

    const keywords = parsed.keywords || q;

    if (parsed.contentType) {
      where['contentType'] = parsed.contentType as ContentType;
    }

    if (parsed.dateFrom) {
      where['createdAt'] = {
        [Op.gte]: literal(`NOW() - INTERVAL '7 days'`)
      };
    }

    let embedding: number[] | null = null;

    if (keywords) {
      embedding = await generateEmbedding(keywords);
    }

    if (keywords) {

      (where as any)[Op.or] = [

        literal(`
          "Stash"."search_vector"
          @@ plainto_tsquery('english', :query)
        `),

        {
          title: {
            [Op.iLike]: `%${keywords}%`
          }
        },

        literal(`
          similarity("Stash"."title", :query) > 0.3
        `)
      ];

    }

    const rankLiteral = keywords && embedding
      ? literal(`
        ts_rank("Stash"."search_vector", plainto_tsquery('english', :query))
        +
        similarity("Stash"."title", :query)
        +
        (1 - ("Stash"."embedding" <=> :embedding))
      `)
      : literal(`0`);

      const { count, rows } = await Stash.findAndCountAll({

      where,

      include: [

        {
          model: Tag,
          as: 'Tags',
          through: { attributes: [] }
        },

        {
          model: Collection,
          as: 'Collections',
          through: { attributes: [] },
          attributes: ['id', 'name']
        }

      ],

      attributes: {
        include: [[rankLiteral, 'relevance_score']]
      },

      order: [[literal('relevance_score'), 'DESC']],

      replacements: {
        query: keywords,
        embedding
      },

      limit: safeLimit,
      offset,
      distinct: true

    });

    return {

      results: rows,

      pagination: {
        page,
        limit: safeLimit,
        total: count,
        totalPages: Math.ceil(count / safeLimit)
      }

    };

  }

};