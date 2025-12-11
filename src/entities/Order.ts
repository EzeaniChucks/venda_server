import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Customer } from "./Customer";
import { Rider } from "./Rider";
import { OrderItem } from "./OrderItem";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "ready_for_pickup"
  | "dispatched"
  | "out_for_delivery"
  | "delivered"
  | "returned"
  | "refunded"
  | "cancelled";
export type PaymentMethod = "card" | "wallet" | "cash" | "transfer";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "order_number", unique: true })
  orderNumber!: string;

  @Column({ name: "customer_id", nullable: true })
  customerId!: string;

  @Column({ type: "decimal", precision: 10, scale: 2, name: "total_amount" })
  totalAmount!: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    name: "delivery_fee",
    default: 0,
    nullable: true,
  })
  deliveryFee!: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    name: "discount_amount",
    default: 0,
    nullable: true,
  })
  discountAmount?: number;

  @Column({ type: "decimal", precision: 10, scale: 2, name: "final_amount" })
  finalAmount!: number;

  @Column({
    type: "varchar",
    name: "order_status",
    default: "pending",
    nullable: true,
  })
  orderStatus!: OrderStatus;

  @Column({ type: "varchar", name: "payment_method" })
  paymentMethod!: PaymentMethod;

  @Column({
    type: "varchar",
    name: "payment_status",
    default: "pending",
    nullable: true,
  })
  paymentStatus!: PaymentStatus;

  @Column({ type: "text", name: "delivery_address" })
  deliveryAddress!: string;

  @Column({ name: "delivery_city", nullable: true })
  deliveryCity?: string;

  @Column({ name: "delivery_state", nullable: true })
  deliveryState?: string;

  @Column({ name: "delivery_postal_code", nullable: true })
  deliveryPostalCode?: string;

  @Column({ name: "delivery_phone", nullable: true })
  deliveryPhone!: string;

  @Column({ type: "text", name: "delivery_notes", nullable: true })
  deliveryNotes?: string;

  @Column({ type: "uuid", name: "rider_id", nullable: true })
  riderId?: string | null;

  @Column({
    type: "timestamp",
    name: "estimated_delivery_date",
    nullable: true,
  })
  estimatedDeliveryDate?: Date;

  @Column({ type: "timestamp", name: "delivered_at", nullable: true })
  deliveredAt?: Date;

  @Column({ type: "timestamp", name: "cancelled_at", nullable: true })
  cancelledAt?: Date;

  @Column({ type: "text", name: "cancellation_reason", nullable: true })
  cancellationReason?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @ManyToOne(() => Customer, (customer) => customer.orders)
  @JoinColumn({ name: "customer_id" })
  customer!: Customer;

  @ManyToOne(() => Rider, (rider) => rider.deliveries)
  @JoinColumn({ name: "rider_id" })
  rider?: Rider;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems?: OrderItem[];
}
