import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { apiClient } from '@/lib/api';
import { MainLayout } from '@/components/layouts/MainLayout';
import {
  FiArrowLeft,
  FiBookmark,
  FiStar,
  FiAlertCircle,
  FiUsers,
  FiDollarSign,
} from 'react-icons/fi';

interface Experience {
  id: string;
  programName: string;
  institution: { institutionName: string };
  price?: number;
  description?: string;
  targetAgeMin?: number;
  targetAgeMax?: number;
}

export default function ExperienceDetailPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { addBookmark, removeBookmark, isBookmarked, hydrate } = useBookmarkStore();
  const { id } = router.query;

  const [experience, setExperience] = useState<Experience | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!id) return;
    hydrate();

    const fetchExperience = async () => {
      try {
        setIsLoadingData(true);
        setError(null);
        const data = await apiClient.getExperienceById(id as string);
        setExperience(data);
        setBookmarked(isBookmarked(id));

        try {
          const ratingData = await apiClient.getExperienceRating(id as string);
          setRating(ratingData.average || 0);
        } catch {
          setRating(0);
        }
      } catch (err) {
        console.error('프로그램 정보 로드 실패:', err);
        setError('프로그램 정보를 불러올 수 없습니다.');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchExperience();
  }, [id, hydrate, isBookmarked]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (isLoadingData) {
    return (
      <MainLayout>
        <div className="text-center py-12">로딩 중...</div>
      </MainLayout>
    );
  }

  if (error || !experience) {
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
              <p className="text-red-800">{error || '프로그램을 찾을 수 없습니다.'}</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleBookmark = async () => {
    setIsBookmarkLoading(true);
    try {
      if (bookmarked) {
        removeBookmark(experience.id);
      } else {
        addBookmark({
          id: experience.id,
          name: experience.programName,
          institution: experience.institution.institutionName,
          price: experience.price || 0,
          ageGroup: experience.targetAgeMin && experience.targetAgeMax
            ? `${experience.targetAgeMin}-${experience.targetAgeMax}`
            : '',
          rating: rating,
          bookmarkedAt: new Date().toISOString(),
        });
      }
      setBookmarked(!bookmarked);
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  const handleBooking = () => {
    router.push(`/bookings/create?experienceId=${experience.id}`);
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <FiArrowLeft size={20} />
          돌아가기
        </button>

        {/* Image Gallery */}
        <div className="relative bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg overflow-hidden aspect-video flex items-center justify-center text-blue-400">
          <svg width="120" height="120" viewBox="0 0 80 80" fill="currentColor">
            <path d="M40 0C17.9 0 0 17.9 0 40s17.9 40 40 40 40-17.9 40-40S62.1 0 40 0zm0 72c-17.6 0-32-14.4-32-32s14.4-32 32-32 32 14.4 32 32-14.4 32-32 32z" />
          </svg>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{experience.programName}</h1>
                  <p className="text-gray-600 mt-2">{experience.institution.institutionName}</p>
                </div>
                <button
                  onClick={handleBookmark}
                  disabled={isBookmarkLoading}
                  className={`p-3 rounded-lg transition-colors ${
                    bookmarked
                      ? 'bg-blue-100 hover:bg-blue-200'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <FiBookmark
                    size={24}
                    className={bookmarked ? 'fill-blue-600 text-blue-600' : 'text-gray-600'}
                  />
                </button>
              </div>

              {/* Rating and Price */}
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        size={18}
                        className={
                          i < Math.floor(rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }
                      />
                    ))}
                    <span className="ml-2 font-semibold text-gray-900">
                      {rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                {experience.price && (
                  <div className="text-lg font-bold text-blue-600">
                    {experience.price.toLocaleString()}원 / 1인
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {experience.description && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">프로그램 설명</h3>
                <p className="text-gray-700 leading-relaxed">{experience.description}</p>
              </div>
            )}

            {/* Age Group Info */}
            {experience.targetAgeMin && experience.targetAgeMax && (
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center gap-3">
                  <FiUsers className="text-blue-600" size={24} />
                  <div>
                    <p className="font-semibold text-gray-900">추천 연령</p>
                    <p className="text-blue-600 font-medium">{experience.targetAgeMin}세 ~ {experience.targetAgeMax}세</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Booking */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6 sticky top-20">
              <h3 className="text-lg font-bold text-gray-900 mb-6">예약하기</h3>

              {/* Price Summary */}
              {experience.price && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">1인 가격</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {experience.price.toLocaleString()}원
                    </p>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                {experience.targetAgeMin && experience.targetAgeMax && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FiUsers size={16} className="text-gray-400" />
                    <span>{experience.targetAgeMin}세 ~ {experience.targetAgeMax}세</span>
                  </div>
                )}
                {experience.price && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FiDollarSign size={16} className="text-gray-400" />
                    <span>{experience.price.toLocaleString()}원 / 1인</span>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button
                onClick={handleBooking}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                예약하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
