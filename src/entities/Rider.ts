import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Order } from "./Order";
import { Transaction } from "./Transaction";

@Entity("riders")
export class Rider {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: "password_hash" })
  password!: string;

  @Column({ name: "full_name" })
  fullName!: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ name: "avatar_url", type: "text", nullable: true })
  profileImage?: string;

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

  @Column({ name: "is_available", default: false })
  isAvailable!: boolean;

  @Column({ name: "document_verification_status", default: "not_submitted" })
  documentVerificationStatus!:
    | "not_submitted"
    | "pending"
    | "approved"
    | "rejected"
    | "changes_requested";

  // Location & Regional Support
  @Column({ nullable: true })
  state?: string; // e.g., "Akwa Ibom", "Lagos"

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToMany(() => Order, (order) => order.rider)
  deliveries?: Order[];

  @OneToMany(() => Transaction, (transaction) => transaction.customer)
  transactions?: Transaction[];
}
