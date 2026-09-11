import { Controller, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationDeliveryService } from './notification-delivery.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Notification Delivery')
@Controller('api/notifications/delivery')
export class NotificationDeliveryController {
  constructor(private deliveryService: NotificationDeliveryService) {}

  @Post('send-pending')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send all pending (unsent) notifications' })
  async sendPendingNotifications(
    @Query('limit') limit: number = 100,
  ): Promise<{ deliveredCount: number }> {
    const deliveredCount = await this.deliveryService.deliverUnsendNotifications(limit);
    return { deliveredCount };
  }

  @Post('send-urgent/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send urgent notifications to user' })
  async sendUrgentToUser(
    @Param('userId') userId: string,
  ): Promise<{ sentCount: number }> {
    const sentCount = await this.deliveryService.sendUrgentNotifications(userId);
    return { sentCount };
  }
}
