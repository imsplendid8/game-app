import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExperienceRunsController } from './experience-runs.controller';
import { ExperienceRunsService } from './experience-runs.service';
import { ExperienceRun } from './experience-runs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExperienceRun])],
  controllers: [ExperienceRunsController],
  providers: [ExperienceRunsService],
  exports: [ExperienceRunsService],
})
export class ExperienceRunsModule {}
