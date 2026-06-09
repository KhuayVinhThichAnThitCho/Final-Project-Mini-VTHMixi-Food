import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './orderController';
import { statsService } from '../services/statsService';
import { AppError } from '../middlewares/errorHandler';

export const statsController = {
  /**
   * Lấy số liệu thống kê doanh số và đơn hàng của cửa hàng (Dành cho Vendor)
   */
  getVendorStats: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập để xem báo cáo.');
      }
      
      // Trong thực tế, cần tìm restaurantId sở hữu bởi req.user.id
      const restaurantId = req.query.restaurantId as string;
      if (!restaurantId) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Thiếu tham số mã cửa hàng (restaurantId).');
      }

      const stats = await statsService.getRestaurantStats(restaurantId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy thống kê toàn hệ thống (Dành cho Admin)
   */
  getAdminStats: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await statsService.getSystemStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default statsController;
