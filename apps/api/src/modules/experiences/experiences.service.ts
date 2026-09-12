import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Experience } from './entities/experience.entity';
import { CreateExperienceDto } from './dto/create-experience.dto';

@Injectable()
export class ExperiencesService {
  constructor(
    @InjectRepository(Experience)
    private experiencesRepository: Repository<Experience>,
  ) {}

  async create(createExperienceDto: CreateExperienceDto): Promise<Experience> {
    const experience = this.experiencesRepository.create(createExperienceDto);
    return await this.experiencesRepository.save(experience);
  }

  async findAll(): Promise<Experience[]> {
    return await this.experiencesRepository.find({
      where: { isActive: true },
      relations: ['institution'],
    });
  }

  async findOne(id: string): Promise<Experience | null> {
    return await this.experiencesRepository.findOne({
      where: { id },
      relations: ['institution'],
    });
  }

  async update(id: string, data: Partial<Experience>): Promise<Experience> {
    await this.experiencesRepository.update(id, data);
    return (await this.experiencesRepository.findOneBy({ id }))!;
  }

  async remove(id: string): Promise<void> {
    await this.experiencesRepository.update(id, { isActive: false });
  }
}
