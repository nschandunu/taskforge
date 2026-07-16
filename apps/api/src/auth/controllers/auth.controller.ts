import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { LoginDto } from '../dto/login.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('Authentication')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}