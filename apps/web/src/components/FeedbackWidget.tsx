import React, { useState } from 'react';
import { FiX, FiSmile } from 'react-icons/fi';

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
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-slate-200 p-5 z-50 animate-in fade-in duration-300">
        <div className="text-center">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-emerald-600 font-bold">✓</span>
          </div>
          <p className="text-emerald-700 font-semibold text-sm" style={{ letterSpacing: '0.25px' }}>
            감사합니다!
          </p>
          <p className="text-xs text-slate-600 mt-1" style={{ letterSpacing: '0.25px' }}>
            소중한 의견을 반영하겠습니다
          </p>
        </div>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:shadow-xl hover:bg-blue-700 active:scale-95 transition-all duration-200 z-50"
        title="피드백 전송"
      >
        <FiSmile size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg border border-slate-200 p-6 w-96 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900" style={{ letterSpacing: '0.25px' }}>
          어떤 점이 좋았나요?
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded transition-colors duration-200"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-3" style={{ letterSpacing: '0.25px' }}>
          만족도 평가
        </label>
        <div className="flex gap-3 justify-center">
          {[1, 2, 3, 4, 5].map(score => (
            <button
              key={score}
              onClick={() => setRating(score)}
              className={`text-3xl transition-all duration-200 ${
                rating >= score
                  ? 'scale-110 drop-shadow-md'
                  : 'scale-100 opacity-30 hover:opacity-50'
              }`}
            >
              ⭐
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-center text-sm text-slate-600 mt-3 font-medium" style={{ letterSpacing: '0.25px' }}>
            {rating === 1 && '개선이 필요해요'}
            {rating === 2 && '만족도가 낮아요'}
            {rating === 3 && '보통이에요'}
            {rating === 4 && '만족해요'}
            {rating === 5 && '아주 만족해요!'}
          </p>
        )}
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2" style={{ letterSpacing: '0.25px' }}>
          추가 의견 (선택사항)
        </label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="개선 사항이나 칭찬을 남겨주세요..."
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 hover:border-slate-400"
          rows={3}
          maxLength={500}
          style={{ letterSpacing: '0.25px' }}
        />
        <p className="text-xs text-slate-500 mt-1.5 text-right">{comment.length}/500</p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setIsOpen(false)}
          className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition-all duration-200 hover:border-slate-400"
          style={{ letterSpacing: '0.25px' }}
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
          className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200"
          style={{ letterSpacing: '0.25px' }}
        >
          {isSubmitting ? '전송 중...' : '의견 전송'}
        </button>
      </div>
    </div>
  );
}
