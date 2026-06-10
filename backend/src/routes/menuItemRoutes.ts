import { Router } from 'express';
import { menuItemController } from '../controllers/menuItemController';

const router = Router();

// Route: Lấy Top sản phẩm bán chạy/xem nhiều
router.get('/top', menuItemController.getTopItems);

// Route: Tăng lượt xem sản phẩm
router.post('/:id/view', menuItemController.incrementView);

// Route: Lấy thống kê của sản phẩm
router.get('/:id/stats', menuItemController.getMenuItemStats);

// Route: Lấy danh sách sản phẩm phân trang theo danh mục (Lazy loading)
router.get('/', menuItemController.getMenuItems);

export default router;
