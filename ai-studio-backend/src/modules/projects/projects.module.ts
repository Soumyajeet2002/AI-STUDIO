import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';

import { ProjectEntity } from './entities/project.entity';
import { ProjectMapper } from './mappers/project.mapper';
import { ProjectRepository } from './repositories/project.repository';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([ProjectEntity])],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectRepository, ProjectMapper],
  exports: [ProjectsService, ProjectRepository],
})
export class ProjectsModule {}
