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
