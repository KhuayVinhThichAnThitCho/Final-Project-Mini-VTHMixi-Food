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
import { Voucher } from './Voucher';

@Table({
  tableName: 'user_vouchers',
  underscored: true,
  timestamps: true,
})
export class UserVoucher extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  // Khóa ngoại trỏ đến Khách hàng thu thập mã
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  // Khóa ngoại trỏ đến Voucher
  @ForeignKey(() => Voucher)
  @AllowNull(false)
  @Column(DataType.UUID)
  voucherId!: string;

  @BelongsTo(() => Voucher)
  voucher!: Voucher;

  // Trạng thái đã sử dụng mã hay chưa
  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  isUsed!: boolean;

  // Ngày sử dụng mã giảm giá
  @AllowNull(true)
  @Column(DataType.DATE)
  usedAt?: Date;
}

export default UserVoucher;
