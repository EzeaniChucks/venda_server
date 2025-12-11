import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Vendor } from './Vendor';

@Entity('vendor_profiles')
export class VendorProfile {
  // @PrimaryGeneratedColumn('uuid')
  // id!: string;

  @PrimaryColumn({ name: 'vendor_id', unique: true })
  vendorId!: string;

  @Column({ name: 'business_name' })
  businessName!: string;

  @Column({ type: 'text', name: 'business_description', nullable: true })
  businessDescription?: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  profileImage?: string;

  @Column({ type: 'text', name: 'business_address', nullable: true })
  businessAddress?: string;

  @Column({ name: 'business_phone', nullable: true })
  businessPhone?: string;

  @Column({ name: 'bank_account_name', nullable: true })
  bankAccountName?: string;

  @Column({ name: 'bank_account_number', nullable: true })
  bankAccountNumber?: string;

  @Column({ name: 'bank_name', nullable: true })
  bankName?: string;

  @Column({ name: 'bank_code', nullable: true }) // Add this field
  bankCode?: string;
  
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_sales', default: 0 })
  totalSales!: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating!: number;

  @Column({ name: 'is_approved', default: false })
  isApproved!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToOne(() => Vendor, vendor => vendor.vendorProfile)
  @JoinColumn({ name: 'vendor_id' })
  vendor!: Vendor;
}
