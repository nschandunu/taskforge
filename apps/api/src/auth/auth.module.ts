import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';

import { PrismaModule } from '../prisma/prisma.module';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.getOrThrow<string>(
            'JWT_EXPIRES_IN',
          ) as StringValue,
        },
      }),
    }),
  ],

  controllers: [AuthController],

  providers: [AuthService],

  exports: [JwtModule, AuthService],
})
export class AuthModule {}