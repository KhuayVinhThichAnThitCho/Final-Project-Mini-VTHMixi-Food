import { IOrder, OrderStatus } from '../models/Order';

let ordersMock: IOrder[] = [];

export const orderRepository = {
  /**
   * Tìm đơn hàng bằng ID
   */
  findById: async (id: string): Promise<IOrder | null> => {
    const order = ordersMock.find((o) => o.id === id);
    return order || null;
  },

  /**
   * Lấy danh sách đơn hàng của người dùng (User)
   */
  findByUserId: async (userId: string): Promise<IOrder[]> => {
    return ordersMock.filter((o) => o.userId === userId);
  },

  /**
   * Lấy danh sách đơn hàng của nhà hàng (Vendor)
   */
  findByRestaurantId: async (restaurantId: string): Promise<IOrder[]> => {
    return ordersMock.filter((o) => o.restaurantId === restaurantId);
  },

  /**
   * Tạo mới đơn hàng
   */
  create: async (orderData: Omit<IOrder, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'isPaid'>): Promise<IOrder> => {
    const newOrder: IOrder = {
      ...orderData,
      id: `ORDER-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: 'PENDING',
      isPaid: orderData.paymentMethod === 'WALLET' ? true : false, // Thanh toán ví thì mặc định đã trả
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    ordersMock.push(newOrder);
    return newOrder;
  },

  /**
   * Cập nhật trạng thái đơn hàng
   */
  updateStatus: async (id: string, status: OrderStatus): Promise<IOrder | null> => {
    const index = ordersMock.findIndex((o) => o.id === id);
    if (index === -1) return null;

    ordersMock[index].status = status;
    ordersMock[index].updatedAt = new Date();
    return ordersMock[index];
  },
};
