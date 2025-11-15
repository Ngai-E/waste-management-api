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
import { KycStatus } from '../../common/enums/kyc-status.enum';
import { PickupRequest } from '../../pickups/entities/pickup-request.entity';
import { Rating } from '../../pickups/entities/rating.entity';

@Entity('pickup_agent_profiles')
export class PickupAgentProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.agentProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: KycStatus,
    name: 'kyc_status',
    default: KycStatus.PENDING,
  })
  kycStatus: KycStatus;

  @Column({ name: 'id_document_url', nullable: true })
  idDocumentUrl: string;

  @Column({ name: 'driver_license_url', nullable: true })
  driverLicenseUrl: string;

  @Column({ name: 'vehicle_registration_url', nullable: true })
  vehicleRegistrationUrl: string;

  @Column({ name: 'kyc_rejection_reason', nullable: true, type: 'text' })
  kycRejectionReason: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, name: 'average_rating', default: 0 })
  averageRating: number;

  @Column({ name: 'total_completed_pickups', default: 0 })
  totalCompletedPickups: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => PickupRequest, (pickup) => pickup.agent)
  pickupRequests: PickupRequest[];

  @OneToMany(() => Rating, (rating) => rating.agent)
  ratings: Rating[];
}
