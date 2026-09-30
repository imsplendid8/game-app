import {
  bookingRangeLabel,
  bookingWindowLabel,
  safeImageUrl,
  servicePeriodLabel,
  statusTone,
} from '../programInfo';

const NOW = new Date(2026, 8, 30, 12, 0);

describe('servicePeriodLabel', () => {
  it('이미 시작한 상시 프로그램은 옛 시작일 대신 종료일만 보여준다', () => {
    expect(servicePeriodLabel('2015-09-23', '2026-10-30', NOW)).toBe('운영 중 · 2026.10.30까지');
    expect(servicePeriodLabel('2015-09-23', null, NOW)).toBe('운영 중');
    expect(servicePeriodLabel('2015-09-23', '2026-09-01', NOW)).toBe('운영 종료 (2026.09.01)');
  });

  it('앞으로의 프로그램은 기간 또는 날짜', () => {
    expect(servicePeriodLabel('2026-10-05', '2026-10-30', NOW)).toBe('2026.10.05 ~ 2026.10.30');
    expect(servicePeriodLabel('2026-10-05', '2026-10-05', NOW)).toBe('2026.10.05');
    expect(servicePeriodLabel(null, null, NOW)).toBeNull();
  });
});

describe('bookingWindowLabel', () => {
  it('접수 전 / 접수 중 / 마감', () => {
    expect(bookingWindowLabel(new Date(2026, 9, 5, 10).toISOString(), null, NOW)).toBe(
      '10월 5일 (월) 10:00 접수 시작'
    );
    expect(
      bookingWindowLabel(
        new Date(2026, 8, 1).toISOString(),
        new Date(2026, 9, 2, 18).toISOString(),
        NOW
      )
    ).toBe('10월 2일 (금) 18:00 접수 마감');
    expect(bookingWindowLabel(null, new Date(2026, 8, 1).toISOString(), NOW)).toBe(
      '접수 마감 (9월 1일 (화))'
    );
    expect(bookingWindowLabel(null, null, NOW)).toBeNull();
  });

  it('상세용 기간: 접수 전·마감은 전체 기간, 접수 중이면 마감만', () => {
    const open = new Date(2026, 9, 5, 9).toISOString();
    const close = new Date(2026, 9, 20, 18).toISOString();
    expect(bookingRangeLabel(open, close, NOW)).toBe('2026.10.05 09:00 ~ 2026.10.20 18:00');
    expect(bookingRangeLabel(new Date(2015, 8, 22, 15).toISOString(), close, NOW)).toBe(
      '접수 중 · 2026.10.20 18:00 마감'
    );
    expect(
      bookingRangeLabel(
        new Date(2026, 7, 1).toISOString(),
        new Date(2026, 8, 1, 18).toISOString(),
        NOW
      )
    ).toBe('2026.08.01 00:00 ~ 2026.09.01 18:00');
  });
});

describe('statusTone', () => {
  it('서울시 상태 이름을 색으로', () => {
    expect(statusTone('접수중')).toBe('open');
    expect(statusTone('안내중')).toBe('soon');
    expect(statusTone('예약마감')).toBe('closed');
    expect(statusTone('접수종료')).toBe('closed');
    expect(statusTone(null, 'OPEN')).toBe('open');
    expect(statusTone('기타')).toBe('unknown');
  });
});

describe('safeImageUrl', () => {
  it('https로 바꾸고 이상한 값은 버린다', () => {
    expect(safeImageUrl('http://yeyak.seoul.go.kr/a.jpg')).toBe('https://yeyak.seoul.go.kr/a.jpg');
    expect(safeImageUrl('https://x/a.png')).toBe('https://x/a.png');
    expect(safeImageUrl('//x/a.png')).toBe('https://x/a.png');
    expect(safeImageUrl('javascript:alert(1)')).toBeNull();
    expect(safeImageUrl(null)).toBeNull();
  });
});
