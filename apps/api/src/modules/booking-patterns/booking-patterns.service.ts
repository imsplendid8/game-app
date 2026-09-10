import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingPattern, PatternType } from './entities/booking-pattern.entity';
import { PatternEvidence } from './entities/pattern-evidence.entity';
import { ExperienceRun } from '@/modules/experience-runs/experience-runs.entity';

@Injectable()
export class BookingPatternsService {
  constructor(
    @InjectRepository(BookingPattern)
    private bookingPatternsRepository: Repository<BookingPattern>,
    @InjectRepository(PatternEvidence)
    private patternEvidenceRepository: Repository<PatternEvidence>,
  ) {}

  async createPattern(
    experienceId: string,
    patternType: PatternType,
    patternRule: string,
    timeOfDay?: string,
    confidence: number = 0.5,
  ): Promise<BookingPattern> {
    const pattern = this.bookingPatternsRepository.create({
      experienceId,
      patternType,
      patternRule,
      timeOfDay,
      confidence,
      evidenceCount: 0,
    });

    return this.bookingPatternsRepository.save(pattern);
  }

  async getPatternsByExperience(
    experienceId: string,
  ): Promise<BookingPattern[]> {
    return this.bookingPatternsRepository.find({
      where: { experienceId },
      order: { confidence: 'DESC' },
    });
  }

  async updatePattern(
    patternId: string,
    updates: Partial<BookingPattern>,
  ): Promise<BookingPattern> {
    await this.bookingPatternsRepository.update(patternId, {
      ...updates,
      updatedAt: new Date(),
    });

    return this.bookingPatternsRepository.findOne({
      where: { id: patternId },
    });
  }

  async recordEvidence(
    patternId: string,
    experienceRunId: string,
    predictedTime?: Date,
    actualTime?: Date,
    matched?: boolean,
  ): Promise<PatternEvidence> {
    const evidence = this.patternEvidenceRepository.create({
      bookingPatternId: patternId,
      experienceRunId,
      predictedBookingOpenAt: predictedTime,
      actualBookingOpenAt: actualTime,
      matched,
    });

    return this.patternEvidenceRepository.save(evidence);
  }

  async getEvidenceForPattern(
    patternId: string,
    limit: number = 50,
  ): Promise<PatternEvidence[]> {
    return this.patternEvidenceRepository.find({
      where: { bookingPatternId: patternId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async calculateAccuracy(patternId: string): Promise<{
    accuracy: number;
    totalMatches: number;
    totalTests: number;
  }> {
    const evidence = await this.patternEvidenceRepository.find({
      where: { bookingPatternId: patternId },
    });

    const testedEvidence = evidence.filter((e) => e.matched !== null);
    const matches = testedEvidence.filter((e) => e.matched === true).length;

    return {
      accuracy:
        testedEvidence.length > 0
          ? (matches / testedEvidence.length) * 100
          : 0,
      totalMatches: matches,
      totalTests: testedEvidence.length,
    };
  }

  async getHighConfidencePatterns(threshold: number = 0.7): Promise<BookingPattern[]> {
    return this.bookingPatternsRepository.find({
      where: {
        confidence: (() => {
          const query = this.bookingPatternsRepository.createQueryBuilder();
          return threshold; // Placeholder - actual comparison in queryBuilder
        })() as any,
      },
      order: { confidence: 'DESC' },
    });
  }

  async analyzeBookingTimes(
    experienceId: string,
  ): Promise<Map<PatternType, number>> {
    const patterns = await this.getPatternsByExperience(experienceId);
    const result = new Map<PatternType, number>();

    for (const pattern of patterns) {
      const accuracy = await this.calculateAccuracy(pattern.id);
      if (accuracy.accuracy > 0) {
        result.set(pattern.patternType, accuracy.accuracy);
      }
    }

    return result;
  }
}
