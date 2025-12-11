import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Vendor } from './Vendor';

export type CollabStatus = 'proposed' | 'accepted' | 'active' | 'completed' | 'rejected';

@Entity('vendor_collaborations')
export class VendorCollaboration {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'vendor_1_id' })
  vendor1Id!: string; // First collaborating vendor

  @Column({ name: 'vendor_2_id' })
  vendor2Id!: string; // Second collaborating vendor

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'jsonb', nullable: true })
  productIds?: string[]; // Products involved in the collab

  @Column({ type: 'enum', enum: ['proposed', 'accepted', 'active', 'completed', 'rejected'], default: 'proposed' })
  status!: CollabStatus;

  @Column({ name: 'is_featured', default: false })
  isFeatured!: boolean; // "Collab of the Week"

  @Column({ name: 'banner_image', nullable: true })
  bannerImage?: string;

  @Column({ name: 'start_date', type: 'timestamp', nullable: true })
  startDate?: Date;

  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_1_id' })
  vendor1!: Vendor;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_2_id' })
  vendor2!: Vendor;
}
