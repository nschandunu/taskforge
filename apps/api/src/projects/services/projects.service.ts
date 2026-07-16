import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

import { CreateProjectDto } from '../dto/create-project.dto';
import { AddProjectMemberDto } from '../dto/add-project-member.dto';
import { ProjectFilterQueryDto } from '../../common/dto/project-filter-query.dto';
import { getPagination } from '../../common/utils/pagination.util';

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

  async findAll(query: ProjectFilterQueryDto) {
    const { page, limit, search, status, priority } = query;

    const { skip, take } = getPagination(page, limit);

    const where: Prisma.ProjectWhereInput = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        skip,
        take,
        include: {
          owner: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),

      this.prisma.project.count({
        where,
      }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
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

  async update(id: string, dto: any) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found.');
    }
    return this.prisma.project.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found.');
    }
    // Delete all associated project members and tasks automatically if cascade is on, 
    // or do it manually if necessary. Assuming Prisma handles cascading deletes on Project.
    return this.prisma.project.delete({
      where: { id },
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