import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from './entities/user.entity';
import { UserMapper } from './mappers/user.mapper';
import { UserRepository } from './repositories/user.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],

  controllers: [UsersController],

  providers: [UsersService, UserRepository, UserMapper],

  exports: [UsersService],
})
export class UsersModule {}
