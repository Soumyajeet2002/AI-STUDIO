import { LlmProviderName } from '../constants/llm.constants';

export type LlmMessageRole = 'system' | 'user' | 'assistant';

export interface LlmMessage {
  role: LlmMessageRole;
  content: string;
}

export interface LlmGenerationRequest {
  messages: LlmMessage[];
  provider?: LlmProviderName | 'auto';
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
  metadata?: Record<string, string>;
}

export interface LlmUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface LlmGenerationResponse {
  provider: LlmProviderName;
  model: string;
  text: string;
  usage: LlmUsage;
  finishReason?: string;
  requestId?: string;
}

export type LlmStreamEvent =
  | {
      type: 'text_delta';
      text: string;
    }
  | {
      type: 'usage';
      usage: LlmUsage;
    }
  | {
      type: 'completed';
      provider: LlmProviderName;
      model: string;
      finishReason?: string;
      requestId?: string;
    };

export interface LlmResolvedModel {
  provider: LlmProviderName;
  model: string;
}

export interface LlmProviderOptions {
  model: string;
  temperature?: number;
  maxOutputTokens: number;
  signal: AbortSignal;
}

export interface LlmProviderResponse {
  text: string;
  usage: LlmUsage;
  finishReason?: string;
  requestId?: string;
}

export interface LlmProviderStreamEvent {
  type: 'text_delta' | 'usage' | 'completed';
  text?: string;
  usage?: LlmUsage;
  finishReason?: string;
  requestId?: string;
}
