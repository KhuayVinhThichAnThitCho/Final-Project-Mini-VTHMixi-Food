import api from './api';
import { MOCK_RESTAURANTS } from '../utils/mockData';

export interface RestaurantFilters {
  minRating?: number;
  maxDeliveryFee?: number;
  isOpenOnly?: boolean;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export const restaurantApi = {
  /**
   * Lấy danh sách nhà hàng có lọc và phân trang
   */
  getRestaurants: async (filters: RestaurantFilters = {}) => {
    const { page = 1, limit = 8, minRating = 0, maxDeliveryFee = 0, isOpenOnly = false, sortBy = 'default' } = filters;
    try {
      const response = await api.get('/restaurants', {
        params: { page, limit, minRating, maxDeliveryFee, isOpenOnly, sortBy },
      }) as any;
      return response.data;
    } catch (error) {
      console.warn('Backend /restaurants failed. Falling back to mock.', error);

      // Fallback mock
      let result = [...MOCK_RESTAURANTS];
      if (minRating > 0) result = result.filter((r) => r.rating >= minRating);
      if (maxDeliveryFee > 0) result = result.filter((r) => r.deliveryFee <= maxDeliveryFee);
      if (isOpenOnly) result = result.filter((r) => r.isOpen);
      if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
      if (sortBy === 'delivery_fee_asc') result.sort((a, b) => a.deliveryFee - b.deliveryFee);

      const offset = (page - 1) * limit;
      const paginated = result.slice(offset, offset + limit);

      return {
        restaurants: paginated,
        total: result.length,
        page,
        limit,
        hasMore: offset + paginated.length < result.length,
      };
    }
  },

  /**
   * Lấy chi tiết nhà hàng theo ID
   */
  getRestaurantById: async (id: string) => {
    try {
      const response = await api.get(`/restaurants/${id}`) as any;
      return response.data;
    } catch (error) {
      console.warn(`Backend /restaurants/${id} failed. Falling back to mock.`, error);
      const restaurant = MOCK_RESTAURANTS.find((r) => r.id === id) || MOCK_RESTAURANTS[0];
      return restaurant;
    }
  },
};

export default restaurantApi;
