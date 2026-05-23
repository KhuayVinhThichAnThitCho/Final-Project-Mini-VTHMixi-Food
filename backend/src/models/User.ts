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

export type UserRole = 'guest' | 'user' | 'vendor' | 'manager' | 'admin';
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
  @Column(DataType.STRING(255))
  avatar?: string;

  @AllowNull(false)
  @Default('user')
  @Column(DataType.ENUM('guest', 'user', 'vendor', 'manager', 'admin'))
  role!: UserRole;

  @AllowNull(false)
  @Default('pending')
  @Column(DataType.ENUM('pending', 'active', 'banned'))
  status!: UserStatus;

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
}

export default User;
