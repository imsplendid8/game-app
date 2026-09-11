import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { ExperienceRun } from './experience-runs.entity';
import { CreateExperienceRunDto } from './dto/create-experience-run.dto';

@Injectable()
export class ExperienceRunsService {
  constructor(
    @InjectRepository(ExperienceRun)
    private experienceRunsRepository: Repository<ExperienceRun>,
  ) {}

  async create(createExperienceRunDto: CreateExperienceRunDto): Promise<ExperienceRun> {
    const run = this.experienceRunsRepository.create(createExperienceRunDto);
    return await this.experienceRunsRepository.save(run);
  }

  async findAll(): Promise<ExperienceRun[]> {
    return await this.experienceRunsRepository.find({
      relations: ['experience'],
      order: { experienceDate: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ExperienceRun | null> {
    return await this.experienceRunsRepository.findOne({
      where: { id },
      relations: ['experience'],
    });
  }

  async findByExperienceId(experienceId: string): Promise<ExperienceRun[]> {
    return await this.experienceRunsRepository.find({
      where: { experienceId },
      relations: ['experience'],
      order: { experienceDate: 'DESC' },
    });
  }

  async findUpcoming(): Promise<ExperienceRun[]> {
    const today = new Date();
    return await this.experienceRunsRepository.find({
      where: {
        experienceDate: MoreThanOrEqual(today),
        status: 'OPEN',
      },
      relations: ['experience'],
      order: { bookingOpenAt: 'ASC' },
      take: 20,
    });
  }

  async update(id: string, data: Partial<ExperienceRun>): Promise<ExperienceRun> {
    await this.experienceRunsRepository.update(id, data);
    return (await this.experienceRunsRepository.findOneBy({ id }))!;
  }

  async remove(id: string): Promise<void> {
    await this.experienceRunsRepository.delete(id);
  }
}
