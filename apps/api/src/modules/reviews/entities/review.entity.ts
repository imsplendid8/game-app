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
import { User } from '../../users/entities/user.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Experience } from '../../experiences/entities/experience.entity';

@Entity('reviews')
@Index(['userId'])
@Index(['bookingId'])
@Index(['experienceId'])
@Index(['createdAt'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid')
  bookingId: string;

  @ManyToOne(() => Booking, (booking) => booking.reviews)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @Column('uuid')
  experienceId: string;

  @ManyToOne(() => Experience, { eager: false })
  @JoinColumn({ name: 'experienceId' })
  experience: Experience;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text' })
  reviewText: string;

  @Column({ type: 'int', default: 0 })
  helpfulCount: number;

  @Column({ type: 'simple-array', default: [] })
  helpfulByUserIds: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
