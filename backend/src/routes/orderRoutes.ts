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

// Route cập nhật trạng thái đơn hàng (chỉ VENDOR, MANAGER, ADMIN được thực hiện): PATCH /api/v1/orders/:id/status
router.patch('/:id/status', authorize(['vendor', 'manager', 'admin']), orderController.updateStatus);

export default router;
