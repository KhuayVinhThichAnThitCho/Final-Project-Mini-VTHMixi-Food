import { Router } from 'express';
import authRoutes from './authRoutes';
import orderRoutes from './orderRoutes';

const router = Router();

// Gắn các router con vào router tổng
router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);

export default router;
