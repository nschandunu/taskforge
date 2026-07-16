import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class UpdateTaskDueDateDto {
  @ApiProperty()
  @IsDateString()
  dueDate: string;
}