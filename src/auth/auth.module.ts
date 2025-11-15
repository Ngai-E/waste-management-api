import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { RefreshJwtStrategy } from './refresh-jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { User } from '../users/entities/user.entity';
import { HouseholdProfile } from '../households/entities/household-profile.entity';
import { PickupAgentProfile } from '../agents/entities/pickup-agent-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, HouseholdProfile, PickupAgentProfile]),
    PassportModule,
    JwtModule.register({}),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshJwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
