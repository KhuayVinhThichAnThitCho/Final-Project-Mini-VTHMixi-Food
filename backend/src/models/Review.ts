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
  Min,
  Max,
} from 'sequelize-typescript';
import { User } from './User';
import { Order } from './Order';
import { MenuItem } from './MenuItem';

@Table({
  tableName: 'reviews',
  underscored: true,
  timestamps: true,
})
export class Review extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  // Khóa ngoại trỏ đến khách hàng viết đánh giá
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  userId!: string;

  // Khóa ngoại trỏ đến đơn hàng được đánh giá (Chỉ cho phép đánh giá đơn hàng hoàn thành)
  @ForeignKey(() => Order)
  @AllowNull(false)
  @Column(DataType.UUID)
  orderId!: string;

  // Khóa ngoại trỏ đến món ăn được đánh giá (Lọc bình luận theo sản phẩm)
  @ForeignKey(() => MenuItem)
  @AllowNull(true)
  @Column(DataType.UUID)
  menuItemId?: string;

  // Điểm đánh giá (từ 1 đến 5 sao)
  @AllowNull(false)
  @Min(1)
  @Max(5)
  @Column(DataType.INTEGER)
  rating!: number;

  @AllowNull(true)
  @Column(DataType.TEXT)
  comment?: string;

  // Phản hồi của vendor/chủ quán
  @AllowNull(true)
  @Column(DataType.TEXT)
  vendorReply?: string;

  // Điểm tích lũy được thưởng sau khi đánh giá thành công (ví dụ cộng 10 điểm vào ví)
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  rewardPoints!: number;

  // ==========================================
  // THIẾT LẬP CÁC MỐI QUAN HỆ (ASSOCIATIONS)
  // ==========================================

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Order)
  order!: Order;

  @BelongsTo(() => MenuItem)
  menuItem?: MenuItem;
}

export default Review;
