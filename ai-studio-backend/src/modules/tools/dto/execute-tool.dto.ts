import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class ExecuteToolDto {
  @ApiProperty({ example: 'knowledge_retrieval' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: { query: 'project architecture' }, type: Object })
  @IsObject()
  input!: Record<string, unknown>;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  chatId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  runId?: string;
}
