import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { ListMessagesQueryDto } from './dto/list-messages-query.dto';
import {
  MessageListResponseDto,
  MessageResponseDto,
} from './dto/message-response.dto';
import { MessagesService } from './messages.service';

@ApiTags('Messages')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('chats/:chatId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a user message in a chat' })
  @ApiParam({ name: 'chatId', format: 'uuid' })
  @ApiOkResponse({ type: MessageResponseDto })
  create(
    @CurrentUser('id') userId: string,
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Body() dto: CreateMessageDto,
  ): Promise<MessageResponseDto> {
    return this.messagesService.create(userId, chatId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated messages for a chat' })
  @ApiParam({ name: 'chatId', format: 'uuid' })
  @ApiOkResponse({ type: MessageListResponseDto })
  findAll(
    @CurrentUser('id') userId: string,
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Query() query: ListMessagesQueryDto,
  ): Promise<MessageListResponseDto> {
    return this.messagesService.findAll(userId, chatId, query);
  }

  @Get(':messageId')
  @ApiOperation({ summary: 'Get a message by ID' })
  @ApiParam({ name: 'chatId', format: 'uuid' })
  @ApiParam({ name: 'messageId', format: 'uuid' })
  @ApiOkResponse({ type: MessageResponseDto })
  findOne(
    @CurrentUser('id') userId: string,
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
  ): Promise<MessageResponseDto> {
    return this.messagesService.findOne(userId, chatId, messageId);
  }

  @Patch(':messageId')
  @ApiOperation({ summary: 'Edit a user message' })
  @ApiParam({ name: 'chatId', format: 'uuid' })
  @ApiParam({ name: 'messageId', format: 'uuid' })
  @ApiOkResponse({ type: MessageResponseDto })
  update(
    @CurrentUser('id') userId: string,
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Body() dto: UpdateMessageDto,
  ): Promise<MessageResponseDto> {
    return this.messagesService.update(userId, chatId, messageId, dto);
  }

  @Delete(':messageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user message' })
  @ApiParam({ name: 'chatId', format: 'uuid' })
  @ApiParam({ name: 'messageId', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Message deleted successfully' })
  async remove(
    @CurrentUser('id') userId: string,
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
  ): Promise<void> {
    await this.messagesService.remove(userId, chatId, messageId);
  }
}
