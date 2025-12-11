import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Rider } from './Rider';
import { Order } from './Order';

@Entity('rider_location_history')
export class RiderLocationHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'rider_id' })
  riderId!: string;

  @ManyToOne(() => Rider)
  @JoinColumn({ name: 'rider_id' })
  rider!: Rider;

  @Column({ name: 'order_id', nullable: true })
  orderId?: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order?: Order;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude!: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  accuracy?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  speed?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  heading?: number;

  @CreateDateColumn({ name: 'recorded_at' })
  recordedAt!: Date;
}
