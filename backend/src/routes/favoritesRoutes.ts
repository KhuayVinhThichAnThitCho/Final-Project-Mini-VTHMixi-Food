import { Router } from 'express';
import { favoritesController } from '../controllers/favoritesController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Tất cả các route yêu thích đều cần đăng nhập
router.use(authMiddleware);

// POST /api/v1/favorites/toggle: Thêm/Xóa yêu thích
router.post('/toggle', favoritesController.toggleFavorite);

// GET /api/v1/favorites: Lấy danh sách yêu thích
router.get('/', favoritesController.getMyFavorites);

export default router;
