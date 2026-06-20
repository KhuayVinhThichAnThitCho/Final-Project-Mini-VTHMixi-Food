import api from './api';

// Danh sách voucher giả lập phòng trường hợp backend lỗi hoặc chưa kết nối
const MOCK_VOUCHERS = [
  {
    id: 'v-1',
    code: 'SAIGON90S',
    discountType: 'fixed_amount',
    discountValue: 15000,
    minOrderAmount: 40000,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    isActive: true,
    restaurantId: null,
    restaurant: null,
  },
  {
    id: 'v-2',
    code: 'FREESHIP',
    discountType: 'percentage',
    discountValue: 100,
    maxDiscountAmount: 15000,
    minOrderAmount: 50000,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(),
    isActive: true,
    restaurantId: null,
    restaurant: null,
  },
  {
    id: 'v-3',
    code: 'ANRATNGON',
    discountType: 'fixed_amount',
    discountValue: 20000,
    minOrderAmount: 80000,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
    isActive: true,
    restaurantId: null,
    restaurant: null,
  },
  {
    id: 'v-4',
    code: 'HUTIEU10',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscountAmount: 10000,
    minOrderAmount: 30000,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 45 * 24 * 3600 * 1000).toISOString(),
    isActive: true,
    restaurantId: 'rest-1',
    restaurant: { name: 'Hủ Tiếu Gõ Chợ Bàn Cờ', logo: null }
  },
  {
    id: 'v-5',
    code: 'COMTAM15',
    discountType: 'fixed_amount',
    discountValue: 15000,
    minOrderAmount: 50000,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    isActive: true,
    restaurantId: 'rest-2',
    restaurant: { name: 'Cơm Tấm Bãi Rác Quận 4', logo: null }
  },
  {
    id: 'v-6',
    code: 'BANHMI5K',
    discountType: 'fixed_amount',
    discountValue: 5000,
    minOrderAmount: 20000,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    isActive: true,
    restaurantId: 'rest-5',
    restaurant: { name: 'Bánh Mì Huỳnh Hoa Sài Gòn', logo: null }
  }
];

// Lấy danh sách ví voucher mock từ localStorage nếu có
const getLocalCollectedVouchers = () => {
  const data = localStorage.getItem('user_collected_vouchers');
  if (data) return JSON.parse(data);
  // Mặc định cho sẵn 2 voucher đã thu thập để trải nghiệm
  const defaultCollected = [
    {
      id: 'uv-1',
      userId: 'user-id',
      voucherId: 'v-1',
      isUsed: false,
      voucher: MOCK_VOUCHERS[0]
    },
    {
      id: 'uv-2',
      userId: 'user-id',
      voucherId: 'v-2',
      isUsed: false,
      voucher: MOCK_VOUCHERS[1]
    }
  ];
  localStorage.setItem('user_collected_vouchers', JSON.stringify(defaultCollected));
  return defaultCollected;
};

export const voucherApi = {
  /**
   * Lấy danh sách các voucher đang hoạt động công khai
   */
  getVouchers: async (): Promise<any> => {
    try {
      return await api.get('/vouchers') as any;
    } catch (err) {
      console.warn('Fallback to Mock Vouchers');
      return { success: true, data: MOCK_VOUCHERS } as any;
    }
  },

  /**
   * Khách hàng thu thập voucher
   */
  collectVoucher: async (voucherId: string): Promise<any> => {
    try {
      return await api.post(`/vouchers/${voucherId}/collect`) as any;
    } catch (err) {
      console.warn('Fallback: Collect voucher locally');
      const collected = getLocalCollectedVouchers();
      const exist = collected.find((item: any) => item.voucherId === voucherId);
      if (exist) {
        throw new Error('Bạn đã thu thập mã giảm giá này rồi.');
      }
      const targetVoucher = MOCK_VOUCHERS.find(v => v.id === voucherId);
      const newCollect = {
        id: `uv-${Date.now()}`,
        userId: 'user-id',
        voucherId,
        isUsed: false,
        voucher: targetVoucher || {
          id: voucherId,
          code: 'CUSTOM',
          discountType: 'fixed_amount',
          discountValue: 10000,
          minOrderAmount: 20000,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
          isActive: true,
          restaurantId: null,
          restaurant: null
        }
      };
      collected.push(newCollect);
      localStorage.setItem('user_collected_vouchers', JSON.stringify(collected));
      return { success: true, message: 'Thu thập mã giảm giá thành công.', data: newCollect } as any;
    }
  },

  /**
   * Lấy ví voucher của khách hàng
   */
  getMyCollectedVouchers: async (): Promise<any> => {
    try {
      return await api.get('/vouchers/my') as any;
    } catch (err) {
      console.warn('Fallback to Local Collected Vouchers');
      return { success: true, data: getLocalCollectedVouchers() } as any;
    }
  },

  /**
   * Lấy danh sách voucher do vendor/admin tự tạo
   */
  getMyVouchers: async (): Promise<any> => {
    try {
      return await api.get('/vouchers/mine') as any;
    } catch (err) {
      console.warn('Fallback to Mock Own Vouchers');
      return { success: true, data: MOCK_VOUCHERS } as any;
    }
  },

  /**
   * Tạo voucher mới (Vendor / Admin)
   */
  createVoucher: async (data: {
    code: string;
    discountType: 'percentage' | 'fixed_amount';
    discountValue: number;
    maxDiscountAmount?: number;
    minOrderAmount?: number;
    startDate: string;
    endDate: string;
    restaurantId?: string;
  }): Promise<any> => {
    try {
      return await api.post('/vouchers/mine', data) as any;
    } catch (err) {
      console.warn('Fallback: Create voucher locally');
      const newVoucher = {
        id: `v-${Date.now()}`,
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxDiscountAmount: data.maxDiscountAmount,
        minOrderAmount: data.minOrderAmount || 0,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: true,
        restaurantId: data.restaurantId || null,
        restaurant: data.restaurantId ? { name: 'Quán của bạn', logo: null } : null,
      };
      MOCK_VOUCHERS.unshift(newVoucher as any);
      return { success: true, message: 'Tạo mã giảm giá thành công.', data: newVoucher } as any;
    }
  },

  /**
   * Xóa/vô hiệu hóa mã giảm giá (Vendor / Admin)
   */
  deleteVoucher: async (id: string): Promise<any> => {
    try {
      return await api.delete(`/vouchers/mine/${id}`) as any;
    } catch (err) {
      console.warn('Fallback: Delete voucher locally');
      const idx = MOCK_VOUCHERS.findIndex(v => v.id === id);
      if (idx !== -1) {
        MOCK_VOUCHERS[idx].isActive = false;
      }
      return { success: true, message: 'Vô hiệu hóa mã giảm giá thành công.' } as any;
    }
  }
};

export default voucherApi;
