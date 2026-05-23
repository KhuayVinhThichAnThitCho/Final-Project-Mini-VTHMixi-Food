import { useCartStore, CartItem } from '../store/useCartStore';

export const useCart = () => {
  const { items, restaurantId, addToCart, removeFromCart, updateQuantity, clearCart } = useCartStore();

  // Tính tổng số lượng vật phẩm trong giỏ
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Tính tổng tiền của giỏ hàng (chưa bao gồm phí vận chuyển)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    items,
    restaurantId,
    totalItems,
    totalPrice,
    addToCart: (item: Omit<CartItem, 'quantity'>, rId: string) => addToCart(item, rId),
    removeFromCart,
    updateQuantity,
    clearCart,
  };
};

export default useCart;
