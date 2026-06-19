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
import { CustomerAiConversation } from './CustomerAiConversation';

@Table({
  tableName: 'customer_ai_messages',
  underscored: true,
  timestamps: true,
})
export class CustomerAiMessage extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => CustomerAiConversation)
  @AllowNull(false)
  @Column(DataType.UUID)
  customerAiConversationId!: string;

  @AllowNull(false)
  @Column(DataType.ENUM('system', 'user', 'assistant'))
  role!: 'system' | 'user' | 'assistant';

  @AllowNull(false)
  @Column(DataType.TEXT)
  content!: string;

  // Cờ đánh dấu tin nhắn này có chứa lệnh gọi tool hay không
  @AllowNull(true)
  @Column(DataType.JSON)
  toolCalls?: any;

  // Dành cho role='tool' để map kết quả về đúng tool_call_id
  @AllowNull(true)
  @Column(DataType.STRING(255))
  toolCallId?: string;

  @BelongsTo(() => CustomerAiConversation)
  conversation!: CustomerAiConversation;
}

export default CustomerAiMessage;
