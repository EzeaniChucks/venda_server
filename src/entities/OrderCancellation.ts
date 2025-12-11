import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Order } from './Order';
import { Vendor } from './Vendor';
import { Customer } from './Customer';
import { Rider } from './Rider';

export type CancellationInitiator = 'vendor' | 'customer' | 'rider' | 'admin';
export type RefundStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'not_applicable';

@Entity('order_cancellations')
@Index(['cancelledBy', 'cancelledAt'])
export class OrderCancellation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'order_id' })
  orderId!: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column({ type: 'uuid', nullable: true, name: 'vendor_id' })
  vendorId?: string;

  @ManyToOne(() => Vendor, { nullable: true })
  @JoinColumn({ name: 'vendor_id' })
  vendor?: Vendor;

  @Column({ type: 'uuid', nullable: true, name: 'customer_id' })
  customerId?: string;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  @Column({ type: 'uuid', nullable: true, name: 'rider_id' })
  riderId?: string;

  @ManyToOne(() => Rider, { nullable: true })
  @JoinColumn({ name: 'rider_id' })
  rider?: Rider;

  @Column({ type: 'text' })
  reason!: string;

  @Column({ name: 'cancelled_by' })
  cancelledBy!: CancellationInitiator;

  @Column({ name: 'refund_status', default: 'not_applicable' })
  refundStatus!: RefundStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'refund_amount' })
  refundAmount?: number;

  @CreateDateColumn({ name: 'cancelled_at', type: 'timestamptz' })
  cancelledAt!: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;
}
