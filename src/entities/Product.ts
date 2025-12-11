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
import { Vendor } from "./Vendor";
import { Category } from "./Category";
import { Cart } from "./Cart";
import { Wishlist } from "./Wishlist";

export type ProductGender = "male" | "female" | "unisex";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    name: "discount_price",
    nullable: true,
  })
  discountPrice?: number;

  @Column({ type: "integer", name: "stock_quantity", default: 0 })
  stockQuantity!: number;

  @Column({
    name: "images",
    type: "text",
    array: true,
    nullable: true,
  })
  images?: string[];

  @Column({
    name: "image_public_ids",
    type: "text",
    array: true,
    nullable: true,
  })
  imagePublicIds?: string[]; // Store Cloudinary public IDs

  @Column({ type: "varchar", nullable: true })
  gender?: ProductGender;

  @Column({ type: "varchar", default: "adult" })
  ageCategory?: "adult" | "children";

  @Column({ type: "text", array: true, nullable: true })
  sizes?: string[];

  @Column({ type: "text", array: true, nullable: true })
  colors?: string[];

  @Column({ name: "is_active", default: true })
  isActive!: boolean;

  @Column({ name: "is_approved", default: false })
  isApproved!: boolean;

  @Column({ name: "is_featured", default: false, nullable: true })
  isFeatured?: boolean;

  @Column({
    type: "decimal",
    precision: 3,
    scale: 2,
    nullable: true,
    default: 0,
  })
  rating?: number;

  @Column({
    type: "integer",
    name: "total_reviews",
    default: 0,
    nullable: true,
  })
  totalReviews?: number;

  @Column({ type: "integer", name: "total_sales", default: 0, nullable: true })
  totalSales?: number;

  @Column({ name: "category_id", nullable: true })
  categoryId?: string;

  @Column({ name: "vendor_id", nullable: true })
  vendorId!: string;

  // Made-in-Nigeria & Regional Support
  @Column({ name: "made_in_nigeria", default: false })
  madeInNigeria!: boolean;

  @Column({ name: "origin_state", nullable: true })
  originState?: string; // e.g., "Akwa Ibom", "Lagos", "Abuja"

  @Column({ name: "origin_city", nullable: true })
  originCity?: string;

  @Column({ name: "styles_tags", type: "text", array: true, nullable: true })
  stylesTags?: string[]; // e.g., ["streetwear", "luxury", "traditional"]

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: "category_id" })
  category?: Category;

  @ManyToOne(() => Vendor, (vendor) => vendor.products)
  @JoinColumn({ name: "vendor_id" })
  vendor!: Vendor;

  @OneToMany(() => Cart, (cart) => cart.product)
  cartItems?: Cart[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.product)
  wishlistItems?: Wishlist[];
}
