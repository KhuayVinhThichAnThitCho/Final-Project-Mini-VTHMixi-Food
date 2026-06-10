import { Request, Response, NextFunction } from 'express';
import { menuItemRepository } from '../repositories/menuItemRepository';
import { Order } from '../models/Order';
import { Review } from '../models/Review';

export const menuItemController = {
  /**
   * Lấy danh sách món ăn phân trang theo danh mục (Lazy loading)
   */
  getMenuItems: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = (req.query.category as string) || 'all';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 8;
      const offset = (page - 1) * limit;

      const { items, total } = await menuItemRepository.findPaginated(category, offset, limit);

      const hasMore = offset + items.length < total;

      res.status(200).json({
        success: true,
        message: 'Lấy danh sách món ăn thành công.',
        data: {
          items,
          total,
          page,
          limit,
          hasMore,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy Top 10 sản phẩm bán chạy nhất và xem nhiều nhất
   */
  getTopItems: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      const bestSellers = await menuItemRepository.findTopBestSellers(limit);
      const mostViewed = await menuItemRepository.findTopMostViewed(limit);

      res.status(200).json({
        success: true,
        message: 'Lấy danh sách sản phẩm nổi bật thành công.',
        data: {
          bestSellers,
          mostViewed,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Tăng lượt xem sản phẩm
   */
  incrementView: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const item = await menuItemRepository.incrementViewCount(id);

      if (!item) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy sản phẩm.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Tăng lượt xem thành công.',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy số liệu thống kê sản phẩm (Số lượt mua và số bình luận)
   */
  getMenuItemStats: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // 1. Số lượng khách mua (đơn hàng completed chứa món này)
      const completedOrders = await Order.findAll({
        where: { status: 'completed' },
      });

      const uniqueBuyers = new Set<string>();
      completedOrders.forEach((order) => {
        const containsItem = order.items && order.items.some((item: any) => item.menuItemId === id);
        if (containsItem) {
          uniqueBuyers.add(order.userId);
        }
      });

      // 2. Số lượng bình luận đánh giá
      const reviewCount = await Review.count({
        where: { menuItemId: id },
      });

      res.status(200).json({
        success: true,
        data: {
          buyerCount: uniqueBuyers.size,
          reviewCount,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

export default menuItemController;
