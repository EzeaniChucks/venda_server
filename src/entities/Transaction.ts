import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Customer } from "./Customer";
import { Vendor } from "./Vendor";
import { Rider } from "./Rider";
import { Order } from "./Order";

export type TransactionType =
  | "wallet_funding"
  | "wallet_withdrawal"
  | "order_payment"
  | "refund"
  | "commission"
  | "transfer"
  | "wallet_payment"
  | "subscription"
  | "donation"
  |"other"
  
export type TransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "processing"
  | "cancelled";

@Entity("transactions")
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "entity_id" })
  entityId!: string;

  @Column({ name: "entity_type" })
  entityType!: "customer" | "vendor" | "rider";

  // Add wallet-specific fields
  @Column({ name: "wallet_id", nullable: true })
  walletId?: string;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    name: "balance_before",
    nullable: true,
  })
  balanceBefore?: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    name: "balance_after",
    nullable: true,
  })
  balanceAfter?: number;

  @Column({ name: "order_id", nullable: true })
  orderId?: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount!: number;

  @Column({
    type: "enum",
    enum: [
      "wallet_funding", // Deposit to wallet
      "wallet_withdrawal", // Withdrawal from wallet
      "order_payment", // Payment for order
      "refund", // Refund to wallet/card
      "commission", // Commission payment
      "transfer", // Transfer between wallets
      "wallet_payment", // Payment using wallet (new)
    ],
    name: "transaction_type",
  })
  transactionType!: TransactionType;

  @Column()
  reference!: string; // Paystack reference or internal reference

  @Column({ name: "payment_method", nullable: true })
  paymentMethod?: string; // card, bank_transfer, wallet, etc.

  @Column({
    type: "enum",
    enum: ["pending", "completed", "failed", "processing", "cancelled"],
    default: "pending",
  })
  status!: TransactionStatus;

  @Column({ type: "text" })
  description!: string; // Renamed from 'purpose' for clarity

  @Column({ type: "jsonb", nullable: true })
  metadata?: {
    transferCode?: string;
    transferReference?: string;
    recipientCode?: string;
    paystackStatus?: string;
    accountNumber?: string;
    bankCode?: string;
    failureReason?: string;
    [key: string]: any;
  };

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @Column({ type: "timestamp", name: "completed_at", nullable: true })
  completedAt?: Date;

  @ManyToOne(() => Customer, (customer) => customer.transactions, {
    nullable: true,
  })
  @JoinColumn({ name: "customer_id" })
  customer?: Customer;

  @ManyToOne(() => Vendor, (vendor) => vendor.transactions, { nullable: true })
  @JoinColumn({ name: "vendor_id" })
  vendor?: Vendor;

  @ManyToOne(() => Rider, (rider) => rider.transactions, { nullable: true })
  @JoinColumn({ name: "rider_id" })
  rider?: Rider;

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: "order_id" })
  order?: Order;

   // wallet table isn't currently in use. Wallet exists as jsonb field on rider, customer and vendor entity classes
  //  @ManyToOne(() => Wallet, (wallet) => wallet.transactions, { nullable: true })
  //  @JoinColumn({ name: "wallet_id" })
  //  wallet?: Wallet;
}
