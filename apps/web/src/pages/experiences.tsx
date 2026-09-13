import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { apiClient } from '@/lib/api';
import { MainLayout } from '@/components/layouts/MainLayout';
import { FiSearch, FiFilter, FiMapPin, FiDollarSign, FiUsers, FiBookmark } from 'react-icons/fi';

interface Experience {
  id: number;
  name: string;
  institution: string;
  location: string;
  price: number;
  ageGroup: string;
  rating: number;
  reviews: number;
  image: string;
}

export default function ExperiencesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { addBookmark, removeBookmark, isBookmarked, hydrate } = useBookmarkStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<'recent' | 'price-low' | 'price-high' | 'rating' | 'reviews'>('recent');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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
        const data = await apiClient.getExperiences();
        setExperiences(Array.isArray(data) ? data : defaultExperiences);
      } catch (err) {
        console.error('경험 데이터 로드 실패:', err);
        setError('프로그램을 불러올 수 없습니다.');
        setExperiences(defaultExperiences);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchExperiences();
  }, [isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  const defaultExperiences: Experience[] = [
    {
      id: 1,
      name: '과학관 과학 체험',
      institution: '국립과학관',
      location: '서울시 강남구',
      price: 15000,
      ageGroup: '6-10세',
      rating: 4.8,
      reviews: 245,
      image: 'https://via.placeholder.com/300x200',
    },
    {
      id: 2,
      name: '미술관 아동 미술 교실',
      institution: '국립미술관',
      location: '서울시 종로구',
      price: 20000,
      ageGroup: '8-12세',
      rating: 4.6,
      reviews: 189,
      image: 'https://via.placeholder.com/300x200',
    },
    {
      id: 3,
      name: '팩토리 투어 - 초콜릿 만들기',
      institution: '롯데 초콜릿',
      location: '경기도 이천시',
      price: 25000,
      ageGroup: '6-14세',
      rating: 4.9,
      reviews: 312,
      image: 'https://via.placeholder.com/300x200',
    },
    {
      id: 4,
      name: '박물관 역사 체험',
      institution: '서울역사박물관',
      location: '서울시 종로구',
      price: 12000,
      ageGroup: '10-14세',
      rating: 4.5,
      reviews: 156,
      image: 'https://via.placeholder.com/300x200',
    },
    {
      id: 5,
      name: '수족관 교육 프로그램',
      institution: '롯데월드 아쿠아리움',
      location: '서울시 송파구',
      price: 18000,
      ageGroup: '4-10세',
      rating: 4.7,
      reviews: 298,
      image: 'https://via.placeholder.com/300x200',
    },
    {
      id: 6,
      name: '방송국 견학',
      institution: 'KBS',
      location: '서울시 마포구',
      price: 10000,
      ageGroup: '8-15세',
      rating: 4.4,
      reviews: 134,
      image: 'https://via.placeholder.com/300x200',
    },
  ];

  const filteredExperiences = experiences
    .filter((exp) => {
      const matchesSearch =
        exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAgeGroup =
        !selectedAgeGroup ||
        selectedAgeGroup === '전체' ||
        exp.ageGroup.includes(selectedAgeGroup);

      const matchesPrice = exp.price >= priceRange[0] && exp.price <= priceRange[1];
      const matchesRating = exp.rating >= minRating;

      return matchesSearch && matchesAgeGroup && matchesPrice && matchesRating;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.reviews - a.reviews;
        case 'recent':
        default:
          return b.id - a.id;
      }
    });

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
                placeholder="프로그램, 기관명, 장소 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="recent">최신순</option>
              <option value="price-low">가격 낮음</option>
              <option value="price-high">가격 높음</option>
              <option value="rating">평점 높음</option>
              <option value="reviews">리뷰 많음</option>
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
              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  가격 범위: {priceRange[0].toLocaleString()}원 ~ {priceRange[1].toLocaleString()}원
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>

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
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
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
              onClick={() => setSelectedAgeGroup(selectedAgeGroup === age ? null : age)}
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

        {/* Experiences Grid */}
        {isLoadingData ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">프로그램을 불러오는 중...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperiences.map((exp) => (
            <div
              key={exp.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Image */}
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <img
                  src={exp.image}
                  alt={exp.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2">{exp.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{exp.institution}</p>

                {/* Details */}
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FiMapPin size={16} />
                    {exp.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <FiDollarSign size={16} />
                    {exp.price.toLocaleString()}원
                  </div>
                  <div className="flex items-center gap-2">
                    <FiUsers size={16} />
                    {exp.ageGroup}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-semibold text-gray-900">⭐ {exp.rating}</span>
                  <span className="text-sm text-gray-600">({exp.reviews}개 리뷰)</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/experiences/${exp.id}`)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    자세히 보기
                  </button>
                  <button
                    onClick={() => {
                      if (isBookmarked(exp.id)) {
                        removeBookmark(exp.id);
                      } else {
                        addBookmark({
                          id: exp.id,
                          name: exp.name,
                          institution: exp.institution,
                          price: exp.price,
                          ageGroup: exp.ageGroup,
                          rating: exp.rating,
                          bookmarkedAt: new Date().toISOString(),
                        });
                      }
                    }}
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
        )}

        {/* Pagination */}
        <div className="flex justify-center gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            이전
          </button>
          {[1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              className={`px-4 py-2 rounded-lg transition-colors ${
                page === 1
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            다음
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
