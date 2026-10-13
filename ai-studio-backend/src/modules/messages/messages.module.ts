import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatEntity } from '../chats/entities/chat.entity';
import { MessageEntity } from './entities/message.entity';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessageRepository } from './repositories/message.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MessageEntity, ChatEntity])],
  controllers: [MessagesController],
  providers: [MessagesService, MessageRepository],
  exports: [MessagesService, MessageRepository],
})
export class MessagesModule {}
