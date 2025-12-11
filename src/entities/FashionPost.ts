import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Vendor } from './Vendor';
import { Product } from './Product';
import { PostLike } from './PostLike';
import { PostComment } from './PostComment';

export type PostType = 'image' | 'video' | 'carousel' | 'styling_tip';

@Entity('fashion_posts')
export class FashionPost {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'vendor_id' })
  vendorId!: string;

  @Column({ type: 'text' })
  caption!: string;

  @Column({ type: 'enum', enum: ['image', 'video', 'carousel', 'styling_tip'], default: 'image' })
  postType!: PostType;

  @Column({ type: 'jsonb' })
  media!: string[]; // Array of media URLs (images/videos from Cloudinary)

  @Column({ name: 'product_id', nullable: true })
  productId?: string; // Optional link to a product

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[]; // Hashtags like #streetwear #lagos

  @Column({ type: 'integer', name: 'like_count', default: 0 })
  likeCount!: number;

  @Column({ type: 'integer', name: 'comment_count', default: 0 })
  commentCount!: number;

  @Column({ type: 'integer', name: 'view_count', default: 0 })
  viewCount!: number;

  @Column({ type: 'integer', name: 'share_count', default: 0 })
  shareCount!: number;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'is_featured', default: false })
  isFeatured!: boolean; // For "Featured Content" section

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor!: Vendor;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: 'product_id' })
  product?: Product;

  @OneToMany(() => PostLike, like => like.post)
  likes?: PostLike[];

  @OneToMany(() => PostComment, comment => comment.post)
  comments?: PostComment[];
}
