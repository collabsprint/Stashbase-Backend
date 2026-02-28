import { Request, Response } from 'express';
import { stashService } from '../services/stashService';
import { ok, created, noContent } from '../helpers/response';
import { ContentType } from '../types';

export const stashController = {
  async list(req: Request, res: Response): Promise<void> {
    const result = await stashService.listForUser(req.userId!, {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      type: req.query.type as ContentType | undefined,
      tagName: req.query.tagName as string | undefined,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
    });
    ok(res, result);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const stash = await stashService.findByIdForUser(id, req.userId!);
    ok(res, stash);
  },

  async create(req: Request, res: Response): Promise<void> {
    const file = (req as any).file as Express.Multer.File | undefined;

    const stash = await stashService.createFromUrl(
      req.userId!,
      req.body,
      file
        ? { buffer: file.buffer, originalname: file.originalname, mimetype: file.mimetype }
        : undefined
    );

    created(res, { id: stash.id, status: stash.status }, 'Stash saved — enrichment in progress');
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const stash = await stashService.update(id, req.userId!, req.body);
    ok(res, stash, 'Stash updated');
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await stashService.delete(id, req.userId!);
    ok(res, null, 'Stash deleted');
  },
};