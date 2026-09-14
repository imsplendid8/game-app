import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { MainLayout } from '@/components/layouts/MainLayout';
import {
  FiArrowLeft,
  FiBookmark,
  FiStar,
  FiTrash2,
  FiArrowRight,
} from 'react-icons/fi';

export default function SavedExperiencesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { bookmarks, removeBookmark, hydrate } = useBookmarkStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
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
          <h1 className="text-3xl font-bold text-gray-900">저장된 프로그램</h1>
          <p className="text-gray-600 mt-2">
            관심 있는 프로그램을 모았습니다 ({bookmarks.length}개)
          </p>
        </div>

        {/* Saved Experiences */}
        {bookmarks.length > 0 ? (
          <div className="space-y-4">
            {bookmarks.map((experience) => (
              <div
                key={experience.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {experience.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {experience.institution}
                    </p>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">가격</p>
                        <p className="text-sm font-semibold text-blue-600">
                          {experience.price.toLocaleString()}원
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">연령대</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {experience.ageGroup}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">평점</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <FiStar
                            size={14}
                            className="fill-yellow-400 text-yellow-400"
                          />
                          <p className="text-sm font-semibold text-gray-900">
                            {experience.rating}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">저장일</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(experience.bookmarkedAt).toLocaleDateString(
                            'ko-KR'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() =>
                        router.push(`/experiences/${experience.id}`)
                      }
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      title="상세 보기"
                    >
                      <FiArrowRight size={20} />
                    </button>
                    <button
                      onClick={() => removeBookmark(experience.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      title="저장 해제"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FiBookmark size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 text-lg mb-4">저장된 프로그램이 없습니다</p>
            <button
              onClick={() => router.push('/experiences')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              프로그램 탐색하기
              <FiArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
