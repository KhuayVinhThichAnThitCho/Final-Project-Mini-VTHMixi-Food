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

export type ReportTargetType = 'review' | 'product' | 'vendor';
export type ReportStatus = 'pending' | 'resolved' | 'rejected';

@Table({
  tableName: 'reports',
  underscored: true,
  timestamps: true,
})
export class Report extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  // Khóa ngoại trỏ đến người báo cáo
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  reporterId!: string;

  @AllowNull(false)
  @Column(DataType.ENUM('review', 'product', 'vendor'))
  targetType!: ReportTargetType;

  // ID của Review, Product hoặc Vendor bị báo cáo
  @AllowNull(false)
  @Column(DataType.UUID)
  targetId!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  reason!: string;

  @AllowNull(false)
  @Default('pending')
  @Column(DataType.ENUM('pending', 'resolved', 'rejected'))
  status!: ReportStatus;

  // Ghi chú của quản lý sau khi xử lý
  @AllowNull(true)
  @Column(DataType.TEXT)
  managerNote?: string;

  // ==========================================
  // THIẾT LẬP CÁC MỐI QUAN HỆ (ASSOCIATIONS)
  // ==========================================

  @BelongsTo(() => User)
  reporter!: User;
}

export default Report;
