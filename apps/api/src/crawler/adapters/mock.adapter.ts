import { Injectable } from '@nestjs/common';
import { Adapter, AdapterMetadata, ExperienceData, CrawlSchedule, CrawlResult } from '../adapter.interface';

interface MockProgram {
  id: string;
  name: string;
  institution: string;
  description: string;
  ageGroups: string[];
  prices: number[];
  capacity: number;
  bookingMethods: Array<'FIRST_COME' | 'LOTTERY' | 'ALWAYS_AVAILABLE'>;
  daysOfWeek?: number[];
}

/**
 * Enhanced Mock Adapter - generates diverse, realistic test data
 * Simulates programs across different age groups, prices, and booking methods
 */
@Injectable()
export class MockAdapter implements Adapter {
  metadata: AdapterMetadata = {
    name: 'mock',
    schedule: CrawlSchedule.DAILY,
    enabled: true,
    automationInfo: {
      isAutomatable: false,
      blockers: [],
      notes: 'Mock adapter - generates diverse test data for development',
    },
  };

  private programs: MockProgram[] = [
    // Museums & Cultural
    {
      id: 'mock-museum-001',
      name: '어린이 역사 도슨트 프로그램',
      institution: '국립박물관',
      description: '박물관 유물을 설명하는 도슨트 프로그램으로 한국 역사를 배웁니다',
      ageGroups: ['6-12', '7-13'],
      prices: [0],
      capacity: 30,
      bookingMethods: ['FIRST_COME'],
      daysOfWeek: [2, 3, 4, 5, 6],
    },
    {
      id: 'mock-museum-002',
      name: '한지 공예 체험',
      institution: '한국종이박물관',
      description: '전통 한지 제작 과정을 배우고 직접 한지를 만들어봅니다',
      ageGroups: ['5-10', '6-12', '7-13'],
      prices: [8000],
      capacity: 20,
      bookingMethods: ['FIRST_COME', 'LOTTERY'],
    },
    {
      id: 'mock-museum-003',
      name: '조선시대 복식 입어보기',
      institution: '서울역사박물관',
      description: '조선시대 의상을 입고 역사 속으로 떠나는 체험',
      ageGroups: ['4-8', '6-12'],
      prices: [5000],
      capacity: 25,
      bookingMethods: ['FIRST_COME'],
    },

    // Science & Nature
    {
      id: 'mock-science-001',
      name: '생명과학 실험실',
      institution: '서울 과학관',
      description: '세포와 생명에 대해 배우고 현미경으로 관찰 실험을 합니다',
      ageGroups: ['7-13', '8-14'],
      prices: [0],
      capacity: 40,
      bookingMethods: ['FIRST_COME'],
      daysOfWeek: [2, 3, 4, 5, 6],
    },
    {
      id: 'mock-science-002',
      name: '로봇 만들기 기초',
      institution: '대덕과학센터',
      description: '전자부품을 이용해 간단한 로봇을 만드는 STEAM 프로그램',
      ageGroups: ['6-12', '8-14'],
      prices: [12000],
      capacity: 15,
      bookingMethods: ['LOTTERY'],
    },
    {
      id: 'mock-science-003',
      name: '우주 천문학 강연',
      institution: '국립과학관',
      description: '우주와 별에 대한 이야기와 망원경을 통한 관찰',
      ageGroups: ['7-13', '10-16'],
      prices: [0, 3000],
      capacity: 50,
      bookingMethods: ['ALWAYS_AVAILABLE'],
    },

    // Farm & Nature
    {
      id: 'mock-farm-001',
      name: '낙농 체험 투어',
      institution: '서울우유 목장',
      description: '우유 생산 과정을 체험하고 직접 버터와 치즈를 만들어봅니다',
      ageGroups: ['5-10', '6-12'],
      prices: [5000],
      capacity: 50,
      bookingMethods: ['LOTTERY'],
    },
    {
      id: 'mock-farm-002',
      name: '유기농 채소 재배 체험',
      institution: '도시 텃밭 센터',
      description: '유기농 채소를 직접 심고 수확하는 체험과 요리 클래스',
      ageGroups: ['4-10', '6-12'],
      prices: [7000],
      capacity: 30,
      bookingMethods: ['FIRST_COME'],
      daysOfWeek: [5, 6],
    },

    // Arts & Crafts
    {
      id: 'mock-arts-001',
      name: '도자기 핸드메이드',
      institution: '서울도자미술관',
      description: '전문가와 함께 도자기를 빚고 구우우는 체험 프로그램',
      ageGroups: ['7-13', '8-14'],
      prices: [15000],
      capacity: 12,
      bookingMethods: ['FIRST_COME'],
    },
    {
      id: 'mock-arts-002',
      name: '판화 예술 기초',
      institution: '현대미술관 교육센터',
      description: '다양한 판화 기법을 배우고 작품을 만드는 워크숍',
      ageGroups: ['6-12', '8-14'],
      prices: [10000],
      capacity: 20,
      bookingMethods: ['FIRST_COME', 'LOTTERY'],
    },

    // Sports & Adventure
    {
      id: 'mock-sports-001',
      name: '암벽 클라이밍 입문',
      institution: '청소년 스포츠센터',
      description: '안전 장비와 전문 강사와 함께 시작하는 클라이밍',
      ageGroups: ['8-14', '10-16'],
      prices: [25000],
      capacity: 10,
      bookingMethods: ['FIRST_COME'],
    },
    {
      id: 'mock-sports-002',
      name: '승마 체험',
      institution: '서울 승마 센터',
      description: '마사 케어부터 기본 승마까지 배우는 프로그램',
      ageGroups: ['6-12', '8-14'],
      prices: [30000],
      capacity: 8,
      bookingMethods: ['LOTTERY'],
    },

    // Technology & Coding
    {
      id: 'mock-tech-001',
      name: '스크래치 프로그래밍 기초',
      institution: '코딩 학교',
      description: '블록 기반 프로그래밍으로 게임과 애니메이션 만들기',
      ageGroups: ['6-12', '7-13'],
      prices: [35000],
      capacity: 25,
      bookingMethods: ['FIRST_COME'],
    },
    {
      id: 'mock-tech-002',
      name: '드론 조종 기초',
      institution: '청소년 드론센터',
      description: '드론의 원리를 배우고 실제로 조종해보는 체험',
      ageGroups: ['8-14', '10-16'],
      prices: [20000],
      capacity: 15,
      bookingMethods: ['LOTTERY'],
    },
  ];

