import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExperiencesController } from './experiences.controller';
import { ExperiencesService } from './experiences.service';
import { Experience } from './entities/experience.entity';
import { InstitutionsModule } from '../institutions/institutions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Experience]), InstitutionsModule],
  controllers: [ExperiencesController],
  providers: [ExperiencesService],
  exports: [ExperiencesService],
})
export class ExperiencesModule {}
