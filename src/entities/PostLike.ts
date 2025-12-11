import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { FashionPost } from './FashionPost';
import { Customer } from './Customer';
import { Vendor } from './Vendor';

@Entity('post_likes')
@Unique(['postId', 'userId', 'userType'])
export class PostLike {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'post_id' })
  postId!: string;

  @Column({ name: 'user_id' })
  userId!: string; // Can be Customer ID or Vendor ID

  @Column({ name: 'user_type' })
  userType!: 'customer' | 'vendor'; // Track who liked: customer or vendor

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => FashionPost, post => post.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post!: FashionPost;
}
