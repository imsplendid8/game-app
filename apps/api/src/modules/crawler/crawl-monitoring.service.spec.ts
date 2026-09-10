import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CrawlMonitoringService } from './crawl-monitoring.service';
import { CrawlHistory, CrawlStatus } from './entities/crawl-history.entity';
import { AdapterState } from './entities/adapter-state.entity';

describe('CrawlMonitoringService', () => {
  let service: CrawlMonitoringService;
  let mockCrawlHistoryRepository: any;
  let mockAdapterStateRepository: any;

  beforeEach(async () => {
    mockCrawlHistoryRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    mockAdapterStateRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrawlMonitoringService,
        {
          provide: getRepositoryToken(CrawlHistory),
          useValue: mockCrawlHistoryRepository,
        },
        {
          provide: getRepositoryToken(AdapterState),
          useValue: mockAdapterStateRepository,
        },
      ],
    }).compile();

    service = module.get<CrawlMonitoringService>(CrawlMonitoringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startCrawl', () => {
    it('should create a new crawl record with RUNNING status', async () => {
      const crawlData = {
        id: 'crawl-1',
        adapterName: 'mock-adapter',
        crawlStartedAt: expect.any(Date),
        status: CrawlStatus.RUNNING,
      };

      mockCrawlHistoryRepository.create.mockReturnValue(crawlData);
      mockCrawlHistoryRepository.save.mockResolvedValue(crawlData);

      const result = await service.startCrawl('mock-adapter');

      expect(result.status).toBe(CrawlStatus.RUNNING);
      expect(result.adapterName).toBe('mock-adapter');
      expect(mockCrawlHistoryRepository.save).toHaveBeenCalled();
    });
  });

  describe('completeCrawl', () => {
    it('should update crawl record with completion status and stats', async () => {
      const crawlRecord = {
        id: 'crawl-1',
        adapterName: 'test-adapter',
        crawlStartedAt: new Date(),
        crawlCompletedAt: null,
        status: CrawlStatus.RUNNING,
        programsFound: 0,
      };

      mockCrawlHistoryRepository.findOne.mockResolvedValue(crawlRecord);
      mockCrawlHistoryRepository.save.mockResolvedValue({
        ...crawlRecord,
        crawlCompletedAt: new Date(),
        status: CrawlStatus.SUCCESS,
        programsFound: 10,
      });

      const result = await service.completeCrawl('crawl-1', CrawlStatus.SUCCESS, {
        programsFound: 10,
        programsCreated: 5,
        changesDetected: 3,
      });

      expect(result.status).toBe(CrawlStatus.SUCCESS);
      expect(result.programsFound).toBe(10);
      expect(result.programsCreated).toBe(5);
    });
  });

  describe('getCrawlHistory', () => {
    it('should retrieve crawl history for an adapter', async () => {
      const mockHistory = [
        {
          id: 'crawl-1',
          adapterName: 'test-adapter',
          status: CrawlStatus.SUCCESS,
        },
      ];

      mockCrawlHistoryRepository.find.mockResolvedValue(mockHistory);

      const result = await service.getCrawlHistory('test-adapter', 100);

      expect(result).toEqual(mockHistory);
      expect(mockCrawlHistoryRepository.find).toHaveBeenCalledWith({
        where: { adapterName: 'test-adapter' },
        order: { createdAt: 'DESC' },
        take: 100,
      });
    });
  });

  describe('getAdapterState', () => {
    it('should retrieve adapter state', async () => {
      const mockState = {
        id: 'state-1',
        adapterName: 'test-adapter',
        isDisabled: false,
        consecutiveFailures: 0,
      };

      mockAdapterStateRepository.findOne.mockResolvedValue(mockState);

      const result = await service.getAdapterState('test-adapter');

      expect(result).toEqual(mockState);
      expect(result.isDisabled).toBe(false);
    });
  });

  describe('resetAdapterState', () => {
    it('should reset disabled adapter back to healthy state', async () => {
      const disabledAdapter = {
        id: 'state-1',
        adapterName: 'test-adapter',
        isDisabled: true,
        consecutiveFailures: 5,
        disableReason: 'Disabled after 5 consecutive failures',
      };

      mockAdapterStateRepository.findOne.mockResolvedValue(disabledAdapter);
      mockAdapterStateRepository.save.mockResolvedValue({
        ...disabledAdapter,
        isDisabled: false,
        consecutiveFailures: 0,
        disableReason: null,
      });

      const result = await service.resetAdapterState('test-adapter');

      expect(result.isDisabled).toBe(false);
      expect(result.consecutiveFailures).toBe(0);
    });

    it('should throw error if adapter state not found', async () => {
      mockAdapterStateRepository.findOne.mockResolvedValue(null);

      await expect(
        service.resetAdapterState('nonexistent-adapter'),
      ).rejects.toThrow('Adapter state not found');
    });
  });
});
