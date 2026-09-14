import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserPreferences } from './user-preferences.entity';

@Entity('users')
@Index('idx_users_email', ['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordHash: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  profileName: string | null;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  profileImageUrl: string | null;

  @Column({ type: 'int', array: true, nullable: true })
  childrenAges: number[] | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToOne(() => UserPreferences, (pref) => pref.user)
  preferences: UserPreferences | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  isProfileComplete(): boolean {
    return !!(this.profileName && this.childrenAges && this.childrenAges.length > 0);
  }

  getChildrenCount(): number {
    return this.childrenAges ? this.childrenAges.length : 0;
  }
}
