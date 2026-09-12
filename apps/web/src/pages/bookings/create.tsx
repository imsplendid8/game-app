import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { MainLayout } from '@/components/layouts/MainLayout';
import { FiArrowLeft, FiCheck, FiAlertCircle } from 'react-icons/fi';

export default function BookingCreatePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { experienceId, selectedDate, participants } = router.query;

  const [step, setStep] = useState<'details' | 'confirm'>('details');
  const [formData, setFormData] = useState({
    selectedChildren: [] as string[],
    specialRequests: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const experienceDetails = {
    id: parseInt(experienceId as string) || 1,
    name: '과학관 과학 체험',
    institution: '국립과학관',
    price: 15000,
    date: new Date(selectedDate as string).toLocaleDateString('ko-KR'),
    time: '14:00',
    participants: parseInt(participants as string) || 1,
  };

  const totalPrice = experienceDetails.price * experienceDetails.participants;

  const handleChildrenSelect = (child: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedChildren: prev.selectedChildren.includes(child)
        ? prev.selectedChildren.filter((c) => c !== child)
        : [...prev.selectedChildren, child],
    }));
  };

  const handleCreateBooking = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (formData.selectedChildren.length === 0) {
        setError('최소 1명 이상의 자녀를 선택해주세요.');
        return;
      }

      await apiClient.getExperiences();

      setStep('confirm');
    } catch (err) {
      console.error('예약 생성 실패:', err);
      setError('예약 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmBooking = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const bookingData = {
        experienceId: experienceDetails.id,
        date: selectedDate,
        participants: experienceDetails.participants,
        children: formData.selectedChildren,
        specialRequests: formData.specialRequests,
      };

      await apiClient.getExperiences();

      router.push({
        pathname: '/bookings/success',
        query: { bookingId: '1' },
      });
    } catch (err) {
      console.error('예약 확정 실패:', err);
      setError('예약 확정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-2">
              <FiAlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex gap-4">
          <div
            className={`flex-1 h-2 rounded-full transition-colors ${
              step === 'details' || step === 'confirm' ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          ></div>
          <div
            className={`flex-1 h-2 rounded-full transition-colors ${
              step === 'confirm' ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          ></div>
        </div>

        {/* Details Step */}
        {step === 'details' && (
          <div className="space-y-6">
            {/* Program Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">프로그램 정보</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium text-gray-900">{experienceDetails.name}</span>
                </p>
                <p>{experienceDetails.institution}</p>
                <p>📅 {experienceDetails.date} {experienceDetails.time}</p>
                <p>👥 {experienceDetails.participants}명</p>
                <p className="text-lg font-bold text-blue-600 mt-4">
                  총 {totalPrice.toLocaleString()}원
                </p>
              </div>
            </div>

            {/* Children Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">참여할 자녀 선택</h3>
              <div className="space-y-3">
                {['김철수 (8세)', '김영희 (6세)'].map((child) => (
                  <label key={child} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.selectedChildren.includes(child)}
                      onChange={() => handleChildrenSelect(child)}
                      className="w-5 h-5 rounded text-blue-600"
                    />
                    <span className="text-gray-900 font-medium">{child}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                * 참여할 자녀를 선택해주세요
              </p>
            </div>

            {/* Special Requests */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">특별한 요청사항</h3>
              <textarea
                value={formData.specialRequests}
                onChange={(e) =>
                  setFormData({ ...formData, specialRequests: e.target.value })
                }
                placeholder="알레르기, 특별한 배려사항 등을 입력해주세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => router.back()}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                취소
              </button>
              <button
                onClick={handleCreateBooking}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSubmitting ? '처리 중...' : '다음'}
              </button>
            </div>
          </div>
        )}

        {/* Confirm Step */}
        {step === 'confirm' && (
          <div className="space-y-6">
            {/* Confirmation Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex gap-3 mb-4">
                <FiCheck className="text-blue-600 flex-shrink-0" size={24} />
                <div>
                  <h2 className="text-lg font-bold text-blue-900">예약 정보를 확인해주세요</h2>
                  <p className="text-sm text-blue-800 mt-1">아래 정보가 맞으면 예약을 확정하세요</p>
                </div>
              </div>
            </div>

            {/* Summary Details */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm text-gray-600 mb-1">프로그램</p>
                <p className="font-semibold text-gray-900">{experienceDetails.name}</p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm text-gray-600 mb-1">일시</p>
                <p className="font-semibold text-gray-900">
                  {experienceDetails.date} {experienceDetails.time}
                </p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm text-gray-600 mb-1">참여 아이</p>
                <div className="space-y-1">
                  {formData.selectedChildren.map((child) => (
                    <p key={child} className="font-semibold text-gray-900">
                      {child}
                    </p>
                  ))}
                </div>
              </div>

              {formData.specialRequests && (
                <div className="border-b border-gray-200 pb-4">
                  <p className="text-sm text-gray-600 mb-1">특별한 요청사항</p>
                  <p className="font-semibold text-gray-900">{formData.specialRequests}</p>
                </div>
              )}

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">총 금액</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {totalPrice.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>

            {/* Agreements */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">약관 동의</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 rounded text-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    예약 약관에 동의합니다
                  </span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 rounded text-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    취소 정책에 동의합니다
                  </span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep('details')}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                이전
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSubmitting ? '예약 중...' : '예약 확정'}
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
