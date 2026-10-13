import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LlmProviderName } from './constants/llm.constants';
import { LlmResolvedModel } from './types/llm.types';
import { LlmProviderUnavailableException } from './exceptions/llm.exceptions';

@Injectable()
export class LlmRouterService {
  constructor(private readonly config: ConfigService) {}

  resolve(
    provider?: LlmProviderName | 'auto',
    model?: string,
  ): LlmResolvedModel {
    const selectedProvider =
      provider && provider !== 'auto'
        ? provider
        : this.config.get<LlmProviderName>('LLM_DEFAULT_PROVIDER', 'openai');

    const apiKeyName = {
      openai: 'OPENAI_API_KEY',
      anthropic: 'ANTHROPIC_API_KEY',
      google: 'GOOGLE_API_KEY',
    }[selectedProvider];

    if (!this.config.get<string>(apiKeyName)) {
      throw new LlmProviderUnavailableException(selectedProvider);
    }

    const configuredModel = this.config.get<string>(
      `LLM_${selectedProvider.toUpperCase()}_MODEL`,
    );

    const defaultModel =
      configuredModel ??
      (selectedProvider === 'openai'
        ? this.config.get<string>('LLM_DEFAULT_MODEL', 'gpt-4.1-mini')
        : undefined);

    if (!model && !defaultModel) {
      throw new Error(
        `No default model configured for provider "${selectedProvider}".`,
      );
    }

    return {
      provider: selectedProvider,
      model: model ?? defaultModel!,
    };
  }
}
