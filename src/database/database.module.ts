import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { HouseholdProfile } from '../households/entities/household-profile.entity';
import { PickupAgentProfile } from '../agents/entities/pickup-agent-profile.entity';
import { PickupRequest } from '../pickups/entities/pickup-request.entity';
import { Rating } from '../pickups/entities/rating.entity';
import { CommunityBin } from '../bins/entities/community-bin.entity';
import { Alert } from '../alerts/entities/alert.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { EducationalContent } from '../education/entities/educational-content.entity';
import { Survey } from '../surveys/entities/survey.entity';
import { SurveyResponse } from '../surveys/entities/survey-response.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [
          User,
          HouseholdProfile,
          PickupAgentProfile,
          PickupRequest,
          Rating,
          CommunityBin,
          Alert,
          Subscription,
          EducationalContent,
          Survey,
          SurveyResponse,
        ],
        synchronize: configService.get('nodeEnv') === 'development',
        logging: configService.get('nodeEnv') === 'development',
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        migrationsRun: false,
        ssl: configService.get('nodeEnv') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),
  ],
})
export class DatabaseModule {}
