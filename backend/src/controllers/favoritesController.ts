import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './orderController';
import { Favorite } from '../models/Favorite';
import { MenuItem } from '../models/MenuItem';
import { Restaurant } from '../models/Restaurant';
import { AppError } from '../middlewares/errorHandler';

export const favoritesController = {
  /**
   * Thêm hoặc xóa sản phẩm khỏi danh sách yêu thích
   */
  toggleFavorite: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập để thực hiện tác vụ này.');
      }

      const { menuItemId } = req.body;
      if (!menuItemId) {
        throw new AppError(400, 'VALIDATION_ERROR', 'menuItemId là bắt buộc.');
      }

      // Check if product exists
      const item = await MenuItem.findByPk(menuItemId);
      if (!item) {
        throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy món ăn yêu cầu.');
      }

      const userId = req.user.id;
      const existing = await Favorite.findOne({ where: { userId, menuItemId } });

      let isFavorite = false;
      if (existing) {
        await existing.destroy();
        isFavorite = false;
      } else {
        await Favorite.create({ userId, menuItemId });
        isFavorite = true;
      }

      res.status(200).json({
        success: true,
        message: isFavorite ? 'Đã thêm vào danh sách yêu thích.' : 'Đã xóa khỏi danh sách yêu thích.',
        data: { isFavorite },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy danh sách sản phẩm yêu thích của tôi
   */
  getMyFavorites: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập để thực hiện tác vụ này.');
      }

      const favorites = await Favorite.findAll({
        where: { userId: req.user.id },
        include: [
          {
            model: MenuItem,
            as: 'menuItem',
            include: [
              {
                model: Restaurant,
                as: 'restaurant',
                attributes: ['name'],
              },
            ],
          },
        ],
      });

      // Map back to a clean list of menu items
      const items = favorites.map((fav) => {
        const item = fav.menuItem.toJSON() as any;
        return {
          ...item,
          restaurantName: item.restaurant?.name || 'Quán ăn',
        };
      });

      res.status(200).json({
        success: true,
        data: items,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default favoritesController;
