import React, { useState } from 'react';
import { FiX, FiSmile } from 'react-icons/fi';
import { apiClient } from '@/lib/api';

interface FeedbackData {
  rating: number;
  comment: string;
  page: string;
  timestamp: string;
}

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('만족도를 선택해주세요');
      return;
    }

    setIsSubmitting(true);
    try {
      const feedback: FeedbackData = {
        rating,
        comment,
        page: typeof window !== 'undefined' ? window.location.pathname : '',
        timestamp: new Date().toISOString(),
      };

      // Send to backend or analytics
      console.log('Feedback submitted:', feedback);

      // Optional: Send to API
      // await apiClient.post('/feedback', feedback);

      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setRating(0);
        setComment('');
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('피드백 전송에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-50">
        <div className="text-center">
          <p className="text-green-600 font-semibold">감사합니다! ✨</p>
          <p className="text-sm text-gray-600 mt-1">소중한 의견을 반영하겠습니다</p>
        </div>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="피드백 전송"
      >
        <FiSmile size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-6 w-80 z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">의견을 들려주세요</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          이 페이지가 도움이 되었나요?
        </label>
        <div className="flex gap-2 justify-center">
          {[1, 2, 3, 4, 5].map(score => (
            <button
              key={score}
              onClick={() => setRating(score)}
              className={`text-2xl transition-transform ${
                rating >= score ? 'scale-125' : 'scale-100 opacity-40'
              }`}
            >
              {'⭐'.split('')[0]}
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-center text-sm text-gray-600 mt-2">
            {rating === 1 && '별로예요'}
            {rating === 2 && '그저 그래요'}
            {rating === 3 && '보통이에요'}
            {rating === 4 && '좋아요'}
            {rating === 5 && '최고예요!'}
          </p>
        )}
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          피드백 (선택사항)
        </label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="개선할 점이나 칭찬할 점을 자유롭게 남겨주세요..."
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">{comment.length}/500</p>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setIsOpen(false)}
          className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          {isSubmitting ? '전송 중...' : '전송'}
        </button>
      </div>
    </div>
  );
}
