import { Request, Response } from 'express';
import { searchService } from '../services/searchService';
import { autocompleteService } from '../services/autoCompleteService';
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

  async autocomplete(req: Request, res: Response) {

    const q = req.query.q as string;

    if (!q) throw new ValidationError('Search query required');

    const suggestions = await autocompleteService.autocomplete(req.userId!, q);

    ok(res, suggestions);

  }
};