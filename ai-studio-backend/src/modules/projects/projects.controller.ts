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
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ListProjectsQueryDto } from './dto/list-projects-query.dto';
import {
  ProjectListResponseDto,
  ProjectResponseDto,
} from './dto/project-response.dto';

import { UpdateProjectPinDto } from './dto/update-project-pin.dto';
import { UpdateProjectArchiveDto } from './dto/update-project-archive.dto';
import { ProjectsService } from './projects.service';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
@UseGuards(AccessTokenGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a project',
  })
  @ApiResponse({
    status: 201,
    type: ProjectResponseDto,
  })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List projects owned by the current user',
  })
  @ApiResponse({
    status: 200,
    type: ProjectListResponseDto,
  })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListProjectsQueryDto,
  ): Promise<ProjectListResponseDto> {
    return this.projectsService.findAll(user.id, query);
  }

  @Get(':projectId')
  @ApiOperation({
    summary: 'Get a project by ID',
  })
  @ApiParam({
    name: 'projectId',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    type: ProjectResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', new ParseUUIDPipe())
    projectId: string,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.findOne(user.id, projectId);
  }

  @Patch(':projectId')
  @ApiOperation({
    summary: 'Update project details or settings',
  })
  @ApiParam({
    name: 'projectId',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    type: ProjectResponseDto,
  })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', new ParseUUIDPipe())
    projectId: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.update(user.id, projectId, dto);
  }

  @Patch(':projectId/pin')
  @ApiOperation({
    summary: 'Pin or unpin a project',
  })
  @ApiParam({
    name: 'projectId',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    type: ProjectResponseDto,
  })
  async pin(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', new ParseUUIDPipe())
    projectId: string,
    // @Body('isPinned') isPinned: boolean,
    @Body() dto: UpdateProjectPinDto,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.pin(user.id, projectId, dto.isPinned);
  }

  @Patch(':projectId/archive')
  @ApiOperation({
    summary: 'Archive or unarchive a project',
  })
  @ApiParam({
    name: 'projectId',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    type: ProjectResponseDto,
  })
  async archive(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', new ParseUUIDPipe())
    projectId: string,
    // @Body('isArchived') isArchived: boolean,
    @Body() dto: UpdateProjectArchiveDto,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.archive(user.id, projectId, dto.isArchived);
  }

  @Delete(':projectId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Soft-delete a project',
  })
  @ApiParam({
    name: 'projectId',
    format: 'uuid',
  })
  @ApiNoContentResponse({
    description: 'Project deleted successfully',
  })
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', new ParseUUIDPipe())
    projectId: string,
  ): Promise<void> {
    await this.projectsService.delete(user.id, projectId);
  }
}
