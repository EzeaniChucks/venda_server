import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from "typeorm";
import { Product } from "./Product";
import { VendorProfile } from "./VendorProfile";
import { Transaction } from "./Transaction";

@Entity("vendors")
export class Vendor {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: "password_hash" })
  password!: string;

  @Column({ name: "business_name" })
  businessName!: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ name: "fcm_token", type: "text", nullable: true })
  fcmToken?: string | null;

  // In Vendor, Customer, and Rider entities
  @Column({
    name: "device_os",
    type: "enum",
    enum: ["ANDROID", "IOS", "WEB"],
    nullable: true,
  })
  deviceOs?: "ANDROID" | "IOS" | "WEB";

  @Column({
    name: "fcm_token_updated_at",
    type: "timestamp",
    nullable: true,
  })
  fcmTokenUpdatedAt?: Date;

  @Column({
    type: "jsonb",
    default: { balance: 0, pendingBalance: 0 },
  })
  wallet!: {
    balance: number;
    pendingBalance: number;
  };

  @Column({ name: "is_approved", default: false })
  isApproved!: boolean;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;

  @Column({ name: "is_verified", default: false })
  isVerified!: boolean;

  // Subscription & Badges
  @Column({ name: "subscription_tier", type: "varchar", nullable: true })
  subscriptionTier?: "starter" | "pro" | "elite";

  @Column({ name: "subscription_expires", type: "timestamp", nullable: true })
  subscriptionExpires?: Date;

  @Column({ name: "is_verified_akwa_ibom", default: false })
  isVerifiedAkwaIbom!: boolean; // Community Empowerment badge

  @Column({ name: "vendor_of_month_count", type: "integer", default: 0 })
  vendorOfMonthCount!: number; // How many times recognized

  // Location & Regional Support
  @Column({ nullable: true })
  state?: string; // e.g., "Akwa Ibom", "Lagos"

  @Column({ nullable: true })
  city?: string;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column({ nullable: true })
  address?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToMany(() => Product, (product) => product.vendor)
  products?: Product[];

  @OneToOne(() => VendorProfile, (profile) => profile.vendor)
  vendorProfile?: VendorProfile;

  @OneToMany(() => Transaction, (transaction) => transaction.vendor)
  transactions?: Transaction[];
}
