import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ChangeLog,
  ChangeType,
  ChangeSeverity,
} from './entities/change-log.entity';

@Injectable()
export class ChangeLogsService {
  constructor(
    @InjectRepository(ChangeLog)
    private changeLogsRepository: Repository<ChangeLog>,
  ) {}

  async recordChange(
    experienceRunId: string,
    changeType: ChangeType,
    severity: ChangeSeverity,
    changedField?: string,
    oldValue?: string,
    newValue?: string,
  ): Promise<ChangeLog> {
    const changeLog = this.changeLogsRepository.create({
      experienceRunId,
      changeType,
      severity,
      changedField,
      oldValue,
      newValue,
      detectedAt: new Date(),
    });

    return this.changeLogsRepository.save(changeLog);
  }

  async getChangesByExperienceRun(
    experienceRunId: string,
  ): Promise<ChangeLog[]> {
    return this.changeLogsRepository.find({
      where: { experienceRunId },
      order: { detectedAt: 'DESC' },
    });
  }

  async getChangesBySeverity(
    severity: ChangeSeverity,
    limit: number = 100,
  ): Promise<ChangeLog[]> {
    return this.changeLogsRepository.find({
      where: { severity },
      order: { detectedAt: 'DESC' },
      take: limit,
    });
  }

  async getChangesByType(
    changeType: ChangeType,
    limit: number = 100,
  ): Promise<ChangeLog[]> {
    return this.changeLogsRepository.find({
      where: { changeType },
      order: { detectedAt: 'DESC' },
      take: limit,
    });
  }

  async getRecentChanges(hours: number = 24): Promise<ChangeLog[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    return this.changeLogsRepository.find({
      where: {
        detectedAt: (() => {
          const qb = this.changeLogsRepository.createQueryBuilder();
          return qb.query &&
            typeof qb.query === 'function'
            ? { $gte: since }
            : since;
        })() as any,
      },
      order: { detectedAt: 'DESC' },
    });
  }

  async getCriticalChanges(limit: number = 50): Promise<ChangeLog[]> {
    return this.changeLogsRepository.find({
      where: { severity: ChangeSeverity.CRITICAL },
      order: { detectedAt: 'DESC' },
      take: limit,
    });
  }
}
