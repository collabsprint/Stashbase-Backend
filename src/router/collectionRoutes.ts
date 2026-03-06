import { Router } from 'express';
import { collectionController } from '../controllers/collectionController';
import { authenticate } from '../middlewares/authenticate';
import { validate, createCollectionSchema, updateCollectionSchema } from '../middlewares/validate';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(collectionController.getAllCollections));
router.post('/', validate(createCollectionSchema), asyncHandler(collectionController.createCollection));
router.get('/:id', asyncHandler(collectionController.getCollectionById));
router.get('/:id/stashes', asyncHandler(collectionController.getCollectionWithStashes));
router.patch('/:id', validate(updateCollectionSchema), asyncHandler(collectionController.updateCollection));
router.put('/:id/delete', asyncHandler(collectionController.deleteCollection));

export default router;