import api from './api';

export const authApi = {
  /**
   * API Đăng nhập
   */
  login: async (credentials: { email: string; passwordString?: string }) => {
    // Lưu ý body gửi lên đúng định dạng backend nhận
    return api.post('/auth/login', credentials) as any;
  },

  /**
   * API Đăng ký tài khoản
   */
  register: async (userData: { name: string; email: string; passwordString?: string; role?: string }) => {
    return api.post('/auth/register', userData) as any;
  },
};

export default authApi;
