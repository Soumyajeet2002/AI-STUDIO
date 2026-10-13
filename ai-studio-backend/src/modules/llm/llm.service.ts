/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { LLM_DEFAULTS } from './constants/llm.constants';
import { LlmRouterService } from './llm-router.service';
import { OpenAiProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { GoogleProvider } from './providers/google.provider';
import { LlmProvider } from './interfaces/llm-provider.interface';
import {
  InvalidLlmRequestException,
  LlmProviderRequestException,
  LlmRequestTimeoutException,
} from './exceptions/llm.exceptions';
import {
  LlmGenerationRequest,
  LlmGenerationResponse,
  LlmProviderOptions,
  LlmStreamEvent,
} from './types/llm.types';

@Injectable()
export class LlmService {
  private readonly providers: Record<string, LlmProvider>;

  constructor(
    private readonly router: LlmRouterService,
    openai: OpenAiProvider,
    anthropic: AnthropicProvider,
    google: GoogleProvider,
  ) {
    this.providers = {
      openai,
      anthropic,
      google,
    };
  }

  private validate(request: LlmGenerationRequest): void {
    if (
      !Array.isArray(request.messages) ||
      request.messages.length < 1 ||
      request.messages.length > LLM_DEFAULTS.MAX_REQUEST_MESSAGES
    ) {
      throw new InvalidLlmRequestException('Invalid number of messages.');
    }

    for (const message of request.messages) {
      if (
        !message ||
        !['system', 'user', 'assistant'].includes(message.role) ||
        typeof message.content !== 'string' ||
        message.content.length < 1 ||
        message.content.length > LLM_DEFAULTS.MAX_MESSAGE_CHARS
      ) {
        throw new InvalidLlmRequestException(
          'Invalid message content or role.',
        );
      }
    }

    if (
      request.temperature !== undefined &&
      (!Number.isFinite(request.temperature) ||
        request.temperature < 0 ||
        request.temperature > 2)
    ) {
      throw new InvalidLlmRequestException(
        'Temperature must be between 0 and 2.',
      );
    }

    if (
      request.maxOutputTokens !== undefined &&
      (!Number.isInteger(request.maxOutputTokens) ||
        request.maxOutputTokens < 1 ||
        request.maxOutputTokens > 32768)
    ) {
      throw new InvalidLlmRequestException(
        'Invalid maximum output token count.',
      );
    }
  }

  private resolveOptions(request: LlmGenerationRequest): {
    provider: LlmProvider;
    options: LlmProviderOptions;
  } {
    const resolved = this.router.resolve(request.provider, request.model);
    const provider = this.providers[resolved.provider];

    if (!provider) {
      throw new InvalidLlmRequestException('Unsupported provider.');
    }

    const timeoutMs = Math.min(
      Math.max(request.timeoutMs ?? LLM_DEFAULTS.REQUEST_TIMEOUT_MS, 1000),
      120_000,
    );

    // The controller below owns the AbortController lifetime.
    return {
      provider,
      options: {
        model: resolved.model,
        temperature: request.temperature,
        maxOutputTokens: Math.min(
          request.maxOutputTokens ?? LLM_DEFAULTS.MAX_OUTPUT_TOKENS,
          32768,
        ),
        signal: AbortSignal.timeout(timeoutMs),
      },
    };
  }

  async generate(
    request: LlmGenerationRequest,
  ): Promise<LlmGenerationResponse> {
    this.validate(request);

    const resolved = this.router.resolve(request.provider, request.model);
    const provider = this.providers[resolved.provider];

    if (!provider) {
      throw new InvalidLlmRequestException('Unsupported provider.');
    }

    const timeoutMs = Math.min(
      Math.max(request.timeoutMs ?? LLM_DEFAULTS.REQUEST_TIMEOUT_MS, 1000),
      120_000,
    );

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(new Error('LLM_TIMEOUT')),
      timeoutMs,
    );

    try {
      const response = await provider.generate(request.messages, {
        model: resolved.model,
        temperature: request.temperature,
        maxOutputTokens: Math.min(
          request.maxOutputTokens ?? LLM_DEFAULTS.MAX_OUTPUT_TOKENS,
          32768,
        ),
        signal: controller.signal,
      });

      return {
        provider: resolved.provider,
        model: resolved.model,
        ...response,
      };
    } catch (error) {
      if (controller.signal.aborted) {
        throw new LlmRequestTimeoutException();
      }

      throw new LlmProviderRequestException(resolved.provider);
    } finally {
      clearTimeout(timeout);
    }
  }

  async *stream(request: LlmGenerationRequest): AsyncIterable<LlmStreamEvent> {
    this.validate(request);

    const resolved = this.router.resolve(request.provider, request.model);
    const provider = this.providers[resolved.provider];

    if (!provider) {
      throw new InvalidLlmRequestException('Unsupported provider.');
    }

    const timeoutMs = Math.min(
      Math.max(request.timeoutMs ?? LLM_DEFAULTS.REQUEST_TIMEOUT_MS, 1000),
      120_000,
    );

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(new Error('LLM_TIMEOUT')),
      timeoutMs,
    );

    try {
      const providerStream = provider.stream(request.messages, {
        model: resolved.model,
        temperature: request.temperature,
        maxOutputTokens: Math.min(
          request.maxOutputTokens ?? LLM_DEFAULTS.MAX_OUTPUT_TOKENS,
          32768,
        ),
        signal: controller.signal,
      });

      for await (const event of providerStream) {
        if (event.type === 'text_delta' && event.text) {
          yield { type: 'text_delta', text: event.text };
        } else if (event.type === 'usage' && event.usage) {
          yield { type: 'usage', usage: event.usage };
        } else if (event.type === 'completed') {
          yield {
            type: 'completed',
            provider: resolved.provider,
            model: resolved.model,
            finishReason: event.finishReason,
            requestId: event.requestId,
          };
        }
      }
    } catch (error) {
      if (controller.signal.aborted) {
        throw new LlmRequestTimeoutException();
      }

      throw new LlmProviderRequestException(resolved.provider);
    } finally {
      clearTimeout(timeout);
    }
  }
}
