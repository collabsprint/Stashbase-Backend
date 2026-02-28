import { Request, Response } from 'express';
import { collectionService } from '../services/collectionService';
import { ok, created, noContent } from '../helpers/response';

export const collectionController = {
  async list(req: Request, res: Response): Promise<void> {
    const collections = await collectionService.findAllByUser(req.userId!);
    ok(res, collections);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const collection = await collectionService.findByIdForUser(id, req.userId!);
    ok(res, collection);
  },

  async getWithStashes(req: Request, res: Response): Promise<void> {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await collectionService.findWithStashes(id, req.userId!);
    ok(res, data);
  },

  async create(req: Request, res: Response): Promise<void> {
    const collection = await collectionService.create(req.userId!, req.body);
    created(res, collection, 'Collection created');
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const collection = await collectionService.update(id, req.userId!, req.body);
    ok(res, collection, 'Collection updated');
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await collectionService.delete(id, req.userId!);
    ok(res, null, 'Collection deleted');
  },
};