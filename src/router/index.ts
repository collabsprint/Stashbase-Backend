import { Router } from 'express';
import collectionRoutes from './collectionRoutes';
import stashRoutes from './stashRoutes';
import searchRoutes from './searchRoutes';
import authRoutes from './authRoutes';

const router = Router();

router.use('/collections', collectionRoutes);
router.use('/stashes',     stashRoutes);
router.use('/search',      searchRoutes);
router.use('/auth',        authRoutes);

export default router;