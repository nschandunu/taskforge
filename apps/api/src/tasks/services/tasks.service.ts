import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { ActivitiesService } from '../../activities/services/activities.service';

import { CreateTaskDto } from '../dto/create-task.dto';
import { AssignTaskDto } from '../dto/assign-task.dto';
import { UpdateTaskDueDateDto } from '../dto/update-task-due-date.dto';
import { UpdateTaskPriorityDto } from '../dto/update-task-priority.dto';
import { UpdateTaskStatusDto } from '../dto/update-task-status.dto';
import { Prisma } from '@prisma/client';
import { TaskFilterQueryDto } from '../../common/dto/task-filter-query.dto';
import { getPagination } from '../../common/utils/pagination.util';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activitiesService: ActivitiesService,
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

  async findByProject(
    projectId: string,
    query: TaskFilterQueryDto,
  ) {
    const { page, limit, search, status, priority } = query;

    const { skip, take } = getPagination(page, limit);

    const where: Prisma.TaskWhereInput = {
      projectId,
    };

    if (search) {
      where.OR = [
        {
          title: {
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
      this.prisma.task.findMany({
        where,
        skip,
        take,
        include: {
          creator: true,
          assignee: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.task.count({
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

  async updateStatus(
    id: string,
    dto: UpdateTaskStatusDto,
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        status: dto.status,
      },
      include: {
        assignee: true,
        creator: true,
        project: true,
      },
    });
  }

  async assignTask(
    id: string,
    dto: AssignTaskDto,
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: dto.assigneeId,
      },
    });

    if (!user) {
      throw new BadRequestException('Assignee not found.');
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        assigneeId: dto.assigneeId,
      },
      include: {
        assignee: true,
        creator: true,
      },
    });
  }

  async updatePriority(
    id: string,
    dto: UpdateTaskPriorityDto,
  ) {
    return this.prisma.task.update({
      where: { id },
      data: {
        priority: dto.priority,
      },
    });
  }

  async updateDueDate(
    id: string,
    dto: UpdateTaskDueDateDto,
  ) {
    return this.prisma.task.update({
      where: { id },
      data: {
        dueDate: new Date(dto.dueDate),
      },
    });
  }
}