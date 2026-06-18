import {
  Table,
  Column,
  Model,
  DataType,
  HasOne,
  HasMany,
  PrimaryKey,
  Default,
  AllowNull,
  Unique,
  IsEmail,
} from 'sequelize-typescript';
import { Restaurant } from './Restaurant';
import { Wallet } from './Wallet';
import { Order } from './Order';
import { Conversation } from './Conversation';

export type UserRole = 'guest' | 'user' | 'vendor' | 'shipper' | 'manager' | 'admin';
export type UserStatus = 'pending' | 'active' | 'banned';

@Table({
  tableName: 'users',
  underscored: true, // Tự động đổi camelCase thành snake_case trong Database (ví dụ: createdAt -> created_at)
  timestamps: true,  // Tự động tạo và quản lý hai trường created_at và updated_at
})
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  name!: string;

  @AllowNull(false)
  @Unique
  @IsEmail
  @Column(DataType.STRING(150))
  email!: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  password!: string;

  @AllowNull(true)
  @Column(DataType.STRING(20))
  phone?: string;

  @AllowNull(true)
  @Column(DataType.STRING(500))
  address?: string;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  avatar?: string;

  @AllowNull(false)
  @Default('user')
  @Column(DataType.ENUM('guest', 'user', 'vendor', 'shipper', 'manager', 'admin'))
  role!: UserRole;

  // Khu vực mà Manager quản lý (Dành riêng cho role = 'manager')
  @AllowNull(true)
  @Column(DataType.STRING(100))
  managedRegion?: string;

  // Khu vực hoạt động chung của User (Dùng để Manager query shipper theo khu vực)
  @AllowNull(true)
  @Column(DataType.STRING(100))
  region?: string;

  // Trạng thái online của shipper (bật/tắt nhận đơn)
  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  isOnline!: boolean;

  // Điểm đánh giá trung bình của shipper (1.0 - 5.0)
  @AllowNull(true)
  @Column(DataType.FLOAT)
  shipperRating?: number;

  @AllowNull(false)
  @Default('pending')
  @Column(DataType.ENUM('pending', 'active', 'banned'))
  status!: UserStatus;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  points!: number;

  @AllowNull(true)
  @Column(DataType.STRING(10))
  otpCode?: string;

  @AllowNull(true)
  @Column(DataType.DATE)
  otpExpiresAt?: Date;

  // ==========================================
  // THIẾT LẬP CÁC MỐI QUAN HỆ (ASSOCIATIONS)
  // ==========================================

  // Quan hệ 1-1 với Restaurant (Một người dùng đóng vai trò Vendor có tối đa một nhà hàng)
  @HasOne(() => Restaurant)
  restaurant?: Restaurant;

  // Quan hệ 1-1 với Wallet (Mỗi tài khoản người dùng có duy nhất một Ví thanh toán)
  @HasOne(() => Wallet)
  wallet?: Wallet;

  // Quan hệ 1-N với Order (Một khách hàng có thể đặt nhiều đơn hàng)
  @HasMany(() => Order)
  orders?: Order[];

  // Quan hệ 1-N với Conversation (Một khách hàng có thể chat với nhiều nhà hàng)
  @HasMany(() => Conversation)
  conversations?: Conversation[];
}

export default User;
