import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HouseholdsModule } from './households/households.module';
import { AgentsModule } from './agents/agents.module';
import { PickupsModule } from './pickups/pickups.module';
import { AlertsModule } from './alerts/alerts.module';
import { BinsModule } from './bins/bins.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { EducationModule } from './education/education.module';
import { SurveysModule } from './surveys/surveys.module';
import { StatsModule } from './stats/stats.module';
import { NotificationsModule } from './notifications/notifications.module';
import { FilesModule } from './files/files.module';
import { HealthModule } from './health/health.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    HouseholdsModule,
    AgentsModule,
    PickupsModule,
    AlertsModule,
    BinsModule,
    SubscriptionsModule,
    EducationModule,
    SurveysModule,
    StatsModule,
    NotificationsModule,
    FilesModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
