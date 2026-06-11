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
import { Conversation } from './Conversation';

export type SenderType = 'USER' | 'VENDOR';

@Table({
  tableName: 'messages',
  underscored: true,
  timestamps: true,
})
export class Message extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Conversation)
  @AllowNull(false)
  @Column(DataType.UUID)
  conversationId!: string;

  @AllowNull(false)
  @Column(DataType.ENUM('USER', 'VENDOR'))
  senderType!: SenderType;

  @AllowNull(true)
  @Column(DataType.TEXT)
  text?: string;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  imageUrl?: string;

  // ==========================================
  // THIẾT LẬP CÁC MỐI QUAN HỆ (ASSOCIATIONS)
  // ==========================================

  @BelongsTo(() => Conversation)
  conversation!: Conversation;
}

export default Message;
