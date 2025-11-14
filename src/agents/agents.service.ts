import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PickupAgentProfile } from './entities/pickup-agent-profile.entity';
import { PickupRequest } from '../pickups/entities/pickup-request.entity';
import { KycStatus } from '../common/enums/kyc-status.enum';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(PickupAgentProfile)
    private agentRepository: Repository<PickupAgentProfile>,
    @InjectRepository(PickupRequest)
    private pickupRepository: Repository<PickupRequest>,
  ) {}

  async findByUserId(userId: string): Promise<PickupAgentProfile> {
    const agent = await this.agentRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!agent) {
      throw new NotFoundException('Agent profile not found');
    }

    return agent;
  }

  async update(userId: string, updateData: Partial<PickupAgentProfile>): Promise<PickupAgentProfile> {
    const agent = await this.findByUserId(userId);
    if (!agent) {
      throw new Error('Agent not found');
    }
    Object.assign(agent, updateData);
    return this.agentRepository.save(agent);
  }

  async updateKycStatus(agentId: string, kycStatus: string): Promise<PickupAgentProfile> {
    await this.agentRepository.update(agentId, { kycStatus });
    const agent = await this.agentRepository.findOne({ where: { id: agentId } });
    if (!agent) {
      throw new Error('Agent not found');
    }
    return agent;
  }

  async getStats(userId: string) {
    const agent = await this.findByUserId(userId);

    const totalPickups = await this.pickupRepository.count({
      where: { agentId: agent.id },
    });

    const completedPickups = await this.pickupRepository.count({
      where: { agentId: agent.id, status: 'COMPLETED' as any },
    });

    return {
      totalPickups,
      completedPickups,
      averageRating: agent.averageRating,
      kycStatus: agent.kycStatus,
    };
  }
}
