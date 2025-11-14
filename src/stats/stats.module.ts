import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { PickupRequest } from '../pickups/entities/pickup-request.entity';
import { Alert } from '../alerts/entities/alert.entity';
import { User } from '../users/entities/user.entity';
import { PickupAgentProfile } from '../agents/entities/pickup-agent-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PickupRequest, Alert, User, PickupAgentProfile])],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
