import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BookingPatternsService } from './booking-patterns.service';
import { BookingPattern } from './entities/booking-pattern.entity';
import { BookingPrediction } from './entities/booking-prediction.entity';

@ApiTags('Booking Patterns')
@Controller('api/booking-patterns')
export class BookingPatternsController {
  constructor(private bookingPatternsService: BookingPatternsService) {}

  @Get('experience/:experienceId')
  @ApiOperation({ summary: 'Get booking patterns for an experience' })
  async getPatternsByExperience(
    @Param('experienceId') experienceId: string,
  ): Promise<BookingPattern[]> {
    return this.bookingPatternsService.getPatternsByExperience(experienceId);
  }

  @Get('pattern/:patternId/accuracy')
  @ApiOperation({ summary: 'Calculate accuracy of a pattern' })
  async getPatternAccuracy(@Param('patternId') patternId: string): Promise<{
    accuracy: number;
    totalMatches: number;
    totalTests: number;
  }> {
    return this.bookingPatternsService.calculateAccuracy(patternId);
  }

  @Get('high-confidence')
  @ApiOperation({ summary: 'Get high confidence patterns' })
  @ApiQuery({ name: 'threshold', required: false, type: Number })
  async getHighConfidencePatterns(
    @Query('threshold') threshold: number = 0.7,
  ): Promise<BookingPattern[]> {
    return this.bookingPatternsService.getHighConfidencePatterns(threshold);
  }

  @Get('experience/:experienceId/analysis')
  @ApiOperation({
    summary: 'Analyze booking patterns for an experience',
  })
  async analyzeBookingTimes(
    @Param('experienceId') experienceId: string,
  ): Promise<Map<string, number>> {
    const analysis = await this.bookingPatternsService.analyzeBookingTimes(
      experienceId,
    );
    return analysis;
  }

  @Get('predictions/experience/:experienceId')
  @ApiOperation({ summary: 'Get predictions for an experience' })
  @ApiQuery({ name: 'includeExpired', required: false, type: Boolean })
  async getPredictionsForExperience(
    @Param('experienceId') experienceId: string,
    @Query('includeExpired') includeExpired: boolean = false,
  ): Promise<BookingPrediction[]> {
    return this.bookingPatternsService.getPredictionsForExperience(
      experienceId,
      includeExpired,
    );
  }

  @Get('predictions/upcoming')
  @ApiOperation({ summary: 'Get upcoming booking predictions' })
  @ApiQuery({ name: 'hoursAhead', required: false, type: Number })
  async getUpcomingPredictions(
    @Query('hoursAhead') hoursAhead: number = 168,
  ): Promise<BookingPrediction[]> {
    return this.bookingPatternsService.getUpcomingPredictions(hoursAhead);
  }

  @Get('predictions/high-confidence')
  @ApiOperation({ summary: 'Get high confidence predictions' })
  @ApiQuery({ name: 'threshold', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getHighConfidencePredictions(
    @Query('threshold') threshold: number = 0.8,
    @Query('limit') limit: number = 50,
  ): Promise<BookingPrediction[]> {
    return this.bookingPatternsService.getHighConfidencePredictions(
      threshold,
      limit,
    );
  }
}
