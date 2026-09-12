import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { MainLayout } from '@/components/layouts/MainLayout';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'reminder' | 'program' | 'review';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'booking' | 'reminder'>('all');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchNotifications = async () => {
      try {
        setIsLoadingData(true);
        setError(null);
        const mockNotifications: Notification[] = [
          {
            id: '1',
            title: '예약 확인',
            message: '과학관 과학 체험 예약이 확정되었습니다. 2024년 9월 16일 오후 2시',
            type: 'booking',
            isRead: false,
            createdAt: '2024-09-10T10:30:00Z',
            actionUrl: '/bookings/1',
            actionLabel: '예약 확인',
          },
          {
            id: '2',
            title: '미리알림',
            message: '내일 미술관 아동 미술 교실이 예정되어 있습니다.',
            type: 'reminder',
            isRead: false,
            createdAt: '2024-09-09T15:00:00Z',
            actionUrl: '/bookings/2',
            actionLabel: '세부정보',
          },
          {
            id: '3',
            title: '신규 프로그램',
            message: '관심 분야에서 새로운 프로그램이 등록되었습니다: 로봇 공학 입문',
            type: 'program',
            isRead: false,
            createdAt: '2024-09-08T14:20:00Z',
            actionUrl: '/experiences/7',
            actionLabel: '보기',
          },
          {
            id: '4',
            title: '리뷰 작성',
            message: '완료된 프로그램에 대한 리뷰를 남겨주세요.',
            type: 'review',
            isRead: true,
            createdAt: '2024-09-07T11:45:00Z',
            actionUrl: '/bookings/4',
            actionLabel: '리뷰 작성',
          },
          {
            id: '5',
            title: '예약 변경',
            message: '팩토리 투어 예약 시간이 변경되었습니다.',
            type: 'booking',
            isRead: true,
            createdAt: '2024-09-05T09:15:00Z',
            actionUrl: '/bookings/3',
            actionLabel: '예약 확인',
          },
        ];
        setNotifications(mockNotifications);
      } catch (err) {
        console.error('알림 로드 실패:', err);
        setError('알림을 불러올 수 없습니다.');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchNotifications();
  }, [isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  const filteredNotifications = notifications.filter((notif) => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !notif.isRead;
    return notif.type === filterType;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const bookingCount = notifications.filter((n) => n.type === 'booking').length;
  const reminderCount = notifications.filter((n) => n.type === 'reminder').length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      console.error('알림 읽음 처리 실패:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    } catch (err) {
      console.error('알림 삭제 실패:', err);
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'booking':
        return 'bg-blue-100 text-blue-800';
      case 'reminder':
        return 'bg-orange-100 text-orange-800';
      case 'program':
        return 'bg-green-100 text-green-800';
      case 'review':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: Notification['type']) => {
    switch (type) {
      case 'booking':
        return '예약';
      case 'reminder':
        return '미리알림';
      case 'program':
        return '신규 프로그램';
      case 'review':
        return '리뷰';
      default:
        return '알림';
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">알림</h1>
          <p className="text-gray-600 mt-2">프로그램과 예약 관련 알림을 확인하세요</p>
        </div>

        {/* Filter Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => setFilterType('all')}
            className={`p-4 rounded-lg transition-all ${
              filterType === 'all'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white border border-gray-200 hover:border-blue-300'
            }`}
          >
            <p className="text-sm font-medium opacity-75">전체</p>
            <p className="text-2xl font-bold mt-1">{notifications.length}</p>
          </button>
          <button
            onClick={() => setFilterType('unread')}
            className={`p-4 rounded-lg transition-all ${
              filterType === 'unread'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white border border-gray-200 hover:border-blue-300'
            }`}
          >
            <p className="text-sm font-medium opacity-75">미읽음</p>
            <p className="text-2xl font-bold mt-1">{unreadCount}</p>
          </button>
          <button
            onClick={() => setFilterType('booking')}
            className={`p-4 rounded-lg transition-all ${
              filterType === 'booking'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white border border-gray-200 hover:border-blue-300'
            }`}
          >
            <p className="text-sm font-medium opacity-75">예약</p>
            <p className="text-2xl font-bold mt-1">{bookingCount}</p>
          </button>
          <button
            onClick={() => setFilterType('reminder')}
            className={`p-4 rounded-lg transition-all ${
              filterType === 'reminder'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white border border-gray-200 hover:border-blue-300'
            }`}
          >
            <p className="text-sm font-medium opacity-75">미리알림</p>
            <p className="text-2xl font-bold mt-1">{reminderCount}</p>
          </button>
        </div>

        {/* Notifications List */}
        {isLoadingData ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">알림을 불러오는 중...</div>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`rounded-lg p-4 transition-all ${
                  notif.isRead
                    ? 'bg-gray-50 border border-gray-200'
                    : 'bg-blue-50 border border-blue-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {notif.isRead ? (
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${getTypeColor(
                          notif.type
                        )}`}
                      >
                        {getTypeLabel(notif.type)}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 mt-3">
                      <p className="text-xs text-gray-500">
                        {new Date(notif.createdAt).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {notif.actionUrl && notif.actionLabel && (
                          <button
                            onClick={() => router.push(notif.actionUrl!)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {notif.actionLabel}
                          </button>
                        )}
                        {!notif.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="p-1 hover:bg-white rounded transition-colors"
                            title="읽음으로 표시"
                          >
                            <FiCheck size={16} className="text-gray-400" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notif.id)}
                          className="p-1 hover:bg-white rounded transition-colors"
                          title="삭제"
                        >
                          <FiTrash2 size={16} className="text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FiBell size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 text-lg">알림이 없습니다</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
