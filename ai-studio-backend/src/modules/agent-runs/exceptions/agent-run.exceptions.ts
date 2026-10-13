import { ConflictException, NotFoundException } from '@nestjs/common';

export class AgentRunNotFoundException extends NotFoundException {
  constructor() {
    super({
      code: 'AGENT_RUN_NOT_FOUND',
      message: 'The requested agent run was not found.',
    });
  }
}

export class AgentRunChatNotFoundException extends NotFoundException {
  constructor() {
    super({
      code: 'AGENT_RUN_CHAT_NOT_FOUND',
      message: 'The requested chat was not found or is not accessible.',
    });
  }
}

export class AgentRunNotCancellableException extends ConflictException {
  constructor() {
    super({
      code: 'AGENT_RUN_NOT_CANCELLABLE',
      message: 'The agent run has already reached a terminal state.',
    });
  }
}
