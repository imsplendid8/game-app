import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Experience } from '../experiences/entities/experience.entity';

@Entity('experience_runs')
@Index(['experienceId'])
@Index(['status'])
@Index(['bookingOpenAt'])
@Index(['experienceDate'])
export class ExperienceRun {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  experienceId: string;

  @ManyToOne(() => Experience, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'experienceId' })
  experience: Experience;

  @Column({ type: 'int', nullable: true })
  runNumber: number;

  @Column({ type: 'date' })
  experienceDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  bookingOpenAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  bookingCloseAt: Date;

  @Column({
    type: 'enum',
    enum: ['FIRST_COME', 'LOTTERY', 'ALWAYS_AVAILABLE'],
  })
  bookingMethod: string;

  @Column({ type: 'int', nullable: true })
  capacity: number;

  @Column({ type: 'int', nullable: true })
  capacityRemaining: number;

  @Column({ type: 'int', default: 0 })
  price: number;

  @Column({
    type: 'enum',
    enum: ['UNKNOWN', 'OPENING_SOON', 'OPEN', 'CLOSED', 'CANCELLED'],
    default: 'UNKNOWN',
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['AVAILABLE', 'CAPTCHA_REQUIRED', 'QUEUE_REQUIRED', 'MANUAL_REQUIRED'],
  })
  automationStatus: string;

  @Column({ type: 'text', nullable: true })
  automationNote: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  externalRunId: string;
}
