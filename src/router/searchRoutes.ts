import { Router } from 'express';
import { searchController } from '../controllers/searchController';
import { authenticate } from '../middlewares/authenticate';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.use(authenticate);
router.get('/', asyncHandler(searchController.search));

export default router;