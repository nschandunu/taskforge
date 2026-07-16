import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { RoleType } from '@prisma/client';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AuthUser } from '../../auth/interfaces/auth-user.interface';

import { CreateTaskDto } from '../dto/create-task.dto';
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
  ) {
    return this.tasksService.findByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get task details',
  })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }
}