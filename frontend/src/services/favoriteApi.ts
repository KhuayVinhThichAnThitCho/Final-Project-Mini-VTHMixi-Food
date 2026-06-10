import api from './api';

export const favoriteApi = {
  /**
   * Toggle yêu thích một món ăn (thêm/xóa)
   */
  toggleFavorite: async (menuItemId: string) => {
    return api.post('/favorites/toggle', { menuItemId }) as any;
  },

  /**
   * Lấy danh sách món ăn yêu thích của user hiện tại
   */
  getFavorites: async () => {
    return api.get('/favorites') as any;
  },
};

export default favoriteApi;
