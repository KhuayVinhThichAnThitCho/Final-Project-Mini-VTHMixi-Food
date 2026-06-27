import { Router } from 'express';
import { orderController } from '../controllers/orderController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/rbacMiddleware';

const router = Router();

// Mặc định tất cả các route trong đây đều cần xác thực đăng nhập
router.use(authMiddleware);

// Route tạo đơn hàng mới: POST /api/v1/orders
router.post('/', orderController.createOrder);

// Route lấy danh sách đơn hàng cá nhân: GET /api/v1/orders/mine
router.get('/mine', orderController.getMyOrders);

// Route lấy đơn hàng của quán (Dành cho Vendor): GET /api/v1/orders/restaurant
router.get('/restaurant', authorize(['vendor', 'admin']), orderController.getRestaurantOrders);

// Route cập nhật trạng thái đơn hàng (VENDOR, MANAGER, ADMIN cập nhật mọi trạng thái, USER chỉ được Hủy): PATCH /api/v1/orders/:id/status
router.patch('/:id/status', authorize(['user', 'vendor', 'manager', 'admin']), orderController.updateStatus);

export default router;
