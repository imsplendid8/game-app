import { Injectable } from '@nestjs/common';
import { ExperienceData, CrawlSchedule } from '../adapter.interface';
import { BaseAdapter } from './base.adapter';
import * as fs from 'fs';
import * as path from 'path';

/**
 * DataLoader Adapter - Import programs from JSON/CSV files
 * Supports loading experience data from local files for batch imports
 */
@Injectable()
export class DataLoaderAdapter extends BaseAdapter {
  private dataDir = path.join(process.cwd(), 'apps/api/src/crawler/data');

  constructor() {
    super('data-loader', 'file://', CrawlSchedule.DAILY);

    this.metadata.automationInfo = {
      isAutomatable: false,
      blockers: [],
      notes: 'Loads programs from JSON files in apps/api/src/crawler/data directory',
    };
  }

  async fetchPrograms(): Promise<ExperienceData[]> {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
        return [];
      }

      const files = fs.readdirSync(this.dataDir).filter((f) => f.endsWith('.json'));

      if (files.length === 0) {
        console.log(`No data files found in ${this.dataDir}`);
        return [];
      }

      const allPrograms: ExperienceData[] = [];

      for (const file of files) {
        try {
          const filePath = path.join(this.dataDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const data = JSON.parse(content);

          // Support both single object and array of objects
          const programs = Array.isArray(data) ? data : [data];

          // Validate and normalize programs
          for (const program of programs) {
            if (this.isValidProgram(program)) {
              allPrograms.push(this.normalizeProgram(program));
            }
          }

          console.log(`✅ Loaded ${programs.length} programs from ${file}`);
        } catch (error) {
          console.error(`❌ Error loading ${file}:`, error);
        }
      }

      return allPrograms;
    } catch (error) {
      console.error('DataLoader adapter error:', error);
      return [];
    }
  }

  private isValidProgram(program: any): boolean {
    return (
      program &&
      typeof program === 'object' &&
      program.externalId &&
      program.institutionName &&
      program.programName &&
      program.bookingMethod &&
      program.status
    );
  }

  private normalizeProgram(program: any): ExperienceData {
    return {
      externalId: String(program.externalId),
      institutionName: String(program.institutionName),
      programName: String(program.programName),
      description: program.description ? String(program.description) : undefined,
      programUrl: program.programUrl ? String(program.programUrl) : undefined,
      bookingUrl: program.bookingUrl ? String(program.bookingUrl) : undefined,
      experienceDate: program.experienceDate ? new Date(program.experienceDate) : undefined,
      bookingOpenAt: program.bookingOpenAt ? new Date(program.bookingOpenAt) : undefined,
      bookingCloseAt: program.bookingCloseAt ? new Date(program.bookingCloseAt) : undefined,
      capacity: program.capacity ? Number(program.capacity) : undefined,
      price: program.price ? this.parsePriceValue(program.price) : 0,
      ageGroup: program.ageGroup ? String(program.ageGroup) : undefined,
      bookingMethod: program.bookingMethod,
      status: program.status,
      externalSource: program.externalSource || 'data-loader',
    };
  }

  private parsePriceValue(price: any): number {
    if (price === null || price === undefined) return 0;
    if (typeof price === 'string') {
      const parsed = parseInt(price.replace(/[^0-9]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return typeof price === 'number' ? price : 0;
  }
}
