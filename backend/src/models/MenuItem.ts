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
import { Restaurant } from './Restaurant';

@Table({
  tableName: 'menu_items',
  underscored: true,
  timestamps: true,
})
export class MenuItem extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  // Khóa ngoại liên kết ngược về nhà hàng sở hữu món ăn
  @ForeignKey(() => Restaurant)
  @AllowNull(false)
  @Column(DataType.UUID)
  restaurantId!: string;

  @AllowNull(false)
  @Column(DataType.STRING(150))
  name!: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description?: string;

  // Giá món ăn (VND) - dùng Decimal để chính xác tuyệt đối
  @AllowNull(false)
  @Column(DataType.DECIMAL(12, 2))
  price!: number;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  image?: string;

  // Mảng chứa danh sách nhiều hình ảnh của sản phẩm phục vụ Swiper
  @AllowNull(true)
  @Column(DataType.JSON)
  images?: string[];

  // Số lượng sản phẩm còn lại trong kho (báo hàng tồn)
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  stock!: number;

  // Số lượng sản phẩm đã bán được
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  soldCount!: number;

  // Danh mục tương ứng của sản phẩm (ví dụ: pho, com, coffee...)
  @AllowNull(false)
  @Default('all')
  @Column(DataType.STRING(50))
  category!: string;

  // Số lượt xem món ăn (để tìm các món được xem nhiều nhất)
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  viewCount!: number;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  isAvailable!: boolean;

  // Cờ phục vụ cho cơ chế xóa mềm (Soft Delete) tránh mất mát lịch sử hóa đơn đơn hàng cũ
  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  isDeleted!: boolean;

  @AllowNull(true)
  @Column(DataType.TEXT)
  banReason?: string;

  // ==========================================
  // THIẾT LẬP CÁC MỐI QUAN HỆ (ASSOCIATIONS)
  // ==========================================

  // Món ăn bắt buộc thuộc về một nhà hàng cụ thể
  @BelongsTo(() => Restaurant)
  restaurant!: Restaurant;
}

export default MenuItem;
