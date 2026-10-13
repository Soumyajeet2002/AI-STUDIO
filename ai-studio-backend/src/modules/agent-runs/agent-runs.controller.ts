import {
  Body,
  Controller,
  Get,
  Header,
  Headers,
  HttpCode,
  HttpStatus,
  MessageEvent,
  Param,
  ParseUUIDPipe,
  //   ParseIntPipe,
  Post,
  Query,
  Sse,
  UseGuards,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateAgentRunDto } from './dto/create-agent-run.dto';
import { ListAgentRunsQueryDto } from './dto/list-agent-runs-query.dto';
import {
  AgentRunListResponseDto,
  AgentRunResponseDto,
} from './dto/agent-run-response.dto';
import { AgentRunsService } from './agent-runs.service';
import { AgentRunStreamService } from './agent-run-stream.service';

@ApiTags('Agent Runs')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('agent/runs')
export class AgentRunsController {
  constructor(
    private readonly runs: AgentRunsService,
    private readonly streams: AgentRunStreamService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Queue a new agent run' })
  @ApiAcceptedResponse({ type: AgentRunResponseDto })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAgentRunDto,
  ): Promise<AgentRunResponseDto> {
    return this.runs.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List the current user’s agent runs' })
  @ApiOkResponse({ type: AgentRunListResponseDto })
  findAll(
    @CurrentUser('id') userId: string,
    @Query() query: ListAgentRunsQueryDto,
  ): Promise<AgentRunListResponseDto> {
    return this.runs.findAll(userId, query);
  }

  @Get(':runId')
  @ApiOperation({ summary: 'Get an agent run and its plan steps' })
  @ApiParam({ name: 'runId', format: 'uuid' })
  @ApiOkResponse({ type: AgentRunResponseDto })
  findOne(
    @CurrentUser('id') userId: string,
    @Param('runId', ParseUUIDPipe) runId: string,
  ): Promise<AgentRunResponseDto> {
    return this.runs.findOne(userId, runId);
  }

  @Post(':runId/cancel')
  @ApiOperation({ summary: 'Request cancellation of an agent run' })
  @ApiParam({ name: 'runId', format: 'uuid' })
  @ApiOkResponse({ type: AgentRunResponseDto })
  cancel(
    @CurrentUser('id') userId: string,
    @Param('runId', ParseUUIDPipe) runId: string,
  ): Promise<AgentRunResponseDto> {
    return this.runs.cancel(userId, runId);
  }

  @Sse(':runId/stream')
  @Header('Cache-Control', 'no-cache, no-transform')
  @Header('X-Accel-Buffering', 'no')
  @ApiOperation({ summary: 'Stream persisted agent run events using SSE' })
  @ApiParam({ name: 'runId', format: 'uuid' })
  stream(
    @CurrentUser('id') userId: string,
    @Param('runId', ParseUUIDPipe) runId: string,
    @Headers('last-event-id') lastEventId?: string,
  ): Observable<MessageEvent> {
    // The run must be authorized before opening the event stream.
    // Controller-level ownership is checked asynchronously below via a guard
    // or by switching to an async stream factory in the service.
    const cursor =
      lastEventId && /^\d+$/.test(lastEventId) ? Number(lastEventId) : 0;

    return new Observable<MessageEvent>((subscriber) => {
      void this.runs
        .findOne(userId, runId)
        .then(() => {
          const stream = this.streams.stream(runId, cursor);
          const subscription = stream.subscribe(subscriber);
          subscriber.add(subscription);
        })
        .catch((error) => subscriber.error(error));
    });
  }
}
