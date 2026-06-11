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
  Unique,
} from 'sequelize-typescript';
import { User } from './User';
import { Restaurant } from './Restaurant';
import { CartItem } from './CartItem';

@Table({
  tableName: 'carts',
  underscored: true,
  timestamps: true,
})
export class Cart extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  // Khóa ngoại liên kết 1-1 tới người dùng (Mỗi người dùng chỉ có 1 giỏ hàng active)
  @ForeignKey(() => User)
  @Unique
  @AllowNull(false)
  @Column(DataType.UUID)
  userId!: string;

  // Khóa ngoại liên kết tới nhà hàng đang đặt món (Có thể null khi giỏ hàng trống)
  @ForeignKey(() => Restaurant)
  @AllowNull(true)
  @Column(DataType.UUID)
  restaurantId!: string | null;

  // ==========================================
  // THIẾT LẬP CÁC MỐI QUAN HỆ (ASSOCIATIONS)
  // ==========================================

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Restaurant)
  restaurant?: Restaurant;

  // Một giỏ hàng chứa nhiều món ăn
  @HasMany(() => CartItem, { onDelete: 'CASCADE' }) // Tự động xóa sạch các item con khi xóa giỏ hàng
  items!: CartItem[];
}

export default Cart;
