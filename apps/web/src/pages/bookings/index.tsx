import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { MainLayout } from '@/components/layouts/MainLayout';
import { FiArrowLeft, FiAlertCircle, FiCheck, FiClock, FiX } from 'react-icons/fi';

interface BookingChild {
  id: string;
  name: string;
  age: number;
}

interface Booking {
  id: string;
  confirmationNumber: string;
  experienceId: string;
  userId: string;
  selectedChildren: BookingChild[];
  specialRequests?: string;
  totalPrice?: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  experience?: {
    id: string;
    programName: string;
    institution: { institutionName: string };
    price?: number;
  };
}

export default function BookingsListPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchBookings = async () => {
      try {
        setIsLoadingData(true);
        setError(null);
        const data = await apiClient.getBookings();
        setBookings(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error('예약 목록 로드 실패:', err);
        setError('예약 목록을 불러올 수 없습니다.');
        setBookings([]);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchBookings();
  }, [isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '예약 대기 중', icon: <FiClock size={16} /> },
      CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-800', label: '예약 확인됨', icon: <FiCheck size={16} /> },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', label: '완료됨', icon: <FiCheck size={16} /> },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: '취소됨', icon: <FiX size={16} /> },
    };
    const statusInfo = statusMap[status] || statusMap.PENDING;
    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
        {statusInfo.icon}
        {statusInfo.label}
      </div>
    );
  };

  const filteredBookings = filterStatus
    ? bookings.filter((b) => b.status === filterStatus)
    : bookings;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => router.push('/experiences')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <FiArrowLeft size={20} />
            돌아가기
          </button>
          <h1 className="text-3xl font-bold text-gray-900">내 예약</h1>
          <p className="text-gray-600 mt-2">예약한 프로그램 목록</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-2">
              <FiAlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          {['전체', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => {
            const statusLabels: Record<string, string> = {
              '전체': 'All',
              PENDING: '대기 중',
              CONFIRMED: '확인됨',
              COMPLETED: '완료',
              CANCELLED: '취소됨',
            };
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status === '전체' ? null : status)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  filterStatus === (status === '전체' ? null : status)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {statusLabels[status]}
              </button>
            );
          })}
        </div>

        {/* Bookings List */}
        {isLoadingData ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">로딩 중...</div>
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer"
                onClick={() => router.push(`/bookings/${booking.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {booking.experience?.programName || '프로그램 정보 없음'}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {booking.experience?.institution.institutionName}
                    </p>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">예약 번호</p>
                    <p className="font-medium text-gray-900">{booking.confirmationNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">인원</p>
                    <p className="font-medium text-gray-900">{booking.selectedChildren.length}명</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">총액</p>
                    <p className="font-medium text-gray-900">
                      {booking.totalPrice?.toLocaleString() || '-'}원
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">예약일</p>
                    <p className="font-medium text-gray-900">
                      {new Date(booking.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p>참여 자녀: {booking.selectedChildren.map((c) => `${c.name}(${c.age}세)`).join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-lg text-gray-600 mb-4">예약이 없습니다.</div>
            <button
              onClick={() => router.push('/experiences')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              프로그램 둘러보기
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
