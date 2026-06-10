import { Request, Response, NextFunction } from 'express';
import { Voucher } from '../models/Voucher';
import { Op } from 'sequelize';

export const voucherController = {
  /**
   * Lấy danh sách các mã giảm giá đang hoạt động
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
};

export default voucherController;
