import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  @MaxLength(150)
  title: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: TaskPriority,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty()
  @IsUUID()
  projectId: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}