import { Router } from 'express';
import { collectionController } from '../controllers/collectionController';
import { requireAuth } from '../middlewares/auth';
import { validate, createCollectionSchema, updateCollectionSchema } from '../middlewares/validate';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(collectionController.list));
router.post('/', validate(createCollectionSchema), asyncHandler(collectionController.create));
router.get('/:id', asyncHandler(collectionController.getById));
router.get('/:id/stashes', asyncHandler(collectionController.getWithStashes));
router.patch('/:id', validate(updateCollectionSchema), asyncHandler(collectionController.update));
router.put('/:id/delete', asyncHandler(collectionController.delete));

export default router;