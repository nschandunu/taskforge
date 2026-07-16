import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        role: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });
  }

  async create() {
    throw new BadRequestException(
      'Implementation in next milestone.',
    );
  }

  async update() {
    throw new BadRequestException(
      'Implementation in next milestone.',
    );
  }

  async remove() {
    throw new BadRequestException(
      'Implementation in next milestone.',
    );
  }
}