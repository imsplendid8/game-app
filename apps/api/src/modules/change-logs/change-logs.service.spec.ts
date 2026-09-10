import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChangeLogsService } from './change-logs.service';
import { ChangeLog, ChangeType, ChangeSeverity } from './entities/change-log.entity';

describe('ChangeLogsService', () => {
  let service: ChangeLogsService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangeLogsService,
        {
          provide: getRepositoryToken(ChangeLog),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ChangeLogsService>(ChangeLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordChange', () => {
    it('should create and save a change log', async () => {
      const changeLogData = {
        experienceRunId: 'test-id',
        changeType: ChangeType.STATUS_CHANGED,
        severity: ChangeSeverity.HIGH,
        changedField: 'status',
        oldValue: 'OPEN',
        newValue: 'CLOSED',
        detectedAt: new Date(),
      };

      const savedChangeLog: any = { id: 'change-1', ...changeLogData };

      mockRepository.create.mockReturnValue(changeLogData);
      mockRepository.save.mockResolvedValue(savedChangeLog);

      const result = await service.recordChange(
        changeLogData.experienceRunId,
        changeLogData.changeType,
        changeLogData.severity,
        changeLogData.changedField,
        changeLogData.oldValue,
        changeLogData.newValue,
      );

      expect(result.id).toBe('change-1');
      expect(result.changeType).toBe(ChangeType.STATUS_CHANGED);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('getChangesByExperienceRun', () => {
    it('should retrieve changes for an experience run', async () => {
      const mockChanges = [
        {
          id: 'change-1',
          experienceRunId: 'run-1',
          changeType: ChangeType.STATUS_CHANGED,
        },
      ];

      mockRepository.find.mockResolvedValue(mockChanges);

      const result = await service.getChangesByExperienceRun('run-1');

      expect(result).toEqual(mockChanges);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { experienceRunId: 'run-1' },
        order: { detectedAt: 'DESC' },
      });
    });
  });

  describe('getCriticalChanges', () => {
    it('should retrieve only critical severity changes', async () => {
      const mockCriticalChanges = [
        {
          id: 'critical-1',
          severity: ChangeSeverity.CRITICAL,
          changeType: ChangeType.PROGRAM_CANCELLED,
        },
      ];

      mockRepository.find.mockResolvedValue(mockCriticalChanges);

      const result = await service.getCriticalChanges(50);

      expect(result).toEqual(mockCriticalChanges);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });
});
