import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CommunityBin } from '../../bins/entities/community-bin.entity';
import { AlertType } from '../../common/enums/alert-type.enum';
import { AlertStatus } from '../../common/enums/alert-status.enum';

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ name: 'created_by_id' })
  createdById: string;

  @Column({
    type: 'enum',
    enum: AlertType,
  })
  type: AlertType;

  @Column({
    type: 'enum',
    enum: AlertStatus,
    default: AlertStatus.OPEN,
  })
  status: AlertStatus;

  @ManyToOne(() => CommunityBin, (bin) => bin.alerts, { nullable: true })
  @JoinColumn({ name: 'bin_id' })
  bin: CommunityBin;

  @Column({ name: 'bin_id', nullable: true })
  binId: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'photo_url', nullable: true })
  photoUrl: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, name: 'gps_lat', nullable: true })
  gpsLat: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, name: 'gps_lng', nullable: true })
  gpsLng: number;

  @Column({ type: 'text', name: 'resolution_notes', nullable: true })
  resolutionNotes: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'resolved_by_id' })
  resolvedBy: User;

  @Column({ name: 'resolved_by_id', nullable: true })
  resolvedById: string;

  @Column({ type: 'timestamp', name: 'resolved_at', nullable: true })
  resolvedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
