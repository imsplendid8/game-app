import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { dataSource } from '@/database/data-source';
import { HealthModule } from '@/modules/health/health.module';
import { InstitutionsModule } from '@/modules/institutions/institutions.module';
import { ExperiencesModule } from '@/modules/experiences/experiences.module';
import { ExperienceRunsModule } from '@/modules/experience-runs/experience-runs.module';
import { ChangeLogsModule } from '@/modules/change-logs/change-logs.module';
import { BookingPatternsModule } from '@/modules/booking-patterns/booking-patterns.module';
import { BookingsModule } from '@/modules/bookings/bookings.module';
import { ReviewsModule } from '@/modules/reviews/reviews.module';
import { UsersModule } from '@/modules/users/users.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { CrawlerModule } from '@/crawler/crawler.module';
import { JobsModule } from '@/modules/jobs/jobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || 'redis_dev_password',
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/withdkis_dev',
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
      autoLoadEntities: true,
    }),
    HealthModule,
    InstitutionsModule,
    ExperiencesModule,
    ExperienceRunsModule,
    ChangeLogsModule,
    BookingPatternsModule,
    BookingsModule,
    ReviewsModule,
    UsersModule,
    NotificationsModule,
    AuthModule,
    CrawlerModule,
    JobsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
