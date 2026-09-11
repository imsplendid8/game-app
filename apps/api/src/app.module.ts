import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSource } from '@/database/data-source';
import { HealthModule } from '@/modules/health/health.module';
import { InstitutionsModule } from '@/modules/institutions/institutions.module';
import { ExperiencesModule } from '@/modules/experiences/experiences.module';
import { ExperienceRunsModule } from '@/modules/experience-runs/experience-runs.module';
import { ChangeLogsModule } from '@/modules/change-logs/change-logs.module';
import { BookingPatternsModule } from '@/modules/booking-patterns/booking-patterns.module';
import { UsersModule } from '@/modules/users/users.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { CrawlerModule } from '@/crawler/crawler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(dataSource.options),
    HealthModule,
    InstitutionsModule,
    ExperiencesModule,
    ExperienceRunsModule,
    ChangeLogsModule,
    BookingPatternsModule,
    UsersModule,
    NotificationsModule,
    AuthModule,
    CrawlerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
