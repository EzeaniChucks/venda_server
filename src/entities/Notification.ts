import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type NotificationType = 'order_update' | 'payment' | 'promotion' | 'account' | 'general';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'entity_id' })
  entityId!: string;

  @Column({ name: 'entity_type' })
  entityType!: 'customer' | 'vendor' | 'rider';

  @Column()
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'enum', enum: ['order_update', 'payment', 'promotion', 'account', 'general'] })
  type!: NotificationType;

  @Column({ type: 'jsonb', nullable: true })
  data?: any; // Additional data for the notification

  @Column({ default: false })
  read!: boolean;

  @Column({ name: 'action_url', nullable: true })
  actionUrl?: string; // Deep link or URL to navigate to

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
