import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from './Customer';

export type LocationType = 'home' | 'work' | 'other';

@Entity('saved_locations')
export class SavedLocation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'customer_id' })
  customerId!: string;

  @Column()
  label!: string; // e.g., "Home", "Office", "Gym"

  @Column({ type: 'enum', enum: ['home', 'work', 'other'], default: 'other' })
  type!: LocationType;

  @Column({ type: 'text' })
  address!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column({ name: 'street_address', nullable: true })
  streetAddress?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ name: 'postal_code', nullable: true })
  postalCode?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ name: 'delivery_instructions', type: 'text', nullable: true })
  deliveryInstructions?: string;

  @Column({ name: 'is_default', default: false })
  isDefault!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;
}
