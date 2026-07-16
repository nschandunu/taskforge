import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateTaskPriorityDto {
  @ApiProperty({
    enum: TaskPriority,
  })
  @IsEnum(TaskPriority)
  priority: TaskPriority;
}