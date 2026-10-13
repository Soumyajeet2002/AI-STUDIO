import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtModule } from '@nestjs/jwt';

import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';

import { AuthService } from './auth.service';

import { AuthSessionEntity } from './entities/auth-session.entity';

import { AuthSessionRepository } from './repositories/auth-session.repository';

import { PasswordService } from './services/password.service';

import { AccessTokenStrategy } from './strategies/access-token.strategy';

import { UsersModule } from '../users/users.module';

import { UserMapper } from '../users/mappers/user.mapper';

@Module({
  imports: [
    UsersModule,

    PassportModule.register({
      defaultStrategy: 'access-token',
    }),

    JwtModule.register({}),

    TypeOrmModule.forFeature([AuthSessionEntity]),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    PasswordService,
    AuthSessionRepository,
    AccessTokenStrategy,
    UserMapper,
  ],

  exports: [AuthService, AccessTokenStrategy],
})
export class AuthModule {}
