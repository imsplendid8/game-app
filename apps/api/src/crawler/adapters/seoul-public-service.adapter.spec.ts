import { SeoulPublicServiceAdapter } from './seoul-public-service.adapter';

/**
 * 서울 열린데이터광장 공공서비스예약 API 응답 형태를 고정해 두고 매핑을 검증한다.
 * 실제 호출 없이 필드 매핑이 깨지는 것을 잡는 용도.
 */
const educationRow = {
  GUBUN: '교육체험',
  SVCID: 'S240101000000001',
  MAXCLASSNM: '교육체험',
  MINCLASSNM: '문화교양',
  SVCSTATNM: '접수중',
  SVCNM: '어린이 목공 교실',
  PAYATNM: '유료',
  PLACENM: '서울시립과학관',
  USETGTINFO: '초등 3-6학년',
  SVCURL: 'https://yeyak.seoul.go.kr/web/reservation/selectReservView.do?rsv_svc_id=S240101000000001',
  RCPTBGNDT: '2026-09-01 10:00:00.0',
  RCPTENDDT: '2026-09-20 18:00:00.0',
  SVCOPNBGNDT: '2026-09-26 00:00:00.0',
  SVCOPNENDDT: '2026-09-26 00:00:00.0',
  AREANM: '노원구',
  DTLCONT: '목공 도구로 나만의 소품을 만드는 체험입니다.',
};

const freeCultureRow = {
  SVCID: 'S240101000000002',
  SVCNM: '가족 천체 관측회',
  SVCSTATNM: '안내중',
  PAYATNM: '무료',
  PLACENM: '서울시립천문대',
  SVCURL: 'https://yeyak.seoul.go.kr/web/reservation/x',
  SVCOPNBGNDT: '2026-10-05 00:00:00.0',
};

const buildAdapter = (payload: unknown) => {
  const adapter = new SeoulPublicServiceAdapter();
  const get = jest.fn().mockResolvedValue({ data: payload });
  // BaseAdapter가 만든 axios 인스턴스를 테스트용으로 대체한다.
  (adapter as unknown as { http: { get: jest.Mock } }).http = { get };
  return { adapter, get };
};

describe('SeoulPublicServiceAdapter', () => {
  const originalKey = process.env.SEOUL_OPENAPI_KEY;

  afterEach(() => {
    process.env.SEOUL_OPENAPI_KEY = originalKey;
    if (originalKey === undefined) delete process.env.SEOUL_OPENAPI_KEY;
  });

  it('인증키가 없으면 호출하지 않고 빈 배열을 돌려준다', async () => {
    delete process.env.SEOUL_OPENAPI_KEY;
    const { adapter, get } = buildAdapter({});

    await expect(adapter.fetchPrograms()).resolves.toEqual([]);
    expect(get).not.toHaveBeenCalled();
  });

  it('교육체험 응답을 ExperienceData로 매핑한다', async () => {
    process.env.SEOUL_OPENAPI_KEY = 'test-key';
    const { adapter, get } = buildAdapter({
      ListPublicReservationEducation: {
        list_total_count: 1,
        RESULT: { CODE: 'INFO-000', MESSAGE: '정상 처리되었습니다' },
        row: [educationRow],
      },
    });

    const programs = await adapter.fetchPrograms();
    const program = programs.find((p) => p.externalId === 'S240101000000001');

    expect(get).toHaveBeenCalledWith(
      '/test-key/json/ListPublicReservationEducation/1/1000/',
    );
    expect(program).toMatchObject({
      institutionName: '서울시립과학관',
      programName: '어린이 목공 교실',
      description: '목공 도구로 나만의 소품을 만드는 체험입니다.',
      programUrl: educationRow.SVCURL,
      status: 'OPEN',
      ageGroup: '3-6',
      bookingMethod: 'FIRST_COME',
      externalSource: 'ListPublicReservationEducation',
    });
    expect(program!.experienceDate).toEqual(new Date('2026-09-26T00:00:00'));
    expect(program!.bookingOpenAt).toEqual(new Date('2026-09-01T10:00:00'));
    expect(program!.bookingCloseAt).toEqual(new Date('2026-09-20T18:00:00'));
  });

  it('무료 프로그램은 가격 0으로, 안내중은 OPENING_SOON으로 매핑한다', async () => {
    process.env.SEOUL_OPENAPI_KEY = 'test-key';
    const { adapter } = buildAdapter({
      ListPublicReservationCulture: {
        list_total_count: 1,
        RESULT: { CODE: 'INFO-000' },
        row: [freeCultureRow],
      },
    });

    const programs = await adapter.fetchPrograms();
    const program = programs.find((p) => p.externalId === 'S240101000000002');

    expect(program).toMatchObject({ price: 0, status: 'OPENING_SOON' });
  });

  it('SVCID나 SVCNM이 없는 행은 건너뛴다', async () => {
    process.env.SEOUL_OPENAPI_KEY = 'test-key';
    const { adapter } = buildAdapter({
      ListPublicReservationEducation: {
        list_total_count: 2,
        RESULT: { CODE: 'INFO-000' },
        row: [{ SVCNM: '이름만 있음' }, educationRow],
      },
    });

    const programs = await adapter.fetchPrograms();

    expect(programs).toHaveLength(1);
    expect(programs[0].externalId).toBe('S240101000000001');
  });

  it('인증키 오류 응답은 해당 서비스만 건너뛰고 크롤을 이어간다', async () => {
    process.env.SEOUL_OPENAPI_KEY = 'bad-key';
    const { adapter } = buildAdapter({
      RESULT: { CODE: 'INFO-100', MESSAGE: '인증키가 유효하지 않습니다.' },
    });

    await expect(adapter.fetchPrograms()).resolves.toEqual([]);
  });
});
