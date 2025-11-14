#!/bin/bash

# Script to generate all remaining NestJS modules for the waste management API
# This creates the complete project structure with all modules, controllers, services, and DTOs

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/src"

echo "🚀 Generating NestJS modules for Waste Management API..."

# Create directory structure
mkdir -p "$BASE_DIR"/{users,households,agents,pickups,alerts,bins,subscriptions,education,surveys,stats,notifications,files,health}/{dto,entities}

echo "📁 Directory structure created"

# Generate Users Module files
cat > "$BASE_DIR/users/users.module.ts" << 'EOF'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
EOF

cat > "$BASE_DIR/users/users.service.ts" << 'EOF'
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(
    paginationDto: PaginationDto,
    role?: Role,
    isActive?: boolean,
  ): Promise<PaginatedResult<User>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;

    const [data, total] = await this.userRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['householdProfile', 'agentProfile'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, updateData);
    return this.findOne(id);
  }

  async updateStatus(id: string, isActive: boolean): Promise<User> {
    await this.userRepository.update(id, { isActive });
    return this.findOne(id);
  }
}
EOF

cat > "$BASE_DIR/users/users.controller.ts" << 'EOF'
import { Controller, Get, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN, Role.HYSACAM, Role.COUNCIL)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiQuery({ name: 'role', required: false, enum: Role })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('role') role?: Role,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.usersService.findAll(paginationDto, role, isActive);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.HYSACAM, Role.COUNCIL)
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user status (Admin only)' })
  async updateStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.usersService.updateStatus(id, isActive);
  }
}
EOF

echo "✅ Users module created"

# Generate Households Module
cat > "$BASE_DIR/households/households.module.ts" << 'EOF'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HouseholdsController } from './households.controller';
import { HouseholdsService } from './households.service';
import { HouseholdProfile } from './entities/household-profile.entity';
import { PickupRequest } from '../pickups/entities/pickup-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HouseholdProfile, PickupRequest])],
  controllers: [HouseholdsController],
  providers: [HouseholdsService],
  exports: [HouseholdsService],
})
export class HouseholdsModule {}
EOF

cat > "$BASE_DIR/households/households.service.ts" << 'EOF'
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
EOF

cat > "$BASE_DIR/households/households.controller.ts" << 'EOF'
import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HouseholdsService } from './households.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Households')
@Controller('households')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HouseholdsController {
  constructor(private readonly householdsService: HouseholdsService) {}

  @Get('me')
  @Roles(Role.HOUSEHOLD)
  @ApiOperation({ summary: 'Get my household profile' })
  async getMyProfile(@CurrentUser('sub') userId: string) {
    return this.householdsService.findByUserId(userId);
  }

  @Put('me')
  @Roles(Role.HOUSEHOLD)
  @ApiOperation({ summary: 'Update my household profile' })
  async updateMyProfile(
    @CurrentUser('sub') userId: string,
    @Body() updateData: any,
  ) {
    return this.householdsService.update(userId, updateData);
  }

  @Get('me/stats')
  @Roles(Role.HOUSEHOLD)
  @ApiOperation({ summary: 'Get my household statistics' })
  async getMyStats(@CurrentUser('sub') userId: string) {
    return this.householdsService.getStats(userId);
  }
}
EOF

echo "✅ Households module created"

# Generate Agents Module
cat > "$BASE_DIR/agents/agents.module.ts" << 'EOF'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { PickupAgentProfile } from './entities/pickup-agent-profile.entity';
import { PickupRequest } from '../pickups/entities/pickup-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PickupAgentProfile, PickupRequest])],
  controllers: [AgentsController],
  providers: [AgentsService],
  exports: [AgentsService],
})
export class AgentsModule {}
EOF

cat > "$BASE_DIR/agents/agents.service.ts" << 'EOF'
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
    Object.assign(agent, updateData);
    return this.agentRepository.save(agent);
  }

  async updateKycStatus(agentId: string, kycStatus: KycStatus): Promise<PickupAgentProfile> {
    await this.agentRepository.update(agentId, { kycStatus });
    const agent = await this.agentRepository.findOne({ where: { id: agentId } });
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
EOF

cat > "$BASE_DIR/agents/agents.controller.ts" << 'EOF'
import { Controller, Get, Put, Body, UseGuards, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { KycStatus } from '../common/enums/kyc-status.enum';

@ApiTags('Agents')
@Controller('agents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get('me')
  @Roles(Role.AGENT)
  @ApiOperation({ summary: 'Get my agent profile' })
  async getMyProfile(@CurrentUser('sub') userId: string) {
    return this.agentsService.findByUserId(userId);
  }

  @Put('me')
  @Roles(Role.AGENT)
  @ApiOperation({ summary: 'Update my agent profile' })
  async updateMyProfile(
    @CurrentUser('sub') userId: string,
    @Body() updateData: any,
  ) {
    return this.agentsService.update(userId, updateData);
  }

  @Get('me/stats')
  @Roles(Role.AGENT)
  @ApiOperation({ summary: 'Get my agent statistics' })
  async getMyStats(@CurrentUser('sub') userId: string) {
    return this.agentsService.getStats(userId);
  }

  @Patch(':id/kyc')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update agent KYC status (Admin only)' })
  async updateKycStatus(
    @Param('id') agentId: string,
    @Body('kycStatus') kycStatus: KycStatus,
  ) {
    return this.agentsService.updateKycStatus(agentId, kycStatus);
  }
}
EOF

echo "✅ Agents module created"

echo "✅ Core modules generated successfully!"
echo "📝 Run 'npm install' to install dependencies"
echo "📝 Then run 'npm run start:dev' to start the development server"
EOF

chmod +x "$BASE_DIR/../generate-modules.sh"

echo "✅ Module generation script created"
