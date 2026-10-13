import { ConflictException, NotFoundException } from '@nestjs/common';

export class MessageNotFoundException extends NotFoundException {
  constructor() {
    super({
      code: 'MESSAGE_NOT_FOUND',
      message: 'The requested message was not found.',
    });
  }
}

export class MessageChatNotFoundException extends NotFoundException {
  constructor() {
    super({
      code: 'CHAT_NOT_FOUND',
      message: 'The requested chat was not found or is not accessible.',
    });
  }
}

export class MessageNotEditableException extends ConflictException {
  constructor() {
    super({
      code: 'MESSAGE_NOT_EDITABLE',
      message: 'Only user messages can be edited through this endpoint.',
    });
  }
}
