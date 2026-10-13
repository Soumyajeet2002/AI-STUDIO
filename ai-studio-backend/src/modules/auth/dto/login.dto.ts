import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

import {
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
} from '../constants/auth.constants';

export class LoginDto {
  @ApiProperty({
    description: 'Registered email address of the user',
    example: 'soumyajeet@gmail.com',
    format: 'email',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: `User password (${AUTH_PASSWORD_MIN_LENGTH}–${AUTH_PASSWORD_MAX_LENGTH} characters)`,
    example: 'soumyajeet@password',
    minLength: AUTH_PASSWORD_MIN_LENGTH,
    maxLength: AUTH_PASSWORD_MAX_LENGTH,
    format: 'password',
  })
  @IsString()
  @Length(AUTH_PASSWORD_MIN_LENGTH, AUTH_PASSWORD_MAX_LENGTH)
  password!: string;
}
