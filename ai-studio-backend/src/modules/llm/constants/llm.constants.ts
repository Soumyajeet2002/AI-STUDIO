export const LLM_PROVIDERS = ['openai', 'anthropic', 'google'] as const;

export type LlmProviderName = (typeof LLM_PROVIDERS)[number];

export const LLM_DEFAULTS = {
  REQUEST_TIMEOUT_MS: 60_000,
  MAX_OUTPUT_TOKENS: 4096,
  MIN_OUTPUT_TOKENS: 1,
  MAX_REQUEST_MESSAGES: 100,
  MAX_MESSAGE_CHARS: 100_000,
} as const;
