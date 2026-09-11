import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import {
  Notification,
  NotificationType,
  NotificationPriority,
} from './entities/notification.entity';

@ApiTags('Notifications')
@Controller('api/notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  async createNotification(
    @Body()
    body: {
      userId: string;
      notificationType: NotificationType;
      title: string;
      priority: NotificationPriority;
      message?: string;
      experienceRunId?: string;
    },
  ): Promise<Notification> {
    return this.notificationsService.createNotification(
      body.userId,
      body.notificationType,
      body.title,
      body.priority,
      body.message,
      body.experienceRunId,
    );
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get notifications for a user' })
  @ApiQuery({ name: 'includeRead', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUserNotifications(
    @Param('userId') userId: string,
    @Query('includeRead') includeRead: boolean = false,
    @Query('limit') limit: number = 50,
  ): Promise<Notification[]> {
    return this.notificationsService.getUserNotifications(
      userId,
      includeRead,
      limit,
    );
  }

  @Get('user/:userId/unread-count')
  @ApiOperation({ summary: 'Get unread notification count for a user' })
  async getUnreadCount(
    @Param('userId') userId: string,
  ): Promise<{ count: number }> {
    const count = await this.notificationsService.getUnreadNotificationCount(
      userId,
    );
    return { count };
  }

  @Get('user/:userId/critical')
  @ApiOperation({ summary: 'Get critical notifications for a user' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getCriticalNotifications(
    @Param('userId') userId: string,
    @Query('limit') limit: number = 20,
  ): Promise<Notification[]> {
    return this.notificationsService.getCriticalNotifications(userId, limit);
  }

  @Get('user/:userId/urgent')
  @ApiOperation({ summary: 'Get urgent notifications by score' })
  async getUrgentNotifications(
    @Param('userId') userId: string,
  ): Promise<Notification[]> {
    return this.notificationsService.getUrgentNotifications(userId);
  }

  @Get('unsent')
  @ApiOperation({ summary: 'Get all unsent notifications' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUnsendNotifications(
    @Query('limit') limit: number = 100,
  ): Promise<Notification[]> {
    return this.notificationsService.getUnsendNotifications(limit);
  }

  @Get('user/:userId/stats')
  @ApiOperation({ summary: 'Get notification statistics for a user' })
  async getNotificationStats(
    @Param('userId') userId: string,
  ): Promise<{
    totalNotifications: number;
    unreadCount: number;
    criticalCount: number;
    highPriorityCount: number;
  }> {
    return this.notificationsService.getNotificationStats(userId);
  }

  @Put(':notificationId/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(
    @Param('notificationId') notificationId: string,
  ): Promise<Notification> {
    return this.notificationsService.markAsRead(notificationId);
  }

  @Put(':notificationId/sent')
  @ApiOperation({ summary: 'Mark notification as sent' })
  async markAsSent(
    @Param('notificationId') notificationId: string,
  ): Promise<Notification> {
    return this.notificationsService.markAsSent(notificationId);
  }

  @Put('user/:userId/read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for a user' })
  async markAllAsRead(@Param('userId') userId: string): Promise<void> {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':notificationId')
  @ApiOperation({ summary: 'Delete a notification' })
  async deleteNotification(
    @Param('notificationId') notificationId: string,
  ): Promise<void> {
    return this.notificationsService.deleteNotification(notificationId);
  }

  @Delete('cleanup/old')
  @ApiOperation({ summary: 'Delete old read notifications' })
  @ApiQuery({ name: 'olderThanDays', required: false, type: Number })
  async deleteOldNotifications(
    @Query('olderThanDays') olderThanDays: number = 30,
  ): Promise<{ deletedCount: number }> {
    const deletedCount = await this.notificationsService.deleteOldNotifications(
      olderThanDays,
    );
    return { deletedCount };
  }
}
