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

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import type { AuthUser } from '../../auth/interfaces/auth-user.interface';

import { CreateProjectDto } from '../dto/create-project.dto';
import { ProjectsService } from '../services/projects.service';

import { Delete } from '@nestjs/common';

import { AddProjectMemberDto } from '../dto/add-project-member.dto';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller({
  path: 'projects',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
  ) {}

  @Post()
  @Roles(RoleType.ADMIN, RoleType.PROJECT_MANAGER)
  @ApiOperation({
    summary: 'Create project',
  })
  create(
    @Body() dto: CreateProjectDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all projects',
  })
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get project by id',
  })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Post(':id/members')
  @Roles(RoleType.ADMIN, RoleType.PROJECT_MANAGER)
  @ApiOperation({
    summary: 'Add member to project',
  })
  addMember(
    @Param('id') id: string,
    @Body() dto: AddProjectMemberDto,
  ) {
    return this.projectsService.addMember(id, dto);
  }

  @Get(':id/members')
  @ApiOperation({
    summary: 'Get project members',
  })
  getMembers(@Param('id') id: string) {
    return this.projectsService.getMembers(id);
  }

  @Delete(':projectId/members/:userId')
  @Roles(RoleType.ADMIN, RoleType.PROJECT_MANAGER)
  @ApiOperation({
    summary: 'Remove project member',
  })
  removeMember(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ) {
    return this.projectsService.removeMember(
      projectId,
      userId,
    );
  }
}