import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ChangeLogsService } from './change-logs.service';
import { ChangeLog, ChangeSeverity, ChangeType } from './entities/change-log.entity';

@ApiTags('Change Logs')
@Controller('api/change-logs')
export class ChangeLogsController {
  constructor(private changeLogsService: ChangeLogsService) {}

  @Get('experience-run/:experienceRunId')
  @ApiOperation({ summary: 'Get changes for an experience run' })
  async getChangesByExperienceRun(
    @Param('experienceRunId') experienceRunId: string,
  ): Promise<ChangeLog[]> {
    return this.changeLogsService.getChangesByExperienceRun(experienceRunId);
  }

  @Get('severity/:severity')
  @ApiOperation({ summary: 'Get changes by severity level' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getChangesBySeverity(
    @Param('severity') severity: ChangeSeverity,
    @Query('limit') limit: number = 100,
  ): Promise<ChangeLog[]> {
    return this.changeLogsService.getChangesBySeverity(severity, limit);
  }

  @Get('type/:changeType')
  @ApiOperation({ summary: 'Get changes by type' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getChangesByType(
    @Param('changeType') changeType: ChangeType,
    @Query('limit') limit: number = 100,
  ): Promise<ChangeLog[]> {
    return this.changeLogsService.getChangesByType(changeType, limit);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent changes' })
  @ApiQuery({ name: 'hours', required: false, type: Number })
  async getRecentChanges(
    @Query('hours') hours: number = 24,
  ): Promise<ChangeLog[]> {
    return this.changeLogsService.getRecentChanges(hours);
  }

  @Get('critical')
  @ApiOperation({ summary: 'Get critical changes' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getCriticalChanges(
    @Query('limit') limit: number = 50,
  ): Promise<ChangeLog[]> {
    return this.changeLogsService.getCriticalChanges(limit);
  }
}
