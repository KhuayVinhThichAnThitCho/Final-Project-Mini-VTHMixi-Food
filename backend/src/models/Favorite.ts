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
import { MenuItem } from './MenuItem';

@Table({
  tableName: 'favorites',
  underscored: true,
  timestamps: true,
})
export class Favorite extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  userId!: string;

  @ForeignKey(() => MenuItem)
  @AllowNull(false)
  @Column(DataType.UUID)
  menuItemId!: string;

  // ==========================================
  // THIẾT LẬP CÁC MỐI QUAN HỆ (ASSOCIATIONS)
  // ==========================================

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => MenuItem)
  menuItem!: MenuItem;
}

export default Favorite;
