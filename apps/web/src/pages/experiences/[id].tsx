import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { MainLayout } from '@/components/layouts/MainLayout';
import {
  FiArrowLeft,
  FiMapPin,
  FiUsers,
  FiBookmark,
  FiShare2,
  FiStar,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
} from 'react-icons/fi';

export default function ExperienceDetailPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { id } = router.query;
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  React.useEffect(() => {
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

  const experience = {
    id: parseInt(id as string) || 1,
    name: '과학관 과학 체험',
    institution: '국립과학관',
    location: '서울시 강남구 테헤란로 123',
    price: 15000,
    ageGroup: '6-10세',
    rating: 4.8,
    reviews: 245,
    duration: 120,
    maxParticipants: 15,
    images: [
      'https://via.placeholder.com/600x400',
      'https://via.placeholder.com/600x400',
      'https://via.placeholder.com/600x400',
    ],
    description:
      '아이들이 직접 과학 실험을 해보고 과학의 원리를 배우는 프로그램입니다. 전문 강사가 진행하며, 안전하고 재미있는 체험을 통해 과학에 대한 흥미를 높일 수 있습니다.',
    details: [
      '🔬 초등학생 수준의 다양한 과학 실험',
      '👨‍🏫 경험 많은 과학 교육 전문가',
      '🎓 체험 후 수료증 제공',
      '👥 최대 15명의 소규모 그룹',
      '⏱️ 약 2시간 소요',
      '🎁 기념품 제공',
    ],
    availableDates: [
      '2024-09-16',
      '2024-09-17',
      '2024-09-20',
      '2024-09-23',
      '2024-09-24',
      '2024-09-27',
    ],
    reviews_list: [
      {
        author: '김철수',
        rating: 5,
        date: '2024-09-01',
        text: '아이가 정말 즐거워했어요. 선생님이 친절하고 설명도 재미있게 해주셨습니다.',
      },
      {
        author: '이영희',
        rating: 4,
        date: '2024-08-25',
        text: '좋은 경험이었습니다. 다만 준비 시간이 조금 더 있으면 좋을 것 같습니다.',
      },
      {
        author: '박민수',
        rating: 5,
        date: '2024-08-15',
        text: '과학에 관심이 없던 아이도 재미있어 했습니다. 추천합니다!',
      },
    ],
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? experience.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === experience.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleBooking = () => {
    if (!selectedDate) {
      alert('날짜를 선택해주세요');
      return;
    }
    router.push('/bookings');
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
        <div className="relative bg-gray-200 rounded-lg overflow-hidden aspect-video">
          <img
            src={experience.images[currentImageIndex]}
            alt={experience.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {experience.images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 hover:bg-gray-200 transition-colors"
              >
                <FiChevronLeft size={24} />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 hover:bg-gray-200 transition-colors"
              >
                <FiChevronRight size={24} />
              </button>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {experience.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentImageIndex ? 'bg-white w-6' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{experience.name}</h1>
                  <p className="text-gray-600 mt-2">{experience.institution}</p>
                </div>
                <button className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                  <FiBookmark size={24} className="text-gray-600" />
                </button>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      size={18}
                      className={
                        i < Math.floor(experience.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                  <span className="ml-2 font-semibold text-gray-900">
                    {experience.rating}
                  </span>
                </div>
                <span className="text-gray-600">
                  ({experience.reviews}개 리뷰)
                </span>
              </div>

              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                <FiShare2 size={18} />
                공유하기
              </button>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">프로그램 설명</h3>
              <p className="text-gray-700 leading-relaxed">{experience.description}</p>
            </div>

            {/* Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">프로그램 특징</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {experience.details.map((detail, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-700">
                    <span className="text-2xl">{detail.charAt(0)}</span>
                    <span>{detail.slice(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">리뷰 ({experience.reviews})</h3>
              <div className="space-y-4">
                {experience.reviews_list.map((review, i) => (
                  <div key={i} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{review.author}</span>
                      <span className="text-sm text-gray-600">{review.date}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, j) => (
                        <FiStar
                          key={j}
                          size={16}
                          className={
                            j < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }
                        />
                      ))}
                    </div>
                    <p className="text-gray-700">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Booking */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6 sticky top-20">
              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-blue-600">
                    {experience.price.toLocaleString()}원
                  </span>
                  <span className="text-gray-600">/ 1인</span>
                </div>
                <p className="text-sm text-gray-600">{experience.ageGroup}</p>
              </div>

              {/* Info Grid */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <FiClock size={18} className="text-gray-400" />
                  <span>소요 시간: {experience.duration}분</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <FiUsers size={18} className="text-gray-400" />
                  <span>최대 {experience.maxParticipants}명</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <FiMapPin size={18} className="text-gray-400" />
                  <span>{experience.location}</span>
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">날짜 선택</h4>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {experience.availableDates.map((date) => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`py-2 px-3 rounded border text-sm transition-colors ${
                        selectedDate === date
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      {new Date(date).getDate()}일
                    </button>
                  ))}
                </div>
                {selectedDate && (
                  <p className="text-sm text-gray-600">
                    선택: {new Date(selectedDate).toLocaleDateString('ko-KR')}
                  </p>
                )}
              </div>

              {/* Participant Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">인원</h4>
                <select
                  value={selectedParticipants}
                  onChange={(e) => setSelectedParticipants(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[...Array(experience.maxParticipants)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}명
                    </option>
                  ))}
                </select>
              </div>

              {/* Total Price */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">총 가격</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(experience.price * selectedParticipants).toLocaleString()}원
                  </p>
                </div>
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
