import { Table, Column, Model, DataType, ForeignKey, BelongsTo, PrimaryKey, Default, AllowNull } from 'sequelize-typescript';
import { AiConversation } from './AiConversation';

export type AiRole = 'user' | 'assistant' | 'system' | 'tool';

@Table({
  tableName: 'ai_messages',
  underscored: true,
  timestamps: true,
})
export class AiMessage extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => AiConversation)
  @AllowNull(false)
  @Column(DataType.UUID)
  aiConversationId!: string;

  @AllowNull(false)
  @Column(DataType.ENUM('user', 'assistant', 'system', 'tool'))
  role!: AiRole;

  @AllowNull(true)
  @Column(DataType.TEXT('long'))
  content?: string;

  // For tool calls
  @AllowNull(true)
  @Column(DataType.JSON)
  toolCalls?: any;

  // For tool responses
  @AllowNull(true)
  @Column(DataType.STRING)
  toolCallId?: string;

  @BelongsTo(() => AiConversation)
  conversation!: AiConversation;
}

export default AiMessage;
