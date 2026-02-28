import { Op } from 'sequelize';
import { Collection, Stash, Tag, StashCollection } from '../models/index';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { ContentType } from '../types';
import { groupStashesByType } from '../helpers/stashGrouper';

export interface CreateCollectionDto {
  name: string;
  description?: string;
}

export interface UpdateCollectionDto {
  name?: string;
  description?: string;
}

export const collectionService = {
  async findAllByUser(userId: string) {
    return Collection.findAll({
      where: { userId, isDeleted: false },
      order: [['createdAt', 'DESC']],
      attributes: {
        include: [
          [
            Collection.sequelize!.literal(
              `(SELECT COUNT(*) 
              FROM "StashCollections" sc 
              WHERE sc."collectionId" = "Collection"."id" 
              AND sc."isDeleted" = false)`
            ),
            'stashCount',
          ],
        ],
      },
    });
  },

  async findByIdForUser(collectionId: string, userId: string) {
    const collection = await Collection.findOne({
      where: { id: collectionId, userId, isDeleted: false },
    });
    if (!collection) throw new NotFoundError('Collection', collectionId);
    return collection;
  },

  async findWithStashes(collectionId: string, userId: string) {
    const collection = await Collection.findOne({
      where: { id: collectionId, userId, isDeleted: false },
      include: [
        {
          model: Stash,
          as: 'Stashes',
          through: { attributes: [] }, 
          include: [{ model: Tag, as: 'Tags', through: { attributes: [] } }],
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    if (!collection) throw new NotFoundError('Collection', collectionId);

    const stashes = (collection as any).stashes ?? [];
    return {
      ...collection.toJSON(),
      stashesByType: groupStashesByType(stashes),
    };
  },

  async create(userId: string, dto: CreateCollectionDto) {
    return Collection.create({ userId, name: dto.name, description: dto.description ?? null });
  },

  async update(collectionId: string, userId: string, dto: UpdateCollectionDto) {
    const collection = await collectionService.findByIdForUser(collectionId, userId);
    await collection.update(dto);
    return collectionService.findByIdForUser(collectionId, userId);
  },

  async delete(collectionId: string, userId: string) {
    const collection = await collectionService.findByIdForUser(collectionId, userId);
    await collection.update({ isDeleted: true });
  },
};