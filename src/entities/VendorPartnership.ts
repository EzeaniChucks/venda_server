import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Vendor } from './Vendor';

export type PartnershipStatus = 'pending' | 'accepted' | 'declined' | 'active' | 'inactive';
export type PartnershipType = 'collaboration' | 'supplier' | 'distributor' | 'joint_venture' | 'other';

@Entity('vendor_partnerships')
export class VendorPartnership {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'requester_id' })
  requesterId!: string;

  @Column({ name: 'recipient_id' })
  recipientId!: string;

  @Column({ type: 'enum', enum: ['collaboration', 'supplier', 'distributor', 'joint_venture', 'other'], default: 'collaboration' })
  partnershipType!: PartnershipType;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'enum', enum: ['pending', 'accepted', 'declined', 'active', 'inactive'], default: 'pending' })
  status!: PartnershipStatus;

  @Column({ type: 'jsonb', nullable: true })
  terms?: {
    duration?: string;
    profitSplit?: string;
    responsibilities?: string[];
    other?: any;
  };

  @Column({ name: 'accepted_at', type: 'timestamp', nullable: true })
  acceptedAt?: Date;

  @Column({ name: 'declined_at', type: 'timestamp', nullable: true })
  declinedAt?: Date;

  @Column({ name: 'decline_reason', type: 'text', nullable: true })
  declineReason?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'requester_id' })
  requester!: Vendor;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'recipient_id' })
  recipient!: Vendor;
}
