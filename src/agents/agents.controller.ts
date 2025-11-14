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
