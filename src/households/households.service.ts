import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HouseholdProfile } from './entities/household-profile.entity';
import { PickupRequest } from '../pickups/entities/pickup-request.entity';

@Injectable()
export class HouseholdsService {
  constructor(
    @InjectRepository(HouseholdProfile)
    private householdRepository: Repository<HouseholdProfile>,
    @InjectRepository(PickupRequest)
    private pickupRepository: Repository<PickupRequest>,
  ) {}

  async findByUserId(userId: string): Promise<HouseholdProfile> {
    const household = await this.householdRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!household) {
      throw new NotFoundException('Household profile not found');
    }

    return household;
  }

  async update(userId: string, updateData: Partial<HouseholdProfile>): Promise<HouseholdProfile> {
    const household = await this.findByUserId(userId);
    Object.assign(household, updateData);
    return this.householdRepository.save(household);
  }

  async getStats(userId: string) {
    const household = await this.findByUserId(userId);

    const totalPickups = await this.pickupRepository.count({
      where: { householdId: household.id },
    });

    const completedPickups = await this.pickupRepository.count({
      where: { householdId: household.id, status: 'COMPLETED' as any },
    });

    return {
      totalPickups,
      completedPickups,
      subscriptionStatus: household.subscriptionStatus,
    };
  }
}
