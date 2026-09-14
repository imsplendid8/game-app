import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_preferences')
@Index('idx_user_preferences_user', ['userId'])
export class UserPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { unique: true })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text', array: true, nullable: true })
  interestedCategories: string[] | null;

  @Column({ type: 'uuid', array: true, nullable: true })
  interestedInstitutions: string[] | null;

  @Column({ type: 'int', default: 50000 })
  maxPricePerProgram: number;

  @Column({ type: 'boolean', default: true })
  preferFree: boolean;

  @Column({ type: 'boolean', default: true })
  notifyOpeningSoon: boolean;

  @Column({ type: 'boolean', default: true })
  notifyOpenedToday: boolean;

  @Column({ type: 'boolean', default: true })
  notifyNewPrograms: boolean;

  @Column({ type: 'boolean', default: true })
  notifyCancellations: boolean;

  @Column({ type: 'boolean', default: true })
  notifyCancellationReturns: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  isNotificationEnabled(type: string): boolean {
    switch (type) {
      case 'OPENING_SOON':
        return this.notifyOpeningSoon;
      case 'OPENED_TODAY':
        return this.notifyOpenedToday;
      case 'NEW_PROGRAMS':
        return this.notifyNewPrograms;
      case 'CANCELLATIONS':
        return this.notifyCancellations;
      case 'CANCELLATION_RETURNS':
        return this.notifyCancellationReturns;
      default:
        return false;
    }
  }

  isWithinBudget(price: number): boolean {
    if (this.preferFree && price > 0) {
      return false;
    }
    return price <= this.maxPricePerProgram;
  }

  isInterestedInCategory(category: string): boolean {
    if (!this.interestedCategories || this.interestedCategories.length === 0) {
      return true;
    }
    return this.interestedCategories.includes(category);
  }

  isInterestedInInstitution(institutionId: string): boolean {
    if (!this.interestedInstitutions || this.interestedInstitutions.length === 0) {
      return true;
    }
    return this.interestedInstitutions.includes(institutionId);
  }
}
