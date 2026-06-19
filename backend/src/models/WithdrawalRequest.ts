import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  Default,
  AllowNull,
} from 'sequelize-typescript';
import { User } from './User';

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

export interface IBankInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

@Table({
  tableName: 'withdrawal_requests',
  underscored: true,
  timestamps: true,
})
export class WithdrawalRequest extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  // Khóa ngoại trỏ đến vendor yêu cầu rút tiền
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  vendorId!: string;

  @AllowNull(false)
  @Column(DataType.DECIMAL(12, 2))
  amount!: number;

  @AllowNull(false)
  @Column(DataType.JSON)
  bankInfo!: IBankInfo;

  @AllowNull(false)
  @Default('pending')
  @Column(DataType.ENUM('pending', 'approved', 'rejected'))
  status!: WithdrawalStatus;

  // Lý do từ chối nếu có
  @AllowNull(true)
  @Column(DataType.TEXT)
  reason?: string;

  // ==========================================
  // THIẾT LẬP CÁC MỐI QUAN HỆ (ASSOCIATIONS)
  // ==========================================

  @BelongsTo(() => User)
  vendor!: User;
}

export default WithdrawalRequest;
