import api from './api';
import { MOCK_MENU_ITEMS, MOCK_RESTAURANTS } from '../utils/mockData';

export interface SearchSuggestion {
  id: string;
  label: string;
  type: 'menu' | 'restaurant';
  category?: string;
  address?: string;
}

export interface SearchResult {
  menuItems: any[];
  restaurants: any[];
}

export const searchApi = {
  /**
   * Tìm kiếm tổng hợp: món ăn + nhà hàng
   */
  search: async (query: string, type: 'all' | 'menu' | 'restaurant' = 'all'): Promise<SearchResult> => {
    if (!query.trim()) return { menuItems: [], restaurants: [] };
    try {
      const response = await api.get('/search', { params: { q: query, type } }) as any;
      return response.data;
    } catch (error) {
      console.warn('Backend /search failed. Falling back to mock.', error);
      const q = query.toLowerCase();

      const menuItems =
        type === 'restaurant'
          ? []
          : MOCK_MENU_ITEMS.filter(
              (item) =>
                item.name.toLowerCase().includes(q) ||
                (item.description && item.description.toLowerCase().includes(q)) ||
                item.restaurantName.toLowerCase().includes(q)
            ).slice(0, 12);

      const restaurants =
        type === 'menu'
          ? []
          : MOCK_RESTAURANTS.filter(
              (r) =>
                r.name.toLowerCase().includes(q) ||
                r.address.toLowerCase().includes(q)
            ).slice(0, 8);

      return { menuItems, restaurants };
    }
  },

  /**
   * Lấy gợi ý autocomplete theo query
   */
  getSuggestions: async (query: string): Promise<SearchSuggestion[]> => {
    if (!query.trim() || query.length < 1) return [];
    try {
      const response = await api.get('/search/suggestions', { params: { q: query } }) as any;
      return response.data || [];
    } catch (error) {
      console.warn('Backend /search/suggestions failed. Falling back to mock.', error);
      const q = query.toLowerCase();

      const menuSuggestions: SearchSuggestion[] = MOCK_MENU_ITEMS
        .filter((item) => item.name.toLowerCase().includes(q))
        .slice(0, 5)
        .map((item) => ({ id: item.id, label: item.name, type: 'menu', category: item.category }));

      const restSuggestions: SearchSuggestion[] = MOCK_RESTAURANTS
        .filter((r) => r.name.toLowerCase().includes(q))
        .slice(0, 3)
        .map((r) => ({ id: r.id, label: r.name, type: 'restaurant', address: r.address }));

      return [...menuSuggestions, ...restSuggestions];
    }
  },
};

export default searchApi;
