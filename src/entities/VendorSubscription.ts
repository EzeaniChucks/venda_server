import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Vendor } from './Vendor';
import { SubscriptionPlan } from './SubscriptionPlan';

export enum SubscriptionTier {
  FREE = 'free',
  STARTER = 'starter',
  PRO = 'pro',
  ELITE = 'elite',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
  PAST_DUE = 'past_due',
  GRACE_PERIOD = 'grace_period',
}

@Entity('vendor_subscriptions')
export class VendorSubscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'vendor_id' })
  vendorId!: string;

  @Column({ name: 'plan_id', type: 'uuid', nullable: true })
  planId?: string;

  @Column({ type: 'varchar', default: 'free' })
  tier!: SubscriptionTier;

  @Column({ type: 'varchar', default: 'active' })
  status!: SubscriptionStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount!: number;

  @Column({ type: 'integer', name: 'item_limit', default: 10 })
  itemLimit!: number;

  @Column({ name: 'has_promo_feature', default: false })
  hasPromoFeature!: boolean;

  @Column({ name: 'has_homepage_visibility', default: false })
  hasHomepageVisibility!: boolean;

  @Column({ name: 'start_date', type: 'timestamp' })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'timestamp' })
  endDate!: Date;

  @Column({ name: 'auto_renew', default: true })
  autoRenew!: boolean;

  @Column({ type: 'text', name: 'payment_reference', nullable: true })
  paymentReference?: string;

  @Column({ type: 'varchar', name: 'paystack_authorization_code', nullable: true })
  paystackAuthorizationCode?: string;

  @Column({ type: 'varchar', name: 'paystack_customer_code', nullable: true })
  paystackCustomerCode?: string;

  @Column({ type: 'varchar', name: 'paystack_email', nullable: true })
  paystackEmail?: string;

  @Column({ type: 'int', name: 'failed_payment_attempts', default: 0 })
  failedPaymentAttempts!: number;

  @Column({ type: 'timestamp', name: 'last_payment_attempt', nullable: true })
  lastPaymentAttempt?: Date;

  @Column({ type: 'timestamp', name: 'next_retry_date', nullable: true })
  nextRetryDate?: Date;

  @Column({ type: 'timestamp', name: 'cancelled_at', nullable: true })
  cancelledAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor!: Vendor;

  @ManyToOne(() => SubscriptionPlan, { nullable: true })
  @JoinColumn({ name: 'plan_id' })
  plan?: SubscriptionPlan;
}
