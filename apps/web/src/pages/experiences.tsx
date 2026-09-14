import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { apiClient } from '@/lib/api';
import { MainLayout } from '@/components/layouts/MainLayout';
import { FiSearch, FiFilter, FiDollarSign, FiUsers, FiBookmark, FiStar } from 'react-icons/fi';

interface Experience {
  id: string;
  programName: string;
  institution: {
    institutionName: string;
  };
  description?: string;
  price?: number | string;
  targetAgeMin?: number | string;
  targetAgeMax?: number | string;
  bookingMethod: string;
  rating?: number;
  reviewCount?: number;
  externalSource?: string;
}

interface SearchResponse {
  data: Experience[];
  total: number;
}

export default function ExperiencesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { addBookmark, removeBookmark, isBookmarked, hydrate } = useBookmarkStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string | null>(null);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<'recent' | 'price-low' | 'price-high' | 'name'>('recent');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [ratings, setRatings] = useState<Record<string, number>>({});

  const itemsPerPage = 12;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchExperiences = async () => {
      try {
        setIsLoadingData(true);
        setError(null);

        // Parse age group for API
        let ageGroupParam: string | undefined;
        if (selectedAgeGroup && selectedAgeGroup !== '전체') {
          const ageMap: Record<string, string> = {
            '4-6세': '4-6',
            '6-10세': '6-10',
            '10-14세': '10-14',
            '14-18세': '14-18',
          };
          ageGroupParam = ageMap[selectedAgeGroup];
        }

        const response: SearchResponse = await apiClient.searchExperiences({
          search: searchQuery || undefined,
          ageGroup: ageGroupParam,
          sort: sortBy,
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage,
        });

        setExperiences(response.data || []);
        setTotalResults(response.total || 0);

        // Fetch ratings for each experience
        const newRatings: Record<string, number> = {};
        for (const exp of response.data) {
          try {
            const ratingData = await apiClient.getExperienceRating(exp.id);
            newRatings[exp.id] = ratingData.average || 0;
          } catch (err) {
            newRatings[exp.id] = 0;
          }
        }
        setRatings(newRatings);
      } catch (err) {
        console.error('프로그램 데이터 로드 실패:', err);
        setError('프로그램을 불러올 수 없습니다.');
        setExperiences([]);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchExperiences();
  }, [isAuthenticated, searchQuery, selectedAgeGroup, sortBy, currentPage]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  const totalPages = Math.ceil(totalResults / itemsPerPage);

  const handleViewDetails = (experienceId: string) => {
    router.push(`/experiences/${experienceId}`);
  };

  const handleToggleBookmark = (exp: Experience) => {
    if (isBookmarked(exp.id)) {
      removeBookmark(exp.id);
    } else {
      addBookmark({
        id: exp.id,
        name: exp.programName,
        institution: exp.institution.institutionName,
        price: Number(exp.price) || 0,
        ageGroup: exp.targetAgeMin && exp.targetAgeMax ? `${Number(exp.targetAgeMin)}-${Number(exp.targetAgeMax)}` : '',
        rating: ratings[exp.id] || 0,
        bookmarkedAt: new Date().toISOString(),
      });
    }
  };

  const getAgeGroupLabel = (minAge?: number | string, maxAge?: number | string): string => {
    if (!minAge || !maxAge) return '';
    return `${Number(minAge)}-${Number(maxAge)}세`;
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">{error}</p>
          </div>
        )}

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">프로그램 둘러보기</h1>
          <p className="text-gray-600 mt-2">아이들을 위한 다양한 경험 프로그램을 찾아보세요</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="md:col-span-3 relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="프로그램, 기관명 검색..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as typeof sortBy);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="recent">최신순</option>
              <option value="price-low">가격 낮음</option>
              <option value="price-high">가격 높음</option>
              <option value="name">이름순</option>
            </select>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
          >
            <FiFilter size={18} />
            {showAdvancedFilters ? '필터 숨기기' : '고급 필터'}
          </button>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-6">
              {/* Minimum Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  최소 평점: {minRating.toFixed(1)} ⭐
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={minRating}
                  onChange={(e) => {
                    setMinRating(parseFloat(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Age Group Filter */}
        <div className="flex gap-2 flex-wrap">
          {['전체', '4-6세', '6-10세', '10-14세', '14-18세'].map((age) => (
            <button
              key={age}
              onClick={() => {
                setSelectedAgeGroup(selectedAgeGroup === age ? null : age);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                selectedAgeGroup === age
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {age}
            </button>
          ))}
        </div>

        {/* Results Info */}
        <div className="text-sm text-gray-600">
          총 {totalResults}개의 프로그램
        </div>

        {/* Experiences Grid */}
        {isLoadingData ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">프로그램을 불러오는 중...</div>
          </div>
        ) : experiences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Placeholder Image */}
                <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-400">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="currentColor">
                    <path d="M40 0C17.9 0 0 17.9 0 40s17.9 40 40 40 40-17.9 40-40S62.1 0 40 0zm0 72c-17.6 0-32-14.4-32-32s14.4-32 32-32 32 14.4 32 32-14.4 32-32 32z" />
                  </svg>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{exp.programName}</h3>
                  <p className="text-sm text-gray-600 mb-3">{exp.institution.institutionName}</p>

                  {/* Details */}
                  <div className="space-y-1 mb-3 text-sm text-gray-600">
                    {exp.price !== undefined && (
                      <div className="flex items-center gap-2">
                        <FiDollarSign size={16} />
                        {exp.price.toLocaleString()}원
                      </div>
                    )}
                    {exp.targetAgeMin && exp.targetAgeMax && (
                      <div className="flex items-center gap-2">
                        <FiUsers size={16} />
                        {getAgeGroupLabel(exp.targetAgeMin, exp.targetAgeMax)}
                      </div>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <FiStar size={16} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-gray-900">
                      {ratings[exp.id]?.toFixed(1) || 'N/A'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(exp.id)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                    >
                      자세히 보기
                    </button>
                    <button
                      onClick={() => handleToggleBookmark(exp)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        isBookmarked(exp.id)
                          ? 'bg-blue-100 text-blue-600'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <FiBookmark
                        size={20}
                        className={isBookmarked(exp.id) ? 'fill-blue-600' : ''}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">
            검색 결과가 없습니다.
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                const distance = Math.abs(page - currentPage);
                return distance <= 2 || page === 1 || page === totalPages;
              })
              .map((page, index, arr) => (
                <React.Fragment key={page}>
                  {index > 0 && arr[index - 1] !== page - 1 && <span className="px-2">...</span>}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
