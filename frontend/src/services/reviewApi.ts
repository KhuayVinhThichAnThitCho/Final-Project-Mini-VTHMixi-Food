import api from './api';

export const reviewApi = {
  /**
   * Viết đánh giá món ăn và nhận thưởng (points hoặc voucher)
   */
  createReview: async (reviewData: {
    orderId: string;
    menuItemId: string;
    rating: number;
    comment?: string;
    rewardType: 'points' | 'voucher';
  }) => {
    return api.post('/reviews', reviewData) as any;
  },

  /**
   * Lấy danh sách đánh giá của món ăn cụ thể
   */
  getMenuItemReviews: async (menuItemId: string) => {
    return api.get(`/reviews/menu-item/${menuItemId}`) as any;
  },

  /**
   * Lấy danh sách đánh giá của nhà hàng
   */
  getRestaurantReviews: async (restaurantId: string) => {
    return api.get(`/reviews/restaurant/${restaurantId}`) as any;
  },
};

export default reviewApi;
