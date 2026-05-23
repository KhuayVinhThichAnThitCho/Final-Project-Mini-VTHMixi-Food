import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../services/authApi';

export const useAuth = () => {
  const { setUser, setTokens, clearAuth, user, isAuthenticated } = useAuthStore();

  // Đăng ký tài khoản
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setUser(data.user);
      setTokens(data.accessToken, data.refreshToken);
    },
  });

  // Đăng nhập tài khoản
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setUser(data.user);
      setTokens(data.accessToken, data.refreshToken);
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
    logout,
  };
};

export default useAuth;
