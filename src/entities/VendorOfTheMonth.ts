import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Vendor } from './Vendor';

@Entity('vendor_of_the_month')
@Unique(['month', 'year'])
export class VendorOfTheMonth {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'vendor_id' })
  vendorId!: string;

  @Column({ type: 'integer' })
  month!: number; // 1-12

  @Column({ type: 'integer' })
  year!: number;

  @Column({ type: 'text', nullable: true })
  recognition_reason?: string; // Why they were chosen

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_sales' })
  totalSales!: number; // Sales for that month

  @Column({ type: 'integer', name: 'total_orders' })
  totalOrders!: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  rating?: number; // Average rating for the month

  @Column({ name: 'certificate_url', nullable: true })
  certificateUrl?: string; // Link to certificate

  @Column({ name: 'ad_credit_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  adCreditAmount?: number; // Free ad credit reward

  @Column({ name: 'featured_on_homepage', default: true })
  featuredOnHomepage!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor!: Vendor;
}
