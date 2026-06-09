import { Router } from 'express';
import { reviewController } from '../controllers/reviewController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// API viết đánh giá (chỉ cho phép khi đã đăng nhập): POST /api/v1/reviews
router.post('/', authMiddleware, reviewController.createReview);

// API xem đánh giá của một nhà hàng (công khai): GET /api/v1/reviews/restaurant/:restaurantId
router.get('/restaurant/:restaurantId', reviewController.getRestaurantReviews);

export default router;
