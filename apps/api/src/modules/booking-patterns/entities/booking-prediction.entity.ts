import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Experience } from '@/modules/experiences/entities/experience.entity';
import { BookingPattern } from './booking-pattern.entity';

@Entity('booking_predictions')
@Index('idx_booking_predictions_experience', ['experienceId'])
@Index('idx_booking_predictions_predicted_date', ['predictedBookingOpenAt'])
export class BookingPrediction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  experienceId: string;

  @ManyToOne(() => Experience)
  @JoinColumn({ name: 'experience_id' })
  experience: Experience;

  @Column({ type: 'date', nullable: true })
  predictedExperienceDate: string | null;

  @Column({ type: 'timestamp', nullable: false })
  predictedBookingOpenAt: Date;

  @Column({ type: 'float', nullable: false })
  confidence: number;

  @Column('uuid', { nullable: true })
  patternId: string | null;

  @ManyToOne(() => BookingPattern)
  @JoinColumn({ name: 'pattern_id' })
  pattern: BookingPattern | null;

  @Column({ type: 'timestamp', nullable: true })
  actualBookingOpenAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  isVerified(): boolean {
    return this.actualBookingOpenAt !== null && this.verifiedAt !== null;
  }

  getAccuracy(): number | null {
    if (!this.isVerified()) return null;
    const predicted = this.predictedBookingOpenAt.getTime();
    const actual = this.actualBookingOpenAt!.getTime();
    const diffMs = Math.abs(predicted - actual);
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.max(0, 100 - diffHours * 10);
  }
}
