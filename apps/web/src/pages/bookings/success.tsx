import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { MainLayout } from '@/components/layouts/MainLayout';
import { FiCheck, FiCalendar, FiMapPin, FiHome, FiArrowRight } from 'react-icons/fi';

export default function BookingSuccessPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { bookingId } = router.query;

  useEffect(() => {
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

  const bookingDetails = {
    id: bookingId || '1',
    programName: '과학관 과학 체험',
    institution: '국립과학관',
    date: '2024년 9월 16일',
    time: '14:00',
    location: '서울시 강남구 테헤란로 123',
    participants: 2,
    children: ['김철수 (8세)', '김영희 (6세)'],
    totalPrice: 30000,
    specialRequests: '음식 알레르기 주의 부탁드립니다.',
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* Success Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <FiCheck className="text-green-600" size={40} />
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              예약이 완료되었습니다!
            </h1>
            <p className="text-gray-600 text-lg">
              예약이 성공적으로 확정되었습니다. 아래 세부정보를 확인해주세요.
            </p>
          </div>

          {/* Booking ID */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-600 mb-1">예약 번호</p>
            <p className="text-2xl font-bold text-blue-900"># {bookingDetails.id}</p>
          </div>

          {/* Booking Details */}
          <div className="space-y-6 border-t border-gray-200 pt-8">
            {/* Program Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">프로그램</h3>
              <p className="text-lg font-semibold text-gray-900">
                {bookingDetails.programName}
              </p>
              <p className="text-sm text-gray-600 mt-1">{bookingDetails.institution}</p>
            </div>

            {/* Date and Time */}
            <div className="flex items-start gap-3">
              <FiCalendar className="text-gray-400 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-1">예약 날짜 및 시간</h3>
                <p className="text-gray-900 font-medium">
                  {bookingDetails.date} {bookingDetails.time}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3">
              <FiMapPin className="text-gray-400 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-1">장소</h3>
                <p className="text-gray-900 font-medium">{bookingDetails.location}</p>
              </div>
            </div>

            {/* Participants */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">참여 아이</h3>
              <div className="space-y-2">
                {bookingDetails.children.map((child) => (
                  <div key={child} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    <span className="text-gray-900">{child}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Requests */}
            {bookingDetails.specialRequests && (
              <div className="border-l-4 border-orange-400 bg-orange-50 p-4 rounded">
                <h3 className="text-sm font-semibold text-orange-900 mb-2">특별한 요청사항</h3>
                <p className="text-sm text-orange-800">{bookingDetails.specialRequests}</p>
              </div>
            )}

            {/* Total Price */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-semibold">총 결제 금액</span>
                <span className="text-3xl font-bold text-blue-600">
                  {bookingDetails.totalPrice.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">📧 확인:</span> 예약 확인 메일이 가입하신 이메일 주소로 발송되었습니다.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* View Booking Details */}
          <button
            onClick={() => router.push(`/bookings/${bookingDetails.id}`)}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            예약 상세 정보 보기
            <FiArrowRight size={18} />
          </button>

          {/* Browse More Experiences */}
          <button
            onClick={() => router.push('/experiences')}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
          >
            다른 프로그램 둘러보기
          </button>

          {/* Back to Home */}
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <FiHome size={18} />
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
