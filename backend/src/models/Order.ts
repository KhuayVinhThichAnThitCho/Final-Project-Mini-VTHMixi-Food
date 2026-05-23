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
import { Restaurant } from './Restaurant';

export type PaymentMethod = 'COD' | 'WALLET';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled';

@Table({
  tableName: 'orders',
  underscored: true,
  timestamps: true,
})
export class Order extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  // Khóa ngoại trỏ đến người mua hàng
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  userId!: string;

  // Khóa ngoại trỏ đến nhà hàng nhận đơn
  @ForeignKey(() => Restaurant)
  @AllowNull(false)
  @Column(DataType.UUID)
  restaurantId!: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  deliveryAddress!: string;

  // Tổng số tiền thanh toán của đơn hàng (bao gồm tiền món + phí ship)
  @AllowNull(false)
  @Column(DataType.DECIMAL(12, 2))
  totalAmount!: number;

  @AllowNull(false)
  @Default('COD')
  @Column(DataType.ENUM('COD', 'WALLET'))
  paymentMethod!: PaymentMethod;

  @AllowNull(false)
  @Default('pending')
  @Column(DataType.ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivering', 'completed', 'cancelled'))
  status!: OrderStatus;

  // ==========================================
  // THIẾT LẬP CÁC MỐI QUAN HỆ (ASSOCIATIONS)
  // ==========================================

  // Đơn hàng thuộc sở hữu của một Khách hàng đặt mua (User)
  @BelongsTo(() => User)
  user!: User;

  // Đơn hàng được giao cho một Nhà hàng thực hiện (Restaurant)
  @BelongsTo(() => Restaurant)
  restaurant!: Restaurant;
}

export default Order;
