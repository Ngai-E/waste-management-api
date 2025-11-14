import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Statistics')
@Controller('stats')
@UseGuards(JwtAuthGuard)
@Roles(Role.ADMIN, Role.HYSACAM, Role.COUNCIL)
@ApiBearerAuth()
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get platform overview statistics' })
  async getOverview() {
    return this.statsService.getOverview();
  }

  @Get('pickups')
  @ApiOperation({ summary: 'Get pickup statistics' })
  async getPickupStats(@Query('from') from?: string, @Query('to') to?: string) {
    return this.statsService.getPickupStats(from, to);
  }

  @Get('agents/performance')
  @ApiOperation({ summary: 'Get agent performance statistics' })
  async getAgentPerformance() {
    return this.statsService.getAgentPerformance();
  }
}
