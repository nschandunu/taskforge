import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommentDto } from '../dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    taskId: string,
    authorId: string,
    dto: CreateCommentDto,
  ) {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!task) {
      throw new NotFoundException(
        'Task not found.',
      );
    }

    return this.prisma.taskComment.create({
      data: {
        content: dto.content,
        taskId,
        authorId,
      },
      include: {
        author: true,
      },
    });
  }

  async findByTask(taskId: string) {
    return this.prisma.taskComment.findMany({
      where: {
        taskId,
      },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}