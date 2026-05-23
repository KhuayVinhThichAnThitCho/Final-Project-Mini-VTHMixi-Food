import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  AutoIncrement,
  Default,
  AllowNull,
  Unique,
} from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'wallets',
  underscored: true,
  timestamps: true,
})
export class Wallet extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  // Khóa ngoại liên kết 1-1 tới người dùng (bắt buộc unique)
  @ForeignKey(() => User)
  @Unique
  @AllowNull(false)
  @Column(DataType.UUID)
  userId!: string;

  // Số dư khả dụng hiện tại trong ví (VND)
  @AllowNull(false)
  @Default(0.00)
  @Column(DataType.DECIMAL(12, 2))
  balance!: number;

  // Số dư bị tạm giữ (ví dụ: đang chờ rút hoặc đang xử lý tranh chấp đơn hàng)
  @AllowNull(false)
  @Default(0.00)
  @Column(DataType.DECIMAL(12, 2))
  pendingBalance!: number;

  // ==========================================
  // THIẾT LẬP CÁC MỐI QUAN HỆ (ASSOCIATIONS)
  // ==========================================

  // Ví thuộc quyền sở hữu độc quyền của một người dùng (User)
  @BelongsTo(() => User)
  user!: User;
}

export default Wallet;
