/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ChatEntity } from '../chats/entities/chat.entity';
import { AgentRunEntity } from './entities/agent-run.entity';
import { AgentPlanStepEntity } from './entities/agent-plan-step.entity';
import { AgentRunEventEntity } from './entities/agent-run-event.entity';
import { AGENT_RUN_QUEUE } from './constants/agent-run.constants';
import { AgentRunsController } from './agent-runs.controller';
import { AgentRunsService } from './agent-runs.service';
import { AgentRunQueueService } from './agent-run-queue.service';
import { AgentRunWorkerProcessor } from './agent-run-worker.processor';
import { AgentRunExecutorService } from './agent-run-executor.service';
import { AgentRunEventsService } from './agent-run-events.service';
import { AgentRunStreamService } from './agent-run-stream.service';
import { AgentRunRepository } from './repositories/agent-run.repository';
import { AgentPlanStepRepository } from './repositories/agent-plan-step.repository';
import { AgentRunEventRepository } from './repositories/agent-run-event.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatEntity,
      AgentRunEntity,
      AgentPlanStepEntity,
      AgentRunEventEntity,
    ]),
    BullModule.registerQueue({ name: AGENT_RUN_QUEUE }),
  ],
  controllers: [AgentRunsController],
  providers: [
    AgentRunsService,
    AgentRunQueueService,
    AgentRunWorkerProcessor,
    AgentRunExecutorService,
    AgentRunEventsService,
    AgentRunStreamService,
    AgentRunRepository,
    AgentPlanStepRepository,
    AgentRunEventRepository,
  ],
  exports: [AgentRunsService, AgentRunRepository],
})
export class AgentRunsModule {}
