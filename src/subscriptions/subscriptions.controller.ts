import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.HOUSEHOLD)
  @ApiOperation({ summary: 'Get subscriptions' })
  async findAll(@Query('householdId') householdId?: string) {
    return this.subscriptionsService.findAll(householdId);
  }

  @Get('me')
  @Roles(Role.HOUSEHOLD)
  @ApiOperation({ summary: 'Get my subscriptions (household only)' })
  async getMySubscriptions(@CurrentUser('sub') userId: string) {
    return this.subscriptionsService.findByUserId(userId);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create subscription (Admin only)' })
  async create(@Body() createDto: any) {
    return this.subscriptionsService.create(createDto);
  }
}
