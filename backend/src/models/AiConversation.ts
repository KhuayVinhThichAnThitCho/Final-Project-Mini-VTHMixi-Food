import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, PrimaryKey, Default, AllowNull } from 'sequelize-typescript';
import { Restaurant } from './Restaurant';
import { AiMessage } from './AiMessage';

@Table({
  tableName: 'ai_conversations',
  underscored: true,
  timestamps: true,
})
export class AiConversation extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Restaurant)
  @AllowNull(false)
  @Column(DataType.UUID)
  restaurantId!: string;

  @AllowNull(true)
  @Column(DataType.DATE)
  lastMessageAt?: Date;

  @AllowNull(true)
  @Column(DataType.JSON)
  businessMemory?: any;

  @BelongsTo(() => Restaurant)
  restaurant!: Restaurant;

  @HasMany(() => AiMessage)
  messages!: AiMessage[];
}

export default AiConversation;
