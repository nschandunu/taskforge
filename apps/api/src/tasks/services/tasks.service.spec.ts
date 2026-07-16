import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivitiesService } from '../../activities/services/activities.service';
import { TaskStatus, TaskPriority } from '@prisma/client';

describe('TasksService', () => {
  let service: TasksService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    project: {
      findUnique: jest.fn(),
    },
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockActivitiesService = {
    // mock activities service methods if needed
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ActivitiesService, useValue: mockActivitiesService },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a task', async () => {
    const createDto = {
      title: 'New Task',
      description: 'Desc',
      projectId: 'proj-1',
      priority: TaskPriority.HIGH,
    };
    const creatorId = 'creator-1';

    const mockProject = { id: 'proj-1', name: 'Project 1' };
    const mockTask = { id: 'task-1', ...createDto, creatorId };

    mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
    mockPrismaService.task.create.mockResolvedValue(mockTask);

    const result = await service.create(createDto, creatorId);

    expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({ where: { id: createDto.projectId } });
    expect(mockPrismaService.task.create).toHaveBeenCalled();
    expect(result).toEqual(mockTask);
  });

  it('should return tasks by project', async () => {
    const projectId = 'proj-1';
    const query = { page: 1, limit: 10 };
    const mockTasks = [{ id: 'task-1', title: 'Task 1' }];
    const mockCount = 1;

    mockPrismaService.$transaction.mockResolvedValue([mockTasks, mockCount]);

    const result = await service.findByProject(projectId, query);

    expect(mockPrismaService.$transaction).toHaveBeenCalled();
    expect(result).toEqual({
      items: mockTasks,
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  });

  it('should update task status', async () => {
    const taskId = 'task-1';
    const updateDto = { status: TaskStatus.DONE };
    const mockTask = { id: taskId, title: 'Task 1', status: TaskStatus.TODO };
    const updatedTask = { ...mockTask, status: TaskStatus.DONE };

    mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
    mockPrismaService.task.update.mockResolvedValue(updatedTask);

    const result = await service.updateStatus(taskId, updateDto);

    expect(mockPrismaService.task.findUnique).toHaveBeenCalledWith({ where: { id: taskId } });
    expect(mockPrismaService.task.update).toHaveBeenCalledWith({
      where: { id: taskId },
      data: { status: updateDto.status },
      include: expect.any(Object),
    });
    expect(result.status).toBe(TaskStatus.DONE);
  });

  it('should delete/archive task if supported', async () => {
    const taskId = 'task-1';
    const mockTask = { id: taskId, title: 'Task 1' };

    mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
    mockPrismaService.task.delete.mockResolvedValue(mockTask);

    const result = await service.remove(taskId);

    expect(mockPrismaService.task.findUnique).toHaveBeenCalledWith({ where: { id: taskId } });
    expect(mockPrismaService.task.delete).toHaveBeenCalledWith({ where: { id: taskId } });
    expect(result).toEqual(mockTask);
  });
});
