import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Institution } from './entities/institution.entity';
import { CreateInstitutionDto } from './dto/create-institution.dto';

@Injectable()
export class InstitutionsService {
  constructor(
    @InjectRepository(Institution)
    private institutionsRepository: Repository<Institution>,
  ) {}

  async create(createInstitutionDto: CreateInstitutionDto): Promise<Institution> {
    const institution = this.institutionsRepository.create(createInstitutionDto);
    return await this.institutionsRepository.save(institution);
  }

  async findAll(): Promise<Institution[]> {
    return await this.institutionsRepository.find({
      where: { isActive: true },
    });
  }

  async findOne(id: string): Promise<Institution | null> {
    return await this.institutionsRepository.findOneBy({ id });
  }

  async update(id: string, data: Partial<Institution>): Promise<Institution> {
    await this.institutionsRepository.update(id, data);
    return (await this.institutionsRepository.findOneBy({ id }))!;
  }

  async remove(id: string): Promise<void> {
    await this.institutionsRepository.update(id, { isActive: false });
  }
}
