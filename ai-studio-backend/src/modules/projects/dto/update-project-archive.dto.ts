import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateProjectArchiveDto {
  @ApiProperty({
    description: 'Whether the project is archived',
    example: true,
  })
  @IsBoolean()
  isArchived!: boolean;
}
