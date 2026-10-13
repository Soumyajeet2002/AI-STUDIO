import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique user identifier',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'User display name',
    example: 'John Doe',
  })
  displayName!: string;

  @ApiPropertyOptional({
    description: 'Profile avatar URL',
    example: 'https://example.com/avatar.png',
    nullable: true,
  })
  avatarUrl!: string | null;

  @ApiProperty({
    description: 'Whether the account is active',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2026-10-09T10:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last profile update timestamp',
    example: '2026-10-09T10:30:00.000Z',
  })
  updatedAt!: Date;
}
