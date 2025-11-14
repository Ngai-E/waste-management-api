import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { PickupRequest } from './pickup-request.entity';
import { HouseholdProfile } from '../../households/entities/household-profile.entity';
import { PickupAgentProfile } from '../../agents/entities/pickup-agent-profile.entity';

@Entity('ratings')
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => PickupRequest, (pickup) => pickup.rating)
  @JoinColumn({ name: 'pickup_id' })
  pickup: PickupRequest;

  @Column({ name: 'pickup_id' })
  pickupId: string;

  @ManyToOne(() => HouseholdProfile, (household) => household.ratings)
  @JoinColumn({ name: 'household_id' })
  household: HouseholdProfile;

  @Column({ name: 'household_id' })
  householdId: string;

  @ManyToOne(() => PickupAgentProfile, (agent) => agent.ratings)
  @JoinColumn({ name: 'agent_id' })
  agent: PickupAgentProfile;

  @Column({ name: 'agent_id' })
  agentId: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
