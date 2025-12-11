import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Rider } from './Rider';
import { Admin } from './Admin';

export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';

@Entity('rider_documents')
export class RiderDocument {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'rider_id' })
  riderId!: string;

  // Driver's License
  @Column({ type: 'text', name: 'drivers_license_url', nullable: true })
  driversLicenseUrl?: string;

  @Column({ type: 'varchar', name: 'drivers_license_number', nullable: true })
  driversLicenseNumber?: string;

  @Column({ type: 'date', name: 'drivers_license_expiry', nullable: true })
  driversLicenseExpiry?: Date;

  @Column({ type: 'varchar', name: 'drivers_license_cloudinary_id', nullable: true })
  driversLicenseCloudinaryId?: string;

  // Vehicle Details
  @Column({ type: 'varchar', name: 'vehicle_type', nullable: true })
  vehicleType?: string; // bike, bicycle, car

  @Column({ type: 'varchar', name: 'vehicle_registration', nullable: true })
  vehicleRegistration?: string;

  @Column({ type: 'text', name: 'vehicle_photo_url', nullable: true })
  vehiclePhotoUrl?: string;

  @Column({ type: 'varchar', name: 'vehicle_photo_cloudinary_id', nullable: true })
  vehiclePhotoCloudinaryId?: string;

  // National ID
  @Column({ type: 'text', name: 'national_id_url', nullable: true })
  nationalIdUrl?: string;

  @Column({ type: 'varchar', name: 'national_id_number', nullable: true })
  nationalIdNumber?: string;

  @Column({ type: 'varchar', name: 'national_id_cloudinary_id', nullable: true })
  nationalIdCloudinaryId?: string;

  // Verification Status
  @Column({ 
    type: 'varchar', 
    default: 'pending' 
  })
  status!: DocumentStatus;

  @Column({ type: 'text', name: 'admin_notes', nullable: true })
  adminNotes?: string;

  @Column({ type: 'uuid', name: 'reviewed_by', nullable: true })
  reviewedBy?: string;

  @Column({ type: 'timestamp', name: 'submitted_at', nullable: true })
  submittedAt?: Date;

  @Column({ type: 'timestamp', name: 'reviewed_at', nullable: true })
  reviewedAt?: Date;

  @Column({ type: 'integer', name: 'submission_count', default: 1 })
  submissionCount!: number;

  // Rider Profile Fields (consolidated from RiderProfile entity)
  @Column({ type: 'integer', name: 'total_deliveries', default: 0 })
  totalDeliveries!: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  rating!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => Rider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rider_id' })
  rider!: Rider;

  @ManyToOne(() => Admin, { nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer?: Admin;
}
