import api from './api';

// ===================================================
// VENDOR API - Tất cả API dành cho vendor dashboard
// ===================================================

export const vendorApi = {
  // ---------- RESTAURANT ----------
  /**
   * Lấy thông tin quán của vendor đang đăng nhập (kèm menu)
   */
  getMyRestaurant: async () => {
    return api.get('/restaurants/mine') as any;
  },

  /**
   * Cập nhật thông tin quán
   */
  updateMyRestaurant: async (data: {
    name?: string;
    address?: string;
    deliveryFee?: number;
    minOrderValue?: number;
    status?: 'open' | 'closed' | 'pending' | 'banned';
    operatingHours?: { open: string; close: string };
    logo?: string;
  }) => {
    return api.put('/restaurants/mine', data) as any;
  },

  // ---------- MENU ITEMS ----------
  /**
   * Lấy danh sách toàn bộ món ăn trong quán (kể cả hết hàng)
   */
  getMyMenuItems: async () => {
    return api.get('/restaurants/mine/menu-items') as any;
  },

  /**
   * Thêm món ăn mới vào quán
   */
  createMenuItem: async (data: {
    name: string;
    description?: string;
    price: number;
    category?: string;
    stock?: number;
    image?: string;
  }) => {
    return api.post('/restaurants/mine/menu-items', data) as any;
  },

  /**
   * Cập nhật thông tin món ăn
   */
  updateMenuItem: async (itemId: string, data: {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    stock?: number;
    image?: string;
    isAvailable?: boolean;
  }) => {
    return api.patch(`/restaurants/mine/menu-items/${itemId}`, data) as any;
  },

  /**
   * Xóa mềm món ăn
   */
  deleteMenuItem: async (itemId: string) => {
    return api.delete(`/restaurants/mine/menu-items/${itemId}`) as any;
  },

  // ---------- ORDERS ----------
  /**
   * Lấy danh sách đơn hàng của quán
   */
  getRestaurantOrders: async () => {
    return api.get('/orders/restaurant') as any;
  },

  /**
   * Cập nhật trạng thái đơn hàng
   */
  updateOrderStatus: async (orderId: string, status: string) => {
    return api.patch(`/orders/${orderId}/status`, { status }) as any;
  },

  // ---------- VOUCHERS ----------
  /**
   * Lấy danh sách vouchers của quán (kể cả hết hạn)
   */
  getMyVouchers: async () => {
    return api.get('/vouchers/mine') as any;
  },

  /**
   * Tạo mã giảm giá mới
   */
  createVoucher: async (data: {
    code: string;
    discountType: 'percentage' | 'fixed_amount';
    discountValue: number;
    maxDiscountAmount?: number;
    minOrderAmount?: number;
    startDate: string;
    endDate: string;
  }) => {
    return api.post('/vouchers/mine', data) as any;
  },

  /**
   * Vô hiệu hóa mã giảm giá
   */
  deleteVoucher: async (id: string) => {
    return api.delete(`/vouchers/mine/${id}`) as any;
  },

  // ---------- REVIEWS ----------
  /**
   * Lấy đánh giá của quán (dùng restaurantId)
   */
  getMyReviews: async (restaurantId: string) => {
    return api.get(`/reviews/restaurant/${restaurantId}`) as any;
  },

  /**
   * Phản hồi đánh giá của khách hàng
   */
  replyToReview: async (reviewId: string, reply: string) => {
    return api.post(`/reviews/${reviewId}/reply`, { reply }) as any;
  },

  // ---------- STATS ----------
  /**
   * Lấy thống kê tổng quan của quán
   */
  getVendorStats: async (restaurantId: string) => {
    return api.get('/stats/vendor', { params: { restaurantId } }) as any;
  },

  // ---------- WALLET ----------
  /**
   * Lấy số dư ví
   */
  getWalletBalance: async () => {
    return api.get('/wallet/balance') as any;
  },

  /**
   * Nạp tiền vào ví
   */
  depositWallet: async (amount: number) => {
    return api.post('/wallet/deposit', { amount }) as any;
  },
};

export default vendorApi;
