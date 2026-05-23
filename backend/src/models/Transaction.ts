export type TransactionType = 'DEPOSIT' | 'WITHDRAW' | 'PAYMENT' | 'RECEIVE';

export interface ITransaction {
  id: string;
  walletId: string; // Liên kết tới Wallet
  amount: number; // Lượng tiền giao dịch (luôn là số dương)
  type: TransactionType;
  description?: string;
  createdAt: Date;
}

export class Transaction implements ITransaction {
  id!: string;
  walletId!: string;
  amount!: number;
  type!: TransactionType;
  description?: string;
  createdAt!: Date;
}
