import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Cart } from "./Cart";
import { Wishlist } from "./Wishlist";
import { Order } from "./Order";
import { Transaction } from "./Transaction";
import { PaymentMethod } from "./PaymentMethod";

@Entity("customers")
export class Customer {
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

  // Location & Regional Support
  @Column({ nullable: true, default: "Abuja" })
  state?: string; // e.g., "Akwa Ibom", "Lagos"

  @Column({ nullable: true, default: "Wuse" })
  city?: string;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column({ nullable: true })
  address?: string;

  @Column({ name: "fcm_token", type: "text", nullable: true })
  fcmToken?: string | null;

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

  @Column({ name: "is_active", default: true })
  isActive!: boolean;

  @Column({ name: "is_verified", default: false })
  isVerified!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToMany(() => Cart, (cart) => cart.customer)
  cartItems?: Cart[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.customer)
  wishlistItems?: Wishlist[];

  @OneToMany(() => Order, (order) => order.customer)
  orders?: Order[];

  @OneToMany(() => Transaction, (transaction) => transaction.customer)
  transactions?: Transaction[];

  @OneToMany(() => PaymentMethod, (paymentMethod) => paymentMethod.customer)
  paymentMethods?: PaymentMethod[];
}
