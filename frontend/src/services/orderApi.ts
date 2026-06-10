import api from './api';

export const orderApi = {
  /**
   * Tạo đơn hàng mới
   */
  createOrder: async (orderData: {
    restaurantId: string;
    items: { menuItemId: string; name: string; quantity: number; price: number }[];
    deliveryAddress: string;
    paymentMethod: 'COD' | 'WALLET' | 'POINTS';
    voucherCode?: string;
  }) => {
    return api.post('/orders', orderData) as any;
  },

  /**
   * Lấy danh sách đơn hàng cá nhân
   */
  getMyOrders: async () => {
    return api.get('/orders/mine') as any;
  },

  /**
   * Cập nhật trạng thái đơn hàng (Dành cho Vendor/Admin)
   */
  updateOrderStatus: async (orderId: string, status: string) => {
    return api.patch(`/orders/${orderId}/status`, { status }) as any;
  },
};

export default orderApi;
