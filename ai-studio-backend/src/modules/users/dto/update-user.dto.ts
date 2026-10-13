import { ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  USER_AVATAR_URL_MAX_LENGTH,
  USER_DISPLAY_NAME_MAX_LENGTH,
  USER_EMAIL_MAX_LENGTH,
} from '../constants/user.constants';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Updated email address',
    example: 'john@example.com',
    maxLength: USER_EMAIL_MAX_LENGTH,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(USER_EMAIL_MAX_LENGTH)
  email?: string;

  @ApiPropertyOptional({
    description: 'Updated display name',
    example: 'John Smith',
    minLength: 1,
    maxLength: USER_DISPLAY_NAME_MAX_LENGTH,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(USER_DISPLAY_NAME_MAX_LENGTH)
  displayName?: string;

  @ApiPropertyOptional({
    description: 'Updated profile avatar URL',
    example: 'https://example.com/avatar.png',
    maxLength: USER_AVATAR_URL_MAX_LENGTH,
    nullable: true,
  })
  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(USER_AVATAR_URL_MAX_LENGTH)
  avatarUrl?: string;
}
