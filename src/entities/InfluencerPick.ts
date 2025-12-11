import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type PickStatus = 'draft' | 'published' | 'archived';

@Entity('influencer_picks')
export class InfluencerPick {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string; // e.g., "Uyai's Top 5 Streetwear Picks"

  @Column({ name: 'influencer_name' })
  influencerName!: string;

  @Column({ name: 'influencer_image', nullable: true })
  influencerImage?: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'jsonb' })
  productIds!: string[]; // Array of product IDs featured

  @Column({ name: 'banner_image', nullable: true })
  bannerImage?: string;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[]; // e.g., 'streetwear', 'luxury', 'casual'

  @Column({ type: 'enum', enum: ['draft', 'published', 'archived'], default: 'draft' })
  status!: PickStatus;

  @Column({ name: 'is_featured', default: false })
  isFeatured!: boolean; // For homepage feature

  @Column({ name: 'publish_date', type: 'timestamp', nullable: true })
  publishDate?: Date;

  @Column({ name: 'expire_date', type: 'timestamp', nullable: true })
  expireDate?: Date; // For weekly rotation

  @Column({ type: 'integer', name: 'view_count', default: 0 })
  viewCount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
