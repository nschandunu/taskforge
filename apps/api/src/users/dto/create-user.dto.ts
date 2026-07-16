import { RoleType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({
    minLength: 8,
  })
  @MinLength(8)
  password: string;

  @ApiProperty({
    enum: RoleType,
  })
  @IsEnum(RoleType)
  role: RoleType;
}