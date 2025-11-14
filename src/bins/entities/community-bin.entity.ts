import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CapacityLevel } from '../../common/enums/capacity-level.enum';
import { Alert } from '../../alerts/entities/alert.entity';

@Entity('community_bins')
export class CommunityBin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'location_name' })
  locationName: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, name: 'gps_lat' })
  gpsLat: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, name: 'gps_lng' })
  gpsLng: number;

  @Column({
    type: 'enum',
    enum: CapacityLevel,
    name: 'capacity_level',
    default: CapacityLevel.LOW,
  })
  capacityLevel: CapacityLevel;

  @Column({ type: 'timestamp', name: 'last_emptied_at', nullable: true })
  lastEmptiedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Alert, (alert) => alert.bin)
  alerts: Alert[];
}
