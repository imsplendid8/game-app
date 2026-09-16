import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { apiClient } from '@/lib/api';
import { MainLayout } from '@/components/layouts/MainLayout';
import { FiCalendar, FiBell, FiBookmark, FiTrendingUp } from 'react-icons/fi';

interface Booking {
  id: string;
  confirmationNumber: string;
  status: string;
  createdAt: string;
  selectedChildren: Array<{ id: string; name: string; age: number }>;
  totalPrice?: number;
  experience?: {
    id: string;
    programName: string;
    institution: { institutionName: string };
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead?: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { bookmarks, hydrate } = useBookmarkStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    upcomingBookings: 0,
    unreadNotifications: 0,
    savedPrograms: 0,
    trendingPrograms: 0,
  });
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchDashboardData = async () => {
      try {
        setIsLoadingData(true);
        hydrate();

        // Fetch bookings
        const bookingsData = await apiClient.getBookings();
        const bookingsList = Array.isArray(bookingsData) ? bookingsData : bookingsData.data || [];
        setBookings(bookingsList.slice(0, 3)); // Show first 3 bookings

        // Fetch notifications
        const notifications = await apiClient.getNotifications();
        const unreadCount = Array.isArray(notifications)
          ? notifications.filter((n: Notification) => !n.isRead).length
          : 0;

        setStats({
          upcomingBookings: bookingsList.filter((b: Booking) => b.status === 'PENDING' || b.status === 'CONFIRMED').length,
          unreadNotifications: unreadCount,
          savedPrograms: bookmarks.length,
          trendingPrograms: 0,
        });
      } catch (err) {
        console.error('대시보드 데이터 로드 실패:', err);
        // 데모용 Mock 데이터
        const mockBookings: Booking[] = [
          {
            id: '1',
            confirmationNumber: 'BK-2026-001',
            status: 'CONFIRMED',
            createdAt: new Date().toISOString(),
            selectedChildren: [{ id: '1', name: '김민준', age: 7 }],
            totalPrice: 50000,
            experience: {
              id: '1',
              programName: '아이 과학 체험 교실',
              institution: { institutionName: 'DKIS 과학관' },
            },
          },
          {
            id: '2',
            confirmationNumber: 'BK-2026-002',
            status: 'CONFIRMED',
            createdAt: new Date().toISOString(),
            selectedChildren: [{ id: '1', name: '김민준', age: 7 }, { id: '2', name: '김은지', age: 5 }],
            totalPrice: 70000,
            experience: {
              id: '2',
              programName: '역사 탐방 프로그램',
              institution: { institutionName: 'DKIS 박물관' },
            },
          },
          {
            id: '3',
            confirmationNumber: 'BK-2026-003',
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            selectedChildren: [{ id: '1', name: '김민준', age: 7 }],
            totalPrice: 45000,
            experience: {
              id: '3',
              programName: '미술 창작 워크숍',
              institution: { institutionName: 'DKIS 미술관' },
            },
          },
        ];
        setBookings(mockBookings);
        setStats({
          upcomingBookings: 2,
          unreadNotifications: 3,
          savedPrograms: bookmarks.length,
          trendingPrograms: 5,
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, hydrate, bookmarks.length]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            안녕하세요, {user?.profileName || user?.email}! 👋
          </h1>
          <p className="text-blue-100">
            아이들의 다음 경험을 찾아보세요
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Upcoming Bookings */}
          <button
            onClick={() => router.push('/bookings')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">예정된 예약</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.upcomingBookings}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FiCalendar className="text-blue-600" size={24} />
              </div>
            </div>
          </button>

          {/* Notifications */}
          <button
            onClick={() => router.push('/notifications')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">새 알림</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.unreadNotifications}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <FiBell className="text-orange-600" size={24} />
              </div>
            </div>
          </button>

          {/* Saved Programs */}
          <button
            onClick={() => router.push('/experiences/saved')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">저장된 프로그램</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.savedPrograms}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FiBookmark className="text-green-600" size={24} />
              </div>
            </div>
          </button>

          {/* Trending */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">인기 프로그램</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.trendingPrograms}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <FiTrendingUp className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Bookings Section */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">예정된 예약</h2>
              {bookings.length > 0 && (
                <button
                  onClick={() => router.push('/bookings')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  모두 보기
                </button>
              )}
            </div>
            {isLoadingData ? (
              <div className="text-center py-8 text-gray-600">로딩 중...</div>
            ) : bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const statusMap: Record<string, { bg: string; text: string; label: string }> = {
                    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '대기 중' },
                    CONFIRMED: { bg: 'bg-green-100', text: 'text-green-800', label: '확인됨' },
                    COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-800', label: '완료' },
                    CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: '취소' },
                  };
                  const status = statusMap[booking.status] || statusMap.PENDING;
                  return (
                    <div
                      key={booking.id}
                      onClick={() => router.push(`/bookings/${booking.id}`)}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {booking.experience?.programName || '프로그램'}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${status.bg} ${status.text}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        📅 {new Date(booking.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                      <p className="text-sm text-gray-600">
                        👥 {booking.selectedChildren.length}명 • 💰 {booking.totalPrice?.toLocaleString()}원
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">예약이 없습니다.</p>
                <button
                  onClick={() => router.push('/experiences')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  프로그램 둘러보기
                </button>
              </div>
            )}
          </div>

          {/* Recommendations Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">추천 프로그램</h2>
            <div className="space-y-3">
              <div className="text-center py-4 text-gray-600 text-sm">
                <p className="mb-3">프로그램을 찾아보세요</p>
                <button
                  onClick={() => router.push('/experiences')}
                  className="w-full px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                >
                  프로그램 둘러보기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
