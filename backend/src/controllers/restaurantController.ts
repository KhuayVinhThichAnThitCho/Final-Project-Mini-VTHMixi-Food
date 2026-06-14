import { Request, Response, NextFunction } from 'express';
import { restaurantRepository } from '../repositories/restaurantRepository';
import { Restaurant } from '../models/Restaurant';
import { MenuItem } from '../models/MenuItem';
import { AuthenticatedRequest } from './orderController';
import { AppError } from '../middlewares/errorHandler';

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

      // Bước 1: Lấy thông tin nhà hàng
      const restaurant = await Restaurant.findByPk(id);
      if (!restaurant) {
        res.status(404).json({ success: false, message: 'Không tìm thấy nhà hàng.' });
        return;
      }

      // Bước 2: Lấy menu items riêng (tránh Sequelize include bugs)
      const menuItems = await MenuItem.findAll({
        where: {
          restaurantId: id,
          isDeleted: false,
          isAvailable: true,
        },
        order: [['soldCount', 'DESC']],
      });

      // Log để debug
      console.log(`[DEBUG] Restaurant ${id} - menuItems count: ${menuItems.length}`);

      res.status(200).json({
        success: true,
        message: 'Lấy thông tin nhà hàng thành công.',
        data: {
          ...restaurant.toJSON(),
          menuItems,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/restaurants/mine
   * Lấy thông tin quán của vendor đang đăng nhập (kèm menu items)
   */
  getMyRestaurant: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập để xem thông tin quán.');
      }

      const restaurant = await Restaurant.findOne({
        where: { ownerId: req.user.id },
        include: [
          {
            model: MenuItem,
            where: { isDeleted: false },
            required: false,
          },
        ],
      });

      if (!restaurant) {
        throw new AppError(404, 'NOT_FOUND', 'Bạn chưa có quán hàng nào trên hệ thống.');
      }

      res.status(200).json({
        success: true,
        data: restaurant,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/restaurants/mine
   * Cập nhật thông tin quán của vendor đang đăng nhập
   */
  updateMyRestaurant: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập để cập nhật thông tin quán.');
      }

      const restaurant = await Restaurant.findOne({ where: { ownerId: req.user.id } });
      if (!restaurant) {
        throw new AppError(404, 'NOT_FOUND', 'Bạn chưa có quán hàng nào trên hệ thống.');
      }

      const { name, address, deliveryFee, minOrderValue, status, operatingHours, logo } = req.body;

      if (name) restaurant.name = name;
      if (address) restaurant.address = address;
      if (deliveryFee !== undefined) restaurant.deliveryFee = deliveryFee;
      if (minOrderValue !== undefined) restaurant.minOrderValue = minOrderValue;
      if (status) restaurant.status = status;
      if (operatingHours) restaurant.operatingHours = operatingHours;
      if (logo) restaurant.logo = logo;

      await restaurant.save();

      res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin quán thành công.',
        data: restaurant,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/restaurants/mine/menu-items
   * Lấy toàn bộ menu items của quán vendor (kể cả hết hàng)
   */
  getMyMenuItems: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.');
      }

      const restaurant = await Restaurant.findOne({ where: { ownerId: req.user.id } });
      if (!restaurant) {
        throw new AppError(404, 'NOT_FOUND', 'Bạn chưa có quán hàng nào trên hệ thống.');
      }

      const menuItems = await MenuItem.findAll({
        where: { restaurantId: restaurant.id, isDeleted: false },
        order: [['createdAt', 'DESC']],
      });

      res.status(200).json({
        success: true,
        data: menuItems,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/restaurants/mine/menu-items
   * Thêm món ăn mới vào quán
   */
  createMyMenuItem: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.');
      }

      const restaurant = await Restaurant.findOne({ where: { ownerId: req.user.id } });
      if (!restaurant) {
        throw new AppError(404, 'NOT_FOUND', 'Bạn chưa có quán hàng nào trên hệ thống.');
      }

      const { name, description, price, category, stock, image } = req.body;

      if (!name || !price) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Tên và giá món ăn là bắt buộc.');
      }

      const menuItem = await MenuItem.create({
        restaurantId: restaurant.id,
        name,
        description: description || '',
        price: Number(price),
        category: category || 'all',
        stock: Number(stock) || 0,
        image: image || null,
        isAvailable: true,
        isDeleted: false,
      });

      res.status(201).json({
        success: true,
        message: 'Thêm món ăn thành công.',
        data: menuItem,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/restaurants/mine/menu-items/:itemId
   * Cập nhật thông tin món ăn
   */
  updateMyMenuItem: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.');
      }

      const restaurant = await Restaurant.findOne({ where: { ownerId: req.user.id } });
      if (!restaurant) {
        throw new AppError(404, 'NOT_FOUND', 'Bạn chưa có quán hàng nào trên hệ thống.');
      }

      const { itemId } = req.params;
      const menuItem = await MenuItem.findOne({
        where: { id: itemId, restaurantId: restaurant.id, isDeleted: false },
      });

      if (!menuItem) {
        throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy món ăn này trong quán của bạn.');
      }

      const { name, description, price, category, stock, image, isAvailable } = req.body;

      if (name) menuItem.name = name;
      if (description !== undefined) menuItem.description = description;
      if (price !== undefined) menuItem.price = Number(price);
      if (category) menuItem.category = category;
      if (stock !== undefined) menuItem.stock = Number(stock);
      if (image !== undefined) menuItem.image = image;
      if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;

      await menuItem.save();

      res.status(200).json({
        success: true,
        message: 'Cập nhật món ăn thành công.',
        data: menuItem,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/restaurants/mine/menu-items/:itemId
   * Xóa mềm (soft delete) món ăn
   */
  deleteMyMenuItem: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.');
      }

      const restaurant = await Restaurant.findOne({ where: { ownerId: req.user.id } });
      if (!restaurant) {
        throw new AppError(404, 'NOT_FOUND', 'Bạn chưa có quán hàng nào trên hệ thống.');
      }

      const { itemId } = req.params;
      const menuItem = await MenuItem.findOne({
        where: { id: itemId, restaurantId: restaurant.id, isDeleted: false },
      });

      if (!menuItem) {
        throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy món ăn này trong quán của bạn.');
      }

      // Soft delete để giữ lịch sử đơn hàng
      menuItem.isDeleted = true;
      await menuItem.save();

      res.status(200).json({
        success: true,
        message: 'Xóa món ăn thành công.',
      });
    } catch (error) {
      next(error);
    }
  },
};

export default restaurantController;
