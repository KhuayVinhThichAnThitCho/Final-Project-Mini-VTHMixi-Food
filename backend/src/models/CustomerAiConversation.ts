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
} from 'sequelize-typescript';
import { User } from './User';
import { CustomerAiMessage } from './CustomerAiMessage';

@Table({
  tableName: 'customer_ai_conversations',
  underscored: true,
  timestamps: true,
})
export class CustomerAiConversation extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  userId!: string;

  @AllowNull(true)
  @Column(DataType.DATE)
  lastMessageAt?: Date;

  @AllowNull(true)
  @Column(DataType.JSON)
  businessMemory?: any;

  @BelongsTo(() => User)
  user!: User;

  @HasMany(() => CustomerAiMessage)
  messages!: CustomerAiMessage[];
}

export default CustomerAiConversation;