  async fetchPrograms(): Promise<ExperienceData[]> {
    return this.programs.map((program, index) => this.generateProgram(program, index));
  }

  private generateProgram(program: MockProgram, index: number): ExperienceData {
    const today = new Date();
    const status = index % 4;
    let experienceDate: Date;
    let bookingOpenAt: Date;
    let bookingCloseAt: Date;

    switch (status) {
      case 0: // OPENING_SOON
        experienceDate = new Date(today.getTime() + (15 + index % 5) * 24 * 60 * 60 * 1000);
        bookingOpenAt = new Date(today.getTime() + (8 + index % 3) * 24 * 60 * 60 * 1000);
        bookingCloseAt = new Date(experienceDate.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 1: // OPEN
        experienceDate = new Date(today.getTime() + (5 + index % 7) * 24 * 60 * 60 * 1000);
        bookingOpenAt = new Date(today.getTime() - (3 + index % 5) * 24 * 60 * 60 * 1000);
        bookingCloseAt = new Date(experienceDate.getTime() - 12 * 60 * 60 * 1000);
        break;
      case 2: // CLOSED
        experienceDate = new Date(today.getTime() - (5 + index % 10) * 24 * 60 * 60 * 1000);
        bookingOpenAt = new Date(experienceDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        bookingCloseAt = new Date(experienceDate.getTime() - 24 * 60 * 60 * 1000);
        break;
      default: // OPENING_SOON (another batch)
        experienceDate = new Date(today.getTime() + (25 + index % 10) * 24 * 60 * 60 * 1000);
        bookingOpenAt = new Date(today.getTime() + (12 + index % 5) * 24 * 60 * 60 * 1000);
        bookingCloseAt = new Date(experienceDate.getTime() - 24 * 60 * 60 * 1000);
    }

    const ageGroup = program.ageGroups[index % program.ageGroups.length];
    const price = program.prices[index % program.prices.length];
    const bookingMethod = program.bookingMethods[index % program.bookingMethods.length];

    return {
      externalId: program.id,
      institutionName: program.institution,
      programName: program.name,
      description: program.description,
      programUrl: `https://example.com/programs/${program.id}`,
      bookingUrl: `https://booking.example.com/programs/${program.id}`,
      experienceDate,
      bookingOpenAt,
      bookingCloseAt,
      capacity: program.capacity,
      price,
      ageGroup,
      bookingMethod,
      status: this.determineStatus(bookingOpenAt, bookingCloseAt),
      externalSource: 'mock',
    };
  }

  private determineStatus(
    bookingOpenAt: Date,
    bookingCloseAt: Date,
  ): 'OPENING_SOON' | 'OPEN' | 'CLOSED' | 'UNKNOWN' {
    const now = new Date();
    if (now < bookingOpenAt) return 'OPENING_SOON';
    if (now <= bookingCloseAt) return 'OPEN';
    return 'CLOSED';
  }

  async fetchProgramUpdates(
    lastCrawlAt: Date,
    previousPrograms: ExperienceData[],
  ): Promise<CrawlResult> {
    const programs = await this.fetchPrograms();
    const previousIds = previousPrograms.map((p) => p.externalId);
    const newPrograms = programs.filter((p) => !previousIds.includes(p.externalId));

    return {
      adapterName: this.metadata.name,
      success: true,
      programs,
      newCount: newPrograms.length,
      updatedCount: programs.length - newPrograms.length,
      crawledAt: new Date(),
    };
  }
}
