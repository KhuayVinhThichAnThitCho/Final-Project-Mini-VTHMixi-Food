import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './orderController';
import { AppError } from '../middlewares/errorHandler';
import { Wallet } from '../models/Wallet';
import { walletService } from '../services/walletService';

export const walletController = {
  /**
   * GET /api/v1/wallet/balance
   * Lấy số dư ví của người dùng đang đăng nhập
   */
  getBalance: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.');
      }

      const wallet = await walletService.getOrCreateWallet(req.user.id);

      res.status(200).json({
        success: true,
        data: {
          balance: Number(wallet.balance),
          pendingBalance: Number(wallet.pendingBalance),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/wallet/deposit
   * Nạp tiền vào ví
   */
  deposit: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.');
      }

      const { amount } = req.body;
      if (!amount || Number(amount) <= 0) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Số tiền nạp phải lớn hơn 0.');
      }

      const wallet = await walletService.deposit(req.user.id, Number(amount), 'Nạp tiền vào ví');

      res.status(200).json({
        success: true,
        message: `Nạp tiền thành công. Số dư hiện tại: ${Number(wallet.balance).toLocaleString('vi-VN')} đ`,
        data: {
          balance: Number(wallet.balance),
          pendingBalance: Number(wallet.pendingBalance),
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

export default walletController;
