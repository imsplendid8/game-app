import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { MainLayout } from '@/components/layouts/MainLayout';
import { FiArrowLeft, FiStar, FiCheck, FiAlertCircle } from 'react-icons/fi';

export default function BookingReviewPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { id } = router.query;

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    id: id || '1',
    programName: '과학관 과학 체험',
    institution: '국립과학관',
    date: '2024년 9월 16일',
    time: '14:00',
    image: 'https://via.placeholder.com/600x400',
  };

  const handleSubmitReview = async () => {
    try {
      if (rating === 0) {
        setError('별점을 선택해주세요.');
        return;
      }

      if (reviewText.trim().length < 10) {
        setError('리뷰는 최소 10자 이상 작성해주세요.');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      const reviewData = {
        bookingId: id,
        rating,
        text: reviewText,
      };

      await apiClient.getExperiences();

      setSuccess(true);
      setRating(0);
      setReviewText('');

      setTimeout(() => {
        router.push(`/bookings/${id}`);
      }, 2000);
    } catch (err) {
      console.error('리뷰 제출 실패:', err);
      setError('리뷰 제출 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck className="text-green-600" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              리뷰가 등록되었습니다!
            </h1>
            <p className="text-gray-600 mb-8">
              소중한 리뷰 감사합니다. 예약 상세 페이지로 이동합니다.
            </p>
            <div className="animate-pulse text-sm text-gray-600">
              잠시만 기다려주세요...
            </div>
          </div>
        </div>
      </MainLayout>
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

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">리뷰 작성</h1>
          <p className="text-gray-600 mt-2">경험에 대한 소중한 의견을 들려주세요</p>
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

        {/* Program Info Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex gap-4">
            <img
              src={bookingDetails.image}
              alt={bookingDetails.programName}
              className="w-24 h-24 rounded-lg object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">
                {bookingDetails.programName}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{bookingDetails.institution}</p>
              <p className="text-sm text-gray-600 mt-2">
                📅 {bookingDetails.date} {bookingDetails.time}
              </p>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Rating Section */}
          <div>
            <label className="block text-lg font-bold text-gray-900 mb-4">
              만족도 평가
            </label>
            <div className="flex gap-3 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <FiStar
                    size={40}
                    className={`${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-center mt-3">
              {rating > 0 && (
                <p className="text-lg font-semibold text-gray-900">
                  {rating}점 {'⭐'.repeat(rating)}
                </p>
              )}
            </div>
          </div>

          {/* Review Text Section */}
          <div>
            <label className="block text-lg font-bold text-gray-900 mb-2">
              리뷰 작성
            </label>
            <p className="text-sm text-gray-600 mb-3">
              이 프로그램에 대한 경험을 자세히 말씀해주세요. (최소 10자)
            </p>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="예: 아이가 정말 즐거워했어요. 선생님이 친절하고 설명도 재미있게 해주셨습니다."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={6}
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {reviewText.length}자 / 최소 10자
              </p>
              {reviewText.length >= 10 && (
                <p className="text-xs text-green-600 font-medium">✓ 입력 가능</p>
              )}
            </div>
          </div>

          {/* Additional Tips */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-900 font-semibold mb-2">💡 좋은 리뷰 팁:</p>
            <ul className="text-sm text-blue-800 space-y-1 ml-4">
              <li>• 프로그램의 장점과 단점을 균형있게 설명해주세요</li>
              <li>• 구체적인 경험과 예시를 포함해주세요</li>
              <li>• 다른 부모들에게 도움이 될 정보를 담아주세요</li>
            </ul>
          </div>
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
            onClick={handleSubmitReview}
            disabled={isSubmitting || rating === 0}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
          >
            {isSubmitting ? '제출 중...' : '리뷰 등록'}
            {!isSubmitting && <FiCheck size={18} />}
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
