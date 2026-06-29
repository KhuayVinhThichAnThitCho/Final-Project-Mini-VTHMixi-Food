import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  toppings?: string[];
  selected?: boolean; // Mặc định là true khi thêm mới
  restaurantId: string;
  restaurantName?: string;
}

interface CartStore {
  items: CartItem[];
  restaurantId: string | null;
  isCartLoaded: boolean;
  setCartItems: (items: CartItem[], restaurantId: string | null) => void;
  addToCart: (
    item: Omit<CartItem, 'quantity' | 'selected' | 'restaurantId'> & { restaurantName?: string }, 
    restaurantId: string, 
    quantity?: number
  ) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  toggleSelectItem: (itemId: string) => void;
  setSelectedItems: (itemIds: string[], selected: boolean) => void;
  clearCart: () => void;
  clearSelected: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  restaurantId: null,
  isCartLoaded: false,

  setCartItems: (items, restaurantId) => set({ items, restaurantId, isCartLoaded: true }),

  addToCart: (item, restaurantId, quantity = 1) => set((state) => {
    const existingIndex = state.items.findIndex((i) => i.id === item.id);
    
    if (existingIndex > -1) {
      const updatedItems = [...state.items];
      updatedItems[existingIndex].quantity += quantity;
      updatedItems[existingIndex].selected = true; // Tự động chọn lại nếu thêm tiếp
      return { items: updatedItems, restaurantId };
    } else {
      const newItem: CartItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        toppings: item.toppings,
        quantity,
        selected: true,
        restaurantId,
        restaurantName: item.restaurantName || 'Quán ăn',
      };
      return { items: [...state.items, newItem], restaurantId };
    }
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

  toggleSelectItem: (itemId) => set((state) => {
    const updatedItems = state.items.map((item) =>
      item.id === itemId ? { ...item, selected: item.selected === false ? true : false } : item
    );
    return { items: updatedItems };
  }),

  setSelectedItems: (itemIds, selected) => set((state) => {
    const updatedItems = state.items.map((item) =>
      itemIds.includes(item.id) ? { ...item, selected } : item
    );
    return { items: updatedItems };
  }),

  clearCart: () => set({ items: [], restaurantId: null, isCartLoaded: false }),

  clearSelected: () => set((state) => {
    const updatedItems = state.items.filter((item) => item.selected === false);
    return {
      items: updatedItems,
      restaurantId: updatedItems.length === 0 ? null : state.restaurantId,
    };
  }),
}));

export default useCartStore;
