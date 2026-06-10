import api from './api';

export const authApi = {
  /**
   * API Đăng nhập
   */
  login: async (credentials: { email: string; passwordString?: string }) => {
    return api.post('/auth/login', {
      email: credentials.email,
      password: credentials.passwordString,
    }) as any;
  },

  /**
   * API Đăng ký tài khoản
   */
  register: async (userData: { name: string; email: string; passwordString?: string; role?: string }) => {
    return api.post('/auth/register', {
      name: userData.name,
      email: userData.email,
      password: userData.passwordString,
      role: userData.role,
    }) as any;
  },

  /**
   * API Yêu cầu OTP quên mật khẩu
   */
  forgotPassword: async (email: string) => {
    return api.post('/auth/forgot-password', { email }) as any;
  },

  /**
   * API Xác nhận đặt lại mật khẩu mới
   */
  resetPassword: async (resetData: { email: string; otp: string; newPassword?: string }) => {
    return api.post('/auth/reset-password', {
      email: resetData.email,
      otp: resetData.otp,
      newPassword: resetData.newPassword,
    }) as any;
  },

  /**
   * API Xác nhận OTP đăng nhập
   */
  verifyOtp: async (data: { email: string; otp: string }) => {
    return api.post('/auth/verify-otp', data) as any;
  },

  /**
   * API Gửi lại mã OTP
   */
  resendOtp: async (email: string) => {
    return api.post('/auth/resend-otp', { email }) as any;
  },

  /**
   * Lấy thông tin tài khoản người dùng đăng nhập hiện tại
   */
  getMe: async () => {
    return api.get('/auth/me') as any;
  },

  /**
   * Cập nhật thông tin hồ sơ cá nhân (tên, sđt, avatar)
   */
  updateProfile: async (data: { name?: string; phone?: string; avatar?: string }) => {
    return api.put('/auth/profile', data) as any;
  },

  /**
   * Đổi mật khẩu khi đã đăng nhập
   */
  changePassword: async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    return api.put('/auth/change-password', data) as any;
  },
};

export default authApi;
