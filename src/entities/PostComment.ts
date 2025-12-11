import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { FashionPost } from './FashionPost';
import { Customer } from './Customer';
import { Vendor } from './Vendor';

@Entity('post_comments')
export class PostComment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'post_id' })
  postId!: string;

  @Column({ name: 'user_id' })
  userId!: string; // Can be Customer ID or Vendor ID

  @Column({ name: 'user_type' })
  userType!: 'customer' | 'vendor'; // Track who commented: customer or vendor

  @Column({ type: 'text' })
  content!: string;

  @Column({ name: 'parent_comment_id', nullable: true })
  parentCommentId?: string; // For reply threads

  @Column({ name: 'is_edited', default: false })
  isEdited!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => FashionPost, post => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post!: FashionPost;

  @ManyToOne(() => PostComment, comment => comment.replies, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_comment_id' })
  parentComment?: PostComment;

  @OneToMany(() => PostComment, comment => comment.parentComment)
  replies?: PostComment[];
}
