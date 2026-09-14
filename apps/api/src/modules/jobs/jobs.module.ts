import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrawlerProcessor } from './processors/crawler.processor';
import { NotificationDeliveryProcessor } from './processors/notification-delivery.processor';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { CrawlHistory } from '@/modules/crawler/entities/crawl-history.entity';
import { Notification } from '@/modules/notifications/entities/notification.entity';
import { CrawlerModule } from '@/crawler/crawler.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'crawler' },
      { name: 'notification-delivery' },
    ),
    TypeOrmModule.forFeature([CrawlHistory, Notification]),
    CrawlerModule,
    NotificationsModule,
  ],
  controllers: [JobsController],
  providers: [JobsService, CrawlerProcessor, NotificationDeliveryProcessor],
})
export class JobsModule {}
