import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ToolExecutionEntity } from './entities/tool-execution.entity';
import { ToolExecutionRepository } from './repositories/tool-execution.repository';
import { ToolRegistryService } from './tool-registry.service';
import { ToolExecutionService } from './tool-execution.service';
import { ToolsService } from './tools.service';
import { ToolsController } from './tools.controller';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([ToolExecutionEntity])],
  controllers: [ToolsController],
  providers: [
    ToolExecutionRepository,
    ToolRegistryService,
    ToolExecutionService,
    ToolsService,
  ],
  exports: [ToolRegistryService, ToolExecutionService, ToolExecutionRepository],
})
export class ToolsModule {}
