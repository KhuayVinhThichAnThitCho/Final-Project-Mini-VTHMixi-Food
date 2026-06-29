import { Review } from '../models/Review';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { Voucher } from '../models/Voucher';
import { AppError } from '../middlewares/errorHandler';

export const reviewService = {
  /**
   * Tạo đánh giá cho món ăn trong đơn hàng đã hoàn thành và nhận thưởng
   */
  createReview: async (
    userId: string,
    orderId: string,
    menuItemId: string,
    rating: number,
    comment?: string,
    rewardType: 'points' | 'voucher' = 'points'
  ): Promise<{ review: Review; rewardPoints?: number; voucherCode?: string }> => {
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

    // Kiểm tra món ăn có trong danh sách món của đơn hàng đó không
    const hasItem = order.items && order.items.some((item: any) => item.menuItemId === menuItemId);
    if (!hasItem) {
      throw new AppError(400, 'BUSINESS_ERROR', 'Món ăn này không nằm trong đơn hàng bạn đã mua.');
    }

    // Kiểm tra xem món ăn này trong đơn hàng này đã được đánh giá trước đó chưa
    const existingReview = await Review.findOne({ where: { orderId, menuItemId } });
    if (existingReview) {
      throw new AppError(400, 'BUSINESS_ERROR', 'Món ăn này đã được đánh giá cho đơn hàng này rồi.');
    }

    // 2. Xử lý thưởng tích lũy (Cộng điểm vào User hoặc Tặng Voucher giảm giá)
    let rewardPoints = 0;
    let voucherCode = '';

    if (rewardType === 'points') {
      rewardPoints = 50; // Cộng 50 điểm (tương đương cước mua hàng sau)
      const user = await User.findByPk(userId);
      if (user) {
        user.points = (user.points || 0) + rewardPoints;
        await user.save();
        console.log(`🎁 Đã cộng ${rewardPoints} điểm tích lũy cho User: ${userId}`);
      }
    } else {
      // Tạo mã voucher ngẫu nhiên bắt đầu bằng DG-
      const uniqueCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      voucherCode = `DG-${uniqueCode}`;

      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(now.getMonth() + 1);

      // Lưu voucher vào database
      await Voucher.create({
        code: voucherCode,
        discountType: 'fixed_amount',
        discountValue: 15000, // Giảm 15.000đ
        minOrderAmount: 30000, // Đơn hàng tối thiểu 30k
        startDate: now,
        endDate: nextMonth,
        isActive: true,
      });
      console.log(`🎁 Đã tạo mã giảm giá đánh giá mới: ${voucherCode} cho User: ${userId}`);
    }

    // 3. Tạo Review trong database
    const review = await Review.create({
      userId,
      orderId,
      menuItemId,
      rating,
      comment,
      rewardPoints: rewardType === 'points' ? rewardPoints : 0,
    });

    // 4. Tự động tính toán lại rating trung bình của nhà hàng và cập nhật vào bảng restaurants
    try {
      const restaurantId = order.restaurantId;
      if (restaurantId) {
        const allReviews = await Review.findAll({
          include: [
            {
              model: Order,
              where: { restaurantId },
              attributes: [],
            },
          ],
          attributes: ['rating']
        });

        if (allReviews.length > 0) {
          const sumRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
          const calculatedAvg = sumRating / allReviews.length;
          
          const { Restaurant } = await import('../models/Restaurant');
          await Restaurant.update(
            { ratingAvg: parseFloat(calculatedAvg.toFixed(1)) },
            { where: { id: restaurantId } }
          );
          console.log(`⭐ Đã tự động cập nhật ratingAvg của Restaurant ${restaurantId} thành ${calculatedAvg.toFixed(1)}`);
        }
      }
    } catch (err) {
      console.error('Lỗi khi tự động cập nhật ratingAvg cho nhà hàng:', err);
    }

    return { review, rewardPoints, voucherCode };
  },

  /**
   * Lấy danh sách đánh giá của một món ăn cụ thể
   */
  getReviewsByMenuItem: async (menuItemId: string): Promise<Review[]> => {
    return Review.findAll({
      where: { menuItemId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'avatar'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
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
        {
          model: User,
          as: 'user',
          attributes: ['name', 'avatar'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  },
};

export default reviewService;
