import { Controller, Get, Put, Body, UseGuards, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateKycStatusDto } from './dto/update-kyc-status.dto';
import { UploadKycDocumentsDto } from './dto/upload-kyc-documents.dto';

@ApiTags('Agents')
@Controller('agents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all agents (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all agents' })
  async getAllAgents() {
    return this.agentsService.findAll();
  }

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

  @Post('me/kyc-documents')
  @Roles(Role.AGENT)
  @ApiOperation({ summary: 'Upload KYC documents (Agent)' })
  @ApiResponse({ status: 200, description: 'Documents uploaded successfully' })
  async uploadMyKycDocuments(
    @CurrentUser('sub') userId: string,
    @Body() documentsDto: UploadKycDocumentsDto,
  ) {
    return this.agentsService.uploadKycDocuments(userId, documentsDto);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new agent (Admin only)' })
  @ApiResponse({ status: 201, description: 'Agent created successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async createAgent(@Body() createDto: CreateAgentDto) {
    const result = await this.agentsService.create(createDto);
    return {
      message: 'Agent created successfully',
      agent: {
        id: result.agent.id,
        userId: result.user.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone,
        kycStatus: result.agent.kycStatus,
      },
    };
  }

  @Patch(':id/kyc')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update agent KYC status with optional rejection reason (Admin only)' })
  @ApiResponse({ status: 200, description: 'KYC status updated successfully' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async updateKycStatus(
    @Param('id') agentId: string,
    @Body() updateDto: UpdateKycStatusDto,
  ) {
    return this.agentsService.updateKycStatus(agentId, updateDto.kycStatus, updateDto.rejectionReason);
  }

  @Post(':id/kyc-documents')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Upload KYC documents for an agent (Admin only)' })
  @ApiResponse({ status: 200, description: 'Documents uploaded successfully' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async uploadAgentKycDocuments(
    @Param('id') agentId: string,
    @Body() documentsDto: UploadKycDocumentsDto,
  ) {
    const agent = await this.agentsService.findAll();
    const targetAgent = agent.find(a => a.id === agentId);
    if (!targetAgent) {
      throw new Error('Agent not found');
    }
    return this.agentsService.uploadKycDocuments(targetAgent.userId, documentsDto);
  }
}
