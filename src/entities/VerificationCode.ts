import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Customer } from "./Customer";
import { Vendor } from "./Vendor";
import { Rider } from "./Rider";
import { Admin } from "./Admin";

export type VerificationType = "sms" | "email";
export type VerificationPurpose =
  | "signup"
  | "login"
  | "password_reset"
  | "phone_verification"
  | "email_verification";
export type ParticipantType = "customer" | "vendor" | "rider" | "admin";

@Entity("verification_codes")
@Index(["contact", "used", "createdAt"])
export class VerificationCode {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 10 })
  code!: string; // 6-digit OTP or verification code

  @Column({ nullable: true })
  contact!: string; // phone or email (consolidated field)

  @Column({ nullable: true })
  phone?: string; // Specific phone for SMS

  @Column({ nullable: true })
  email?: string; // Specific email for email verification

  @Column({ type: "enum", enum: ["sms", "email"] })
  type!: VerificationType;

  @Column({
    type: "enum",
    enum: [
      "signup",
      "login",
      "password_reset",
      "phone_verification",
      "email_verification",
    ],
  })
  purpose!: VerificationPurpose;

  @Column({ name: "participant_type", nullable: true })
  participantType?: ParticipantType;

  @Column({ name: "pin_id", nullable: true })
  pinId?: string; // For SMS service tracking (Termii, Twilio, etc.)

  @Column({ default: false })
  used!: boolean;

  @Column({ default: false })
  verified!: boolean;

  @Column({ type: "timestamp", name: "expires_at" })
  expiresAt!: Date;

  @Column({ type: "integer", name: "attempts", default: 0 })
  attempts!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @ManyToOne(() => Customer, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "customer_id" })
  customer?: Customer;

  @ManyToOne(() => Vendor, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "vendor_id" })
  vendor?: Vendor;

  @ManyToOne(() => Rider, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "rider_id" })
  rider?: Rider;

  @ManyToOne(() => Admin, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "admin_id" })
  admin?: Admin;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;
}
