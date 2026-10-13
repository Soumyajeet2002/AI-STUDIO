/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
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
export class OpenAiProvider implements LlmProvider {
  readonly providerName = 'openai' as const;

  private readonly client: OpenAI | null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY')?.trim();

    // Do not crash NestJS during startup when the API key is absent.
    // Validate provider availability when generate() or stream() is called.
    this.client = apiKey ? new OpenAI({ apiKey }) : null;
  }

  /**
   * Returns the OpenAI client or throws a controlled provider exception
   * when the provider is not configured.
   */
  private getClient(): OpenAI {
    if (!this.client) {
      throw new LlmProviderUnavailableException('openai');
    }

    return this.client;
  }

  /**
   * Generates a complete response from OpenAI.
   */
  async generate(
    messages: LlmMessage[],
    options: LlmProviderOptions,
  ): Promise<LlmProviderResponse> {
    const client = this.getClient();

    const response = await client.chat.completions.create(
      {
        model: options.model,
        messages,
        max_tokens: options.maxOutputTokens,
        ...(options.temperature === undefined
          ? {}
          : { temperature: options.temperature }),
      },
      {
        signal: options.signal,
      },
    );

    return {
      text: response.choices[0]?.message?.content ?? '',
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      },
      finishReason: response.choices[0]?.finish_reason ?? undefined,
      requestId: response._request_id ?? undefined,
    };
  }

  /**
   * Streams response text as incremental events.
   */
  async *stream(
    messages: LlmMessage[],
    options: LlmProviderOptions,
  ): AsyncIterable<LlmProviderStreamEvent> {
    const client = this.getClient();

    const stream = await client.chat.completions.create(
      {
        model: options.model,
        messages,
        max_tokens: options.maxOutputTokens,
        stream: true,
        stream_options: {
          include_usage: true,
        },
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

    for await (const chunk of stream) {
      if (options.signal?.aborted) {
        throw new Error('OpenAI request was cancelled.');
      }

      requestId = chunk.id || requestId;

      const choice = chunk.choices[0];
      const delta = choice?.delta?.content;

      if (typeof delta === 'string' && delta.length > 0) {
        yield {
          type: 'text_delta',
          text: delta,
        };
      }

      if (choice?.finish_reason) {
        finishReason = choice.finish_reason;
      }

      if (chunk.usage) {
        yield {
          type: 'usage',
          usage: {
            inputTokens: chunk.usage.prompt_tokens,
            outputTokens: chunk.usage.completion_tokens,
            totalTokens: chunk.usage.total_tokens,
          },
        };
      }
    }

    yield {
      type: 'completed',
      finishReason,
      requestId,
    };
  }
}
