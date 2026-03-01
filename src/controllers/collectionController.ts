import { Request, Response } from 'express';
import { collectionService } from '../services/collectionService';
import { ok, created, noContent } from '../helpers/response';

export const collectionController = {
  async getAllCollections(req: Request, res: Response): Promise<void> {
    const collections = await collectionService.getAllCollections(req.userId!);
    ok(res, collections);
  },

  async getCollectionById(req: Request, res: Response): Promise<void> {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const collection = await collectionService.findByIdForUser(id, req.userId!);
    ok(res, collection);
  },

  async getCollectionWithStashes(req: Request, res: Response): Promise<void> {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await collectionService.getCollectionWithStashes(id, req.userId!);
    ok(res, data);
  },

  async createCollection(req: Request, res: Response): Promise<void> {
    const collection = await collectionService.createCollection(req.userId!, req.body);
    created(res, collection, 'Collection created');
  },

  async updateCollection(req: Request, res: Response): Promise<void> {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const collection = await collectionService.updateCollection(id, req.userId!, req.body);
    ok(res, collection, 'Collection updated');
  },

  async deleteCollection(req: Request, res: Response): Promise<void> {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await collectionService.deleteCollection(id, req.userId!);
    ok(res, null, 'Collection deleted');
  },
};