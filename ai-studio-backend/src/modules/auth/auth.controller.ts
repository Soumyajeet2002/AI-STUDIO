/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Body,
  Controller,
  Headers,
  Ip,
  Post,
  UseGuards,
  Get,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiHeader,
} from '@nestjs/swagger';

import {
  AuthResponseDto,
  AccessTokenResponseDto,
} from './dto/auth-response.dto';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

import { AuthService } from './auth.service';

import { AccessTokenGuard } from './guards/access-token.guard';

import { CurrentUser } from './decorators/current-user.decorator';

import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
  })
  @ApiResponse({
    status: 201,
    type: AuthResponseDto,
  })
  @ApiHeader({
    name: 'user-agent',
    required: false,
    description:
      'Client user agent (usually sent automatically by the browser)',
  })
  async register(
    @Body() dto: RegisterDto,
    @Headers('user-agent') userAgent?: string,
    @Ip() ipAddress?: string,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.register(
      dto,
      userAgent ?? null,
      ipAddress ?? null,
    );

    return {
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        displayName: result.user.displayName,
        avatarUrl: result.user.avatarUrl,
        isActive: result.user.isActive,
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt,
      },
    };
  }

  @Post('login')
  @ApiOperation({
    summary: 'Authenticate a user',
  })
  @ApiResponse({
    status: 200,
    type: AuthResponseDto,
  })
  async login(
    @Body() dto: LoginDto,
    @Headers('user-agent') userAgent?: string,
    @Ip() ipAddress?: string,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.login(
      dto,
      userAgent ?? null,
      ipAddress ?? null,
    );

    return {
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        displayName: result.user.displayName,
        avatarUrl: result.user.avatarUrl,
        isActive: result.user.isActive,
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt,
      },
    };
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Rotate refresh token',
  })
  @ApiResponse({
    status: 200,
    type: AccessTokenResponseDto,
  })
  async refresh(@Body() dto: RefreshTokenDto): Promise<
    AccessTokenResponseDto & {
      refreshToken: string;
    }
  > {
    const result = await this.authService.refresh(dto.refreshToken);

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        displayName: result.user.displayName,
        avatarUrl: result.user.avatarUrl,
        isActive: result.user.isActive,
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt,
      },
    };
  }

  @Post('logout')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout current session',
  })
  @ApiResponse({
    status: 204,
  })
  async logout(
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<void> {
    await this.authService.logout(user);
  }

  @Post('logout-all')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout all sessions',
  })
  @ApiResponse({
    status: 204,
  })
  async logoutAll(
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<void> {
    await this.authService.logoutAll(user);
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current authenticated user',
  })
  async me(
    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.authService.getCurrentUser(user.id);
  }
}
