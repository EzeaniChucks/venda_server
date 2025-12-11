import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from './Customer';

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'customer_id' })
  customerId!: string;

  @Column({ name: 'authorization_code' })
  authorizationCode!: string;

  @Column({ name: 'card_type' })
  cardType!: string;

  @Column({ name: 'last4' })
  last4!: string;

  @Column({ name: 'exp_month' })
  expMonth!: string;

  @Column({ name: 'exp_year' })
  expYear!: string;

  @Column()
  bank!: string;

  @Column({ name: 'country_code' })
  countryCode!: string;

  @Column()
  brand!: string;

  @Column({ name: 'is_default', default: false })
  isDefault!: boolean;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;
}
