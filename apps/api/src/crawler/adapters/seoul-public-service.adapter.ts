import { Injectable } from '@nestjs/common';
import { ExperienceData, CrawlSchedule } from '../adapter.interface';
import { BaseAdapter } from './base.adapter';

interface SeoulServiceProgram {
  PROGID: string;
  PROGNM: string;
  PROGCONTENT: string;
  PROGURL: string;
  REVSTARTDATE: string;
  REVSTDT: string;
  REVEDT: string;
  REVPLANNUMBER: number;
  REVSTDPRICE: number;
  REVSTDPRICEDISCOUNT: number;
  REVSTDSNSYN: string;
  REVSTDSNSURL: string;
  LRNAGE: string;
}

@Injectable()
export class SeoulPublicServiceAdapter extends BaseAdapter {
  constructor() {
    super(
      'seoul-public-service',
      'https://api.seoul.go.kr/api/v2',
      CrawlSchedule.DAILY,
    );

    this.metadata.automationInfo = {
      isAutomatable: true,
      blockers: ['API key required - request from Seoul city government'],
      notes: 'Seoul city public programs API - family and children experiences',
    };
  }

  async fetchPrograms(): Promise<ExperienceData[]> {
    try {
      const apiKey = process.env.SEOUL_API_KEY;
      if (!apiKey) {
        throw new Error('SEOUL_API_KEY environment variable not set');
      }

      const response = await this.http.get('/familyProgram', {
        params: {
          apikey: apiKey,
          pageNo: 1,
          pageSize: 100,
        },
      });

      const programs = response.data.result?.row || [];
      return programs.map((program: SeoulServiceProgram) => this.mapProgram(program));
    } catch (error) {
      console.error('Seoul Public Service adapter error:', error);
      return [];
    }
  }

  private mapProgram(program: SeoulServiceProgram): ExperienceData {
    const capacity = program.REVPLANNUMBER || 0;
    const price = program.REVSTDPRICE || 0;

    return {
      externalId: program.PROGID,
      institutionName: '서울시 공공서비스',
      programName: program.PROGNM,
      description: program.PROGCONTENT,
      programUrl: program.PROGURL,
      bookingUrl: program.REVSTDSNSURL || program.PROGURL,
      experienceDate: this.parseDate(program.REVSTARTDATE) || undefined,
      bookingOpenAt: this.parseDate(program.REVSTDT),
      bookingCloseAt: this.parseDate(program.REVEDT),
      capacity,
      price,
      ageGroup: this.getAgeGroup(program.LRNAGE) || undefined,
      bookingMethod: 'FIRST_COME',
      status: this.determineStatus(program.REVSTDT, program.REVEDT),
      externalSource: 'seoul-public-service',
    };
  }

  private determineStatus(
    startDate: string,
    endDate: string,
  ): 'OPENING_SOON' | 'OPEN' | 'CLOSED' | 'UNKNOWN' {
    const now = new Date();
    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);

    if (!start || !end) return 'UNKNOWN';
    if (now < start) return 'OPENING_SOON';
    if (now <= end) return 'OPEN';
    return 'CLOSED';
  }
}
