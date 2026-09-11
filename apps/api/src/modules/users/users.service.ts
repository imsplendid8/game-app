import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserPreferences } from './entities/user-preferences.entity';
import { UserBookmark, BookmarkType } from './entities/user-bookmark.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserPreferences)
    private preferencesRepository: Repository<UserPreferences>,
    @InjectRepository(UserBookmark)
    private bookmarksRepository: Repository<UserBookmark>,
  ) {}

  async createUser(
    email: string,
    profileName?: string,
    childrenAges?: number[],
  ): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const user = this.usersRepository.create({
      email,
      profileName,
      childrenAges,
      isActive: true,
    });

    const savedUser = await this.usersRepository.save(user);

    // Create default preferences
    const preferences = this.preferencesRepository.create({
      userId: savedUser.id,
    });
    await this.preferencesRepository.save(preferences);

    return savedUser;
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id: userId },
      relations: ['preferences'],
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['preferences'],
    });
  }

  async updateUserProfile(
    userId: string,
    profileName?: string,
    childrenAges?: number[],
    profileImageUrl?: string,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    if (profileName) user.profileName = profileName;
    if (childrenAges) user.childrenAges = childrenAges;
    if (profileImageUrl) user.profileImageUrl = profileImageUrl;

    return this.usersRepository.save(user);
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    return this.preferencesRepository.findOne({
      where: { userId },
    });
  }

  async updateUserPreferences(
    userId: string,
    updates: Partial<UserPreferences>,
  ): Promise<UserPreferences> {
    await this.preferencesRepository.update({ userId }, updates);

    const preferences = await this.preferencesRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      throw new Error('Preferences not found');
    }

    return preferences;
  }

  async addBookmark(
    userId: string,
    experienceRunId: string,
    bookmarkType: BookmarkType = BookmarkType.WISHLIST,
  ): Promise<UserBookmark> {
    const existingBookmark = await this.bookmarksRepository.findOne({
      where: { userId, experienceRunId },
    });

    if (existingBookmark) {
      existingBookmark.bookmarkType = bookmarkType;
      return this.bookmarksRepository.save(existingBookmark);
    }

    const bookmark = this.bookmarksRepository.create({
      userId,
      experienceRunId,
      bookmarkType,
    });

    return this.bookmarksRepository.save(bookmark);
  }

  async removeBookmark(userId: string, experienceRunId: string): Promise<void> {
    await this.bookmarksRepository.delete({ userId, experienceRunId });
  }

  async getUserBookmarks(
    userId: string,
    bookmarkType?: BookmarkType,
  ): Promise<UserBookmark[]> {
    const query = this.bookmarksRepository
      .createQueryBuilder('b')
      .where('b.user_id = :userId', { userId })
      .leftJoinAndSelect('b.experienceRun', 'run');

    if (bookmarkType) {
      query.andWhere('b.bookmark_type = :bookmarkType', { bookmarkType });
    }

    return query.orderBy('b.created_at', 'DESC').getMany();
  }

  async getAllUsers(limit: number = 100): Promise<User[]> {
    return this.usersRepository.find({
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async deactivateUser(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = false;
    return this.usersRepository.save(user);
  }

  async reactivateUser(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = true;
    return this.usersRepository.save(user);
  }
}
