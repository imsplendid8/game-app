export interface Institution {
  id: string;
  name: string;
  description?: string;
  websiteUrl?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  institutionType: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Experience {
  id: string;
  institutionId: string;
  programName: string;
  description?: string;
  programUrl?: string;
  bookingUrl?: string;
  isRecurring: boolean;
  experienceCategory?: string;
  targetAgeMin?: number;
  targetAgeMax?: number;
  targetGradeMin?: number;
  targetGradeMax?: number;
  requiredGuardian: boolean;
  bookingMethod: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  discoveredAt: Date;
  lastVerifiedAt?: Date;
  externalId?: string;
  externalSource?: string;
}

export interface ExperienceRun {
  id: string;
  experienceId: string;
  runNumber?: number;
  experienceDate: Date;
  bookingOpenAt?: Date;
  bookingCloseAt?: Date;
  bookingMethod: string;
  capacity?: number;
  capacityRemaining?: number;
  price: number;
  status: string;
  automationStatus: string;
  automationNote?: string;
  createdAt: Date;
  updatedAt: Date;
  externalRunId?: string;
}
