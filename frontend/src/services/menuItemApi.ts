import api from './api';
import { MOCK_MENU_ITEMS, MOCK_RESTAURANTS } from '../utils/mockData';
import { isWithinOperatingHours } from '../utils/timeHelper';

export const menuItemApi = {
  /**
   * Lấy danh sách sản phẩm phân trang theo danh mục (Lazy loading)
   */
  getMenuItems: async (category: string, page: number = 1, limit: number = 8) => {
    try {
      const response = await api.get('/menu-items', {
        params: { category, page, limit },
      }) as any;
      if (response && response.data && response.data.items) {
        response.data.items = response.data.items.map((item: any) => {
          const rest = (item.restaurant || {}) as any;
          const mockRest = (MOCK_RESTAURANTS.find((r) => r.id === item.restaurantId) || {}) as any;
          return {
            ...item,
            imageUrl: item.image || item.imageUrl,
            restaurantName: rest.name || item.restaurantName || mockRest.name || 'Quán ăn',
            restaurantRating: rest.ratingAvg !== undefined ? Number(rest.ratingAvg) : (mockRest.rating || 0),
            restaurantDeliveryFee: rest.deliveryFee !== undefined ? Number(rest.deliveryFee) : (mockRest.deliveryFee || 0),
            restaurantIsOpen: rest.status !== undefined ? (rest.status === 'open' && isWithinOperatingHours(rest.operatingHours)) : (mockRest.isOpen || false),
            restaurantStatus: rest.status || mockRest.status || (mockRest.isOpen ? 'open' : 'closed'),
          };
        });
      }
      return response.data;
    } catch (error) {
      console.warn('Backend API /menu-items failed. Falling back to local MOCK_MENU_ITEMS.', error);
      
      // Fallback local logic
      const filtered = MOCK_MENU_ITEMS.filter(
        (item) => category === 'all' || item.category === category
      );
      const offset = (page - 1) * limit;
      const paginated = filtered.slice(offset, offset + limit);
      const hasMore = offset + paginated.length < filtered.length;

      const mapped = paginated.map((item) => {
        const mockRest = (MOCK_RESTAURANTS.find((r) => r.id === item.restaurantId) || {}) as any;
        return {
          ...item,
          restaurantRating: mockRest.rating || 0,
          restaurantDeliveryFee: mockRest.deliveryFee || 0,
          restaurantIsOpen: mockRest.isOpen || false,
        };
      });

      return {
        items: mapped,
        total: filtered.length,
        page,
        limit,
        hasMore,
      };
    }
  },

  /**
   * Lấy Top 10 sản phẩm bán chạy nhất và xem nhiều nhất
   */
  getTopItems: async (limit: number = 10) => {
    try {
      const response = await api.get('/menu-items/top', {
        params: { limit },
      }) as any;
      if (response && response.data) {
        if (response.data.bestSellers) {
          response.data.bestSellers = response.data.bestSellers.map((item: any) => {
            const rest = (item.restaurant || {}) as any;
            const mockRest = (MOCK_RESTAURANTS.find((r) => r.id === item.restaurantId) || {}) as any;
            return {
              ...item,
              imageUrl: item.image || item.imageUrl,
              restaurantName: rest.name || item.restaurantName || mockRest.name || 'Quán ăn',
              restaurantRating: rest.ratingAvg !== undefined ? Number(rest.ratingAvg) : (mockRest.rating || 0),
              restaurantDeliveryFee: rest.deliveryFee !== undefined ? Number(rest.deliveryFee) : (mockRest.deliveryFee || 0),
              restaurantIsOpen: rest.status !== undefined ? (rest.status === 'open' && isWithinOperatingHours(rest.operatingHours)) : (mockRest.isOpen || false),
              restaurantStatus: rest.status || mockRest.status || (mockRest.isOpen ? 'open' : 'closed'),
            };
          });
        }
        if (response.data.mostViewed) {
          response.data.mostViewed = response.data.mostViewed.map((item: any) => {
            const rest = (item.restaurant || {}) as any;
            const mockRest = (MOCK_RESTAURANTS.find((r) => r.id === item.restaurantId) || {}) as any;
            return {
              ...item,
              imageUrl: item.image || item.imageUrl,
              restaurantName: rest.name || item.restaurantName || mockRest.name || 'Quán ăn',
              restaurantRating: rest.ratingAvg !== undefined ? Number(rest.ratingAvg) : (mockRest.rating || 0),
              restaurantDeliveryFee: rest.deliveryFee !== undefined ? Number(rest.deliveryFee) : (mockRest.deliveryFee || 0),
              restaurantIsOpen: rest.status !== undefined ? (rest.status === 'open' && isWithinOperatingHours(rest.operatingHours)) : (mockRest.isOpen || false),
              restaurantStatus: rest.status || mockRest.status || (mockRest.isOpen ? 'open' : 'closed'),
            };
          });
        }
      }
      return response.data;
    } catch (error) {
      console.warn('Backend API /menu-items/top failed. Falling back to local MOCK_MENU_ITEMS.', error);
      
      // Fallback local logic
      const bestSellers = [...MOCK_MENU_ITEMS]
        .sort((a, b) => b.soldCount - a.soldCount)
        .slice(0, limit)
        .map((item) => {
          const mockRest = (MOCK_RESTAURANTS.find((r) => r.id === item.restaurantId) || {}) as any;
          return {
            ...item,
            restaurantRating: mockRest.rating || 0,
            restaurantDeliveryFee: mockRest.deliveryFee || 0,
            restaurantIsOpen: mockRest.isOpen || false,
          };
        });
      const mostViewed = [...MOCK_MENU_ITEMS]
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, limit)
        .map((item) => {
          const mockRest = (MOCK_RESTAURANTS.find((r) => r.id === item.restaurantId) || {}) as any;
          return {
            ...item,
            restaurantRating: mockRest.rating || 0,
            restaurantDeliveryFee: mockRest.deliveryFee || 0,
            restaurantIsOpen: mockRest.isOpen || false,
          };
        });

      return {
        bestSellers,
        mostViewed,
      };
    }
  },

  /**
   * Tăng lượt xem sản phẩm
   */
  incrementView: async (id: string) => {
    try {
      const response = await api.post(`/menu-items/${id}/view`) as any;
      return response.data;
    } catch (error) {
      console.warn(`Backend API /menu-items/${id}/view failed. Updating local mock.`, error);
      
      // Update local mock
      const item = MOCK_MENU_ITEMS.find((m) => m.id === id);
      if (item) {
        item.viewCount = (item.viewCount || 0) + 1;
      }
      return item;
    }
  },

  /**
   * Lấy thống kê số người mua và số lượt bình luận của món ăn
   */
  getItemStats: async (id: string) => {
    try {
      const response = await api.get(`/menu-items/${id}/stats`) as any;
      return response.data;
    } catch (error) {
      console.warn(`Backend API /menu-items/${id}/stats failed. Falling back.`, error);
      return { buyerCount: 0, reviewCount: 0 };
    }
  },

  /**
   * Lấy chi tiết món ăn theo ID
   */
  getMenuItemDetail: async (id: string) => {
    try {
      const response = await api.get(`/menu-items/${id}`) as any;
      return response;
    } catch (error) {
      console.warn(`Backend API /menu-items/${id} failed.`, error);
      return null;
    }
  },
};

export default menuItemApi;
