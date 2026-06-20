import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  Unique,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Restaurant } from './Restaurant';
import { User } from './User';

export type DiscountType = 'percentage' | 'fixed_amount';

@Table({
  tableName: 'vouchers',
  underscored: true,
  timestamps: true,
})
export class Voucher extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  // Mã voucher viết hoa độc nhất (ví dụ: SAIGON90S, RETROVIBE)
  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(50))
  code!: string;

  // Loại giảm giá: theo tỷ lệ phần trăm (%) hoặc trừ thẳng số tiền mặt cố định (VND)
  @AllowNull(false)
  @Default('fixed_amount')
  @Column(DataType.ENUM('percentage', 'fixed_amount'))
  discountType!: DiscountType;

  // Giá trị giảm giá (Ví dụ: 10.0 cho 10%, hoặc 20000.00 cho 20k VND)
  @AllowNull(false)
  @Column(DataType.DECIMAL(10, 2))
  discountValue!: number;

  // Mức giảm giá tối đa (Đặc biệt hữu dụng khi discountType = 'percentage')
  @AllowNull(true)
  @Column(DataType.DECIMAL(10, 2))
  maxDiscountAmount?: number;

  // Giá trị đơn hàng tối thiểu để được áp dụng voucher này
  @AllowNull(false)
  @Default(0.00)
  @Column(DataType.DECIMAL(10, 2))
  minOrderAmount!: number;

  @AllowNull(false)
  @Column(DataType.DATE)
  startDate!: Date;

  @AllowNull(false)
  @Column(DataType.DATE)
  endDate!: Date;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive!: boolean;

  // Liên kết đến nhà hàng (nếu có, null nghĩa là voucher toàn hệ thống)
  @ForeignKey(() => Restaurant)
  @AllowNull(true)
  @Column(DataType.UUID)
  restaurantId?: string;

  @BelongsTo(() => Restaurant)
  restaurant?: Restaurant;

  // Người tạo ra voucher này (Admin hoặc Vendor)
  @ForeignKey(() => User)
  @AllowNull(true)
  @Column(DataType.UUID)
  createdBy?: string;

  @BelongsTo(() => User)
  creator?: User;
}

export default Voucher;
