import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchExperiences = async () => {
      try {
        setIsLoadingData(true);
        setError(null);
        const data = await apiClient.getExperiences();
        setExperiences(Array.isArray(data) ? data : []);
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

  const filteredExperiences = experiences.filter((exp) => {
    const matchesSearch = exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.institution.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !selectedFilter || selectedFilter === '전체' || exp.ageGroup.includes(selectedFilter);
    return matchesSearch && matchesFilter;
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="프로그램, 기관명 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Button */}
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FiFilter size={20} />
            필터
          </button>
        </div>

        {/* Age Group Filter */}
        <div className="flex gap-2 flex-wrap">
          {['전체', '4-6세', '6-10세', '10-14세', '14-18세'].map((age) => (
            <button
              key={age}
              onClick={() => setSelectedFilter(selectedFilter === age ? null : age)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                selectedFilter === age
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
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <FiBookmark size={20} />
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
