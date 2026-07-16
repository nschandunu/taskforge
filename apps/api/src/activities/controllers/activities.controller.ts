import {
  Controller,
  Get,
  Query,
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

import { ActivitiesService } from '../services/activities.service';

@ApiTags('Activities')
@ApiBearerAuth()
@Controller({
  path: 'activities',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivitiesController {
  constructor(
    private readonly activitiesService: ActivitiesService,
  ) {}

  @Get()
  @Roles(RoleType.ADMIN, RoleType.PROJECT_MANAGER)
  @ApiOperation({
    summary: 'Get recent activities',
  })
  findLatest(
    @Query('limit') limit?: string,
  ) {
    return this.activitiesService.findLatest(
      limit ? Number(limit) : 20,
    );
  }
}