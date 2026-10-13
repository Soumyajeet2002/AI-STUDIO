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
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { ListChatsQueryDto } from './dto/list-chats-query.dto';
import { UpdateChatArchiveDto } from './dto/update-chat-archive.dto';
import { ChatListResponseDto, ChatResponseDto } from './dto/chat-response.dto';
import { ChatsService } from './chats.service';

@ApiTags('Chats')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a chat' })
  @ApiOkResponse({ type: ChatResponseDto })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateChatDto,
  ): Promise<ChatResponseDto> {
    return this.chatsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List the current user’s chats' })
  @ApiOkResponse({ type: ChatListResponseDto })
  findAll(
    @CurrentUser('id') userId: string,
    @Query() query: ListChatsQueryDto,
  ): Promise<ChatListResponseDto> {
    return this.chatsService.findAll(userId, query);
  }

  @Get(':chatId')
  @ApiOperation({ summary: 'Get a chat by ID' })
  @ApiParam({ name: 'chatId', format: 'uuid' })
  @ApiOkResponse({ type: ChatResponseDto })
  findOne(
    @CurrentUser('id') userId: string,
    @Param('chatId', new ParseUUIDPipe()) chatId: string,
  ): Promise<ChatResponseDto> {
    return this.chatsService.findOne(userId, chatId);
  }

  @Patch(':chatId')
  @ApiOperation({ summary: 'Update a chat title or metadata' })
  @ApiParam({ name: 'chatId', format: 'uuid' })
  @ApiOkResponse({ type: ChatResponseDto })
  update(
    @CurrentUser('id') userId: string,
    @Param('chatId', new ParseUUIDPipe()) chatId: string,
    @Body() dto: UpdateChatDto,
  ): Promise<ChatResponseDto> {
    return this.chatsService.update(userId, chatId, dto);
  }

  @Patch(':chatId/archive')
  @ApiOperation({ summary: 'Archive or unarchive a chat' })
  @ApiParam({ name: 'chatId', format: 'uuid' })
  @ApiOkResponse({ type: ChatResponseDto })
  setArchived(
    @CurrentUser('id') userId: string,
    @Param('chatId', new ParseUUIDPipe()) chatId: string,
    @Body() dto: UpdateChatArchiveDto,
  ): Promise<ChatResponseDto> {
    return this.chatsService.setArchived(userId, chatId, dto);
  }

  @Delete(':chatId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a chat' })
  @ApiParam({ name: 'chatId', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Chat deleted successfully' })
  async remove(
    @CurrentUser('id') userId: string,
    @Param('chatId', new ParseUUIDPipe()) chatId: string,
  ): Promise<void> {
    await this.chatsService.remove(userId, chatId);
  }
}
