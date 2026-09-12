import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersService: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockUsersService = {
      createUser: jest.fn(),
      getUserById: jest.fn(),
      getUserByEmail: jest.fn(),
      updateUserPassword: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user with encrypted password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePassword123',
        profileName: 'Test User',
      };

      const createdUser: any = {
        id: 'user-1',
        email: userData.email,
        profileName: userData.profileName,
      };

      mockUsersService.createUser.mockResolvedValue(createdUser);
      mockUsersService.updateUserPassword.mockResolvedValue(undefined);
      mockJwtService.sign.mockReturnValue('mocked-access-token');

      const result = await service.register(
        userData.email,
        userData.password,
        userData.profileName,
      );

      expect(result.userId).toBe('user-1');
      expect(result.email).toBe(userData.email);
      expect(result.accessToken).toBe('mocked-access-token');
      expect(mockUsersService.updateUserPassword).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return tokens on successful login', async () => {
      const mockUser: any = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: '$2b$10$hashed.password.here',
      };

      mockUsersService.getUserByEmail.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      const result = await service.login('test@example.com', 'SomePassword123');

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.expiresIn).toBe(86400);
    });

    it('should throw UnauthorizedException on invalid email', async () => {
      mockUsersService.getUserByEmail.mockResolvedValue(null);

      await expect(
        service.login('nonexistent@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is not set', async () => {
      const mockUser: any = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: null,
      };

      mockUsersService.getUserByEmail.mockResolvedValue(mockUser);

      await expect(
        service.login('test@example.com', 'SomePassword123'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateToken', () => {
    it('should validate and return JWT payload', async () => {
      const payload = {
        sub: 'user-1',
        email: 'test@example.com',
        iat: 1234567890,
        exp: 1234568890,
      };

      mockJwtService.verifyAsync.mockResolvedValue(payload);

      const result = await service.validateToken('valid-token');

      expect(result).toEqual(payload);
    });

    it('should throw UnauthorizedException on invalid token', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.validateToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const mockUser: any = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: '$2b$10$old.password.hash',
      };

      mockUsersService.getUserById.mockResolvedValue(mockUser);
      mockUsersService.updateUserPassword.mockResolvedValue(undefined);

      await service.changePassword('user-1', 'OldPassword123', 'NewPassword456');

      expect(mockUsersService.updateUserPassword).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.getUserById.mockResolvedValue(null);

      await expect(
        service.changePassword('user-1', 'OldPassword123', 'NewPassword456'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('resetPasswordRequest', () => {
    it('should generate reset token for valid email', async () => {
      const mockUser: any = {
        id: 'user-1',
        email: 'test@example.com',
      };

      mockUsersService.getUserByEmail.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('reset-token');

      const result = await service.resetPasswordRequest('test@example.com');

      expect(result).toBe('reset-token');
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for non-existent email', async () => {
      mockUsersService.getUserByEmail.mockResolvedValue(null);

      await expect(
        service.resetPasswordRequest('nonexistent@example.com'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
