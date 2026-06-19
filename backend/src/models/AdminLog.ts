import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './User';

/**
 * Model ghi lại lịch sử hành động của Admin
 * Mỗi record = 1 hành động WRITE/MODIFY của admin trên hệ thống
 */
@Table({
  tableName: 'admin_logs',
  underscored: true,
  timestamps: true,
  updatedAt: false, // Log chỉ tạo, không sửa
})
export class AdminLog extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  /** Admin thực hiện hành động */
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  adminId!: string;

  @BelongsTo(() => User, 'adminId')
  admin?: User;

  /** Loại hành động */
  @AllowNull(false)
  @Column(DataType.ENUM(
    'USER_STATUS_CHANGE',
    'USER_ROLE_ASSIGN',
    'VENDOR_STATUS_CHANGE',
    'PRODUCT_HARD_DELETE',
    'PRODUCT_VISIBILITY_TOGGLE',
    'ORDER_STATUS_OVERRIDE',
    'SYSTEM_CONFIG_UPDATE',
    'SYSTEM_CONFIG_BATCH_UPDATE'
  ))
  action!: string;

  /** Loại đối tượng bị tác động (user, restaurant, menuItem, order, config) */
  @AllowNull(false)
  @Column(DataType.STRING(50))
  targetType!: string;

  /** ID của đối tượng bị tác động */
  @AllowNull(true)
  @Column(DataType.STRING(255))
  targetId?: string;

  /** Mô tả ngắn gọn hành động (hiển thị trên UI) */
  @AllowNull(false)
  @Column(DataType.TEXT)
  description!: string;

  /** Chi tiết dữ liệu thay đổi (JSON string: oldValue, newValue, v.v.) */
  @AllowNull(true)
  @Column(DataType.TEXT)
  details?: string; // JSON string

  /** IP address của admin (optional) */
  @AllowNull(true)
  @Column(DataType.STRING(45))
  ipAddress?: string;
}

export default AdminLog;
