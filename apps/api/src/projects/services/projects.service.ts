import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

import { CreateProjectDto } from '../dto/create-project.dto';
import { AddProjectMemberDto } from '../dto/add-project-member.dto';

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

  async addMember(projectId: string, dto: AddProjectMemberDto) {
    const exists = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: dto.userId,
        },
      },
    });

    if (exists) {
      throw new ConflictException(
        'User is already a member of this project.',
      );
    }

    return this.prisma.projectMember.create({
      data: {
        projectId,
        userId: dto.userId,
        role: dto.role,
      },
      include: {
        user: true,
      },
    });
  }

  async getMembers(projectId: string) {
    return this.prisma.projectMember.findMany({
      where: {
        projectId,
      },
      include: {
        user: true,
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });
  }

  async removeMember(projectId: string, userId: string) {
    return this.prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
  }
}