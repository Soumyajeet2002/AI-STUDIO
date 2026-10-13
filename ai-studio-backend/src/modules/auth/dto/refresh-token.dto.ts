import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

import { AUTH_REFRESH_TOKEN_MAX_LENGTH } from '../constants/auth.constants';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'JWT refresh token used to obtain a new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String,
    minLength: 1,
    maxLength: AUTH_REFRESH_TOKEN_MAX_LENGTH,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(AUTH_REFRESH_TOKEN_MAX_LENGTH)
  refreshToken!: string;
}
