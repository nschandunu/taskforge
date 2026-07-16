import { ApiProperty } from '@nestjs/swagger';
import { ProjectPriority } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    example: 'TaskForge',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    required: false,
    example: 'Modern project management platform.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: ProjectPriority,
    default: ProjectPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(ProjectPriority)
  priority?: ProjectPriority;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}