import { ApiProperty } from '@nestjs/swagger';

import { UserResponseDto } from '../../users/dto/user-response.dto';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token used to authenticate API requests',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String,
  })
  accessToken!: string;

  @ApiProperty({
    description: 'JWT refresh token used to obtain a new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String,
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'Authenticated user details',
    type: () => UserResponseDto,
  })
  user!: UserResponseDto;
}

export class AccessTokenResponseDto {
  @ApiProperty({
    description: 'JWT access token used to authenticate API requests',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String,
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Authenticated user details',
    type: () => UserResponseDto,
  })
  user!: UserResponseDto;
}
