import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class LlmMessageDto {
  @ApiProperty({ enum: ['system', 'user', 'assistant'] })
  @IsIn(['system', 'user', 'assistant'])
  role!: 'system' | 'user' | 'assistant';

  @ApiProperty({ example: 'Explain retrieval-augmented generation.' })
  @IsString()
  @MinLength(1)
  @MaxLength(100_000)
  content!: string;
}
