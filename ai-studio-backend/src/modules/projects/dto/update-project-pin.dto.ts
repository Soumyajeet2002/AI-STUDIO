import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateProjectPinDto {
  @ApiProperty({
    description: 'Whether the project is pinned',
    example: true,
  })
  @IsBoolean()
  isPinned!: boolean;
}
