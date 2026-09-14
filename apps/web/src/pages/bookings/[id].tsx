import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { MainLayout } from '@/components/layouts/MainLayout';
import { FiArrowLeft, FiCheck, FiAlertCircle, FiClock } from 'react-icons/fi';

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
    description?: string;
  };
}

export default function BookingDetailPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { id } = router.query;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!id) return;

    const fetchBooking = async () => {
      try {
        setIsLoadingData(true);
        setError(null);
        const data = await apiClient.getBookingById(id as string);
        setBooking(data);
      } catch (err) {
        console.error('예약 정보 로드 실패:', err);
        setError('예약 정보를 불러올 수 없습니다.');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchBooking();
  }, [id]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '예약 대기 중' },
      CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-800', label: '예약 확인됨' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', label: '완료됨' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: '취소됨' },
    };
    const statusInfo = statusMap[status] || statusMap.PENDING;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.text}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <FiCheck size={20} className="text-green-600" />;
      case 'CANCELLED':
        return <FiAlertCircle size={20} className="text-red-600" />;
      default:
        return <FiClock size={20} className="text-blue-600" />;
    }
  };

  if (isLoadingData) {
    return (
      <MainLayout>
        <div className="text-center py-12">로딩 중...</div>
      </MainLayout>
    );
  }

  if (error || !booking) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <FiArrowLeft size={20} />
            돌아가기
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-2">
              <FiAlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-800">{error || '예약을 찾을 수 없습니다.'}</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleCancelBooking = async () => {
    if (window.confirm('예약을 취소하시겠습니까?')) {
      try {
        setIsSubmitting(true);
        await apiClient.cancelBooking(booking.id);
        router.push('/bookings');
      } catch (err) {
        alert('예약 취소 중 오류가 발생했습니다.');
        setIsSubmitting(false);
      }
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <FiArrowLeft size={20} />
          돌아가기
        </button>

        {/* Booking Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">예약 상세정보</h1>
              <p className="text-gray-600">예약 번호: {booking.confirmationNumber}</p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(booking.status)}
              {getStatusBadge(booking.status)}
            </div>
          </div>
          <p className="text-sm text-gray-500">
            예약일: {new Date(booking.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Experience Information */}
        {booking.experience && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">프로그램 정보</h2>
            <div className="space-y-2">
              <p className="font-bold text-gray-900">{booking.experience.programName}</p>
              <p className="text-gray-600">{booking.experience.institution.institutionName}</p>
              {booking.experience.price && (
                <p className="text-gray-600">프로그램 가격: {booking.experience.price.toLocaleString()}원</p>
              )}
              {booking.experience.description && (
                <p className="text-gray-600 mt-3">{booking.experience.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Participants */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">참여 자녀</h2>
          <div className="space-y-3">
            {booking.selectedChildren.map((child) => (
              <div key={child.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{child.name}</p>
                  <p className="text-sm text-gray-600">{child.age}세</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Special Requests */}
        {booking.specialRequests && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">특별 요청사항</h2>
            <p className="text-gray-600">{booking.specialRequests}</p>
          </div>
        )}

        {/* Total Price */}
        {booking.totalPrice !== undefined && (
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="text-lg font-bold text-gray-900">
              총액: {booking.totalPrice.toLocaleString()}원
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          {booking.status === 'COMPLETED' && (
            <button
              onClick={() => router.push(`/bookings/${id}/review`)}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              후기 작성하기
            </button>
          )}
          {booking.status === 'PENDING' || booking.status === 'CONFIRMED' ? (
            <button
              onClick={handleCancelBooking}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50"
            >
              {isSubmitting ? '취소 중...' : '예약 취소'}
            </button>
          ) : null}
          <button
            onClick={() => router.push('/bookings')}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
          >
            목록으로
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
