import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { apiClient } from '@/lib/api';
import { MainLayout } from '@/components/layouts/MainLayout';
import {
  dDayLabel,
  daysFromToday,
  formatMonthDay,
  formatTime,
  selectUpcoming,
  sumMonthSpend,
} from '@/lib/bookingDates';
import {
  FiCalendar,
  FiBell,
  FiBookmark,
  FiCreditCard,
  FiClock,
  FiExternalLink,
  FiUsers,
} from 'react-icons/fi';

interface Booking {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  experienceDate: string;
  totalPrice?: number | null;
  selectedChildren?: Array<{ id: string; name: string; age: number }>;
  experience?: {
    id: string;
    programName: string;
    institution?: { institutionName: string };
  };
}

interface ScheduleRun {
  id: string;
  bookingOpenAt: string | null;
  bookingCloseAt: string | null;
  price: number | null;
  experience: {
    id: string;
    programName: string;
    programUrl?: string | null;
    bookingUrl?: string | null;
    institution?: { institutionName: string };
  };
}

function childNames(booking: Booking): string {
  const names = (booking.selectedChildren ?? []).map((child) => child.name).filter(Boolean);
  return names.length > 0 ? names.join(', ') : `${booking.selectedChildren?.length ?? 0}명`;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { bookmarks, hydrate: hydrateBookmarks } = useBookmarkStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [schedule, setSchedule] = useState<ScheduleRun[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [bookingsError, setBookingsError] = useState(false);
  const [scheduleError, setScheduleError] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    hydrateBookmarks();

    const load = async () => {
      setIsLoadingData(true);
      // 하나가 실패해도 나머지는 보여준다.
      const [bookingsResult, scheduleResult, notificationsResult] = await Promise.allSettled([
        apiClient.getBookings(),
        apiClient.getBookingSchedule(14),
        apiClient.getNotifications(),
      ]);

      if (bookingsResult.status === 'fulfilled') {
        const data = bookingsResult.value;
        setBookings(Array.isArray(data) ? data : data?.data ?? []);
        setBookingsError(false);
      } else {
        setBookingsError(true);
      }

      if (scheduleResult.status === 'fulfilled') {
        setSchedule(Array.isArray(scheduleResult.value) ? scheduleResult.value : []);
        setScheduleError(false);
      } else {
        setScheduleError(true);
      }

      if (notificationsResult.status === 'fulfilled' && Array.isArray(notificationsResult.value)) {
        setUnreadCount(notificationsResult.value.length);
      }

      setIsLoadingData(false);
    };

    load();
  }, [isAuthenticated, hydrateBookmarks]);

  const upcoming = useMemo(() => selectUpcoming(bookings), [bookings]);
  const monthSpend = useMemo(() => sumMonthSpend(bookings), [bookings]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  const today = new Date();
  const nextUp = upcoming[0];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 인사 + 가장 가까운 일정 */}
        <section className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-6 md:p-8 text-white">
          <p className="text-blue-100 text-sm">{formatMonthDay(today)}</p>
          <h1 className="text-2xl md:text-3xl font-bold mt-1">
            안녕하세요, {user?.profileName || '보호자'}님
          </h1>
          <p className="text-blue-50 mt-3">
            {isLoadingData
              ? '일정을 불러오는 중...'
              : nextUp
                ? `다음 체험: ${dDayLabel(nextUp.days)} · ${nextUp.booking.experience?.programName ?? '프로그램'}`
                : '예정된 체험이 없어요.'}
          </p>
        </section>

        {/* 요약 */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="다가오는 체험"
            value={isLoadingData ? '–' : `${upcoming.length}건`}
            icon={<FiCalendar className="text-blue-600" size={22} />}
            iconBg="bg-blue-100"
            href="/bookings"
          />
          <StatCard
            label={`${today.getMonth() + 1}월 체험비`}
            value={isLoadingData ? '–' : `${monthSpend.toLocaleString()}원`}
            icon={<FiCreditCard className="text-emerald-600" size={22} />}
            iconBg="bg-emerald-100"
            href="/bookings"
          />
          <StatCard
            label="새 알림"
            value={isLoadingData ? '–' : `${unreadCount}건`}
            icon={<FiBell className="text-orange-600" size={22} />}
            iconBg="bg-orange-100"
            href="/notifications"
          />
          <StatCard
            label="찜한 프로그램"
            value={`${bookmarks.length}개`}
            icon={<FiBookmark className="text-purple-600" size={22} />}
            iconBg="bg-purple-100"
            href="/experiences/saved"
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* 다가오는 체험 */}
          <section className="lg:col-span-3 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">다가오는 체험</h2>
              <Link href="/bookings" className="text-sm text-blue-600 hover:text-blue-700">
                전체 보기
              </Link>
            </div>

            {isLoadingData ? (
              <p className="text-gray-500 py-8 text-center">불러오는 중...</p>
            ) : bookingsError ? (
              <p className="text-red-600 py-8 text-center">예약 정보를 불러오지 못했습니다.</p>
            ) : upcoming.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-gray-600 mb-4">예정된 체험이 없어요.</p>
                <Link
                  href="/experiences"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  프로그램 둘러보기
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {upcoming.slice(0, 5).map(({ booking, date, days }) => {
                  return (
                    <li key={booking.id}>
                      <Link
                        href={`/bookings/${booking.id}`}
                        className="flex items-center gap-4 border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/40 transition-colors"
                      >
                        <div
                          className={`shrink-0 w-14 sm:w-16 text-center rounded-lg py-2 font-bold ${
                            days <= 1 ? 'bg-red-100 text-red-700' : days <= 7 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {dDayLabel(days)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate">
                            {booking.experience?.programName ?? '프로그램'}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {booking.experience?.institution?.institutionName ?? '-'}
                          </p>
                          <p className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                            <span className="whitespace-nowrap">{formatMonthDay(date)}</span>
                            <span className="flex items-center gap-1 whitespace-nowrap">
                              <FiUsers size={13} /> {childNames(booking)}
                            </span>
                          </p>
                        </div>
                        {booking.status === 'PENDING' && (
                          <span className="shrink-0 whitespace-nowrap px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">
                            대기 중
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* 접수 일정 */}
          <section className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">접수 일정</h2>
              <p className="text-xs text-gray-500 mt-1">접수 중이거나 2주 안에 접수가 시작되는 프로그램</p>
            </div>

            {isLoadingData ? (
              <p className="text-gray-500 py-8 text-center">불러오는 중...</p>
            ) : scheduleError ? (
              <p className="text-red-600 py-8 text-center">접수 일정을 불러오지 못했습니다.</p>
            ) : schedule.length === 0 ? (
              <p className="text-gray-600 py-8 text-center text-sm">
                지금 확인된 접수 일정이 없어요.
                <br />
                크롤러가 새 프로그램을 가져오면 여기에 표시됩니다.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {schedule.slice(0, 8).map((run) => (
                  <ScheduleItem key={run.id} run={run} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </MainLayout>
  );
}

function StatCard({
  label,
  value,
  icon,
  iconBg,
  href,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  href: string;
}) {
  return (
    <Link href={href} className="bg-white rounded-lg shadow p-4 sm:p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-gray-600 text-sm whitespace-nowrap">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 whitespace-nowrap">{value}</p>
        </div>
        <div className={`${iconBg} p-2.5 rounded-lg shrink-0 hidden sm:block`}>{icon}</div>
      </div>
    </Link>
  );
}

function ScheduleItem({ run }: { run: ScheduleRun }) {
  const now = new Date();
  const openAt = run.bookingOpenAt ? new Date(run.bookingOpenAt) : null;
  const closeAt = run.bookingCloseAt ? new Date(run.bookingCloseAt) : null;
  const isOpen = openAt !== null && openAt <= now;
  const externalUrl = run.experience.bookingUrl || run.experience.programUrl;

  const body = (
    <div className="py-3 flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-gray-900 truncate">{run.experience.programName}</p>
        <p className="text-xs text-gray-500 truncate">{run.experience.institution?.institutionName ?? '-'}</p>
        <p className="text-sm mt-1 flex items-center gap-1 text-gray-700">
          <FiClock size={13} />
          {isOpen
            ? closeAt
              ? `${formatMonthDay(closeAt)} ${formatTime(closeAt)} 마감`
              : '접수 중'
            : openAt
              ? `${formatMonthDay(openAt)} ${formatTime(openAt)} 접수 시작`
              : '접수 일정 미정'}
        </p>
      </div>
      <div className="shrink-0 flex flex-col items-end gap-1">
        {isOpen ? (
          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-green-100 text-green-800">접수 중</span>
        ) : openAt ? (
          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800">
            {dDayLabel(daysFromToday(openAt))}
          </span>
        ) : null}
        {externalUrl && <FiExternalLink size={14} className="text-gray-400" />}
      </div>
    </div>
  );

  return (
    <li>
      {externalUrl ? (
        <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-50 -mx-2 px-2 rounded">
          {body}
        </a>
      ) : (
        <Link href={`/experiences/${run.experience.id}`} className="block hover:bg-gray-50 -mx-2 px-2 rounded">
          {body}
        </Link>
      )}
    </li>
  );
}
