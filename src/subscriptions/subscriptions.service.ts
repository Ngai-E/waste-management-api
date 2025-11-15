import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { HouseholdProfile } from '../households/entities/household-profile.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(HouseholdProfile)
    private householdRepository: Repository<HouseholdProfile>,
  ) {}

  async create(createDto: any): Promise<Subscription> {
    // Validate household exists
    if (!createDto.householdId) {
      throw new BadRequestException('householdId is required');
    }

    const household = await this.householdRepository.findOne({
      where: { id: createDto.householdId },
    });

    if (!household) {
      throw new NotFoundException(`Household with ID ${createDto.householdId} not found`);
    }

    const subscription = this.subscriptionRepository.create(createDto);
    const saved = await this.subscriptionRepository.save(subscription);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async findAll(householdId?: string): Promise<Subscription[]> {
    const where: any = {};
    if (householdId) where.householdId = householdId;

    return this.subscriptionRepository.find({
      where,
      relations: ['household'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: string): Promise<Subscription[]> {
    const household = await this.householdRepository.findOne({
      where: { userId },
    });

    if (!household) {
      throw new NotFoundException('Household profile not found');
    }

    return this.subscriptionRepository.find({
      where: { householdId: household.id },
      relations: ['household'],
      order: { createdAt: 'DESC' },
    });
  }
}
