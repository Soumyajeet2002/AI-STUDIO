import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LLM_PROVIDERS } from '../constants/llm.constants';
import { LlmMessageDto } from './llm-message.dto';

export class LlmGenerationOptionsDto {
  @ApiProperty({ type: [LlmMessageDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => LlmMessageDto)
  messages?: LlmMessageDto[];

  @ApiPropertyOptional({ enum: [...LLM_PROVIDERS, 'auto'], default: 'auto' })
  @IsOptional()
  @IsIn([...LLM_PROVIDERS, 'auto'])
  provider?: 'openai' | 'anthropic' | 'google' | 'auto';

  @ApiPropertyOptional({ example: 'gpt-4.1-mini' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 2, default: 0.2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 32768, default: 4096 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(32768)
  maxOutputTokens?: number;

  @ApiPropertyOptional({ minimum: 1000, maximum: 120000 })
  @IsOptional()
  @IsInt()
  @Min(1000)
  @Max(120000)
  timeoutMs?: number;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;
}
