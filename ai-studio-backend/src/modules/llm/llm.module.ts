import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LlmService } from './llm.service';
import { LlmRouterService } from './llm-router.service';
import { OpenAiProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { GoogleProvider } from './providers/google.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    LlmService,
    LlmRouterService,
    OpenAiProvider,
    AnthropicProvider,
    GoogleProvider,
  ],
  exports: [LlmService, LlmRouterService],
})
export class LlmModule {}
