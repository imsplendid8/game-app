import { useEffect, useState } from 'react';
import axios from 'axios';

interface Experience {
  id: string;
  programName: string;
  description: string;
  bookingMethod: string;
  targetAgeMin?: number;
  targetAgeMax?: number;
  createdAt: string;
}

export default function Home() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/experiences`);
        setExperiences(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch experiences:', err);
        setError('Failed to load experiences. Make sure the API is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">WithDKIS</h1>
              <p className="text-gray-600 text-sm mt-1">
                아이 체험 프로그램 추적 시스템
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Phase 1 - Foundation</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-secondary">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            개발 진행 중
          </h2>
          <p className="text-gray-600">
            WithDKIS는 아이와 함께 참여할 수 있는 공공기관, 박물관, 과학관 등의 체험
            프로그램을 발견하고 추적하는 시스템입니다.
          </p>
        </div>

        {/* Experiences Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            체험 프로그램 목록
          </h2>

          {/* Status Messages */}
          {loading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-spin"></div>
              <span className="text-blue-700">데이터를 로드하는 중...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">⚠️ 오류</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <p className="text-red-600 text-sm mt-2">
                Backend API가 실행 중인지 확인하세요: http://localhost:3001
              </p>
            </div>
          )}

          {/* Experiences Grid */}
          {!loading && !error && experiences.length === 0 && (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <p className="text-gray-600 text-lg">
                아직 등록된 체험 프로그램이 없습니다.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                관리자 페이지에서 프로그램을 추가해주세요.
              </p>
            </div>
          )}

          {!loading && experiences.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 flex-1">
                        {exp.programName}
                      </h3>
                      <span className="inline-block bg-secondary/10 text-secondary px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2">
                        {exp.bookingMethod === 'FIRST_COME'
                          ? '선착순'
                          : exp.bookingMethod === 'LOTTERY'
                          ? '추첨'
                          : '상시'}
                      </span>
                    </div>

                    {exp.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {exp.description}
                      </p>
                    )}

                    {(exp.targetAgeMin || exp.targetAgeMax) && (
                      <p className="text-gray-500 text-xs mb-3">
                        📍 대상: {exp.targetAgeMin || '제한없음'} ~{' '}
                        {exp.targetAgeMax || '제한없음'} 세
                      </p>
                    )}

                    <p className="text-gray-400 text-xs">
                      {new Date(exp.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary">
            <p className="text-gray-600 text-sm">등록된 프로그램</p>
            <p className="text-3xl font-bold text-primary mt-2">
              {experiences.length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-secondary">
            <p className="text-gray-600 text-sm">개발 단계</p>
            <p className="text-3xl font-bold text-secondary mt-2">Phase 1</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-accent">
            <p className="text-gray-600 text-sm">API 상태</p>
            <p className="text-3xl font-bold text-accent mt-2">
              {error ? '❌' : '✅'}
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm">
            WithDKIS © 2025 · 아이 체험 프로그램 추적 시스템
          </p>
        </div>
      </footer>
    </div>
  );
}
