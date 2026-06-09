import { Router } from 'express';
import authRoutes from './authRoutes';
import orderRoutes from './orderRoutes';
import cartRoutes from './cartRoutes';
import reviewRoutes from './reviewRoutes';
import statsRoutes from './statsRoutes';

const router = Router();

// Gắn các router con vào router tổng
router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/carts', cartRoutes);
router.use('/reviews', reviewRoutes);
router.use('/stats', statsRoutes);

export default router;
