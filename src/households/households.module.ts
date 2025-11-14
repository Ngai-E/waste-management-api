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
