import { ApiProperty } from '@nestjs/swagger';

export class ToolResponseDto {
  @ApiProperty({ example: 'knowledge_retrieval' })
  name!: string;

  @ApiProperty({ example: '1.0.0' })
  version!: string;

  @ApiProperty({ example: 'Search authorized knowledge sources.' })
  description!: string;

  @ApiProperty({ type: Object })
  inputSchema!: object;

  @ApiProperty({ example: true })
  enabled!: boolean;

  @ApiProperty({ example: true })
  requiresApproval!: boolean;

  @ApiProperty({ example: 30000 })
  timeoutMs!: number;
}
