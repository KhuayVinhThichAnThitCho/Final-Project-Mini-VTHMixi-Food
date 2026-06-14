import { Router } from 'express';
import { restaurantController } from '../controllers/restaurantController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/rbacMiddleware';

const router = Router();

// ===== PUBLIC ROUTES =====
// Route: Lấy danh sách nhà hàng (có lọc, phân trang)
router.get('/', restaurantController.getRestaurants);

// ===== VENDOR ROUTES - PHẢI ĐẶT TRƯỚC /:id để tránh route conflict =====
// Route: Lấy thông tin quán của vendor đang đăng nhập
router.get('/mine', authMiddleware, authorize(['vendor', 'admin']), restaurantController.getMyRestaurant);

// Route: Cập nhật thông tin quán
router.put('/mine', authMiddleware, authorize(['vendor', 'admin']), restaurantController.updateMyRestaurant);

// Route: Lấy danh sách menu items của quán
router.get('/mine/menu-items', authMiddleware, authorize(['vendor', 'admin']), restaurantController.getMyMenuItems);

// Route: Thêm món ăn mới
router.post('/mine/menu-items', authMiddleware, authorize(['vendor', 'admin']), restaurantController.createMyMenuItem);

// Route: Cập nhật thông tin món ăn
router.patch('/mine/menu-items/:itemId', authMiddleware, authorize(['vendor', 'admin']), restaurantController.updateMyMenuItem);

// Route: Xóa món ăn (soft delete)
router.delete('/mine/menu-items/:itemId', authMiddleware, authorize(['vendor', 'admin']), restaurantController.deleteMyMenuItem);

// ===== PUBLIC DETAIL ROUTE - PHẢI ĐẶT SAU các route cụ thể =====
// Route: Lấy chi tiết nhà hàng theo ID (kèm thực đơn)
router.get('/:id', restaurantController.getRestaurantById);

export default router;
