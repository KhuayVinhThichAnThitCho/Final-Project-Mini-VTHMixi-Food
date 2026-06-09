import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './orderController';
import { reviewService } from '../services/reviewService';
import { AppError } from '../middlewares/errorHandler';

export const reviewController = {
  /**
   * Tạo đánh giá mới cho đơn hàng
   */
  createReview: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập để viết đánh giá.');
      }

      const { orderId, rating, comment } = req.body;
      const review = await reviewService.createReview(req.user.id, orderId, rating, comment);

      res.status(201).json({
        success: true,
        message: 'Cảm ơn bạn đã đánh giá đơn hàng! Bạn đã được cộng 10 điểm thưởng tích lũy.',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy danh sách đánh giá của nhà hàng
   */
  getRestaurantReviews: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { restaurantId } = req.params;
      const reviews = await reviewService.getReviewsByRestaurant(restaurantId);

      res.status(200).json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default reviewController;
