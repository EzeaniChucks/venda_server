// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   CreateDateColumn,
//   ManyToOne,
//   JoinColumn,
// } from "typeorm";
// import { Wallet } from "./Wallet";
// import { Customer } from "./Customer";
// import { Vendor } from "./Vendor";
// import { Rider } from "./Rider";

// export type WalletTransactionType =
//   | "deposit"
//   | "withdrawal"
//   | "payment"
//   | "refund";

// export type WalletTransactionStatus =
//   | "pending"
//   | "pending_otp"
//   | "processing"
//   | "completed"
//   | "failed";

// @Entity("wallet_transactions")
// export class WalletTransaction {
//   @PrimaryGeneratedColumn("uuid")
//   id!: string;

//   @Column({ type: "uuid", name: "wallet_id", nullable: true })
//   walletId?: string;

//   @Column({ type: "uuid", name: "customer_id" })
//   customerId!: string;

//   @Column({ type: "uuid", name: "vendor_id", nullable: true })
//   vendorId?: string; // Add vendor ID

//   @Column({ type: "uuid", name: "rider_id", nullable: true })
//   riderId?: string; // Add rider ID

//   @Column({
//     type: "enum",
//     enum: ["deposit", "withdrawal", "payment", "refund"],
//     name: "transaction_type",
//   })
//   transactionType!: WalletTransactionType;

//   @Column({ type: "decimal", precision: 12, scale: 2 })
//   amount!: number;

//   @Column({ type: "decimal", precision: 12, scale: 2, name: "balance_before" })
//   balanceBefore!: number;

//   @Column({ type: "decimal", precision: 12, scale: 2, name: "balance_after" })
//   balanceAfter!: number;

//   @Column({ unique: true })
//   reference!: string;

//   @Column({ type: "text" })
//   description!: string;

//   @Column({
//     type: "enum",
//     enum: ["pending", "completed", "failed"],
//     default: "pending",
//   })
//   status!: WalletTransactionStatus;

//   @Column({ type: "jsonb", nullable: true })
//   metadata?: any;

//   @CreateDateColumn({ name: "created_at" })
//   createdAt!: Date;

//   // wallet table isn't currently in use. Wallet exists as jsonb field on rider, customer and vendor entity classes
//   @ManyToOne(() => Wallet, (wallet) => wallet.transactions, { nullable: true })
//   @JoinColumn({ name: "wallet_id" })
//   wallet?: Wallet;

//   @ManyToOne(() => Customer, { nullable: true }) // Make nullable
//   @JoinColumn({ name: "customer_id" })
//   customer?: Customer;

//   @ManyToOne(() => Vendor, { nullable: true }) // Add vendor relation
//   @JoinColumn({ name: "vendor_id" })
//   vendor?: Vendor;

//   @ManyToOne(() => Rider, { nullable: true }) // Add rider relation
//   @JoinColumn({ name: "rider_id" })
//   rider?: Rider;
// }
