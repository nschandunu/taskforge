import { Injectable } from '@nestjs/common';

import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  async login(loginDto: LoginDto) {
    console.log(loginDto);

    return {
      message: 'Login endpoint working.',
    };
  }
}