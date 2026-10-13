import {
  LlmMessage,
  LlmProviderOptions,
  LlmProviderResponse,
  LlmProviderStreamEvent,
} from '../types/llm.types';

export interface LlmProvider {
  readonly providerName: 'openai' | 'anthropic' | 'google';

  generate(
    messages: LlmMessage[],
    options: LlmProviderOptions,
  ): Promise<LlmProviderResponse>;

  stream(
    messages: LlmMessage[],
    options: LlmProviderOptions,
  ): AsyncIterable<LlmProviderStreamEvent>;
}
