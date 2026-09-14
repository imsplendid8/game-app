import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookingPattern } from './booking-pattern.entity';
import { ExperienceRun } from '@/modules/experience-runs/experience-runs.entity';

@Entity('pattern_evidence')
@Index('idx_pattern_evidence_pattern', ['bookingPatternId'])
@Index('idx_pattern_evidence_run', ['experienceRunId'])
export class PatternEvidence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  bookingPatternId: string;

  @ManyToOne(() => BookingPattern)
  @JoinColumn({ name: 'booking_pattern_id' })
  bookingPattern: BookingPattern;

  @Column('uuid')
  experienceRunId: string;

  @ManyToOne(() => ExperienceRun)
  @JoinColumn({ name: 'experience_run_id' })
  experienceRun: ExperienceRun;

  @Column({ type: 'timestamp', nullable: true })
  predictedBookingOpenAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  actualBookingOpenAt: Date | null;

  @Column({ type: 'boolean', nullable: true })
  matched: boolean | null;

  @CreateDateColumn()
  createdAt: Date;
}
