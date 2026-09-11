import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';
import { NotificationDeliveryService } from './notification-delivery.service';
import { NotificationsController } from './notifications.controller';
import { NotificationDeliveryController } from './notification-delivery.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), UsersModule],
  providers: [NotificationsService, NotificationDeliveryService],
  controllers: [NotificationsController, NotificationDeliveryController],
  exports: [NotificationsService, NotificationDeliveryService],
})
export class NotificationsModule {}
