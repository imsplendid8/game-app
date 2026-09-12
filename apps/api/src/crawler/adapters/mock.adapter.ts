import { Injectable } from '@nestjs/common';
import { Adapter, AdapterMetadata, ExperienceData, CrawlSchedule, CrawlResult } from '../adapter.interface';

/**
 * Mock Adapter for testing crawler infrastructure
 * This adapter returns sample data without making real HTTP requests
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
      notes: 'Mock adapter for testing - no real HTTP requests',
    },
  };

  async fetchPrograms(): Promise<ExperienceData[]> {
    return [
      {
        externalId: 'mock-001',
        institutionName: '국립박물관',
        programName: '어린이 역사 도슨트 프로그램',
        description: '박물관 유물을 설명하는 도슨트 프로그램',
        programUrl: 'https://example.com/docent',
        bookingUrl: 'https://booking.example.com/docent',
        experienceDate: new Date('2025-10-20'),
        bookingOpenAt: new Date('2025-09-20T09:00:00'),
        bookingCloseAt: new Date('2025-10-19T17:00:00'),
        capacity: 30,
        price: 0,
        ageGroup: '6-12',
        bookingMethod: 'FIRST_COME',
        status: 'OPENING_SOON',
        externalSource: 'mock',
      },
      {
        externalId: 'mock-002',
        institutionName: '서울우유 목장',
        programName: '낙농 체험 투어',
        description: '우유 생산 과정을 체험하는 프로그램',
        programUrl: 'https://example.com/dairy',
        bookingUrl: 'https://booking.example.com/dairy',
        experienceDate: new Date('2025-10-25'),
        bookingOpenAt: new Date('2025-09-25T10:00:00'),
        bookingCloseAt: new Date('2025-10-24T17:00:00'),
        capacity: 50,
        price: 5000,
        ageGroup: '5-10',
        bookingMethod: 'LOTTERY',
        status: 'OPEN',
        externalSource: 'mock',
      },
      {
        externalId: 'mock-003',
        institutionName: '서울 과학관',
        programName: '생명과학 실험실',
        description: '세포와 생명에 대해 배우는 실험',
        programUrl: 'https://example.com/science',
        bookingUrl: 'https://booking.example.com/science',
        experienceDate: new Date('2025-10-15'),
        bookingOpenAt: new Date('2025-09-15T14:00:00'),
        bookingCloseAt: new Date('2025-10-14T17:00:00'),
        capacity: 40,
        price: 0,
        ageGroup: '7-13',
        bookingMethod: 'FIRST_COME',
        status: 'CLOSED',
        externalSource: 'mock',
      },
    ];
  }

  async fetchProgramUpdates(
    lastCrawlAt: Date,
    previousPrograms: ExperienceData[],
  ): Promise<CrawlResult> {
    const programs = await this.fetchPrograms();

    // Simple diff calculation
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
