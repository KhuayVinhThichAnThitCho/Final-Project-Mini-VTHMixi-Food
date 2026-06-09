import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './orderController';
import { cartService } from '../services/cartService';
import { AppError } from '../middlewares/errorHandler';

export const cartController = {
  /**
   * Lấy giỏ hàng của người dùng hiện tại
   */
  getCart: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập để xem giỏ hàng.');
      }

      const cart = await cartService.getCart(req.user.id);
      
      res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Thêm một món ăn vào giỏ hàng
   */
  addToCart: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập để thực hiện.');
      }

      const { menuItemId, quantity } = req.body;
      const cart = await cartService.addToCart(req.user.id, menuItemId, quantity);

      res.status(200).json({
        success: true,
        message: 'Đã thêm món vào giỏ hàng.',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cập nhật số lượng món ăn trong giỏ
   */
  updateQuantity: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập để thực hiện.');
      }

      const { menuItemId, quantity } = req.body;
      const cart = await cartService.updateQuantity(req.user.id, menuItemId, quantity);

      res.status(200).json({
        success: true,
        message: 'Cập nhật số lượng thành công.',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xóa hẳn món ăn khỏi giỏ hàng
   */
  removeFromCart: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập để thực hiện.');
      }

      const { menuItemId } = req.params;
      const cart = await cartService.removeFromCart(req.user.id, menuItemId);

      res.status(200).json({
        success: true,
        message: 'Đã xóa món khỏi giỏ hàng.',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Dọn sạch giỏ hàng của người dùng
   */
  clearCart: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập để thực hiện.');
      }

      await cartService.clearCart(req.user.id);

      res.status(200).json({
        success: true,
        message: 'Đã xóa sạch giỏ hàng.',
      });
    } catch (error) {
      next(error);
    }
  },
};

export default cartController;
