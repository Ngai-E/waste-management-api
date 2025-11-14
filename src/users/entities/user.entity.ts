import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '../../common/enums/role.enum';
import { HouseholdProfile } from '../../households/entities/household-profile.entity';
import { PickupAgentProfile } from '../../agents/entities/pickup-agent-profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ unique: true })
  phone: string;

  @Column({ name: 'password_hash' })
  @Exclude()
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.HOUSEHOLD,
  })
  role: Role;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  quarter: string;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'refresh_token', nullable: true })
  @Exclude()
  refreshToken: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => HouseholdProfile, (profile) => profile.user)
  householdProfile: HouseholdProfile;

  @OneToOne(() => PickupAgentProfile, (profile) => profile.user)
  agentProfile: PickupAgentProfile;
}
