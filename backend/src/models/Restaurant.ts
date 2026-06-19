import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  PrimaryKey,
  Default,
  AllowNull,
} from 'sequelize-typescript';
import { User } from './User';
import { MenuItem } from './MenuItem';
import { Order } from './Order';
import { Conversation } from './Conversation';

export type RestaurantStatus = 'pending' | 'open' | 'closed' | 'banned' | 'rejected';

export interface IOperatingHours {
  open: string;  // Ví dụ: "07:00"
  close: string; // Ví dụ: "22:00"
}

@Table({
  tableName: 'restaurants',
  underscored: true,
  timestamps: true,
})
export class Restaurant extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  // Khóa ngoại liên kết đến chủ cửa hàng (User role = 'vendor')
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  ownerId!: string;

  @AllowNull(false)
  @Column(DataType.STRING(150))
  name!: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  address!: string;

  // Khu vực của nhà hàng (Dùng để Manager query theo khu vực)
  @AllowNull(true)
  @Column(DataType.STRING(100))
  region?: string;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  logo?: string;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  coverImage?: string;

  // Giờ hoạt động lưu trữ dưới định dạng JSON
  @AllowNull(true)
  @Column(DataType.JSON)
  operatingHours?: IOperatingHours;

  @AllowNull(false)
  @Default(0.00)
  @Column(DataType.DECIMAL(10, 2))
  deliveryFee!: number;

  @AllowNull(false)
  @Default(0.00)
  @Column(DataType.DECIMAL(10, 2))
  minOrderValue!: number;

  @AllowNull(false)
  @Default('pending')
  @Column(DataType.ENUM('pending', 'open', 'closed', 'banned', 'rejected'))
  status!: RestaurantStatus;

  @AllowNull(true)
  @Column(DataType.TEXT)
  rejectionReason?: string;

  @AllowNull(false)
  @Default(0.0)
  @Column(DataType.DECIMAL(2, 1))
  ratingAvg!: number;

  // ==========================================
  // THIẾT LẬP CÁC MỐI QUAN HỆ (ASSOCIATIONS)
  // ==========================================

  // Mỗi nhà hàng thuộc sở hữu của duy nhất một Chủ quán (User)
  @BelongsTo(() => User)
  owner!: User;

  // Một nhà hàng có thể cung cấp nhiều Món ăn trong thực đơn
  @HasMany(() => MenuItem)
  menuItems!: MenuItem[];

  // Một nhà hàng nhận và chuẩn bị nhiều Đơn hàng đặt đồ ăn
  @HasMany(() => Order)
  orders!: Order[];

  // Một nhà hàng có thể có nhiều cuộc trò chuyện với nhiều khách hàng
  @HasMany(() => Conversation)
  conversations?: Conversation[];
}

export default Restaurant;
