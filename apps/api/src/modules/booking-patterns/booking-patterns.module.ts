import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingPattern } from './entities/booking-pattern.entity';
import { PatternEvidence } from './entities/pattern-evidence.entity';
import { BookingPatternsService } from './booking-patterns.service';
import { BookingPatternsController } from './booking-patterns.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BookingPattern, PatternEvidence])],
  providers: [BookingPatternsService],
  controllers: [BookingPatternsController],
  exports: [BookingPatternsService],
})
export class BookingPatternsModule {}
