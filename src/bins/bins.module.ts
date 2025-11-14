import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BinsController } from './bins.controller';
import { BinsService } from './bins.service';
import { CommunityBin } from './entities/community-bin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CommunityBin])],
  controllers: [BinsController],
  providers: [BinsService],
  exports: [BinsService],
})
export class BinsModule {}
