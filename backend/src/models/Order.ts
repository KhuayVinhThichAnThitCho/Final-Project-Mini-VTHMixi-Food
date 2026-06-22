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

export type PaymentMethod = 'COD' | 'WALLET' | 'POINTS' | 'VIETQR';
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

  @AllowNull(false)
  @Column(DataType.JSON)
  items!: { menuItemId: string; name: string; quantity: number; price: number; toppings?: string[] }[];

  // Tổng số tiền thanh toán của đơn hàng (bao gồm tiền món + phí ship)
  @AllowNull(false)
  @Column(DataType.DECIMAL(12, 2))
  totalAmount!: number;

  @AllowNull(false)
  @Default('COD')
  @Column(DataType.ENUM('COD', 'WALLET', 'POINTS', 'VIETQR'))
  paymentMethod!: PaymentMethod;

  @AllowNull(false)
  @Default('pending')
  @Column(DataType.ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivering', 'completed', 'cancelled'))
  status!: OrderStatus;

  // Shipper nào đã nhận đơn hàng này
  @ForeignKey(() => User)
  @AllowNull(true)
  @Column(DataType.UUID)
  shipperId?: string;

  // Phí giao hàng (thu nhập của shipper mỗi đơn)
  @AllowNull(false)
  @Default(15000)
  @Column(DataType.DECIMAL(12, 2))
  shippingFee!: number;

  // Ảnh xác nhận lấy hàng tại quán
  @AllowNull(true)
  @Column(DataType.STRING(500))
  pickupPhotoUrl?: string;

  // Ảnh xác nhận giao hàng cho khách
  @AllowNull(true)
  @Column(DataType.STRING(500))
  deliveryPhotoUrl?: string;

  // Khách rate shipper sau khi giao hàng (1-5 sao)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  shipperRating?: number;

  // Mã đơn hàng của PayOS dạng số (lớn nhất 53-bit) để nhận Webhook
  @AllowNull(true)
  @Column(DataType.BIGINT)
  payosOrderCode?: number;

  // URL thanh toán của PayOS
  @AllowNull(true)
  @Column(DataType.TEXT)
  payosCheckoutUrl?: string;

  // ==========================================
  // THIẾT LẬP CÁC MỐI QUAN HỆ (ASSOCIATIONS)
  // ==========================================

  // Đơn hàng thuộc sở hữu của một Khách hàng đặt mua (User)
  @BelongsTo(() => User, 'userId')
  user!: User;

  // Đơn hàng được giao cho một Nhà hàng thực hiện (Restaurant)
  @BelongsTo(() => Restaurant)
  restaurant!: Restaurant;

  // Shipper đảm nhận giao đơn hàng này
  @BelongsTo(() => User, 'shipperId')
  shipper?: User;
}

export default Order;
