import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PickupsController } from './pickups.controller';
import { PickupsService } from './pickups.service';
import { PickupRequest } from './entities/pickup-request.entity';
import { Rating } from './entities/rating.entity';
import { HouseholdProfile } from '../households/entities/household-profile.entity';
import { PickupAgentProfile } from '../agents/entities/pickup-agent-profile.entity';
import { CommunityBin } from '../bins/entities/community-bin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PickupRequest,
      Rating,
      HouseholdProfile,
      PickupAgentProfile,
      CommunityBin,
    ]),
  ],
  controllers: [PickupsController],
  providers: [PickupsService],
  exports: [PickupsService],
})
export class PickupsModule {}
