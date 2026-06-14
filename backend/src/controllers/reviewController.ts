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

      const { orderId, menuItemId, rating, comment, rewardType } = req.body;
      const result = await reviewService.createReview(req.user.id, orderId, menuItemId, rating, comment, rewardType);

      let successMessage = 'Cảm ơn bạn đã viết đánh giá!';
      if (result.rewardPoints) {
        successMessage = `Cảm ơn bạn đã viết đánh giá! Bạn được tặng ${result.rewardPoints} điểm tích lũy.`;
      } else if (result.voucherCode) {
        successMessage = `Cảm ơn bạn đã viết đánh giá! Bạn nhận được mã giảm giá: ${result.voucherCode}`;
      }

      res.status(201).json({
        success: true,
        message: successMessage,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy danh sách đánh giá của món ăn cụ thể
   */
  getMenuItemReviews: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { menuItemId } = req.params;
      const reviews = await reviewService.getReviewsByMenuItem(menuItemId);

      res.status(200).json({
        success: true,
        data: reviews,
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

  /**
   * Vendor phản hồi đánh giá của khách hàng
   */
  replyToReview: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập để phản hồi đánh giá.');
      }
      if (req.user.role !== 'vendor' && req.user.role !== 'admin') {
        throw new AppError(403, 'FORBIDDEN', 'Chỉ chủ quán mới có thể phản hồi đánh giá.');
      }

      const { id } = req.params;
      const { reply } = req.body;

      if (!reply || !reply.trim()) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Nội dung phản hồi không được để trống.');
      }

      const { Review } = await import('../models/Review');
      const review = await Review.findByPk(id);
      if (!review) {
        throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy đánh giá này.');
      }

      review.vendorReply = reply.trim();
      await review.save();

      res.status(200).json({
        success: true,
        message: 'Phản hồi đánh giá thành công.',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default reviewController;
