import { Request, Response } from 'express';
import { searchService } from '../services/searchService';
import { searchQuerySchema } from '../middlewares/validate';
import { ok } from '../helpers/response';
import { ValidationError } from '../utils/errors';
import { ContentType } from '../types';

export const searchController = {
  async search(req: Request, res: Response): Promise<void> {
    const parsed = searchQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join('; ')
      );
    }

    const data = {
      ...parsed.data,
      type: parsed.data.type ? (parsed.data.type as ContentType) : undefined,
    };
    const results = await searchService.search(req.userId!, data);
    ok(res, results);
  },
};