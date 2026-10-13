// import { Controller, Get, UseGuards } from '@nestjs/common';

// import {
//   ApiBearerAuth,
//   ApiOperation,
//   ApiResponse,
//   ApiTags,
// } from '@nestjs/swagger';

// import { UserResponseDto } from './dto/user-response.dto';

// import { UsersService } from './users.service';

// import { AccessTokenGuard } from '../auth/guards/access-token.guard';

// import { CurrentUser } from '../auth/decorators/current-user.decorator';

// import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

// @ApiTags('Users')
// @ApiBearerAuth()
// @Controller('users')
// @UseGuards(AccessTokenGuard)
// export class UsersController {
//   constructor(private readonly usersService: UsersService) {}

//   @Get('me')
//   @ApiOperation({
//     summary: 'Get current authenticated user',
//   })
//   @ApiResponse({
//     status: 200,
//     type: UserResponseDto,
//   })
//   async me(
//     @CurrentUser()
//     user: AuthenticatedUser,
//   ): Promise<UserResponseDto> {
//     return this.usersService.findById(user.id);
//   }
// }

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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

import { UsersService } from './users.service';

import { UpdateUserDto } from './dto/update-user.dto';

import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get my profile',
    description: 'Returns the profile belonging to the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token',
  })
  async getMyProfile(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Update my profile',
    description:
      'Updates the authenticated user profile. Email changes may require a separate verification flow.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 409,
    description: 'Email address already exists',
  })
  async updateMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(user.id, dto);
  }

  @Get(':userId')
  @ApiOperation({
    summary: 'Get a user by ID',
    description:
      'Currently allows a user to retrieve only their own profile. Admin access can be introduced through a dedicated authorization policy.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User UUID',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Access to another user is forbidden',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserById(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    if (userId !== currentUser.id) {
      const { ForbiddenException } = await import('@nestjs/common');

      throw new ForbiddenException({
        code: 'USER_ACCESS_FORBIDDEN',
        message: 'You cannot access this user',
      });
    }

    return this.usersService.findById(userId);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deactivate my account',
    description:
      'Deactivates the authenticated user account. This is a soft deactivation, not a permanent database deletion.',
  })
  @ApiNoContentResponse({
    description: 'Account deactivated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token',
  })
  async deactivateMyAccount(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.usersService.deactivate(user.id);
  }
}
