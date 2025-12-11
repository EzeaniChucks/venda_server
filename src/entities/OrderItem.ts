import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Order } from "./Order";
import { Vendor } from "./Vendor";

export type VendorStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "preparing"
  | "ready";

@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "order_id" })
  orderId!: string;

  @Column({ name: "product_id" })
  productId!: string;

  @Column({ name: "product_name" })
  productName!: string;

  @Column({ type: "decimal", precision: 10, scale: 2, name: "unit_price" })
  unitPrice!: number;

  @Column({ type: "integer" })
  quantity!: number;

  @Column({ nullable: true })
  size?: string;

  @Column({ nullable: true })
  color?: string;

  @Column({ type: "decimal", precision: 10, scale: 2, name: "total_price" })
  totalPrice!: number;

  @Column({ type: "uuid", name: "vendor_id" })
  vendorId!: string;

  @Column({
    type: "enum",
    enum: ["pending", "accepted", "rejected", "preparing", "ready"],
    name: "vendor_status",
    default: "pending",
  })
  vendorStatus!: VendorStatus;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @ManyToOne(() => Order, (order) => order.orderItems)
  @JoinColumn({ name: "order_id" })
  order!: Order;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: "vendor_id" })
  vendor!: Vendor;
}
