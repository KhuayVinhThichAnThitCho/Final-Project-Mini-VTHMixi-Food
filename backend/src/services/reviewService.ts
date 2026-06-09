import { Review } from '../models/Review';
import { Order } from '../models/Order';
import { Wallet } from '../models/Wallet';
import { AppError } from '../middlewares/errorHandler';

export const reviewService = {
  /**
   * Tạo đánh giá cho đơn hàng đã hoàn thành và cộng điểm tích lũy thưởng
   */
  createReview: async (
    userId: string,
    orderId: string,
    rating: number,
    comment?: string
  ): Promise<Review> => {
    // 1. Kiểm tra đơn hàng tồn tại
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy đơn hàng yêu cầu.');
    }

    // Ràng buộc bảo mật: Chỉ người mua đơn hàng mới có quyền đánh giá
    if (order.userId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'Bạn không có quyền đánh giá đơn hàng này.');
    }

    // Ràng buộc nghiệp vụ: Đơn hàng bắt buộc phải ở trạng thái "Completed" mới được đánh giá
    if (order.status !== 'completed') {
      throw new AppError(400, 'BUSINESS_ERROR', 'Bạn chỉ có thể đánh giá những đơn hàng đã giao thành công.');
    }

    // Kiểm tra xem đơn hàng này đã được đánh giá trước đó chưa
    const existingReview = await Review.findOne({ where: { orderId } });
    if (existingReview) {
      throw new AppError(400, 'BUSINESS_ERROR', 'Đơn hàng này đã được đánh giá rồi.');
    }

    // 2. Định nghĩa điểm thưởng tích lũy (Ví dụ: mỗi lần đánh giá được tặng 10 điểm vào ví)
    const rewardPoints = 10;

    // 3. Tạo Review trong database
    const review = await Review.create({
      userId,
      orderId,
      rating,
      comment,
      rewardPoints,
    });

    // 4. Cộng điểm tích lũy trực tiếp vào ví của người dùng
    const wallet = await Wallet.findOne({ where: { userId } });
    if (wallet) {
      wallet.balance = Number(wallet.balance) + rewardPoints;
      await wallet.save();
      console.log(`🎁 Đã cộng ${rewardPoints} điểm tích lũy vào ví của User: ${userId}`);
    }

    return review;
  },

  /**
   * Lấy danh sách đánh giá của một Nhà hàng cụ thể
   */
  getReviewsByRestaurant: async (restaurantId: string): Promise<Review[]> => {
    // Tìm các Review liên quan đến đơn hàng của nhà hàng đó
    return Review.findAll({
      include: [
        {
          model: Order,
          where: { restaurantId },
          attributes: [],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  },
};

export default reviewService;
