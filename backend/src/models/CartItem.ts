import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Min,
} from 'sequelize-typescript';
import { Cart } from './Cart';
import { MenuItem } from './MenuItem';

@Table({
  tableName: 'cart_items',
  underscored: true,
  timestamps: true,
})
export class CartItem extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  // Khóa ngoại liên kết tới giỏ hàng cha
  @ForeignKey(() => Cart)
  @AllowNull(false)
  @Column(DataType.UUID)
  cartId!: string;

  // Khóa ngoại liên kết tới món ăn trong thực đơn
  @ForeignKey(() => MenuItem)
  @AllowNull(false)
  @Column(DataType.UUID)
  menuItemId!: string;

  // Số lượng đặt (tối thiểu là 1)
  @AllowNull(false)
  @Min(1)
  @Column(DataType.INTEGER)
  quantity!: number;

  // ==========================================
  // THIẾT LẬP CÁC MỐI QUAN HỆ (ASSOCIATIONS)
  // ==========================================

  @BelongsTo(() => Cart)
  cart!: Cart;

  @BelongsTo(() => MenuItem)
  menuItem!: MenuItem;
}

export default CartItem;
