import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/orderService';
import { orderRepository } from '../repositories/orderRepository';
import { AppError } from '../middlewares/errorHandler';
import { Restaurant } from '../models/Restaurant';
import { Order } from '../models/Order';
import { User } from '../models/User';

// Interface mở rộng định dạng Request từ Express để lưu trữ thông tin user sau khi giải mã JWT
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    managedRegion?: string;
  };
}

export const orderController = {
  /**
   * Tạo đơn hàng mới
   */
  createOrder: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập để thực hiện tác vụ này.');
      }

      const userId = req.user.id;
      const { restaurantId, items, deliveryAddress, paymentMethod, voucherCode } = req.body;

      const order = await orderService.createOrder(userId, restaurantId, items, deliveryAddress, paymentMethod, voucherCode);

      res.status(201).json({
        success: true,
        message: 'Tạo đơn hàng thành công.',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cập nhật trạng thái đơn hàng
   */
  updateStatus: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập để thực hiện tác vụ này.');
      }

      const { id } = req.params;
      const { status } = req.body;

      const order = await orderService.updateOrderStatus(id, req.user.id, status);

      res.status(200).json({
        success: true,
        message: 'Cập nhật trạng thái đơn hàng thành công.',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy danh sách đơn hàng của người dùng đang đăng nhập
   */
  getMyOrders: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập để thực hiện tác vụ này.');
      }

      const orders = await orderRepository.findByUserId(req.user.id);

      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy danh sách đơn hàng của quán (Dành cho Vendor)
   */
  getRestaurantOrders: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập để xem đơn hàng.');
      }

      // Tìm quán hàng thuộc vendor đang đăng nhập
      const restaurant = await Restaurant.findOne({ where: { ownerId: req.user.id } });
      if (!restaurant) {
        throw new AppError(404, 'NOT_FOUND', 'Bạn chưa có quán hàng nào trên hệ thống.');
      }

      // Lấy đơn hàng kèm thông tin khách hàng
      const orders = await Order.findAll({
        where: { restaurantId: restaurant.id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'phone', 'avatar'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  },
};
