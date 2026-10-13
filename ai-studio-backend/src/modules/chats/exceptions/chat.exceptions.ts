import { ConflictException, NotFoundException } from '@nestjs/common';

export class ChatNotFoundException extends NotFoundException {
  constructor() {
    super({
      code: 'CHAT_NOT_FOUND',
      message: 'The requested chat was not found.',
    });
  }
}

export class ChatProjectNotFoundException extends NotFoundException {
  constructor() {
    super({
      code: 'CHAT_PROJECT_NOT_FOUND',
      message: 'The requested project was not found or is not accessible.',
    });
  }
}

export class ChatTitleRequiredException extends ConflictException {
  constructor() {
    super({
      code: 'CHAT_TITLE_REQUIRED',
      message: 'The chat title cannot be empty.',
    });
  }
}
