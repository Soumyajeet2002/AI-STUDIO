import { SetMetadata } from '@nestjs/common';
import { ToolDefinition } from '../types/tool.types';

export const TOOL_METADATA_KEY = 'lifeos:tool-definition';

export const ToolMetadata = (definition: ToolDefinition) =>
  SetMetadata(TOOL_METADATA_KEY, definition);
