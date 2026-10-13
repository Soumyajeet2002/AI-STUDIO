import {
  BadGatewayException,
  BadRequestException,
  ServiceUnavailableException,
  GatewayTimeoutException,
} from '@nestjs/common';

export class InvalidLlmRequestException extends BadRequestException {
  constructor(message = 'The LLM request is invalid.') {
    super({ code: 'INVALID_LLM_REQUEST', message });
  }
}

export class LlmProviderUnavailableException extends ServiceUnavailableException {
  constructor(provider: string) {
    super({
      code: 'LLM_PROVIDER_UNAVAILABLE',
      message: `The ${provider} provider is not configured or unavailable.`,
    });
  }
}

export class LlmProviderRequestException extends BadGatewayException {
  constructor(provider: string) {
    super({
      code: 'LLM_PROVIDER_REQUEST_FAILED',
      message: `The request to ${provider} failed.`,
    });
  }
}

export class LlmRequestTimeoutException extends GatewayTimeoutException {
  constructor() {
    super({
      code: 'LLM_REQUEST_TIMEOUT',
      message: 'The model request exceeded its time limit.',
    });
  }
}
