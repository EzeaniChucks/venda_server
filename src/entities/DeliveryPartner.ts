import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type PartnerStatus = 'pending' | 'active' | 'inactive' | 'suspended';
export type ServiceType = 'same_day' | 'next_day' | 'standard' | 'express';

@Entity('delivery_partners')
export class DeliveryPartner {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  phone!: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'simple-array', nullable: true })
  serviceCities?: string[]; // Cities they operate in

  @Column({ type: 'simple-array', nullable: true })
  serviceTypes?: ServiceType[]; // Types of delivery they offer

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'base_rate' })
  baseRate!: number; // Base delivery fee

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'per_km_rate', nullable: true })
  perKmRate?: number;

  @Column({ type: 'enum', enum: ['pending', 'active', 'inactive', 'suspended'], default: 'pending' })
  status!: PartnerStatus;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, default: 0 })
  rating?: number;

  @Column({ type: 'integer', name: 'total_deliveries', default: 0 })
  totalDeliveries!: number;

  @Column({ type: 'integer', name: 'successful_deliveries', default: 0 })
  successfulDeliveries!: number;

  @Column({ name: 'is_trusted', default: false })
  isTrusted!: boolean; // For "Trusted Delivery" badge

  @Column({ type: 'text', name: 'contact_person', nullable: true })
  contactPerson?: string;

  @Column({ type: 'text', name: 'business_registration', nullable: true })
  businessRegistration?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
