import { useCartStore, CartItem } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import cartApi from '../services/cartApi';

export const useCart = () => {
  const { 
    items, 
    restaurantId, 
    addToCart: _addToCart, 
    removeFromCart: _removeFromCart, 
    updateQuantity: _updateQuantity, 
    toggleSelectItem,
    setSelectedItems,
    clearCart: _clearCart,
    clearSelected: _clearSelected
  } = useCartStore();
  const { isAuthenticated, setShowAuthModal } = useAuthStore();

  // Danh sách các món ăn đã được tích chọn thanh toán
  const selectedItems = items.filter((item) => item.selected !== false);

  // Tính tổng số lượng vật phẩm ĐÃ CHỌN thanh toán
  const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  // Tính tổng số lượng của TẤT CẢ vật phẩm có trong giỏ (dùng cho icon Header)
  const allCartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Tính tổng tiền của các món ĐÃ CHỌN thanh toán (chưa bao gồm phí vận chuyển)
  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  /**
   * Thêm món vào giỏ hàng — yêu cầu đăng nhập.
   * Nếu chưa đăng nhập, mở modal thông báo yêu cầu đăng nhập.
   * @returns true nếu thêm thành công, false nếu bị chặn
   */
  const addToCart = (item: Omit<CartItem, 'quantity' | 'selected'>, rId: string, quantity = 1): boolean => {
    if (!isAuthenticated) {
      setShowAuthModal(true, window.location.pathname);
      return false;
    }
    _addToCart(item, rId, quantity);
    // Sync to backend
    cartApi.addToCart(item.id, quantity).catch((err) => console.error('Lỗi khi lưu giỏ hàng lên database:', err));
    return true;
  };

  /**
   * Cập nhật số lượng của món ăn trong giỏ
   */
  const updateQuantity = (itemId: string, quantity: number) => {
    _updateQuantity(itemId, quantity);
    if (isAuthenticated) {
      cartApi.updateQuantity(itemId, quantity).catch((err) => console.error('Lỗi khi cập nhật số lượng lên database:', err));
    }
  };

  /**
   * Xóa hẳn món ăn khỏi giỏ hàng
   */
  const removeFromCart = (itemId: string) => {
    _removeFromCart(itemId);
    if (isAuthenticated) {
      cartApi.removeFromCart(itemId).catch((err) => console.error('Lỗi khi xóa món ăn khỏi database:', err));
    }
  };

  /**
   * Dọn sạch giỏ hàng
   */
  const clearCart = () => {
    _clearCart();
    if (isAuthenticated) {
      cartApi.clearCart().catch((err) => console.error('Lỗi khi dọn sạch giỏ hàng trên database:', err));
    }
  };

  /**
   * Xóa những món ăn đã tích chọn thanh toán khỏi giỏ hàng
   */
  const clearSelected = async () => {
    const selectedIds = selectedItems.map((item) => item.id);
    _clearSelected();
    if (isAuthenticated && selectedIds.length > 0) {
      if (selectedIds.length === items.length) {
        await cartApi.clearCart().catch((err) => console.error('Lỗi dọn sạch database:', err));
      } else {
        // Xóa lần lượt các item được chọn
        for (const id of selectedIds) {
          await cartApi.removeFromCart(id).catch((err) => console.error('Lỗi xóa item trên database:', err));
        }
      }
    }
  };

  return {
    items,
    selectedItems,
    restaurantId,
    totalItems,
    allCartItemsCount,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleSelectItem,
    setSelectedItems,
    clearCart,
    clearSelected,
  };
};

export default useCart;
