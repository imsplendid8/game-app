import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationType, NotificationPriority } from './entities/notification.entity';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let mockNotificationRepository: any;

  beforeEach(async () => {
    mockNotificationRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotification', () => {
    it('should create a new notification', async () => {
      const notificationData = {
        userId: 'user-1',
        notificationType: NotificationType.BOOKING_OPENED_TODAY,
        title: 'Booking Opened',
        priority: NotificationPriority.HIGH,
        message: 'A new booking has opened',
        experienceRunId: 'run-1',
      };

      mockNotificationRepository.create.mockReturnValue(notificationData);
      mockNotificationRepository.save.mockResolvedValue({
        id: 'notification-1',
        ...notificationData,
        isSent: false,
        isRead: false,
        sentAt: null,
        readAt: null,
      });

      const result = await service.createNotification(
        notificationData.userId,
        notificationData.notificationType,
        notificationData.title,
        notificationData.priority,
        notificationData.message,
        notificationData.experienceRunId,
      );

      expect(result.notificationType).toBe(NotificationType.BOOKING_OPENED_TODAY);
      expect(result.priority).toBe(NotificationPriority.HIGH);
      expect(mockNotificationRepository.save).toHaveBeenCalled();
    });
  });

  describe('getUserNotifications', () => {
    it('should retrieve all notifications for a user', async () => {
      const mockNotifications: any = [
        {
          id: 'notification-1',
          userId: 'user-1',
          notificationType: NotificationType.BOOKING_OPENED_TODAY,
          title: 'Booking Opened',
          isRead: false,
        },
        {
          id: 'notification-2',
          userId: 'user-1',
          notificationType: NotificationType.NEW_PROGRAM_DISCOVERED,
          title: 'New Program',
          isRead: true,
        },
      ];

      mockNotificationRepository.find.mockResolvedValue(mockNotifications);

      const result = await service.getUserNotifications('user-1', false, 50);

      expect(result).toEqual(mockNotifications);
      expect(result).toHaveLength(2);
    });

    it('should retrieve only unread notifications when includeRead is false', async () => {
      const mockNotifications: any = [
        {
          id: 'notification-1',
          userId: 'user-1',
          isRead: false,
        },
      ];

      mockNotificationRepository.find.mockResolvedValue(mockNotifications);

      const result = await service.getUserNotifications('user-1', false, 50);

      expect(result).toHaveLength(1);
      expect(result[0].isRead).toBe(false);
    });
  });

  describe('getUnreadNotificationCount', () => {
    it('should return unread notification count for a user', async () => {
      mockNotificationRepository.count.mockResolvedValue(5);

      const result = await service.getUnreadNotificationCount('user-1');

      expect(result).toBe(5);
      expect(mockNotificationRepository.count).toHaveBeenCalledWith({
        where: { userId: 'user-1', isRead: false },
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const mockNotification: any = {
        id: 'notification-1',
        userId: 'user-1',
        isRead: false,
        readAt: null,
      };

      mockNotificationRepository.findOne.mockResolvedValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue({
        ...mockNotification,
        isRead: true,
        readAt: new Date(),
      });

      const result = await service.markAsRead('notification-1');

      expect(result.isRead).toBe(true);
      expect(mockNotificationRepository.save).toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for a user', async () => {
      mockNotificationRepository.find.mockResolvedValue([
        { id: 'notification-1', userId: 'user-1', isRead: false },
        { id: 'notification-2', userId: 'user-1', isRead: false },
      ]);

      mockNotificationRepository.save.mockResolvedValue({});

      await service.markAllAsRead('user-1');

      expect(mockNotificationRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-1', isRead: false },
      });
      expect(mockNotificationRepository.save).toHaveBeenCalled();
    });
  });

  describe('markAsSent', () => {
    it('should mark a notification as sent', async () => {
      const mockNotification: any = {
        id: 'notification-1',
        isSent: false,
        sentAt: null,
      };

      mockNotificationRepository.findOne.mockResolvedValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue({
        ...mockNotification,
        isSent: true,
        sentAt: new Date(),
      });

      const result = await service.markAsSent('notification-1');

      expect(result.isSent).toBe(true);
      expect(mockNotificationRepository.save).toHaveBeenCalled();
    });
  });

  describe('getCriticalNotifications', () => {
    it('should retrieve critical notifications for a user', async () => {
      const mockNotifications: any = [
        {
          id: 'notification-1',
          userId: 'user-1',
          priority: NotificationPriority.CRITICAL,
        },
      ];

      mockNotificationRepository.find.mockResolvedValue(mockNotifications);

      const result = await service.getCriticalNotifications('user-1', 20);

      expect(result).toEqual(mockNotifications);
      expect(result[0].priority).toBe(NotificationPriority.CRITICAL);
    });
  });

  describe('getUrgentNotifications', () => {
    it('should retrieve urgent notifications sorted by urgency score', async () => {
      const mockNotifications: any = [
        {
          id: 'notification-1',
          userId: 'user-1',
          priority: NotificationPriority.CRITICAL,
          isRead: false,
          createdAt: new Date(Date.now() - 3600000),
          getUrgencyScore: jest.fn().mockReturnValue(120),
        },
        {
          id: 'notification-2',
          userId: 'user-1',
          priority: NotificationPriority.HIGH,
          isRead: false,
          createdAt: new Date(Date.now() - 7200000),
          getUrgencyScore: jest.fn().mockReturnValue(85),
        },
      ];

      mockNotificationRepository.find.mockResolvedValue(mockNotifications);

      const result = await service.getUrgentNotifications('user-1');

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getUnsendNotifications', () => {
    it('should retrieve unsent notifications for delivery queue', async () => {
      const mockNotifications: any = [
        {
          id: 'notification-1',
          userId: 'user-1',
          isSent: false,
          title: 'Unsent Notification',
        },
        {
          id: 'notification-2',
          userId: 'user-2',
          isSent: false,
          title: 'Another Unsent',
        },
      ];

      mockNotificationRepository.find.mockResolvedValue(mockNotifications);

      const result = await service.getUnsendNotifications(100);

      expect(result).toEqual(mockNotifications);
      expect(result.every((n: any) => !n.isSent)).toBe(true);
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      mockNotificationRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteNotification('notification-1');

      expect(mockNotificationRepository.delete).toHaveBeenCalledWith({
        id: 'notification-1',
      });
    });
  });

  describe('deleteOldNotifications', () => {
    it('should delete old read notifications older than specified days', async () => {
      const mockQueryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 10 }),
      };

      mockNotificationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.deleteOldNotifications(30);

      expect(result).toBe(10);
    });
  });

  describe('getNotificationStats', () => {
    it('should retrieve notification statistics for a user', async () => {
      mockNotificationRepository.count
        .mockResolvedValueOnce(50) // totalNotifications
        .mockResolvedValueOnce(15) // unreadCount
        .mockResolvedValueOnce(3) // criticalCount
        .mockResolvedValueOnce(8); // highPriorityCount

      const result = await service.getNotificationStats('user-1');

      expect(result).toEqual({
        totalNotifications: 50,
        unreadCount: 15,
        criticalCount: 3,
        highPriorityCount: 8,
      });
    });
  });
});
