import { Router } from 'express';
import { restaurantController } from '../controllers/restaurantController';

const router = Router();

// Route: Lấy danh sách nhà hàng (có lọc, phân trang)
router.get('/', restaurantController.getRestaurants);

// Route: Lấy chi tiết nhà hàng theo ID (kèm thực đơn)
router.get('/:id', restaurantController.getRestaurantById);

export default router;
