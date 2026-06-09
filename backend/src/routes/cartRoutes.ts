import { Router } from 'express';
import { cartController } from '../controllers/cartController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Toàn bộ API giỏ hàng bắt buộc phải đăng nhập
router.use(authMiddleware);

// Lấy thông tin giỏ hàng hiện tại: GET /api/v1/carts
router.get('/', cartController.getCart);

// Thêm món ăn vào giỏ hàng: POST /api/v1/carts/add
router.post('/add', cartController.addToCart);

// Cập nhật số lượng món ăn: PUT /api/v1/carts/update
router.put('/update', cartController.updateQuantity);

// Xóa một món ăn khỏi giỏ hàng: DELETE /api/v1/carts/remove/:menuItemId
router.delete('/remove/:menuItemId', cartController.removeFromCart);

// Dọn dẹp sạch giỏ hàng: DELETE /api/v1/carts/clear
router.delete('/clear', cartController.clearCart);

export default router;
