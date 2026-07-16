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

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AuthUser } from '../../auth/interfaces/auth-user.interface';

import { CommentsService } from '../services/comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';

@ApiTags('Comments')
@ApiBearerAuth()
@Controller({
  path: 'tasks/:taskId/comments',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Add comment to task',
  })
  create(
    @Param('taskId') taskId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(
      taskId,
      user.id,
      dto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get task comments',
  })
  findByTask(
    @Param('taskId') taskId: string,
  ) {
    return this.commentsService.findByTask(taskId);
  }
}