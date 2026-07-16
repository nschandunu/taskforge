import { Injectable } from '@nestjs/common';
import { ProjectStatus, TaskStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getDashboard() {
    const [
      totalUsers,
      totalProjects,
      totalTasks,
      completedTasks,
      activeProjects,
      overdueTasks,
      recentActivities,
    ] = await Promise.all([
      this.prisma.user.count(),

      this.prisma.project.count(),

      this.prisma.task.count(),

      this.prisma.task.count({
        where: {
          status: TaskStatus.DONE,
        },
      }),

      this.prisma.project.count({
        where: {
          status: ProjectStatus.ACTIVE,
        },
      }),

      this.prisma.task.count({
        where: {
          dueDate: {
            lt: new Date(),
          },
          status: {
            not: TaskStatus.DONE,
          },
        },
      }),

      this.prisma.activityLog.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: true,
        },
      }),
    ]);

    const completionRate =
      totalTasks === 0
        ? 0
        : Number(
            ((completedTasks / totalTasks) * 100).toFixed(1),
          );

    return {
      overview: {
        totalUsers,
        totalProjects,
        totalTasks,
        completedTasks,
        activeProjects,
        overdueTasks,
        completionRate,
      },

      recentActivities,
    };
  }
}