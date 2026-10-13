import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  //   Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ToolsService } from './tools.service';
import { ToolResponseDto } from './dto/tool-response.dto';
import { ToolExecutionResponseDto } from './dto/tool-execution-response.dto';

@ApiTags('Tools')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Get()
  @ApiOperation({ summary: 'List available tools for the authenticated user' })
  @ApiOkResponse({ type: ToolResponseDto, isArray: true })
  listTools() {
    return this.toolsService.listTools(false);
  }

  @Get('executions')
  @ApiOperation({ summary: 'List the authenticated user’s tool executions' })
  @ApiOkResponse({ type: ToolExecutionResponseDto, isArray: true })
  listExecutions(@CurrentUser('id') userId: string) {
    return this.toolsService.listMyExecutions(userId, 20);
  }

  @Get('executions/:executionId')
  @ApiOperation({ summary: 'Get one of the authenticated user’s executions' })
  @ApiOkResponse({ type: ToolExecutionResponseDto })
  getExecution(
    @CurrentUser('id') userId: string,
    @Param('executionId', new ParseUUIDPipe()) executionId: string,
  ) {
    return this.toolsService.getMyExecution(executionId, userId);
  }
}
