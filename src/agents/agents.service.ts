import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { PickupAgentProfile } from './entities/pickup-agent-profile.entity';
import { PickupRequest } from '../pickups/entities/pickup-request.entity';
import { User } from '../users/entities/user.entity';
import { KycStatus } from '../common/enums/kyc-status.enum';
import { Role } from '../common/enums/role.enum';
import { CreateAgentDto } from './dto/create-agent.dto';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(PickupAgentProfile)
    private agentRepository: Repository<PickupAgentProfile>,
    @InjectRepository(PickupRequest)
    private pickupRepository: Repository<PickupRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createDto: CreateAgentDto): Promise<{ agent: PickupAgentProfile; user: User }> {
    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: [{ phone: createDto.phone }, { email: createDto.email }],
    });

    if (existingUser) {
      throw new ConflictException('User with this phone or email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(createDto.password, 10);

    // Create user with AGENT role
    const user = this.userRepository.create({
      name: createDto.name,
      email: createDto.email,
      phone: createDto.phone,
      passwordHash,
      address: createDto.address,
      quarter: createDto.quarter,
      role: Role.AGENT,
    });

    await this.userRepository.save(user);

    // Create agent profile with specified or default KYC status
    const agentProfile = this.agentRepository.create({
      userId: user.id,
      kycStatus: createDto.kycStatus || KycStatus.PENDING,
      averageRating: 0,
      totalCompletedPickups: 0,
    });

    await this.agentRepository.save(agentProfile);

    return { agent: agentProfile, user };
  }

  async findAll(): Promise<PickupAgentProfile[]> {
    return this.agentRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

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

  async updateKycStatus(agentId: string, kycStatus: KycStatus, rejectionReason?: string): Promise<PickupAgentProfile> {
    const agent = await this.agentRepository.findOne({ where: { id: agentId }, relations: ['user'] });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    agent.kycStatus = kycStatus;
    
    // Set or clear rejection reason based on status
    if (kycStatus === KycStatus.REJECTED) {
      agent.kycRejectionReason = rejectionReason || 'No reason provided';
    } else if (kycStatus === KycStatus.APPROVED || kycStatus === KycStatus.PENDING) {
      // Clear rejection reason when approved or reset to pending
      await this.agentRepository.update(agentId, { kycRejectionReason: null as any });
    }
    
    return this.agentRepository.save(agent);
  }

  async uploadKycDocuments(userId: string, documents: {
    idDocumentUrl?: string;
    driverLicenseUrl?: string;
    vehicleRegistrationUrl?: string;
  }): Promise<PickupAgentProfile> {
    const agent = await this.findByUserId(userId);
    
    if (documents.idDocumentUrl) {
      agent.idDocumentUrl = documents.idDocumentUrl;
    }
    if (documents.driverLicenseUrl) {
      agent.driverLicenseUrl = documents.driverLicenseUrl;
    }
    if (documents.vehicleRegistrationUrl) {
      agent.vehicleRegistrationUrl = documents.vehicleRegistrationUrl;
    }
    
    // Reset to PENDING when new documents are uploaded
    if (agent.kycStatus === KycStatus.REJECTED) {
      agent.kycStatus = KycStatus.PENDING;
      await this.agentRepository.update(agent.id, { kycRejectionReason: null as any });
    }
    
    return this.agentRepository.save(agent);
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
