import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Customer } from "./Customer";
import { Vendor } from "./Vendor";
import { Rider } from "./Rider";

@Entity("payment_methods")
export class PaymentMethod {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Entity reference (customer, vendor, or rider)
  @Column({ name: "owner_id" })
  ownerId!: string;

  @Column({ name: "owner_type" })
  ownerType!: "customer" | "vendor" | "rider";

  @Column({ name: "authorization_code" })
  authorizationCode!: string;

  @Column({ name: "card_type" })
  cardType!: string;

  @Column({ name: "last4" })
  last4!: string;

  @Column({ name: "exp_month" })
  expMonth!: string;

  @Column({ name: "exp_year" })
  expYear!: string;

  @Column()
  bank!: string;

  @Column({ name: "country_code" })
  countryCode!: string;

  @Column()
  brand!: string;

  @Column({ name: "is_default", default: false })
  isDefault!: boolean;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  // Optional relations for easier querying
  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: "owner_id", referencedColumnName: "id" })
  customer?: Customer;

  @ManyToOne(() => Vendor, { nullable: true })
  @JoinColumn({ name: "owner_id", referencedColumnName: "id" })
  vendor?: Vendor;

  @ManyToOne(() => Rider, { nullable: true })
  @JoinColumn({ name: "owner_id", referencedColumnName: "id" })
  rider?: Rider;
}
