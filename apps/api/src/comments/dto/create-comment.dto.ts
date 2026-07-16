import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: 'Need to optimize this query.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
}