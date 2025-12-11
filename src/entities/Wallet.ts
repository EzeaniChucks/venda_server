import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Customer } from "./Customer";
import { WalletTransaction } from "./WalletTransaction";

@Entity("wallets")
export class Wallet {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "customer_id" })
  customerId!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  balance!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToOne(() => Customer)
  @JoinColumn({ name: "customer_id" })
  customer!: Customer;

  @OneToMany(() => WalletTransaction, (transaction) => transaction.wallet)
  transactions!: WalletTransaction[];
}
