import { Router } from 'express';
import { shipperController } from '../controllers/shipperController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/rbacMiddleware';

const router = Router();

// Tất cả các route cần đăng nhập
router.use(authMiddleware);

// ─── Routes chỉ dành cho Shipper ────────────────────────────────

// Lấy danh sách đơn sẵn sàng nhận: GET /api/v1/shipper/orders/available
router.get('/orders/available', authorize(['shipper', 'admin']), shipperController.getAvailableOrders);

// Lịch sử đơn đã giao: GET /api/v1/shipper/orders/my
router.get('/orders/my', authorize(['shipper', 'admin']), shipperController.getMyDeliveries);

// Nhận đơn hàng (race-safe): POST /api/v1/shipper/orders/:id/accept
router.post('/orders/:id/accept', authorize(['shipper']), shipperController.acceptOrder);

// Xác nhận lấy hàng tại quán + upload ảnh: POST /api/v1/shipper/orders/:id/pickup
router.post('/orders/:id/pickup', authorize(['shipper']), shipperController.confirmPickup);

// Xác nhận giao hàng xong + upload ảnh: POST /api/v1/shipper/orders/:id/complete
router.post('/orders/:id/complete', authorize(['shipper']), shipperController.completeDelivery);

// Bật/Tắt trạng thái online: PATCH /api/v1/shipper/me/online
router.patch('/me/online', authorize(['shipper']), shipperController.toggleOnline);

// Thống kê thu nhập: GET /api/v1/shipper/me/earnings
router.get('/me/earnings', authorize(['shipper', 'admin']), shipperController.getMyEarnings);

// ─── Route dành cho User (khách đánh giá shipper) ───────────────

// Đánh giá shipper sau khi nhận hàng: POST /api/v1/shipper/orders/:id/rate
router.post('/orders/:id/rate', authorize(['user', 'admin']), shipperController.rateShipper);

export default router;
