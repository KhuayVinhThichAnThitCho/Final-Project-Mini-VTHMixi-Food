import { Request, Response, NextFunction } from 'express';
import { restaurantRepository } from '../repositories/restaurantRepository';

export const restaurantController = {
  /**
   * GET /api/v1/restaurants
   * Lấy danh sách nhà hàng có lọc và phân trang
   */
  getRestaurants: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 8;
      const offset = (page - 1) * limit;
      const minRating = parseFloat(req.query.minRating as string) || 0;
      const maxDeliveryFee = parseFloat(req.query.maxDeliveryFee as string) || 0;
      const isOpenOnly = req.query.isOpenOnly === 'true';
      const sortBy = (req.query.sortBy as string) || 'default';

      const { restaurants, total } = await restaurantRepository.findAll(
        { minRating, maxDeliveryFee, isOpenOnly, sortBy },
        offset,
        limit
      );

      res.status(200).json({
        success: true,
        message: 'Lấy danh sách nhà hàng thành công.',
        data: {
          restaurants,
          total,
          page,
          limit,
          hasMore: offset + restaurants.length < total,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/restaurants/:id
   * Lấy chi tiết nhà hàng kèm thực đơn
   */
  getRestaurantById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const restaurant = await restaurantRepository.findById(id);
      if (!restaurant) {
        res.status(404).json({ success: false, message: 'Không tìm thấy nhà hàng.' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Lấy thông tin nhà hàng thành công.',
        data: restaurant,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default restaurantController;
