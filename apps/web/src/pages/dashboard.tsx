import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { MainLayout } from '@/components/layouts/MainLayout';
import { FiCalendar, FiBell, FiBookmark, FiTrendingUp } from 'react-icons/fi';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [stats, setStats] = useState({
    upcomingBookings: 3,
    unreadNotifications: 2,
    savedPrograms: 12,
    trendingPrograms: 45,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchDashboardData = async () => {
      try {
        const notifications = await apiClient.getNotifications();
        const unreadCount = Array.isArray(notifications)
          ? notifications.filter((n: { isRead?: boolean }) => !n.isRead).length
          : 2;
        setStats((prev) => ({
          ...prev,
          unreadNotifications: unreadCount,
        }));
      } catch (err) {
        console.error('대시보드 데이터 로드 실패:', err);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated]);

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
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">저장된 프로그램</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.savedPrograms}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FiBookmark className="text-green-600" size={24} />
              </div>
            </div>
          </div>

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
            <h2 className="text-lg font-bold text-gray-900 mb-4">예정된 예약</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">프로그램 이름 #{i}</h3>
                    <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">예약완료</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">📅 2024년 9월 {15 + i}일 오후 2시</p>
                  <p className="text-sm text-gray-600">📍 서울시 강남구</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">추천 프로그램</h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                  <h3 className="font-semibold text-gray-900 text-sm">추천 프로그램 #{i}</h3>
                  <p className="text-xs text-gray-600 mt-1">⭐ 4.5 (120 리뷰)</p>
                  <button className="w-full mt-2 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded hover:bg-blue-100 transition-colors">
                    자세히 보기
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
