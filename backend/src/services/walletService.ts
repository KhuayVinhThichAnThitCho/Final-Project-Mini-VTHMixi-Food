import { Wallet } from '../models/Wallet';
import { AppError } from '../middlewares/errorHandler';

interface ITransaction {
  id: string;
  walletId: number;
  amount: number;
  type: 'DEPOSIT' | 'PAYMENT';
  description: string;
  createdAt: Date;
}

let transactionsMock: ITransaction[] = [];

export const walletService = {
  /**
   * Lấy ví điện tử của người dùng, tự động tạo nếu chưa có
   */
  getOrCreateWallet: async (userId: string): Promise<Wallet> => {
    let wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        balance: 0,
        pendingBalance: 0,
      });
    }
    return wallet;
  },

  /**
   * Nạp tiền vào ví điện tử
   */
  deposit: async (userId: string, amount: number, description = 'Nạp tiền vào ví'): Promise<Wallet> => {
    if (amount <= 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Số tiền nạp vào ví phải lớn hơn 0.');
    }

    const wallet = await walletService.getOrCreateWallet(userId);
    wallet.balance = Number(wallet.balance) + amount;
    await wallet.save();

    // Ghi nhận lịch sử giao dịch
    const transaction: ITransaction = {
      id: `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      walletId: wallet.id,
      amount,
      type: 'DEPOSIT',
      description,
      createdAt: new Date(),
    };
    transactionsMock.push(transaction);

    return wallet;
  },

  /**
   * Thanh toán bằng ví điện tử
   */
  payWithWallet: async (userId: string, amount: number, description: string): Promise<Wallet> => {
    const wallet = await walletService.getOrCreateWallet(userId);

    if (wallet.balance < amount) {
      throw new AppError(400, 'BUSINESS_ERROR', `Số dư tài khoản ví không đủ để thực hiện giao dịch (Thiếu ${amount - wallet.balance} VND).`);
    }

    wallet.balance = Number(wallet.balance) - amount;
    await wallet.save();

    // Ghi nhận lịch sử giao dịch
    const transaction: ITransaction = {
      id: `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      walletId: wallet.id,
      amount,
      type: 'PAYMENT',
      description,
      createdAt: new Date(),
    };
    transactionsMock.push(transaction);

    return wallet;
  },

  /**
   * Chỉ ghi nhận lịch sử giao dịch (không làm thay đổi số dư - dùng khi đã tự cộng trừ balance)
   */
  recordTransaction: async (walletId: number, amount: number, type: 'DEPOSIT' | 'PAYMENT', description: string): Promise<void> => {
    const transaction: ITransaction = {
      id: `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      walletId,
      amount,
      type,
      description,
      createdAt: new Date(),
    };
    transactionsMock.push(transaction);
  },
};
