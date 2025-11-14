import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PickupRequest } from './entities/pickup-request.entity';
import { Rating } from './entities/rating.entity';
import { HouseholdProfile } from '../households/entities/household-profile.entity';
import { PickupAgentProfile } from '../agents/entities/pickup-agent-profile.entity';
import { PickupStatus } from '../common/enums/pickup-status.enum';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class PickupsService {
  constructor(
    @InjectRepository(PickupRequest)
    private pickupRepository: Repository<PickupRequest>,
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    @InjectRepository(HouseholdProfile)
    private householdRepository: Repository<HouseholdProfile>,
    @InjectRepository(PickupAgentProfile)
    private agentRepository: Repository<PickupAgentProfile>,
  ) {}

  async create(userId: string, createDto: any): Promise<PickupRequest> {
    const household = await this.householdRepository.findOne({
      where: { userId },
    });

    if (!household) {
      throw new NotFoundException('Household profile not found');
    }

    const pickup = this.pickupRepository.create({
      householdId: household.id,
      scheduledDate: createDto.scheduledDate,
      timeWindow: createDto.timeWindow,
      notes: createDto.notes,
      wasteType: createDto.wasteType || 'MIXED',
      status: PickupStatus.REQUESTED,
    });

    return this.pickupRepository.save(pickup);
  }

  async findAll(userId: string, userRole: Role, scope?: string) {
    const queryBuilder = this.pickupRepository
      .createQueryBuilder('pickup')
      .leftJoinAndSelect('pickup.household', 'household')
      .leftJoinAndSelect('pickup.agent', 'agent')
      .leftJoinAndSelect('pickup.bin', 'bin')
      .leftJoinAndSelect('household.user', 'householdUser')
      .leftJoinAndSelect('agent.user', 'agentUser');

    if (userRole === Role.HOUSEHOLD) {
      const household = await this.householdRepository.findOne({ where: { userId } });
      if (!household) {
        throw new NotFoundException('Household profile not found');
      }
      queryBuilder.where('pickup.householdId = :householdId', { householdId: household.id });
    } else if (userRole === Role.AGENT) {
      const agent = await this.agentRepository.findOne({ where: { userId } });
      if (!agent) {
        throw new NotFoundException('Agent profile not found');
      }
      if (scope === 'mine') {
        queryBuilder.where('pickup.agentId = :agentId', { agentId: agent.id });
      }
    }

    queryBuilder.orderBy('pickup.scheduledDate', 'DESC');

    return queryBuilder.getMany();
  }

  async findAvailable(): Promise<PickupRequest[]> {
    return this.pickupRepository.find({
      where: { status: PickupStatus.REQUESTED, agentId: null as any },
      relations: ['household', 'household.user'],
      order: { scheduledDate: 'ASC' },
    });
  }

  async findOne(id: string): Promise<PickupRequest> {
    const pickup = await this.pickupRepository.findOne({
      where: { id },
      relations: ['household', 'household.user', 'agent', 'agent.user', 'bin', 'rating'],
    });

    if (!pickup) {
      throw new NotFoundException(`Pickup request with ID ${id} not found`);
    }

    return pickup;
  }

  async acceptPickup(pickupId: string, userId: string): Promise<PickupRequest> {
    const pickup = await this.findOne(pickupId);
    const agent = await this.agentRepository.findOne({ where: { userId } });

    if (!agent) {
      throw new NotFoundException('Agent profile not found');
    }

    if (pickup.status !== PickupStatus.REQUESTED) {
      throw new BadRequestException('Pickup is not available for acceptance');
    }

    pickup.agentId = agent.id;
    pickup.status = PickupStatus.ASSIGNED;

    return this.pickupRepository.save(pickup);
  }

  async startPickup(pickupId: string, userId: string): Promise<PickupRequest> {
    const pickup = await this.findOne(pickupId);
    const agent = await this.agentRepository.findOne({ where: { userId } });

    if (!agent) {
      throw new NotFoundException('Agent profile not found');
    }

    if (pickup.agentId !== agent.id) {
      throw new ForbiddenException('You are not assigned to this pickup');
    }

    if (pickup.status !== PickupStatus.ASSIGNED) {
      throw new BadRequestException('Pickup cannot be started');
    }

    pickup.status = PickupStatus.ON_GOING;
    return this.pickupRepository.save(pickup);
  }

  async completePickup(pickupId: string, userId: string, completeDto: any): Promise<PickupRequest> {
    const pickup = await this.findOne(pickupId);
    const agent = await this.agentRepository.findOne({ where: { userId } });

    if (!agent) {
      throw new NotFoundException('Agent profile not found');
    }

    if (pickup.agentId !== agent.id) {
      throw new ForbiddenException('You are not assigned to this pickup');
    }

    if (pickup.status !== PickupStatus.ON_GOING) {
      throw new BadRequestException('Pickup is not in progress');
    }

    pickup.status = PickupStatus.COMPLETED;
    pickup.completedAt = new Date();
    pickup.photoProofUrl = completeDto.photoProofUrl;
    pickup.binId = completeDto.binId;

    const savedPickup = await this.pickupRepository.save(pickup);

    // Update agent stats
    agent.totalCompletedPickups += 1;
    await this.agentRepository.save(agent);

    return savedPickup;
  }

  async cancelPickup(pickupId: string, userId: string): Promise<PickupRequest> {
    const pickup = await this.findOne(pickupId);
    const household = await this.householdRepository.findOne({ where: { userId } });

    if (!household) {
      throw new NotFoundException('Household profile not found');
    }

    if (pickup.householdId !== household.id) {
      throw new ForbiddenException('You cannot cancel this pickup');
    }

    if (pickup.status === PickupStatus.COMPLETED || pickup.status === PickupStatus.ON_GOING) {
      throw new BadRequestException('Cannot cancel pickup in this state');
    }

    pickup.status = PickupStatus.CANCELED;
    return this.pickupRepository.save(pickup);
  }

  async ratePickup(pickupId: string, userId: string, ratingDto: any): Promise<Rating> {
    const pickup = await this.findOne(pickupId);
    const household = await this.householdRepository.findOne({ where: { userId } });

    if (!household) {
      throw new NotFoundException('Household profile not found');
    }

    if (pickup.householdId !== household.id) {
      throw new ForbiddenException('You cannot rate this pickup');
    }

    if (pickup.status !== PickupStatus.COMPLETED) {
      throw new BadRequestException('Can only rate completed pickups');
    }

    // Check if already rated
    const existingRating = await this.ratingRepository.findOne({
      where: { pickupId },
    });

    if (existingRating) {
      throw new BadRequestException('Pickup already rated');
    }

    const rating = this.ratingRepository.create({
      pickupId,
      householdId: household.id,
      agentId: pickup.agentId,
      rating: ratingDto.rating,
      comment: ratingDto.comment,
    });

    const savedRating = await this.ratingRepository.save(rating);

    // Update agent average rating
    const agent = await this.agentRepository.findOne({
      where: { id: pickup.agentId },
      relations: ['ratings'],
    });

    if (agent) {
      const ratings = await this.ratingRepository.find({
        where: { agentId: agent.id },
      });

      if (ratings.length > 0) {
        const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
        agent.averageRating = Math.round(avgRating * 100) / 100;
        await this.agentRepository.save(agent);
      }
    }

    return savedRating;
  }
}
