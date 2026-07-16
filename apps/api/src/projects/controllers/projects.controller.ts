import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
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
// import { ProjectFilterQueryDto } from '../dto/project-filter-query.dto';
import { ProjectsService } from '../services/projects.service';

import { Delete } from '@nestjs/common';

import { AddProjectMemberDto } from '../dto/add-project-member.dto';
import { Query } from '@nestjs/common';
import { ProjectFilterQueryDto } from '../../common/dto/project-filter-query.dto';

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
  findAll(
    @Query() query: ProjectFilterQueryDto,
  ) {
    return this.projectsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get project by id',
  })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }
  @Patch(':id')
  @Roles(RoleType.ADMIN, RoleType.PROJECT_MANAGER)
  @ApiOperation({
    summary: 'Update project',
  })
  update(
    @Param('id') id: string,
    @Body() dto: any, // Using any for now to bypass strict typing issues quickly
  ) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleType.ADMIN, RoleType.PROJECT_MANAGER)
  @ApiOperation({
    summary: 'Delete project',
  })
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
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