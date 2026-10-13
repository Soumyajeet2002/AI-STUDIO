import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { LlmProvider } from '../interfaces/llm-provider.interface';
import {
  LlmMessage,
  LlmProviderOptions,
  LlmProviderResponse,
  LlmProviderStreamEvent,
} from '../types/llm.types';
import { LlmProviderUnavailableException } from '../exceptions/llm.exceptions';

@Injectable()
export class GoogleProvider implements LlmProvider {
  readonly providerName = 'google' as const;
  private readonly client: GoogleGenAI;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('GOOGLE_API_KEY');

    if (!apiKey) {
      throw new LlmProviderUnavailableException('google');
    }

    this.client = new GoogleGenAI({ apiKey });
  }

  private splitMessages(messages: LlmMessage[]) {
    return {
      systemInstruction: messages
        .filter((message) => message.role === 'system')
        .map((message) => message.content)
        .join('\n\n'),
      contents: messages
        .filter((message) => message.role !== 'system')
        .map((message) => ({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: message.content }],
        })),
    };
  }

  async generate(
    messages: LlmMessage[],
    options: LlmProviderOptions,
  ): Promise<LlmProviderResponse> {
    const split = this.splitMessages(messages);

    const response = await this.client.models.generateContent({
      model: options.model,
      contents: split.contents,
      config: {
        maxOutputTokens: options.maxOutputTokens,
        ...(split.systemInstruction
          ? { systemInstruction: split.systemInstruction }
          : {}),
        ...(options.temperature === undefined
          ? {}
          : { temperature: options.temperature }),
      },
    });

    const inputTokens = response.usageMetadata?.promptTokenCount ?? 0;
    const outputTokens = response.usageMetadata?.candidatesTokenCount ?? 0;

    return {
      text: response.text ?? '',
      usage: {
        inputTokens,
        outputTokens,
        totalTokens:
          response.usageMetadata?.totalTokenCount ?? inputTokens + outputTokens,
      },
      finishReason: response.candidates?.[0]?.finishReason,
      requestId: undefined,
    };
  }

  async *stream(
    messages: LlmMessage[],
    options: LlmProviderOptions,
  ): AsyncIterable<LlmProviderStreamEvent> {
    const split = this.splitMessages(messages);

    const stream = await this.client.models.generateContentStream({
      model: options.model,
      contents: split.contents,
      config: {
        maxOutputTokens: options.maxOutputTokens,
        ...(split.systemInstruction
          ? { systemInstruction: split.systemInstruction }
          : {}),
        ...(options.temperature === undefined
          ? {}
          : { temperature: options.temperature }),
      },
    });

    let inputTokens = 0;
    let outputTokens = 0;
    let finishReason: string | undefined;

    for await (const chunk of stream) {
      if (chunk.text) {
        yield { type: 'text_delta', text: chunk.text };
      }

      if (chunk.usageMetadata) {
        inputTokens = chunk.usageMetadata.promptTokenCount ?? inputTokens;
        outputTokens = chunk.usageMetadata.candidatesTokenCount ?? outputTokens;
      }

      finishReason = chunk.candidates?.[0]?.finishReason ?? finishReason;
    }

    yield {
      type: 'usage',
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
      },
    };

    yield {
      type: 'completed',
      finishReason,
    };
  }
}
