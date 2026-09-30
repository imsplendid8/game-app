export enum CrawlSchedule {
  HOURLY = 'hourly',
  EVERY_6_HOURS = 'every_6_hours',
  DAILY = 'daily',
  WEEKLY = 'weekly',
}

export interface AdapterMetadata {
  name: string;
  baseUrl?: string;
  schedule: CrawlSchedule;
  enabled: boolean;
  automationInfo?: {
    isAutomatable: boolean;
    blockers?: string[];
    notes?: string;
  };
}

export interface ExperienceData {
  externalId: string;
  institutionName: string;
  programName: string;
  description?: string;
  programUrl?: string;
  bookingUrl?: string;
  experienceDate?: Date | null;
  bookingOpenAt?: Date | null;
  bookingCloseAt?: Date | null;
  capacity?: number;
  price?: number;
  ageGroup?: string;
  /** 기관이 적은 참여 대상 원문 (예: "초등 1~3학년 및 보호자", "만 5~7세") */
  targetInfo?: string;
  bookingMethod: 'FIRST_COME' | 'LOTTERY' | 'ALWAYS_AVAILABLE';
  status: 'OPENING_SOON' | 'OPEN' | 'CLOSED' | 'UNKNOWN';
  externalSource: string;
}

export interface CrawlResult {
  adapterName: string;
  success: boolean;
  programs: ExperienceData[];
  newCount: number;
  updatedCount: number;
  errors?: string[];
  crawledAt: Date;
}

export interface Adapter {
  metadata: AdapterMetadata;
  fetchPrograms(): Promise<ExperienceData[]>;
  fetchProgramUpdates?(
    lastCrawlAt: Date,
    previousPrograms: ExperienceData[],
  ): Promise<CrawlResult>;
}
