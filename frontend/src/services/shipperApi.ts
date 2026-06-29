import api from './api';

// ===================================================
// SHIPPER API - Tất cả API dành cho shipper dashboard
// ===================================================

export const shipperApi = {
  // ---------- ORDERS ----------
  /**
   * Lấy danh sách đơn hàng sẵn sàng để nhận (status = ready, chưa có shipper)
   */
  getAvailableOrders: async () => {
    return api.get('/shipper/orders/available') as any;
  },

  /**
   * Nhận đơn hàng (race-safe)
   */
  acceptOrder: async (orderId: string) => {
    return api.post(`/shipper/orders/${orderId}/accept`) as any;
  },

  /**
   * Xác nhận lấy hàng tại quán + upload ảnh
   */
  confirmPickup: async (orderId: string, photo?: string) => {
    return api.post(`/shipper/orders/${orderId}/pickup`, { photo }) as any;
  },

  /**
   * Xác nhận giao hàng xong + upload ảnh
   */
  completeDelivery: async (orderId: string, photo?: string, deliveryCode?: string) => {
    return api.post(`/shipper/orders/${orderId}/complete`, { photo, deliveryCode }) as any;
  },

  /**
   * Lịch sử đơn đã giao
   */
  getMyDeliveries: async () => {
    return api.get('/shipper/orders/my') as any;
  },

  // ---------- ME ----------
  /**
   * Bật/Tắt trạng thái nhận đơn
   */
  toggleOnline: async (isOnline: boolean) => {
    return api.patch('/shipper/me/online', { isOnline }) as any;
  },

  /**
   * Thống kê thu nhập
   */
  getMyEarnings: async () => {
    return api.get('/shipper/me/earnings') as any;
  },

  // ---------- RATING ----------
  /**
   * Khách đánh giá shipper (gọi với role user)
   */
  rateShipper: async (orderId: string, rating: number) => {
    return api.post(`/shipper/orders/${orderId}/rate`, { rating }) as any;
  },
};

export default shipperApi;
