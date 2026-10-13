import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AGENT_RUN_MAX_INPUT_LENGTH } from '../constants/agent-run.constants';

export class CreateAgentRunDto {
  @ApiProperty({
    description: 'ID of the chat in which the agent should execute.',
    format: 'uuid',
  })
  @IsUUID()
  chatId!: string;

  @ApiProperty({
    description: 'Instruction or task for the agent.',
    example: 'Research the topic and produce a concise report.',
    minLength: 1,
    maxLength: AGENT_RUN_MAX_INPUT_LENGTH,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(AGENT_RUN_MAX_INPUT_LENGTH)
  input!: string;

  @ApiPropertyOptional({
    description: 'Application-defined execution options.',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  options?: Record<string, unknown>;
}
