import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Wallet } from "./Wallet";
import { Customer } from "./Customer";

export type WalletTransactionType =
  | "deposit"
  | "withdrawal"
  | "payment"
  | "refund";
export type WalletTransactionStatus = "pending" | "completed" | "failed";

@Entity("wallet_transactions")
export class WalletTransaction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "wallet_id", nullable: true })
  walletId?: string;

  @Column({ type: "uuid", name: "customer_id" })
  customerId!: string;

  @Column({
    type: "enum",
    enum: ["deposit", "withdrawal", "payment", "refund"],
    name: "transaction_type",
  })
  transactionType!: WalletTransactionType;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: "decimal", precision: 12, scale: 2, name: "balance_before" })
  balanceBefore!: number;

  @Column({ type: "decimal", precision: 12, scale: 2, name: "balance_after" })
  balanceAfter!: number;

  @Column({ unique: true })
  reference!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({
    type: "enum",
    enum: ["pending", "completed", "failed"],
    default: "pending",
  })
  status!: WalletTransactionStatus;

  @Column({ type: "jsonb", nullable: true })
  metadata?: any;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions, { nullable: true })
  @JoinColumn({ name: "wallet_id" })
  wallet?: Wallet;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: "customer_id" })
  customer!: Customer;
}
