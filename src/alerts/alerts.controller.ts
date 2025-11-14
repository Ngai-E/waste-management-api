import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { AlertStatus } from '../common/enums/alert-status.enum';

@ApiTags('Alerts')
@Controller('alerts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  @Roles(Role.HOUSEHOLD, Role.AGENT)
  @ApiOperation({ summary: 'Create alert' })
  async create(@CurrentUser('sub') userId: string, @Body() createDto: any) {
    return this.alertsService.create(userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all alerts' })
  @ApiQuery({ name: 'status', required: false, enum: AlertStatus })
  @ApiQuery({ name: 'type', required: false })
  async findAll(
    @Query('status') status?: AlertStatus,
    @Query('type') type?: string,
  ) {
    return this.alertsService.findAll(status, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get alert by ID' })
  async findOne(@Param('id') id: string) {
    return this.alertsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.HYSACAM, Role.COUNCIL)
  @ApiOperation({ summary: 'Update alert status (Admin/HYSACAM/Council)' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() updateDto: any,
  ) {
    return this.alertsService.updateStatus(id, userId, updateDto);
  }
}
