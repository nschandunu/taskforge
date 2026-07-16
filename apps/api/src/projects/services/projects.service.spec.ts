import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectStatus, ProjectPriority } from '@prisma/client';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    project: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a project', async () => {
    const createDto = {
      name: 'Test Project',
      description: 'Desc',
      priority: ProjectPriority.HIGH,
      startDate: '2023-01-01',
      dueDate: '2023-12-31',
    };
    const ownerId = 'owner-123';
    
    const mockResult = {
      id: 'proj-1',
      ...createDto,
      startDate: new Date(createDto.startDate),
      dueDate: new Date(createDto.dueDate),
      ownerId,
    };

    mockPrismaService.project.create.mockResolvedValue(mockResult);

    const result = await service.create(createDto, ownerId);
    
    expect(mockPrismaService.project.create).toHaveBeenCalled();
    expect(result).toEqual(mockResult);
  });

  it('should return all projects', async () => {
    const mockProjects = [{ id: '1', name: 'Proj 1' }, { id: '2', name: 'Proj 2' }];
    const mockCount = 2;
    
    mockPrismaService.$transaction.mockResolvedValue([mockProjects, mockCount]);

    const query = { page: 1, limit: 10 };
    const result = await service.findAll(query);
    
    expect(mockPrismaService.$transaction).toHaveBeenCalled();
    expect(result).toEqual({
      items: mockProjects,
      meta: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  });

  it('should update a project', async () => {
    const id = 'proj-1';
    const updateDto = { name: 'Updated Name' };
    const mockProject = { id, name: 'Old Name' };
    
    mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
    mockPrismaService.project.update.mockResolvedValue({ ...mockProject, ...updateDto });

    const result = await service.update(id, updateDto);

    expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({ where: { id } });
    expect(mockPrismaService.project.update).toHaveBeenCalledWith({
      where: { id },
      data: updateDto,
    });
    expect(result.name).toBe('Updated Name');
  });

  it('should delete a project', async () => {
    const id = 'proj-1';
    const mockProject = { id, name: 'Project to Delete' };
    
    mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
    mockPrismaService.project.delete.mockResolvedValue(mockProject);

    const result = await service.remove(id);

    expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({ where: { id } });
    expect(mockPrismaService.project.delete).toHaveBeenCalledWith({ where: { id } });
    expect(result).toEqual(mockProject);
  });
});
