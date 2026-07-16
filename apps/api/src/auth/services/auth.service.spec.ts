import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully with valid credentials', async () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedpassword',
      firstName: 'John',
      lastName: 'Doe',
      role: { name: 'ADMIN' },
    };

    mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    mockJwtService.signAsync.mockResolvedValue('token');

    const result = await service.login(loginDto);

    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email: loginDto.email },
      include: { role: true },
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
    expect(mockJwtService.signAsync).toHaveBeenCalledWith({
      sub: mockUser.id,
      email: mockUser.email,
      role: mockUser.role.name,
    });
    expect(result).toEqual({
      accessToken: 'token',
      user: {
        id: mockUser.id,
        name: 'John Doe',
        email: mockUser.email,
        role: 'ADMIN',
      },
    });
  });

  it('should throw UnauthorizedException when password is incorrect', async () => {
    const loginDto = { email: 'test@example.com', password: 'wrongpassword' };
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedpassword',
      firstName: 'John',
      lastName: 'Doe',
      role: { name: 'ADMIN' },
    };

    mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
  });

  it('should throw UnauthorizedException when user does not exist', async () => {
    const loginDto = { email: 'notfound@example.com', password: 'password123' };

    mockPrismaService.user.findUnique.mockResolvedValue(null);

    await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });
});
