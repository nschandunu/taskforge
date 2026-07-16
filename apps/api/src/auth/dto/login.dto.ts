import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin@taskforge.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password@123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}