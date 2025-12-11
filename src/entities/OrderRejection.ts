import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Order } from './Order';
import { OrderItem } from './OrderItem';
import { Vendor } from './Vendor';
import { Rider } from './Rider';

export type RejectionType = 'order' | 'delivery';

@Entity('order_rejections')
@Index(['rejectedAt'])
export class OrderRejection {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'order_id' })
  orderId!: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column({ type: 'uuid', nullable: true, name: 'order_item_id' })
  orderItemId?: string;

  @ManyToOne(() => OrderItem, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_item_id' })
  orderItem?: OrderItem;

  @Column({ type: 'uuid', nullable: true, name: 'rider_id' })
  riderId?: string;

  @ManyToOne(() => Rider, { nullable: true })
  @JoinColumn({ name: 'rider_id' })
  rider?: Rider;

  @Column({ type: 'uuid', nullable: true, name: 'vendor_id' })
  vendorId?: string;

  @ManyToOne(() => Vendor, { nullable: true })
  @JoinColumn({ name: 'vendor_id' })
  vendor?: Vendor;

  @Column({ name: 'rejection_type', default: 'delivery' })
  rejectionType!: RejectionType;

  @Column({ type: 'text' })
  reason!: string;

  @CreateDateColumn({ name: 'rejected_at', type: 'timestamptz' })
  rejectedAt!: Date;

  @Column({ type: 'uuid', nullable: true, name: 'reassigned_to' })
  reassignedTo?: string;

  @Column({ type: 'timestamptz', nullable: true, name: 'reassigned_at' })
  reassignedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;
}
