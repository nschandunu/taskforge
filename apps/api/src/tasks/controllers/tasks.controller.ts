import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RoleType } from '@prisma/client';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AuthUser } from '../../auth/interfaces/auth-user.interface';
import { TaskFilterQueryDto } from '../../common/dto/task-filter-query.dto';

import { CreateTaskDto } from '../dto/create-task.dto';
import { AssignTaskDto } from '../dto/assign-task.dto';
import { UpdateTaskDueDateDto } from '../dto/update-task-due-date.dto';
import { UpdateTaskPriorityDto } from '../dto/update-task-priority.dto';
import { UpdateTaskStatusDto } from '../dto/update-task-status.dto';
import { TasksService } from '../services/tasks.service';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller({
  path: 'tasks',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
  ) {}

  @Post()
  @Roles(RoleType.ADMIN, RoleType.PROJECT_MANAGER)
  @ApiOperation({
    summary: 'Create task',
  })
  create(
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tasksService.create(dto, user.id);
  }

  @Get('project/:projectId')
  @ApiOperation({
    summary: 'Get tasks by project',
  })
  findByProject(
    @Param('projectId') projectId: string,
    @Query() query: TaskFilterQueryDto,
  ) {
    return this.tasksService.findByProject(projectId, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get task details',
  })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(RoleType.ADMIN, RoleType.PROJECT_MANAGER)
  @ApiOperation({
    summary: 'Update task status',
  })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    return this.tasksService.updateStatus(id, dto);
  }

  @Patch(':id/assign')
  @Roles(RoleType.ADMIN, RoleType.PROJECT_MANAGER)
  @ApiOperation({
    summary: 'Assign task',
  })
  assignTask(
    @Param('id') id: string,
    @Body() dto: AssignTaskDto,
  ) {
    return this.tasksService.assignTask(id, dto);
  }

  @Patch(':id/priority')
  @Roles(RoleType.ADMIN, RoleType.PROJECT_MANAGER)
  @ApiOperation({
    summary: 'Update task priority',
  })
  updatePriority(
    @Param('id') id: string,
    @Body() dto: UpdateTaskPriorityDto,
  ) {
    return this.tasksService.updatePriority(id, dto);
  }

  @Patch(':id/due-date')
  @Roles(RoleType.ADMIN, RoleType.PROJECT_MANAGER)
  @ApiOperation({
    summary: 'Update task due date',
  })
  updateDueDate(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDueDateDto,
  ) {
    return this.tasksService.updateDueDate(id, dto);
  }
}