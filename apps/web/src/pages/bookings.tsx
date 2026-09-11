import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { MainLayout } from '@/components/layouts/MainLayout';
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiChevronRight } from 'react-icons/fi';

export default function BookingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'completed'>('all');

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  const bookings = [
    {
      id: 1,
      programName: '과학관 과학 체험',
      institution: '국립과학관',
      date: '2024-09-16',
      time: '14:00',
      location: '서울시 강남구',
      ageGroup: '6-10세',
      status: 'confirmed',
      participants: 2,
      price: 30000,
    },
    {
      id: 2,
      programName: '미술관 아동 미술 교실',
      institution: '국립미술관',
      date: '2024-09-20',
      time: '10:00',
      location: '서울시 종로구',
      ageGroup: '8-12세',
      status: 'confirmed',
      participants: 1,
      price: 20000,
    },
    {
      id: 3,
      programName: '팩토리 투어 - 초콜릿 만들기',
      institution: '롯데 초콜릿',
      date: '2024-09-23',
      time: '15:30',
      location: '경기도 이천시',
      ageGroup: '6-14세',
      status: 'confirmed',
      participants: 3,
      price: 75000,
    },
    {
      id: 4,
      programName: '수족관 교육 프로그램',
      institution: '롯데월드 아쿠아리움',
      date: '2024-08-15',
      time: '11:00',
      location: '서울시 송파구',
      ageGroup: '4-10세',
      status: 'completed',
      participants: 2,
      price: 36000,
    },
  ];

  const filteredBookings = bookings.filter((booking) => {
    if (filterStatus === 'all') return true;
    return booking.status === filterStatus;
  });

  const upcomingCount = bookings.filter((b) => b.status === 'confirmed').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">예약 현황</h1>
          <p className="text-gray-600 mt-2">아이들의 예약된 경험을 관리하세요</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setFilterStatus('all')}
            className={`p-4 rounded-lg transition-all ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white border border-gray-200 hover:border-blue-300'
            }`}
          >
            <p className="text-sm font-medium opacity-75">전체</p>
            <p className="text-2xl font-bold mt-1">{bookings.length}</p>
          </button>
          <button
            onClick={() => setFilterStatus('upcoming')}
            className={`p-4 rounded-lg transition-all ${
              filterStatus === 'upcoming'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white border border-gray-200 hover:border-blue-300'
            }`}
          >
            <p className="text-sm font-medium opacity-75">예정</p>
            <p className="text-2xl font-bold mt-1">{upcomingCount}</p>
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`p-4 rounded-lg transition-all ${
              filterStatus === 'completed'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white border border-gray-200 hover:border-blue-300'
            }`}
          >
            <p className="text-sm font-medium opacity-75">완료</p>
            <p className="text-2xl font-bold mt-1">{completedCount}</p>
          </button>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <button
                key={booking.id}
                onClick={() => router.push(`/bookings/${booking.id}`)}
                className="w-full bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden text-left"
              >
                <div className="p-6 flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{booking.programName}</h3>
                        <p className="text-sm text-gray-600">{booking.institution}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {booking.status === 'confirmed' ? '예약완료' : '완료됨'}
                      </span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <FiCalendar size={16} />
                        {new Date(booking.date).toLocaleDateString('ko-KR')}
                      </div>
                      <div className="flex items-center gap-2">
                        <FiClock size={16} />
                        {booking.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <FiMapPin size={16} />
                        {booking.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <FiUsers size={16} />
                        {booking.participants}명 참여
                      </div>
                    </div>

                    {/* Price and Age */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-600">{booking.ageGroup}</span>
                      <span className="text-lg font-bold text-blue-600">
                        {booking.price.toLocaleString()}원
                      </span>
                    </div>
                  </div>

                  <div className="ml-4 flex items-center text-gray-400">
                    <FiChevronRight size={24} />
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600 text-lg">예약된 프로그램이 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
