import { Injectable, Logger } from '@nestjs/common';
import { ExperienceData, CrawlSchedule } from '../adapter.interface';
import { BaseAdapter } from './base.adapter';

/**
 * 서울 열린데이터광장 "공공서비스예약" 오픈 API 어댑터.
 *
 * 인증키 발급: https://data.seoul.go.kr → 로그인 → 인증키 신청 (즉시 발급, 무료)
 * 발급받은 키를 SEOUL_OPENAPI_KEY 환경변수에 넣으면 동작한다.
 *
 * 요청 형식: /{KEY}/json/{SERVICE}/{START}/{END}/
 * 서비스: ListPublicReservationEducation(교육체험), ListPublicReservationCulture(문화행사)
 */
export const SEOUL_SERVICES = [
  'ListPublicReservationEducation',
  'ListPublicReservationCulture',
] as const;

/** 한 번의 요청으로 받을 수 있는 최대 건수 (서울 오픈API 제한) */
const PAGE_SIZE = 1000;

interface SeoulReservationRow {
  SVCID?: string;
  SVCNM?: string;
  DTLCONT?: string;
  PLACENM?: string;
  SVCURL?: string;
  SVCSTATNM?: string;
  PAYATNM?: string;
  USETGTINFO?: string;
  RCPTBGNDT?: string;
  RCPTENDDT?: string;
  SVCOPNBGNDT?: string;
  SVCOPNENDDT?: string;
  AREANM?: string;
  MAXCLASSNM?: string;
  MINCLASSNM?: string;
}

interface SeoulServiceBody {
  list_total_count?: number;
  RESULT?: { CODE?: string; MESSAGE?: string };
  row?: SeoulReservationRow[];
}

@Injectable()
export class SeoulPublicServiceAdapter extends BaseAdapter {
  private readonly logger = new Logger(SeoulPublicServiceAdapter.name);

  constructor() {
    super(
      'seoul-public-service',
      'http://openapi.seoul.go.kr:8088',
      CrawlSchedule.DAILY,
    );

    this.metadata.automationInfo = {
      isAutomatable: true,
      blockers: [],
      notes:
        '서울 열린데이터광장 공공서비스예약 API. SEOUL_OPENAPI_KEY 필요 (data.seoul.go.kr에서 즉시 무료 발급).',
    };
  }

  async fetchPrograms(): Promise<ExperienceData[]> {
    const apiKey = process.env.SEOUL_OPENAPI_KEY;
    if (!apiKey) {
      this.logger.warn(
        'SEOUL_OPENAPI_KEY가 설정되지 않아 서울 공공서비스예약 크롤을 건너뜁니다. ' +
          'https://data.seoul.go.kr 에서 인증키를 발급받아 .env에 넣어주세요.',
      );
      return [];
    }

    const programs: ExperienceData[] = [];

    for (const service of SEOUL_SERVICES) {
      try {
        programs.push(...(await this.fetchService(apiKey, service)));
      } catch (error) {
        this.logger.error(
          `${service} 조회 실패: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return programs;
  }

  private async fetchService(
    apiKey: string,
    service: string,
  ): Promise<ExperienceData[]> {
    const collected: ExperienceData[] = [];
    let start = 1;

    for (;;) {
      const end = start + PAGE_SIZE - 1;
      const response = await this.http.get(
        `/${apiKey}/json/${service}/${start}/${end}/`,
      );
      const body: SeoulServiceBody | undefined = response.data?.[service];

      if (!body) {
        // 인증키 오류·호출한도 초과 등은 서비스 키 없이 RESULT만 돌려준다.
        const result = response.data?.RESULT;
        throw new Error(
          `예상과 다른 응답: ${result?.CODE ?? '?'} ${result?.MESSAGE ?? JSON.stringify(response.data).slice(0, 200)}`,
        );
      }

      if (body.RESULT?.CODE && !body.RESULT.CODE.startsWith('INFO-000')) {
        throw new Error(`${body.RESULT.CODE} ${body.RESULT.MESSAGE ?? ''}`);
      }

      const rows = body.row ?? [];
      const mapped = rows
        .map((row) => this.mapRow(row, service))
        .filter((program): program is ExperienceData => program !== null);

      if (rows.length > 0 && mapped.length === 0) {
        // 필드명이 바뀌면 조용히 0건이 되므로 실제 키를 남겨 원인을 바로 알 수 있게 한다.
        this.logger.warn(
          `${service}: ${rows.length}건을 받았지만 매핑된 항목이 없습니다. 응답 필드: ${Object.keys(rows[0]).join(', ')}`,
        );
      }

      collected.push(...mapped);

      const total = body.list_total_count ?? rows.length;
      if (rows.length < PAGE_SIZE || end >= total) break;
      start = end + 1;
    }

    this.logger.log(`${service}: ${collected.length}건 수집`);
    return collected;
  }

  private mapRow(
    row: SeoulReservationRow,
    service: string,
  ): ExperienceData | null {
    if (!row.SVCID || !row.SVCNM) return null;

    return {
      externalId: row.SVCID,
      institutionName: row.PLACENM?.trim() || '서울시 공공서비스예약',
      programName: row.SVCNM.trim(),
      description: row.DTLCONT?.trim() || undefined,
      programUrl: row.SVCURL || undefined,
      bookingUrl: row.SVCURL || undefined,
      experienceDate: this.parseSeoulDate(row.SVCOPNBGNDT),
      bookingOpenAt: this.parseSeoulDate(row.RCPTBGNDT),
      bookingCloseAt: this.parseSeoulDate(row.RCPTENDDT),
      price: row.PAYATNM?.includes('무료') ? 0 : undefined,
      ageGroup: this.getAgeGroup(row.USETGTINFO ?? '') || undefined,
      bookingMethod: 'FIRST_COME',
      status: this.mapStatus(row.SVCSTATNM),
      externalSource: service,
    };
  }

  /** "2026-09-21 09:00:00.0" 형태를 Date로 변환 */
  private parseSeoulDate(value?: string): Date | null {
    if (!value) return null;
    return this.parseDate(value.replace(/\.0$/, '').replace(' ', 'T'));
  }

  private mapStatus(
    statusName?: string,
  ): 'OPENING_SOON' | 'OPEN' | 'CLOSED' | 'UNKNOWN' {
    switch (statusName) {
      case '접수중':
        return 'OPEN';
      case '안내중':
        return 'OPENING_SOON';
      case '예약마감':
      case '접수종료':
      case '기간만료':
        return 'CLOSED';
      default:
        return 'UNKNOWN';
    }
  }
}
