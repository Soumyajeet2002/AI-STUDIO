import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';

import { LlmProvider } from '../interfaces/llm-provider.interface';
import {
  LlmMessage,
  LlmProviderOptions,
  LlmProviderResponse,
  LlmProviderStreamEvent,
} from '../types/llm.types';
import { LlmProviderUnavailableException } from '../exceptions/llm.exceptions';

@Injectable()
export class AnthropicProvider implements LlmProvider {
  readonly providerName = 'anthropic' as const;

  private readonly client: Anthropic | null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY')?.trim();

    // Missing credentials must not prevent NestJS from starting.
    this.client = apiKey ? new Anthropic({ apiKey }) : null;
  }

  private getClient(): Anthropic {
    if (!this.client) {
      throw new LlmProviderUnavailableException('anthropic');
    }

    return this.client;
  }

  private prepareMessages(messages: LlmMessage[]): {
    system?: string;
    messages: Array<{
      role: 'user' | 'assistant';
      content: string;
    }>;
  } {
    const systemMessages = messages
      .filter((message) => message.role === 'system')
      .map((message) => message.content);

    const conversationMessages = messages
      .filter(
        (message) => message.role === 'user' || message.role === 'assistant',
      )
      .map((message) => ({
        role: message.role as 'user' | 'assistant',
        content: message.content,
      }));

    return {
      ...(systemMessages.length > 0
        ? { system: systemMessages.join('\n\n') }
        : {}),
      messages: conversationMessages,
    };
  }

  async generate(
    messages: LlmMessage[],
    options: LlmProviderOptions,
  ): Promise<LlmProviderResponse> {
    const client = this.getClient();
    const prepared = this.prepareMessages(messages);

    const response = await client.messages.create(
      {
        model: options.model,
        max_tokens: options.maxOutputTokens,
        messages: prepared.messages,
        ...(prepared.system ? { system: prepared.system } : {}),
        ...(options.temperature === undefined
          ? {}
          : { temperature: options.temperature }),
      },
      {
        signal: options.signal,
      },
    );

    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('');

    return {
      text,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      finishReason: response.stop_reason ?? undefined,
      requestId: response._request_id ?? undefined,
    };
  }

  async *stream(
    messages: LlmMessage[],
    options: LlmProviderOptions,
  ): AsyncIterable<LlmProviderStreamEvent> {
    const client = this.getClient();
    const prepared = this.prepareMessages(messages);

    const stream = await client.messages.create(
      {
        model: options.model,
        max_tokens: options.maxOutputTokens,
        messages: prepared.messages,
        stream: true,
        ...(prepared.system ? { system: prepared.system } : {}),
        ...(options.temperature === undefined
          ? {}
          : { temperature: options.temperature }),
      },
      {
        signal: options.signal,
      },
    );

    let finishReason: string | undefined;
    let requestId: string | undefined;
    let inputTokens = 0;
    let outputTokens = 0;

    for await (const event of stream) {
      if (options.signal?.aborted) {
        throw new Error('Anthropic request was cancelled.');
      }

      switch (event.type) {
        case 'message_start':
          requestId = event.message.id;
          inputTokens = event.message.usage.input_tokens;
          break;

        case 'content_block_delta':
          if (event.delta.type === 'text_delta') {
            if (event.delta.text.length > 0) {
              yield {
                type: 'text_delta',
                text: event.delta.text,
              };
            }
          }
          break;

        case 'message_delta':
          finishReason = event.delta.stop_reason ?? undefined;

          if (event.usage) {
            outputTokens = event.usage.output_tokens;

            yield {
              type: 'usage',
              usage: {
                inputTokens,
                outputTokens,
                totalTokens: inputTokens + outputTokens,
              },
            };
          }
          break;

        case 'message_stop':
          break;
      }
    }

    yield {
      type: 'completed',
      finishReason,
      requestId,
    };
  }
}
