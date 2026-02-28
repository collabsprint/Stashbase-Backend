import { Router } from 'express';
import collectionRoutes from './collectionRoutes';
import stashRoutes from './stashRoutes';
import searchRoutes from './searchRoutes';

const router = Router();

router.use('/collections', collectionRoutes);
router.use('/stashes',     stashRoutes);
router.use('/search',      searchRoutes);

export default router;