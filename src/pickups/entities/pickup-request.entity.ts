import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { HouseholdProfile } from '../../households/entities/household-profile.entity';
import { PickupAgentProfile } from '../../agents/entities/pickup-agent-profile.entity';
import { CommunityBin } from '../../bins/entities/community-bin.entity';
import { PickupStatus } from '../../common/enums/pickup-status.enum';
import { Rating } from './rating.entity';

@Entity('pickup_requests')
export class PickupRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => HouseholdProfile, (household) => household.pickupRequests)
  @JoinColumn({ name: 'household_id' })
  household: HouseholdProfile;

  @Column({ name: 'household_id' })
  householdId: string;

  @ManyToOne(() => PickupAgentProfile, (agent) => agent.pickupRequests, { nullable: true })
  @JoinColumn({ name: 'agent_id' })
  agent: PickupAgentProfile;

  @Column({ name: 'agent_id', nullable: true })
  agentId: string;

  @Column({
    type: 'enum',
    enum: PickupStatus,
    default: PickupStatus.REQUESTED,
  })
  status: PickupStatus;

  @Column({ type: 'date', name: 'scheduled_date' })
  scheduledDate: Date;

  @Column({ name: 'time_window' })
  timeWindow: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'waste_type', default: 'MIXED' })
  wasteType: string;

  @Column({ name: 'photo_proof_url', nullable: true })
  photoProofUrl: string;

  @Column({ name: 'tracking_label', nullable: true })
  trackingLabel: string;

  @ManyToOne(() => CommunityBin, { nullable: true })
  @JoinColumn({ name: 'bin_id' })
  bin: CommunityBin;

  @Column({ name: 'bin_id', nullable: true })
  binId: string;

  @Column({ type: 'timestamp', name: 'completed_at', nullable: true })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => Rating, (rating) => rating.pickup)
  rating: Rating;
}
