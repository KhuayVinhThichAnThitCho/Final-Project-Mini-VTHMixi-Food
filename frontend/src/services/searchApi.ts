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
      const qLower = query.toLowerCase().trim();
      const keywords = qLower.split(/\s+/).filter(kw => kw.length > 0);

      let menuItems: any[] = [];
      if (type !== 'restaurant') {
        menuItems = MOCK_MENU_ITEMS.filter(item => {
          const name = item.name.toLowerCase();
          const desc = (item.description || '').toLowerCase();
          const restName = (item.restaurantName || '').toLowerCase();
          
          const matchesFull = name.includes(qLower) || desc.includes(qLower) || restName.includes(qLower);
          const matchesAllKeywords = keywords.every(kw => name.includes(kw) || desc.includes(kw) || restName.includes(kw));
          
          return matchesFull || matchesAllKeywords;
        });

        // Re-ranking
        menuItems.sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();

          const aExact = aName === qLower;
          const bExact = bName === qLower;
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;

          const aStarts = aName.startsWith(qLower);
          const bStarts = bName.startsWith(qLower);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;

          let aMatchCount = 0;
          let bMatchCount = 0;
          keywords.forEach(kw => {
            if (aName.includes(kw)) aMatchCount++;
            if (bName.includes(kw)) bMatchCount++;
          });

          if (aMatchCount !== bMatchCount) {
            return bMatchCount - aMatchCount;
          }
          return 0;
        });

        menuItems = menuItems.slice(0, 12);
      }

      let restaurants: any[] = [];
      if (type !== 'menu') {
        restaurants = MOCK_RESTAURANTS.filter(r => {
          const name = r.name.toLowerCase();
          const addr = r.address.toLowerCase();

          const matchesFull = name.includes(qLower) || addr.includes(qLower);
          const matchesAllKeywords = keywords.every(kw => name.includes(kw) || addr.includes(kw));

          return matchesFull || matchesAllKeywords;
        });

        restaurants.sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();

          const aExact = aName === qLower;
          const bExact = bName === qLower;
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;

          let aMatchCount = 0;
          let bMatchCount = 0;
          keywords.forEach(kw => {
            if (aName.includes(kw)) aMatchCount++;
            if (bName.includes(kw)) bMatchCount++;
          });

          if (aMatchCount !== bMatchCount) {
            return bMatchCount - aMatchCount;
          }
          return 0;
        });

        restaurants = restaurants.slice(0, 8);
      }

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
