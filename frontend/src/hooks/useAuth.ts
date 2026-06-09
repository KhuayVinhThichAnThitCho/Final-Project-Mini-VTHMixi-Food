import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../services/authApi';

export const useAuth = () => {
  const { setUser, setTokens, clearAuth, user, isAuthenticated } = useAuthStore();

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
  };
};

export default useAuth;
