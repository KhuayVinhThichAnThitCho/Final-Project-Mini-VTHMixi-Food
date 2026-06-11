import { Router } from 'express';
import authRoutes from './authRoutes';
import orderRoutes from './orderRoutes';
import cartRoutes from './cartRoutes';
import reviewRoutes from './reviewRoutes';
import statsRoutes from './statsRoutes';
import menuItemRoutes from './menuItemRoutes';
import favoritesRoutes from './favoritesRoutes';
import voucherRoutes from './voucherRoutes';
import restaurantRoutes from './restaurantRoutes';
import searchRoutes from './searchRoutes';
import chatRoutes from './chatRoutes';

const router = Router();

// Gắn các router con vào router tổng
router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/carts', cartRoutes);
router.use('/reviews', reviewRoutes);
router.use('/stats', statsRoutes);
router.use('/menu-items', menuItemRoutes);
router.use('/favorites', favoritesRoutes);
router.use('/vouchers', voucherRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/search', searchRoutes);
router.use('/chats', chatRoutes);

export default router;
