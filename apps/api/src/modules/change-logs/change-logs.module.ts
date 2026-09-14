import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChangeLog } from './entities/change-log.entity';
import { ChangeLogsService } from './change-logs.service';
import { ChangeLogsController } from './change-logs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ChangeLog])],
  providers: [ChangeLogsService],
  controllers: [ChangeLogsController],
  exports: [ChangeLogsService],
})
export class ChangeLogsModule {}
