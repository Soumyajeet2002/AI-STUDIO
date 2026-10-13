import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
} from '../constants/auth.constants';

export class RegisterDto {
  @ApiProperty({
    description: 'Email address used to register and identify the user',
    example: 'admin@example.com',
    format: 'email',
    maxLength: 320,
  })
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty({
    description: 'Display name shown across the application',
    example: 'Admin',
    type: String,
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  displayName!: string;

  @ApiProperty({
    description: `Account password (${AUTH_PASSWORD_MIN_LENGTH}–${AUTH_PASSWORD_MAX_LENGTH} characters)`,
    example: 'Password@1234',
    format: 'password',
    minLength: AUTH_PASSWORD_MIN_LENGTH,
    maxLength: AUTH_PASSWORD_MAX_LENGTH,
  })
  @IsString()
  @Length(AUTH_PASSWORD_MIN_LENGTH, AUTH_PASSWORD_MAX_LENGTH)
  password!: string;

  @ApiPropertyOptional({
    description: 'Optional URL of the user profile avatar',
    example: 'https://example.com/avatars/user.png',
    format: 'uri',
    maxLength: 2048,
  })
  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  avatarUrl?: string;
}
