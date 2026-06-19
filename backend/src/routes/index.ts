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
import walletRoutes from './walletRoutes';
import adminRoutes from './adminRoutes';
import shipperRoutes from './shipperRoutes';
import managerRoutes from './managerRoutes';
import { SystemConfig } from '../models/SystemConfig';

const router = Router();

// ─── Public: System Notice (không cần auth) ───────────────────
// GET /api/v1/system/notice — Trả về thông báo hệ thống đang active
router.get('/system/notice', async (req, res, next) => {
  try {
    const config = await SystemConfig.findByPk('system_notice');
    if (!config) return res.json({ success: true, data: null });
    const notice = JSON.parse(config.value);
    // Chỉ trả về nếu đang active
    if (!notice.isActive || !notice.message) {
      return res.json({ success: true, data: null });
    }
    res.json({ success: true, data: notice });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/system/payment-methods — Trả về cấu hình phương thức thanh toán
router.get('/system/payment-methods', async (req, res, next) => {
  try {
    const config = await SystemConfig.findByPk('payment_methods');
    if (!config) {
      return res.json({
        success: true,
        data: { COD: true, WALLET: true, POINTS: true }
      });
    }
    const methods = JSON.parse(config.value);
    res.json({ success: true, data: methods });
  } catch (error) {
    next(error);
  }
});

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
router.use('/wallet', walletRoutes);
router.use('/admin', adminRoutes);
router.use('/shipper', shipperRoutes);
router.use('/manager', managerRoutes);

export default router;
