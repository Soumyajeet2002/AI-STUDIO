import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  USER_AVATAR_URL_MAX_LENGTH,
  USER_DISPLAY_NAME_MAX_LENGTH,
  USER_EMAIL_MAX_LENGTH,
} from '../constants/user.constants';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address.',
    example: 'soumyajeet@gmail.com',
    maxLength: USER_EMAIL_MAX_LENGTH,
    format: 'email',
  })
  @IsEmail()
  @MaxLength(USER_EMAIL_MAX_LENGTH)
  email!: string;

  @ApiProperty({
    description: 'Display name of the user.',
    example: 'Soumyajeet Nayak',
    minLength: 1,
    maxLength: USER_DISPLAY_NAME_MAX_LENGTH,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(USER_DISPLAY_NAME_MAX_LENGTH)
  displayName!: string;

  @ApiProperty({
    description: 'User password.',
    example: 'soumyajeet@password',
    minLength: 8,
    maxLength: 128,
    format: 'password',
    writeOnly: true,
  })
  @IsString()
  @MinLength(8)
  @Length(8, 128)
  password!: string;

  @ApiPropertyOptional({
    description: 'Optional URL of the user avatar.',
    example: 'https://example.com/avatars/john-doe.png',
    maxLength: USER_AVATAR_URL_MAX_LENGTH,
    format: 'uri',
    nullable: true,
  })
  @IsOptional()
  @IsUrl({
    require_tld: false,
  })
  @MaxLength(USER_AVATAR_URL_MAX_LENGTH)
  avatarUrl?: string;
}
