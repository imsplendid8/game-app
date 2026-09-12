import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService, AuthToken } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { JwtPayload } from './auth.service';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(
    @Body()
    body: {
      email: string;
      password: string;
      profileName?: string;
    },
  ) {
    if (!body.email || !body.password) {
      throw new BadRequestException('Email and password are required');
    }
    if (body.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
    return this.authService.register(body.email, body.password, body.profileName);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(
    @Body()
    body: {
      email: string;
      password: string;
    },
  ): Promise<AuthToken> {
    if (!body.email || !body.password) {
      throw new BadRequestException('Email and password are required');
    }
    return this.authService.login(body.email, body.password);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(
    @Body()
    body: {
      refreshToken: string;
    },
  ): Promise<AuthToken> {
    if (!body.refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }
    return this.authService.refreshAccessToken(body.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  async getCurrentUser(@CurrentUser() user: JwtPayload) {
    return {
      userId: user.sub,
      email: user.email,
    };
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      oldPassword: string;
      newPassword: string;
    },
  ): Promise<{ message: string }> {
    if (!body.oldPassword || !body.newPassword) {
      throw new BadRequestException('Old and new passwords are required');
    }
    if (body.newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters');
    }
    await this.authService.changePassword(user.sub, body.oldPassword, body.newPassword);
    return { message: 'Password changed successfully' };
  }

  @Post('password-reset-request')
  @ApiOperation({ summary: 'Request password reset token' })
  async requestPasswordReset(
    @Body()
    body: {
      email: string;
    },
  ): Promise<{ resetToken: string }> {
    if (!body.email) {
      throw new BadRequestException('Email is required');
    }
    const resetToken = await this.authService.resetPasswordRequest(body.email);
    return { resetToken };
  }

  @Post('password-reset')
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(
    @Body()
    body: {
      resetToken: string;
      newPassword: string;
    },
  ): Promise<{ message: string }> {
    if (!body.resetToken || !body.newPassword) {
      throw new BadRequestException('Reset token and new password are required');
    }
    if (body.newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
    await this.authService.resetPassword(body.resetToken, body.newPassword);
    return { message: 'Password reset successfully' };
  }
}
