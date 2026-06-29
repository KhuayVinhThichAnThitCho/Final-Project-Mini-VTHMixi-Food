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

@Table({
  tableName: 'unban_appeals',
  underscored: true,
  timestamps: true,
})
export class UnbanAppeal extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User, 'userId')
  user!: User;

  @AllowNull(false)
  @Column(DataType.TEXT)
  appealReason!: string;

  @AllowNull(false)
  @Default('pending')
  @Column(DataType.ENUM('pending', 'approved', 'rejected'))
  status!: 'pending' | 'approved' | 'rejected';

  @ForeignKey(() => User)
  @AllowNull(true)
  @Column(DataType.UUID)
  adminId?: string;

  @BelongsTo(() => User, 'adminId')
  admin?: User;

  @AllowNull(true)
  @Column(DataType.TEXT)
  adminResponse?: string;
}

export default UnbanAppeal;
