import { Order, OrderStatus } from '../models/Order';
import { Restaurant } from '../models/Restaurant';
import { User } from '../models/User';

export const orderRepository = {
  /**
   * Tìm đơn hàng bằng ID
   */
  findById: async (id: string): Promise<Order | null> => {
    return await Order.findByPk(id, {
      include: [
        Restaurant,
        { model: User, as: 'shipper', attributes: ['id', 'name', 'phone', 'avatar'] }
      ]
    });
  },

  /**
   * Lấy danh sách đơn hàng của người dùng (User)
   */
  findByUserId: async (userId: string): Promise<Order[]> => {
    return await Order.findAll({
      where: { userId },
      include: [
        Restaurant,
        { model: User, as: 'shipper', attributes: ['id', 'name', 'phone', 'avatar'] }
      ],
      order: [['createdAt', 'DESC']],
    });
  },

  /**
   * Lấy danh sách đơn hàng của nhà hàng (Vendor)
   */
  findByRestaurantId: async (restaurantId: string): Promise<Order[]> => {
    return await Order.findAll({ where: { restaurantId } });
  },

  /**
   * Tạo mới đơn hàng
   */
  create: async (orderData: any): Promise<Order> => {
    return await Order.create({
      ...orderData,
      status: 'pending',
    });
  },

  /**
   * Cập nhật trạng thái đơn hàng
   */
  updateStatus: async (id: string, status: OrderStatus): Promise<Order | null> => {
    const order = await Order.findByPk(id);
    if (!order) return null;
    order.status = status;
    await order.save();
    return order;
  },
};
export default orderRepository;
