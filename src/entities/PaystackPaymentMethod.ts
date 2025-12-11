import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type EntityType = 'customer' | 'vendor' | 'rider';

@Entity('paystack_payment_methods')
export class PaystackPaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'entity_type' })
  entityType!: EntityType;

  @Column({ name: 'entity_id' })
  entityId!: string;

  @Column({ name: 'authorization_code' })
  authorizationCode!: string; // Paystack authorization code for future charges

  @Column({ name: 'card_type' })
  cardType!: string; // visa, mastercard, etc.

  @Column()
  channel!: string; // card, bank, mobile_money

  @Column({ nullable: true })
  last4?: string; // Last 4 digits of card

  @Column({ nullable: true })
  bin?: string; // First 6 digits of card

  @Column({ name: 'exp_month', nullable: true })
  expMonth?: string;

  @Column({ name: 'exp_year', nullable: true })
  expYear?: string;

  @Column()
  bank!: string; // Bank name

  @Column({ name: 'account_name', nullable: true })
  accountName?: string;

  @Column()
  signature!: string; // Unique identifier for this payment method

  @Column({ name: 'is_default', default: false })
  isDefault!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
