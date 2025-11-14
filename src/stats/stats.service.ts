import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PickupRequest } from '../pickups/entities/pickup-request.entity';
import { Alert } from '../alerts/entities/alert.entity';
import { User } from '../users/entities/user.entity';
import { PickupAgentProfile } from '../agents/entities/pickup-agent-profile.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(PickupRequest)
    private pickupRepository: Repository<PickupRequest>,
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PickupAgentProfile)
    private agentRepository: Repository<PickupAgentProfile>,
  ) {}

  async getOverview() {
    const [totalPickups, completedPickups, totalAlerts, totalUsers, totalAgents] =
      await Promise.all([
        this.pickupRepository.count(),
        this.pickupRepository.count({ where: { status: 'COMPLETED' as any } }),
        this.alertRepository.count(),
        this.userRepository.count({ where: { role: 'HOUSEHOLD' as any } }),
        this.agentRepository.count(),
      ]);

    return {
      totalPickups,
      completedPickups,
      totalAlerts,
      totalUsers,
      totalAgents,
    };
  }

  async getPickupStats(from?: string, to?: string) {
    const queryBuilder = this.pickupRepository.createQueryBuilder('pickup');

    if (from) {
      queryBuilder.andWhere('pickup.createdAt >= :from', { from });
    }
    if (to) {
      queryBuilder.andWhere('pickup.createdAt <= :to', { to });
    }

    const pickups = await queryBuilder.getMany();

    const byStatus = pickups.reduce((acc, pickup) => {
      acc[pickup.status] = (acc[pickup.status] || 0) + 1;
      return acc;
    }, {});

    return {
      total: pickups.length,
      byStatus,
    };
  }

  async getAgentPerformance() {
    const agents = await this.agentRepository.find({
      relations: ['user'],
      order: { averageRating: 'DESC' },
      take: 10,
    });

    return agents.map((agent) => ({
      id: agent.id,
      name: agent.user?.name,
      averageRating: agent.averageRating,
      totalCompletedPickups: agent.totalCompletedPickups,
    }));
  }
}
