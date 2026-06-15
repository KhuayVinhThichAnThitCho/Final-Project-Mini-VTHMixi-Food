import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AllowNull,
  Default,
  Unique,
} from 'sequelize-typescript';

/**
 * Model lưu trữ cấu hình hệ thống dạng key-value
 * Mỗi key là một cấu hình, value là JSON string
 */
@Table({
  tableName: 'system_configs',
  underscored: true,
  timestamps: true,
})
export class SystemConfig extends Model {
  @PrimaryKey
  @Column(DataType.STRING(100))
  key!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  value!: string; // JSON string

  @AllowNull(false)
  @Default('system')
  @Column(DataType.STRING(50))
  group!: string; // nhóm config: 'fee', 'payment', 'banner', 'notice'

  @AllowNull(true)
  @Column(DataType.STRING(255))
  description?: string;
}

export default SystemConfig;
