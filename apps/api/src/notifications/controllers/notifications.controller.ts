import {
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AuthUser } from '../../auth/interfaces/auth-user.interface';

import { NotificationsService } from '../services/notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller({
  path: 'notifications',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'My notifications',
  })
  findMine(
    @CurrentUser() user: AuthUser,
  ) {
    return this.notificationsService.findMyNotifications(
      user.id,
    );
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Unread notification count',
  })
  unreadCount(
    @CurrentUser() user: AuthUser,
  ) {
    return this.notificationsService.getUnreadCount(
      user.id,
    );
  }

  @Patch(':id/read')
  @ApiOperation({
    summary: 'Mark notification as read',
  })
  markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.notificationsService.markAsRead(
      id,
      user.id,
    );
  }
}