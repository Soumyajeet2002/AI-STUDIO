import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEntity } from '../projects/entities/project.entity';
import { ChatEntity } from './entities/chat.entity';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { ChatRepository } from './repositories/chat.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ChatEntity, ProjectEntity])],
  controllers: [ChatsController],
  providers: [ChatsService, ChatRepository],
  exports: [ChatsService, ChatRepository],
})
export class ChatsModule {}
