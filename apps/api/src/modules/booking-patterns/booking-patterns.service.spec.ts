import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BookingPatternsService } from './booking-patterns.service';
import { BookingPattern, PatternType } from './entities/booking-pattern.entity';
import { PatternEvidence } from './entities/pattern-evidence.entity';
import { BookingPrediction } from './entities/booking-prediction.entity';

describe('BookingPatternsService', () => {
  let service: BookingPatternsService;
  let mockPatternRepository: any;
  let mockEvidenceRepository: any;
  let mockPredictionRepository: any;

  beforeEach(async () => {
    mockPatternRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockEvidenceRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    mockPredictionRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingPatternsService,
        {
          provide: getRepositoryToken(BookingPattern),
          useValue: mockPatternRepository,
        },
        {
          provide: getRepositoryToken(PatternEvidence),
          useValue: mockEvidenceRepository,
        },
        {
          provide: getRepositoryToken(BookingPrediction),
          useValue: mockPredictionRepository,
        },
      ],
    }).compile();

    service = module.get<BookingPatternsService>(BookingPatternsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPattern', () => {
    it('should create a new booking pattern', async () => {
      const patternData = {
        id: 'pattern-1',
        experienceId: 'exp-1',
        patternType: PatternType.FIXED_DAY_OF_MONTH,
        patternRule: 'FIXED_DAY_OF_MONTH:3',
        timeOfDay: '10:00',
        confidence: 0.8,
        evidenceCount: 0,
      };

      mockPatternRepository.create.mockReturnValue(patternData);
      mockPatternRepository.save.mockResolvedValue(patternData);

      const result = await service.createPattern(
        patternData.experienceId,
        patternData.patternType,
        patternData.patternRule,
        patternData.timeOfDay,
        patternData.confidence,
      );

      expect(result.id).toBe('pattern-1');
      expect(result.patternType).toBe(PatternType.FIXED_DAY_OF_MONTH);
    });
  });

  describe('calculateAccuracy', () => {
    it('should calculate pattern accuracy from evidence', async () => {
      const mockEvidence = [
        { id: '1', matched: true },
        { id: '2', matched: true },
        { id: '3', matched: false },
      ];

      mockEvidenceRepository.find.mockResolvedValue(mockEvidence);

      const result = await service.calculateAccuracy('pattern-1');

      expect(result.accuracy).toBe(66.66666666666666);
      expect(result.totalMatches).toBe(2);
      expect(result.totalTests).toBe(3);
    });

    it('should return 0 accuracy with no evidence', async () => {
      mockEvidenceRepository.find.mockResolvedValue([]);

      const result = await service.calculateAccuracy('pattern-1');

      expect(result.accuracy).toBe(0);
      expect(result.totalTests).toBe(0);
    });
  });

  describe('getPatternsByExperience', () => {
    it('should retrieve patterns for an experience ordered by confidence', async () => {
      const mockPatterns = [
        {
          id: 'p1',
          experienceId: 'exp-1',
          confidence: 0.9,
        },
        {
          id: 'p2',
          experienceId: 'exp-1',
          confidence: 0.7,
        },
      ];

      mockPatternRepository.find.mockResolvedValue(mockPatterns);

      const result = await service.getPatternsByExperience('exp-1');

      expect(result).toEqual(mockPatterns);
      expect(mockPatternRepository.find).toHaveBeenCalledWith({
        where: { experienceId: 'exp-1' },
        order: { confidence: 'DESC' },
      });
    });
  });

  describe('createPrediction', () => {
    it('should create a booking prediction', async () => {
      const predictionData = {
        id: 'pred-1',
        experienceId: 'exp-1',
        predictedBookingOpenAt: new Date('2024-01-15T10:00:00'),
        confidence: 0.85,
      };

      mockPredictionRepository.create.mockReturnValue(predictionData);
      mockPredictionRepository.save.mockResolvedValue(predictionData);

      const result = await service.createPrediction(
        predictionData.experienceId,
        predictionData.predictedBookingOpenAt,
        predictionData.confidence,
      );

      expect(result.id).toBe('pred-1');
      expect(result.confidence).toBe(0.85);
    });
  });
});
