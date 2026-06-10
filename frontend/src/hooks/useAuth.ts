import { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../services/authApi';

export const useAuth = () => {
  const { setUser, setTokens, clearAuth, user, isAuthenticated } = useAuthStore();

  // Tự động tải thông tin cá nhân và điểm tích lũy khi đã đăng nhập nhưng thiếu thông tin user (ví dụ sau F5)
  const { data: profileData, refetch: refetchMe } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getMe,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (profileData && profileData.success && profileData.data) {
      // Chỉ cập nhật nếu dữ liệu có sự thay đổi để tránh re-render liên tục
      if (JSON.stringify(profileData.data) !== JSON.stringify(user)) {
        setUser(profileData.data);
      }
    }
  }, [profileData, setUser, user]);

  // Đăng ký tài khoản
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (res: any) => {
      if (!res.requiresOtp) {
        const authData = res.data;
        setUser(authData.user);
        setTokens(authData.accessToken, authData.refreshToken);
      }
    },
  });

  // Đăng nhập tài khoản
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (res: any) => {
      if (!res.requiresOtp) {
        const authData = res.data;
        setUser(authData.user);
        setTokens(authData.accessToken, authData.refreshToken);
      }
    },
  });

  // Xác thực OTP đăng nhập
  const verifyOtpMutation = useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: (res: any) => {
      const authData = res.data;
      setUser(authData.user);
      setTokens(authData.accessToken, authData.refreshToken);
    },
  });

  // Đăng xuất
  const logout = () => {
    clearAuth();
  };

  return {
    user,
    isAuthenticated,
    register: registerMutation.mutate,
    isLoadingRegister: registerMutation.isPending,
    errorRegister: registerMutation.error,
    login: loginMutation.mutate,
    isLoadingLogin: loginMutation.isPending,
    errorLogin: loginMutation.error,
    verifyOtp: verifyOtpMutation.mutate,
    isLoadingVerifyOtp: verifyOtpMutation.isPending,
    errorVerifyOtp: verifyOtpMutation.error,
    logout,
    refetchMe,
  };
};

export default useAuth;
