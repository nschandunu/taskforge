import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateTaskDto } from '../dto/create-task.dto';
import { TaskFilterQueryDto } from '../../common/dto/task-filter-query.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    dto: CreateTaskDto,
    creatorId: string,
  ) {
    const project = await this.prisma.project.findUnique({
      where: {
        id: dto.projectId,
      },
    });

    if (!project) {
      throw new NotFoundException(
        'Project not found.',
      );
    }

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        dueDate: dto.dueDate
          ? new Date(dto.dueDate)
          : null,

        creatorId,
        assigneeId: dto.assigneeId,
        projectId: dto.projectId,
      },
      include: {
        creator: true,
        assignee: true,
        project: true,
      },
    });
  }

  async findAll(query: TaskFilterQueryDto) {
    return this.prisma.task.findMany({
      include: {
        creator: true,
        assignee: true,
        project: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByProject(projectId: string) {
    return this.prisma.task.findMany({
      where: {
        projectId,
      },
      include: {
        creator: true,
        assignee: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.task.findUnique({
      where: {
        id,
      },
      include: {
        creator: true,
        assignee: true,
        comments: true,
        attachments: true,
        labels: {
          include: {
            label: true,
          },
        },
      },
    });
  }
}