import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../services/authApi';
import { useCartStore } from '../store/useCartStore';
import cartApi from '../services/cartApi';

export const useAuth = () => {
  const { setUser, setTokens, clearAuth, user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Tự động tải thông tin cá nhân và điểm tích lũy khi đã đăng nhập nhưng thiếu thông tin user (ví dụ sau F5)
  const { data: profileData, refetch: refetchMe } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getMe,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isAuthenticated && profileData && profileData.success && profileData.data) {
      // Chỉ cập nhật nếu dữ liệu có sự thay đổi để tránh re-render liên tục
      if (JSON.stringify(profileData.data) !== JSON.stringify(user)) {
        setUser(profileData.data);
      }
    }
  }, [profileData, setUser, user, isAuthenticated]);

  // Đồng bộ giỏ hàng từ database khi user đăng nhập thành công
  useEffect(() => {
    const isCartLoaded = useCartStore.getState().isCartLoaded;
    if (isAuthenticated && !isCartLoaded) {
      cartApi.getCart()
        .then((res) => {
          if (res && res.success && res.data) {
            const cartData = res.data;
            const mappedItems = (cartData.items || []).map((item: any) => ({
              id: item.menuItemId,
              name: item.menuItem?.name || 'Món ăn',
              price: Number(item.menuItem?.price || 0),
              quantity: item.quantity,
              imageUrl: item.menuItem?.image || item.menuItem?.imageUrl,
              toppings: [],
              selected: true, // Mặc định tích chọn thanh toán
              restaurantId: item.menuItem?.restaurantId || cartData.restaurantId || '',
              restaurantName: item.menuItem?.restaurant?.name || 'Quán ăn',
            }));
            useCartStore.getState().setCartItems(mappedItems, cartData.restaurantId);
          }
        })
        .catch((err) => {
          console.error('Lỗi khi tải giỏ hàng từ database:', err);
        });
    }
  }, [isAuthenticated]);

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
    queryClient.removeQueries();
    useCartStore.getState().clearCart(); // Dọn sạch giỏ hàng khi đăng xuất
    navigate('/login');
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
