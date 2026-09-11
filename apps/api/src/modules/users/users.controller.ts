import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserPreferences } from './entities/user-preferences.entity';
import { UserBookmark, BookmarkType } from './entities/user-bookmark.entity';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  async createUser(
    @Body()
    body: { email: string; profileName?: string; childrenAges?: number[] },
  ): Promise<User> {
    return this.usersService.createUser(
      body.email,
      body.profileName,
      body.childrenAges,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllUsers(@Query('limit') limit: number = 100): Promise<User[]> {
    return this.usersService.getAllUsers(limit);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get user by ID' })
  async getUserById(@Param('userId') userId: string): Promise<User | null> {
    return this.usersService.getUserById(userId);
  }

  @Put(':userId/profile')
  @ApiOperation({ summary: 'Update user profile' })
  async updateUserProfile(
    @Param('userId') userId: string,
    @Body()
    body: {
      profileName?: string;
      childrenAges?: number[];
      profileImageUrl?: string;
    },
  ): Promise<User> {
    return this.usersService.updateUserProfile(
      userId,
      body.profileName,
      body.childrenAges,
      body.profileImageUrl,
    );
  }

  @Get(':userId/preferences')
  @ApiOperation({ summary: 'Get user preferences' })
  async getUserPreferences(
    @Param('userId') userId: string,
  ): Promise<UserPreferences | null> {
    return this.usersService.getUserPreferences(userId);
  }

  @Put(':userId/preferences')
  @ApiOperation({ summary: 'Update user preferences' })
  async updateUserPreferences(
    @Param('userId') userId: string,
    @Body() updates: Partial<UserPreferences>,
  ): Promise<UserPreferences> {
    return this.usersService.updateUserPreferences(userId, updates);
  }

  @Get(':userId/bookmarks')
  @ApiOperation({ summary: 'Get user bookmarks' })
  @ApiQuery({ name: 'type', required: false, type: String })
  async getUserBookmarks(
    @Param('userId') userId: string,
    @Query('type') type?: BookmarkType,
  ): Promise<UserBookmark[]> {
    return this.usersService.getUserBookmarks(userId, type);
  }

  @Post(':userId/bookmarks')
  @ApiOperation({ summary: 'Add bookmark for experience run' })
  async addBookmark(
    @Param('userId') userId: string,
    @Body()
    body: { experienceRunId: string; bookmarkType?: BookmarkType },
  ): Promise<UserBookmark> {
    return this.usersService.addBookmark(
      userId,
      body.experienceRunId,
      body.bookmarkType || BookmarkType.WISHLIST,
    );
  }

  @Delete(':userId/bookmarks/:experienceRunId')
  @ApiOperation({ summary: 'Remove bookmark' })
  async removeBookmark(
    @Param('userId') userId: string,
    @Param('experienceRunId') experienceRunId: string,
  ): Promise<void> {
    return this.usersService.removeBookmark(userId, experienceRunId);
  }

  @Put(':userId/status/deactivate')
  @ApiOperation({ summary: 'Deactivate user account' })
  async deactivateUser(@Param('userId') userId: string): Promise<User> {
    return this.usersService.deactivateUser(userId);
  }

  @Put(':userId/status/reactivate')
  @ApiOperation({ summary: 'Reactivate user account' })
  async reactivateUser(@Param('userId') userId: string): Promise<User> {
    return this.usersService.reactivateUser(userId);
  }
}
