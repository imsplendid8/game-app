import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { NotificationDeliveryService } from '@/modules/notifications/notification-delivery.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';

@Processor('notification-delivery')
export class NotificationDeliveryProcessor {
  private readonly logger = new Logger(NotificationDeliveryProcessor.name);

  constructor(
    private notificationDeliveryService: NotificationDeliveryService,
    private notificationsService: NotificationsService,
  ) {}

  @Process('deliver-unsent')
  async handleNotificationDelivery(job: Job) {
    this.logger.log('Starting notification delivery job...');

    try {
      const deliveredCount = await this.notificationDeliveryService.deliverUnsendNotifications(100);
      this.logger.log(`Delivered ${deliveredCount} notifications`);

      job.progress(100);
      return {
        success: true,
        delivered: deliveredCount,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        'Fatal error in notification delivery job:',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  @Process('cleanup-old-notifications')
  async handleOldNotificationCleanup(job: Job) {
    this.logger.log('Starting old notification cleanup job...');

    try {
      const daysOld = 30;
      const deletedCount = await this.notificationsService.deleteOldNotifications(
        daysOld,
      );
      this.logger.log(`Deleted ${deletedCount} old notifications`);

      job.progress(100);
      return {
        success: true,
        deletedCount,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        'Fatal error in notification cleanup job:',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }
}
