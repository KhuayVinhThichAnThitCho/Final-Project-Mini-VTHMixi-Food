import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartStore {
  items: CartItem[];
  restaurantId: string | null;
  addToCart: (item: Omit<CartItem, 'quantity'>, restaurantId: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  restaurantId: null,

  addToCart: (item, restaurantId) => set((state) => {
    // Nếu giỏ hàng đang trống hoặc mua cùng một nhà hàng
    if (!state.restaurantId || state.restaurantId === restaurantId) {
      const existingIndex = state.items.findIndex((i) => i.id === item.id);
      
      if (existingIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex].quantity += 1;
        return { items: updatedItems, restaurantId };
      } else {
        return { items: [...state.items, { ...item, quantity: 1 }], restaurantId };
      }
    } 
    
    // Nếu mua từ nhà hàng khác, trong thực tế sẽ hiện Popup xác nhận reset giỏ hàng.
    // Ở đây ta mặc định sẽ ghi đè giỏ hàng mới cho đơn giản.
    return {
      items: [{ ...item, quantity: 1 }],
      restaurantId,
    };
  }),

  removeFromCart: (itemId) => set((state) => {
    const updatedItems = state.items.filter((i) => i.id !== itemId);
    return {
      items: updatedItems,
      restaurantId: updatedItems.length === 0 ? null : state.restaurantId,
    };
  }),

  updateQuantity: (itemId, quantity) => set((state) => {
    if (quantity <= 0) {
      const updatedItems = state.items.filter((i) => i.id !== itemId);
      return {
        items: updatedItems,
        restaurantId: updatedItems.length === 0 ? null : state.restaurantId,
      };
    }

    const updatedItems = state.items.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );
    return { items: updatedItems };
  }),

  clearCart: () => set({ items: [], restaurantId: null }),
}));

export default useCartStore;
