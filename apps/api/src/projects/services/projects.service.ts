import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

import { CreateProjectDto } from '../dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    dto: CreateProjectDto,
    ownerId: string,
  ) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        priority: dto.priority,
        startDate: dto.startDate
          ? new Date(dto.startDate)
          : null,
        dueDate: dto.dueDate
          ? new Date(dto.dueDate)
          : null,

        ownerId,
      },
      include: {
        owner: true,
      },
    });
  }

  async findAll() {
    return this.prisma.project.findMany({
      include: {
        owner: true,
        members: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.project.findUnique({
      where: {
        id,
      },
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }
}