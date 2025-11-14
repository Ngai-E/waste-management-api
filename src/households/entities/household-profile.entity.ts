import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SubscriptionStatus } from '../../common/enums/subscription-status.enum';
import { PickupRequest } from '../../pickups/entities/pickup-request.entity';
import { Rating } from '../../pickups/entities/rating.entity';

@Entity('household_profiles')
export class HouseholdProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.householdProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'household_size', nullable: true })
  householdSize: number;

  @Column('simple-array', { name: 'preferred_pickup_days', nullable: true })
  preferredPickupDays: string[];

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    name: 'subscription_status',
    default: SubscriptionStatus.NONE,
  })
  subscriptionStatus: SubscriptionStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => PickupRequest, (pickup) => pickup.household)
  pickupRequests: PickupRequest[];

  @OneToMany(() => Rating, (rating) => rating.household)
  ratings: Rating[];
}
