import {
  Controller,
  Get,
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

import { DashboardService } from '../services/dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller({
  path: 'dashboard',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get()
  @Roles(
    RoleType.ADMIN,
    RoleType.PROJECT_MANAGER,
  )
  @ApiOperation({
    summary: 'Dashboard overview',
  })
  getDashboard() {
    return this.dashboardService.getDashboard();
  }
}