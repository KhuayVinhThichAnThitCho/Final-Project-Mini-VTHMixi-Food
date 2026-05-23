import { IWallet } from '../models/Wallet';
import { ITransaction } from '../models/Transaction';
import { AppError } from '../middlewares/errorHandler';

// Dữ liệu giả lập ví điện tử
let walletsMock: IWallet[] = [];
let transactionsMock: ITransaction[] = [];

export const walletService = {
  /**
   * Lấy ví điện tử của người dùng, tự động tạo nếu chưa có
   */
  getOrCreateWallet: async (userId: string): Promise<IWallet> => {
    let wallet = walletsMock.find((w) => w.userId === userId);
    if (!wallet) {
      wallet = {
        id: `WALLET-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        userId,
        balance: 0, // Mặc định số dư là 0 VND
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      walletsMock.push(wallet);
    }
    return wallet;
  },

  /**
   * Nạp tiền vào ví điện tử
   */
  deposit: async (userId: string, amount: number, description = 'Nạp tiền vào ví'): Promise<IWallet> => {
    if (amount <= 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Số tiền nạp vào ví phải lớn hơn 0.');
    }

    const wallet = await walletService.getOrCreateWallet(userId);
    wallet.balance += amount;
    wallet.updatedAt = new Date();

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
  payWithWallet: async (userId: string, amount: number, description: string): Promise<IWallet> => {
    const wallet = await walletService.getOrCreateWallet(userId);

    if (wallet.balance < amount) {
      throw new AppError(400, 'BUSINESS_ERROR', `Số dư tài khoản ví không đủ để thực hiện giao dịch (Thiếu ${amount - wallet.balance} VND).`);
    }

    wallet.balance -= amount;
    wallet.updatedAt = new Date();

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
};
