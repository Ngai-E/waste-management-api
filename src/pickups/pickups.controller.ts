import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PickupsService } from './pickups.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Pickups')
@Controller('pickups')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PickupsController {
  constructor(private readonly pickupsService: PickupsService) {}

  @Post()
  @Roles(Role.HOUSEHOLD)
  @ApiOperation({ summary: 'Create pickup request (Household)' })
  async create(@CurrentUser('sub') userId: string, @Body() createDto: any) {
    return this.pickupsService.create(userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pickups' })
  @ApiQuery({ name: 'scope', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: Role,
    @Query('scope') scope?: string,
    @Query('status') status?: string,
  ) {
    return this.pickupsService.findAll(userId, userRole, scope, status);
  }

  @Get('available')
  @Roles(Role.AGENT)
  @ApiOperation({ summary: 'Get available pickups (Agent)' })
  async findAvailable() {
    return this.pickupsService.findAvailable();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pickup by ID' })
  async findOne(@Param('id') id: string) {
    return this.pickupsService.findOne(id);
  }

  @Patch(':id/accept')
  @Roles(Role.AGENT)
  @ApiOperation({ summary: 'Accept pickup request (Agent)' })
  async accept(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.pickupsService.acceptPickup(id, userId);
  }

  @Patch(':id/start')
  @Roles(Role.AGENT)
  @ApiOperation({ summary: 'Start pickup (Agent)' })
  async start(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.pickupsService.startPickup(id, userId);
  }

  @Patch(':id/complete')
  @Roles(Role.AGENT)
  @ApiOperation({ summary: 'Complete pickup (Agent)' })
  async complete(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() completeDto: any,
  ) {
    return this.pickupsService.completePickup(id, userId, completeDto);
  }

  @Patch(':id/cancel')
  @Roles(Role.HOUSEHOLD)
  @ApiOperation({ summary: 'Cancel pickup (Household)' })
  async cancel(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.pickupsService.cancelPickup(id, userId);
  }

  @Post(':id/rating')
  @Roles(Role.HOUSEHOLD)
  @ApiOperation({ summary: 'Rate completed pickup (Household)' })
  async rate(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() ratingDto: any,
  ) {
    return this.pickupsService.ratePickup(id, userId, ratingDto);
  }
}
