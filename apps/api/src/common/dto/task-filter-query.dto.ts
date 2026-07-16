import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from './pagination-query.dto';

export class TaskFilterQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;
}