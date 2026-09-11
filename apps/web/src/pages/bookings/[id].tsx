import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { MainLayout } from '@/components/layouts/MainLayout';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiArrowLeft,
  FiDownload,
  FiAlertCircle,
  FiX,
} from 'react-icons/fi';

export default function BookingDetailPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { id } = router.query;
  const [showCancelModal, setShowCancelModal] = useState(false);

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

  const booking = {
    id: parseInt(id as string) || 1,
    programName: '과학관 과학 체험',
    institution: '국립과학관',
    description: '아이들이 직접 과학 실험을 해보고 과학의 원리를 배우는 프로그램입니다. 전문 강사가 진행하며, 안전하고 재미있는 체험을 통해 과학에 대한 흥미를 높일 수 있습니다.',
    date: '2024-09-16',
    time: '14:00',
    duration: 120,
    location: '서울시 강남구 테헤란로 123',
    ageGroup: '6-10세',
    maxParticipants: 5,
    participants: [
      { name: '김철수 (본인)', age: 8 },
      { name: '김영희', age: 6 },
    ],
    price: 15000,
    totalPrice: 30000,
    status: 'confirmed',
    bookingDate: '2024-08-16',
    notes: '사전에 과학 안전 교육을 받으시고 편한 복장으로 오세요.',
    cancellationPolicy:
      '예정일 7일 전까지 환불 가능하며, 3일 전부터는 30% 수수료가 적용됩니다.',
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
              <h1 className="text-2xl font-bold text-gray-900">{booking.programName}</h1>
              <p className="text-gray-600 mt-1">{booking.institution}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full font-semibold ${
                booking.status === 'confirmed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {booking.status === 'confirmed' ? '예약완료' : '완료됨'}
            </span>
          </div>
          <p className="text-gray-600 leading-relaxed">{booking.description}</p>
        </div>

        {/* Key Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded">
                <FiCalendar className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">일자</p>
                <p className="font-semibold text-gray-900">
                  {new Date(booking.date).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-orange-100 p-2 rounded">
                <FiClock className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">시간</p>
                <p className="font-semibold text-gray-900">
                  {booking.time} (약 {booking.duration}분)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-100 p-2 rounded">
                <FiMapPin className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">장소</p>
                <p className="font-semibold text-gray-900">{booking.location}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-100 p-2 rounded">
                <FiUsers className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">연령대</p>
                <p className="font-semibold text-gray-900">{booking.ageGroup}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Participants Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">참여 아이</h3>
          <div className="space-y-3">
            {booking.participants.map((participant, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{participant.name}</p>
                  <p className="text-sm text-gray-600">{participant.age}세</p>
                </div>
                <p className="text-sm font-medium text-gray-600">{booking.price.toLocaleString()}원</p>
              </div>
            ))}
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-700">
              <span>1인 가격</span>
              <span>{booking.price.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>인원 ({booking.participants.length}명)</span>
              <span>{(booking.price * booking.participants.length).toLocaleString()}원</span>
            </div>
            <div className="border-t border-blue-200 pt-2 flex justify-between font-bold text-lg">
              <span>총액</span>
              <span className="text-blue-600">{booking.totalPrice.toLocaleString()}원</span>
            </div>
          </div>
          <p className="text-xs text-gray-600">💳 결제 완료: {booking.bookingDate}</p>
        </div>

        {/* Important Notes */}
        <div className="bg-amber-50 rounded-lg border border-amber-200 p-6">
          <div className="flex gap-3">
            <FiAlertCircle className="text-amber-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-semibold text-amber-900 mb-2">준비사항</h4>
              <p className="text-sm text-amber-800 leading-relaxed">{booking.notes}</p>
            </div>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-2">취소 정책</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{booking.cancellationPolicy}</p>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-3">
            {booking.status === 'confirmed' && (
              <>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                  <FiDownload size={18} />
                  예약 확인증 다운로드
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full px-4 py-3 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  예약 취소
                </button>
              </>
            )}
            {booking.status === 'completed' && (
              <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                리뷰 작성
              </button>
            )}
          </div>
        </div>

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">예약을 취소하시겠습니까?</h2>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={24} />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                이 예약을 취소하면 환불 정책에 따라 일부 금액이 환불될 수 있습니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  계속 예약
                </button>
                <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                  취소하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
