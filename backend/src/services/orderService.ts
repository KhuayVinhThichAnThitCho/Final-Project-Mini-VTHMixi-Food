import { orderRepository } from '../repositories/orderRepository';
import { walletService } from './walletService';
import { IOrder, OrderStatus, PaymentMethod } from '../models/Order';
import { AppError } from '../middlewares/errorHandler';

export const orderService = {
  /**
   * Khởi tạo đơn hàng mới
   */
  createOrder: async (
    userId: string,
    restaurantId: string,
    items: { menuItemId: string; name: string; quantity: number; price: number }[],
    deliveryAddress: string,
    paymentMethod: PaymentMethod
  ): Promise<IOrder> => {
    if (items.length === 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Đơn hàng phải chứa ít nhất một món ăn.');
    }

    // Tính tổng số tiền của đơn hàng
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Nếu chọn thanh toán qua ví điện tử
    if (paymentMethod === 'WALLET') {
      // Thực hiện trừ tiền ví của người dùng
      await walletService.payWithWallet(userId, totalPrice, `Thanh toán đơn hàng tại nhà hàng ${restaurantId}`);
    }

    // Tạo đơn hàng
    const order = await orderRepository.create({
      userId,
      restaurantId,
      items,
      totalPrice,
      deliveryAddress,
      paymentMethod,
    });

    return order;
  },

  /**
   * Cập nhật trạng thái đơn hàng (Dành cho Vendor, Manager hoặc Admin)
   */
  updateOrderStatus: async (orderId: string, userId: string, newStatus: OrderStatus): Promise<IOrder> => {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy đơn hàng yêu cầu.');
    }

    // Trong thực tế cần phân quyền: chỉ có Vendor chủ cửa hàng đó hoặc Admin mới được cập nhật
    // if (order.restaurantOwnerId !== userId) { throw new AppError(403, 'FORBIDDEN', 'Bạn không có quyền cập nhật đơn hàng này.'); }

    const updatedOrder = await orderRepository.updateStatus(orderId, newStatus);
    if (!updatedOrder) {
      throw new AppError(500, 'INTERNAL_ERROR', 'Cập nhật trạng thái đơn hàng thất bại.');
    }

    return updatedOrder;
  },
};
