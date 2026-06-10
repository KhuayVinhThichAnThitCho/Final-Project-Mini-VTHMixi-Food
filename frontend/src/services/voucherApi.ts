import api from './api';

export const voucherApi = {
  /**
   * Lấy danh sách các voucher đang hoạt động
   */
  getVouchers: async () => {
    return api.get('/vouchers') as any;
  },
};

export default voucherApi;
