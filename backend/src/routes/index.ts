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
import { SystemConfig } from '../models/SystemConfig';
import paymentRoutes from './paymentRoutes';

const router = Router();

import aiRoutes from './aiRoutes';

// ─── Public: System Notice (không cần auth) ───────────────────
// GET /api/v1/system/notice — Trả về thông báo hệ thống đang active
router.get('/system/notice', async (req, res, next) => {
  try {
    const config = await SystemConfig.findByPk('system_notice');
    if (!config) return res.json({ success: true, data: null });
    const parsed = JSON.parse(config.value);

    // Hỗ trợ cả 2 format: mảng (CRUD mới) và object đơn (cũ)
    if (Array.isArray(parsed)) {
      // Tìm thông báo active đầu tiên trong mảng
      const active = parsed.find((n: any) => n.isActive && n.message);
      return res.json({ success: true, data: active || null });
    }

    // Legacy: single object
    if (!parsed.isActive || !parsed.message) {
      return res.json({ success: true, data: null });
    }
    res.json({ success: true, data: parsed });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/system/banner — Trả về cấu hình banner trang chủ công khai
router.get('/system/banner', async (req, res, next) => {
  try {
    const config = await SystemConfig.findByPk('homepage_banner');
    if (!config) return res.json({ success: true, data: null });
    const banner = JSON.parse(config.value);
    res.json({ success: true, data: banner });
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

// GET /api/v1/system/fees — Trả về cấu hình phí nền tảng, đơn hàng tối thiểu, ngưỡng freeship
router.get('/system/fees', async (req, res, next) => {
  try {
    const platformFeeConfig = await SystemConfig.findByPk('platform_fee');
    const minOrderAmountConfig = await SystemConfig.findByPk('min_order_amount');
    const freeDeliveryThresholdConfig = await SystemConfig.findByPk('free_delivery_threshold');

    res.json({
      success: true,
      data: {
        platformFee: platformFeeConfig ? Number(JSON.parse(platformFeeConfig.value)) : 5,
        minOrderAmount: minOrderAmountConfig ? Number(JSON.parse(minOrderAmountConfig.value)) : 20000,
        freeDeliveryThreshold: freeDeliveryThresholdConfig ? Number(JSON.parse(freeDeliveryThresholdConfig.value)) : 150000
      }
    });
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
router.use('/ai', aiRoutes);
router.use('/payments', paymentRoutes);

export default router;
