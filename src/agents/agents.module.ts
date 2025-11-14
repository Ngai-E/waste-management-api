import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { PickupAgentProfile } from './entities/pickup-agent-profile.entity';
import { PickupRequest } from '../pickups/entities/pickup-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PickupAgentProfile, PickupRequest])],
  controllers: [AgentsController],
  providers: [AgentsService],
  exports: [AgentsService],
})
export class AgentsModule {}
