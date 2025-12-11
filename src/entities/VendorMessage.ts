import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Vendor } from './Vendor';

@Entity('vendor_messages')
export class VendorMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'sender_id' })
  senderId!: string;

  @Column({ name: 'receiver_id' })
  receiverId!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ name: 'is_read', default: false })
  isRead!: boolean;

  @Column({ name: 'collaboration_id', nullable: true })
  collaborationId?: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments?: { url: string; type: string; name: string }[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'sender_id' })
  sender!: Vendor;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'receiver_id' })
  receiver!: Vendor;
}
