import React, { useState } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiPhone, FiTag, FiCreditCard } from 'react-icons/fi';
import {
  bookingRangeLabel,
  bookingWindowLabel,
  safeImageUrl,
  servicePeriodLabel,
  statusTone,
  type StatusTone,
} from '@/lib/programInfo';

/** 서울시 공공서비스예약에서 온 프로그램 정보 (정적 배포) */
export interface SeoulProgramFields {
  status?: string;
  statusLabel?: string | null;
  area?: string | null;
  category?: string | null;
  paymentInfo?: string | null;
  imageUrl?: string | null;
  contact?: string | null;
  bookingOpenAt?: string | null;
  bookingCloseAt?: string | null;
  serviceStartDate?: string | null;
  serviceEndDate?: string | null;
}

const TONE_CLASS: Record<StatusTone, string> = {
  open: 'bg-green-100 text-green-800',
  soon: 'bg-blue-100 text-blue-800',
  closed: 'bg-gray-200 text-gray-600',
  unknown: 'bg-gray-100 text-gray-600',
};

export function ProgramBadges({ program }: { program: SeoulProgramFields }) {
  const label = program.statusLabel;
  return (
    <div className="flex flex-wrap gap-1.5">
      {label && (
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold ${TONE_CLASS[statusTone(label, program.status)]}`}
        >
          {label}
        </span>
      )}
      {program.paymentInfo && (
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800">
          {program.paymentInfo}
        </span>
      )}
    </div>
  );
}

/** 카드용 접수·이용 한 줄씩 */
export function ProgramSchedule({ program }: { program: SeoulProgramFields }) {
  const booking = bookingWindowLabel(program.bookingOpenAt, program.bookingCloseAt);
  const period = servicePeriodLabel(program.serviceStartDate, program.serviceEndDate);
  if (!booking && !period) return null;
  return (
    <div className="space-y-1 text-sm text-gray-700">
      {booking && (
        <p className="flex items-center gap-1.5">
          <FiClock size={14} className="text-gray-400 shrink-0" />
          {booking}
        </p>
      )}
      {period && (
        <p className="flex items-center gap-1.5">
          <FiCalendar size={14} className="text-gray-400 shrink-0" />
          이용 {period}
        </p>
      )}
    </div>
  );
}

/** 상세 화면 정보 표 */
export function ProgramInfoTable({
  program,
  institutionName,
}: {
  program: SeoulProgramFields;
  institutionName: string;
}) {
  const rows: Array<[React.ReactNode, string, string | null | undefined]> = [
    [
      <FiClock key="c" />,
      '접수 기간',
      bookingRangeLabel(program.bookingOpenAt, program.bookingCloseAt),
    ],
    [
      <FiCalendar key="d" />,
      '이용 기간',
      servicePeriodLabel(program.serviceStartDate, program.serviceEndDate),
    ],
    [<FiCreditCard key="p" />, '요금', program.paymentInfo],
    [
      <FiMapPin key="m" />,
      '장소',
      [institutionName, program.area].filter(Boolean).join(' · ') || null,
    ],
    [<FiTag key="t" />, '분류', program.category],
    [<FiPhone key="ph" />, '문의', program.contact],
  ];

  return (
    <dl className="divide-y divide-gray-100">
      {rows
        .filter(([, , value]) => value)
        .map(([icon, label, value]) => (
          <div key={label} className="flex gap-3 py-2.5 text-sm">
            <dt className="flex items-center gap-1.5 w-24 shrink-0 text-gray-500">
              <span className="text-gray-400">{icon}</span>
              {label}
            </dt>
            <dd className="text-gray-900 break-words min-w-0">{value}</dd>
          </div>
        ))}
    </dl>
  );
}

/** 서울시가 주는 대표 사진. 없거나 못 불러오면 아이콘 */
export function ProgramImage({
  src,
  alt,
  className,
  iconSize = 64,
}: {
  src?: string | null;
  alt: string;
  className: string;
  iconSize?: number;
}) {
  const url = safeImageUrl(src);
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`${className} bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-400 overflow-hidden`}
    >
      {url && !failed ? (
        <img
          src={url}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <FiCalendar size={iconSize} />
      )}
    </div>
  );
}
