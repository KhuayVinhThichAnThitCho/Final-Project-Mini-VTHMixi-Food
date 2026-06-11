import api from './api';

export const cartApi = {
  /**
   * Lấy chi tiết giỏ hàng hiện tại của user từ database
   */
  getCart: async () => {
    return api.get('/carts') as any;
  },

  /**
   * Thêm món ăn vào giỏ hàng trên database
   */
  addToCart: async (menuItemId: string, quantity: number = 1) => {
    return api.post('/carts/add', { menuItemId, quantity }) as any;
  },

  /**
   * Cập nhật số lượng món ăn trong giỏ hàng trên database
   */
  updateQuantity: async (menuItemId: string, quantity: number) => {
    return api.put('/carts/update', { menuItemId, quantity }) as any;
  },

  /**
   * Xóa một món ăn khỏi giỏ hàng trên database
   */
  removeFromCart: async (menuItemId: string) => {
    return api.delete(`/carts/remove/${menuItemId}`) as any;
  },

  /**
   * Dọn sạch toàn bộ giỏ hàng trên database
   */
  clearCart: async () => {
    return api.delete('/carts/clear') as any;
  },
};

export default cartApi;
