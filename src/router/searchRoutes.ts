import { Router } from 'express';
import { searchController } from '../controllers/searchController';
import { requireAuth } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(searchController.search));

export default router;