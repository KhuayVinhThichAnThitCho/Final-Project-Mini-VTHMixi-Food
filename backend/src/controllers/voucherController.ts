import { Request, Response, NextFunction } from 'express';
import { Voucher } from '../models/Voucher';
import { Restaurant } from '../models/Restaurant';
import { Op } from 'sequelize';
import { AuthenticatedRequest } from './orderController';
import { AppError } from '../middlewares/errorHandler';

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
   * Lấy tất cả vouchers của quán vendor (kể cả hết hạn)
   */
  getMyVouchers: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.');
      }

      const restaurant = await Restaurant.findOne({ where: { ownerId: req.user.id } });
      if (!restaurant) {
        throw new AppError(404, 'NOT_FOUND', 'Bạn chưa có quán hàng nào trên hệ thống.');
      }

      // Lấy voucher lọc theo restaurantId (nếu có) - hiện tại model Voucher chưa có restaurantId
      // Ta tạo convention: code bắt đầu bằng restaurantId hoặc dùng một field riêng
      // Tạm thời trả về tất cả vouchers đang hoạt động
      const vouchers = await Voucher.findAll({
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

      const { code, discountType, discountValue, maxDiscountAmount, minOrderAmount, startDate, endDate } = req.body;

      if (!code || !discountType || !discountValue || !startDate || !endDate) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Thiếu thông tin bắt buộc để tạo mã giảm giá.');
      }

      // Kiểm tra code đã tồn tại chưa
      const existing = await Voucher.findOne({ where: { code: code.toUpperCase() } });
      if (existing) {
        throw new AppError(400, 'BUSINESS_ERROR', 'Mã giảm giá này đã tồn tại trong hệ thống.');
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
      });

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
};

export default voucherController;
