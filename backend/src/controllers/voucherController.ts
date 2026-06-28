import { Request, Response, NextFunction } from 'express';
import { Voucher } from '../models/Voucher';
import { Restaurant } from '../models/Restaurant';
import { UserVoucher } from '../models/UserVoucher';
import { Op } from 'sequelize';
import { AuthenticatedRequest } from './orderController';
import { AppError } from '../middlewares/errorHandler';
import { adminService } from '../services/adminService';

export const voucherController = {
  /**
   * Lấy danh sách các mã giảm giá đang hoạt động (public)
   */
  getActiveVouchers: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const now = new Date();
      const vouchers = await Voucher.findAll({
        where: {
          isActive: true,
          startDate: { [Op.lte]: now },
          endDate: { [Op.gte]: now },
        },
        include: [{ model: Restaurant, attributes: ['name', 'logo'] }],
        order: [['createdAt', 'DESC']],
      });

      res.status(200).json({
        success: true,
        data: vouchers,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy tất cả vouchers của quán vendor (kể cả hết hạn) hoặc lấy tất cả cho admin
   */
  getMyVouchers: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.');
      }

      let whereClause: any = {};
      if (req.user.role === 'vendor') {
        const restaurant = await Restaurant.findOne({ where: { ownerId: req.user.id } });
        if (!restaurant) {
          throw new AppError(404, 'NOT_FOUND', 'Bạn chưa có quán hàng nào trên hệ thống.');
        }
        whereClause.restaurantId = restaurant.id;
      }

      const vouchers = await Voucher.findAll({
        where: whereClause,
        include: [{ model: Restaurant, attributes: ['name', 'logo'] }],
        order: [['createdAt', 'DESC']],
      });

      res.status(200).json({
        success: true,
        data: vouchers,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Tạo mã giảm giá mới
   */
  createVoucher: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.');
      }

      const { code, discountType, discountValue, maxDiscountAmount, minOrderAmount, startDate, endDate, restaurantId } = req.body;

      if (!code || !discountType || !discountValue || !startDate || !endDate) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Thiếu thông tin bắt buộc để tạo mã giảm giá.');
      }

      // Kiểm tra code đã tồn tại chưa
      const existing = await Voucher.findOne({ where: { code: code.toUpperCase() } });
      if (existing) {
        throw new AppError(400, 'BUSINESS_ERROR', 'Mã giảm giá này đã tồn tại trong hệ thống.');
      }

      let finalRestaurantId = null;
      if (req.user.role === 'vendor') {
        const restaurant = await Restaurant.findOne({ where: { ownerId: req.user.id } });
        if (!restaurant) {
          throw new AppError(404, 'NOT_FOUND', 'Bạn chưa có quán hàng nào trên hệ thống.');
        }
        finalRestaurantId = restaurant.id;
      } else if (req.user.role === 'admin') {
        finalRestaurantId = restaurantId || null;
      }

      const voucher = await Voucher.create({
        code: code.toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        minOrderAmount: Number(minOrderAmount) || 0,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true,
        restaurantId: finalRestaurantId,
        createdBy: req.user.id,
      });

      // Tự động tạo System Notice nếu admin tạo mã giảm giá hệ thống (không thuộc quán nào)
      if (req.user.role === 'admin' && !finalRestaurantId) {
        let msg = `Mã giảm giá mới: ${voucher.code}! `;
        if (voucher.discountType === 'percentage') {
          msg += `Giảm ${voucher.discountValue}%`;
          if (voucher.maxDiscountAmount) {
            msg += ` (tối đa ${Number(voucher.maxDiscountAmount).toLocaleString('vi-VN')} VNĐ)`;
          }
        } else {
          msg += `Giảm ngay ${Number(voucher.discountValue).toLocaleString('vi-VN')} VNĐ`;
        }
        msg += ` cho đơn từ ${Number(voucher.minOrderAmount).toLocaleString('vi-VN')} VNĐ. Hạn dùng đến ${new Date(voucher.endDate).toLocaleDateString('vi-VN')}. Thu thập ngay!`;
        
        await adminService.createSystemNotice(msg, 'success');
      }

      res.status(201).json({
        success: true,
        message: 'Tạo mã giảm giá thành công.',
        data: voucher,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xóa/vô hiệu hóa mã giảm giá
   */
  deleteVoucher: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.');
      }

      const { id } = req.params;
      const voucher = await Voucher.findByPk(id);

      if (!voucher) {
        throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy mã giảm giá này.');
      }

      // Kiểm tra xem có đúng chủ quán hay admin không
      if (req.user.role === 'vendor') {
        const restaurant = await Restaurant.findOne({ where: { ownerId: req.user.id } });
        if (!restaurant || voucher.restaurantId !== restaurant.id) {
          throw new AppError(403, 'FORBIDDEN', 'Bạn không có quyền vô hiệu hóa mã này.');
        }
      }

      voucher.isActive = false;
      await voucher.save();

      res.status(200).json({
        success: true,
        message: 'Vô hiệu hóa mã giảm giá thành công.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Khách hàng thu thập mã giảm giá về ví của mình
   */
  collectVoucher: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.');
      }

      const { id } = req.params;
      const voucher = await Voucher.findByPk(id);
      if (!voucher || !voucher.isActive) {
        throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy mã giảm giá này hoặc mã đã bị vô hiệu.');
      }

      const now = new Date();
      if (now < voucher.startDate || now > voucher.endDate) {
        throw new AppError(400, 'BUSINESS_ERROR', 'Mã giảm giá này không còn trong thời gian hoạt động.');
      }

      // Kiểm tra xem đã thu thập chưa
      const existing = await UserVoucher.findOne({
        where: {
          userId: req.user.id,
          voucherId: voucher.id,
        }
      });

      if (existing) {
        throw new AppError(400, 'BUSINESS_ERROR', 'Bạn đã thu thập mã giảm giá này rồi.');
      }

      const userVoucher = await UserVoucher.create({
        userId: req.user.id,
        voucherId: voucher.id,
        isUsed: false,
      });

      res.status(201).json({
        success: true,
        message: 'Thu thập mã giảm giá thành công.',
        data: userVoucher,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy danh sách ví voucher của người dùng đang đăng nhập
   */
  getMyCollectedVouchers: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.');
      }

      const userVouchers = await UserVoucher.findAll({
        where: { userId: req.user.id },
        include: [
          {
            model: Voucher,
            include: [{ model: Restaurant, attributes: ['name', 'logo'] }],
          }
        ],
        order: [['createdAt', 'DESC']],
      });

      res.status(200).json({
        success: true,
        data: userVouchers,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default voucherController;

